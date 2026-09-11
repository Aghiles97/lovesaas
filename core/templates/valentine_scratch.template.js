/**
 * Template Renderer: valentine_scratch
 * Modular Decomposed Component
 */
(function() {
  if (typeof escapeHtml !== "function") {
    if (typeof window !== "undefined") {
      window.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      };
    } else {
      global.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      };
    }
  }
  if (typeof safeVal !== "function") {
    if (typeof window !== "undefined") {
      window.safeVal = function(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); };
    } else {
      global.safeVal = function(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); };
    }
  }

  const renderTemplate = (data = {}) => {
    const d = data || {};
    const tag = d.tag || "Secret Valentine";
    const title = d.title || "Scratch to Reveal Your Date 💝";
    const desc = d.desc || "Use your finger or mouse to scratch the card and reveal your secret date itinerary!";
    const location = d.location || "A Magical Place ✨";
    const date = d.date || "Valentine's Day";
    const time = d.time || "7:00 PM";
    const dressCode = d.dressCode || "Dress to impress 💃🕺";
    const message = d.message || "I can't wait to spend this special evening with you!";
    const overlayColor = d.overlayColor || "#e84393";

    return `
    <section class="section valentine-scratch-section">
      <div class="container">
        <div class="section-heading">
          <span class="section-tag">${escapeHtml(tag)}</span>
          <h2 class="section-title">${escapeHtml(title)}</h2>
          <p class="section-desc">${escapeHtml(desc)}</p>
        </div>

        <div class="vs-card-wrap">
          <div class="vs-scratch-container" id="vsScratchContainer">
            <div class="vs-reveal-content" id="vsRevealContent">
              <div class="vs-itinerary-card">
                <div class="vs-itinerary-header">
                  <span class="vs-itinerary-badge">💌 Your Secret Date</span>
                </div>
                <div class="vs-itinerary-body">
                  <div class="vs-itinerary-row">
                    <span class="vs-itinerary-icon">📍</span>
                    <div><strong>Location</strong><br><span id="vsLocation">${escapeHtml(location)}</span></div>
                  </div>
                  <div class="vs-itinerary-row">
                    <span class="vs-itinerary-icon">📅</span>
                    <div><strong>Date</strong><br><span id="vsDate">${escapeHtml(date)}</span></div>
                  </div>
                  <div class="vs-itinerary-row">
                    <span class="vs-itinerary-icon">⏰</span>
                    <div><strong>Time</strong><br><span id="vsTime">${escapeHtml(time)}</span></div>
                  </div>
                  <div class="vs-itinerary-row">
                    <span class="vs-itinerary-icon">👗</span>
                    <div><strong>Dress Code</strong><br><span id="vsDressCode">${escapeHtml(dressCode)}</span></div>
                  </div>
                </div>
                <div class="vs-itinerary-message" id="vsMessage">${escapeHtml(message)}</div>
              </div>
            </div>
            <canvas class="vs-scratch-canvas" id="vsScratchCanvas" data-overlay-color="${safeVal(overlayColor)}"></canvas>
          </div>
          <div class="vs-progress-bar">
            <div class="vs-progress-fill" id="vsProgressFill"></div>
            <span class="vs-progress-text" id="vsProgressText">0% scratched</span>
          </div>
          <button type="button" class="btn btn-outline btn-sm vs-reset-btn" id="vsResetBtn">🔄 Reset Scratch Card</button>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["valentine_scratch"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
