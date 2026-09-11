/**
 * Template Renderer: spinner
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

  const renderTemplate = (data = {}, rootData = {}) => {
    const p1 = rootData.partner1 || "Aghiles";
    const p2 = rootData.partner2 || "Ela";
    const tag = data.tag || "Long Distance & Virtual Dates";
    const title = data.title || "Long-Distance Date Night Spinner 🎡";
    const desc = data.desc || `Spin the reels to pick our next virtual date night—bridging our worlds with lof!`;

    const reel1Label = data.reel1Label || "🍽️ Virtual Dinner / Food";
    const reel2Label = data.reel2Label || "🎮 Long-Distance Activity";
    const reel3Label = data.reel3Label || "🍨 Sweet Treat";

    const initialFood = (data.foods && data.foods[0]) || "🍕 Cheesy Local Pizza & Fries Night";
    const initialAct = (data.activities && data.activities[0]) || "🎬 Synced Movie Night & FaceTime Call";
    const initialDessert = (data.desserts && data.desserts[0]) || "🥞 Warm Crepes or Waffles with Nutella";

    const spinBtnText = data.spinBtnText || "Spin Date Idea! 🎲";
    const lockBtnText = data.lockBtnText || "Lock In Date & Claim Pass 🎟️";
    const shareWhatsAppBtnText = data.shareWhatsAppBtnText || `📲 Send Date to ${p1} on WhatsApp 💬`;
    const lockAlertText = data.lockAlertText || "It's a date! Screenshot this and send it to me! 💕";

    return `
    <section class="section roulette-section" id="dateNightSpinnerSection">
      <div class="container">
        <div class="roulette-box glass-panel">
          <div class="section-heading">
            <span class="section-tag">${tag}</span>
            <h2 class="section-title">${title}</h2>
            <p class="section-desc">${desc}</p>
          </div>

          <div class="spinner-reels-grid">
            <div class="reel-box">
              <span class="reel-label">${reel1Label}</span>
              <div class="reel-window">
                <div id="reelFood" class="reel-strip">${initialFood}</div>
              </div>
            </div>
            <div class="reel-box">
              <span class="reel-label">${reel2Label}</span>
              <div class="reel-window">
                <div id="reelActivity" class="reel-strip">${initialAct}</div>
              </div>
            </div>
            <div class="reel-box">
              <span class="reel-label">${reel3Label}</span>
              <div class="reel-window">
                <div id="reelDessert" class="reel-strip">${initialDessert}</div>
              </div>
            </div>
          </div>

          <div class="roulette-actions">
            <button id="spinDateBtn" class="btn btn-primary btn-pulse">
              <span>${spinBtnText}</span>
            </button>
            <button id="lockDateBtn" class="btn btn-secondary">
              <span>${lockBtnText}</span>
            </button>
            <a id="shareDateWhatsAppBtn" class="btn btn-whatsapp hidden" target="_blank" rel="noopener noreferrer">
              <span>${shareWhatsAppBtnText}</span>
            </a>
          </div>

          <div id="dateLockAlert" class="date-lock-alert hidden">
            <span class="alert-icon">🎉</span>
            <span id="dateLockText" class="alert-text">${lockAlertText}</span>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["spinner"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
