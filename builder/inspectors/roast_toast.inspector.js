/**
 * Builder Inspector Module: roast_toast
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["roast_toast"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    
    if (!state.sectionsData.roast_toast) state.sectionsData.roast_toast = {};
    const rt = state.sectionsData.roast_toast;

    const defaultRoasts = [
      "🔥 Takes 45 minutes to get ready, then claims you are the one running late!",
      "🔥 Always 'just resting their eyes' 5 minutes into a movie you picked.",
      "🔥 Said 'I am not hungry' but finished half of your french fries!",
      "🔥 Has 87 open browser tabs and refuses to close a single one."
    ];
    const defaultToasts = [
      "🥂 The kindest, most radiant soul in every single room you enter.",
      "🥂 Cheers to the person who makes the ordinary moments feel like magic.",
      "🥂 Aging like the finest champagne—more breathtaking with every year.",
      "🥂 To your boundless generosity, infectious laugh, and golden heart."
    ];

    const roastsStr = (Array.isArray(rt.roasts) && rt.roasts.length ? rt.roasts : defaultRoasts).join("\n");
    const toastsStr = (Array.isArray(rt.toasts) && rt.toasts.length ? rt.toasts : defaultToasts).join("\n");

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🥂 Header & Controls</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="rt_tag" value="${safeVal(rt.tag || "Roast or Toast 🎲")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="rt_title" value="${safeVal(rt.title || "The Roast & Toast Birthday Spinner 🥂🔥")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="rt_desc" rows="2">${safeVal(rt.desc || "Spin the wheel! Will you get a playful roast or a heartfelt sentimental toast?")}</textarea>
        </div>
        <div class="input-group">
          <label>Spin Button Label</label>
          <input type="text" id="rt_spinBtnText" value="${safeVal(rt.spinBtnText || "Spin the Wheel! 🎯")}">
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🔥 Funny Roasts (One Per Line)</span>
        </div>
        <div class="input-group">
          <textarea id="rt_roasts" rows="4">${safeVal(roastsStr)}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🥂 Sentimental Toasts (One Per Line)</span>
        </div>
        <div class="input-group">
          <textarea id="rt_toasts" rows="4">${safeVal(toastsStr)}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <button type="button" class="btn-builder-action" id="btnTestSpinWheel">🎲 Test Spin Wheel</button>
      </div>
    `;

    function syncRoastToastData() {
      rt.tag = document.getElementById("rt_tag").value.trim();
      rt.title = document.getElementById("rt_title").value.trim();
      rt.desc = document.getElementById("rt_desc").value.trim();
      rt.spinBtnText = document.getElementById("rt_spinBtnText").value.trim();
      rt.roasts = document.getElementById("rt_roasts").value.split("\n").map(s => s.trim()).filter(Boolean);
      rt.toasts = document.getElementById("rt_toasts").value.split("\n").map(s => s.trim()).filter(Boolean);

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }

    inspectorFormContainer.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", syncRoastToastData);
    });

    const btnSpin = document.getElementById("btnTestSpinWheel");
    if (btnSpin) {
      btnSpin.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "ROAST_TOAST_SPIN" }, "*");
          try { previewIframe.contentWindow.roastToastSpin?.(); } catch (e) {}
        }
      };
    }

  };
})();
