/**
 * Template Renderer: quiz
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
    const qz = Array.isArray(data) ? { items: data } : (data || {});
    const tag = qz.tag || "Couples Trivia Challenge";
    const title = qz.title || "How Well Do You Know Our Lof Story? 🧠💖";
    const desc = qz.desc || "Answer sweet questions about our trips and memories to earn your Certificate of Infinite Lof!";

    return `
    <section class="section quiz-section">
      <div class="container">
        <div class="quiz-box glass-panel">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div id="quizContainer" class="quiz-card">
            <!-- Populated by JavaScript -->
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["quiz"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
