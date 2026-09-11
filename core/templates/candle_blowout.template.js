/**
 * Template Renderer: candle_blowout
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
  const partner = rootData.partner2 || rootData.partnerName || "Birthday Star";
  const tag = data.tag || "Make a Birthday Wish 🎂";
  const title = data.title || ("Blow Out the Birthday Candles, " + partner + "! ✨");
  const desc = data.desc || "Make a secret wish in your heart, then tap to blow or blow directly into your microphone!";
  const count = Math.max(1, Math.min(10, Number(data.candleCount) || 5));
  const wishBadge = data.wishBadge || "🌟 Secret Wish Unlocked";
  const wishTitle = data.wishTitle || "Your Birthday Wish is Coming True!";
  const wishText = data.wishText || ("May this year bring you boundless happiness, thrilling adventures, and all the love in the universe, " + partner + "! 💖");
  const micBtnText = data.micBtnText || "🎙️ Blow via Mic";
  const clickBtnText = data.clickBtnText || "💨 Blow Candles (Click)";
  const relightBtnText = data.relightBtnText || "🔥 Relight Candles";

  let candlesHtml = "";
  for (let i = 0; i < count; i++) {
    candlesHtml += `
      <div class="cake-candle" data-candle-idx="${i}" title="Click to blow out">
        <div class="candle-flame"></div>
        <div class="candle-wick"></div>
        <div class="smoke-puff"></div>
      </div>`;
  }

  return `
    <section class="section candle-blowout-section" id="candleBlowoutSection">
      <div class="container">
        <div class="candle-blowout-card glass-panel">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="cake-stage">
            <div class="cake-body">
              <div class="candles-row" id="cakeCandlesRow">
                ${candlesHtml}
              </div>
              <div class="cake-tier top">
                <div class="icing-drip"></div>
                <div class="frosting-piping">
                  <span class="frosting-dot"></span>
                  <span class="frosting-dot"></span>
                  <span class="frosting-dot"></span>
                  <span class="frosting-dot"></span>
                </div>
              </div>
              <div class="cake-tier bottom">
                <div class="icing-drip"></div>
                <div class="frosting-piping">
                  <span class="frosting-dot"></span>
                  <span class="frosting-dot"></span>
                  <span class="frosting-dot"></span>
                  <span class="frosting-dot"></span>
                  <span class="frosting-dot"></span>
                </div>
              </div>
            </div>
            <div class="cake-stand"></div>
          </div>

          <div class="blow-controls">
            <div class="mic-meter-wrap" id="micMeterWrap">
              <div class="mic-meter-bar" id="micMeterBar"></div>
            </div>
            <div class="blow-buttons-row">
              <button type="button" class="btn btn-primary" id="btnBlowCandlesClick">
                <span>${escapeHtml(clickBtnText)}</span>
              </button>
              <button type="button" class="btn btn-secondary" id="btnBlowCandlesMic">
                <span>${escapeHtml(micBtnText)}</span>
              </button>
              <button type="button" class="btn btn-outline hidden" id="btnRelightCandles">
                <span>${escapeHtml(relightBtnText)}</span>
              </button>
            </div>
          </div>

          <div class="wish-reveal-card" id="wishRevealCard">
            <span class="wish-card-badge">${escapeHtml(wishBadge)}</span>
            <h3 class="wish-card-title">${escapeHtml(wishTitle)}</h3>
            <p class="wish-card-text">${escapeHtml(wishText)}</p>
            <button type="button" class="btn btn-primary btn-pulse" id="btnCelebrationConfetti">
              <span>🎉 Celebrate with Confetti!</span>
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
    window.WIDGET_TEMPLATES["candle_blowout"] = renderTemplate;
  }
})();
