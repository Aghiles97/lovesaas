/**
 * Builder Inspector Module: love_meter
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["love_meter"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

if (!state.sectionsData.love_meter) state.sectionsData.love_meter = {};
      const lm = state.sectionsData.love_meter;
      inspectorFormContainer.innerHTML = `
        <div class="grid-2">
          <div class="input-group">
            <label>Meter Section Title</label>
            <input type="text" id="lm_title" value="${lm.title || 'The Real-Time Lof-O-Meter 📈'}">
          </div>
          <div class="input-group">
            <label>Tag / Badge</label>
            <input type="text" id="lm_tag" value="${lm.tag || 'Infinite Measurement'}">
          </div>
        </div>
        <div class="input-group">
          <label>Description / Instructions</label>
          <textarea id="lm_desc">${lm.desc || 'Pump to add quintillions more lof until we break the laws of physics!'}</textarea>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Base Quintillion Display</label>
            <input type="text" id="lm_base" value="${lm.baseNumber || '9,847,293,847,192,840,320'}">
          </div>
          <div class="input-group">
            <label>Status Tag</label>
            <input type="text" id="lm_status" value="${lm.statusText || 'Lof Level: Exploding ❤️'}">
          </div>
        </div>
        <div class="grid-3">
          <div class="input-group">
            <label>Pump Button Label</label>
            <input type="text" id="lm_pumpBtn" value="${lm.pumpBtnText || 'Pump Lof Lof! 💖 (+500 Quadrillion)'}">
          </div>
          <div class="input-group">
            <label>Kiss Button Label</label>
            <input type="text" id="lm_kissBtn" value="${lm.kissBtnText || 'Send Kiss Kiss 💋'}">
          </div>
          <div class="input-group">
            <label>Hug Button Label</label>
            <input type="text" id="lm_hugBtn" value="${lm.hugBtnText || 'Send Hug Hug 🤗'}">
          </div>
        </div>
      `;
      const bindLm = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.oninput = (e) => { lm[key] = e.target.value; debouncedLiveUpdate(); };
      };
      bindLm("lm_title", "title");
      bindLm("lm_tag", "tag");
      bindLm("lm_desc", "desc");
      bindLm("lm_base", "baseNumber");
      bindLm("lm_status", "statusText");
      bindLm("lm_pumpBtn", "pumpBtnText");
      bindLm("lm_kissBtn", "kissBtnText");
      bindLm("lm_hugBtn", "hugBtnText");
  };
})();
