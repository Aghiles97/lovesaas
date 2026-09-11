/**
 * Builder Inspector Module: guestbook
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["guestbook"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    
    if (!state.sectionsData.guestbook) state.sectionsData.guestbook = {};
    const gb = state.sectionsData.guestbook;
    const hero = state.sectionsData.hero || {};
    const p2Def = hero.partner2 || hero.partnerName || "Ella";

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📌 Guestbook Wish Wall Header</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="gb_tag" value="${safeVal(gb.tag || "Birthday Guestbook 💌")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="gb_title" value="${safeVal(gb.title || ("Warm Wishes Wall for " + p2Def + " 📌"))}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="gb_desc" rows="2">${safeVal(gb.desc || "Leave a heartfelt sticky note, post your photo, or share your sweetest memory!")}</textarea>
        </div>
        <div class="input-group">
          <label>Pin Note Button Label</label>
          <input type="text" id="gb_addBtnText" value="${safeVal(gb.addBtnText || "✍️ Pin a Birthday Wish")}">
        </div>
      </div>
    `;

    function syncGuestbookData() {
      gb.tag = document.getElementById("gb_tag").value.trim();
      gb.title = document.getElementById("gb_title").value.trim();
      gb.desc = document.getElementById("gb_desc").value.trim();
      gb.addBtnText = document.getElementById("gb_addBtnText").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }

    inspectorFormContainer.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", syncGuestbookData);
    });

  };
})();
