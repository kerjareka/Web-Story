// src/scripts/utils/map-component.js
import L from 'leaflet';
// Import config if you use API keys for other tile layers
// import config from '../config';

class MapComponent {
    constructor(mapId, center = { lat: 0, lon: 0 }, zoom = 2) {
        this._mapId = mapId;
        this._center = center;
        this._zoom = zoom;
        this._map = null;
        this._initMap();
    }

    _initMap() {
        // Check if map instance already exists on this container
        // This is crucial to prevent Leaflet from complaining about existing map instances
        if (document.getElementById(this._mapId)._leaflet_id) {
            this._map = document.getElementById(this._mapId)._leaflet_map;
            this._map.setView([this._center.lat, this._center.lon], this._zoom);
            return;
        }

        this._map = L.map(this._mapId).setView([this._center.lat, this._center.lon], this._zoom);

        // Base Layers
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        // Example of another tile layer (requires API Key in config.js and STUDENT.txt)
        // const maptilerStreets = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${config.MAPTILER_API_KEY}`, {
        //     attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        // });

        // const maptilerSatellite = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${config.MAPTILER_API_KEY}`, {
        //     attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        // });

        const baseLayers = {
            "OpenStreetMap": osmLayer,
            // "MapTiler Streets": maptilerStreets, // Uncomment if you use MapTiler
            // "MapTiler Satellite": maptilerSatellite, // Uncomment if you use MapTiler
        };

        osmLayer.addTo(this._map); // Add default layer

        // Layer control (for optional kriteria)
        L.control.layers(baseLayers).addTo(this._map);

        // Store map instance reference
        document.getElementById(this._mapId)._leaflet_map = this._map;
    }

    addMarker({ lat, lon, popupText = '' }) {
        if (this._map) {
            const marker = L.marker([lat, lon]).addTo(this._map);
            if (popupText) {
                marker.bindPopup(popupText).openPopup();
            }
            // Adjust view to the marker, ensure zoom level is not too low
            this._map.setView([lat, lon], Math.max(this._zoom, 8));
        }
    }

    addClickListener(callback) {
        if (this._map) {
            this._map.on('click', (e) => {
                callback(e.latlng);
            });
        }
    }

    clearMarkers() {
        if (this._map) {
            this._map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    this._map.removeLayer(layer);
                }
            });
        }
    }

    getMapInstance() {
        return this._map;
    }
}

export { MapComponent };