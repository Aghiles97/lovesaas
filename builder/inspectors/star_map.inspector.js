(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["star_map"] = function(inspectorFormContainer, state, ctx) {
    const { debouncedLiveUpdate = () => {}, debouncedAutoSaveLayout = () => {} } = ctx || {};
    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.star_map) state.sectionsData.star_map = {};
    const sm = state.sectionsData.star_map;
    const hero = state.sectionsData.hero || {};

    const currentTheme = sm.mapTheme || "midnight";
    const showConst = sm.showConstellations !== false;
    const showStars = sm.showStarNames !== false;

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">✨ Star Map Header</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="sm_tag" value="${safeVal(sm.tag || "Night Sky Star Map ✨")}">
        </div>
        <div class="input-group">
          <label>Section Title</label>
          <input type="text" id="sm_title" value="${safeVal(sm.title || "The Stars Aligned For Us")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="sm_desc" rows="2">${safeVal(sm.desc || "Exact celestial sphere alignment charted above our special coordinates in space and time.")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📍 Location & Epoch</span>
        </div>
        <div class="input-group">
          <label>Location Name</label>
          <input type="text" id="sm_locationName" value="${safeVal(sm.locationName || hero.cityPartner || hero.cityAlg || "Paris, France")}">
        </div>
        <div class="input-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="input-group">
            <label>Latitude (°)</label>
            <input type="number" id="sm_latitude" step="0.0001" value="${sm.latitude != null ? sm.latitude : 48.8566}">
          </div>
          <div class="input-group">
            <label>Longitude (°)</label>
            <input type="number" id="sm_longitude" step="0.0001" value="${sm.longitude != null ? sm.longitude : 2.3522}">
          </div>
        </div>
        <div class="input-group">
          <label>Observation Date & Time</label>
          <input type="datetime-local" id="sm_observationDate" value="${safeVal(sm.observationDate || hero.anniversaryDate || "2024-06-15T22:00")}">
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎨 Celestial Visuals</span>
        </div>
        <div class="input-group">
          <label>Color Theme</label>
          <select id="sm_mapTheme">
            <option value="midnight" ${currentTheme === "midnight" ? "selected" : ""}>🌌 Midnight Space</option>
            <option value="obsidian" ${currentTheme === "obsidian" ? "selected" : ""}>🌑 Obsidian Black</option>
            <option value="indigo" ${currentTheme === "indigo" ? "selected" : ""}>🔮 Indigo Starlight</option>
          </select>
        </div>
        <div class="input-group" style="display: flex; gap: 16px; margin-top: 10px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="sm_showConstellations" ${showConst ? "checked" : ""}>
            <span>Constellation Lines</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="sm_showStarNames" ${showStars ? "checked" : ""}>
            <span>Star Names</span>
          </label>
        </div>
      </div>
    `;

    const syncStarMapData = () => {
      sm.tag = document.getElementById("sm_tag").value.trim();
      sm.title = document.getElementById("sm_title").value.trim();
      sm.desc = document.getElementById("sm_desc").value.trim();
      sm.locationName = document.getElementById("sm_locationName").value.trim();
      sm.latitude = parseFloat(document.getElementById("sm_latitude").value) || 0;
      sm.longitude = parseFloat(document.getElementById("sm_longitude").value) || 0;
      sm.observationDate = document.getElementById("sm_observationDate").value;
      sm.mapTheme = document.getElementById("sm_mapTheme").value;
      sm.showConstellations = document.getElementById("sm_showConstellations").checked;
      sm.showStarNames = document.getElementById("sm_showStarNames").checked;

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    inspectorFormContainer.querySelectorAll("input, textarea, select").forEach(el => {
      el.addEventListener("input", syncStarMapData);
      el.addEventListener("change", syncStarMapData);
    });
  };
})();
