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
              <option value="3" ${Number(dw.defaultRounds) === 3 ? "selected" : ""}>3 Rounds</option>
              <option value="4" ${Number(dw.defaultRounds) === 4 ? "selected" : ""}>4 Rounds</option>
              <option value="5" ${Number(dw.defaultRounds) === 5 ? "selected" : ""}>5 Rounds</option>
              <option value="7" ${Number(dw.defaultRounds) === 7 ? "selected" : ""}>7 Rounds</option>
            </select>
          </div>

          <div class="input-group">
            <label>Time per Round</label>
            <select id="dw_defaultSeconds" class="inspector-select" style="width: 100%;">
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

    // Event listeners
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

    container.querySelectorAll("input, textarea, select").forEach(input => {
      input.addEventListener("input", triggerUpdate);
      input.addEventListener("change", triggerUpdate);
    });

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
