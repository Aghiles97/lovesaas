/**
 * Template Renderer: playful
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
    const pl = data || {};
    const icon = pl.icon || "🙈";
    const title = pl.title || "Quick Question for You...";
    const question = pl.question || "Do you lof lof me as much as I lof lof you?";
    const yesText = pl.yesText || "YES! 1000% Lof Lof ❤️";
    const noText = pl.noText || "No 😜";

    return `
    <section class="section playful-section">
      <div class="container">
        <div class="playful-box glass-panel">
          <div class="playful-icon">${escapeHtml(icon)}</div>
          <h2 class="playful-title">${escapeHtml(title)}</h2>
          <p class="playful-question">${escapeHtml(question)}</p>
          
          <div class="playful-buttons-area" id="buttonPlayArea">
            <button id="yesBtn" class="btn btn-yes">
              <span>${escapeHtml(yesText)}</span>
            </button>
            <button id="noBtn" class="btn btn-no">
              <span>${escapeHtml(noText)}</span>
            </button>
          </div>
          <p id="teasingFeedback" class="teasing-text"></p>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["playful"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
