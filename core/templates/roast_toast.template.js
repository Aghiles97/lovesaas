/**
 * Template Renderer: roast_toast
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
  const tag = data.tag || "Roast or Toast 🎲";
  const title = data.title || "The Roast & Toast Birthday Spinner 🥂🔥";
  const desc = data.desc || "Spin the wheel! Will you get a playful roast or a heartfelt sentimental toast?";
  const spinBtnText = data.spinBtnText || "Spin the Wheel! 🎯";

  const defaultRoasts = [
    "🔥 Takes 45 minutes to get ready, then claims you are the one running late!",
    "🔥 Always 'just resting their eyes' 5 minutes into a movie you picked.",
    "🔥 Said 'I am not hungry' but finished half of your french fries!",
    "🔥 Has 87 open browser tabs and refuses to close a single one.",
    "🔥 Will research the restaurant menu 3 days early and still panic-order."
  ];

  const defaultToasts = [
    "🥂 The kindest, most radiant soul in every single room you enter.",
    "🥂 Cheers to the person who makes the ordinary moments feel like magic.",
    "🥂 Aging like the finest champagne—more breathtaking with every year.",
    "🥂 To your boundless generosity, infectious laugh, and golden heart.",
    "🥂 May your year ahead be as wonderfully extraordinary as you are."
  ];

  const roasts = Array.isArray(data.roasts) && data.roasts.length ? data.roasts : defaultRoasts;
  const toasts = Array.isArray(data.toasts) && data.toasts.length ? data.toasts : defaultToasts;

  return `
    <section class="section roast-toast-section" id="roastToastSection">
      <div class="container">
        <div class="roast-toast-box glass-panel">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="wheel-container">
            <div class="wheel-pointer">
              <div class="wheel-pointer-arrow"></div>
            </div>
            <canvas id="roastToastWheelCanvas" class="wheel-disc-canvas" width="600" height="600"></canvas>
            <div class="wheel-hub-center">🎲</div>
          </div>

          <div class="wheel-controls">
            <button type="button" class="btn btn-primary btn-pulse" id="btnSpinRoastToast">
              <span>${escapeHtml(spinBtnText)}</span>
            </button>
          </div>

          <div class="roast-toast-result-modal" id="roastToastResultModal">
            <span class="result-type-pill" id="resultTypePill">ROAST 🔥</span>
            <div class="result-msg-body" id="resultMsgBody">...</div>
            <button type="button" class="btn btn-outline" id="btnCloseRoastToastResult">
              <span>Spin Again 🔄</span>
            </button>
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
    window.WIDGET_TEMPLATES["roast_toast"] = renderTemplate;
  }
})();
