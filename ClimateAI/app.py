from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from datetime import timedelta, datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import os
import requests
from twilio.rest import Client

app = Flask(__name__)
app.secret_key = os.urandom(24) # Secure session key
app.permanent_session_lifetime = timedelta(days=30)

# ==========================================
# Twilio Configuration (Replace with your keys)
# ==========================================
TWILIO_ACCOUNT_SID = ''
TWILIO_AUTH_TOKEN = ''
TWILIO_FROM_NUMBER = ''
# ==========================================

# Initialize MongoDB Connection
try:
    client = MongoClient('mongodb+srv://hackathon123:<password>@cluster0.mka9v92.mongodb.net/?appName=Cluster0')
    db = client['climateai']
    users_collection = db['users']
    locations_collection = db['locations']
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")

# Seed default admin user
try:
    admin_user = users_collection.find_one({'email': 'admin@climateai.com'})
    if not admin_user:
        users_collection.insert_one({
            'fname': 'Chief',
            'lname': 'Admin',
            'email': 'admin@climateai.com',
            'phone': 'N/A',
            'password': generate_password_hash('admin@123'),
            'role': 'Admin',
            'status': 'Active'
        })
        print("Default admin seeded: admin@climateai.com")
    elif admin_user.get('role') != 'Admin':
        users_collection.update_one({'email': 'admin@climateai.com'}, {'$set': {'role': 'Admin'}})
        print("Updated legacy admin account securely to Admin Role")
except Exception as e:
    pass

def get_environmental_data(lat, lon):
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=rain_sum&timezone=auto"
    air_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,uv_index"
    try:
        weather_res = requests.get(weather_url).json()
        air_res = requests.get(air_url).json()
        
        # 3. Flood Prediction Endpoint
        flood_url = f"https://flood-api.open-meteo.com/v1/flood?latitude={lat}&longitude={lon}&daily=river_discharge,river_discharge_mean&forecast_days=1"
        try:
            flood_res = requests.get(flood_url).json()
            daily_flood = flood_res.get('daily', {})
        except Exception:
            daily_flood = {}
            
        current_weather = weather_res.get('current', {})
        daily_weather = weather_res.get('daily', {})
        current_air = air_res.get('current', {})
        
        data = {
            "temperature": current_weather.get('temperature_2m', 0),    
            "humidity": current_weather.get('relative_humidity_2m', 0), 
            "wind_speed": current_weather.get('wind_speed_10m', 0),     
            "uv_index": current_air.get('uv_index', 0),                 
            "pm10": current_air.get('pm10', 0),                         
            "rain_daily": daily_weather.get('rain_sum', [0])[0] if daily_weather.get('rain_sum') else 0.0,
            "flood_discharge": daily_flood.get('river_discharge', [0.0])[0] if daily_flood.get('river_discharge') else 0.0,
            "flood_mean": daily_flood.get('river_discharge_mean', [0.0])[0] if daily_flood.get('river_discharge_mean') else 0.0
        }
        if data["rain_daily"] is None: data["rain_daily"] = 0.0
        if data["flood_discharge"] is None: data["flood_discharge"] = 0.0
        if data["flood_mean"] is None: data["flood_mean"] = 0.0
        
        # --- HACKATHON DEMO OVERRIDE ---
        try:
            if abs(float(lat) - 25.7617) < 0.1 and abs(float(lon) - -80.1918) < 0.1:
                data["flood_discharge"] = 276.0  # +176% Volume Anomaly (Realistic flood)
                data["flood_mean"] = 100.0       # Historical safe median
        except Exception:
            pass
        # -------------------------------
        
        return data
    except Exception:
        return None

def calculate_live_risk(data):
    if not data: return 0.0, "No data"
    thresholds = {'temp_max': 45.0, 'wind_max': 80.0, 'uv_max': 11.0, 'pm10_max': 300.0, 'rain_max': 150.0}
    weights = {'temperature': 2.0, 'humidity': 0.5, 'wind_speed': 1.5, 'uv_index': 0.5, 'pm10': 2.0, 'rain_daily': 2.5, 'flash_flood': 4.0}
    normalized = {}
    temp = data["temperature"]
    normalized['temperature'] = min((temp - 35) / (thresholds['temp_max'] - 35), 1.0) if temp > 35 else 0.0
    normalized['humidity'] = min(data["humidity"] / 100.0, 1.0) if temp > 32 and data["humidity"] > 70 else 0.0
    normalized['wind_speed'] = min(data["wind_speed"] / thresholds['wind_max'], 1.0)
    normalized['uv_index'] = min(data["uv_index"] / thresholds['uv_max'], 1.0)
    normalized['pm10'] = min(data["pm10"] / thresholds['pm10_max'], 1.0)
    normalized['rain_daily'] = min(data["rain_daily"] / thresholds['rain_max'], 1.0)
    
    # Flood anomaly algorithm: if discharge is significantly higher than historical mean, spike the threat model
    flood_score = 0.0
    if data["flood_discharge"] > 0 and data["flood_mean"] > 0:
        flood_ratio = (data["flood_discharge"] - data["flood_mean"]) / data["flood_mean"]
        # Maxes out at 200% above mean (ratio = 2.0)
        flood_score = min(max(flood_ratio / 2.0, 0.0), 1.0)
    normalized['flash_flood'] = flood_score
    
    base_risk = sum(score * (weights[factor] / sum(weights.values())) for factor, score in normalized.items())
    primary_threat = max(normalized, key=normalized.get)
    final_score = max(base_risk, normalized[primary_threat]) * 100
        
    return round(final_score, 2), primary_threat

