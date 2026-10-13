// Dynamic Loading von Leaflet CSS & JS
if (!document.getElementById('leaflet-css')) {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

class MarineMapCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    const targetState = hass.states['input_text.target_coordinates'] ? hass.states['input_text.target_coordinates'].state : '';
    
    if (this.map) {
      this.updateTargetOnMap(targetState);
    }
  }

  connectedCallback() {
    if (this.rendered) return;
    this.rendered = true;

    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.borderRadius = '8px';
    container.style.overflow = 'hidden';
    this.appendChild(container);

    // Leaflet laden & Map initialisieren
    this.loadLeaflet().then(() => {
      this.initMap(container);
    });
  }

  loadLeaflet() {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  initMap(container) {
    const initialLat = 38.958;
    const initialLng = 21.164;

    this.map = L.map(container, {
      zoomControl: false,
      attributionControl: false
    }).setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(this.map);
    L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(this.map);

    this.boatCoords = [initialLat, initialLng];
    this.targetMarker = null;
    this.targetLine = null;

    // Klick auf Karte -> Native HA Service-Ausführung
    this.map.on('click', (e) => {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      const coordsString = `${lat}, ${lng}`;

      if (this._hass) {
        this._hass.callService('input_text', 'set_value', {
          entity_id: 'input_text.target_coordinates',
          value: coordsString
        });
      }
    });

    // Ersten Zustand zeichnen
    if (this._hass && this._hass.states['input_text.target_coordinates']) {
      this.updateTargetOnMap(this._hass.states['input_text.target_coordinates'].state);
    }
  }

  updateTargetOnMap(coordsString) {
    if (!coordsString || coordsString.trim() === '' || coordsString === 'unknown' || coordsString === 'unavailable') {
      if (this.targetMarker) {
        this.map.removeLayer(this.targetMarker);
        this.targetMarker = null;
      }
      if (this.targetLine) {
        this.map.removeLayer(this.targetLine);
        this.targetLine = null;
      }
      return;
    }

    const parts = coordsString.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());

      if (!isNaN(lat) && !isNaN(lng)) {
        const targetCoords = [lat, lng];

        if (this.targetMarker) {
          this.targetMarker.setLatLng(targetCoords);
        } else {
          this.targetMarker = L.marker(targetCoords, { title: 'Ziel' }).addTo(this.map);
        }

        if (this.targetLine) {
          this.targetLine.setLatLngs([this.boatCoords, targetCoords]);
        } else {
          this.targetLine = L.polyline([this.boatCoords, targetCoords], {
            color: '#ff9800',
            weight: 3,
            dashArray: '5, 10'
          }).addTo(this.map);
        }
      }
    }
  }

  getCardSize() {
    return 5;
  }
}

customElements.define('marine-map-card', MarineMapCard);