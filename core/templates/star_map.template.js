(function() {
  if (typeof escapeHtml !== "function") {
    const esc = (s) => (s == null ? "" : String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"));
    if (typeof window !== "undefined") window.escapeHtml = esc;
    else global.escapeHtml = esc;
  }

  const renderTemplate = (data = {}, rootData = {}) => {
    const tag = data.tag || "Night Sky Star Map ✨";
    const title = data.title || "The Stars Aligned For Us";
    const desc = data.desc || "Exact celestial sphere alignment charted above our special coordinates in space and time.";
    const locationName = data.locationName || rootData.cityPartner || rootData.cityAlg || "Paris, France";
    const latitude = Number(data.latitude != null ? data.latitude : 48.8566);
    const longitude = Number(data.longitude != null ? data.longitude : 2.3522);
    const observationDate = data.observationDate || rootData.anniversaryDate || "2024-06-15T22:00";
    const showConstellations = data.showConstellations !== false;
    const showStarNames = data.showStarNames !== false;
    const mapTheme = data.mapTheme || "midnight";

    const latStr = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? "N" : "S"}`;
    const lngStr = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? "E" : "W"}`;

    return `
      <section class="section star-map-section" id="starMapSection" 
        data-lat="${latitude}" 
        data-lng="${longitude}" 
        data-date="${escapeHtml(observationDate)}" 
        data-theme="${escapeHtml(mapTheme)}" 
        data-constellations="${showConstellations}" 
        data-starnames="${showStarNames}">
        <div class="container">
          <div class="star-map-container">
            <div class="section-heading text-center">
              <span class="section-tag">${escapeHtml(tag)}</span>
              <h2 class="section-title">${escapeHtml(title)}</h2>
              <p class="section-desc">${escapeHtml(desc)}</p>
            </div>

            <div class="astrolabe-viewport">
              <div class="astrolabe-rim">
                <span class="astrolabe-cardinal cardinal-n">N</span>
                <span class="astrolabe-cardinal cardinal-e">E</span>
                <span class="astrolabe-cardinal cardinal-s">S</span>
                <span class="astrolabe-cardinal cardinal-w">W</span>
                <div class="astrolabe-degree-ticks"></div>
                <canvas id="starMapCanvas" width="600" height="600" class="star-map-canvas"></canvas>
                <div class="star-map-tooltip" id="starMapTooltip"></div>
              </div>
            </div>

            <div class="star-map-meta-panel">
              <div class="celestial-badge">
                <span class="celestial-badge-icon">📍</span>
                <div class="celestial-badge-text">
                  <span class="celestial-badge-title" id="starMapLocationText">${escapeHtml(locationName)}</span>
                  <span class="celestial-badge-sub" id="starMapCoordsText">${latStr}, ${lngStr}</span>
                </div>
              </div>
              <div class="celestial-badge">
                <span class="celestial-badge-icon">🗓️</span>
                <div class="celestial-badge-text">
                  <span class="celestial-badge-title">Celestial Epoch</span>
                  <span class="celestial-badge-sub" id="starMapDateText">${escapeHtml(observationDate.replace("T", " "))}</span>
                </div>
              </div>
            </div>

            <div class="celestial-controls">
              <div class="celestial-toggles">
                <button type="button" class="celestial-btn ${showConstellations ? "active" : ""}" id="btnToggleConstellations" data-toggle="constellations">
                  ✨ Lines: <strong class="toggle-state">${showConstellations ? "ON" : "OFF"}</strong>
                </button>
                <button type="button" class="celestial-btn ${showStarNames ? "active" : ""}" id="btnToggleStarNames" data-toggle="starnames">
                  🏷️ Star Names: <strong class="toggle-state">${showStarNames ? "ON" : "OFF"}</strong>
                </button>
              </div>
              <div class="celestial-themes">
                <button type="button" class="celestial-theme-btn ${mapTheme === "midnight" ? "active" : ""}" data-theme="midnight">🌌 Midnight</button>
                <button type="button" class="celestial-theme-btn ${mapTheme === "obsidian" ? "active" : ""}" data-theme="obsidian">🌑 Obsidian</button>
                <button type="button" class="celestial-theme-btn ${mapTheme === "indigo" ? "active" : ""}" data-theme="indigo">🔮 Indigo</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  };

  if (typeof module !== "undefined" && module.exports) module.exports = renderTemplate;
  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["star_map"] = renderTemplate;
  }
})();
