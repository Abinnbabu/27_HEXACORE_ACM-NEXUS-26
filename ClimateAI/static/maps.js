/**
 * Maps logic for ClimateAI
 * Requires Leaflet.js to be loaded beforehand
 */

let climateMap;
let activeTool = null; // Used for authority tools ('camp' or 'zone')
let currentMarkers = [];
let userMarker = null;

function fetchRisk(lat, lng) {
    if (document.getElementById('authority-map')) return; 
    fetch('/api/check_risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: lat, lng: lng })
    }).then(res => res.json()).then(data => {
        if (data.success && document.getElementById('ui-risk-score')) {
            document.getElementById('ui-risk-score').innerText = data.risk_score + ' / 100';
            document.getElementById('ui-risk-label').innerText = data.primary_threat + ' Dominant';
            document.getElementById('ui-aqi-score').innerText = data.aqi + ' PM10';
            
            let ul = document.getElementById('ui-warnings');
            ul.innerHTML = '';
            if (data.risk_score >= 50) {
                document.getElementById('ui-risk-score').style.color = 'var(--text-red)';
                ul.innerHTML += `<li style="color:var(--text-red); font-weight: 500;">⚠️ Auto-Alert: Severe ${data.primary_threat}</li>`;
            } else {
                document.getElementById('ui-risk-score').classList.remove('danger-text');
                document.getElementById('ui-risk-score').style.color = 'var(--icon-green-text)';
                document.getElementById('ui-risk-label').classList.remove('danger-text');
                ul.innerHTML += `<li>All telemetry within safe parameters.</li>`;
            }
        }
    }).catch(err => console.error("Telemetry failed:", err));
}

function updateLocationPreference(method, lat = 0, lng = 0) {
    fetch('/api/set_location_preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, lat, lng })
    }).catch(console.error);
}

function placeUserMarker(lat, lng, isManual = false) {
    const pos = [lat, lng];
    climateMap.setView(pos, 14);
    
    if (userMarker) {
        climateMap.removeLayer(userMarker);
    }
    
    userMarker = L.marker(pos, {draggable: isManual}).addTo(climateMap)
        .bindPopup(isManual ? '<b>Custom Location</b><br>Drag me to adjust!' : '<b>Current Location</b><br>You are here.')
        .openPopup();
        
    if (isManual) {
        userMarker.on('dragend', function() {
            const newPos = userMarker.getLatLng();
            fetchRisk(newPos.lat, newPos.lng);
            updateLocationPreference('manual', newPos.lat, newPos.lng);
        });
    }
}

function initMap(mapId, isAuthority = false) {
    if (!document.getElementById(mapId)) return;

    // Default coordinate (fallback if geolocation fails) - e.g. center of a city
    const defaultCoords = [37.7749, -122.4194]; 

    // Initialize map
    climateMap = L.map(mapId).setView(defaultCoords, 13);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(climateMap);

    // Try HTML5 geolocation or Manual Override
    if (!isAuthority) {
        if (window.userPref === 'manual') {
            const pos = [window.manualLat, window.manualLng];
            placeUserMarker(pos[0], pos[1], true);
            fetchRisk(pos[0], pos[1]);
            
            // Map click handler for standard users dropping custom pins
            climateMap.on('click', function(e) {
                placeUserMarker(e.latlng.lat, e.latlng.lng, true);
                fetchRisk(e.latlng.lat, e.latlng.lng);
                updateLocationPreference('manual', e.latlng.lat, e.latlng.lng);
            });
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    placeUserMarker(position.coords.latitude, position.coords.longitude, false);
                    fetchRisk(position.coords.latitude, position.coords.longitude);
                },
                () => { console.log("Geolocation failed or denied."); }
            );
        }
    } else {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    placeUserMarker(position.coords.latitude, position.coords.longitude, false);
                },
                () => { console.log("Geolocation failed or denied."); } // Map centers on default
            );
        }
    }

    // Set up authority map click interactions
    if (isAuthority) {
        climateMap.on('click', function(e) {
            if (!activeTool) return; // Only add marker if a tool is selected
            
            const color = activeTool === 'camp' ? 'purple' : 'green';
            const label = activeTool === 'camp' ? 'Relief Camp' : 'Safe Zone';
            
            // Create a custom colored icon using standard leafet HTML
            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:${color}; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const marker = L.marker(e.latlng, {icon: customIcon}).addTo(climateMap);
            marker.bindPopup(`<b>${label}</b><br>Lat: ${e.latlng.lat.toFixed(4)}<br>Lng: ${e.latlng.lng.toFixed(4)}`).openPopup();
            
            currentMarkers.push(marker);
            
            // Save to Backend immediately
            fetch('/api/locations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ type: activeTool, lat: e.latlng.lat, lng: e.latlng.lng })
            }).then(res => res.json()).then(data => {
                if(!data.success) { 
                    alert("Failed to secure location in database."); 
                } else {
                    marker.bindPopup(`<b>${label}</b><br><button onclick="deleteLocation('${data.id}')" style="margin-top:5px; padding:2px 6px; background-color:#ef4444; color:white; border:none; border-radius:4px; font-size:0.75rem; cursor:pointer;">Remove Marker</button>`).openPopup();
                }
            });
            
            // Format for backend sending later
            console.log(`Added ${label} at Coordinates:`, e.latlng);
            
            // Reset active tool
            activeTool = null;
            document.querySelectorAll('.btn-action-map').forEach(btn => btn.style.opacity = "1");
        });
    }

    // Load existing authoritative pins from MongoDB
    fetch('/api/locations')
        .then(res => res.json())
        .then(locs => {
            window.authorityLocs = locs; // Store them globally for the routing engine
            locs.forEach(loc => {
                const color = loc.type === 'camp' ? 'purple' : 'green';
                const label = loc.type === 'camp' ? 'Relief Camp' : 'Safe Zone';
                const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color:${color}; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                let popupHtml = `<b>${label}</b>`;
                if (isAuthority && loc.id) {
                    popupHtml += `<br><button onclick="deleteLocation('${loc.id}')" style="margin-top:5px; padding:2px 6px; background-color:#ef4444; color:white; border:none; border-radius:4px; font-size:0.75rem; cursor:pointer;">Remove Marker</button>`;
                }
                L.marker([loc.lat, loc.lng], {icon: customIcon}).addTo(climateMap).bindPopup(popupHtml);
            });
        })
        .catch(err => console.error("Could not load regional map data.", err));
}

