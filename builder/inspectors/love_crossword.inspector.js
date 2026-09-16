/**
 * Builder Inspector Module: love_crossword
 * Dynamic Customization for Couple's Crossword Clues, Titles, Quotes & Live Preview Sync.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["love_crossword"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      previewIframe = null
    } = ctx || {};

    const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

    if (!state.sectionsData.love_crossword || typeof state.sectionsData.love_crossword !== "object") {
      state.sectionsData.love_crossword = {
        tag: "Couple Trivia Puzzle 🧩❤️",
        title: "The Love Crossword",
        desc: "Crack the secret clues of our journey, inside jokes, and favorites to unlock our certificate!",
        certTitle: "Crossword Master of My Heart 🏆",
        certQuote: "« Solved every clue of our story with brilliance and boundless love. »",
        words: [
          { id: "A1", dir: "across", num: 1, word: "MATCHA", clue: "Our favorite creamy green morning drink ritual 🍵", r: 2, c: 0 },
          { id: "A2", dir: "across", num: 2, word: "LOVEISBLIND", clue: "The reality drama we binge-watched on date night 📺", r: 5, c: 0 },
          { id: "A3", dir: "across", num: 3, word: "DONUT", clue: "Our favorite sweet late-night bakery snack 🍩", r: 8, c: 0 },
          { id: "A4", dir: "across", num: 4, word: "TARTE", clue: "Her must-have cruelty-free beauty & blush essential 💄", r: 8, c: 5 },
          { id: "A5", dir: "across", num: 5, word: "PORSCHE", clue: "Your dream sports car in Miami blue 🏎️", r: 11, c: 2 },
          { id: "D1", dir: "down", num: 1, word: "TAYLOR", clue: "The artist behind our favorite playlist 🎵", r: 1, c: 1 },
          { id: "D2", dir: "down", num: 2, word: "PEANUT", clue: "Your silly nickname when you act adorable 🥜", r: 4, c: 3 },
          { id: "D3", dir: "down", num: 3, word: "PARIS", clue: "The city where we promised our next anniversary 🥐", r: 1, c: 5 },
          { id: "D4", dir: "down", num: 4, word: "TIMOTHEE", clue: "Your celebrity crush from Dune 🎬", r: 4, c: 8 },
          { id: "D5", dir: "down", num: 5, word: "LAVENDER", clue: "Her favorite pastel hue & relaxing aroma 🪻", r: 0, c: 10 }
        ]
      };
    }

    const cw = state.sectionsData.love_crossword;
    if (!Array.isArray(cw.words) || cw.words.length === 0) {
      cw.words = [
        { id: "A1", dir: "across", num: 1, word: "MATCHA", clue: "Our favorite creamy green morning drink ritual 🍵", r: 2, c: 0 },
        { id: "A2", dir: "across", num: 2, word: "LOVEISBLIND", clue: "The reality drama we binge-watched on date night 📺", r: 5, c: 0 },
        { id: "A3", dir: "across", num: 3, word: "DONUT", clue: "Our favorite sweet late-night bakery snack 🍩", r: 8, c: 0 },
        { id: "A4", dir: "across", num: 4, word: "TARTE", clue: "Her must-have cruelty-free beauty & blush essential 💄", r: 8, c: 5 },
        { id: "A5", dir: "across", num: 5, word: "PORSCHE", clue: "Your dream sports car in Miami blue 🏎️", r: 11, c: 2 },
        { id: "D1", dir: "down", num: 1, word: "TAYLOR", clue: "The artist behind our favorite playlist 🎵", r: 1, c: 1 },
        { id: "D2", dir: "down", num: 2, word: "PEANUT", clue: "Your silly nickname when you act adorable 🥜", r: 4, c: 3 },
        { id: "D3", dir: "down", num: 3, word: "PARIS", clue: "The city where we promised our next anniversary 🥐", r: 1, c: 5 },
        { id: "D4", dir: "down", num: 4, word: "TIMOTHEE", clue: "Your celebrity crush from Dune 🎬", r: 4, c: 8 },
        { id: "D5", dir: "down", num: 5, word: "LAVENDER", clue: "Her favorite pastel hue & relaxing aroma 🪻", r: 0, c: 10 }
      ];
    }

    let cluesHtml = "";
    cw.words.forEach((w, idx) => {
      cluesHtml += `
        <div class="cw-clue-card" data-idx="${idx}" style="background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:12px; padding:12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="badge" style="background:#ff4365; color:#fff; font-size:11px; font-weight:700; padding:2px 6px; border-radius:6px;">
                ${w.dir === "across" ? "↔️ ACROSS" : "↕️ DOWN"} ${w.num}
              </span>
              <strong style="font-size:13px; letter-spacing:1px;">${esc(w.word)}</strong>
              <small style="opacity:0.6;">(${w.word.length} letters)</small>
            </div>
            <button type="button" class="btn-jump-clue" data-word-id="${esc(w.id)}" style="background:none; border:1px solid #cbd5e1; border-radius:6px; font-size:11px; cursor:pointer; padding:2px 8px;">
              🔍 Highlight
            </button>
          </div>
          <div class="input-group" style="margin:0;">
            <label style="font-size:11px; font-weight:600; color:#64748b; margin-bottom:4px; display:block;">Clue Question / Hint</label>
            <input type="text" class="cw-clue-input" data-idx="${idx}" value="${esc(w.clue)}" style="width:100%; font-size:13px; padding:6px 10px; border-radius:8px; border:1px solid #cbd5e1;">
          </div>
        </div>
      `;
    });

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section">
        <h4 style="margin-top:0; display:flex; align-items:center; gap:6px;">
          <span>🧩</span> Crossword Puzzle Settings
        </h4>

        <div class="input-group" style="margin-bottom:12px;">
          <label>Badge Tag</label>
          <input type="text" id="cwTagInput" value="${esc(cw.tag)}">
        </div>

        <div class="input-group" style="margin-bottom:12px;">
          <label>Widget Title</label>
          <input type="text" id="cwTitleInput" value="${esc(cw.title)}">
        </div>

        <div class="input-group" style="margin-bottom:16px;">
          <label>Subtitle / Description</label>
          <textarea id="cwDescInput" rows="2">${esc(cw.desc)}</textarea>
        </div>

        <h5 style="margin:16px 0 8px 0; color:#e0a96d; display:flex; align-items:center; gap:6px;">
          <span>🏆</span> Victory Certificate Settings
        </h5>

        <div class="input-group" style="margin-bottom:12px;">
          <label>Diploma Title</label>
          <input type="text" id="cwCertTitleInput" value="${esc(cw.certTitle)}">
        </div>

        <div class="input-group" style="margin-bottom:16px;">
          <label>Romantic Diploma Vow Quote</label>
          <textarea id="cwCertQuoteInput" rows="2">${esc(cw.certQuote)}</textarea>
        </div>

        <div style="display:flex; gap:8px; margin-bottom:20px;">
          <button type="button" id="btnInspectorPreviewDiploma" class="btn btn-sm" style="flex:1; background:#fff0f3; color:#ff4365; border:1px solid rgba(255,67,101,0.3); font-weight:600; padding:8px; border-radius:8px; cursor:pointer;">
            🏆 Preview Keepsake
          </button>
          <button type="button" id="btnInspectorResetGame" class="btn btn-sm" style="flex:1; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; font-weight:600; padding:8px; border-radius:8px; cursor:pointer;">
            🔄 Reset Board
          </button>
        </div>

        <h5 style="margin:16px 0 8px 0; display:flex; align-items:center; justify-content:space-between;">
          <span>📝 Clues & Trivia Prompts (10 Total)</span>
          <span style="font-size:11px; opacity:0.7;">12×12 Interlocking</span>
        </h5>
        <div id="cwCluesContainer">
          ${cluesHtml}
        </div>
      </div>
    `;

    // Event binding
    const tagInput = inspectorFormContainer.querySelector("#cwTagInput");
    const titleInput = inspectorFormContainer.querySelector("#cwTitleInput");
    const descInput = inspectorFormContainer.querySelector("#cwDescInput");
    const certTitleInput = inspectorFormContainer.querySelector("#cwCertTitleInput");
    const certQuoteInput = inspectorFormContainer.querySelector("#cwCertQuoteInput");

    const notifyChange = () => {
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    if (tagInput) tagInput.addEventListener("input", (e) => { cw.tag = e.target.value; notifyChange(); });
    if (titleInput) titleInput.addEventListener("input", (e) => { cw.title = e.target.value; notifyChange(); });
    if (descInput) descInput.addEventListener("input", (e) => { cw.desc = e.target.value; notifyChange(); });
    if (certTitleInput) certTitleInput.addEventListener("input", (e) => { cw.certTitle = e.target.value; notifyChange(); });
    if (certQuoteInput) certQuoteInput.addEventListener("input", (e) => { cw.certQuote = e.target.value; notifyChange(); });

    inspectorFormContainer.querySelectorAll(".cw-clue-input").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (cw.words[idx]) {
          cw.words[idx].clue = e.target.value;
          notifyChange();
        }
      });
    });

    inspectorFormContainer.querySelectorAll(".btn-jump-clue").forEach(btn => {
      btn.addEventListener("click", () => {
        const wordId = btn.dataset.wordId;
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "CROSSWORD_JUMP_WORD", wordId }, "*");
        }
      });
    });

    const previewDiplomaBtn = inspectorFormContainer.querySelector("#btnInspectorPreviewDiploma");
    if (previewDiplomaBtn) {
      previewDiplomaBtn.addEventListener("click", () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "CROSSWORD_OPEN_KEEPSAKE" }, "*");
        }
      });
    }

    const resetGameBtn = inspectorFormContainer.querySelector("#btnInspectorResetGame");
    if (resetGameBtn) {
      resetGameBtn.addEventListener("click", () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "CROSSWORD_RESET" }, "*");
        }
      });
    }
  };
})();
