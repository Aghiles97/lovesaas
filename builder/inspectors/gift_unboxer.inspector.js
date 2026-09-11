/**
 * Builder Inspector Module: gift_unboxer
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["gift_unboxer"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    
    if (!state.sectionsData.gift_unboxer) state.sectionsData.gift_unboxer = {};
    const gu = state.sectionsData.gift_unboxer;
    const hero = state.sectionsData.hero || {};
    const p2Def = hero.partner2 || hero.partnerName || "Sweetheart";

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎁 Gift Unboxer Header</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="gu_tag" value="${safeVal(gu.tag || "Birthday Unwrapping 🎁")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="gu_title" value="${safeVal(gu.title || ("A Surprise Gift For You, " + p2Def + "!"))}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="gu_desc" rows="2">${safeVal(gu.desc || "Untie the golden ribbon and lift the lid to reveal what is waiting inside for you.")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">✨ Hidden Surprise Content</span>
        </div>
        <div class="input-group">
          <label>Surprise Type</label>
          <select id="gu_surpriseType">
            <option value="coupon" ${gu.surpriseType === 'coupon' || !gu.surpriseType ? 'selected' : ''}>🎟️ Gift Coupon / Voucher</option>
            <option value="video" ${gu.surpriseType === 'video' ? 'selected' : ''}>🎬 Surprise Video</option>
            <option value="photo" ${gu.surpriseType === 'photo' ? 'selected' : ''}>📸 Photo / Memory</option>
          </select>
        </div>
        <div class="input-group">
          <label>Surprise Badge</label>
          <input type="text" id="gu_surpriseBadge" value="${safeVal(gu.surpriseBadge || "🎉 Special Birthday Surprise")}">
        </div>
        <div class="input-group">
          <label>Surprise Title</label>
          <input type="text" id="gu_surpriseTitle" value="${safeVal(gu.surpriseTitle || "VIP Birthday Pass: All-Expenses Date & Dinner 🥂")}">
        </div>
        <div class="input-group">
          <label>Surprise Description / Voucher Text</label>
          <textarea id="gu_surpriseDesc" rows="3">${safeVal(gu.surpriseDesc || "Valid anytime, anywhere! Pack your favorite outfit for a five-star dining celebration & shopping spree.")}</textarea>
        </div>
        <div class="input-group">
          <label>Media URL (Video or Photo URL)</label>
          <input type="text" id="gu_mediaUrl" value="${safeVal(gu.mediaUrl || "")}" placeholder="https://... or video.mp4">
        </div>
        <div class="input-group">
          <label>Claim Button Label</label>
          <input type="text" id="gu_claimBtnText" value="${safeVal(gu.claimBtnText || "Claim My Birthday Gift 🎟️")}">
        </div>
        <div class="input-group">
          <label>Claim Action URL (WhatsApp link, coupon URL)</label>
          <input type="text" id="gu_claimUrl" value="${safeVal(gu.claimUrl || "")}" placeholder="https://wa.me/...">
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Unboxing Animation Controls</span>
        </div>
        <div class="grid-2">
          <button type="button" class="btn-builder-action" id="btnTestUnboxStep">📦 Next Unbox Stage</button>
          <button type="button" class="btn-builder-action" id="btnTestRewrap">🔄 Wrap Box Again</button>
        </div>
      </div>
    `;

    function syncGiftData() {
      gu.tag = document.getElementById("gu_tag").value.trim();
      gu.title = document.getElementById("gu_title").value.trim();
      gu.desc = document.getElementById("gu_desc").value.trim();
      gu.surpriseType = document.getElementById("gu_surpriseType").value;
      gu.surpriseBadge = document.getElementById("gu_surpriseBadge").value.trim();
      gu.surpriseTitle = document.getElementById("gu_surpriseTitle").value.trim();
      gu.surpriseDesc = document.getElementById("gu_surpriseDesc").value.trim();
      gu.mediaUrl = document.getElementById("gu_mediaUrl").value.trim();
      gu.claimBtnText = document.getElementById("gu_claimBtnText").value.trim();
      gu.claimUrl = document.getElementById("gu_claimUrl").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }

    inspectorFormContainer.querySelectorAll("input, textarea, select").forEach(el => {
      el.addEventListener("input", syncGiftData);
      el.addEventListener("change", syncGiftData);
    });

    const btnStep = document.getElementById("btnTestUnboxStep");
    if (btnStep) {
      btnStep.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "UNBOX_STEP" }, window.location.origin);
          try { previewIframe.contentWindow.unboxGiftStep?.(); } catch (e) {}
        }
      };
    }
    const btnRewrap = document.getElementById("btnTestRewrap");
    if (btnRewrap) {
      btnRewrap.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "UNBOX_RESET" }, window.location.origin);
          try { previewIframe.contentWindow.unboxGiftReset?.(); } catch (e) {}
        }
      };
    }

  };
})();
