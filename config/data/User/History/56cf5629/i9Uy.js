class MarineMapCard extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    const targetState = hass.states['input_text.target_coordinates'] ? hass.states['input_text.target_coordinates'].state : '';
    
    // Sendet aktuelle Koordinaten an das Iframe
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({ type: 'UPDATE_TARGET', coords: targetState }, '*');
    }
  }

  connectedCallback() {
    if (this.rendered) return;
    this.rendered = true;

    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.minHeight = '400px';

    this.iframe = document.createElement('iframe');
    this.iframe.src = '/local/marine-map.html?v=1.0.0';
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.minHeight = '400px';
    this.iframe.style.border = 'none';
    this.iframe.style.borderRadius = '8px';

    // Lauscht auf Klicks im Iframe und ruft den HA Service auf
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SET_TARGET') {
        if (this._hass) {
          this._hass.callService('input_text', 'set_value', {
            entity_id: 'input_text.target_coordinates',
            value: event.data.coords
          });
        }
      }
    });

    this.appendChild(this.iframe);
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
  description: "Interaktive Seekarte im Iframe"
});