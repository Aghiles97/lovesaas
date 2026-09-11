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
    const tag = data.tag || "Our Journey Through Time 🌗";
    const title = data.title || "Then vs. Now: How It Started & How It's Going";
    const desc = data.desc || "From the shy smiles of day one to the unbreakable bond of today. Slide to witness our growth.";
    const thenLabel = data.thenLabel || (data.thenDate ? `THEN (${data.thenDate})` : "THEN (First Date - 2021)");
    const thenImg = data.thenImg || "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80";
    const thenCaption = data.thenCaption || "Coffee cups shaking, butterflies in our stomachs, talking until the café closed.";
    const nowLabel = data.nowLabel || (data.nowDate ? `NOW (${data.nowDate})` : "NOW (Present Day - 2026)");
    const nowImg = data.nowImg || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80";
    const nowCaption = data.nowCaption || "5 years of laughter, thousands of inside jokes, and a love deeper than the ocean.";
    const initialSplit = Number.isFinite(Number(data.initialSplit)) ? Math.min(100, Math.max(0, Number(data.initialSplit))) : 50;

    return `
      <section class="section then-now-slider-section" id="thenNowSection" data-split="${initialSplit}">
        <div class="container">
          <div class="then-now-slider-box">
            <div class="section-heading">
              <span class="section-tag">${escapeHtml(tag)}</span>
              <h2 class="section-title">${escapeHtml(title)}</h2>
              <p class="section-desc">${escapeHtml(desc)}</p>
            </div>

            <div class="then-now-viewport" id="thenNowContainer" tabindex="0" role="slider" aria-label="Then vs Now Image Comparison" aria-valuenow="${initialSplit}" aria-valuemin="0" aria-valuemax="100">
              <div class="then-now-layer now-layer">
                <img src="${escapeHtml(nowImg)}" alt="${escapeHtml(nowLabel)}" class="then-now-img" loading="lazy">
                <span class="then-now-badge now-badge">${escapeHtml(nowLabel)}</span>
              </div>

              <div class="then-now-layer then-layer" id="thenLayer" style="clip-path: polygon(0 0, ${initialSplit}% 0, ${initialSplit}% 100%, 0 100%);">
                <img src="${escapeHtml(thenImg)}" alt="${escapeHtml(thenLabel)}" class="then-now-img" loading="lazy">
                <span class="then-now-badge then-badge">${escapeHtml(thenLabel)}</span>
              </div>

              <div class="then-now-divider" id="thenNowDivider" style="left: ${initialSplit}%;">
                <div class="then-now-handle" aria-hidden="true">
                  <span class="then-now-handle-icon">↔</span>
                </div>
              </div>
            </div>

            <div class="then-now-captions-grid">
              <div class="then-now-caption-card then-card">
                <div class="caption-header">
                  <span class="caption-indicator then-indicator"></span>
                  <span class="caption-lead">How It Started</span>
                </div>
                <p class="caption-body">${escapeHtml(thenCaption)}</p>
              </div>

              <div class="then-now-caption-card now-card">
                <div class="caption-header">
                  <span class="caption-indicator now-indicator"></span>
                  <span class="caption-lead">How It's Going</span>
                </div>
                <p class="caption-body">${escapeHtml(nowCaption)}</p>
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
    window.WIDGET_TEMPLATES["then_now_slider"] = renderTemplate;
  }
})();
