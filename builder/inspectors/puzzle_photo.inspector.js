/**
 * Builder Inspector Module: puzzle_photo.inspector.js
 * Dynamic Customization for Memory Photo Puzzle:
 * Photo Presets & Cloudflare R2 Upload, Difficulty & Game Mode Defaults,
 * Keepsake Love Letter & WhatsApp Reward, Live Test Controls & Real-time Iframe Sync.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  const PHOTO_PRESETS = [
    { name: "Garden Roses Hug 🌸", url: "/public/images/puzzle-couple.jpg" },
    { name: "Sunset Beach", url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80" },
    { name: "Parisian Romance", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80" },
    { name: "Candlelight Dinner", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
    { name: "Starlit Night", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80" }
  ];

  window.WIDGET_INSPECTORS["puzzle_photo"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = null,
      previewIframe = null
    } = ctx || {};

    const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

    if (!state.sectionsData.puzzle_photo || typeof state.sectionsData.puzzle_photo !== "object") {
      state.sectionsData.puzzle_photo = {
        tag: "Memory Puzzle 🧩",
        title: "Piece Our Love Together",
        desc: "Solve the puzzle to reveal our special memory & secret note.",
        photoUrl: "/public/images/puzzle-couple.jpg",
        mode: "slide",
        gridSize: 3,
        allowModeSwitch: true,
        allowHints: true,
        sfxEnabled: true,
        hapticsEnabled: true,
        reward: {
          badge: "💌 Secret Keepsake Unlocked",
          title: "You Complete My World 💕",
          letter: "« Every single moment, laugh, and adventure we share fits into my heart like the final missing piece of an eternal puzzle. I love you endlessly! »",
          actionText: "Claim Romantic Date 🥂",
          actionUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent("I solved our photo puzzle! Time to claim my romantic date! ❤️🥂")}`
        }
      };
    }

    const pz = state.sectionsData.puzzle_photo;
    if (!pz.reward) pz.reward = {};

    const postToPreview = (message) => {
      try {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage(message, "*");
        }
      } catch (e) {}
    };

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-group">
        <!-- Live Action Testing Bar -->
        <div style="background:rgba(255,84,112,0.08); border:1px solid rgba(255,84,112,0.25); border-radius:12px; padding:12px; margin-bottom:18px;">
          <label style="font-size:0.75rem; font-weight:800; color:var(--primary, #ff5470); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:8px;">
            ⚡ Quick Test Controls
          </label>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" id="btnTestScramble" class="btn btn-secondary btn-sm" style="flex:1; min-width:100px;">
              <span>🔀</span> Scramble
            </button>
            <button type="button" id="btnTestSolve" class="btn btn-secondary btn-sm" style="flex:1; min-width:100px;">
              <span>✨</span> Auto-Solve
            </button>
            <button type="button" id="btnTestKeepsake" class="btn btn-primary btn-sm" style="flex:1; min-width:110px;">
              <span>💌</span> Open Keepsake
            </button>
          </div>
        </div>

        <!-- Section Header Metadata -->
        <div class="form-group mb-3">
          <label class="form-label">Section Tag / Badge</label>
          <input type="text" id="pz_tag" class="form-control" value="${esc(pz.tag || 'Memory Puzzle 🧩')}" />
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Headline Title</label>
          <input type="text" id="pz_title" class="form-control" value="${esc(pz.title || 'Piece Our Love Together')}" />
        </div>

        <div class="form-group mb-4">
          <label class="form-label">Subtitle Description</label>
          <textarea id="pz_desc" class="form-control" rows="2">${esc(pz.desc || '')}</textarea>
        </div>

        <!-- Photo & Image Selector Card -->
        <div style="background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:14px; padding:14px; margin-bottom:20px;">
          <label style="font-size:0.85rem; font-weight:700; color:var(--text-color, #1e293b); display:block; margin-bottom:8px;">
            🖼️ Puzzle Photo
          </label>
          
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
            <div style="width:64px; height:64px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; flex-shrink:0;">
              <img id="pz_previewThumb" src="${esc(pz.photoUrl)}" style="width:100%; height:100%; object-fit:cover;" alt="Preview" />
            </div>
            <div style="flex:1;">
              <input type="text" id="pz_photoUrl" class="form-control" value="${esc(pz.photoUrl)}" placeholder="Image URL..." style="font-size:0.82rem;" />
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <label class="btn btn-secondary btn-sm" style="cursor:pointer; flex:1; text-align:center; margin:0;">
              <span>📁</span> Upload Photo
              <input type="file" id="pz_fileUpload" accept="image/*" style="display:none;" />
            </label>
          </div>

          <label style="font-size:0.75rem; color:#64748b; font-weight:600; display:block; margin-bottom:6px;">Or Pick a Romantic Preset:</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            ${PHOTO_PRESETS.map(p => `
              <button type="button" class="btn btn-sm btn-outline-secondary pz-preset-btn" data-url="${esc(p.url)}" style="font-size:0.75rem; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${esc(p.name)}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Gameplay Settings -->
        <div style="background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:14px; padding:14px; margin-bottom:20px;">
          <label style="font-size:0.85rem; font-weight:700; color:var(--text-color, #1e293b); display:block; margin-bottom:12px;">
            ⚙️ Gameplay Options
          </label>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label" style="font-size:0.8rem;">Default Mode</label>
              <select id="pz_mode" class="form-select">
                <option value="slide" ${pz.mode === 'slide' ? 'selected' : ''}>Tap-to-Slide (15-Puzzle)</option>
                <option value="swap" ${pz.mode === 'swap' ? 'selected' : ''}>Tap-to-Swap (Casual)</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label" style="font-size:0.8rem;">Default Grid</label>
              <select id="pz_gridSize" class="form-select">
                <option value="3" ${Number(pz.gridSize) === 3 ? 'selected' : ''}>3×3 (Casual - 8 tiles)</option>
                <option value="4" ${Number(pz.gridSize) === 4 ? 'selected' : ''}>4×4 (Classic - 15 tiles)</option>
                <option value="5" ${Number(pz.gridSize) === 5 ? 'selected' : ''}>5×5 (Master - 24 tiles)</option>
              </select>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer;">
              <input type="checkbox" id="pz_allowModeSwitch" ${pz.allowModeSwitch !== false ? 'checked' : ''} />
              <span>Allow player to switch modes on HUD</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer;">
              <input type="checkbox" id="pz_allowHints" ${pz.allowHints !== false ? 'checked' : ''} />
              <span>Enable Peek &amp; Number Guide buttons</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer;">
              <input type="checkbox" id="pz_sfxEnabled" ${pz.sfxEnabled !== false ? 'checked' : ''} />
              <span>Procedural audio sound effects</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer;">
              <input type="checkbox" id="pz_hapticsEnabled" ${pz.hapticsEnabled !== false ? 'checked' : ''} />
              <span>Mobile tactile vibration (haptics)</span>
            </label>
          </div>
        </div>

        <!-- Secret Keepsake Reward Card -->
        <div style="background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:14px; padding:14px; margin-bottom:20px;">
          <label style="font-size:0.85rem; font-weight:700; color:var(--text-color, #1e293b); display:block; margin-bottom:10px;">
            🏆 Secret Keepsake Reward
          </label>

          <div class="form-group mb-2">
            <label class="form-label" style="font-size:0.8rem;">Ribbon Badge</label>
            <input type="text" id="pz_rewardBadge" class="form-control" value="${esc(pz.reward.badge || '💌 Secret Keepsake Unlocked')}" />
          </div>

          <div class="form-group mb-2">
            <label class="form-label" style="font-size:0.8rem;">Reward Title</label>
            <input type="text" id="pz_rewardTitle" class="form-control" value="${esc(pz.reward.title || 'You Complete My World 💕')}" />
          </div>

          <div class="form-group mb-2">
            <label class="form-label" style="font-size:0.8rem;">Love Note / Dedication</label>
            <textarea id="pz_rewardLetter" class="form-control" rows="3">${esc(pz.reward.letter || '')}</textarea>
          </div>

          <div class="row g-2">
            <div class="col-6">
              <label class="form-label" style="font-size:0.8rem;">Action CTA Label</label>
              <input type="text" id="pz_actionText" class="form-control" value="${esc(pz.reward.actionText || 'Claim Romantic Date 🥂')}" />
            </div>
            <div class="col-6">
              <label class="form-label" style="font-size:0.8rem;">WhatsApp / Link URL</label>
              <input type="text" id="pz_actionUrl" class="form-control" value="${esc(pz.reward.actionUrl || '')}" />
            </div>
          </div>
        </div>
      </div>
    `;

    // Event Bindings
    const syncField = (id, targetObj, key) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          targetObj[key] = el.value;
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        });
      }
    };

    const syncCheckbox = (id, targetObj, key) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => {
          targetObj[key] = el.checked;
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        });
      }
    };

    syncField("pz_tag", pz, "tag");
    syncField("pz_title", pz, "title");
    syncField("pz_desc", pz, "desc");

    const photoInput = document.getElementById("pz_photoUrl");
    if (photoInput) {
      photoInput.addEventListener("input", () => {
        pz.photoUrl = photoInput.value;
        const thumb = document.getElementById("pz_previewThumb");
        if (thumb) thumb.src = photoInput.value;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      });
    }

    // Photo Presets
    inspectorFormContainer.querySelectorAll(".pz-preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const url = btn.dataset.url;
        if (url) {
          pz.photoUrl = url;
          if (photoInput) photoInput.value = url;
          const thumb = document.getElementById("pz_previewThumb");
          if (thumb) thumb.src = url;
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        }
      });
    });

    // Cloudflare R2 Upload
    const fileUpload = document.getElementById("pz_fileUpload");
    if (fileUpload && typeof uploadFileToR2 === "function") {
      fileUpload.addEventListener("change", async () => {
        const file = fileUpload.files?.[0];
        if (!file) return;
        try {
          const uploadedUrl = await uploadFileToR2(file);
          if (uploadedUrl) {
            pz.photoUrl = uploadedUrl;
            if (photoInput) photoInput.value = uploadedUrl;
            const thumb = document.getElementById("pz_previewThumb");
            if (thumb) thumb.src = uploadedUrl;
            debouncedLiveUpdate();
            debouncedAutoSaveLayout();
          }
        } catch (err) {
          console.error("Failed to upload photo:", err);
        }
      });
    }

    const modeSelect = document.getElementById("pz_mode");
    if (modeSelect) {
      modeSelect.addEventListener("change", () => {
        pz.mode = modeSelect.value;
        postToPreview({ type: "PUZZLE_SET_MODE", mode: pz.mode });
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      });
    }

    const sizeSelect = document.getElementById("pz_gridSize");
    if (sizeSelect) {
      sizeSelect.addEventListener("change", () => {
        pz.gridSize = Number(sizeSelect.value);
        postToPreview({ type: "PUZZLE_SET_SIZE", size: pz.gridSize });
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      });
    }

    syncCheckbox("pz_allowModeSwitch", pz, "allowModeSwitch");
    syncCheckbox("pz_allowHints", pz, "allowHints");
    syncCheckbox("pz_sfxEnabled", pz, "sfxEnabled");
    syncCheckbox("pz_hapticsEnabled", pz, "hapticsEnabled");

    syncField("pz_rewardBadge", pz.reward, "badge");
    syncField("pz_rewardTitle", pz.reward, "title");
    syncField("pz_rewardLetter", pz.reward, "letter");
    syncField("pz_actionText", pz.reward, "actionText");
    syncField("pz_actionUrl", pz.reward, "actionUrl");

    // Live Actions
    document.getElementById("btnTestScramble")?.addEventListener("click", () => {
      postToPreview({ type: "PUZZLE_SCRAMBLE" });
    });
    document.getElementById("btnTestSolve")?.addEventListener("click", () => {
      postToPreview({ type: "PUZZLE_SOLVE" });
    });
    document.getElementById("btnTestKeepsake")?.addEventListener("click", () => {
      postToPreview({ type: "PUZZLE_OPEN_KEEPSAKE" });
    });
  };
})();
