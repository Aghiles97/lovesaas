/**
 * Template Renderer: coupons
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
    const isArr = Array.isArray(data);
    const tag = (!isArr && data.tag) ? data.tag : "Special Birthday Keepsakes";
    const title = (!isArr && data.title) ? data.title : "Sweet Lof & Birthday Coupons 🎟️🎂";
    const desc = (!isArr && data.desc) ? data.desc : "Scratch with your finger or mouse to reveal your special treat! No expiration date.";
    const restartBtnText = (!isArr && data.restartBtnText) ? data.restartBtnText : "🔄 Restart from 0";
    return `
    <section class="section coupons-section">
      <div class="container">
        <div class="section-heading">
          <span class="section-tag">${tag}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-desc">${desc}</p>
          <div class="coupons-action-bar">
            <button type="button" id="restartCouponsBtn" class="btn btn-outline btn-sm coupons-restart-btn" title="Restart coupons from 0">
              ${restartBtnText}
            </button>
          </div>
        </div>

        <div class="coupons-grid" id="couponsGrid">
          <!-- Populated dynamically with canvas scratch layers -->
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["coupons"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
