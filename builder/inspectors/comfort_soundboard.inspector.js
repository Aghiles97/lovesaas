/**
 * Builder Inspector Module: comfort_soundboard
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["comfort_soundboard"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.comfort_soundboard) state.sectionsData.comfort_soundboard = {};
    const cs = state.sectionsData.comfort_soundboard;
    const hero = state.sectionsData.hero || {};
    const p2Def = hero.partner2 || hero.partnerName || "Ella";

    if (!Array.isArray(cs.sounds)) {
      cs.sounds = [
        { id: "rain", name: "Soft Rainfall", icon: "🌧️", volume: 65 },
        { id: "fireplace", name: "Warm Hearth", icon: "🔥", volume: 50 },
        { id: "waves", name: "Ocean Shoreline", icon: "🌊", volume: 45 },
        { id: "breeze", name: "Night Breeze", icon: "🍃", volume: 35 },
        { id: "coffee", name: "Cozy Cafe", icon: "☕", volume: 30 }
      ];
    }
    const sounds = cs.sounds;

    if (!Array.isArray(cs.photos)) {
      cs.photos = [
        {
          url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80",
          caption: "Golden sunlight drifting through gentle forest leaves 🍃"
        },
        {
          url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
          caption: "Tidal waves carrying every single worry away into the sea 🌊"
        },
        {
          url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
          caption: "Infinite quiet stars watching over our eternal bond ✨"
        }
      ];
    }
    const photos = cs.photos;

    let soundsHtml = "";
    sounds.forEach((s, idx) => {
      soundsHtml += `
        <div class="item-editor-card" data-sound-idx="${idx}" style="margin-bottom: 10px;">
          <div class="item-editor-header">
            <span class="item-editor-title">${safeVal(s.icon || '🎵')} Channel #${idx + 1}: ${safeVal(s.name || s.id)}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button type="button" class="btn-subtle" data-move-sound="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
              <button type="button" class="btn-subtle" data-move-sound="${idx}" data-dir="1" title="Move later" ${idx === sounds.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
              <button type="button" class="btn-remove-item" data-remove-sound="${idx}">🗑️</button>
            </div>
          </div>
          <div class="grid-3" style="margin-top: 6px;">
            <div class="input-group">
              <label>Icon</label>
              <input type="text" class="cs-sound-icon" value="${safeVal(s.icon || '🎵')}">
            </div>
            <div class="input-group">
              <label>Sound Name</label>
              <input type="text" class="cs-sound-name" value="${safeVal(s.name || '')}">
            </div>
            <div class="input-group">
              <label>Default Vol (%)</label>
              <input type="number" class="cs-sound-volume" min="0" max="100" value="${s.volume != null ? s.volume : 50}">
            </div>
          </div>
        </div>
      `;
    });

    let photosHtml = "";
    photos.forEach((p, pIdx) => {
      photosHtml += `
        <div class="item-editor-card" data-photo-idx="${pIdx}" style="margin-bottom: 10px;">
          <div class="item-editor-header">
            <span class="item-editor-title">🖼️ Photo #${pIdx + 1}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button type="button" class="btn-subtle" data-move-photo="${pIdx}" data-dir="-1" title="Move earlier" ${pIdx === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
              <button type="button" class="btn-subtle" data-move-photo="${pIdx}" data-dir="1" title="Move later" ${pIdx === photos.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
              <button type="button" class="btn-remove-item" data-remove-photo="${pIdx}">🗑️</button>
            </div>
          </div>
          <div class="input-group" style="margin-top: 6px;">
            <label>Image URL</label>
            <input type="text" class="cs-photo-url" value="${safeVal(p.url || '')}" placeholder="https://...">
          </div>
          <div class="input-group" style="margin-top: 6px;">
            <label>Photo Caption</label>
            <input type="text" class="cs-photo-caption" value="${safeVal(p.caption || '')}" placeholder="Calming peaceful caption...">
          </div>
        </div>
      `;
    });

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎧 Comfort Soundboard Settings</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Tag / Badge</label>
            <input type="text" id="cs_tag" value="${safeVal(cs.tag || "Sanctuary of Peace 🎧")}">
          </div>
          <div class="input-group">
            <label>Section Title</label>
            <input type="text" id="cs_title" value="${safeVal(cs.title || "Comfort & Calming Soundboard")}">
          </div>
        </div>
        <div class="input-group">
          <label>Description / Instructions</label>
          <textarea id="cs_desc" rows="2">${safeVal(cs.desc || ("A dedicated quiet space for " + p2Def + " to unwind, listen to calming soundscapes, and flip through serene memories."))}</textarea>
        </div>
      </div>

      <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(224,242,254,0.6), rgba(255,255,255,0.9)); border: 1px dashed #0284c7;">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Live Ambience Testing</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Test Web Audio procedural ambient synthesis in live preview:</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btnTestSoundboardPlay" class="btn-builder-action" style="background: #0284c7; color: white;">▶ Play Ambience</button>
          <button type="button" id="btnTestSoundboardMute" class="btn-subtle" style="font-size: 0.78rem;">🔇 Mute All</button>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎚️ Ambient Sound Mixer Channels (${sounds.length})</span>
        </div>
        <div id="csSoundsContainer">${soundsHtml}</div>
        <button type="button" id="btnAddSoundChannel" class="btn-add-item" style="margin-top: 10px;">➕ Add Sound Channel</button>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🖼️ Calming Photo Stream Carousel (${photos.length})</span>
        </div>
        <div id="csPhotosContainer">${photosHtml}</div>
        <button type="button" id="btnAddPhotoSlide" class="btn-add-item" style="margin-top: 10px;">➕ Add Peaceful Photo</button>
      </div>
    `;

    const syncCsHeaders = () => {
      cs.tag = document.getElementById("cs_tag").value.trim();
      cs.title = document.getElementById("cs_title").value.trim();
      cs.desc = document.getElementById("cs_desc").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    ["cs_tag", "cs_title", "cs_desc"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", syncCsHeaders);
    });

    // Sound items binding
    document.querySelectorAll("#csSoundsContainer .item-editor-card").forEach(card => {
      const idx = parseInt(card.dataset.soundIdx, 10);
      const iconInp = card.querySelector(".cs-sound-icon");
      const nameInp = card.querySelector(".cs-sound-name");
      const volInp = card.querySelector(".cs-sound-volume");

      const updateSound = () => {
        sounds[idx].icon = iconInp.value;
        sounds[idx].name = nameInp.value;
        sounds[idx].volume = parseInt(volInp.value, 10) || 0;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };

      [iconInp, nameInp, volInp].forEach(inp => {
        if (inp) inp.addEventListener("input", updateSound);
      });

      const remBtn = card.querySelector(`[data-remove-sound="${idx}"]`);
      if (remBtn) {
        remBtn.onclick = () => {
          sounds.splice(idx, 1);
          renderWidgetInspector("comfort_soundboard");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        };
      }
    });

    document.querySelectorAll("[data-move-sound]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.moveSound, 10);
        const dir = parseInt(btn.dataset.dir, 10);
        const target = idx + dir;
        if (target >= 0 && target < sounds.length) {
          const [moved] = sounds.splice(idx, 1);
          sounds.splice(target, 0, moved);
          renderWidgetInspector("comfort_soundboard");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        }
      };
    });

    const btnAddSound = document.getElementById("btnAddSoundChannel");
    if (btnAddSound) {
      btnAddSound.onclick = () => {
        sounds.push({
          id: "sound_" + Date.now(),
          name: "Forest Birds",
          icon: "🐦",
          volume: 40
        });
        renderWidgetInspector("comfort_soundboard");
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
    }

    // Photo items binding
    document.querySelectorAll("#csPhotosContainer .item-editor-card").forEach(card => {
      const pIdx = parseInt(card.dataset.photoIdx, 10);
      const urlInp = card.querySelector(".cs-photo-url");
      const capInp = card.querySelector(".cs-photo-caption");

      const updatePhoto = () => {
        photos[pIdx].url = urlInp.value;
        photos[pIdx].caption = capInp.value;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };

      [urlInp, capInp].forEach(inp => {
        if (inp) inp.addEventListener("input", updatePhoto);
      });

      const remBtn = card.querySelector(`[data-remove-photo="${pIdx}"]`);
      if (remBtn) {
        remBtn.onclick = () => {
          photos.splice(pIdx, 1);
          renderWidgetInspector("comfort_soundboard");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        };
      }
    });

    document.querySelectorAll("[data-move-photo]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pIdx = parseInt(btn.dataset.movePhoto, 10);
        const dir = parseInt(btn.dataset.dir, 10);
        const target = pIdx + dir;
        if (target >= 0 && target < photos.length) {
          const [moved] = photos.splice(pIdx, 1);
          photos.splice(target, 0, moved);
          renderWidgetInspector("comfort_soundboard");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        }
      };
    });

    const btnAddPhoto = document.getElementById("btnAddPhotoSlide");
    if (btnAddPhoto) {
      btnAddPhoto.onclick = () => {
        photos.push({
          url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
          caption: "Tranquil misty dawn over peaceful mountains ⛰️"
        });
        renderWidgetInspector("comfort_soundboard");
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
    }

    // Live testing
    const btnPlay = document.getElementById("btnTestSoundboardPlay");
    if (btnPlay) {
      btnPlay.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "COMFORT_PLAY" }, "*");
          try { previewIframe.contentWindow.comfortSoundboardPlay?.(); } catch (e) {}
        }
      };
    }

    const btnMute = document.getElementById("btnTestSoundboardMute");
    if (btnMute) {
      btnMute.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "COMFORT_MUTE" }, "*");
          try { previewIframe.contentWindow.comfortSoundboardMute?.(); } catch (e) {}
        }
      };
    }
  };
})();