// Map Action Handlers for Authority Dashboard
function activateTool(toolType, buttonElement) {
    activeTool = toolType;
    document.querySelectorAll('.btn-action-map').forEach(btn => btn.style.opacity = "0.5");
    buttonElement.style.opacity = "1";
    alert(`Click anywhere on the map to drop a ${toolType === 'camp' ? 'Relief Camp' : 'Safe Zone'} pin.`);
}

// Auto-initialize based on which page is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('user-map')) {
        initMap('user-map', false);
    } else if (document.getElementById('authority-map')) {
        initMap('authority-map', true);
    }
});

/**
 * Triggered by Authority Popups to delete an existing Map Pin globally
 * @param {string} locId MongoDB ObjectId string for the location
 */
window.deleteLocation = function(locId) {
    if(!confirm("Are you sure you want to remove this marker? It will be deleted for all users.")) return;
    
    fetch('/api/locations/' + locId, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                window.location.reload();
            } else {
                alert("Failed to delete marker.");
            }
        });
};

/**
 * Custom User Geocoding via OpenStreetMap
 */
window.searchLocation = function() {
    const q = document.getElementById('loc-search').value;
    if (!q) return;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                
                window.userPref = 'manual';
                placeUserMarker(lat, lng, true);
                fetchRisk(lat, lng);
                updateLocationPreference('manual', lat, lng);
                
                const btn = document.getElementById('btn-auto-fetch');
                if(btn) {
                    btn.style.background = 'var(--icon-purple-bg)';
                    btn.style.color = 'var(--icon-purple-text)';
                    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg> Enable Auto-Fetch`;
                }
            } else {
                alert("Location not found.");
            }
        }).catch(err => alert("Error searching location."));
};

/**
 * Return to GPS Fetching
 */
window.setAutoFetch = function() {
    window.userPref = 'auto';
    updateLocationPreference('auto');
    const btn = document.getElementById('btn-auto-fetch');
    if(btn) {
        btn.style.background = 'var(--icon-green-bg)';
        btn.style.color = 'var(--icon-green-text)';
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Auto-Fetching`;
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            placeUserMarker(pos.coords.latitude, pos.coords.longitude, false);
            fetchRisk(pos.coords.latitude, pos.coords.longitude);
        });
    }
};

/**
 * Evacuation Routing logic - Finds nearest saved pin to user marker and draws a path.
 */
window.routingControl = null;

window.findNearestRoute = function() {
    if (!userMarker) {
        alert("Your location is not acquired! Search a location or let auto-fetch find you.");
        return;
    }
    const camps = window.authorityLocs.filter(l => l.type === 'camp');
    if (!camps || camps.length === 0) {
        alert("No Official Relief Camps have been established by Authorities yet.");
        return;
    }

    const userLatLng = userMarker.getLatLng();
    let minDistance = Infinity;
    let nearestLoc = null;

    camps.forEach(loc => {
        const destLatLng = L.latLng(loc.lat, loc.lng);
        const dist = userLatLng.distanceTo(destLatLng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestLoc = loc;
        }
    });

    if (nearestLoc) {
        // Clear old routes if existing
        if (window.routingControl) {
            climateMap.removeControl(window.routingControl);
        }
        
        window.routingControl = L.Routing.control({
            waypoints: [
                userLatLng,
                L.latLng(nearestLoc.lat, nearestLoc.lng)
            ],
            // Core options to just draw the route, avoiding extra markers and instructions
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            createMarker: function() { return null; },
            lineOptions: {
                styles: [{color: '#3B82F6', opacity: 0.9, weight: 6}]
            }
        }).addTo(climateMap);
    }
};
