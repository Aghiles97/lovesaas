/**
 * Template Renderer: gift_unboxer
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
  const partner = rootData.partner2 || rootData.partnerName || "Sweetheart";
  const tag = data.tag || "Birthday Unwrapping 🎁";
  const title = data.title || ("A Surprise Gift For You, " + partner + "!");
  const desc = data.desc || "Untie the golden ribbon and lift the lid to reveal what is waiting inside for you.";
  const surpriseType = data.surpriseType || "coupon";
  const surpriseBadge = data.surpriseBadge || "🎉 Special Birthday Surprise";
  const surpriseTitle = data.surpriseTitle || "VIP Birthday Pass: All-Expenses Date & Dinner 🥂";
  const surpriseDesc = data.surpriseDesc || "Valid anytime, anywhere! Pack your favorite outfit for a five-star dining celebration & shopping spree.";
  const mediaUrl = data.mediaUrl || "";
  const claimBtnText = data.claimBtnText || "Claim My Birthday Gift 🎟️";
  const claimUrl = data.claimUrl || "";

  let mediaHtml = "";
  if (surpriseType === "video" && mediaUrl) {
    mediaHtml = `<div class="gift-media-preview"><video controls src="${escapeHtml(mediaUrl)}" style="width:100%; border-radius:12px;"></video></div>`;
  } else if (surpriseType === "photo" && mediaUrl) {
    mediaHtml = `<div class="gift-media-preview"><img src="${escapeHtml(mediaUrl)}" alt="Birthday Surprise" style="width:100%; border-radius:12px;" /></div>`;
  }

  return `
    <section class="section gift-unboxer-section" id="giftUnboxerSection">
      <div class="container">
        <div class="gift-unboxer-box glass-panel">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="unbox-stepper">
            <span class="unbox-step-dot active" id="dotStep1" title="Step 1: Untie Ribbon"></span>
            <span class="unbox-step-dot" id="dotStep2" title="Step 2: Open Lid"></span>
            <span class="unbox-step-dot" id="dotStep3" title="Step 3: Reveal"></span>
          </div>

          <div class="gift-stage-wrap">
            <div class="unbox-glow-rays"></div>
            <div class="gift-box-3d" id="giftBox3d">
              <div class="box-lid" id="boxLid">
                <span class="box-bow" id="boxBow">🎀</span>
              </div>
              <div class="box-body-cube">
                <div class="box-ribbon-v" id="ribbonV"></div>
                <div class="box-ribbon-h" id="ribbonH"></div>
              </div>
            </div>
          </div>

          <div class="gift-surprise-reveal" id="giftSurpriseReveal">
            <span class="gift-surprise-badge">${escapeHtml(surpriseBadge)}</span>
            <h3 class="gift-surprise-title">${escapeHtml(surpriseTitle)}</h3>
            <p class="gift-surprise-desc">${escapeHtml(surpriseDesc)}</p>
            ${mediaHtml}
            <div style="display:flex; justify-content:center; gap:12px; margin-top:20px;">
              <a href="${escapeHtml(claimUrl || '#')}" id="btnClaimGift" class="btn btn-primary btn-pulse" target="_blank" rel="noopener noreferrer">
                <span>${escapeHtml(claimBtnText)}</span>
              </a>
              <button type="button" class="btn btn-secondary" id="btnRewrapGift">
                <span>🔄 Wrap Again</span>
              </button>
            </div>
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
    window.WIDGET_TEMPLATES["gift_unboxer"] = renderTemplate;
  }
})();
