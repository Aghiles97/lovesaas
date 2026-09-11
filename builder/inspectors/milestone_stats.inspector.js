/**
 * Builder Inspector Module: milestone_stats
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["milestone_stats"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    
    if (!state.sectionsData.milestone_stats) state.sectionsData.milestone_stats = {};
    const ms = state.sectionsData.milestone_stats;
    const hero = state.sectionsData.hero || {};
    const p2Def = hero.partner2 || hero.partnerName || "You";

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⏳ Milestone Header & Birthdate</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="ms_tag" value="${safeVal(ms.tag || "Milestone Life Counter ⏳")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="ms_title" value="${safeVal(ms.title || ("Every Single Second Alive, " + p2Def + " ❤️"))}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="ms_desc" rows="2">${safeVal(ms.desc || "A live ticking celebration of the seconds, heartbeats, and memories you bring into this universe.")}</textarea>
        </div>
        <div class="input-group">
          <label>Birth Date & Time (for alive ticker calculation)</label>
          <input type="datetime-local" id="ms_birthDate" value="${safeVal(ms.birthDate || hero.anniversaryDate || "2000-01-01T00:00")}">
        </div>
      </div>
    `;

    function syncMilestoneData() {
      ms.tag = document.getElementById("ms_tag").value.trim();
      ms.title = document.getElementById("ms_title").value.trim();
      ms.desc = document.getElementById("ms_desc").value.trim();
      ms.birthDate = document.getElementById("ms_birthDate").value;

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }

    inspectorFormContainer.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", syncMilestoneData);
    });

  };
})();
