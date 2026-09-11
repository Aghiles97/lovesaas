/**
 * Template Renderer: timeline
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
    const tag = (!isArr && data.tag) || "Our Chronological Story";
    const title = (!isArr && data.title) || "Chapters of Our Lof Story 📖";
    const desc = (!isArr && data.desc) || "Every unforgettable milestone, journey, and adventure along our path.";

    return `
    <section class="section timeline-section">
      <div class="container">
        <div class="section-heading">
          <span class="section-tag">${tag}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-desc">${desc}</p>
        </div>
        <!-- Chronological Story Timeline Cards -->
        <div class="timeline-container" id="timelineList">
          <!-- Populated dynamically via JavaScript -->
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["timeline"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
