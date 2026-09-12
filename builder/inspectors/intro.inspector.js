/**
 * Builder Inspector Module: intro
 * First Screen: Wax Sealed Intro Envelope & Opening Burst
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["intro"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {},
      escapeHtml = (s) => (s == null ? '' : String(s)),
      safeVal = (s) => (s == null ? '' : String(s).replace(/"/g, '&quot;'))
    } = ctx || {};

    if (!state.sectionsData) state.sectionsData = {};
    if (!state.sectionsData.intro) state.sectionsData.intro = {};
    const intro = state.sectionsData.intro;

    if (intro.enabled === undefined) intro.enabled = true;
    if (intro.title === undefined) intro.title = "Happy Birthday Ella 🎂❤️";
    if (intro.subtitle === undefined) intro.subtitle = "I created a special magical world for your birthday! Please pick our romantic song below 🎵, then tap the wax seal to enter your magical birthday world! 🎂✨";
    if (intro.recipientSubtext === undefined) intro.recipientSubtext = "A Magical Birthday World For";
    if (intro.recipientName === undefined) intro.recipientName = state.partner2 || "Ella";
    if (intro.senderClosing === undefined) intro.senderClosing = "From Aghiles with Infinite Lof & Birthday Kisses 🎂💕";
    if (intro.envelopeHint === undefined) intro.envelopeHint = "🎵 Choose our soundtrack above to enter your magical birthday world ✨";
    if (intro.sealEmoji === undefined) intro.sealEmoji = "❤️";
    if (intro.sealText === undefined) intro.sealText = "OPEN";
    if (intro.sealColor === undefined) intro.sealColor = "#c0392b";
    if (intro.flowerStyle === undefined) intro.flowerStyle = "royal-blend";
    if (intro.showFlowerSelector === undefined) intro.showFlowerSelector = true;
    if (intro.showSoundtrackSelector === undefined) intro.showSoundtrackSelector = true;
    if (intro.floatingEmojis === undefined) intro.floatingEmojis = "💖, 🎂, ✨, 💌, 🎁, 🎉";

    const sealSwatches = [
      { hex: '#c0392b', name: 'Crimson' },
      { hex: '#881337', name: 'Burgundy' },
      { hex: '#fb7185', name: 'Rose' },
      { hex: '#7c3aed', name: 'Purple' },
      { hex: '#d97706', name: 'Gold' },
      { hex: '#059669', name: 'Emerald' }
    ];

    const sealEmojiList = ['❤️', '💌', '💍', '🎂', '👑', '✨', '🌸', '💖'];

    const flowerThemes = [
      { id: 'royal-blend', label: 'Royal Mix', icon: '👑' },
      { id: 'garden-roses', label: 'Garden Roses', icon: '🌹' },
      { id: 'sakura-dream', label: 'Sakura Dream', icon: '🌸' },
      { id: 'golden-sunflower', label: 'Sunflowers', icon: '🌻' },
      { id: 'spring-tulips', label: 'Spring Tulips', icon: '🌷' },
      { id: 'lavender-lilac', label: 'Lilac & Viola', icon: '💜' }
    ];

    inspectorFormContainer.innerHTML = `
      <!-- ACTION ROW -->
      <div class="intro-action-row" style="display: flex; gap: 8px; margin-bottom: 16px; padding: 10px; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 8px;">
        <button type="button" class="btn-primary" id="btnIntroReseal" style="flex: 1; justify-content: center; font-size: 0.82rem; padding: 8px 10px;">
          ✉️ Reseal (Preview Screen 1)
        </button>
        <button type="button" class="btn-secondary" id="btnIntroBurst" style="flex: 1; justify-content: center; font-size: 0.82rem; padding: 8px 10px;">
          🌸 Test Opening Burst
        </button>
      </div>

      <!-- GENERAL & GATE SECTION -->
      <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #94a3b8); margin: 0 0 4px 0;">🛡️ Gate & Screen Settings</h4>
            <p style="font-size: 11px; color: var(--text-muted, #94a3b8); margin: 0;">Show wax sealed opening screen before entering website</p>
          </div>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">
            <input type="checkbox" id="intro_enabled" ${intro.enabled !== false ? 'checked' : ''}>
            <span>Enable Intro Gate Screen</span>
          </label>
        </div>
      </div>

      <!-- HEADING & WELCOME SECTION -->
      <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #94a3b8); margin-bottom: 12px;">👑 Heading & Welcome</h4>
        <div class="input-group" style="margin-bottom: 12px;">
          <label>Main Heading</label>
          <input type="text" id="intro_title" value="${safeVal(intro.title)}">
        </div>
        <div class="input-group">
          <label>Intro Subtitle / Prompt</label>
          <textarea id="intro_subtitle" rows="3">${escapeHtml(intro.subtitle)}</textarea>
        </div>
      </div>

      <!-- LETTER & ENVELOPE DETAILS SECTION -->
      <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #94a3b8); margin-bottom: 12px;">📜 Letter & Envelope Details</h4>
        <div class="grid-2" style="margin-bottom: 12px;">
          <div class="input-group">
            <label>Letter Subtitle</label>
            <input type="text" id="intro_recipientSubtext" value="${safeVal(intro.recipientSubtext)}">
          </div>
          <div class="input-group">
            <label>Recipient Name</label>
            <input type="text" id="intro_recipientName" value="${safeVal(intro.recipientName)}">
          </div>
        </div>
        <div class="input-group" style="margin-bottom: 12px;">
          <label>Sender Closing Note</label>
          <input type="text" id="intro_senderClosing" value="${safeVal(intro.senderClosing)}">
        </div>
        <div class="input-group">
          <label>Envelope Hint Text</label>
          <input type="text" id="intro_envelopeHint" value="${safeVal(intro.envelopeHint)}">
        </div>
      </div>

      <!-- WAX SEAL CUSTOMIZATION SECTION -->
      <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #94a3b8); margin-bottom: 12px;">💌 Wax Seal Customization</h4>
        
        <div class="input-group" style="margin-bottom: 12px;">
          <label>Seal Emoji</label>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <input type="text" id="intro_sealEmoji" style="max-width: 70px; text-align: center; font-size: 1.2rem;" value="${safeVal(intro.sealEmoji)}">
            <div class="seal-emoji-chips" style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${sealEmojiList.map(em => `
                <button type="button" class="btn-secondary seal-emoji-chip" data-emoji="${em}" style="padding: 4px 8px; font-size: 1rem; cursor: pointer; border-radius: 6px;">${em}</button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="input-group" style="margin-bottom: 12px;">
          <label>Seal Text</label>
          <input type="text" id="intro_sealText" value="${safeVal(intro.sealText)}">
        </div>

        <div class="input-group">
          <label>Seal Color</label>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <input type="color" id="intro_sealColor" value="${intro.sealColor || '#c0392b'}" style="width: 38px; height: 34px; padding: 2px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border-color, #334155); background: transparent;">
            <input type="text" id="intro_sealColorText" value="${safeVal(intro.sealColor || '#c0392b')}" style="width: 90px; text-transform: uppercase; font-family: monospace;">
            <div class="seal-color-swatches" style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              ${sealSwatches.map(s => `
                <button type="button" class="seal-swatch-btn ${intro.sealColor === s.hex ? 'active' : ''}" data-color="${s.hex}" title="${s.name} (${s.hex})" style="width: 24px; height: 24px; border-radius: 50%; background: ${s.hex}; border: 2px solid ${intro.sealColor === s.hex ? '#ffffff' : 'transparent'}; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.3); outline: none; transition: transform 0.15s ease;"></button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- FLOWER BURST CUSTOMIZATION SECTION -->
      <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #94a3b8); margin-bottom: 12px;">🌸 Flower Burst Customization</h4>
        
        <div class="input-group" style="margin-bottom: 12px;">
          <label>Opening Flower Theme</label>
          <select id="intro_flowerStyle" class="inspector-select" style="margin-bottom: 8px; width: 100%; padding: 8px 10px; border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid var(--border-color, #334155);">
            <option value="royal-blend" ${intro.flowerStyle === 'royal-blend' ? 'selected' : ''}>Royal Mix (🌹 🌸 🌺)</option>
            <option value="garden-roses" ${intro.flowerStyle === 'garden-roses' ? 'selected' : ''}>Garden Roses (🌹 🥀 🌺)</option>
            <option value="sakura-dream" ${intro.flowerStyle === 'sakura-dream' ? 'selected' : ''}>Sakura Dream (🌸 💮 🍃)</option>
            <option value="golden-sunflower" ${intro.flowerStyle === 'golden-sunflower' ? 'selected' : ''}>Sunflowers (🌻 🌾 💛)</option>
            <option value="spring-tulips" ${intro.flowerStyle === 'spring-tulips' ? 'selected' : ''}>Spring Tulips (🌷 💐 🌱)</option>
            <option value="lavender-lilac" ${intro.flowerStyle === 'lavender-lilac' ? 'selected' : ''}>Lilac & Viola (💜 🪻 🍇)</option>
          </select>
          <div class="flower-theme-chips" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
            ${flowerThemes.map(th => `
              <button type="button" class="btn-secondary flower-theme-chip ${intro.flowerStyle === th.id ? 'active' : ''}" data-style="${th.id}" style="padding: 3px 8px; font-size: 0.75rem; border-radius: 6px; ${intro.flowerStyle === th.id ? 'border-color: #fb7185; color: #fb7185; background: rgba(244,63,94,0.1);' : ''}">
                ${th.icon} ${th.label}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 4px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; font-weight: 500;">
            <input type="checkbox" id="intro_showFlowerSelector" ${intro.showFlowerSelector !== false ? 'checked' : ''}>
            <span>Show Flower Selector on Screen</span>
          </label>
        </div>
      </div>

      <!-- SOUNDTRACK SELECTION SECTION -->
      <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #94a3b8); margin-bottom: 12px;">🎵 Soundtrack Selection</h4>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; font-weight: 500;">
            <input type="checkbox" id="intro_showSoundtrackSelector" ${intro.showSoundtrackSelector !== false ? 'checked' : ''}>
            <span>Show Soundtrack Picker on Screen</span>
          </label>
        </div>
      </div>

      <!-- FLOATING ATMOSPHERE SECTION -->
      <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, rgba(255,255,255,0.08)); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #94a3b8); margin-bottom: 12px;">✨ Floating Atmosphere</h4>
        <div class="input-group">
          <label>Floating Background Emojis (comma-separated)</label>
          <input type="text" id="intro_floatingEmojis" value="${safeVal(intro.floatingEmojis)}">
        </div>
      </div>
    `;

    const postToPreview = (msg) => {
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(msg, '*');
      }
    };

    const syncIntro = () => {
      const enEl = document.getElementById('intro_enabled');
      const tiEl = document.getElementById('intro_title');
      const suEl = document.getElementById('intro_subtitle');
      const rsubEl = document.getElementById('intro_recipientSubtext');
      const rnamEl = document.getElementById('intro_recipientName');
      const sendEl = document.getElementById('intro_senderClosing');
      const hintEl = document.getElementById('intro_envelopeHint');
      const semoEl = document.getElementById('intro_sealEmoji');
      const stxtEl = document.getElementById('intro_sealText');
      const scolEl = document.getElementById('intro_sealColor');
      const fstyEl = document.getElementById('intro_flowerStyle');
      const sflwEl = document.getElementById('intro_showFlowerSelector');
      const ssndEl = document.getElementById('intro_showSoundtrackSelector');
      const emojEl = document.getElementById('intro_floatingEmojis');

      if (enEl) intro.enabled = enEl.checked;
      if (tiEl) intro.title = tiEl.value;
      if (suEl) intro.subtitle = suEl.value;
      if (rsubEl) intro.recipientSubtext = rsubEl.value;
      if (rnamEl) intro.recipientName = rnamEl.value;
      if (sendEl) intro.senderClosing = sendEl.value;
      if (hintEl) intro.envelopeHint = hintEl.value;
      if (semoEl) intro.sealEmoji = semoEl.value;
      if (stxtEl) intro.sealText = stxtEl.value;
      if (scolEl) intro.sealColor = scolEl.value;
      if (fstyEl) intro.flowerStyle = fstyEl.value;
      if (sflwEl) intro.showFlowerSelector = sflwEl.checked;
      if (ssndEl) intro.showSoundtrackSelector = ssndEl.checked;
      if (emojEl) intro.floatingEmojis = emojEl.value;

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    // Reseal button
    const btnReseal = document.getElementById('btnIntroReseal');
    if (btnReseal) {
      btnReseal.onclick = () => {
        postToPreview({ type: 'SET_PREVIEW_SCREEN', screen: 'intro' });
        const btnIntro = document.getElementById('btnPreviewScreenIntro');
        const btnCore = document.getElementById('btnPreviewScreenCore');
        if (btnIntro) btnIntro.classList.add('active');
        if (btnCore) btnCore.classList.remove('active');
      };
    }

    // Burst button
    const btnBurst = document.getElementById('btnIntroBurst');
    if (btnBurst) {
      btnBurst.onclick = () => {
        postToPreview({ type: 'INTRO_ENVELOPE_TRIGGER_OPEN' });
      };
    }

    // Text & textarea inputs
    [
      'intro_title',
      'intro_subtitle',
      'intro_recipientSubtext',
      'intro_recipientName',
      'intro_senderClosing',
      'intro_envelopeHint',
      'intro_sealEmoji',
      'intro_sealText',
      'intro_floatingEmojis'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', syncIntro);
    });

    // Checkboxes
    ['intro_enabled', 'intro_showFlowerSelector', 'intro_showSoundtrackSelector'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', syncIntro);
    });

    // Seal color picker & text
    const sealColorInput = document.getElementById('intro_sealColor');
    const sealColorText = document.getElementById('intro_sealColorText');
    const updateSwatches = (color) => {
      inspectorFormContainer.querySelectorAll('.seal-swatch-btn').forEach(btn => {
        const isMatch = (btn.dataset.color || '').toLowerCase() === (color || '').toLowerCase();
        btn.style.border = isMatch ? '2px solid #ffffff' : '2px solid transparent';
      });
    };

    if (sealColorInput) {
      sealColorInput.addEventListener('input', (e) => {
        if (sealColorText) sealColorText.value = e.target.value.toUpperCase();
        updateSwatches(e.target.value);
        syncIntro();
      });
    }

    if (sealColorText) {
      sealColorText.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          if (sealColorInput) sealColorInput.value = val;
          updateSwatches(val);
          syncIntro();
        }
      });
    }

    // Swatches click
    inspectorFormContainer.querySelectorAll('.seal-swatch-btn').forEach(btn => {
      btn.onclick = () => {
        const c = btn.dataset.color;
        if (sealColorInput) sealColorInput.value = c;
        if (sealColorText) sealColorText.value = c.toUpperCase();
        updateSwatches(c);
        syncIntro();
      };
    });

    // Emoji chips click
    inspectorFormContainer.querySelectorAll('.seal-emoji-chip').forEach(btn => {
      btn.onclick = () => {
        const em = btn.dataset.emoji;
        const input = document.getElementById('intro_sealEmoji');
        if (input) {
          input.value = em;
          syncIntro();
        }
      };
    });

    // Flower theme select & chips
    const flowerSelect = document.getElementById('intro_flowerStyle');
    const updateFlowerChips = (styleId) => {
      inspectorFormContainer.querySelectorAll('.flower-theme-chip').forEach(chip => {
        const isCur = chip.dataset.style === styleId;
        chip.style.borderColor = isCur ? '#fb7185' : '';
        chip.style.color = isCur ? '#fb7185' : '';
        chip.style.background = isCur ? 'rgba(244,63,94,0.1)' : '';
      });
    };

    if (flowerSelect) {
      flowerSelect.addEventListener('change', (e) => {
        updateFlowerChips(e.target.value);
        syncIntro();
      });
    }

    inspectorFormContainer.querySelectorAll('.flower-theme-chip').forEach(chip => {
      chip.onclick = () => {
        const s = chip.dataset.style;
        if (flowerSelect) flowerSelect.value = s;
        updateFlowerChips(s);
        syncIntro();
      };
    });
  };
})();
