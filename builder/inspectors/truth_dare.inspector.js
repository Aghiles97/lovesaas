/**
 * Builder Inspector Module: truth_dare
 * Advanced admin controls: Rigging modes, dual winner challenges,
 * bottle aesthetics, and live interactive test triggers.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["truth_dare"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    if (!state.sectionsData.truth_dare) state.sectionsData.truth_dare = {};
    const td = state.sectionsData.truth_dare;
    const hero = state.sectionsData.hero || {};
    const p1Def = hero.partner1 || state.partner1 || "Partner 1";
    const p2Def = hero.partner2 || state.partner2 || "Partner 2";

    const rxList = Array.isArray(td.r3Reactions) && td.r3Reactions.length === 3 ? td.r3Reactions : [
      td.r3Reaction1 || "\"I KNEW IT!! You big cheater!! 😂🥊\"",
      td.r3Reaction2 || "\"OMG you caught me... I cheat too! 🙈🤫\"",
      td.r3Reaction3 || "\"I demand infinite kisses and hugs as compensation! 💋🤗\""
    ];

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    const sendTodMsg = (payload) => {
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(payload, "*");
      }
    };

    inspectorFormContainer.innerHTML = `
      <!-- Rigging & Game Mode -->
      <div class="inspector-section-card" style="border: 1.5px solid var(--primary); background: linear-gradient(135deg, rgba(255,240,245,0.7), rgba(255,255,255,0.95));">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎲 Rigging Engine & Game Rules</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">
          Choose whether the duel is truly 50/50 fair, rigged for comedic sweep, or custom scripted:
        </p>
        
        <div class="input-group">
          <label>Duel Rigging Mode</label>
          <select id="td_rigMode" class="input-select" style="font-weight: 600;">
            <option value="p1_rigged" ${td.rigMode === "p1_rigged" || !td.rigMode ? "selected" : ""}>👑 Rigged for ${safeVal(td.p1Name || p1Def)} (100% Sweep)</option>
            <option value="p2_rigged" ${td.rigMode === "p2_rigged" ? "selected" : ""}>👸🏻 Rigged for ${safeVal(td.p2Name || p2Def)} (Princess Revenge)</option>
            <option value="fair" ${td.rigMode === "fair" ? "selected" : ""}>⚖️ 100% Fair & Square (50/50 Random Bottle)</option>
            <option value="alternate" ${td.rigMode === "alternate" ? "selected" : ""}>🔄 Alternating Rounds (${safeVal(td.p1Name || p1Def)} ➔ ${safeVal(td.p2Name || p2Def)} ➔ ${safeVal(td.p1Name || p1Def)})</option>
            <option value="custom" ${td.rigMode === "custom" ? "selected" : ""}>🎯 Custom Scripted Per Round</option>
          </select>
        </div>

        <div id="td_custom_rounds_wrap" class="${td.rigMode === 'custom' ? '' : 'hidden'}" style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.85); border-radius: 8px; border: 1px dashed var(--primary);">
          <div style="font-weight: 600; font-size: 0.78rem; color: var(--primary); margin-bottom: 6px;">Scripted Winners Per Round</div>
          <div class="grid-3">
            <div class="input-group">
              <label>Round 1 Winner</label>
              <select id="td_r1Winner">
                <option value="p1" ${(td.r1Winner || 'p1') === 'p1' ? 'selected' : ''}>${safeVal(td.p1Name || p1Def)}</option>
                <option value="p2" ${td.r1Winner === 'p2' ? 'selected' : ''}>${safeVal(td.p2Name || p2Def)}</option>
              </select>
            </div>
            <div class="input-group">
              <label>Round 2 Winner</label>
              <select id="td_r2Winner">
                <option value="p1" ${td.r2Winner === 'p1' ? 'selected' : ''}>${safeVal(td.p1Name || p1Def)}</option>
                <option value="p2" ${(td.r2Winner || 'p2') === 'p2' ? 'selected' : ''}>${safeVal(td.p2Name || p2Def)}</option>
              </select>
            </div>
            <div class="input-group">
              <label>Round 3 Winner</label>
              <select id="td_r3Winner">
                <option value="p1" ${(td.r3Winner || 'p1') === 'p1' ? 'selected' : ''}>${safeVal(td.p1Name || p1Def)}</option>
                <option value="p2" ${td.r3Winner === 'p2' ? 'selected' : ''}>${safeVal(td.p2Name || p2Def)}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="input-group">
            <label>Bottle Aesthetic Skin</label>
            <select id="td_bottleStyle">
              <option value="wine" ${td.bottleStyle === "wine" || !td.bottleStyle ? "selected" : ""}>🍷 Classic Love Wine</option>
              <option value="champagne" ${td.bottleStyle === "champagne" ? "selected" : ""}>🍾 Golden Champagne</option>
              <option value="potion" ${td.bottleStyle === "potion" ? "selected" : ""}>🔮 Mystic Love Potion</option>
            </select>
          </div>
          <div class="input-group">
            <label>Spin Duration</label>
            <select id="td_spinDuration">
              <option value="1.8" ${td.spinDuration === "1.8" ? "selected" : ""}>⚡ Fast Pace (1.8s)</option>
              <option value="2.8" ${td.spinDuration === "2.8" || !td.spinDuration ? "selected" : ""}>🎲 Standard (2.8s)</option>
              <option value="4.0" ${td.spinDuration === "4.0" ? "selected" : ""}>🎭 Dramatic Suspense (4.0s)</option>
            </select>
          </div>
        </div>

        <div class="input-group" style="margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="td_showConfession" ${td.showConfession !== false ? "checked" : ""}>
            <span>Show "I Cheated!" Rigging Confession on Round 3</span>
          </label>
        </div>
      </div>

      <!-- Section Header -->
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📝 Section Header & Subtitle</span>
        </div>
        <div class="input-group">
          <label>Tag / Category Badge</label>
          <input type="text" id="td_tag" value="${safeVal(td.tag || "High-Stakes Couple's Duel 🎭")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="td_title" value="${safeVal(td.title || "Truth or Dare: 100% Fair & Square ⚖️")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="td_desc" rows="2">${safeVal(td.desc || `Best of 3 games between ${p2Def} and ${p1Def}. Spin the bottle of destiny! (Algorithm verified by ${p1Def} 😏)`)}</textarea>
        </div>
      </div>

      <!-- Duelists Meta -->
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">👥 Duelists Meta & Scoreboard</span>
        </div>
        <div style="font-weight: 600; font-size: 0.82rem; color: var(--primary); margin-bottom: 6px;">Partner 1 (North Target / Top)</div>
        <div class="grid-2">
          <div class="input-group">
            <label>Name / Display</label>
            <input type="text" id="td_p1Name" value="${safeVal(td.p1Name || p1Def)}">
          </div>
          <div class="input-group">
            <label>Title / Role</label>
            <input type="text" id="td_p1Title" value="${safeVal(td.p1Title || "Mastermind 👑")}">
          </div>
        </div>
        <div class="grid-3">
          <div class="input-group">
            <label>Avatar / Emoji</label>
            <input type="text" id="td_p1Avatar" value="${safeVal(td.p1Avatar || "🇩🇿👑")}">
          </div>
          <div class="input-group">
            <label>Flag</label>
            <input type="text" id="td_p1Flag" value="${safeVal(td.p1Flag || "🇩🇿")}">
          </div>
          <div class="input-group">
            <label>Wins Target Label</label>
            <input type="text" id="td_p1WinsLabel" value="${safeVal(td.p1WinsLabel || `${td.p1Name || p1Def} Wins`)}">
          </div>
        </div>

        <div style="font-weight: 600; font-size: 0.82rem; color: #d9480f; margin: 12px 0 6px;">Partner 2 (South Target / Bottom)</div>
        <div class="grid-2">
          <div class="input-group">
            <label>Name / Display</label>
            <input type="text" id="td_p2Name" value="${safeVal(td.p2Name || p2Def)}">
          </div>
          <div class="input-group">
            <label>Title / Role</label>
            <input type="text" id="td_p2Title" value="${safeVal(td.p2Title || "Princess 👸🏻")}">
          </div>
        </div>
        <div class="grid-3">
          <div class="input-group">
            <label>Avatar / Emoji</label>
            <input type="text" id="td_p2Avatar" value="${safeVal(td.p2Avatar || "🇮🇩👸🏻")}">
          </div>
          <div class="input-group">
            <label>Flag</label>
            <input type="text" id="td_p2Flag" value="${safeVal(td.p2Flag || "🇮🇩")}">
          </div>
          <div class="input-group">
            <label>Wins Target Label</label>
            <input type="text" id="td_p2WinsLabel" value="${safeVal(td.p2WinsLabel || `${td.p2Name || p2Def} Wins`)}">
          </div>
        </div>
      </div>

      <!-- Partner 1 Winning Challenges -->
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">👑 Partner 1 Winning Challenges (When ${safeVal(td.p1Name || p1Def)} Wins)</span>
        </div>
        
        <div style="font-weight: 600; font-size: 0.82rem; color: var(--primary); margin: 6px 0;">Round 1: Truth & Evasive "No" Button</div>
        <div class="input-group">
          <label>Question Prompt</label>
          <textarea id="td_r1Prompt" rows="2">${safeVal(td.r1Prompt || `Do you really lof someone called ${td.p1Name || p1Def}, who lives in Algeria?`)}</textarea>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>"Yes" Button Text</label>
            <input type="text" id="td_r1YesText" value="${safeVal(td.r1YesText || "Yes, I really lof him with all my heart! ❤️🥰")}">
          </div>
          <div class="input-group">
            <label>"No" Button (Dodges cursor!)</label>
            <input type="text" id="td_r1NoText" value="${safeVal(td.r1NoText || "No, who is that? 😜")}">
          </div>
        </div>
        <div class="input-group">
          <label>Success Feedback Bubble</label>
          <input type="text" id="td_r1Feedback" value="${safeVal(td.r1Feedback || `<strong>${td.p1Name || p1Def}:</strong> "Hehehe I knew it! Correct answer! 🥰 But I'm still up 1 - 0!"`)}">
        </div>

        <div style="font-weight: 600; font-size: 0.82rem; color: #d9480f; margin: 14px 0 6px;">Round 2: Dare & WhatsApp Mission</div>
        <div class="input-group">
          <label>Dare Prompt Text</label>
          <textarea id="td_r2Prompt" rows="2">${safeVal(td.r2Prompt || `If your previous answer was yes, send him a message on WhatsApp tell him: 'Yes i really lof someone from algeria'`)}</textarea>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>WhatsApp Pre-filled Text</label>
            <input type="text" id="td_r2WaText" value="${safeVal(td.r2WaText || "Yes i really lof someone from algeria")}">
          </div>
          <div class="input-group">
            <label>Recipient Phone Number (Optional)</label>
            <input type="text" id="td_r2WaPhone" placeholder="e.g. 213555123456" value="${safeVal(td.r2WaPhone || "")}">
          </div>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>WhatsApp Button Text</label>
            <input type="text" id="td_r2WaBtnText" value="${safeVal(td.r2WaBtnText || `📱 Send WhatsApp Dare to ${td.p1Name || p1Def}`)}">
          </div>
          <div class="input-group">
            <label>"Done" Button Text</label>
            <input type="text" id="td_r2DoneText" value="${safeVal(td.r2DoneText || "I sent it! (Or promised to!) 😇💌")}">
          </div>
        </div>

        <div style="font-weight: 600; font-size: 0.82rem; color: #5f3dc4; margin: 14px 0 6px;">Round 3: The Cheating Confession</div>
        <div class="input-group">
          <label>Confession Quote</label>
          <textarea id="td_r3Confession" rows="2">${safeVal(td.r3Confession || "I cheated that is why you lost for a third time, oops... you were supposed to say the truth not me! omg you cheat too?")}</textarea>
        </div>
        <div class="input-group">
          <label>Author Attribution</label>
          <input type="text" id="td_r3Author" value="${safeVal(td.r3Author || `— Confession by ${td.p1Name || p1Def} 😏`)}">
        </div>
        <div class="input-group">
          <label>Reaction #1</label>
          <input type="text" id="td_r3rx0" value="${safeVal(rxList[0])}">
        </div>
        <div class="input-group">
          <label>Reaction #2</label>
          <input type="text" id="td_r3rx1" value="${safeVal(rxList[1])}">
        </div>
        <div class="input-group">
          <label>Reaction #3</label>
          <input type="text" id="td_r3rx2" value="${safeVal(rxList[2])}">
        </div>
      </div>

      <!-- Partner 2 Winning Challenges -->
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">👸🏻 Partner 2 Winning Challenges (When ${safeVal(td.p2Name || p2Def)} Wins)</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
          Displayed when the bottle lands on Partner 2:
        </p>

        <div style="font-weight: 600; font-size: 0.82rem; color: #c2255c; margin: 6px 0;">Round 1: Truth for ${safeVal(td.p1Name || p1Def)}</div>
        <div class="input-group">
          <label>Question Prompt</label>
          <textarea id="td_p2R1Prompt" rows="2">${safeVal(td.p2R1Prompt || `What was the exact millisecond you realized you fell head-over-heels in love with ${td.p2Name || p2Def}?`)}</textarea>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Option A Text</label>
            <input type="text" id="td_p2R1Opt1" value="${safeVal(td.p2R1Opt1 || "From the very first conversation! 💘")}">
          </div>
          <div class="input-group">
            <label>Option B Text</label>
            <input type="text" id="td_p2R1Opt2" value="${safeVal(td.p2R1Opt2 || "Every single day even more and more! 🥰")}">
          </div>
        </div>

        <div style="font-weight: 600; font-size: 0.82rem; color: #d9480f; margin: 14px 0 6px;">Round 2: Dare for ${safeVal(td.p1Name || p1Def)}</div>
        <div class="input-group">
          <label>Dare Prompt Text</label>
          <textarea id="td_p2R2Prompt" rows="2">${safeVal(td.p2R2Prompt || `Dare for ${td.p1Name || p1Def}: Send a 10-second cute voice message or selfie with your biggest smile right now!`)}</textarea>
        </div>
        <div class="input-group">
          <label>Done Button Label</label>
          <input type="text" id="td_p2R2DoneText" value="${safeVal(td.p2R2DoneText || "Dare Accepted & Done! 🫡💖")}">
        </div>

        <div style="font-weight: 600; font-size: 0.82rem; color: #5f3dc4; margin: 14px 0 6px;">Round 3: Queen's Triumph Prompt</div>
        <div class="input-group">
          <label>Finale Prompt</label>
          <textarea id="td_p2R3Prompt" rows="2">${safeVal(td.p2R3Prompt || `${td.p2Name || p2Def} takes Round 3! How does ${td.p1Name || p1Def} bow to the reigning champion?`)}</textarea>
        </div>
      </div>

      <!-- Verdicts -->
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🏆 Victory Banners & Final Verdicts</span>
        </div>
        <div style="font-weight: 600; font-size: 0.82rem; color: var(--primary); margin-bottom: 4px;">Partner 1 Wins Outcome</div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="td_verdictTitle" value="${safeVal(td.verdictTitle || "🏆 Official Verdict: Rigged by Love! ❤️")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="td_verdictDesc" rows="2">${safeVal(td.verdictDesc || `${td.p1Name || p1Def} may have swept 3 - 0, but <strong>${td.p2Name || p2Def} wins their entire heart 10,000% forever</strong> across every kilometer! ✈️💍`)}</textarea>
        </div>

        <div style="font-weight: 600; font-size: 0.82rem; color: #c2255c; margin: 12px 0 4px;">Partner 2 Wins Outcome</div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="td_p2VerdictTitle" value="${safeVal(td.p2VerdictTitle || `👑 Official Verdict: ${td.p2Name || p2Def} Reigns Supreme! 👸🏻`)}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="td_p2VerdictDesc" rows="2">${safeVal(td.p2VerdictDesc || `${td.p2Name || p2Def} takes the crown! Undisputed queen of our hearts, ruling with love! 💖✨`)}</textarea>
        </div>
      </div>

      <!-- Live Interactive Simulator -->
      <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(255,240,245,0.9), rgba(255,255,255,0.95)); border: 1.5px dashed var(--primary);">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Live Simulator & Quick Tests</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Control the live bottle and rounds directly inside the preview iframe:</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btnTodTestSpin" class="btn-subtle" style="font-size: 0.78rem;">🍾 Spin Bottle</button>
          <button type="button" id="btnTodRigP1" class="btn-subtle" style="font-size: 0.78rem;">👑 Force Rig P1</button>
          <button type="button" id="btnTodRigP2" class="btn-subtle" style="font-size: 0.78rem;">👸🏻 Force Rig P2</button>
          <button type="button" id="btnTodFair" class="btn-subtle" style="font-size: 0.78rem;">⚖️ 50/50 Fair</button>
          <button type="button" id="btnTodR1" class="btn-subtle" style="font-size: 0.78rem;">🔮 Round 1</button>
          <button type="button" id="btnTodR2" class="btn-subtle" style="font-size: 0.78rem;">🔥 Round 2</button>
          <button type="button" id="btnTodR3" class="btn-subtle" style="font-size: 0.78rem;">🕵️ Round 3</button>
          <button type="button" id="btnTodReset" class="btn-subtle" style="font-size: 0.78rem;">🔄 Reset Duel</button>
        </div>
      </div>
    `;

    // Rigging & Game Mode Bindings
    const rigSelect = document.getElementById("td_rigMode");
    const customWrap = document.getElementById("td_custom_rounds_wrap");
    rigSelect.onchange = (e) => {
      td.rigMode = e.target.value;
      if (customWrap) {
        customWrap.classList.toggle("hidden", e.target.value !== "custom");
      }
      sendTodMsg({ type: "TOD_SET_RIG", rigMode: td.rigMode });
      debouncedLiveUpdate();
    };

    document.getElementById("td_r1Winner").onchange = (e) => { td.r1Winner = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r2Winner").onchange = (e) => { td.r2Winner = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r3Winner").onchange = (e) => { td.r3Winner = e.target.value; debouncedLiveUpdate(); };

    document.getElementById("td_bottleStyle").onchange = (e) => {
      td.bottleStyle = e.target.value;
      sendTodMsg({ type: "TOD_SET_SKIN", skin: td.bottleStyle });
      debouncedLiveUpdate();
    };

    document.getElementById("td_spinDuration").onchange = (e) => {
      td.spinDuration = e.target.value;
      debouncedLiveUpdate();
    };

    document.getElementById("td_showConfession").onchange = (e) => {
      td.showConfession = e.target.checked;
      debouncedLiveUpdate();
    };

    // Header bindings
    document.getElementById("td_tag").oninput = (e) => { td.tag = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_title").oninput = (e) => { td.title = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_desc").oninput = (e) => { td.desc = e.target.value; debouncedLiveUpdate(); };

    // Partner 1
    document.getElementById("td_p1Name").oninput = (e) => { td.p1Name = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p1Title").oninput = (e) => { td.p1Title = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p1Avatar").oninput = (e) => { td.p1Avatar = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p1Flag").oninput = (e) => { td.p1Flag = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p1WinsLabel").oninput = (e) => { td.p1WinsLabel = e.target.value; debouncedLiveUpdate(); };

    // Partner 2
    document.getElementById("td_p2Name").oninput = (e) => { td.p2Name = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2Title").oninput = (e) => { td.p2Title = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2Avatar").oninput = (e) => { td.p2Avatar = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2Flag").oninput = (e) => { td.p2Flag = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2WinsLabel").oninput = (e) => { td.p2WinsLabel = e.target.value; debouncedLiveUpdate(); };

    // P1 Win Challenges
    document.getElementById("td_r1Prompt").oninput = (e) => { td.r1Prompt = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r1YesText").oninput = (e) => { td.r1YesText = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r1NoText").oninput = (e) => { td.r1NoText = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r1Feedback").oninput = (e) => { td.r1Feedback = e.target.value; debouncedLiveUpdate(); };

    document.getElementById("td_r2Prompt").oninput = (e) => { td.r2Prompt = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r2WaText").oninput = (e) => { td.r2WaText = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r2WaPhone").oninput = (e) => { td.r2WaPhone = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r2WaBtnText").oninput = (e) => { td.r2WaBtnText = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r2DoneText").oninput = (e) => { td.r2DoneText = e.target.value; debouncedLiveUpdate(); };

    document.getElementById("td_r3Confession").oninput = (e) => { td.r3Confession = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_r3Author").oninput = (e) => { td.r3Author = e.target.value; debouncedLiveUpdate(); };
    const updateReactions = () => {
      td.r3Reactions = [
        document.getElementById("td_r3rx0").value,
        document.getElementById("td_r3rx1").value,
        document.getElementById("td_r3rx2").value
      ];
      debouncedLiveUpdate();
    };
    document.getElementById("td_r3rx0").oninput = updateReactions;
    document.getElementById("td_r3rx1").oninput = updateReactions;
    document.getElementById("td_r3rx2").oninput = updateReactions;

    // P2 Win Challenges
    document.getElementById("td_p2R1Prompt").oninput = (e) => { td.p2R1Prompt = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2R1Opt1").oninput = (e) => { td.p2R1Opt1 = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2R1Opt2").oninput = (e) => { td.p2R1Opt2 = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2R2Prompt").oninput = (e) => { td.p2R2Prompt = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2R2DoneText").oninput = (e) => { td.p2R2DoneText = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2R3Prompt").oninput = (e) => { td.p2R3Prompt = e.target.value; debouncedLiveUpdate(); };

    // Verdicts
    document.getElementById("td_verdictTitle").oninput = (e) => { td.verdictTitle = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_verdictDesc").oninput = (e) => { td.verdictDesc = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2VerdictTitle").oninput = (e) => { td.p2VerdictTitle = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("td_p2VerdictDesc").oninput = (e) => { td.p2VerdictDesc = e.target.value; debouncedLiveUpdate(); };

    // Simulator Buttons
    document.getElementById("btnTodTestSpin").onclick = () => sendTodMsg({ type: "TOD_SPIN" });
    document.getElementById("btnTodRigP1").onclick = () => {
      td.rigMode = "p1_rigged";
      rigSelect.value = "p1_rigged";
      if (customWrap) customWrap.classList.add("hidden");
      sendTodMsg({ type: "TOD_SET_RIG", rigMode: "p1_rigged" });
      debouncedLiveUpdate();
    };
    document.getElementById("btnTodRigP2").onclick = () => {
      td.rigMode = "p2_rigged";
      rigSelect.value = "p2_rigged";
      if (customWrap) customWrap.classList.add("hidden");
      sendTodMsg({ type: "TOD_SET_RIG", rigMode: "p2_rigged" });
      debouncedLiveUpdate();
    };
    document.getElementById("btnTodFair").onclick = () => {
      td.rigMode = "fair";
      rigSelect.value = "fair";
      if (customWrap) customWrap.classList.add("hidden");
      sendTodMsg({ type: "TOD_SET_RIG", rigMode: "fair" });
      debouncedLiveUpdate();
    };
    document.getElementById("btnTodR1").onclick = () => sendTodMsg({ type: "TOD_JUMP_ROUND", round: 1 });
    document.getElementById("btnTodR2").onclick = () => sendTodMsg({ type: "TOD_JUMP_ROUND", round: 2 });
    document.getElementById("btnTodR3").onclick = () => sendTodMsg({ type: "TOD_JUMP_ROUND", round: 3 });
    document.getElementById("btnTodReset").onclick = () => sendTodMsg({ type: "TOD_RESET" });
  };
})();

