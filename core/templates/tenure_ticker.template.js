(function() {
  if (typeof escapeHtml !== "function") {
    const esc = (s) => (s == null ? "" : String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"));
    if (typeof window !== "undefined") window.escapeHtml = esc;
    else global.escapeHtml = esc;
  }
  if (typeof safeVal !== "function") {
    const sv = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");
    if (typeof window !== "undefined") window.safeVal = sv;
    else global.safeVal = sv;
  }

  const renderTemplate = (data = {}, rootData = {}) => {
    const partner = rootData.partner2 || rootData.partnerName || "You";
    const tag = data.tag || "Tenure Ticker ⏳";
    const title = data.title || ("Together With " + partner);
    const desc = data.desc || "Every second spent together, counted with astronomical precision.";
    const startDate = data.startDate || data.anniversaryDate || rootData.anniversaryDate || "2023-01-01T00:00";
    const milestoneLabel = data.milestoneLabel || data.nextMilestoneTitle || "1,000 Days Together";
    const milestoneDate = data.milestoneDate || data.nextMilestoneDate || "2025-09-27T00:00";

    const slots = [
      { id: "tickerYears", label: "Years" },
      { id: "tickerMonths", label: "Months" },
      { id: "tickerDays", label: "Days" },
      { id: "tickerHours", label: "Hours" },
      { id: "tickerMinutes", label: "Minutes" },
      { id: "tickerSeconds", label: "Seconds" }
    ];

    const slotsHtml = slots.map(s => `
      <div class="tenure-slot">
        <span class="tenure-val" id="${s.id}">--</span>
        <span class="tenure-label">${s.label}</span>
      </div>
    `).join("");

    const remainSlots = [
      { id: "milestoneRemainDays", label: "Days" },
      { id: "milestoneRemainHours", label: "Hours" },
      { id: "milestoneRemainMinutes", label: "Mins" },
      { id: "milestoneRemainSeconds", label: "Secs" }
    ];

    const remainHtml = remainSlots.map(r => `
      <div class="milestone-slot">
        <span class="milestone-slot-val" id="${r.id}">--</span>
        <span class="milestone-slot-lbl">${r.label}</span>
      </div>
    `).join("");

    return `
      <section class="section tenure-ticker-section" id="tenureTickerSection" data-startdate="${escapeHtml(startDate)}" data-milestonedate="${escapeHtml(milestoneDate)}">
        <div class="container">
          <div class="tenure-ticker-box">
            <div class="section-heading">
              <span class="section-tag">${escapeHtml(tag)}</span>
              <h2 class="section-title">${escapeHtml(title)}</h2>
              <p class="section-desc">${escapeHtml(desc)}</p>
            </div>

            <div class="tenure-card main-ticker-card">
              <div class="tenure-header-row">
                <span class="tenure-pill">⏳ Precision Counter</span>
                <span class="tenure-start-meta">Journey Began: <strong>${escapeHtml(startDate.replace("T", " "))}</strong></span>
              </div>
              <div class="tenure-grid-six">
                ${slotsHtml}
              </div>
            </div>

            <div class="tenure-card milestone-target-card">
              <div class="milestone-top-row">
                <div>
                  <span class="milestone-tag">🎯 Next Major Milestone</span>
                  <h3 class="milestone-heading" id="milestoneTargetLabel">${escapeHtml(milestoneLabel)}</h3>
                  <div class="milestone-date-meta" id="milestoneTargetDateDisplay">Target Date: <strong>${escapeHtml(milestoneDate.replace("T", " "))}</strong></div>
                </div>
                <div class="milestone-remain-grid">
                  ${remainHtml}
                </div>
              </div>

              <div class="milestone-progress-wrap">
                <div class="milestone-progress-labels">
                  <span>Milestone Progress</span>
                  <span id="milestoneProgressPct">0%</span>
                </div>
                <div class="milestone-progress-track">
                  <div class="milestone-progress-fill" id="milestoneProgressFill" style="width: 0%"></div>
                </div>
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
    window.WIDGET_TEMPLATES["tenure_ticker"] = renderTemplate;
  }
})();
