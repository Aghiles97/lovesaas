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
  const partner = rootData.partner2 || rootData.partnerName || "Ella";
  const tag = data.tag || "Milestone Life Counter ⏳";
  const title = data.title || ("Every Single Second Alive, " + partner + " ❤️");
  const desc = data.desc || "A live ticking celebration of the seconds, heartbeats, and memories you bring into this universe.";
  const birthDate = data.birthDate || rootData.anniversaryDate || "2000-01-01T00:00";

  const defaultMetrics = [
    { id: "heartbeats", icon: "💓", title: "Heartbeats Beating For You", desc: "Every single beat devoted purely to loving you (~103k/day)", factor: 103680 },
    { id: "solar", icon: "☀️", title: "Trips Around The Sun", desc: "Completed solar orbits gracing the universe with your light", factor: 0.00273785 },
    { id: "distance", icon: "💌", title: "Kilometers of Long-Distance Love Bridged", desc: "No span of Earth can ever keep my heart from yours", factor: 28 },
    { id: "dreams", icon: "💭", title: "Hours Dreaming Of You", desc: "Sweetest dreams where you hold my hand every night", factor: 8.5 },
    { id: "laughs", icon: "🥰", title: "Sweet Smiles & Giggles Shared", desc: "Moments of pure joy you bring into my life every day", factor: 18 },
    { id: "coffee", icon: "☕", title: "Cups of Warm Tea & Cozy Talks", desc: "Comforting mornings and late-night heart-to-hearts", factor: 2.2 }
  ];

  const metrics = Array.isArray(data.metrics) && data.metrics.length ? data.metrics : defaultMetrics;

  const metricsHtml = metrics.map(m => `
    <div class="quirky-metric-card tilt-card" data-metric-id="${escapeHtml(m.id || '')}" data-factor="${Number(m.factor) || 1}">
      <div class="card-glare"></div>
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

          <div class="alive-ticker-card tilt-card">
            <div class="card-glare"></div>
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
              <div class="ticker-slot ticker-slot-seconds">
                <span class="ticker-val ticker-val-seconds" id="milestoneSeconds">--</span>
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