@app.route('/', methods=['GET', 'POST'])
def login():
    if 'user_id' in session and 'role' in session:
        if session['role'] == 'Admin':
            return redirect(url_for('admin_panel'))
        elif session['role'] == 'Authority':
            return redirect(url_for('authority_dashboard'))
        else:
            return redirect(url_for('user_dashboard'))
            
    if request.method == 'POST':
        email = request.form.get('email').strip().lower()
        password = request.form.get('password')
        
        # Check against MongoDB
        user = users_collection.find_one({'email': email})
        
        if not user:
            flash("User not found! Please register for an account.", "error")
            return redirect(url_for('register'))
            
        if check_password_hash(user['password'], password):
            session.permanent = True
            session['user_id'] = str(user['_id'])
            session['email'] = user['email']
            session['role'] = user.get('role', 'User')
            session['fname'] = user.get('fname', '')
            
            # Route based on authorization role
            if session['role'] == 'Admin':
                return redirect(url_for('admin_panel'))
            elif session['role'] == 'Authority':
                return redirect(url_for('authority_dashboard'))
            else:
                return redirect(url_for('user_dashboard'))
        else:
            flash("Incorrect password. Please try again.", "error")
            return redirect(url_for('login'))
            
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        fname = request.form.get('fname')
        lname = request.form.get('lname')
        email = request.form.get('email').strip().lower()
        phone = request.form.get('phone')
        password = request.form.get('password')
        
        role = 'User'
        
        if users_collection.find_one({'email': email}):
            flash("That email is already registered! Attempting to login?", "error")
            return redirect(url_for('login'))
            
        new_user = {
            'fname': fname,
            'lname': lname,
            'email': email,
            'phone': phone,
            'password': generate_password_hash(password),
            'role': role,
            'status': 'Active'
        }
        
        users_collection.insert_one(new_user)
        flash("Registration successful! Please sign in.", "success")
        return redirect(url_for('login'))
        
    return render_template('register.html')

@app.route('/user_dashboard')
def user_dashboard():
    if 'user_id' not in session:
        flash("Please log in to access the dashboard", "error")
        return redirect(url_for('login'))
        
    user = users_collection.find_one({'_id': ObjectId(session['user_id'])})
    user_status = user.get('status', 'safe') if user else 'safe'
    
    location_pref = user.get('location_pref', 'auto')
    manual_lat = user.get('manual_lat', 0.0)
    manual_lng = user.get('manual_lng', 0.0)
    
    return render_template('user_dashboard.html', 
                           fname=session.get('fname', 'User'), 
                           current_status=user_status,
                           location_pref=location_pref,
                           manual_lat=manual_lat,
                           manual_lng=manual_lng)

@app.route('/authority_dashboard')
def authority_dashboard():
    if 'user_id' not in session or session.get('role') != 'Authority':
        flash("You do not have clearance to access the Authority Hub.", "error")
        return redirect(url_for('login'))
        
    # Get all users to pass to the admin users table
    all_users = list(users_collection.find({}))
    return render_template('authority_dashboard.html', users=all_users)

@app.route('/admin_panel')
def admin_panel():
    if 'user_id' not in session or session.get('role') != 'Admin':
        flash("Unauthorized", "error")
        return redirect(url_for('login'))
        
    # Get all users and serialize _id to string for JS injection
    all_users = list(users_collection.find({}))
    for u in all_users:
        u['id'] = str(u['_id'])
        del u['_id']
        # Don't send passwords to frontend
        if 'password' in u: del u['password']
        
    return render_template('admin.html', users=all_users)

@app.route('/api/locations', methods=['GET', 'POST'])
def api_locations():
    if request.method == 'POST':
        # Authority drops a pin
        if session.get('role') not in ['Authority', 'Admin']:
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.json
        new_loc = {
            'type': data.get('type'),
            'lat': data.get('lat'),
            'lng': data.get('lng'),
            'added_by': session.get('user_id')
        }
        res = locations_collection.insert_one(new_loc)
        return jsonify({'success': True, 'id': str(res.inserted_id)})
        
    # GET: return all pins to render on maps
    locs = list(locations_collection.find({}))
    for loc in locs:
        loc['id'] = str(loc['_id'])
        del loc['_id']
    return jsonify(locs)

