/**
 * Builder Inspector Module: candle_blowout
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["candle_blowout"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    
    if (!state.sectionsData.candle_blowout) state.sectionsData.candle_blowout = {};
    const cb = state.sectionsData.candle_blowout;
    const hero = state.sectionsData.hero || {};
    const p2Def = hero.partner2 || hero.partnerName || "Birthday Star";

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎂 Cake & Header Settings</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="cb_tag" value="${safeVal(cb.tag || "Make a Birthday Wish 🎂")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="cb_title" value="${safeVal(cb.title || ("Blow Out the Birthday Candles, " + p2Def + "! ✨"))}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="cb_desc" rows="2">${safeVal(cb.desc || "Make a secret wish in your heart, then tap to blow or blow directly into your microphone!")}</textarea>
        </div>
        <div class="input-group">
          <label>Number of Candles (1 to 10)</label>
          <input type="number" id="cb_candleCount" min="1" max="10" value="${cb.candleCount || 5}">
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🌟 Secret Birthday Wish Reveal</span>
        </div>
        <div class="input-group">
          <label>Wish Card Badge</label>
          <input type="text" id="cb_wishBadge" value="${safeVal(cb.wishBadge || "🌟 Secret Wish Unlocked")}">
        </div>
        <div class="input-group">
          <label>Wish Card Title</label>
          <input type="text" id="cb_wishTitle" value="${safeVal(cb.wishTitle || "Your Birthday Wish is Coming True!")}">
        </div>
        <div class="input-group">
          <label>Wish Message Content</label>
          <textarea id="cb_wishText" rows="3">${safeVal(cb.wishText || ("May this year bring you boundless happiness, thrilling adventures, and all the love in the universe, " + p2Def + "! 💖"))}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Controls & Testing</span>
        </div>
        <div class="grid-2">
          <button type="button" class="btn-builder-action" id="btnTestBlowAll">💨 Blow All Candles</button>
          <button type="button" class="btn-builder-action" id="btnTestRelightAll">🔥 Relight Candles</button>
        </div>
      </div>
    `;

    function syncCandleData() {
      cb.tag = document.getElementById("cb_tag").value.trim();
      cb.title = document.getElementById("cb_title").value.trim();
      cb.desc = document.getElementById("cb_desc").value.trim();
      cb.candleCount = parseInt(document.getElementById("cb_candleCount").value, 10) || 5;
      cb.wishBadge = document.getElementById("cb_wishBadge").value.trim();
      cb.wishTitle = document.getElementById("cb_wishTitle").value.trim();
      cb.wishText = document.getElementById("cb_wishText").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }

    inspectorFormContainer.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", syncCandleData);
    });

    const btnBlow = document.getElementById("btnTestBlowAll");
    if (btnBlow) {
      btnBlow.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "CANDLE_BLOW_ALL" }, "*");
          try { previewIframe.contentWindow.candleBlowoutBlowAll?.(); } catch (e) {}
        }
      };
    }

    const btnRelight = document.getElementById("btnTestRelightAll");
    if (btnRelight) {
      btnRelight.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "CANDLE_RELIGHT" }, "*");
          try { previewIframe.contentWindow.candleBlowoutRelight?.(); } catch (e) {}
        }
      };
    }

  };
})();
