/**
 * Builder Inspector Module: reasons
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["reasons"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

if (!Array.isArray(state.sectionsData.reasons)) {
        state.sectionsData.reasons = [
          { id: "r1", title: "Your Gentle Smile", note: "How you light up every single room effortlessly.", category: "romance" },
          { id: "r2", title: "Our Airport Sprints", note: "Running with heavy luggage and laughing until dawn.", category: "travel" }
        ];
      }
      const reasons = state.sectionsData.reasons;

      let listHtml = "";
      reasons.forEach((r, idx) => {
        listHtml += `
          <div class="item-editor-card" data-idx="${idx}">
            <div class="item-editor-header">
              <span class="item-editor-title">Card #${idx + 1}</span>
              <button type="button" class="btn-remove-item" data-remove-reason="${idx}">🗑️ Delete</button>
            </div>
            <div class="grid-2">
              <div class="input-group">
                <label>Card Title</label>
                <input type="text" class="reason-title-input" value="${r.title || ''}">
              </div>
              <div class="input-group">
                <label>Category</label>
                <select class="reason-cat-input">
                  <option value="romance" ${r.category === 'romance' ? 'selected' : ''}>💖 Romance</option>
                  <option value="travel" ${r.category === 'travel' ? 'selected' : ''}>✈️ Travel / Adventures</option>
                  <option value="humor" ${r.category === 'humor' ? 'selected' : ''}>😂 Inside Jokes</option>
                  <option value="food" ${r.category === 'food' ? 'selected' : ''}>🍜 Foodie Dates</option>
                  <option value="ldr" ${r.category === 'ldr' ? 'selected' : ''}>🌙 Long Distance (LDR)</option>
                </select>
              </div>
            </div>
            <div class="input-group">
              <label>Sweet Note Body</label>
              <textarea class="reason-note-input">${r.note || ''}</textarea>
            </div>
            <div class="input-group">
              <label>Footnote / Loving Remark</label>
              <input type="text" class="reason-footnote-input" value="${r.footnote || ''}" placeholder="— Forever and always">
            </div>
          </div>
        `;
      });

      inspectorFormContainer.innerHTML = `
        <div id="reasonsListContainer">${listHtml}</div>
        <button type="button" id="btnAddReason" class="btn-add-item">➕ Add Sweet Reason Card</button>
      `;

      // Event listeners for reasons
      const attachReasonEvents = () => {
        document.querySelectorAll("#reasonsListContainer .item-editor-card").forEach(card => {
          const idx = parseInt(card.dataset.idx, 10);
          card.querySelector(".reason-title-input").oninput = (e) => {
            reasons[idx].title = e.target.value;
            debouncedLiveUpdate();
          };
          card.querySelector(".reason-cat-input").onchange = (e) => {
            reasons[idx].category = e.target.value;
            debouncedLiveUpdate();
          };
          card.querySelector(".reason-note-input").oninput = (e) => {
            reasons[idx].note = e.target.value;
            debouncedLiveUpdate();
          };
          const fnInput = card.querySelector(".reason-footnote-input");
          if (fnInput) {
            fnInput.oninput = (e) => {
              reasons[idx].footnote = e.target.value;
              debouncedLiveUpdate();
            };
          }
          card.querySelector(`[data-remove-reason="${idx}"]`).onclick = () => {
            reasons.splice(idx, 1);
            renderWidgetInspector("reasons");
            debouncedLiveUpdate();
          };
        });
      };
      attachReasonEvents();

      document.getElementById("btnAddReason").onclick = () => {
        reasons.push({
          id: "r-" + Date.now(),
          title: "New Sweet Reason",
          note: "Tell your partner why you love them...",
          category: "romance"
        });
        renderWidgetInspector("reasons");
        debouncedLiveUpdate();
      };
  };
})();
