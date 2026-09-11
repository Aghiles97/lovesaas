/**
 * Builder Inspector Module: coupons
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["coupons"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

if (!state.sectionsData.coupons) {
        state.sectionsData.coupons = {
          tag: "Special Birthday Keepsakes",
          title: "Sweet Lof & Birthday Coupons 🎟️🎂",
          desc: "Scratch with your finger or mouse to reveal your special treat! No expiration date.",
          restartBtnText: "🔄 Restart from 0",
          items: []
        };
      } else if (Array.isArray(state.sectionsData.coupons)) {
        state.sectionsData.coupons = {
          tag: "Special Birthday Keepsakes",
          title: "Sweet Lof & Birthday Coupons 🎟️🎂",
          desc: "Scratch with your finger or mouse to reveal your special treat! No expiration date.",
          restartBtnText: "🔄 Restart from 0",
          items: state.sectionsData.coupons
        };
      }
      const cObj = state.sectionsData.coupons;
      if (!Array.isArray(cObj.items)) cObj.items = [];
      const coupons = cObj.items;

      let listHtml = "";
      coupons.forEach((c, idx) => {
        listHtml += `
          <div class="item-editor-card" data-idx="${idx}">
            <div class="item-editor-header">
              <span class="item-editor-title">🎟️ Coupon #${idx + 1}</span>
              <div style="display: flex; gap: 4px; align-items: center;">
                <button type="button" class="btn-subtle" data-move-coupon="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
                <button type="button" class="btn-subtle" data-move-coupon="${idx}" data-dir="1" title="Move later" ${idx === coupons.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
                <button type="button" class="btn-remove-item" data-remove-coupon="${idx}">🗑️</button>
              </div>
            </div>
            <div class="grid-3">
              <div class="input-group">
                <label>Icon</label>
                <input type="text" class="coupon-icon-input" value="${safeVal(c.icon || '🎁')}">
              </div>
              <div class="input-group">
                <label>Pass Badge</label>
                <input type="text" class="coupon-badge-input" value="${safeVal(c.badge || 'Coupon Pass')}">
              </div>
              <div class="input-group">
                <label>Voucher Title</label>
                <input type="text" class="coupon-title-input" value="${safeVal(c.title || '')}">
              </div>
            </div>
            <div class="input-group">
              <label>Voucher Terms / Description</label>
              <textarea class="coupon-desc-input" rows="2">${safeVal(c.sub || c.desc || '')}</textarea>
            </div>
          </div>
        `;
      });

      inspectorFormContainer.innerHTML = `
        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🎟️ Section Heading & Controls</span>
          </div>
          <div class="input-group">
            <label>Section Tag</label>
            <input type="text" id="coupon_tag" value="${safeVal(cObj.tag || "Special Birthday Keepsakes")}">
          </div>
          <div class="input-group">
            <label>Section Title</label>
            <input type="text" id="coupon_title" value="${safeVal(cObj.title || "Sweet Lof & Birthday Coupons 🎟️🎂")}">
          </div>
          <div class="input-group">
            <label>Section Description</label>
            <textarea id="coupon_desc" rows="2">${safeVal(cObj.desc || "Scratch with your finger or mouse to reveal your special treat! No expiration date.")}</textarea>
          </div>
          <div class="input-group">
            <label>Restart Button Label</label>
            <input type="text" id="coupon_restartBtnText" value="${safeVal(cObj.restartBtnText || "🔄 Restart from 0")}">
          </div>
        </div>

        <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(255,240,245,0.8), rgba(255,255,255,0.9)); border: 1px dashed var(--primary);">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🪄 Live Interactive Test Controls</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Test scratch-off foil and claim vouchers inside the live preview window:</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" id="btnCouponsScratchAll" class="btn-subtle" style="font-size: 0.78rem;">🪄 Scratch & Reveal All</button>
            <button type="button" id="btnCouponsReset" class="btn-subtle" style="font-size: 0.78rem;">🔄 Reset All to 0</button>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🎫 Love Vouchers (${coupons.length})</span>
          </div>
          <div id="couponsListContainer">${listHtml}</div>
          <button type="button" id="btnAddCoupon" class="btn-add-item" style="margin-top: 10px;">➕ Add Love Coupon Voucher</button>
        </div>
      `;

      // Header bindings
      document.getElementById("coupon_tag").oninput = (e) => { cObj.tag = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("coupon_title").oninput = (e) => { cObj.title = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("coupon_desc").oninput = (e) => { cObj.desc = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("coupon_restartBtnText").oninput = (e) => { cObj.restartBtnText = e.target.value; debouncedLiveUpdate(); };

      // Live test controls
      document.getElementById("btnCouponsScratchAll").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "COUPONS_SCRATCH_ALL" }, "*");
        }
      };
      document.getElementById("btnCouponsReset").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "COUPONS_RESET" }, "*");
        }
      };

      // Item bindings
      document.querySelectorAll("#couponsListContainer .item-editor-card").forEach(card => {
        const idx = parseInt(card.dataset.idx, 10);
        card.querySelector(".coupon-icon-input").oninput = (e) => { coupons[idx].icon = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(".coupon-badge-input").oninput = (e) => { coupons[idx].badge = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(".coupon-title-input").oninput = (e) => { coupons[idx].title = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(".coupon-desc-input").oninput = (e) => {
          coupons[idx].sub = e.target.value;
          coupons[idx].desc = e.target.value;
          debouncedLiveUpdate();
        };
        card.querySelector(`[data-remove-coupon="${idx}"]`).onclick = () => {
          coupons.splice(idx, 1);
          renderWidgetInspector("coupons");
          debouncedLiveUpdate();
        };
      });

      // Move controls
      document.querySelectorAll("[data-move-coupon]").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.moveCoupon, 10);
          const dir = parseInt(btn.dataset.dir, 10);
          const target = idx + dir;
          if (target >= 0 && target < coupons.length) {
            const [moved] = coupons.splice(idx, 1);
            coupons.splice(target, 0, moved);
            renderWidgetInspector("coupons");
            debouncedLiveUpdate();
          }
        };
      });

      document.getElementById("btnAddCoupon").onclick = () => {
        coupons.push({
          id: "c-" + Date.now(),
          icon: "🎟️",
          badge: "Special Pass",
          title: "New Love Voucher",
          sub: "Valid anytime, forever redeemable with hugs!",
          desc: "Valid anytime, forever redeemable with hugs!"
        });
        renderWidgetInspector("coupons");
        debouncedLiveUpdate();
      };
  };
})();
