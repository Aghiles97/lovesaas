(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

  const renderTemplate = (data = {}, rootData = {}) => {
    const pb = (data && typeof data === "object") ? data : {};
    const p1 = pb.partner1 || rootData.partner1 || "Alex";
    const p2 = pb.partner2 || rootData.partner2 || "Sam";
    const tag = pb.tag || "Vintage Photobooth 📸";
    const title = pb.title || "Capture Our Sweet Moments";
    const desc = pb.desc || "Strike your cutest poses and print a personalized retro love strip!";
    const defaultLayout = pb.defaultLayout || "classic_strip";
    const defaultFormat = pb.defaultFormat || "classic_3cut";
    const defaultStyle = pb.defaultStyle || "style_cyan_stars";
    const defaultFilter = pb.defaultFilter || "vintage_90s";
    const stripCaption = pb.stripCaption || (p1 + " & " + p2 + " ♡ Forever");
    const stripLocation = pb.stripLocation || "PARIS • 2026";
    const sfxEnabled = pb.sfxEnabled !== false;

    const SAMPLES = [
      "/public/images/landing-v2/avatar-couple-1.jpg",
      "/public/images/landing-v2/avatar-couple-2.png",
      "/public/images/landing-v2/avatar-couple-3.jpg",
      "/public/images/puzzle-couple.jpg",
      "/public/images/landing-v2/avatar-couple-1.jpg",
      "/public/images/landing-v2/avatar-couple-2.png",
      "/public/images/landing-v2/avatar-couple-3.jpg",
      "/public/images/puzzle-couple.jpg",
      "/public/images/landing-v2/avatar-couple-1.jpg"
    ];

    const win = (idx) => `<div class="mini-window"><img src="${SAMPLES[idx % SAMPLES.length]}" alt="" class="mini-window-img"></div>`;
    const phraseBlock = (pos, txt) => `<div class="frame-phrase-block pos-${pos}"><span class="frame-phrase-text">${esc(txt || stripCaption)}</span></div>`;

    const renderMiniWindows = (fmt = "classic_3cut", customPhrase = stripCaption) => {
      switch (fmt) {
        case "grid_3x3":
          return `<div class="mini-windows-wrap fmt-grid_3x3">${Array(9).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "film_grid":
          return `<div class="mini-windows-wrap fmt-film_grid">${Array(4).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "classic_strip":
          return `<div class="mini-windows-wrap fmt-classic_strip">${Array(4).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "double_6cut":
          return `<div class="mini-windows-wrap fmt-double_6cut">${Array(6).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "double_8cut":
          return `<div class="mini-windows-wrap fmt-double_8cut">${Array(8).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "portrait_pair":
          return `<div class="mini-windows-wrap fmt-portrait_pair">${win(0)}${win(1)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "wide_collage":
        case "asym_collage":
          return `<div class="mini-windows-wrap fmt-asym_collage"><div class="mini-window asym-hero"><img src="${SAMPLES[0]}" alt="" class="mini-window-img"></div><div class="mini-window asym-sub"><img src="${SAMPLES[1]}" alt="" class="mini-window-img"></div><div class="mini-window asym-sub"><img src="${SAMPLES[2]}" alt="" class="mini-window-img"></div></div>${phraseBlock("corner", customPhrase)}`;
        case "polaroid_single":
          return `<div class="mini-windows-wrap fmt-polaroid_single">${win(0)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "landscape_hero":
          return `<div class="mini-windows-wrap fmt-landscape_hero">${win(0)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "landscape_2split":
          return `<div class="mini-windows-wrap fmt-landscape_2split">${win(0)}${win(1)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "landscape_toptext":
          return `${phraseBlock("top", customPhrase)}<div class="mini-windows-wrap fmt-landscape_toptext">${win(0)}${win(1)}</div>`;
        case "triptych_3cut":
          return `<div class="mini-windows-wrap fmt-triptych_3cut">${win(0)}${win(1)}${win(2)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "triptych_toptext":
          return `${phraseBlock("top", customPhrase)}<div class="mini-windows-wrap fmt-triptych_toptext">${win(0)}${win(1)}${win(2)}</div>`;
        case "classic_3cut":
        default:
          return `<div class="mini-windows-wrap fmt-classic_3cut">${win(0)}${win(1)}${win(2)}</div>${phraseBlock("bottom", customPhrase)}`;
      }
    };

    return `
    <section class="section photobooth-section filter-bg-${defaultFilter}" id="section-photobooth" data-widget-id="photobooth" data-active-filter="${defaultFilter}">
      <div class="container">
        <div class="photobooth-card glass-panel">
          <!-- Vintage Wooden Photobooth Canopy Arch -->
          <div class="photobooth-canopy-arch" aria-hidden="true">
            <div class="canopy-wood-rim"></div>
            <div class="canopy-light-glow"></div>
          </div>

          <div class="section-heading photobooth-header text-center">
            <span class="section-tag">${esc(tag)}</span>
            <h2 class="section-title">${esc(title)}</h2>
            <p class="section-desc">${esc(desc)}</p>

            <div class="photobooth-pill-badges">
              <div class="booth-pill-row">
                <span class="booth-meta-pill">Six vintage colour styles</span>
                <span class="booth-meta-pill">Nineteen frame layouts</span>
              </div>
              <div class="booth-pill-row">
                <span class="booth-meta-pill">Thirty-two sticker designs</span>
                <span class="booth-meta-pill">Free on the web • no account</span>
              </div>
            </div>

            <!-- Mode Switcher: Solo Booth vs Long Distance Room -->
            <div class="booth-mode-selector" role="tablist" aria-label="Photobooth Mode">
              <button type="button" class="booth-mode-btn active" data-mode="solo" id="btnModeSolo">
                <span class="mode-icon">📸</span>
                <span class="mode-text">Solo Booth</span>
              </button>
              <button type="button" class="booth-mode-btn" data-mode="ldr" id="btnModeLdr">
                <span class="mode-icon">💕</span>
                <span class="mode-text">Long Distance Room</span>
                <span class="mode-badge">Live Room</span>
              </button>
            </div>

            <!-- Long Distance Room Invite & Status Panel -->
            <div class="booth-ldr-panel" id="boothLdrPanel" style="display:none;">
              <div class="ldr-panel-glass">
                <div class="ldr-status-row">
                  <div class="ldr-room-pill">
                    <span class="ldr-room-label">ROOM CODE:</span>
                    <span class="ldr-room-code" id="ldrRoomCodeDisplay">------</span>
                  </div>
                  <div class="ldr-partner-badge" id="ldrPartnerStatusBadge">
                    <span class="status-pulse-dot waiting" id="ldrPulseDot"></span>
                    <span id="ldrPartnerStatusText">Waiting for partner to join...</span>
                  </div>
                </div>
                <div class="ldr-actions-row">
                  <button type="button" id="btnCopyInviteLink" class="btn btn-sm btn-accent">
                    <span>🔗 Copy Invite Link</span>
                  </button>
                  <button type="button" id="btnNewRoomCode" class="btn btn-sm btn-ghost">
                    <span>🔄 New Code</span>
                  </button>
                  <div class="ldr-sync-badge" id="ldrSyncBadge" style="display:none;">
                    <span>⚡ First-to-click sync active</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="photobooth-cta-row" id="photoboothCtaRow">
              <button type="button" id="btnHeaderTake" class="booth-cta-pill booth-cta-take">take a photo</button>
              <button type="button" id="btnHeaderUpload" class="booth-cta-pill booth-cta-upload">upload photo</button>
            </div>
          </div>

          <div class="photobooth-apparatus" data-default-layout="${esc(defaultLayout)}" data-default-format="${esc(defaultFormat)}" data-default-style="${esc(defaultStyle)}" data-default-filter="${esc(defaultFilter)}" data-strip-caption="${esc(stripCaption)}" data-strip-location="${esc(stripLocation)}" data-sfx="${sfxEnabled}">
            <div class="photobooth-flash" id="photoboothFlash" aria-hidden="true"></div>

            <!-- Remote Partner Floating Cursor -->
            <div class="photobooth-remote-cursor" id="photoboothRemoteCursor" style="display:none;" aria-hidden="true">
              <div class="remote-cursor-pointer">
                <span class="cursor-heart">💖</span>
              </div>
              <div class="remote-cursor-tag" id="remoteCursorTag">Partner</div>
              <div class="remote-click-ripple" id="remoteClickRipple"></div>
            </div>

            <!-- View 1: Camera Viewfinder (Toggled via 'take a photo') -->
            <div class="photobooth-viewfinder-wrap photobooth-viewfinder" id="photoboothViewfinder" style="display:none;">
              <div class="viewfinder-nav-bar">
                <button type="button" id="btnBackToLobby" class="btn-nav-back" title="Back to Frame Picker">
                  <span>← Pick Frame</span>
                </button>
                <div class="viewfinder-status-pill">
                  <span class="live-dot"></span>
                  <span>LIVE BOOTH</span>
                </div>
              </div>

              <!-- Camera Pro Controls Top Bar -->
              <div class="booth-pro-bar">
                <div class="booth-timer-picker" role="radiogroup" aria-label="Shutter Timer">
                  <span class="pro-label">⏱️</span>
                  <button type="button" class="pro-chip-btn active" data-timer="3">3s</button>
                  <button type="button" class="pro-chip-btn" data-timer="5">5s</button>
                  <button type="button" class="pro-chip-btn" data-timer="10">10s</button>
                  <button type="button" class="pro-chip-btn" data-timer="1">Instant</button>
                </div>
                <div class="booth-pro-toggles">
                  <button type="button" id="btnToggleMirror" class="pro-icon-toggle active" title="Toggle Mirror View">
                    <span>🪞</span>
                  </button>
                  <button type="button" id="btnToggleFlashMode" class="pro-icon-toggle active" title="Toggle Camera Flash">
                    <span id="flashModeIcon">⚡</span>
                  </button>
                </div>
              </div>

              <div class="photobooth-screen">
                <video id="photoboothVideo" autoplay playsinline muted></video>
                <div class="viewfinder-split-screen" id="viewfinderSplitScreen" style="display:none;">
                  <div class="split-feed split-feed-local">
                    <video id="photoboothVideoLocal" autoplay playsinline muted></video>
                    <span class="split-tag">You (Local)</span>
                  </div>
                  <div class="split-feed split-feed-remote">
                    <video id="photoboothVideoRemote" autoplay playsinline></video>
                    <span class="split-tag">Partner (Live)</span>
                    <div class="remote-placeholder" id="remoteVideoPlaceholder">
                      <span class="placeholder-icon">💕</span>
                      <span class="placeholder-txt">Waiting for partner video...</span>
                    </div>
                  </div>
                </div>
                <canvas id="photoboothOffscreen" style="display:none;"></canvas>

                <div class="photobooth-countdown-overlay" id="photoboothCountdown" style="display:none;">
                  <span class="countdown-digit" id="countdownDigit">3</span>
                </div>

                <div class="photobooth-pose-pill" id="photoboothPosePill" style="display:none;">
                  <span class="pose-text" id="photoboothPoseText">Pose 1: Smile big! 😊</span>
                </div>

                <div class="photobooth-fallback-wrap" id="photoboothFallback" style="display:none;">
                  <span class="fallback-icon">📸</span>
                  <p class="fallback-title">Camera Inactive or Unavailable</p>
                  <p class="fallback-subtitle">Upload photos from your device or use sample romantic photos</p>
                  <div class="fallback-actions">
                    <label class="btn btn-sm btn-primary photobooth-upload-btn">
                      <span>📁 Upload Photos</span>
                      <input type="file" id="photoboothFileInput" accept="image/*" multiple style="display:none;">
                    </label>
                    <button type="button" id="btnUseSamplePhotos" class="btn btn-sm btn-secondary">
                      <span>🖼️ Use Sample Photos</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="photobooth-camera-bar">
                <button type="button" id="btnSwitchCamera" class="booth-icon-btn" title="Flip Camera" aria-label="Flip Camera">
                  <span class="booth-btn-icon">🔄</span>
                  <span class="booth-btn-txt">Flip</span>
                </button>
                <button type="button" id="btnStartBurst" class="booth-shutter-btn" title="Start Burst Sequence" aria-label="Capture Photo Strip">
                  <div class="shutter-inner">
                    <span class="shutter-icon">📸</span>
                  </div>
                </button>
                <button type="button" id="btnToggleAudio" class="booth-icon-btn" title="Toggle Sound" aria-label="Toggle Sound">
                  <span id="boothAudioIcon" class="booth-btn-icon">${sfxEnabled ? "🔊" : "🔇"}</span>
                  <span class="booth-btn-txt">Audio</span>
                </button>
              </div>
            </div>

            <!-- View 2: Frame Showcase & Layout Chooser (LOBBY - Visible by default!) -->
            <div class="photobooth-frame-section photobooth-frame-selector photobooth-frames" id="photoboothFrameSection">
              <p class="photobooth-subheading">PICK A FRAME INSIDE THE BOOTH</p>
              
              <!-- Interactive Frame Phrase Inscription Bar -->
              <div class="booth-phrase-editor-bar">
                <span class="phrase-label">💌 Frame Inscription:</span>
                <input type="text" id="boothPhraseInput" class="booth-phrase-input" maxlength="42" value="${esc(stripCaption)}" placeholder="Write something lovely on the frame...">
                <div class="phrase-presets">
                  <button type="button" class="phrase-preset-btn" data-phrase="Forever &amp; Always ♡">Forever &amp; Always ♡</button>
                  <button type="button" class="phrase-preset-btn" data-phrase="You + Me = Love ✨">You + Me = Love ✨</button>
                  <button type="button" class="phrase-preset-btn" data-phrase="Best Day Ever 📸">Best Day Ever 📸</button>
                  <button type="button" class="phrase-preset-btn" data-phrase="To The Moon &amp; Back 🌙">To The Moon &amp; Back 🌙</button>
                </div>
              </div>

              <!-- Layout Formats Row (Catalogue Matrix) -->
              <div class="booth-formats-row" role="radiogroup" aria-label="Photo Layout Format">
                <button type="button" class="format-pill-btn ${defaultFormat === 'classic_3cut' ? 'active' : ''}" data-format="classic_3cut">1×3 Strip</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'classic_strip' ? 'active' : ''}" data-format="classic_strip">1×4 Strip</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'double_6cut' ? 'active' : ''}" data-format="double_6cut">2×3 Double</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'double_8cut' ? 'active' : ''}" data-format="double_8cut">2×4 Double</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'film_grid' ? 'active' : ''}" data-format="film_grid">2×2 Grid</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'grid_3x3' ? 'active' : ''}" data-format="grid_3x3">3×3 Grid</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'polaroid_single' ? 'active' : ''}" data-format="polaroid_single">Polaroid</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'portrait_pair' ? 'active' : ''}" data-format="portrait_pair">1×2 Pair</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'landscape_2split' ? 'active' : ''}" data-format="landscape_2split">Wide 2-Cut</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'landscape_toptext' ? 'active' : ''}" data-format="landscape_toptext">Banner 2-Cut</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'triptych_3cut' ? 'active' : ''}" data-format="triptych_3cut">Triptych</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'asym_collage' ? 'active' : ''}" data-format="asym_collage">Collage</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'landscape_hero' ? 'active' : ''}" data-format="landscape_hero">Landscape</button>
              </div>

              <!-- Decorative Border Styles Grid -->
              <div class="booth-frame-cards-grid ${defaultFormat === 'film_grid' || defaultFormat === 'grid_3x3' ? 'format-is-square' : ''}" id="boothLayoutChips" data-format="${defaultFormat}" role="radiogroup" aria-label="Frame Style">
                <div class="frame-card-preview ${defaultStyle === 'style_cyan_stars' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_cyan_stars" tabindex="0">
                  <div class="frame-mini-strip frame-style-classic">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">CLASSIC STRIP</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_floral' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_floral" tabindex="0">
                  <div class="frame-mini-strip frame-style-floral">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">FILM GRID</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_retro_swirl' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_retro_swirl" tabindex="0">
                  <div class="frame-mini-strip frame-style-swirls">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">PORTRAIT PAIR</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_lavender_stripes' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_lavender_stripes" tabindex="0">
                  <div class="frame-mini-strip frame-style-stripes">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">WIDE COLLAGE</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_noir_film' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_noir_film" tabindex="0">
                  <div class="frame-mini-strip frame-style-noir">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">35MM NOIR</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_y2k_pink' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_y2k_pink" tabindex="0">
                  <div class="frame-mini-strip frame-style-y2k">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">Y2K PINK</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_newspaper' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_newspaper" tabindex="0">
                  <div class="frame-mini-strip frame-style-newspaper">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">NEWSPAPER</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_minimal_white' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_minimal_white" tabindex="0">
                  <div class="frame-mini-strip frame-style-minimal">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">MINIMAL</span>
                </div>
              </div>
            </div>

            <div class="photobooth-toolbar">
              <div class="booth-toolbar-group">
                <span class="booth-toolbar-label">🎨 Filter:</span>
                <div class="booth-filter-chips" id="boothFilterChips" role="radiogroup" aria-label="Color Filter">
                  <button type="button" class="filter-chip-btn ${defaultFilter === 'vintage_90s' ? 'active' : ''}" data-filter="vintage_90s">90s Film</button>
                  <button type="button" class="filter-chip-btn ${defaultFilter === 'bw_noir' ? 'active' : ''}" data-filter="bw_noir">B&W Noir</button>
                  <button type="button" class="filter-chip-btn ${defaultFilter === 'golden_sunset' ? 'active' : ''}" data-filter="golden_sunset">Golden Sunset</button>
                  <button type="button" class="filter-chip-btn ${defaultFilter === 'dreamy_bloom' ? 'active' : ''}" data-filter="dreamy_bloom">Dreamy Bloom</button>
                  <button type="button" class="filter-chip-btn ${defaultFilter === 'cyberpunk' ? 'active' : ''}" data-filter="cyberpunk">Cyberpunk</button>
                  <button type="button" class="filter-chip-btn ${defaultFilter === 'natural' ? 'active' : ''}" data-filter="natural">Natural</button>
                </div>
              </div>
            </div>

            <!-- Photo Selection Tray (Choose photos for strip + 1-Retry Budget) -->
            <div class="photobooth-selection-tray" id="photoboothSelectionTray" style="display:none;">
              <div class="selection-tray-header">
                <div class="selection-header-main">
                  <h3 class="selection-title">✨ Choose Your Favorite Shots</h3>
                  <p class="selection-subtitle">Pick exactly <span id="selectionTargetCount" class="selection-target-badge">3</span> photos for your final strip</p>
                </div>
                <div class="selection-retry-status">
                  <span class="retry-budget-pill" id="retryBudgetBadge">1 Retry Left (1/1)</span>
                  <button type="button" id="btnRetryExtraSet" class="btn btn-sm btn-secondary">
                    <span>🔄 Retake Extra Set (1 try left)</span>
                  </button>
                </div>
              </div>
              <div class="selection-candidates-grid" id="selectionCandidatesGrid"></div>
              <div class="selection-tray-actions">
                <button type="button" id="btnConfirmSelection" class="btn btn-primary" disabled>
                  <span>Use Selected Photos &amp; Decorate →</span>
                </button>
              </div>
            </div>

            <div class="photobooth-review-workspace photobooth-print" id="photoboothReviewWorkspace" style="display:none;">
              <!-- Easy-to-use Top Navigation Bar -->
              <div class="review-nav-topbar">
                <button type="button" id="btnReviewBackToLobby" class="btn-review-nav" title="Return to lobby to choose another frame">
                  <span>← Pick Another Frame</span>
                </button>
                <div class="review-status-badge">
                  <span>✨ Strip Ready</span>
                </div>
                <button type="button" id="btnReviewRetakeTop" class="btn-review-retake" title="Take photos again">
                  <span>📸 Retake Shots</span>
                </button>
              </div>

              <!-- Deco Toolbar -->
              <div class="photobooth-deco-header">
                <div class="photobooth-deco-tabs" id="boothDecoTabs" role="tablist" aria-label="Deco Categories">
                  <button type="button" class="deco-tab-btn active" data-tab="frames" role="tab">🖼️ Whole Frames</button>
                  <button type="button" class="deco-tab-btn" data-tab="stamps" role="tab">🏷️ Postal & Wax</button>
                  <button type="button" class="deco-tab-btn" data-tab="washi" role="tab">🩹 Washi Tape</button>
                  <button type="button" class="deco-tab-btn" data-tab="stickers" role="tab">✨ Stickers</button>
                  <button type="button" class="deco-tab-btn" data-tab="paint" role="tab">🎨 Paint &amp; Doodle</button>
                </div>
                <div class="photobooth-sticker-tray">
                  <div class="sticker-palette" id="boothStickerPalette"></div>
                </div>
                <!-- Paint & Doodle Palette -->
                <div class="photobooth-paint-palette" id="boothPaintPalette" style="display:none;">
                  <div class="paint-color-swatches" id="paintColorSwatches">
                    <button type="button" class="color-swatch-btn active" data-color="#ff2d55" style="background:#ff2d55;" title="Ruby Red"></button>
                    <button type="button" class="color-swatch-btn" data-color="#ffffff" style="background:#ffffff;" title="Pure White"></button>
                    <button type="button" class="color-swatch-btn" data-color="#000000" style="background:#000000;" title="Jet Black"></button>
                    <button type="button" class="color-swatch-btn" data-color="#ffd60a" style="background:#ffd60a;" title="Gold Star"></button>
                    <button type="button" class="color-swatch-btn" data-color="#30d158" style="background:#30d158;" title="Mint Green"></button>
                    <button type="button" class="color-swatch-btn" data-color="#0a84ff" style="background:#0a84ff;" title="Sky Blue"></button>
                    <button type="button" class="color-swatch-btn" data-color="#bf5af2" style="background:#bf5af2;" title="Lavender"></button>
                    <button type="button" class="color-swatch-btn" data-color="#ff9f0a" style="background:#ff9f0a;" title="Warm Coral"></button>
                  </div>
                  <div class="paint-size-picker" id="paintSizePicker">
                    <button type="button" class="size-chip-btn" data-size="3">Fine</button>
                    <button type="button" class="size-chip-btn active" data-size="6">Med</button>
                    <button type="button" class="size-chip-btn" data-size="14">Bold</button>
                  </div>
                  <div class="paint-tools-row">
                    <button type="button" id="btnPaintUndo" class="deco-tool-pill" title="Undo Last Stroke">↩️ Undo</button>
                    <button type="button" id="btnPaintClear" class="deco-tool-pill deco-tool-clear" title="Clear All Paint">🧹 Clear Paint</button>
                  </div>
                </div>
                <div class="deco-action-pills">
                  <button type="button" id="btnShufflePhotos" class="deco-tool-pill" title="Reorder Photos">🔀 Swap Shots</button>
                  <button type="button" id="btnToggleGrain" class="deco-tool-pill active" title="Toggle 35mm Film Grain">🎞️ Grain</button>
                  <button type="button" id="btnToggleDateStamp" class="deco-tool-pill active" title="Toggle Date Stamp">📅 Date</button>
                  <button type="button" id="btnClearDeco" class="deco-tool-pill deco-tool-clear" title="Clear all decorations">🧹 Clear Deco</button>
                </div>
              </div>

              <div class="photobooth-stage-wrap photobooth-slot photobooth-print-slot">
                <div class="photobooth-strip-outer" id="photoboothStripOuter">
                  <div class="photobooth-strip-container" id="photoboothStripContainer"></div>
                  <canvas class="photobooth-paint-canvas" id="photoboothPaintCanvas"></canvas>
                </div>
              </div>

              <div class="photobooth-actions-row">
                <button type="button" id="btnReviewBackLobbyBottom" class="btn btn-secondary">
                  <span>← Change Frame</span>
                </button>
                <button type="button" id="btnRetakeBurst" class="btn btn-secondary">
                  <span>📸 Retake Shots</span>
                </button>
                <button type="button" id="btnExportStrip" class="btn btn-primary">
                  <span>💾 Save Photo Strip</span>
                </button>
                <button type="button" id="btnShareStrip" class="btn btn-accent">
                  <span>💌 Share Strip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["photobooth"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
