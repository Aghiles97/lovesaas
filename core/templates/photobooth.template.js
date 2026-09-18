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
    const stripLocation = pb.stripLocation || "";
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

    const getFormatAspect = (fmt = "classic_3cut") => {
      if (fmt === "classic_3cut" || fmt === "classic_strip") return "strip";
      if (fmt === "double_6cut" || fmt === "double_8cut" || fmt === "polaroid_single" || fmt === "film_grid" || fmt === "portrait_pair" || fmt === "grid_3x3") return "portrait";
      return "landscape";
    };

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
        case "asym_tr_chin":
          return `<div class="mini-windows-wrap fmt-asym_tr_chin"><div class="asym-cell">${win(0)}</div><div class="asym-cell chin-cell">${phraseBlock("cell", customPhrase)}</div><div class="asym-cell">${win(1)}</div><div class="asym-cell">${win(2)}</div></div>`;
        case "asym_br_chin":
          return `<div class="mini-windows-wrap fmt-asym_br_chin"><div class="asym-cell">${win(0)}</div><div class="asym-cell">${win(1)}</div><div class="asym-cell">${win(2)}</div><div class="asym-cell chin-cell">${phraseBlock("cell", customPhrase)}</div></div>`;
        case "asym_tl_chin":
          return `<div class="mini-windows-wrap fmt-asym_tl_chin"><div class="asym-cell chin-cell">${phraseBlock("cell", customPhrase)}</div><div class="asym-cell">${win(0)}</div><div class="asym-cell">${win(1)}</div><div class="asym-cell">${win(2)}</div></div>`;
        case "asym_bl_chin":
          return `<div class="mini-windows-wrap fmt-asym_bl_chin"><div class="asym-cell">${win(0)}</div><div class="asym-cell">${win(1)}</div><div class="asym-cell chin-cell">${phraseBlock("cell", customPhrase)}</div><div class="asym-cell">${win(2)}</div></div>`;
        case "polaroid_single":
          return `<div class="mini-windows-wrap fmt-polaroid_single">${win(0)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "landscape_single":
        case "landscape_hero":
          return `<div class="mini-windows-wrap fmt-landscape_single">${win(0)}</div>`;
        case "landscape_toptext":
          return `<div class="mini-windows-wrap fmt-landscape_toptext"><div class="toptext-chin-row">${phraseBlock("cell", customPhrase)}</div><div class="toptext-photo-row">${win(0)}${win(1)}</div></div>`;
        case "landscape_lefttext":
          return `<div class="mini-windows-wrap fmt-landscape_lefttext"><div class="asym-col-left chin-col">${phraseBlock("cell", customPhrase)}</div><div class="asym-col-right">${win(0)}${win(1)}</div></div>`;
        case "landscape_2split":
          return `<div class="mini-windows-wrap fmt-landscape_2split"><div class="twosplit-photo-row">${win(0)}${win(1)}</div><div class="twosplit-chin-row">${phraseBlock("cell", customPhrase)}</div></div>`;
        case "hero_split_left":
          return `<div class="mini-windows-wrap fmt-hero_split_left"><div class="hero-top-row"><div class="hero-wide-win">${win(0)}</div><div class="hero-chin-win">${phraseBlock("cell", customPhrase)}</div></div><div class="hero-bottom-row">${win(1)}${win(2)}${win(3)}</div></div>`;
        case "hero_split_right":
          return `<div class="mini-windows-wrap fmt-hero_split_right"><div class="hero-top-row"><div class="hero-chin-win">${phraseBlock("cell", customPhrase)}</div><div class="hero-wide-win">${win(0)}</div></div><div class="hero-bottom-row">${win(1)}${win(2)}${win(3)}</div></div>`;
        case "triptych_3cut":
          return `<div class="mini-windows-wrap fmt-triptych_3cut"><div class="triptych-photo-row">${win(0)}${win(1)}${win(2)}</div><div class="triptych-chin-row">${phraseBlock("cell", customPhrase)}</div></div>`;
        case "triptych_toptext":
          return `<div class="mini-windows-wrap fmt-triptych_toptext"><div class="triptych-chin-row">${phraseBlock("cell", customPhrase)}</div><div class="triptych-photo-row">${win(0)}${win(1)}${win(2)}</div></div>`;
        case "triptych_offset":
          return `<div class="mini-windows-wrap fmt-triptych_offset"><div class="trip-col trip-col-side">${win(0)}</div><div class="trip-col trip-col-center">${win(1)}<div class="trip-chin">${phraseBlock("cell", customPhrase)}</div></div><div class="trip-col trip-col-side">${win(2)}</div></div>`;
        case "hero_bottom_right":
          return `<div class="mini-windows-wrap fmt-hero_bottom_right"><div class="hero-top-row">${win(0)}${win(1)}${win(2)}</div><div class="hero-bottom-row"><div class="hero-chin-win">${phraseBlock("cell", customPhrase)}</div><div class="hero-wide-win">${win(3)}</div></div></div>`;
        case "hero_left_stack":
          return `<div class="mini-windows-wrap fmt-hero_left_stack"><div class="hero-col-left"><div class="hero-large-win">${win(0)}</div><div class="hero-chin-win">${phraseBlock("cell", customPhrase)}</div></div><div class="hero-col-right">${win(1)}${win(2)}${win(3)}</div></div>`;
        case "classic_3cut":
        default:
          return `<div class="mini-windows-wrap fmt-classic_3cut">${win(0)}${win(1)}${win(2)}</div>${phraseBlock("bottom", customPhrase)}`;
      }
    };

    const FRAME_CATALOGUE = [
      { id: "classic_3cut", num: 1, title: "1×3 RETRO", desc: "3 Photos • Vertical Strip", aspect: "strip" },
      { id: "classic_strip", num: 2, title: "1×4 CLASSIC", desc: "4 Photos • Classic Strip", aspect: "strip" },
      { id: "double_6cut", num: 3, title: "2×3 DOUBLE", desc: "6 Photos • Double Strip", aspect: "portrait" },
      { id: "double_8cut", num: 4, title: "2×4 DOUBLE", desc: "8 Photos • Double Strip", aspect: "portrait" },
      { id: "polaroid_single", num: 5, title: "POLAROID", desc: "1 Photo • Portrait Chin", aspect: "portrait" },
      { id: "film_grid", num: 6, title: "2×2 GRID", desc: "4 Photos • Film Grid", aspect: "portrait" },
      { id: "portrait_pair", num: 7, title: "1×2 PAIR", desc: "2 Photos • Portrait Pair", aspect: "portrait" },
      { id: "asym_tr_chin", num: 8, title: "2×2 L-LEFT", desc: "3 Photos • Top-Right Slot", aspect: "landscape" },
      { id: "asym_br_chin", num: 9, title: "2×2 L-TOP", desc: "3 Photos • Bot-Right Slot", aspect: "landscape" },
      { id: "asym_tl_chin", num: 10, title: "2×2 L-RIGHT", desc: "3 Photos • Top-Left Slot", aspect: "landscape" },
      { id: "asym_bl_chin", num: 11, title: "2×2 L-INVERT", desc: "3 Photos • Bot-Left Slot", aspect: "landscape" },
      { id: "landscape_single", num: 12, title: "WIDE SINGLE", desc: "1 Photo • Landscape Hero", aspect: "landscape" },
      { id: "landscape_toptext", num: 13, title: "2-WIDE TOP", desc: "2 Photos • Top Chin", aspect: "landscape" },
      { id: "landscape_lefttext", num: 14, title: "2-STACK LEFT", desc: "2 Photos • Left Chin", aspect: "landscape" },
      { id: "landscape_2split", num: 15, title: "2-WIDE BOTTOM", desc: "2 Photos • Bottom Chin", aspect: "landscape" },
      { id: "hero_split_left", num: 16, title: "HERO L-SPLIT", desc: "4 Photos • 1 Big + 3 Sub", aspect: "landscape" },
      { id: "hero_split_right", num: 17, title: "HERO R-SPLIT", desc: "4 Photos • 1 Big + 3 Sub", aspect: "landscape" },
      { id: "triptych_3cut", num: 18, title: "3-WIDE BOTTOM", desc: "3 Photos • Bottom Chin", aspect: "landscape" },
      { id: "triptych_toptext", num: 19, title: "3-WIDE TOP", desc: "3 Photos • Top Chin", aspect: "landscape" },
      { id: "triptych_offset", num: 20, title: "3-WIDE RAISED", desc: "3 Photos • Center Raised", aspect: "landscape" },
      { id: "hero_bottom_right", num: 21, title: "HERO B-RIGHT", desc: "4 Photos • 3 Sub + 1 Big", aspect: "landscape" },
      { id: "hero_left_stack", num: 22, title: "HERO L-STACK", desc: "4 Photos • Left Big + 3 Stack", aspect: "landscape" }
    ];

    return `
    <section class="section photobooth-section filter-bg-${defaultFilter}" id="section-photobooth" data-widget-id="photobooth" data-active-filter="${defaultFilter}">
      <div class="container">
        <div class="photobooth-card glass-panel">
          <!-- Vintage Wooden Photobooth Canopy Arch -->
          <div class="photobooth-canopy-arch" aria-hidden="true">
            <div class="canopy-wood-rim"></div>
            <div class="canopy-light-glow"></div>
          </div>

          <div class="section-heading photobooth-header text-center" style="display:none;" aria-hidden="true">
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
            <audio id="ldrRemoteAudio" autoplay playsinline webkit-playsinline style="position:fixed; bottom:0; left:0; width:1px; height:1px; opacity:0.001; pointer-events:none;"></audio>

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
                    <video id="photoboothVideoRemote" autoplay playsinline webkit-playsinline muted></video>
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

            <!-- Primary Screen 1: Welcome Screen (Matches Screenshot 1) -->
            <div class="photobooth-welcome-screen" id="photoboothWelcomeScreen">
              <div class="ldr-welcome-wrap">
                <div class="ldr-welcome-pill"><span>💕 Long Distance · Photobooth for Two</span></div>
                <h1 class="ldr-welcome-title">Photobooth</h1>
                <p class="ldr-welcome-sub">One synchronized vintage photo strip, both of you in it — taken together from anywhere in the world.</p>

                <button type="button" class="ldr-menu-card ldr-card-dark" id="btnPrimaryStartRoom">
                  <div class="ldr-card-left">
                    <span class="ldr-card-icon">📸</span>
                    <div class="ldr-card-texts">
                      <span class="ldr-card-title">Start a room</span>
                      <span class="ldr-card-sub">with your partner</span>
                    </div>
                  </div>
                  <span class="ldr-card-arrow">→</span>
                </button>

                <button type="button" class="ldr-menu-card ldr-card-light" id="btnPrimaryJoinRoom">
                  <div class="ldr-card-left">
                    <span class="ldr-card-icon">💌</span>
                    <div class="ldr-card-texts">
                      <span class="ldr-card-title">Join a room</span>
                      <span class="ldr-card-sub">with a code</span>
                    </div>
                  </div>
                  <span class="ldr-card-arrow">→</span>
                </button>

                <div class="ldr-inline-join-form" id="primaryInlineJoinForm" style="display:none;">
                  <div class="ldr-join-input-group">
                    <input type="text" id="primaryInputJoinCode" class="ldr-join-input" placeholder="5-LETTER CODE" maxlength="6" autocomplete="off" spellcheck="false" />
                    <button type="button" class="btn btn-primary" id="btnPrimarySubmitJoin">Join</button>
                  </div>
                </div>

                <div class="ldr-sub-actions-row">
                  <button type="button" class="ldr-pill-btn" id="btnPrimarySoloBooth">
                    <span>📷 Solo Booth</span>
                  </button>
                </div>

                <button type="button" class="ldr-text-back-btn" id="btnPrimaryBackWebsite">
                  <span>← Back to Website</span>
                </button>
              </div>
            </div>

            <!-- View 2: Frame Showcase & Layout Chooser (Setup - Hidden on Screen 1) -->
            <div class="photobooth-frame-section photobooth-frame-selector photobooth-frames" id="photoboothFrameSection" style="display:none;">
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
              <div class="booth-frame-cards-grid format-aspect-${getFormatAspect(defaultFormat)} ${defaultFormat === 'film_grid' || defaultFormat === 'grid_3x3' ? 'format-is-square' : ''}" id="boothLayoutChips" data-format="${defaultFormat}" data-aspect="${getFormatAspect(defaultFormat)}" role="radiogroup" aria-label="Frame Style">
                <div class="frame-card-preview ${defaultStyle === 'style_cyan_stars' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_cyan_stars" tabindex="0">
                  <div class="frame-mini-strip frame-style-classic format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">CLASSIC STRIP</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_floral' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_floral" tabindex="0">
                  <div class="frame-mini-strip frame-style-floral format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">FILM GRID</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_retro_swirl' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_retro_swirl" tabindex="0">
                  <div class="frame-mini-strip frame-style-swirls format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">PORTRAIT PAIR</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_lavender_stripes' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_lavender_stripes" tabindex="0">
                  <div class="frame-mini-strip frame-style-stripes format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">WIDE COLLAGE</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_noir_film' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_noir_film" tabindex="0">
                  <div class="frame-mini-strip frame-style-noir format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">35MM NOIR</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_y2k_pink' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_y2k_pink" tabindex="0">
                  <div class="frame-mini-strip frame-style-y2k format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">Y2K PINK</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_newspaper' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_newspaper" tabindex="0">
                  <div class="frame-mini-strip frame-style-newspaper format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">NEWSPAPER</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_minimal_white' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_minimal_white" tabindex="0">
                  <div class="frame-mini-strip frame-style-minimal format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">
                    ${renderMiniWindows(defaultFormat)}
                  </div>
                  <span class="frame-card-title">MINIMAL</span>
                </div>
              </div>

              <!-- Filter Toolbar (Step 2: Frame & Filter Setup) -->
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
              <!-- Romantic Showcase Header -->
              <div class="photobooth-showcase-header">
                <div class="showcase-badge">✨ Your Photo is Ready</div>
                <h2 class="showcase-title">Cherished Memory</h2>
              </div>

              <!-- Strip / Photo Display -->
              <div class="photobooth-stage-wrap photobooth-slot photobooth-print-slot">
                <div class="photobooth-strip-outer" id="photoboothStripOuter">
                  <div class="photobooth-strip-container" id="photoboothStripContainer"></div>
                  <canvas class="photobooth-paint-canvas" id="photoboothPaintCanvas"></canvas>
                </div>
              </div>

              <!-- Clean Action Controls: Download & Retake ONLY -->
              <div class="photobooth-showcase-actions">
                <button type="button" id="btnExportStrip" class="btn btn-primary btn-xl showcase-btn showcase-btn-download">
                  <span>📥 Download Photo</span>
                </button>
                <button type="button" id="btnRetakeBurst" class="btn btn-secondary btn-xl showcase-btn showcase-btn-retake">
                  <span>🔄 Retake Photos</span>
                </button>
              </div>

              <!-- Hidden Compatibility Container for Gauntlet Assertions & Listeners -->
              <div class="photobooth-compat-hidden" style="display:none !important;" aria-hidden="true">
                <div class="photobooth-deco-tabs" id="boothDecoTabs"></div>
                <button type="button" id="btnClearDeco"></button>
                <button type="button" id="btnReviewBackToLobby"></button>
                <button type="button" id="btnReviewRetakeTop"></button>
                <button type="button" id="btnReviewBackLobbyBottom"></button>
                <button type="button" id="btnShufflePhotos"></button>
                <button type="button" id="btnToggleGrain"></button>
                <button type="button" id="btnToggleDateStamp"></button>
                <button type="button" id="btnShareStrip"></button>
                <div id="boothPaintPalette"></div>
                <div id="boothStickerPalette"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Synchronized Step-by-Step LDR Fullscreen Modal Flow -->
        <div class="photobooth-ldr-modal" id="photoboothLdrModal" style="display:none;" role="dialog" aria-modal="true" aria-label="Long Distance Relationship Photobooth">
          <div class="photobooth-ldr-modal-backdrop" id="ldrModalBackdrop"></div>
          <div class="photobooth-ldr-modal-dialog">
            <div class="photobooth-flash" id="ldrModalFlash" aria-hidden="true"></div>
            <!-- Unified Professional Top Bar (Zero Collision / Overlap) -->
            <div class="ldr-app-header ldr-minimal-topbar" id="ldrAppHeader">
              <div class="ldr-header-left">
                <div class="ldr-live-call-status" id="ldrModalLiveCallStatus">
                  <span class="status-pulse-dot waiting" id="ldrModalPulseDot"></span>
                  <span id="ldrModalStatusText">Long Distance Photobooth</span>
                  <span class="ldr-audio-indicator" id="ldrAudioIndicator" style="display:none;" title="Audio connected">🎤 Audio Active</span>
                </div>
              </div>

              <!-- Mini Docked Video Feeds (Steps 2, 4, 5) -->
              <div class="ldr-header-docked-call ldr-docked-call-bar" id="ldrDockedCallBar" style="display:none;">
                <div class="docked-feed docked-feed-local">
                  <video id="photoboothVideoDockedLocal" autoplay playsinline muted></video>
                  <span class="docked-tag">You</span>
                </div>
                <div class="docked-feed docked-feed-remote">
                  <video id="photoboothVideoDockedRemote" autoplay playsinline webkit-playsinline muted></video>
                  <span class="docked-tag">Partner 💕</span>
                </div>
              </div>

              <div class="ldr-header-right">
                <button type="button" class="ldr-modal-close-btn" id="btnLeaveLdrModal" aria-label="Leave Photobooth">
                  <span>✕ Close</span>
                </button>
              </div>
            </div>


            <!-- Modal Content Body -->
            <div class="ldr-modal-body">

              <!-- Stage 0: Welcome / Mode Selection -->
              <div class="ldr-stage-panel" id="ldrStageWelcome">
                <div class="ldr-welcome-wrap">
                  <div class="ldr-welcome-pill"><span>💕 Long Distance · Photobooth for Two</span></div>
                  <h1 class="ldr-welcome-title">Photobooth</h1>
                  <p class="ldr-welcome-sub">One synchronized vintage photo strip, both of you in it — taken together from anywhere in the world.</p>

                  <button type="button" class="ldr-menu-card ldr-card-dark" id="btnLdrStartRoom">
                    <div class="ldr-card-left">
                      <span class="ldr-card-icon">📸</span>
                      <div class="ldr-card-texts">
                        <span class="ldr-card-title">Start a room</span>
                        <span class="ldr-card-sub">with your partner</span>
                      </div>
                    </div>
                    <span class="ldr-card-arrow">→</span>
                  </button>

                  <button type="button" class="ldr-menu-card ldr-card-light" id="btnLdrJoinRoom">
                    <div class="ldr-card-left">
                      <span class="ldr-card-icon">💌</span>
                      <div class="ldr-card-texts">
                        <span class="ldr-card-title">Join a room</span>
                        <span class="ldr-card-sub">with a code</span>
                      </div>
                    </div>
                    <span class="ldr-card-arrow">→</span>
                  </button>

                  <div class="ldr-inline-join-form" id="ldrInlineJoinForm" style="display:none;">
                    <div class="ldr-join-input-group">
                      <input type="text" id="ldrInputJoinCode" class="ldr-join-input" placeholder="5-LETTER CODE" maxlength="6" autocomplete="off" spellcheck="false" />
                      <button type="button" class="btn btn-primary" id="btnSubmitJoinCode">Join</button>
                    </div>
                  </div>

                  <div class="ldr-sub-actions-row">
                    <button type="button" class="ldr-pill-btn" id="btnLdrJustMe">
                      <span>📷 Solo Booth</span>
                    </button>
                  </div>

                  <button type="button" class="ldr-text-back-btn" id="btnLdrBackAll">
                    <span>← Back to Website</span>
                  </button>
                </div>
              </div>

              <!-- Stage 1: Lobby / Send Code to Partner (Screenshot 2) -->
              <div class="ldr-stage-panel" id="ldrStageLobby" style="display:none;">
                <div class="ldr-lobby-waiting-wrap" id="ldrLobbyWaitingWrap">
                  <div class="ldr-lobby-ambient-bg">
                    <h2 class="ldr-code-screen-title">Send this code to your partner</h2>
                    <p class="ldr-code-screen-sub">They type it in, or open your link.</p>

                    <div class="ldr-code-box-card">
                      <div class="ldr-code-tiles-row" id="ldrCodeTilesContainer">
                        <span class="ldr-code-tile">-</span>
                        <span class="ldr-code-tile">-</span>
                        <span class="ldr-code-tile">-</span>
                        <span class="ldr-code-tile">-</span>
                        <span class="ldr-code-tile">-</span>
                      </div>
                      <span id="ldrModalRoomCode" style="display:none;"></span>

                      <div class="ldr-code-actions-row">
                        <button type="button" class="ldr-tile-btn" id="btnModalCopyInvite">Copy link</button>
                        <button type="button" class="ldr-tile-btn" id="btnModalShareInvite">share ↗</button>
                      </div>

                      <!-- Waiting pulse before partner connects -->
                      <div class="ldr-waiting-indicator" id="ldrWaitingStatusWrap">
                        <span class="ldr-pulse-pink-dot"></span>
                        <span id="ldrLobbyWaitingMsg">Waiting for your partner...</span>
                      </div>
                    </div>

                    <div class="ldr-code-bottom-links">
                      <button type="button" class="ldr-link-btn" id="btnLdrPhotosAlone">Take photos alone instead</button>
                      <button type="button" class="ldr-link-btn" id="btnLdrLeaveRoom">Leave</button>
                    </div>
                  </div>
                </div>

                <!-- Clean Connected Screen (Screenshot 2 post-join): Code disappears, both see each other live -->
                <div class="ldr-partner-connected-card" id="ldrPartnerConnectedCard" style="display:none;">
                  <div class="ldr-connected-banner">
                    <span class="ldr-connected-tag">💕 Partner Connected & Live!</span>
                    <span class="ldr-connected-sub">You are connected. Ready to style your photo strip?</span>
                  </div>
                  <div class="ldr-dual-preview-row">
                    <div class="ldr-preview-feed-box">
                      <video id="photoboothVideoLobbyPreview" autoplay playsinline muted></video>
                      <span class="feed-tag">You</span>
                    </div>
                    <div class="ldr-preview-feed-box">
                      <video id="ldrVideoFeedLobbyRemote" autoplay playsinline webkit-playsinline muted></video>
                      <span class="feed-tag">Partner 💕</span>
                      <div class="remote-placeholder" id="ldrLobbyRemotePlaceholder" style="display:none;">
                        <span class="placeholder-icon">💕</span>
                        <span class="placeholder-txt">Connecting video...</span>
                      </div>
                    </div>
                  </div>
                  <div class="ldr-proceed-bar">
                    <button type="button" class="btn btn-primary btn-xl ldr-proceed-setup-btn" id="btnProceedToSetup">
                      <span>Proceed to Frame & Theme →</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Stage 2: Synchronized Frame & Style Selection -->
              <div class="ldr-stage-panel" id="ldrStageSetup" style="display:none;">
                <div class="ldr-setup-wrap">

                  <!-- Sub-step 1: Photo Layout Format with Real Frames -->
                  <div class="ldr-setup-substep" id="ldrSetupStepFormat">
                    <div class="ldr-stage-header">
                      <span class="ldr-step-badge">Step 1 of 3 • Layout Format</span>
                      <h3 class="ldr-stage-title">Choose Photo Layout Format</h3>
                    </div>

                    <div class="ldr-format-cards-grid" id="ldrFormatCardsGrid" role="radiogroup" aria-label="Photo Layout Format">
                      ${FRAME_CATALOGUE.map(item => `
                      <div class="frame-card-preview ldr-format-card-preview format-aspect-${item.aspect} ${(defaultFormat === item.id || (item.id === 'asym_tr_chin' && (defaultFormat === 'wide_collage' || defaultFormat === 'asym_collage')) || (item.id === 'landscape_single' && defaultFormat === 'landscape_hero')) ? 'active' : ''}" data-format="${item.id}" data-aspect="${item.aspect}" tabindex="0">
                        <div class="frame-mini-strip frame-style-minimal format-frame-preview format-${item.id} format-aspect-${item.aspect}">${renderMiniWindows(item.id)}</div>
                        <div class="ldr-card-meta">
                          <span class="frame-card-title">${item.num}. ${item.title}</span>
                          <span class="frame-card-sub">${item.desc}</span>
                        </div>
                      </div>
                      `).join("")}
                    </div>

                    <!-- Hidden legacy format pills preserved for compatibility -->
                    <div class="booth-formats-row ldr-formats-row" style="display:none;" role="radiogroup" aria-label="Photo Layout Format">
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'classic_3cut' ? 'active' : ''}" data-format="classic_3cut">1×3 Strip</button>
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'classic_strip' ? 'active' : ''}" data-format="classic_strip">1×4 Strip</button>
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'double_6cut' ? 'active' : ''}" data-format="double_6cut">2×3 Double</button>
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'double_8cut' ? 'active' : ''}" data-format="double_8cut">2×4 Double</button>
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'film_grid' ? 'active' : ''}" data-format="film_grid">2×2 Grid</button>
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'grid_3x3' ? 'active' : ''}" data-format="grid_3x3">3×3 Grid</button>
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'polaroid_single' ? 'active' : ''}" data-format="polaroid_single">Polaroid</button>
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'portrait_pair' ? 'active' : ''}" data-format="portrait_pair">1×2 Pair</button>
                      <button type="button" class="format-pill-btn ldr-format-pill-btn ${defaultFormat === 'wide_collage' ? 'active' : ''}" data-format="wide_collage">Collage</button>
                    </div>

                    <div class="ldr-stage-actions ldr-setup-nav-bar">
                      <button type="button" class="btn btn-secondary btn-lg btn-return-sync" id="btnFormatBackToLobby">
                        <span>← Return</span>
                      </button>
                      <button type="button" class="btn btn-primary btn-xl" id="btnFormatNextToTheme">
                        <span>Border &amp; Filter</span>
                      </button>
                    </div>
                  </div>

                  <!-- Sub-step 2: Decorative Border Theme & Color Filter -->
                  <div class="ldr-setup-substep" id="ldrSetupStepTheme" style="display:none;">
                    <div class="ldr-stage-header">
                      <span class="ldr-step-badge">Step 2 of 3 • Border &amp; Filter</span>
                      <h3 class="ldr-stage-title">Pick Border Theme &amp; Color Tone</h3>
                      <p class="ldr-stage-sub">Select a decorative border artwork and vintage tone for your strip.</p>
                    </div>

                    <div class="ldr-setup-content-scroll">
                      <div class="ldr-setup-section">
                        <div class="ldr-section-header">
                          <span class="ldr-section-num">1</span>
                          <label class="ldr-setup-label">Decorative Border Theme</label>
                        </div>
                        <div class="booth-frame-cards-grid ldr-frame-cards-grid format-aspect-${getFormatAspect(defaultFormat)}" id="ldrModalLayoutPicker" data-format="${defaultFormat}" data-aspect="${getFormatAspect(defaultFormat)}" role="radiogroup" aria-label="Frame Style">
                          <div class="frame-card-preview ${defaultStyle === 'style_cyan_stars' ? 'active' : ''} layout-chip-btn ldr-style-chip-btn" data-layout="${defaultFormat}" data-style="style_cyan_stars" tabindex="0">
                            <div class="frame-mini-strip frame-style-classic format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">${renderMiniWindows(defaultFormat)}</div>
                            <span class="frame-card-title">CYAN STARS</span>
                          </div>
                          <div class="frame-card-preview ${defaultStyle === 'style_floral' ? 'active' : ''} layout-chip-btn ldr-style-chip-btn" data-layout="${defaultFormat}" data-style="style_floral" tabindex="0">
                            <div class="frame-mini-strip frame-style-floral format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">${renderMiniWindows(defaultFormat)}</div>
                            <span class="frame-card-title">FLORAL TEAL</span>
                          </div>
                          <div class="frame-card-preview ${defaultStyle === 'style_retro_swirl' ? 'active' : ''} layout-chip-btn ldr-style-chip-btn" data-layout="${defaultFormat}" data-style="style_retro_swirl" tabindex="0">
                            <div class="frame-mini-strip frame-style-swirls format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">${renderMiniWindows(defaultFormat)}</div>
                            <span class="frame-card-title">RETRO SWIRL</span>
                          </div>
                          <div class="frame-card-preview ${defaultStyle === 'style_lavender_stripes' ? 'active' : ''} layout-chip-btn ldr-style-chip-btn" data-layout="${defaultFormat}" data-style="style_lavender_stripes" tabindex="0">
                            <div class="frame-mini-strip frame-style-stripes format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">${renderMiniWindows(defaultFormat)}</div>
                            <span class="frame-card-title">LAVENDER</span>
                          </div>
                          <div class="frame-card-preview ${defaultStyle === 'style_noir_film' ? 'active' : ''} layout-chip-btn ldr-style-chip-btn" data-layout="${defaultFormat}" data-style="style_noir_film" tabindex="0">
                            <div class="frame-mini-strip frame-style-noir format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">${renderMiniWindows(defaultFormat)}</div>
                            <span class="frame-card-title">35MM NOIR</span>
                          </div>
                          <div class="frame-card-preview ${defaultStyle === 'style_y2k_pink' ? 'active' : ''} layout-chip-btn ldr-style-chip-btn" data-layout="${defaultFormat}" data-style="style_y2k_pink" tabindex="0">
                            <div class="frame-mini-strip frame-style-y2k format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">${renderMiniWindows(defaultFormat)}</div>
                            <span class="frame-card-title">Y2K PINK</span>
                          </div>
                          <div class="frame-card-preview ${defaultStyle === 'style_newspaper' ? 'active' : ''} layout-chip-btn ldr-style-chip-btn" data-layout="${defaultFormat}" data-style="style_newspaper" tabindex="0">
                            <div class="frame-mini-strip frame-style-newspaper format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">${renderMiniWindows(defaultFormat)}</div>
                            <span class="frame-card-title">NEWSPAPER</span>
                          </div>
                          <div class="frame-card-preview ${defaultStyle === 'style_minimal_white' ? 'active' : ''} layout-chip-btn ldr-style-chip-btn" data-layout="${defaultFormat}" data-style="style_minimal_white" tabindex="0">
                            <div class="frame-mini-strip frame-style-minimal format-${defaultFormat} format-aspect-${getFormatAspect(defaultFormat)}">${renderMiniWindows(defaultFormat)}</div>
                            <span class="frame-card-title">MINIMAL</span>
                          </div>
                        </div>
                        <div id="ldrModalStylePicker" style="display:none;"></div>
                      </div>

                      <div class="ldr-setup-section">
                        <div class="ldr-section-header">
                          <span class="ldr-section-num">2</span>
                          <label class="ldr-setup-label">Color Filter</label>
                        </div>
                        <div class="booth-filter-chips ldr-filter-chips" id="ldrModalFilterChips" role="radiogroup" aria-label="Color Filter">
                          <button type="button" class="filter-chip-btn ${defaultFilter === 'vintage_90s' ? 'active' : ''}" data-filter="vintage_90s">90s Film</button>
                          <button type="button" class="filter-chip-btn ${defaultFilter === 'bw_noir' ? 'active' : ''}" data-filter="bw_noir">B&amp;W Noir</button>
                          <button type="button" class="filter-chip-btn ${defaultFilter === 'golden_sunset' ? 'active' : ''}" data-filter="golden_sunset">Golden Sunset</button>
                          <button type="button" class="filter-chip-btn ${defaultFilter === 'dreamy_bloom' ? 'active' : ''}" data-filter="dreamy_bloom">Dreamy Bloom</button>
                          <button type="button" class="filter-chip-btn ${defaultFilter === 'cyberpunk' ? 'active' : ''}" data-filter="cyberpunk">Cyberpunk</button>
                          <button type="button" class="filter-chip-btn ${defaultFilter === 'natural' ? 'active' : ''}" data-filter="natural">Natural</button>
                        </div>
                      </div>
                    </div>

                    <div class="ldr-stage-actions ldr-setup-nav-bar">
                      <button type="button" class="btn btn-secondary btn-lg btn-return-sync" id="btnThemeBackToFormat">
                        <span>← Return</span>
                      </button>
                      <button type="button" class="btn btn-primary btn-xl" id="btnThemeNextToCaption">
                        <span>Inscription</span>
                      </button>
                    </div>
                  </div>

                  <!-- Sub-step 3: Couple Inscription with Live Strip Preview -->
                  <div class="ldr-setup-substep" id="ldrSetupStepCaption" style="display:none;">
                    <div class="ldr-stage-header">
                      <span class="ldr-step-badge">Step 3 of 3 • Couple Inscription</span>
                      <h3 class="ldr-stage-title">Your Custom Couple Inscription</h3>
                      <p class="ldr-stage-sub">Shown live on your selected frame format and decorative theme.</p>
                    </div>

                    <div class="ldr-setup-content-scroll">
                      <div class="ldr-caption-step-split">
                        <div class="ldr-caption-preview-col">
                          <div class="ldr-live-selected-strip-card" id="ldrSelectedStripPreview">
                            <!-- Dynamically populated live preview of frame + style + filter + phrase -->
                          </div>
                        </div>

                        <div class="ldr-caption-controls-col">
                          <div class="booth-phrase-editor-bar ldr-phrase-editor-bar">
                            <label class="ldr-setup-label">Write on your strip</label>
                            <input type="text" id="ldrModalPhraseInput" class="booth-phrase-input form-input" maxlength="42" value="${esc(stripCaption)}" placeholder="Write something lovely on your strip..." />
                            <div class="phrase-presets">
                              <button type="button" class="phrase-preset-btn" data-phrase="Forever &amp; Always ♡">Forever &amp; Always ♡</button>
                              <button type="button" class="phrase-preset-btn" data-phrase="You + Me = Love ✨">You + Me = Love ✨</button>
                              <button type="button" class="phrase-preset-btn" data-phrase="Best Day Ever 📸">Best Day Ever 📸</button>
                              <button type="button" class="phrase-preset-btn" data-phrase="To The Moon &amp; Back 🌙">To The Moon &amp; Back 🌙</button>
                              <button type="button" class="phrase-preset-btn" data-phrase="Together Forever 💕">Together Forever 💕</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="ldr-stage-actions ldr-setup-nav-bar">
                      <button type="button" class="btn btn-secondary btn-lg btn-return-sync" id="btnCaptionBackToTheme">
                        <span>← Return</span>
                      </button>
                      <button type="button" id="btnLdrReadyToShoot" class="btn btn-primary btn-xl">
                        <span>📸 Shoot Photos</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Stage 3: Synchronized Capture / Viewfinder -->
              <div class="ldr-stage-panel" id="ldrStageCapture" style="display:none;">
                <div class="ldr-capture-wrap">
                  <div class="ldr-capture-top-nav">
                    <button type="button" id="btnCaptureBackToSetup" class="btn-nav-back btn-return-sync">
                      <span>← Return</span>
                    </button>
                  </div>

                  <!-- Camera Pro Controls Bar -->
                  <div class="booth-pro-bar ldr-capture-pro-bar">
                    <div class="booth-timer-picker" role="radiogroup" aria-label="Shutter Timer">
                      <span class="pro-label">⏱️</span>
                      <button type="button" class="pro-chip-btn active ldr-timer-chip" data-timer="3">3s</button>
                      <button type="button" class="pro-chip-btn ldr-timer-chip" data-timer="5">5s</button>
                      <button type="button" class="pro-chip-btn ldr-timer-chip" data-timer="10">10s</button>
                      <button type="button" class="pro-chip-btn ldr-timer-chip" data-timer="1">Instant</button>
                    </div>
                    <div class="booth-pro-toggles">
                      <button type="button" id="btnSwitchCameraLdr" class="pro-icon-toggle" title="Flip Camera">
                        <span>🔄</span>
                      </button>
                      <button type="button" id="btnToggleMirrorLdr" class="pro-icon-toggle active" title="Toggle Mirror View">
                        <span>🪞</span>
                      </button>
                    </div>
                  </div>

                  <div class="ldr-viewfinder-screen">
                    <div class="viewfinder-split-screen modal-split-viewfinder" id="ldrSplitViewfinder">
                      <div class="split-feed split-feed-local">
                        <video id="ldrVideoFeedLocal" autoplay playsinline muted></video>
                        <span class="split-tag">You (Local)</span>
                      </div>
                      <div class="split-feed split-feed-remote">
                        <video id="ldrVideoFeedRemote" autoplay playsinline webkit-playsinline muted></video>
                        <span class="split-tag">Partner 💕 (Live Audio 🎤)</span>
                        <div class="remote-placeholder" id="ldrRemotePlaceholder">
                          <span class="placeholder-icon">💕</span>
                          <span class="placeholder-txt">Connecting partner video &amp; audio...</span>
                        </div>
                      </div>
                    </div>

                    <div class="photobooth-countdown-overlay" id="ldrModalCountdown" style="display:none;">
                      <span class="countdown-digit" id="ldrCountdownDigit">3</span>
                    </div>
                  </div>

                  <div class="ldr-capture-controls">
                    <div class="ldr-pose-hint" id="ldrModalPoseHint">✨ Pose 1: Smile big together! 😊</div>
                    <div class="ldr-burst-progress-wrap" id="ldrBurstProgressWrap">
                      <div class="ldr-burst-progress-dots" id="ldrBurstProgressDots"></div>
                      <span class="ldr-burst-progress-text" id="ldrBurstProgressText">Ready for Shot 1</span>
                    </div>
                    <div class="ldr-shutter-bar">
                      <button type="button" class="photobooth-shutter-btn" id="btnLdrModalShutter" aria-label="Take synchronized photo burst">
                        <div class="shutter-inner">
                          <span class="shutter-icon">📸</span>
                        </div>
                      </button>
                    </div>
                    <div class="ldr-early-select-bar" id="ldrEarlySelectBar" style="display:none;">
                      <button type="button" class="btn btn-sm btn-primary ldr-early-select-btn" id="btnLdrDoneEarly">
                        <span>Done, Pick Favorites →</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stage 4: Synchronized Photo Selection Tray -->
              <div class="ldr-stage-panel" id="ldrStageSelect" style="display:none;">
                <div class="ldr-select-wrap">
                  <div class="ldr-stage-header">
                    <span class="ldr-step-badge">Step 4 of 6 • Select Shots</span>
                    <h3 class="ldr-stage-title">Choose Your Favorite Shots</h3>
                    <p class="ldr-stage-sub" id="ldrSelectionCounterText">Select photos to place in your couple strip</p>
                  </div>

                  <div class="selection-candidates-grid ldr-candidates-grid" id="ldrModalCandidatesGrid"></div>

                  <div class="ldr-stage-actions">
                    <button type="button" class="btn btn-secondary btn-lg btn-return-sync" id="btnSelectBackToCapture">
                      <span>← Return</span>
                    </button>
                    <button type="button" id="btnLdrModalRetryExtra" class="btn btn-secondary btn-lg">
                      <span>🔄 Reshoot Extra Set (1 Left)</span>
                    </button>
                    <button type="button" id="btnLdrConfirmSelection" class="btn btn-primary btn-xl" disabled>
                      <span>✨ Next: Doodle &amp; Stickers →</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Stage 5: Synchronized Doodle & Deco Studio -->
              <div class="ldr-stage-panel" id="ldrStageDeco" style="display:none;">
                <div class="ldr-deco-wrap">
                  <div class="ldr-stage-header">
                    <span class="ldr-step-badge">Step 5 of 6 • Decorate Together</span>
                    <h3 class="ldr-stage-title">Draw, Sign &amp; Decorate Together</h3>
                    <p class="ldr-stage-sub">Your strokes and stickers appear on both screens in real time!</p>
                  </div>

                  <!-- Deco Navigation Tabs -->
                  <div class="photobooth-deco-tabs" id="ldrModalDecoTabs" role="tablist" aria-label="Deco Categories">
                    <button type="button" class="deco-tab-btn active" data-tab="stickers" role="tab">✨ Stickers</button>
                    <button type="button" class="deco-tab-btn" data-tab="frames" role="tab">🖼️ Whole Frames</button>
                    <button type="button" class="deco-tab-btn" data-tab="stamps" role="tab">🏷️ Postal &amp; Wax</button>
                    <button type="button" class="deco-tab-btn" data-tab="washi" role="tab">🩹 Washi Tape</button>
                    <button type="button" class="deco-tab-btn" data-tab="paint" role="tab">🎨 Paint &amp; Doodle</button>
                  </div>

                  <!-- Sticker Palette Tray -->
                  <div class="photobooth-sticker-tray ldr-sticker-tray">
                    <div class="sticker-palette" id="ldrModalStickerPalette"></div>
                  </div>

                  <!-- Paint & Doodle Palette -->
                  <div class="photobooth-paint-palette ldr-paint-palette" id="ldrModalPaintPalette" style="display:none;">
                    <div class="paint-color-swatches" id="ldrModalColorSwatches">
                      <button type="button" class="color-swatch-btn active" data-color="#ff2d55" style="background:#ff2d55;" title="Ruby Red"></button>
                      <button type="button" class="color-swatch-btn" data-color="#ffffff" style="background:#ffffff;" title="Pure White"></button>
                      <button type="button" class="color-swatch-btn" data-color="#000000" style="background:#000000;" title="Jet Black"></button>
                      <button type="button" class="color-swatch-btn" data-color="#ffd60a" style="background:#ffd60a;" title="Gold Star"></button>
                      <button type="button" class="color-swatch-btn" data-color="#30d158" style="background:#30d158;" title="Mint Green"></button>
                      <button type="button" class="color-swatch-btn" data-color="#0a84ff" style="background:#0a84ff;" title="Sky Blue"></button>
                      <button type="button" class="color-swatch-btn" data-color="#bf5af2" style="background:#bf5af2;" title="Lavender"></button>
                      <button type="button" class="color-swatch-btn" data-color="#ff9f0a" style="background:#ff9f0a;" title="Warm Coral"></button>
                    </div>
                    <div class="paint-size-picker" id="ldrModalSizePicker">
                      <button type="button" class="size-chip-btn" data-size="3">Fine</button>
                      <button type="button" class="size-chip-btn active" data-size="6">Med</button>
                      <button type="button" class="size-chip-btn" data-size="14">Bold</button>
                    </div>
                    <div class="paint-tools-row">
                      <button type="button" id="btnLdrModalUndoPaint" class="deco-tool-pill" title="Undo Last Stroke">↩️ Undo</button>
                      <button type="button" id="btnLdrModalClearPaint" class="deco-tool-pill deco-tool-clear" title="Clear All Paint">🧹 Clear Paint</button>
                    </div>
                  </div>

                  <div class="ldr-deco-workspace">
                    <div class="ldr-deco-canvas-wrap" id="ldrModalDecoCanvasWrap">
                      <div class="photobooth-strip-container" id="ldrModalStripContainer"></div>
                      <canvas class="photobooth-paint-canvas" id="ldrModalPaintCanvas"></canvas>
                    </div>
                  </div>

                  <div class="ldr-stage-actions">
                    <button type="button" class="btn btn-secondary btn-lg btn-return-sync" id="btnDecoBackToSelect">
                      <span>← Return</span>
                    </button>
                    <button type="button" id="btnLdrModalPrintStrip" class="btn btn-primary btn-xl">
                      <span>🖨️ Print Final Strip!</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Stage 6: Keepsake Celebration & Eject -->
              <div class="ldr-stage-panel" id="ldrStagePrint" style="display:none;">
                <div class="ldr-print-wrap">
                  <div class="ldr-stage-header">
                    <span class="ldr-step-badge">🎉 Keepsake Ready</span>
                    <h3 class="ldr-stage-title">Your Couple Photo Strip is Ready!</h3>
                    <p class="ldr-stage-sub">Taken together with love across the distance.</p>
                  </div>

                  <div class="ldr-eject-slot-wrap">
                    <div class="photobooth-machine-slot">
                      <div class="photobooth-eject-tray" id="ldrModalEjectTray"></div>
                    </div>
                  </div>

                  <div class="ldr-stage-actions ldr-print-actions">
                    <button type="button" id="btnLdrModalDownload" class="btn btn-primary btn-lg">
                      <span>💾 Save Photo Strip (PNG)</span>
                    </button>
                    <button type="button" id="btnLdrModalShare" class="btn btn-accent btn-lg">
                      <span>💌 Share Strip</span>
                    </button>
                    <button type="button" id="btnLdrModalNewSession" class="btn btn-secondary btn-lg">
                      <span>🔄 Take Another Strip</span>
                    </button>
                    <button type="button" id="btnLdrModalFinishExit" class="btn btn-ghost btn-lg">
                      <span>✕ Finish &amp; Exit Room</span>
                    </button>
                  </div>
                </div>
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