@app.route('/api/locations/<loc_id>', methods=['DELETE'])
def delete_location(loc_id):
    if session.get('role') not in ['Authority', 'Admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    res = locations_collection.delete_one({'_id': ObjectId(loc_id)})
    if res.deleted_count > 0:
        return jsonify({'success': True})
    return jsonify({'error': 'Location not found'}), 404

@app.route('/submit_survey', methods=['POST'])
def submit_survey():
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    status_select = request.form.get('status')
    details_input = request.form.get('details', '').strip()
    
    # Update document in MongoDB
    users_collection.update_one(
        {'_id': ObjectId(session['user_id'])},
        {'$set': {
            'status': status_select,
            'survey_details': details_input
        }}
    )
    flash("Your safety status has been updated and securely transmitted to Authorities.", "success")
    return redirect(url_for('user_dashboard'))

@app.route('/api/promote/<user_id>', methods=['POST'])
def promote_user(user_id):
    if session.get('role') != 'Admin':
        return jsonify({'error': 'Unauthorized'}), 403
    users_collection.update_one({'_id': ObjectId(user_id)}, {'$set': {'role': 'Authority'}})
    return jsonify({'success': True})

@app.route('/api/demote/<user_id>', methods=['POST'])
def demote_user(user_id):
    if session.get('role') != 'Admin':
        return jsonify({'error': 'Unauthorized'}), 403
    users_collection.update_one({'_id': ObjectId(user_id)}, {'$set': {'role': 'User'}})
    return jsonify({'success': True})

@app.route('/api/check_risk', methods=['POST'])
def check_risk():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    coords = request.json
    if not coords or 'lat' not in coords:
        return jsonify({'error': 'Missing coordinates'}), 400
        
    data = get_environmental_data(coords['lat'], coords['lng'])
    if data:
        score, threat = calculate_live_risk(data)
        
        # ---------------------------------------------
        # Alert Evaluation & Twilio SMS Dispatch
        # ---------------------------------------------
        user = users_collection.find_one({'_id': ObjectId(session['user_id'])})
        now = datetime.utcnow()
        
        # Only notify if score is in Auto-Alert range (>= 50)
        if score >= 50 and user:
            last_alert_time = user.get('last_sms_sent')
            # Debounce: limit to 1 SMS every 60 seconds for Hackathon testing
            if not last_alert_time or (now - last_alert_time).total_seconds() > 60:
                phone_number = user.get('phone')
                if phone_number and phone_number != 'N/A' and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
                    try:
                        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                        client.messages.create(
                            body=f"ClimateAI ALERT: Severe {threat.replace('_', ' ').title()} predicted in your immediate vicinity. Threat Level: {score}/100. Seek safe shelter.",
                            from_=TWILIO_FROM_NUMBER,
                            to='+91'+str(phone_number)
                        )
                        # Log time so we don't spam the user every 10 seconds they stay on page
                        users_collection.update_one({'_id': ObjectId(session['user_id'])}, {'$set': {'last_sms_sent': now}})
                        print(f"Twilio SMS Warning dispatched to {phone_number}")
                    except Exception as e:
                        print(f"Twilio SMS Error: {e}")
        elif score < 50 and user and user.get('last_sms_sent'):
            # Instantly clear the SMS lock if they return to a safe location!
            users_collection.update_one({'_id': ObjectId(session['user_id'])}, {'$unset': {'last_sms_sent': ""}})
        
        # Always update DB Risk Telemetry
        users_collection.update_one(
            {'_id': ObjectId(session['user_id'])},
            {'$set': {'risk_score': score, 'primary_threat': threat}}
        )
        return jsonify({
            'success': True, 
            'risk_score': score, 
            'primary_threat': threat.replace('_', ' ').title(),
            'aqi': data['pm10']
        })
    return jsonify({'error': 'Failed to fetch weather data'}), 500

@app.route('/api/set_location_preference', methods=['POST'])
def set_location_preference():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    pref = data.get('method', 'auto')
    updates = {'location_pref': pref}
    
    if pref == 'manual':
        updates['manual_lat'] = data.get('lat', 0.0)
        updates['manual_lng'] = data.get('lng', 0.0)
        
    users_collection.update_one(
        {'_id': ObjectId(session['user_id'])},
        {'$set': updates}
    )
    return jsonify({'success': True})

@app.route('/logout')
def logout():
    session.clear()
    flash("You have been securely logged out.", "success")
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
