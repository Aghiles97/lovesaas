/**
 * Template Renderer: milestone_stats
 * Modular Birthday Component
 */
(function() {
  if (typeof escapeHtml !== "function") {
    const esc = function(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    if (typeof window !== "undefined") window.escapeHtml = esc;
    else global.escapeHtml = esc;
  }
  if (typeof safeVal !== "function") {
    const sv = function(v) {
      return String(v == null ? "" : v).replace(/"/g, "&quot;");
    };
    if (typeof window !== "undefined") window.safeVal = sv;
    else global.safeVal = sv;
  }

  const renderTemplate = (data = {}, rootData = {}) => {
  const partner = rootData.partner2 || rootData.partnerName || "You";
  const tag = data.tag || "Milestone Life Counter ⏳";
  const title = data.title || ("Every Single Second Alive, " + partner + " ❤️");
  const desc = data.desc || "A live ticking celebration of the seconds, heartbeats, and memories you bring into this universe.";
  const birthDate = data.birthDate || rootData.anniversaryDate || "2000-01-01T00:00";

  const defaultMetrics = [
    { id: "heartbeats", icon: "💓", title: "Heartbeats", desc: "Beating with love & vitality (~103k/day)", factor: 103680 },
    { id: "coffee", icon: "☕", title: "Cups of Coffee & Tea", desc: "Fueling sweet mornings & late smiles", factor: 1.6 },
    { id: "solar", icon: "🌍", title: "Trips Around the Sun", desc: "Completed solar orbits celebrating your life", factor: 0.00273785 },
    { id: "dreams", icon: "💤", title: "Hours of Sweet Dreams", desc: "Restful sleep & imagining bright futures", factor: 8 },
    { id: "laughs", icon: "😂", title: "Laughs & Giggles", desc: "Shared moments of pure unadulterated joy", factor: 14 },
    { id: "distance", icon: "✈️", title: "Kilometers Traveled", desc: "Journeying across this planet with wonder", factor: 11 }
  ];

  const metrics = Array.isArray(data.metrics) && data.metrics.length ? data.metrics : defaultMetrics;

  const metricsHtml = metrics.map(m => `
    <div class="quirky-metric-card" data-metric-id="${escapeHtml(m.id || '')}" data-factor="${Number(m.factor) || 1}">
      <span class="quirky-metric-icon">${m.icon || '✨'}</span>
      <div class="quirky-metric-content">
        <div class="quirky-metric-val" id="metric_val_${escapeHtml(m.id || 'stat')}">--</div>
        <div class="quirky-metric-title">${escapeHtml(m.title || '')}</div>
        <div class="quirky-metric-desc">${escapeHtml(m.desc || '')}</div>
      </div>
    </div>
  `).join('');

  return `
    <section class="section milestone-stats-section" id="milestoneStatsSection" data-birthdate="${escapeHtml(birthDate)}">
      <div class="container">
        <div class="milestone-stats-box">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="alive-ticker-card">
            <div style="font-size: 0.95rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">
              ⏳ Total Time Alive on Earth
            </div>
            <div class="alive-ticker-grid">
              <div class="ticker-slot">
                <span class="ticker-val" id="milestoneDays">--</span>
                <span class="ticker-label">Days</span>
              </div>
              <div class="ticker-slot">
                <span class="ticker-val" id="milestoneHours">--</span>
                <span class="ticker-label">Hours</span>
              </div>
              <div class="ticker-slot">
                <span class="ticker-val" id="milestoneMinutes">--</span>
                <span class="ticker-label">Minutes</span>
              </div>
              <div class="ticker-slot">
                <span class="ticker-val" id="milestoneSeconds">--</span>
                <span class="ticker-label">Seconds</span>
              </div>
            </div>
          </div>

          <div class="quirky-metrics-grid" id="quirkyMetricsGrid">
            ${metricsHtml}
          </div>
        </div>
      </div>
    </section>
  `;
};

  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["milestone_stats"] = renderTemplate;
  }
})();
