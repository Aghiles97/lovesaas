/**
 * Template Renderer: love_meter
 * Modular Decomposed Component
 */
(function() {
  if (typeof escapeHtml !== "function") {
    if (typeof window !== "undefined") {
      window.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };
    } else {
      global.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };
    }
  }
  if (typeof safeVal !== "function") {
    if (typeof window !== "undefined") {
      window.safeVal = function(v) {
        return String(v == null ? "" : v).replace(/"/g, "&quot;");
      };
    } else {
      global.safeVal = function(v) {
        return String(v == null ? "" : v).replace(/"/g, "&quot;");
      };
    }
  }

  const renderTemplate = (data = {}) => {
    const title = data.title || "The Real-Time Lof-O-Meter 📈";
    const desc = data.desc || "Pump to add quintillions more lof until we break the laws of physics!";
    const tag = data.tag || "Infinite Measurement";
    const baseNumber = data.baseNumber || "9,847,293,847,192,840,320";
    const statusText = data.statusText || "Lof Level: Exploding ❤️";
    const pumpBtnText = data.pumpBtnText || "Pump Lof Lof! 💖 (+500 Quadrillion)";
    const kissBtnText = data.kissBtnText || "Send Kiss Kiss 💋";
    const hugBtnText = data.hugBtnText || "Send Hug Hug 🤗";
    const resetBtnText = data.resetBtnText || "Reset";

    return `
    <section class="section love-meter-section">
      <div class="container">
        <div class="meter-box glass-panel" id="meterBoxContainer">
          <div class="section-heading">
            <span class="section-tag">${tag}</span>
            <h2 class="section-title">${title}</h2>
            <p class="section-desc">${desc}</p>
          </div>

          <div class="meter-display-wrap">
            <div class="meter-bar-track">
              <div id="meterFill" class="meter-bar-fill" style="width: 20%;"></div>
            </div>
            <div class="meter-number-row">
              <span id="meterQuintillionNumber" class="meter-number">${baseNumber}</span>
              <span id="meterStatus" class="meter-status" data-orig-text="${statusText}">${statusText}</span>
            </div>
          </div>

          <div class="meter-actions">
            <button id="pumpMeterBtn" class="btn btn-primary btn-pulse" data-orig-text="${pumpBtnText}">
              <span>${pumpBtnText}</span>
            </button>
            <button id="kissKissBtn" class="btn btn-secondary" data-orig-text="${kissBtnText}">
              <span>${kissBtnText}</span>
            </button>
            <button id="hugHugBtn" class="btn btn-secondary" data-orig-text="${hugBtnText}">
              <span>${hugBtnText}</span>
            </button>
            <button id="resetMeterBtn" class="btn btn-outline btn-sm">${resetBtnText}</button>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["love_meter"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
