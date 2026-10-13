class MarineMapCard extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

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

    this.attachShadow({ mode: 'open' });

    // Leaflet CSS direkt als Link in das Shadow DOM laden
    const leafletLink = document.createElement('link');
    leafletLink.rel = 'stylesheet';
    leafletLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    this.shadowRoot.appendChild(leafletLink);

    // Eigenes Styling für Shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 400px;
      }
      #map {
        width: 100%;
        height: 100%;
        min-height: 400px;
        background-color: #1a1d24;
        border-radius: 8px;
        overflow: hidden;
      }
      .leaflet-tile {
        max-width: none !important;
        max-height: none !important;
      }
    `;
    this.shadowRoot.appendChild(style);

    const container = document.createElement('div');
    container.id = 'map';
    this.shadowRoot.appendChild(container);

    this.loadLeaflet().then(() => {
      // Warten, bis das CSS im Shadow DOM wirklich geladen wurde
      leafletLink.onload = () => {
        this.initMap(container);
      };
      // Fallback, falls CSS bereits gekapselt im Browser liegt
      if (leafletLink.sheet) {
        this.initMap(container);
      }
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
    if (this.map) return;

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

    // WICHTIG: ResizeObserver stellt sicher, dass sobald der Dashboard-Container 
    // seine Pixel-Größe erhält, Leaflet die Kacheln sofort sauber ausrichtet.
    const resizeObserver = new ResizeObserver(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
    resizeObserver.observe(container);

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

window.customCards = window.customCards || [];
window.customCards.push({
  type: "marine-map-card",
  name: "Marine Map Card",
  description: "Interaktive Seekarte"
});