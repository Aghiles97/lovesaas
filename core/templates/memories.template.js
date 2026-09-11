/**
 * Template Renderer: memories
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
    const tag = (!isArr && data.tag) ? data.tag : "Captured Memories";
    const title = (!isArr && data.title) ? data.title : "Our Favorite Moments 📷";
    const desc = (!isArr && data.desc) ? data.desc : "Snapshots of our laughter, late-night talks, warm hugs, and infinite love. ✨";
    const addBtnText = (!isArr && data.addBtnText) ? data.addBtnText : "📷 Add Our Photo / Video Memory";
    return `
    <section class="section memories-section">
      <div class="container">
        <div class="section-heading">
          <span class="section-tag">${tag}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-desc">${desc}</p>
        </div>

        <div class="polaroid-grid" id="polaroidGrid">
          <!-- Populated by JavaScript -->
        </div>

        <div class="photo-action-bar">
          <button id="addMemoryBtn" class="btn btn-secondary">
            <span>${addBtnText}</span>
          </button>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["memories"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
