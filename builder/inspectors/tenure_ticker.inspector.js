(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["tenure_ticker"] = function(inspectorFormContainer, state, ctx) {
    const { debouncedLiveUpdate = () => {}, debouncedAutoSaveLayout = () => {} } = ctx || {};
    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.tenure_ticker) state.sectionsData.tenure_ticker = {};
    const tt = state.sectionsData.tenure_ticker;
    const hero = state.sectionsData.hero || {};
    const partner = hero.partner2 || hero.partnerName || "You";

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⏳ Tenure Ticker Settings</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="tt_tag" value="${safeVal(tt.tag || "Tenure Ticker ⏳")}">
        </div>
        <div class="input-group">
          <label>Section Title</label>
          <input type="text" id="tt_title" value="${safeVal(tt.title || ("Together With " + partner))}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="tt_desc" rows="2">${safeVal(tt.desc || "Every second spent together, counted with astronomical precision.")}</textarea>
        </div>
        <div class="input-group">
          <label>Anniversary / Start Date</label>
          <input type="datetime-local" id="tt_startDate" value="${safeVal(tt.startDate || tt.anniversaryDate || hero.anniversaryDate || "2023-01-01T00:00")}">
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎯 Next Milestone Target</span>
        </div>
        <div class="input-group">
          <label>Milestone Label</label>
          <input type="text" id="tt_milestoneLabel" value="${safeVal(tt.milestoneLabel || tt.nextMilestoneTitle || "1,000 Days Together")}">
        </div>
        <div class="input-group">
          <label>Milestone Target Date</label>
          <input type="datetime-local" id="tt_milestoneDate" value="${safeVal(tt.milestoneDate || tt.nextMilestoneDate || "2025-09-27T00:00")}">
        </div>
      </div>
    `;

    const syncTenureData = () => {
      tt.tag = document.getElementById("tt_tag").value.trim();
      tt.title = document.getElementById("tt_title").value.trim();
      tt.desc = document.getElementById("tt_desc").value.trim();
      tt.startDate = document.getElementById("tt_startDate").value;
      tt.anniversaryDate = tt.startDate;
      tt.milestoneLabel = document.getElementById("tt_milestoneLabel").value.trim();
      tt.nextMilestoneTitle = tt.milestoneLabel;
      tt.milestoneDate = document.getElementById("tt_milestoneDate").value;
      tt.nextMilestoneDate = tt.milestoneDate;

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    inspectorFormContainer.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", syncTenureData);
    });
  };
})();
