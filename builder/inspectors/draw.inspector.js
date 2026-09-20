/**
 * Builder Inspector Module: draw.inspector.js
 * Studio Inspector for Draw for Two 💕 Widget
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["draw"] = function(container, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      previewIframe = null
    } = ctx || {};

    const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])));

    if (!state.sectionsData.draw || typeof state.sectionsData.draw !== "object") {
      state.sectionsData.draw = {};
    }
    const dw = state.sectionsData.draw;
    const hero = state.hero || {};

    if (!dw.tag) dw.tag = "Draw for Two 💕";
    if (!dw.title) dw.title = "Our Couple Drawing Studio";
    if (!dw.desc) dw.desc = "Synchronized dual drawing studio — sketch cute prompts together and poke each other across the distance.";
    if (!dw.partner1) dw.partner1 = hero.partner1 || "Alex";
    if (!dw.partner2) dw.partner2 = hero.partner2 || "Sam";
    if (!dw.defaultPack) dw.defaultPack = "memories";
    if (dw.defaultRounds === undefined) dw.defaultRounds = 3;
    if (dw.defaultSeconds === undefined) dw.defaultSeconds = 120;
    if (dw.allowSolo === undefined) dw.allowSolo = true;
    if (!dw.buttonText) dw.buttonText = "Open Fullscreen Studio ↗";
    if (!dw.customPrompts || typeof dw.customPrompts !== "object") dw.customPrompts = {};

    const post = (msg) => {
      try {
        previewIframe?.contentWindow?.postMessage(msg, "*");
      } catch (e) {}
    };

    container.innerHTML = `
      <div class="inspector-group">
        <div class="inspector-section-title">
          <span class="sec-title-icon">🎨</span>
          <span>Drawing Studio Content</span>
        </div>

        <div class="input-group">
          <label>Badge Tag</label>
          <input type="text" id="dw_tag" value="${esc(dw.tag)}" placeholder="Draw for Two 💕">
        </div>

        <div class="input-group">
          <label>Section Title</label>
          <input type="text" id="dw_title" value="${esc(dw.title)}" placeholder="Our Couple Drawing Studio">
        </div>

        <div class="input-group">
          <label>Description Subtitle</label>
          <textarea id="dw_desc" rows="2" style="width: 100%; border-radius: 8px; padding: 8px 10px; font-size: 0.85rem;" placeholder="Sketch prompts together...">${esc(dw.desc)}</textarea>
        </div>
      </div>

      <div class="inspector-group">
        <div class="inspector-section-title">
          <span class="sec-title-icon">⚙️</span>
          <span>Game Rules &amp; Prompts</span>
        </div>

        <div class="input-group">
          <label>Default Prompt Pack</label>
          <select id="dw_defaultPack" class="inspector-select" style="width: 100%;">
            <option value="memories" ${dw.defaultPack === "memories" ? "selected" : ""}>💖 Our Memories (Personal &amp; Romantic)</option>
            <option value="animals" ${dw.defaultPack === "animals" ? "selected" : ""}>🐾 Cute Animals (Critters &amp; Pets)</option>
            <option value="food" ${dw.defaultPack === "food" ? "selected" : ""}>🍜 Food &amp; Snacks (Craving Doodles)</option>
            <option value="draw_me" ${dw.defaultPack === "draw_me" ? "selected" : ""}>💌 Draw Me (Lovingly Butchered)</option>
            <option value="silly" ${dw.defaultPack === "silly" ? "selected" : ""}>🤪 Silly &amp; Weird (Pure Chaos)</option>
            <option value="random" ${dw.defaultPack === "random" ? "selected" : ""}>🎲 Random Doodles (Anything Goes)</option>
          </select>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="input-group">
            <label>Rounds per Match</label>
            <select id="dw_defaultRounds" class="inspector-select" style="width: 100%;">
              <option value="1" ${Number(dw.defaultRounds) === 1 ? "selected" : ""}>1 Round</option>
              <option value="2" ${Number(dw.defaultRounds) === 2 ? "selected" : ""}>2 Rounds</option>
              <option value="3" ${Number(dw.defaultRounds) === 3 ? "selected" : ""}>3 Rounds</option>
              <option value="4" ${Number(dw.defaultRounds) === 4 ? "selected" : ""}>4 Rounds</option>
              <option value="5" ${Number(dw.defaultRounds) === 5 ? "selected" : ""}>5 Rounds</option>
              <option value="7" ${Number(dw.defaultRounds) === 7 ? "selected" : ""}>7 Rounds</option>
              <option value="10" ${Number(dw.defaultRounds) === 10 ? "selected" : ""}>10 Rounds</option>
            </select>
          </div>

          <div class="input-group">
            <label>Time per Round</label>
            <select id="dw_defaultSeconds" class="inspector-select" style="width: 100%;">
              <option value="10" ${Number(dw.defaultSeconds) === 10 ? "selected" : ""}>10 seconds</option>
              <option value="20" ${Number(dw.defaultSeconds) === 20 ? "selected" : ""}>20 seconds</option>
              <option value="30" ${Number(dw.defaultSeconds) === 30 ? "selected" : ""}>30 seconds</option>
              <option value="60" ${Number(dw.defaultSeconds) === 60 ? "selected" : ""}>60 seconds</option>
              <option value="90" ${Number(dw.defaultSeconds) === 90 ? "selected" : ""}>90 seconds</option>
              <option value="120" ${Number(dw.defaultSeconds) === 120 ? "selected" : ""}>120 seconds</option>
              <option value="180" ${Number(dw.defaultSeconds) === 180 ? "selected" : ""}>180 seconds</option>
            </select>
          </div>
        </div>

        <div class="setting-toggle-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 8px;">
          <div>
            <div style="font-size: 0.88rem; font-weight: 600;">Enable Solo Practice Mode</div>
            <div style="font-size: 0.75rem; color: var(--text-muted, #94a3b8);">Allow partners to doodle alone while waiting</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="dw_allowSolo" ${dw.allowSolo !== false ? "checked" : ""}>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="inspector-group">
        <div class="inspector-section-title">
          <span class="sec-title-icon">✏️</span>
          <span>Theme Drawing Prompts</span>
        </div>
        <p style="font-size: 0.78rem; color: var(--text-muted, #94a3b8); margin-bottom: 10px;">
          Add custom prompts or questions per theme. You can edit or delete them anytime.
        </p>

        <div class="input-group">
          <label>Select Theme Pack</label>
          <select id="dw_promptThemeSelect" class="inspector-select" style="width: 100%;">
            <option value="memories">💖 Our Memories (Personal &amp; Romantic)</option>
            <option value="animals">🐾 Cute Animals (Critters &amp; Pets)</option>
            <option value="food">🍜 Food &amp; Snacks (Craving Doodles)</option>
            <option value="draw_me">💌 Draw Me (Lovingly Butchered)</option>
            <option value="silly">🤪 Silly &amp; Weird (Pure Chaos)</option>
            <option value="random">🎲 Random Doodles (Anything Goes)</option>
          </select>
        </div>

        <div class="input-group" style="margin-top: 8px;">
          <label>Add New Prompt</label>
          <div style="display: flex; gap: 6px;">
            <input type="text" id="dw_newPromptInput" placeholder="e.g. Our first picnic together..." style="flex: 1; border-radius: 6px; padding: 7px 10px; font-size: 0.85rem;" />
            <button type="button" id="dw_btnAddPrompt" class="btn btn-primary" style="padding: 7px 12px; font-size: 0.82rem; white-space: nowrap;">+ Add</button>
          </div>
        </div>

        <div style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted, #94a3b8); font-weight: 600;">Custom Prompts (<span id="dw_promptCount">0</span>)</span>
          </div>
          <div id="dw_customPromptsList" style="display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto;">
          </div>
        </div>
      </div>

      <div class="inspector-group">
        <div class="inspector-section-title">
          <span class="sec-title-icon">🚀</span>
          <span>Live Studio Testing</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="/draw" target="_blank" class="btn btn-secondary" style="width: 100%; justify-content: center; text-decoration: none; padding: 9px 12px; font-weight: 600;">
            <span>🎨 Open Drawing Studio in New Tab ↗</span>
          </a>
          <button type="button" id="btnTestDrawPoke" class="btn btn-outline" style="width: 100%; justify-content: center; padding: 8px 12px; font-size: 0.82rem;">
            <span>👉 Send Test Poke in Live Preview</span>
          </button>
        </div>
      </div>
    `;

    const triggerUpdate = () => {
      dw.tag = container.querySelector("#dw_tag").value.trim();
      dw.title = container.querySelector("#dw_title").value.trim();
      dw.desc = container.querySelector("#dw_desc").value.trim();
      dw.defaultPack = container.querySelector("#dw_defaultPack").value;
      dw.defaultRounds = parseInt(container.querySelector("#dw_defaultRounds").value, 10);
      dw.defaultSeconds = parseInt(container.querySelector("#dw_defaultSeconds").value, 10);
      dw.allowSolo = container.querySelector("#dw_allowSolo").checked;

      post({
        type: "DRAW_UPDATE_CONFIG",
        config: dw
      });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    container.querySelectorAll("#dw_tag, #dw_title, #dw_desc, #dw_defaultPack, #dw_defaultRounds, #dw_defaultSeconds, #dw_allowSolo").forEach(input => {
      input.addEventListener("input", triggerUpdate);
      input.addEventListener("change", triggerUpdate);
    });

    let activeTheme = "memories";
    const promptThemeSelect = container.querySelector("#dw_promptThemeSelect");
    const newPromptInput = container.querySelector("#dw_newPromptInput");
    const btnAddPrompt = container.querySelector("#dw_btnAddPrompt");
    const customPromptsList = container.querySelector("#dw_customPromptsList");
    const promptCount = container.querySelector("#dw_promptCount");

    const renderCustomPrompts = () => {
      const list = Array.isArray(dw.customPrompts[activeTheme]) ? dw.customPrompts[activeTheme] : [];
      if (promptCount) promptCount.textContent = list.length;
      if (!customPromptsList) return;

      if (list.length === 0) {
        customPromptsList.innerHTML = `
          <div style="font-size: 0.78rem; color: var(--text-muted, #94a3b8); padding: 8px 10px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 6px; text-align: center;">
            No custom prompts added for this theme yet. Built-in prompts will be used.
          </div>
        `;
        return;
      }

      customPromptsList.innerHTML = list.map((prompt, idx) => `
        <div class="custom-prompt-item" style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 4px 6px;">
          <span style="font-size: 0.72rem; color: var(--text-muted, #94a3b8); min-width: 18px; text-align: right;">${idx + 1}.</span>
          <input type="text" class="dw-prompt-edit-input" data-idx="${idx}" value="${esc(prompt)}" style="flex: 1; background: transparent; border: none; color: inherit; font-size: 0.82rem; padding: 3px 4px; outline: none;" />
          <button type="button" class="btn-sm dw-btn-delete-prompt" data-idx="${idx}" title="Delete prompt" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 0.85rem; line-height: 1;">✕</button>
        </div>
      `).join("");

      customPromptsList.querySelectorAll(".dw-prompt-edit-input").forEach(input => {
        input.addEventListener("change", (e) => {
          const idx = parseInt(e.target.dataset.idx, 10);
          if (Array.isArray(dw.customPrompts[activeTheme]) && dw.customPrompts[activeTheme][idx] !== undefined) {
            dw.customPrompts[activeTheme][idx] = e.target.value.trim();
            triggerUpdate();
          }
        });
      });

      customPromptsList.querySelectorAll(".dw-btn-delete-prompt").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (Array.isArray(dw.customPrompts[activeTheme])) {
            dw.customPrompts[activeTheme].splice(idx, 1);
            renderCustomPrompts();
            triggerUpdate();
          }
        });
      });
    };

    const addCurrentPrompt = () => {
      const val = (newPromptInput.value || "").trim();
      if (!val) return;
      if (!Array.isArray(dw.customPrompts[activeTheme])) {
        dw.customPrompts[activeTheme] = [];
      }
      dw.customPrompts[activeTheme].push(val);
      newPromptInput.value = "";
      renderCustomPrompts();
      triggerUpdate();
    };

    if (promptThemeSelect) {
      promptThemeSelect.addEventListener("change", (e) => {
        activeTheme = e.target.value;
        renderCustomPrompts();
      });
    }

    if (btnAddPrompt) {
      btnAddPrompt.addEventListener("click", addCurrentPrompt);
    }

    if (newPromptInput) {
      newPromptInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addCurrentPrompt();
        }
      });
    }

    renderCustomPrompts();

    const btnTestPoke = container.querySelector("#btnTestDrawPoke");
    if (btnTestPoke) {
      btnTestPoke.addEventListener("click", () => {
        post({
          type: "DRAW_TEST_POKE",
          emoji: "💖"
        });
      });
    }
  };
})();
