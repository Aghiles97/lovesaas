/**
 * Builder Inspector Module: forgiveness_meter
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["forgiveness_meter"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.forgiveness_meter) state.sectionsData.forgiveness_meter = {};
    const fm = state.sectionsData.forgiveness_meter;
    const hero = state.sectionsData.hero || {};
    const p2Def = hero.partner2 || hero.partnerName || "Ella";

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🕊️ Forgiveness Meter Settings</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Tag / Badge</label>
            <input type="text" id="fm_tag" value="${safeVal(fm.tag || "Emotional Barometer 💓")}">
          </div>
          <div class="input-group">
            <label>Section Title</label>
            <input type="text" id="fm_title" value="${safeVal(fm.title || ("Forgiveness Meter for " + p2Def))}">
          </div>
        </div>
        <div class="input-group">
          <label>Description / Instructions</label>
          <textarea id="fm_desc" rows="2">${safeVal(fm.desc || "Slide to adjust how forgiven I am today. Full forgiveness unlocks a special celebration reward!")}</textarea>
        </div>
        <div class="grid-3">
          <div class="input-group">
            <label>Min Label (0%)</label>
            <input type="text" id="fm_minLabel" value="${safeVal(fm.sliderMinLabel || "Furious 😤")}">
          </div>
          <div class="input-group">
            <label>Mid Label (50%)</label>
            <input type="text" id="fm_midLabel" value="${safeVal(fm.sliderMidLabel || "Slightly Annoyed 🙄")}">
          </div>
          <div class="input-group">
            <label>Max Label (100%)</label>
            <input type="text" id="fm_maxLabel" value="${safeVal(fm.sliderMaxLabel || "Truce 🥰")}">
          </div>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎁 Level 100 Reward Unlock</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Reward Badge</label>
            <input type="text" id="fm_rewardBadge" value="${safeVal(fm.rewardBadge || "🌟 Level 100 Peace")}">
          </div>
          <div class="input-group">
            <label>Reward Title</label>
            <input type="text" id="fm_rewardTitle" value="${safeVal(fm.rewardTitle || "Forgiveness Granted! 🎉")}">
          </div>
        </div>
        <div class="input-group">
          <label>Reward Message</label>
          <textarea id="fm_rewardMessage" rows="3">${safeVal(fm.rewardMessage || ("Thank you for choosing peace, " + p2Def + ". I love you endlessly!"))}</textarea>
        </div>
        <div class="input-group">
          <label>Reward Button Label</label>
          <input type="text" id="fm_rewardBtnText" value="${safeVal(fm.rewardBtnText || "Claim Your Reconciliation Gift 🎁")}">
        </div>
      </div>

      <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(240,253,244,0.8), rgba(255,255,255,0.9)); border: 1px dashed #10b981;">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Live Interactive Testing</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Test slider position, mood aura, and reward reveal inside preview window:</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btnTestForgive100" class="btn-builder-action" style="background: #10b981; color: white;">🎉 Set to 100% (Unlock)</button>
          <button type="button" id="btnTestForgive50" class="btn-subtle" style="font-size: 0.78rem;">⚖️ Set to 50%</button>
          <button type="button" id="btnTestForgive0" class="btn-subtle" style="font-size: 0.78rem;">🔄 Reset to 0%</button>
        </div>
      </div>
    `;

    const syncFmData = () => {
      fm.tag = document.getElementById("fm_tag").value.trim();
      fm.title = document.getElementById("fm_title").value.trim();
      fm.desc = document.getElementById("fm_desc").value.trim();
      fm.sliderMinLabel = document.getElementById("fm_minLabel").value.trim();
      fm.sliderMidLabel = document.getElementById("fm_midLabel").value.trim();
      fm.sliderMaxLabel = document.getElementById("fm_maxLabel").value.trim();
      fm.rewardBadge = document.getElementById("fm_rewardBadge").value.trim();
      fm.rewardTitle = document.getElementById("fm_rewardTitle").value.trim();
      fm.rewardMessage = document.getElementById("fm_rewardMessage").value.trim();
      fm.rewardBtnText = document.getElementById("fm_rewardBtnText").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    inspectorFormContainer.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", syncFmData);
    });

    const setLevelInPreview = (level) => {
      fm.sliderVal = level;
      debouncedLiveUpdate();
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "FORGIVENESS_SET_LEVEL", level }, "*");
        try {
          if (typeof previewIframe.contentWindow.forgivenessMeterSetLevel === "function") {
            previewIframe.contentWindow.forgivenessMeterSetLevel(level);
          }
        } catch (e) {}
      }
    };

    const b100 = document.getElementById("btnTestForgive100");
    if (b100) b100.onclick = () => setLevelInPreview(100);
    const b50 = document.getElementById("btnTestForgive50");
    if (b50) b50.onclick = () => setLevelInPreview(50);
    const b0 = document.getElementById("btnTestForgive0");
    if (b0) b0.onclick = () => setLevelInPreview(0);
  };
})();
