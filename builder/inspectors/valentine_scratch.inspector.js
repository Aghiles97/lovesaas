/**
 * Builder Inspector Module: valentine_scratch
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["valentine_scratch"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    if (!state.sectionsData.valentine_scratch) {
      state.sectionsData.valentine_scratch = {
        tag: "Secret Valentine",
        title: "Scratch to Reveal Your Date 💝",
        desc: "Use your finger or mouse to scratch the card and reveal your secret date itinerary!",
        location: "A Magical Place ✨",
        date: "Valentine's Day",
        time: "7:00 PM",
        dressCode: "Dress to impress 💃🕺",
        message: "I can't wait to spend this special evening with you!",
        overlayColor: "#e84393"
      };
    }
    const d = state.sectionsData.valentine_scratch;

    inspectorFormContainer.innerHTML = `
      <div class="section-settings-card" style="background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:8px;padding:14px;margin-bottom:16px;">
        <h4 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:12px;">Section Header</h4>
        <div class="grid-2">
          <div class="input-group"><label>Tag</label><input type="text" id="vs_tag" value="${escapeHtml(d.tag || '')}"></div>
          <div class="input-group"><label>Title</label><input type="text" id="vs_title" value="${escapeHtml(d.title || '')}"></div>
        </div>
        <div class="input-group"><label>Description</label><input type="text" id="vs_desc" value="${escapeHtml(d.desc || '')}"></div>
      </div>

      <div class="section-settings-card" style="background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:8px;padding:14px;margin-bottom:16px;">
        <h4 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:12px;">Date Itinerary</h4>
        <div class="grid-2">
          <div class="input-group"><label>📍 Location</label><input type="text" id="vs_location" value="${escapeHtml(d.location || '')}"></div>
          <div class="input-group"><label>📅 Date</label><input type="text" id="vs_date" value="${escapeHtml(d.date || '')}"></div>
        </div>
        <div class="grid-2">
          <div class="input-group"><label>⏰ Time</label><input type="text" id="vs_time" value="${escapeHtml(d.time || '')}"></div>
          <div class="input-group"><label>👗 Dress Code</label><input type="text" id="vs_dressCode" value="${escapeHtml(d.dressCode || '')}"></div>
        </div>
        <div class="input-group"><label>💌 Love Message</label><textarea id="vs_message" rows="2">${escapeHtml(d.message || '')}</textarea></div>
      </div>

      <div class="section-settings-card" style="background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:8px;padding:14px;margin-bottom:16px;">
        <h4 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:12px;">Appearance</h4>
        <div class="input-group"><label>Overlay Color</label><input type="color" id="vs_overlayColor" value="${d.overlayColor || '#e84393'}"></div>
      </div>
    `;

    const fields = { vs_tag:"tag", vs_title:"title", vs_desc:"desc", vs_location:"location", vs_date:"date", vs_time:"time", vs_dressCode:"dressCode", vs_message:"message", vs_overlayColor:"overlayColor" };
    Object.entries(fields).forEach(([elId, key]) => {
      const el = document.getElementById(elId);
      if (el) el.oninput = (e) => { d[key] = e.target.value; debouncedLiveUpdate(); };
    });
  };
})();
