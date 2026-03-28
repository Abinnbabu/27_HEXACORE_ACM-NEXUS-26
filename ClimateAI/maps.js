/**
 * Maps logic for ClimateAI
 * Requires Leaflet.js to be loaded beforehand
 */

let climateMap;
let activeTool = null; // Used for authority tools ('camp' or 'zone')
let currentMarkers = [];

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

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = [position.coords.latitude, position.coords.longitude];
                climateMap.setView(pos, 14);
                
                // Add "You are here" marker
                L.marker(pos).addTo(climateMap)
                    .bindPopup('<b>Current Location</b><br>You are here.')
                    .openPopup();
            },
            () => {
                console.log("Geolocation failed or denied.");
            }
        );
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
            
            // Format for backend sending later
            console.log(`Added ${label} at Coordinates:`, e.latlng);
            
            // Reset active tool
            activeTool = null;
            document.querySelectorAll('.btn-action-map').forEach(btn => btn.style.opacity = "1");
        });
    }
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
