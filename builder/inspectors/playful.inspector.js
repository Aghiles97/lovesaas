/**
 * Builder Inspector Module: playful
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["playful"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

if (!state.sectionsData.playful) state.sectionsData.playful = {};
      const pl = state.sectionsData.playful;

      const quotesArray = Array.isArray(pl.teasingQuotes) && pl.teasingQuotes.length
        ? pl.teasingQuotes
        : [
          "Nice try, but you're legally stuck with me forever! 💍😜",
          "Error 404: 'No' button disconnected! 💖",
          "Your fingers slipped! Tap the giant shiny YES! 🥰",
          "There is NO escaping my kissies and hugs! 🤗💋",
          "PUPU alert! The NO button ran away to Nanjing! 💩🛕",
          "Resistance is futile, sweetheart! I lof you too much! 💕",
          "Look how big the YES button is becoming! Just tap it! ✨"
        ];
      const quotesText = quotesArray.join("\n");

      inspectorFormContainer.innerHTML = `
        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">Section Header & Question</h4>
          <div class="grid-2">
            <div class="input-group">
              <label>Icon Emoji</label>
              <input type="text" id="pl_icon" value="${escapeHtml(pl.icon || '🙈')}">
            </div>
            <div class="input-group">
              <label>Card Heading</label>
              <input type="text" id="pl_title" value="${escapeHtml(pl.title || 'Quick Question for You...')}">
            </div>
          </div>
          <div class="input-group">
            <label>Question Prompt</label>
            <input type="text" id="pl_q" value="${escapeHtml(pl.question || 'Do you lof lof me as much as I lof lof you?')}">
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>YES Button Text</label>
              <input type="text" id="pl_yes" value="${escapeHtml(pl.yesText || 'YES! 1000% Lof Lof ❤️')}">
            </div>
            <div class="input-group">
              <label>NO Button Text (Runaway Evasive)</label>
              <input type="text" id="pl_no" value="${escapeHtml(pl.noText || 'No 😜')}">
            </div>
          </div>
        </div>

        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">🎉 Yes Celebration Modal</h4>
          <div class="grid-2">
            <div class="input-group">
              <label>Celebration Emoji</label>
              <input type="text" id="pl_celebEmoji" value="${escapeHtml(pl.celebrationEmoji || '🥰🎉💖')}">
            </div>
            <div class="input-group">
              <label>Celebration Title</label>
              <input type="text" id="pl_celebTitle" value="${escapeHtml(pl.celebrationTitle || 'I Knew It!')}">
            </div>
          </div>
          <div class="input-group">
            <label>Celebration Message Body</label>
            <textarea id="pl_celebBody" rows="2">${escapeHtml(pl.celebrationBody || "You're stuck with your Algerian boy forever and ever! Sending you a million kiss kiss and hug hug right now! 💋🤗")}</textarea>
          </div>
          <div class="input-group">
            <label>Celebration Button Text</label>
            <input type="text" id="pl_celebBtnText" value="${escapeHtml(pl.celebrationBtnText || 'Yaaay! Lof Lof! 🥰')}">
          </div>
        </div>

        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">😜 Teasing Dialogue Quotes</h4>
          <div class="input-group">
            <label>Quotes on Hover/Tap (One quote per line)</label>
            <textarea id="pl_quotes" style="height: 110px; font-family: inherit; line-height: 1.4;">${escapeHtml(quotesText)}</textarea>
          </div>
          <div class="input-group">
            <label>Vanishing Punchline (After 7 evasions)</label>
            <input type="text" id="pl_vanish" value="${escapeHtml(pl.vanishQuote || "PUPU ALERT! 💩 The 'No' button gave up and vanished! Tap YES! 💖")}">
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <h4 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">🎮 Live Interactive Test Controls</h4>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button type="button" id="btnTestPlayfulYes" class="btn-sm btn-primary">💖 Test YES! Celebration</button>
            <button type="button" id="btnTestPlayfulNo" class="btn-sm btn-secondary">😜 Test NO Evasion Jump</button>
            <button type="button" id="btnTestPlayfulReset" class="btn-sm btn-outline">🔄 Reset Game Buttons</button>
          </div>
        </div>
      `;

      document.getElementById("pl_icon").oninput = (e) => { pl.icon = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_title").oninput = (e) => { pl.title = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_q").oninput = (e) => { pl.question = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_yes").oninput = (e) => { pl.yesText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_no").oninput = (e) => { pl.noText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_celebEmoji").oninput = (e) => { pl.celebrationEmoji = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_celebTitle").oninput = (e) => { pl.celebrationTitle = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_celebBody").oninput = (e) => { pl.celebrationBody = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_celebBtnText").oninput = (e) => { pl.celebrationBtnText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_vanish").oninput = (e) => { pl.vanishQuote = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("pl_quotes").oninput = (e) => {
        pl.teasingQuotes = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
        debouncedLiveUpdate();
      };

      document.getElementById("btnTestPlayfulYes").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "PLAYFUL_TRIGGER_YES" }, "*");
        }
      };

      document.getElementById("btnTestPlayfulNo").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "PLAYFUL_TRIGGER_NO" }, "*");
        }
      };

      document.getElementById("btnTestPlayfulReset").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "PLAYFUL_RESET" }, "*");
        }
      };
  };
})();
