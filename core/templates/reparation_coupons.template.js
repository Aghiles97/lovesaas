(function() {
  const esc = (str) => {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };
  const sv = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");
  const escapeHtml = (typeof window !== "undefined" && window.escapeHtml) || (typeof global !== "undefined" && global.escapeHtml) || esc;
  const safeVal = (typeof window !== "undefined" && window.safeVal) || (typeof global !== "undefined" && global.safeVal) || sv;

  const renderTemplate = (data = {}, rootData = {}) => {
    const partner = rootData.partner2 || rootData.partnerName || "Ella";
    const tag = data.tag || "Restitution & Amends 🎟️";
    const title = data.title || "Reparation Coupons for " + partner;
    const desc = data.desc || "Scratch the surface to reveal your guaranteed compensation coupon, then mark it redeemed whenever you cash it in!";
    const defaultCoupons = [
      {
        id: "coupon_massage",
        title: "Full 30-Min Relaxation Massage",
        desc: "Complete pampering session with essential oils, soft music, and zero complaints.",
        icon: "💆‍♀️",
        badge: "Ultra Pamper",
        isRedeemed: false
      },
      {
        id: "coupon_argument",
        title: "Unconditional Argument Concession",
        desc: "Present this ticket to instantly win any debate or disagreement on the spot.",
        icon: "🏳️",
        badge: "Golden Pass",
        isRedeemed: false
      },
      {
        id: "coupon_breakfast",
        title: "VIP Breakfast in Bed",
        desc: "Fresh coffee, pastries, fruit, and breakfast favorites served directly to your bedside.",
        icon: "🥐",
        badge: "Room Service",
        isRedeemed: false
      },
      {
        id: "coupon_date_night",
        title: "Executive Date Night Decider",
        desc: "You choose the movie, the restaurant, the dessert, and the playlist. 100% your choice.",
        icon: "🎬",
        badge: "All-Access",
        isRedeemed: false
      }
    ];

    const coupons = Array.isArray(data.coupons) && data.coupons.length > 0 ? data.coupons : defaultCoupons;

    let couponsHtml = "";
    for (let i = 0; i < coupons.length; i++) {
      const c = coupons[i] || {};
      const cId = c.id || `reparation_${i + 1}`;
      const cTitle = c.title || "Reparation Coupon";
      const cDesc = c.desc || "Valid anytime, no questions asked.";
      const cIcon = c.icon || "🎁";
      const cBadge = c.badge || "VIP Voucher";
      const isRedeemed = !!c.isRedeemed;

      couponsHtml += `
        <div class="reparation-card ${isRedeemed ? 'is-redeemed' : ''}" data-coupon-id="${safeVal(cId)}" id="couponCard_${safeVal(cId)}">
          <div class="card-ticket-edge edge-left"></div>
          <div class="card-ticket-edge edge-right"></div>
          <div class="reparation-scratch-layer" id="scratchArea_${safeVal(cId)}">
            <div class="underlying-reward-content">
              <span class="reward-pill-badge">${escapeHtml(cBadge)}</span>
              <div class="reward-icon">${cIcon}</div>
              <h3 class="reward-title">${escapeHtml(cTitle)}</h3>
              <p class="reward-desc">${escapeHtml(cDesc)}</p>
            </div>
            <canvas class="reparation-scratch-canvas" id="canvas_${safeVal(cId)}" data-coupon-id="${safeVal(cId)}"></canvas>
          </div>

          <div class="claimed-stamp-overlay ${isRedeemed ? 'active' : ''}" id="claimedStamp_${safeVal(cId)}">
            <span class="stamp-box">CLAIMED ✓</span>
          </div>

          <div class="reparation-card-footer">
            <button type="button" class="btn-redeem-stamp btn btn-sm ${isRedeemed ? 'btn-outline' : 'btn-primary'}" data-coupon-id="${safeVal(cId)}" id="btnRedeem_${safeVal(cId)}">
              <span>${isRedeemed ? '✓ Redeemed' : 'Mark as Claimed'}</span>
            </button>
          </div>
        </div>`;
    }

    return `
    <section class="section reparation-coupons-section" id="reparationCouponsSection">
      <div class="container">
        <div class="reparation-coupons-panel glass-panel">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="reparation-toolbar">
            <button type="button" class="btn btn-outline btn-sm" id="btnResetReparations">
              <span>🔄 Reset Scratch Surfaces</span>
            </button>
          </div>

          <div class="reparation-coupons-grid" id="reparationCouponsGrid">
            ${couponsHtml}
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
    window.WIDGET_TEMPLATES["reparation_coupons"] = renderTemplate;
  }
})();
