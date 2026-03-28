## 09:00

### 🚀 Features Added
- Initialized project structure for frontend and backend
- Added `AGENTS.md` with defined hackathon workflow guidelines
- Created `CHANGELOG.md` with structured logging format

### 📁 Files Modified
- AGENTS.md  
- CHANGELOG.md  
- README.md  

### ⚠️ Issues Faced
- None  


## 12:47

### 🚀 Features Added
- Integrated local template assets (`template_acm.png`, `template_clique.png`)
- Standardized time format across documentation to 24-hour format (HH:MM)

### 📁 Files Modified
- AGENTS.md  
- CHANGELOG.md  
- README.md  
- template_acm.png  
- template_clique.png  

### ⚠️ Issues Faced
- Remote asset loading failed → resolved by switching to local assets  


## 12:55

### 🚀 Features Added
- Integrated Django REST Framework for API development
- Enabled `rest_framework` in project settings

### 📁 Files Modified
- backend/project/project/settings.py  

### ⚠️ Issues Faced
- None  


## 13:30

### 🚀 Features Added
- Set up Django backend project structure  
- Created `api` app for handling authentication and risk APIs  
- Configured project routing (`urls.py`)  
- Initialized SQLite database  
- Implemented basic login and register API endpoints  

### 📁 Files Modified
- backend/project/manage.py  
- backend/project/project/settings.py  
- backend/project/project/urls.py  
- backend/project/api/models.py  
- backend/project/api/views.py  
- backend/project/api/urls.py  

### ⚠️ Issues Faced
- Path issues with `manage.py` → resolved by navigating to correct directory  
- Incorrect command usage (`cd python manage.py`) → corrected  


## 00:58

### 🚀 Features Added
- Redesigned home **environmental dashboard**: main **current location** panel with live **OpenStreetMap** embed, sidebar tiles for **AQI**, **Alert**, **Warnings**, and **Survey**
- **Geolocation** in the browser: coordinates sent to the backend; **reverse geocoding** (Nominatim) returns a place label and **map embed URL** for the home map area
- New Django endpoint **`GET /api/location/`** (`map_location.py`) for latitude/longitude → `display_name`, `map_embed_url`, attribution
- **Risk / AQI** panel data from existing **`GET /api/risk/`** integration on the home screen
- **Alert** and **Survey** routes: `/alert` and `/survey`; on home, the **alert message** text opens the Alert screen (keyboard-accessible)
- Development **`ALLOWED_HOSTS`** updated for `localhost` / `127.0.0.1`

### 📁 Files Modified
- frontend/src/components/home.js  
- frontend/src/components/alert.js  
- frontend/src/components/survey.js  
- frontend/src/App.js  
- frontend/src/api.js  
- backend/project/api/map_location.py *(new)*  
- backend/project/api/urls.py  
- backend/project/project/settings.py  
- CHANGELOG.md  

### ⚠️ Issues Faced
- Map and place lookup depend on **network access** from the Django server to Nominatim and on the user **allowing location** in the browser  
- Nominatim has **rate limits** and usage policy constraints suitable for demos, not heavy production load without caching or another provider  


## 03:20

### 🚀 Features Added
- **Full Stack Migration**: Shifted from Django to a consolidated **Flask** backend with **MongoDB Atlas** for scalable hackathon data storage
- **Twilio SMS Alerts**: Integrated Twilio API to dispatch real-time SMS warnings to users when Risk Factor exceeds safety thresholds
- **Advanced Flood Prediction**: Integrated Open-Meteo Flood API to correlate river discharge with historical means for precision threat modeling
- **Authority Hub**: Created a dedicated dashboard for emergency responders to visualize user hotspots and manage relief infrastructure
- **Interactive Mapping**: Implemented Leaflet-based tools for authorities to drop pins for **Relief Camps** and **Safe Zones**
- **Safety Survey System**: Enabled users to report real-time safety status ("Safe", "Needs Help", "Evacuating") directly to the authority dashboard
- **Role-Based Access (RBAC)**: Implemented secure session-based authentication for Admin, Authority, and User levels

### 📁 Files Modified
- app.py *(Major Migration)*
- maps.js *(New Leaflet Integration)*
- admin.html / admin.js / admin.css
- authority_dashboard.html
- user_dashboard.html
- app.css
- CHANGELOG.md

### ⚠️ Issues Faced
- **Database Seed Consistency**: Initial MongoDB connection required careful logic to ensure admin credentials persisted correctly
- **Twilio Geocoding**: Required standardizing phone number formats (+91 prefix) for reliable delivery in local testing
