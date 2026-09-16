(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

  const renderTemplate = (data = {}, rootData = {}) => {
    const pb = (data && typeof data === "object") ? data : {};
    const p1 = pb.partner1 || rootData.partner1 || "Alex";
    const p2 = pb.partner2 || rootData.partner2 || "Sam";
    const tag = pb.tag || "Vintage Photobooth 📸";
    const title = pb.title || "Capture Our Sweet Moments";
    const desc = pb.desc || "Pick a retro frame, strike your cutest poses, and print a personalized love strip keepsake!";
    const defaultLayout = pb.defaultLayout || "classic_strip";
    const defaultFormat = pb.defaultFormat || "classic_3cut";
    const defaultStyle = pb.defaultStyle || "style_cyan_stars";
    const defaultFilter = pb.defaultFilter || "vintage_90s";
    const stripCaption = pb.stripCaption || (p1 + " & " + p2 + " ♡ Forever");
    const stripLocation = pb.stripLocation || "PARIS • 2026";
    const sfxEnabled = pb.sfxEnabled !== false;

    const renderMiniWindows = (fmt = "classic_3cut") => {
      switch (fmt) {
        case "grid_3x3":
          return `<div class="mini-windows-wrap fmt-grid_3x3">${Array(9).fill('<div class="mini-window"></div>').join("")}</div>`;
        case "film_grid":
          return `<div class="mini-windows-wrap fmt-film_grid">${Array(4).fill('<div class="mini-window"></div>').join("")}</div>`;
        case "classic_strip":
          return `<div class="mini-windows-wrap fmt-classic_strip">${Array(4).fill('<div class="mini-window"></div>').join("")}</div>`;
        case "portrait_pair":
          return `<div class="mini-windows-wrap fmt-portrait_pair">${Array(2).fill('<div class="mini-window"></div>').join("")}</div>`;
        case "wide_collage":
          return `<div class="mini-windows-wrap fmt-wide_collage"><div class="mini-window mini-win-top"></div><div class="mini-window mini-win-top"></div><div class="mini-window mini-win-bot"></div></div>`;
        case "polaroid_single":
          return `<div class="mini-windows-wrap fmt-polaroid_single"><div class="mini-window"></div></div>`;
        case "classic_3cut":
        default:
          return `<div class="mini-windows-wrap fmt-classic_3cut">${Array(3).fill('<div class="mini-window"></div>').join("")}</div>`;
      }
    };

    return `
    <section class="section photobooth-section" id="section-photobooth" data-widget-id="photobooth">
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
              <span class="booth-meta-pill">Six vintage colour styles</span>
              <span class="booth-meta-pill">Nineteen frame layouts</span>
              <span class="booth-meta-pill">Thirty-two sticker designs</span>
              <span class="booth-meta-pill">One to six photo layouts</span>
              <span class="booth-meta-pill">Free on the web • no account</span>
            </div>

            <div class="photobooth-cta-row">
              <button type="button" id="btnHeaderTake" class="booth-cta-pill booth-cta-take">take a photo</button>
              <button type="button" id="btnHeaderUpload" class="booth-cta-pill booth-cta-upload">upload photo</button>
            </div>
          </div>

          <div class="photobooth-apparatus" data-default-layout="${esc(defaultLayout)}" data-default-filter="${esc(defaultFilter)}" data-strip-caption="${esc(stripCaption)}" data-strip-location="${esc(stripLocation)}" data-sfx="${sfxEnabled}">
            <div class="photobooth-flash" id="photoboothFlash" aria-hidden="true"></div>

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
              
              <!-- Layout Formats Row -->
              <div class="booth-formats-row" role="radiogroup" aria-label="Photo Layout Format">
                <button type="button" class="format-pill-btn ${defaultFormat === 'classic_3cut' ? 'active' : ''}" data-format="classic_3cut">1×3 Strip</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'film_grid' ? 'active' : ''}" data-format="film_grid">2×2 Grid</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'grid_3x3' ? 'active' : ''}" data-format="grid_3x3">3×3 Grid</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'classic_strip' ? 'active' : ''}" data-format="classic_strip">1×4 Strip</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'portrait_pair' ? 'active' : ''}" data-format="portrait_pair">1×2 Pair</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'wide_collage' ? 'active' : ''}" data-format="wide_collage">Collage</button>
                <button type="button" class="format-pill-btn ${defaultFormat === 'polaroid_single' ? 'active' : ''}" data-format="polaroid_single">Polaroid</button>
              </div>

              <!-- Decorative Border Styles Grid -->
              <div class="booth-frame-cards-grid" id="boothLayoutChips" role="radiogroup" aria-label="Frame Style">
                <div class="frame-card-preview ${defaultStyle === 'style_cyan_stars' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_cyan_stars" tabindex="0">
                  <div class="frame-mini-strip frame-style-classic">
                    ${renderMiniWindows(defaultFormat)}
                    <div class="mini-stars-footer">★★★</div>
                  </div>
                  <span class="frame-card-title">CLASSIC STRIP</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_floral' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_floral" tabindex="0">
                  <div class="frame-mini-strip frame-style-floral">
                    ${renderMiniWindows(defaultFormat)}
                    <div class="mini-floral-footer">🌸🌿</div>
                  </div>
                  <span class="frame-card-title">FILM GRID</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_retro_swirl' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_retro_swirl" tabindex="0">
                  <div class="frame-mini-strip frame-style-swirls">
                    ${renderMiniWindows(defaultFormat)}
                    <div class="mini-swirl-footer">🌀</div>
                  </div>
                  <span class="frame-card-title">PORTRAIT PAIR</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_lavender_stripes' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_lavender_stripes" tabindex="0">
                  <div class="frame-mini-strip frame-style-stripes">
                    ${renderMiniWindows(defaultFormat)}
                    <div class="mini-stripes-footer">✨</div>
                  </div>
                  <span class="frame-card-title">WIDE COLLAGE</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_noir_film' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_noir_film" tabindex="0">
                  <div class="frame-mini-strip frame-style-noir">
                    ${renderMiniWindows(defaultFormat)}
                    <div class="mini-noir-footer">🎞️ 35MM</div>
                  </div>
                  <span class="frame-card-title">35MM NOIR</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_y2k_pink' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_y2k_pink" tabindex="0">
                  <div class="frame-mini-strip frame-style-y2k">
                    ${renderMiniWindows(defaultFormat)}
                    <div class="mini-y2k-footer">🎀 Y2K</div>
                  </div>
                  <span class="frame-card-title">Y2K PINK</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_newspaper' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_newspaper" tabindex="0">
                  <div class="frame-mini-strip frame-style-newspaper">
                    ${renderMiniWindows(defaultFormat)}
                    <div class="mini-news-footer">📰 NEWS</div>
                  </div>
                  <span class="frame-card-title">NEWSPAPER</span>
                </div>

                <div class="frame-card-preview ${defaultStyle === 'style_minimal_white' ? 'active' : ''} layout-chip-btn" data-layout="${defaultFormat}" data-style="style_minimal_white" tabindex="0">
                  <div class="frame-mini-strip frame-style-minimal">
                    ${renderMiniWindows(defaultFormat)}
                    <div class="mini-min-footer">🤍 MUSEUM</div>
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

            <div class="photobooth-review-workspace photobooth-print" id="photoboothReviewWorkspace" style="display:none;">
              <!-- Deco Toolbar -->
              <div class="photobooth-deco-header">
                <div class="photobooth-sticker-tray">
                  <span class="tray-label">✨ Tap Sticker to Deco:</span>
                  <div class="sticker-palette" id="boothStickerPalette"></div>
                </div>
                <div class="deco-action-pills">
                  <button type="button" id="btnShufflePhotos" class="deco-tool-pill" title="Reorder Photos">🔀 Swap Shots</button>
                  <button type="button" id="btnToggleGrain" class="deco-tool-pill active" title="Toggle 35mm Film Grain">🎞️ Grain</button>
                  <button type="button" id="btnToggleDateStamp" class="deco-tool-pill active" title="Toggle Date Stamp">📅 Date</button>
                </div>
              </div>

              <div class="photobooth-stage-wrap photobooth-slot photobooth-print-slot">
                <div class="photobooth-strip-outer" id="photoboothStripOuter">
                  <div class="photobooth-strip-container" id="photoboothStripContainer"></div>
                </div>
              </div>

              <div class="photobooth-actions-row">
                <button type="button" id="btnRetakeBurst" class="btn btn-secondary">
                  <span>🔄 Retake Shots</span>
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
