(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  const PHOTO_PRESETS = [
    { name: "Romantic Hug 🌸", url: "/public/images/landing-v2/avatar-couple-1.jpg" },
    { name: "Sunset Beach 🌅", url: "/public/images/landing-v2/avatar-couple-2.png" },
    { name: "Garden Stroll 🌿", url: "/public/images/landing-v2/avatar-couple-3.jpg" },
    { name: "Cozy Couple ☕", url: "/public/images/puzzle-couple.jpg" }
  ];

  window.WIDGET_INSPECTORS["photobooth"] = function(container, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = null,
      previewIframe = null
    } = ctx || {};

    const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

    if (!state.sectionsData.photobooth || typeof state.sectionsData.photobooth !== "object") {
      state.sectionsData.photobooth = {};
    }
    const pb = state.sectionsData.photobooth;
    const hero = state.hero || {};

    if (!pb.tag) pb.tag = "Vintage Photobooth 📸";
    if (!pb.title) pb.title = "Capture Our Sweet Moments";
    if (!pb.desc) pb.desc = "Pick a retro frame, strike your cutest poses, and print a personalized love strip keepsake!";
    if (!pb.partner1) pb.partner1 = hero.partner1 || "Alex";
    if (!pb.partner2) pb.partner2 = hero.partner2 || "Sam";
    if (!pb.defaultFormat) pb.defaultFormat = "classic_3cut";
    if (!pb.defaultLayout) pb.defaultLayout = pb.defaultFormat;
    if (!pb.defaultStyle) pb.defaultStyle = "style_cyan_stars";
    if (!pb.defaultFilter) pb.defaultFilter = "vintage_90s";
    if (pb.countdownSeconds === undefined) pb.countdownSeconds = 3;
    if (pb.sfxEnabled === undefined) pb.sfxEnabled = true;
    if (pb.hapticsEnabled === undefined) pb.hapticsEnabled = true;
    if (pb.showDate === undefined) pb.showDate = false;
    if (pb.dateStampEnabled === undefined) pb.dateStampEnabled = false;
    if (pb.filmGrainEnabled === undefined) pb.filmGrainEnabled = true;
    if (pb.flashEnabled === undefined) pb.flashEnabled = true;
    if (pb.isMirror === undefined) pb.isMirror = true;
    if (pb.allowStickers === undefined) pb.allowStickers = true;
    if (!pb.stripCaption) pb.stripCaption = `${pb.partner1} & ${pb.partner2} ♡ Forever`;
    if (!pb.stripLocation) pb.stripLocation = "";
    if (!Array.isArray(pb.samplePhotos) || !pb.samplePhotos.length) {
      pb.samplePhotos = [
        "/public/images/landing-v2/avatar-couple-1.jpg",
        "/public/images/landing-v2/avatar-couple-2.png",
        "/public/images/landing-v2/avatar-couple-3.jpg",
        "/public/images/puzzle-couple.jpg"
      ];
    }

    const post = (msg) => {
      try {
        previewIframe?.contentWindow?.postMessage(msg, "*");
      } catch (e) {}
    };

    const renderPhotosList = () => {
      const listEl = document.getElementById("pb_photosList");
      if (!listEl) return;
      listEl.innerHTML = pb.samplePhotos.map((url, idx) => `
        <div style="position:relative; width:56px; height:56px; border-radius:6px; overflow:hidden; border:1px solid #cbd5e1; flex-shrink:0;">
          <img src="${esc(url)}" alt="Photo ${idx + 1}" style="width:100%; height:100%; object-fit:cover;">
          <button type="button" class="pb-del-photo-btn" data-idx="${idx}" title="Remove photo" style="position:absolute; top:2px; right:2px; width:18px; height:18px; border-radius:50%; background:rgba(0,0,0,0.7); color:#fff; border:none; font-size:10px; line-height:1; display:flex; align-items:center; justify-content:center; cursor:pointer;">✕</button>
        </div>
      `).join("");

      listEl.querySelectorAll(".pb-del-photo-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const i = Number(btn.dataset.idx);
          pb.samplePhotos.splice(i, 1);
          renderPhotosList();
          post({ type: "PHOTOBOOTH_SET_PHOTOS", photos: pb.samplePhotos });
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        });
      });
    };

    container.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Booth Machine Simulator</span>
        </div>
        <p style="font-size:0.75rem; color:#64748b; margin-bottom:8px;">
          Test live camera triggers, photo printing, and strip export in the preview.
        </p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:6px;">
          <button type="button" id="btnTestBoothBurst" class="btn-subtle" style="padding:7px 10px; font-weight:600; font-size:0.78rem;">
            📸 Test Burst
          </button>
          <button type="button" id="btnTestBoothFlash" class="btn-subtle" style="padding:7px 10px; font-weight:600; font-size:0.78rem;">
            ⚡ Shutter Flash
          </button>
          <button type="button" id="btnTestBoothSamples" class="btn-subtle" style="padding:7px 10px; font-weight:600; font-size:0.78rem;">
            🖼️ Use Samples
          </button>
          <button type="button" id="btnTestBoothShuffle" class="btn-subtle" style="padding:7px 10px; font-weight:600; font-size:0.78rem;">
            🔀 Shuffle Shots
          </button>
          <button type="button" id="btnTestBoothReset" class="btn-subtle" style="padding:7px 10px; font-weight:600; font-size:0.78rem;">
            🔄 Booth Lobby
          </button>
          <button type="button" id="btnTestBoothExport" class="btn-subtle" style="padding:7px 10px; font-weight:600; font-size:0.78rem;">
            💾 Export PNG
          </button>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎞️ Frame Format & Layout</span>
        </div>
        <div class="input-group">
          <label>Default Layout Format</label>
          <select id="pb_format">
            <option value="classic_3cut" ${pb.defaultFormat === "classic_3cut" ? "selected" : ""}>1×3 Strip (3 shots - Default)</option>
            <option value="film_grid" ${pb.defaultFormat === "film_grid" ? "selected" : ""}>2×2 Grid (4 shots)</option>
            <option value="grid_3x3" ${pb.defaultFormat === "grid_3x3" ? "selected" : ""}>3×3 Grid (9 shots)</option>
            <option value="classic_strip" ${pb.defaultFormat === "classic_strip" ? "selected" : ""}>1×4 Strip (4 shots)</option>
            <option value="portrait_pair" ${pb.defaultFormat === "portrait_pair" ? "selected" : ""}>1×2 Pair (2 shots)</option>
            <option value="wide_collage" ${pb.defaultFormat === "wide_collage" ? "selected" : ""}>Wide Collage (3 shots)</option>
            <option value="polaroid_single" ${pb.defaultFormat === "polaroid_single" ? "selected" : ""}>Polaroid Single (1 shot)</option>
          </select>
        </div>

        <div class="grid-2">
          <div class="input-group">
            <label>Border Style Theme</label>
            <select id="pb_style">
              <option value="style_cyan_stars" ${pb.defaultStyle === "style_cyan_stars" ? "selected" : ""}>★ Cyan Stars</option>
              <option value="style_floral" ${pb.defaultStyle === "style_floral" ? "selected" : ""}>🌸 Mint Floral</option>
              <option value="style_retro_swirl" ${pb.defaultStyle === "style_retro_swirl" ? "selected" : ""}>🌀 70s Swirls</option>
              <option value="style_lavender_stripes" ${pb.defaultStyle === "style_lavender_stripes" ? "selected" : ""}>💜 Lavender Stripes</option>
              <option value="style_noir_film" ${pb.defaultStyle === "style_noir_film" ? "selected" : ""}>🎞️ 35mm Noir Film</option>
              <option value="style_y2k_pink" ${pb.defaultStyle === "style_y2k_pink" ? "selected" : ""}>🎀 Y2K Hot Pink</option>
              <option value="style_newspaper" ${pb.defaultStyle === "style_newspaper" ? "selected" : ""}>📰 Newspaper</option>
              <option value="style_minimal_white" ${pb.defaultStyle === "style_minimal_white" ? "selected" : ""}>🤍 Minimal Museum</option>
            </select>
          </div>
          <div class="input-group">
            <label>Color Filter</label>
            <select id="pb_filter">
              <option value="vintage_90s" ${pb.defaultFilter === "vintage_90s" ? "selected" : ""}>90s Film</option>
              <option value="bw_noir" ${pb.defaultFilter === "bw_noir" ? "selected" : ""}>B&W Noir</option>
              <option value="golden_sunset" ${pb.defaultFilter === "golden_sunset" ? "selected" : ""}>Golden Sunset</option>
              <option value="dreamy_bloom" ${pb.defaultFilter === "dreamy_bloom" ? "selected" : ""}>Dreamy Bloom</option>
              <option value="cyberpunk" ${pb.defaultFilter === "cyberpunk" ? "selected" : ""}>Cyberpunk</option>
              <option value="natural" ${pb.defaultFilter === "natural" ? "selected" : ""}>Natural</option>
            </select>
          </div>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">💍 Couple & Keepsake Branding</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Partner 1 Name</label>
            <input type="text" id="pb_p1" value="${esc(pb.partner1)}">
          </div>
          <div class="input-group">
            <label>Partner 2 Name</label>
            <input type="text" id="pb_p2" value="${esc(pb.partner2)}">
          </div>
        </div>
        <div class="input-group">
          <label>Keepsake Strip Caption</label>
          <input type="text" id="pb_caption" value="${esc(pb.stripCaption)}" placeholder="Alex & Sam ♡ Forever">
        </div>
        <div class="input-group">
          <label>Location & Subtitle Line</label>
          <input type="text" id="pb_location" value="${esc(pb.stripLocation)}" placeholder="PARIS • 2026">
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🖼️ Couple Photos & Presets</span>
        </div>
        <p style="font-size:0.75rem; color:#64748b; margin-bottom:8px;">
          Photos displayed when camera is unavailable or when user taps "Use Sample Photos".
        </p>

        <div style="display:flex; gap:8px; align-items:center; overflow-x:auto; padding-bottom:6px; margin-bottom:10px;" id="pb_photosList">
        </div>

        <div style="display:flex; gap:8px; margin-bottom:10px;">
          <label class="btn btn-secondary btn-sm" style="cursor:pointer; flex:1; text-align:center; margin:0; padding:6px 12px; font-weight:600;">
            <span>📁</span> Upload Photo
            <input type="file" id="pb_fileUpload" accept="image/*" style="display:none;">
          </label>
        </div>

        <label style="font-size:0.72rem; color:#64748b; font-weight:600; display:block; margin-bottom:6px;">Add Preset Photo:</label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          ${PHOTO_PRESETS.map((p) => `
            <button type="button" class="btn btn-sm btn-outline-secondary pb-preset-btn" data-url="${esc(p.url)}" style="font-size:0.72rem; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${esc(p.name)}
            </button>
          `).join("")}
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚙️ Machine Hardware & Effects</span>
        </div>

        <div class="grid-2">
          <div class="input-group">
            <label>Countdown Timer</label>
            <select id="pb_countdown">
              <option value="3" ${Number(pb.countdownSeconds) === 3 ? "selected" : ""}>3 Seconds</option>
              <option value="5" ${Number(pb.countdownSeconds) === 5 ? "selected" : ""}>5 Seconds</option>
              <option value="10" ${Number(pb.countdownSeconds) === 10 ? "selected" : ""}>10 Seconds</option>
            </select>
          </div>
          <div class="input-group">
            <label>Selfie Mirror</label>
            <select id="pb_mirror">
              <option value="true" ${pb.isMirror ? "selected" : ""}>Mirrored (Selfie)</option>
              <option value="false" ${!pb.isMirror ? "selected" : ""}>Direct (Standard)</option>
            </select>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
          <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:0.83rem; cursor:pointer;">
            <input type="checkbox" id="pb_sfx" ${pb.sfxEnabled ? "checked" : ""}>
            <span>🔊 Web Audio Mechanical Shutter & Motor Hum</span>
          </label>
          <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:0.83rem; cursor:pointer;">
            <input type="checkbox" id="pb_haptics" ${pb.hapticsEnabled ? "checked" : ""}>
            <span>📳 Mobile Haptic Vibration</span>
          </label>
          <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:0.83rem; cursor:pointer;">
            <input type="checkbox" id="pb_grain" ${pb.filmGrainEnabled ? "checked" : ""}>
            <span>🎞️ 35mm Analog Film Grain Texture</span>
          </label>
          <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:0.83rem; cursor:pointer;">
            <input type="checkbox" id="pb_dateStamp" ${pb.dateStampEnabled ? "checked" : ""}>
            <span>🕒 Quartz Digital Date Stamp ('26 09 16)</span>
          </label>
          <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:0.83rem; cursor:pointer;">
            <input type="checkbox" id="pb_date" ${pb.showDate ? "checked" : ""}>
            <span>📅 Print Current Date on Strip Footer</span>
          </label>
          <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:0.83rem; cursor:pointer;">
            <input type="checkbox" id="pb_flash" ${pb.flashEnabled ? "checked" : ""}>
            <span>⚡ Camera Shutter Flash Animation</span>
          </label>
          <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:0.83rem; cursor:pointer;">
            <input type="checkbox" id="pb_stickers" ${pb.allowStickers ? "checked" : ""}>
            <span>🎀 Interactive Sticker Deco Drawer</span>
          </label>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📝 Section Title & Texts</span>
        </div>
        <div class="input-group">
          <label>Badge / Tag</label>
          <input type="text" id="pb_tag" value="${esc(pb.tag)}">
        </div>
        <div class="input-group">
          <label>Headline Title</label>
          <input type="text" id="pb_title" value="${esc(pb.title)}">
        </div>
        <div class="input-group">
          <label>Subtitle Description</label>
          <textarea id="pb_desc" rows="2">${esc(pb.desc)}</textarea>
        </div>
      </div>
    `;

    renderPhotosList();

    // Event Bindings
    document.getElementById("pb_format")?.addEventListener("change", (e) => {
      pb.defaultFormat = e.target.value;
      pb.defaultLayout = pb.defaultFormat;
      post({ type: "PHOTOBOOTH_SET_FORMAT", format: pb.defaultFormat });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_style")?.addEventListener("change", (e) => {
      pb.defaultStyle = e.target.value;
      post({ type: "PHOTOBOOTH_SET_STYLE", style: pb.defaultStyle });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_filter")?.addEventListener("change", (e) => {
      pb.defaultFilter = e.target.value;
      post({ type: "PHOTOBOOTH_SET_FILTER", filter: pb.defaultFilter });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_p1")?.addEventListener("input", (e) => {
      pb.partner1 = e.target.value;
      pb.stripCaption = `${pb.partner1} & ${pb.partner2} ♡ Forever`;
      const capInput = document.getElementById("pb_caption");
      if (capInput) capInput.value = pb.stripCaption;
      post({ type: "PHOTOBOOTH_SET_CAPTION", caption: pb.stripCaption, location: pb.stripLocation });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_p2")?.addEventListener("input", (e) => {
      pb.partner2 = e.target.value;
      pb.stripCaption = `${pb.partner1} & ${pb.partner2} ♡ Forever`;
      const capInput = document.getElementById("pb_caption");
      if (capInput) capInput.value = pb.stripCaption;
      post({ type: "PHOTOBOOTH_SET_CAPTION", caption: pb.stripCaption, location: pb.stripLocation });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_caption")?.addEventListener("input", (e) => {
      pb.stripCaption = e.target.value;
      post({ type: "PHOTOBOOTH_SET_CAPTION", caption: pb.stripCaption, location: pb.stripLocation });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_location")?.addEventListener("input", (e) => {
      pb.stripLocation = e.target.value;
      post({ type: "PHOTOBOOTH_SET_CAPTION", caption: pb.stripCaption, location: pb.stripLocation });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_tag")?.addEventListener("input", (e) => { pb.tag = e.target.value; debouncedLiveUpdate(); });
    document.getElementById("pb_title")?.addEventListener("input", (e) => { pb.title = e.target.value; debouncedLiveUpdate(); });
    document.getElementById("pb_desc")?.addEventListener("input", (e) => { pb.desc = e.target.value; debouncedLiveUpdate(); });

    document.getElementById("pb_countdown")?.addEventListener("change", (e) => {
      pb.countdownSeconds = Number(e.target.value) || 3;
      post({ type: "PHOTOBOOTH_UPDATE_CONFIG", config: { countdownSeconds: pb.countdownSeconds } });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_mirror")?.addEventListener("change", (e) => {
      pb.isMirror = e.target.value === "true";
      post({ type: "PHOTOBOOTH_UPDATE_CONFIG", config: { isMirror: pb.isMirror } });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_sfx")?.addEventListener("change", (e) => {
      pb.sfxEnabled = e.target.checked;
      post({ type: "PHOTOBOOTH_UPDATE_CONFIG", config: { sfxEnabled: pb.sfxEnabled } });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_haptics")?.addEventListener("change", (e) => {
      pb.hapticsEnabled = e.target.checked;
      post({ type: "PHOTOBOOTH_UPDATE_CONFIG", config: { hapticsEnabled: pb.hapticsEnabled } });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_grain")?.addEventListener("change", (e) => {
      pb.filmGrainEnabled = e.target.checked;
      post({ type: "PHOTOBOOTH_UPDATE_CONFIG", config: { filmGrainEnabled: pb.filmGrainEnabled } });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_dateStamp")?.addEventListener("change", (e) => {
      pb.dateStampEnabled = e.target.checked;
      post({ type: "PHOTOBOOTH_UPDATE_CONFIG", config: { dateStampEnabled: pb.dateStampEnabled } });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_date")?.addEventListener("change", (e) => {
      pb.showDate = e.target.checked;
      post({ type: "PHOTOBOOTH_UPDATE_CONFIG", config: { showDate: pb.showDate } });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_flash")?.addEventListener("change", (e) => {
      pb.flashEnabled = e.target.checked;
      post({ type: "PHOTOBOOTH_UPDATE_CONFIG", config: { flashEnabled: pb.flashEnabled } });
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    document.getElementById("pb_stickers")?.addEventListener("change", (e) => {
      pb.allowStickers = e.target.checked;
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    });

    // File Upload Handler
    const fileUploadInput = document.getElementById("pb_fileUpload");
    if (fileUploadInput) {
      fileUploadInput.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          let url = "";
          if (uploadFileToR2) {
            url = await uploadFileToR2(file);
          } else {
            url = await new Promise((res) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result);
              reader.readAsDataURL(file);
            });
          }
          if (url) {
            pb.samplePhotos.push(url);
            renderPhotosList();
            post({ type: "PHOTOBOOTH_SET_PHOTOS", photos: pb.samplePhotos });
            debouncedLiveUpdate();
            debouncedAutoSaveLayout();
          }
        } catch (err) {
          console.error("Failed to upload photobooth photo:", err);
        }
      });
    }

    // Presets Click Handlers
    document.querySelectorAll(".pb-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.dataset.url;
        if (url) {
          pb.samplePhotos.push(url);
          renderPhotosList();
          post({ type: "PHOTOBOOTH_SET_PHOTOS", photos: pb.samplePhotos });
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        }
      });
    });

    // Quick Test Buttons
    document.getElementById("btnTestBoothBurst")?.addEventListener("click", () => post({ type: "PHOTOBOOTH_START_BURST" }));
    document.getElementById("btnTestBoothFlash")?.addEventListener("click", () => post({ type: "PHOTOBOOTH_TEST_FLASH" }));
    document.getElementById("btnTestBoothSamples")?.addEventListener("click", () => post({ type: "PHOTOBOOTH_USE_SAMPLES" }));
    document.getElementById("btnTestBoothShuffle")?.addEventListener("click", () => post({ type: "PHOTOBOOTH_SHUFFLE_PHOTOS" }));
    document.getElementById("btnTestBoothReset")?.addEventListener("click", () => post({ type: "PHOTOBOOTH_RESET_LOBBY" }));
    document.getElementById("btnTestBoothExport")?.addEventListener("click", () => post({ type: "PHOTOBOOTH_EXPORT" }));
  };
})();
