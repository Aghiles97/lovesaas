/**
 * Builder Inspector Module: reparation_coupons
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["reparation_coupons"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.reparation_coupons) state.sectionsData.reparation_coupons = {};
    const rc = state.sectionsData.reparation_coupons;
    const hero = state.sectionsData.hero || {};
    const p2Def = hero.partner2 || hero.partnerName || "Ella";

    if (!Array.isArray(rc.coupons)) {
      rc.coupons = [
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
    }
    const coupons = rc.coupons;

    let couponsHtml = "";
    coupons.forEach((c, idx) => {
      couponsHtml += `
        <div class="item-editor-card" data-idx="${idx}" style="margin-bottom: 12px;">
          <div class="item-editor-header">
            <span class="item-editor-title">🎟️ Coupon #${idx + 1}: ${safeVal(c.title || 'Voucher')}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button type="button" class="btn-subtle" data-move-coupon="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
              <button type="button" class="btn-subtle" data-move-coupon="${idx}" data-dir="1" title="Move later" ${idx === coupons.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
              <button type="button" class="btn-remove-item" data-remove-coupon="${idx}">🗑️</button>
            </div>
          </div>
          <div class="grid-3" style="margin-top: 6px;">
            <div class="input-group">
              <label>Icon</label>
              <input type="text" class="rc-icon-input" value="${safeVal(c.icon || '🎟️')}">
            </div>
            <div class="input-group">
              <label>Badge</label>
              <input type="text" class="rc-badge-input" value="${safeVal(c.badge || 'VIP Voucher')}">
            </div>
            <div class="input-group">
              <label>Coupon Title</label>
              <input type="text" class="rc-title-input" value="${safeVal(c.title || '')}">
            </div>
          </div>
          <div class="input-group" style="margin-top: 6px;">
            <label>Description / Terms</label>
            <textarea class="rc-desc-input" rows="2" placeholder="Describe the reparation...">${safeVal(c.desc || '')}</textarea>
          </div>
          <div style="margin-top: 6px; display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 0.8rem; display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" class="rc-redeemed-checkbox" ${c.isRedeemed ? 'checked' : ''}>
              <span>Mark as Claimed / Redeemed</span>
            </label>
          </div>
        </div>
      `;
    });

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎟️ Reparation Coupons Settings</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Tag / Badge</label>
            <input type="text" id="rc_tag" value="${safeVal(rc.tag || "Restitution & Amends 🎟️")}">
          </div>
          <div class="input-group">
            <label>Section Title</label>
            <input type="text" id="rc_title" value="${safeVal(rc.title || ("Reparation Coupons for " + p2Def))}">
          </div>
        </div>
        <div class="input-group">
          <label>Description / Instructions</label>
          <textarea id="rc_desc" rows="2">${safeVal(rc.desc || "Scratch the surface to reveal your guaranteed compensation coupon, then mark it redeemed whenever you cash it in!")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(254,243,199,0.6), rgba(255,255,255,0.9)); border: 1px dashed #f59e0b;">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Interactive Scratch Testing</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Test scratch-off foil and redeem stamps inside live preview window:</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btnTestScratchAll" class="btn-builder-action" style="background: #f59e0b; color: #78350f; font-weight: 700;">🪄 Scratch & Reveal All</button>
          <button type="button" id="btnTestResetScratch" class="btn-subtle" style="font-size: 0.78rem;">🔄 Reset Scratch Foil</button>
          <button type="button" id="btnTestResetClaims" class="btn-subtle" style="font-size: 0.78rem;">🏷️ Unclaim All</button>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎫 Reparation Vouchers (${coupons.length})</span>
        </div>
        <div id="reparationCouponsContainer">${couponsHtml}</div>
        <button type="button" id="btnAddReparationCoupon" class="btn-add-item" style="margin-top: 10px;">➕ Add Reparation Coupon</button>
      </div>
    `;

    const syncRcHeaders = () => {
      rc.tag = document.getElementById("rc_tag").value.trim();
      rc.title = document.getElementById("rc_title").value.trim();
      rc.desc = document.getElementById("rc_desc").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    ["rc_tag", "rc_title", "rc_desc"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", syncRcHeaders);
    });

    document.querySelectorAll("#reparationCouponsContainer .item-editor-card").forEach(card => {
      const idx = parseInt(card.dataset.idx, 10);
      const iconInp = card.querySelector(".rc-icon-input");
      const badgeInp = card.querySelector(".rc-badge-input");
      const titleInp = card.querySelector(".rc-title-input");
      const descInp = card.querySelector(".rc-desc-input");
      const redChk = card.querySelector(".rc-redeemed-checkbox");

      const updateItem = () => {
        coupons[idx].icon = iconInp.value;
        coupons[idx].badge = badgeInp.value;
        coupons[idx].title = titleInp.value;
        coupons[idx].desc = descInp.value;
        coupons[idx].isRedeemed = !!redChk.checked;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };

      [iconInp, badgeInp, titleInp, descInp].forEach(inp => {
        if (inp) inp.addEventListener("input", updateItem);
      });
      if (redChk) redChk.addEventListener("change", updateItem);

      const remBtn = card.querySelector(`[data-remove-coupon="${idx}"]`);
      if (remBtn) {
        remBtn.onclick = () => {
          coupons.splice(idx, 1);
          renderWidgetInspector("reparation_coupons");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        };
      }
    });

    document.querySelectorAll("[data-move-coupon]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.moveCoupon, 10);
        const dir = parseInt(btn.dataset.dir, 10);
        const target = idx + dir;
        if (target >= 0 && target < coupons.length) {
          const [moved] = coupons.splice(idx, 1);
          coupons.splice(target, 0, moved);
          renderWidgetInspector("reparation_coupons");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        }
      };
    });

    const btnAdd = document.getElementById("btnAddReparationCoupon");
    if (btnAdd) {
      btnAdd.onclick = () => {
        coupons.push({
          id: "rep_" + Date.now(),
          title: "Peace Offering: Warm Hugs on Demand",
          desc: "Good for unlimited cuddles and a cup of favorite tea, valid anytime forever.",
          icon: "🤗",
          badge: "Unconditional",
          isRedeemed: false
        });
        renderWidgetInspector("reparation_coupons");
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
    }

    // Testing triggers
    const btnScratchAll = document.getElementById("btnTestScratchAll");
    if (btnScratchAll) {
      btnScratchAll.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "REPARATION_SCRATCH_ALL" }, "*");
          try { previewIframe.contentWindow.reparationCouponsScratchAll?.(); } catch (e) {}
        }
      };
    }

    const btnResetScratch = document.getElementById("btnTestResetScratch");
    if (btnResetScratch) {
      btnResetScratch.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "REPARATION_RESET_ALL" }, "*");
          try { previewIframe.contentWindow.reparationCouponsResetAll?.(); } catch (e) {}
        }
      };
    }

    const btnResetClaims = document.getElementById("btnTestResetClaims");
    if (btnResetClaims) {
      btnResetClaims.onclick = () => {
        coupons.forEach(c => { c.isRedeemed = false; });
        renderWidgetInspector("reparation_coupons");
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "REPARATION_RESET_CLAIMS" }, "*");
        }
      };
    }
  };
})();
