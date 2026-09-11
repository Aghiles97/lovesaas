/**
 * Template Renderer: hero
 * Modular Decomposed Component
 */
(function() {
  if (typeof escapeHtml !== "function") {
    if (typeof window !== "undefined") {
      window.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };
    } else {
      global.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };
    }
  }
  if (typeof safeVal !== "function") {
    if (typeof window !== "undefined") {
      window.safeVal = function(v) {
        return String(v == null ? "" : v).replace(/"/g, "&quot;");
      };
    } else {
      global.safeVal = function(v) {
        return String(v == null ? "" : v).replace(/"/g, "&quot;");
      };
    }
  }

  const renderTemplate = (heroData = {}, rootData = {}) => {
    const data = { ...rootData, ...heroData };
    const p1 = data.partner1 || "Aghiles";
    const p2 = data.partner2 || "Ella";
    const flight = data.flightNumber || "LOF-999";
    const city1 = data.cityAlg || "Algiers";
    const city2 = data.cityPartner || "Jakarta";
    const flag1 = data.flag1 || (city1.includes("🇫🇷") ? "🇫🇷" : city1.includes("🇩🇿") ? "🇩🇿" : "✈️");
    const flag2 = data.flag2 || (city2.includes("🇯🇵") ? "🇯🇵" : city2.includes("🇮🇩") ? "🇮🇩" : "💖");
    const avatar1 = data.avatar1 || "👦🏻";
    const avatar2 = data.avatar2 || "👧🏻";
    const subtitle = data.subtitle || "I Lof Lof You More Every Single Second ✨";
    const heroDesc = data.heroDesc || "Today is all about celebrating you. Even across the miles in our long-distance journey, my heart is always right beside you. Here is our personal world filled with birthday wishes, kisses, and hugs!";
    const anniDate = data.anniversaryDate ? new Date(data.anniversaryDate) : new Date("2025-09-17T00:00");
    const anniFormatted = !isNaN(anniDate.getTime()) ? anniDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "September 17, 2025";
    const distanceKm = data.distanceKm || "11,550";

    return `
    <!-- Hero Section -->
    <header class="hero-section">
      <div class="container hero-container">
        <div class="badge-pill">
          <span class="badge-dot"></span>
          <span>🎂 Happy Birthday ${p2} • From ${p1} with endless lof lof ✨</span>
        </div>
        <h1 class="hero-title">
          Happy Birthday <span class="partner-name-display highlight-name">${p2}</span>! 🎂❤️
          <span class="hero-subline">${subtitle}</span>
        </h1>
        <p class="hero-subtitle">
          ${heroDesc}
        </p>

        <!-- Unified Heartbeat & Magnetic Distance Connection Hub -->
        <div class="love-connection-hub glass-panel" id="loveConnectionHub">
          <div class="hub-header">
            <div class="hub-status-live">
              <span class="live-heart-icon">💖</span>
              <span id="hubLiveTag">Synchronized in Heart & Soul</span>
            </div>
            <div class="hub-bpm-pill" id="hubBpmPill">
              <span class="bpm-dot"></span>
              <span id="hubBpmDisplay">78 BPM In Sync</span>
            </div>
          </div>

          <div class="hub-stage-track" id="hubStageTrack">
            <!-- Left: Partner 1 -->
            <div class="hub-avatar-node node-left" id="hubAvatarLeft">
              <div class="hub-avatar-ring pulse-alg" id="hubAvatarLeftRing">
                <span class="hub-flag-badge">${flag1}</span>
                <span class="hub-avatar-face">${avatar1}</span>
              </div>
              <div class="hub-node-meta">
                <span class="hub-partner-name" id="hubPartner1Name" style="font-size:11px; opacity:0.85; font-weight:600;">${p1}</span>
                <strong class="hub-city-name">${city1}</strong>
                <span class="hub-bpm-readout"><span id="hubAlgBpm">76</span> BPM</span>
                <span class="ldr-time time-alg-live">--:--:--</span>
              </div>
            </div>

            <!-- Center: EKG Wave + Magnetic Distance Odometer -->
            <div class="hub-center-core">
              <div class="hub-ekg-display">
                <svg class="hub-ekg-svg" viewBox="0 0 240 50" preserveAspectRatio="none">
                  <path class="hub-ekg-path" id="hubEkgPath" d="M0,25 L50,25 L60,8 L70,42 L80,14 L90,25 L150,25 L160,6 L170,44 L180,16 L190,25 L240,25" />
                </svg>
              </div>
              <div class="hub-distance-meter">
                <div class="dist-counter-row">
                  <span class="dist-odometer" id="hubKmValue" data-orig-km="${distanceKm}">${distanceKm}</span>
                  <span class="dist-odometer-unit">KM</span>
                </div>
                <span class="hub-distance-subtext" id="hubDistanceSubtext">Physical Distance • Tap Below to Collapse</span>
              </div>
            </div>

            <!-- Right: Partner 2 -->
            <div class="hub-avatar-node node-right" id="hubAvatarRight">
              <div class="hub-avatar-ring pulse-jak" id="hubAvatarRightRing">
                <span class="hub-flag-badge">${flag2}</span>
                <span class="hub-avatar-face">${avatar2}</span>
              </div>
              <div class="hub-node-meta">
                <span class="hub-partner-name" id="hubPartner2Name" style="font-size:11px; opacity:0.85; font-weight:600;">${p2}</span>
                <strong class="hub-city-name">${city2}</strong>
                <span class="hub-bpm-readout"><span id="hubJakBpm">78</span> BPM</span>
                <span class="ldr-time time-jak-live">--:--:--</span>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="hub-footer-bar">
            <span class="hub-whisper-quote" id="hubWhisperQuote">"Two hearts across ${distanceKm} km beating in one exact rhythm 💕"</span>
            <button type="button" class="btn-hub-sync" id="btnHubSync">
              <span>Sync Pulse & Pull Us Close 💓🧲</span>
            </button>
          </div>
        </div>

        <!-- Quintillions Lof Counter -->
        <div class="counter-card glass-panel">
          <div class="counter-header">
            <span class="counter-icon">💖</span>
            <span class="counter-title">I Lof You Exactly This Much</span>
          </div>
          <div class="quintillion-display-wrap">
            <div id="quintillionNumber" class="quintillion-number">9,847,293,847,192,840,320</div>
            <span class="quintillion-unit">Quintillion Units of Lof & Kissies (and growing every millisecond!)</span>
          </div>
          <div class="counter-time-sub">
            <span>⏳ Making unforgettable memories since <strong id="anniversaryDateDisplay">${anniFormatted}</strong></span>
            <div class="mini-days-row">
              <span id="daysTogetherCount">0</span> Days of pure happiness together 💕
            </div>
          </div>
        </div>

        <!-- Small Hero Voice Note Widget (Separate from Background Music) -->
        ${data.showVoiceWidget !== false ? `
        <div class="voice-center-compact glass-panel" id="heroVoiceWidget">
          <div class="voice-row-item">
            <div class="voice-badge-pill" id="heroVoiceBadge">${escapeHtml(data.voiceBadge || `From ${city1} ${flag1}`)}</div>
            <div class="voice-meta-compact">
              <div class="voice-title-row">
                <span class="v-icon">🎙️</span>
                <strong class="v-title" id="heroVoiceTitle">${escapeHtml(data.voiceTitle || 'My Voice for You')}</strong>
              </div>
              <p id="voiceNoteStatus" class="voice-status-line">${escapeHtml(data.voiceSubtitle || 'Tap to listen to my voice & kissies ❤️')}</p>
            </div>
            <div class="voice-action-compact">
              <button id="playVoiceBtn" class="btn btn-sm btn-primary">
                <span id="voicePlayIcon">▶️</span>
                <span id="voicePlayText">Listen</span>
              </button>
              <div class="voice-bg-vol-wrap" id="voiceBgVolWrap">
                <button id="voiceBgVolBtn" class="voice-vol-btn" title="Adjust Voice Volume" type="button" aria-label="Adjust Voice Volume">
                  <span id="voiceBgVolIcon">🎛️</span>
                  <span id="voiceBgVolBtnText">Audio</span>
                </button>
                <div class="voice-vol-popover" id="voiceBgVolPopover">
                  <div class="voice-vol-popover-title">
                    <span>🎙️ Voice Note Audio</span>
                  </div>

                  <div class="voice-vol-channel">
                    <div class="voice-vol-popover-header">
                      <span>🎙️ Voice Speech</span>
                      <div class="voice-vol-actions-row">
                        <span id="voiceNoteVolVal" class="voice-vol-val-text voice-vol-boosted">300% ⚡</span>
                        <button type="button" class="voice-vol-mute-btn" id="voiceNoteMuteBtn" title="Mute/Unmute Voice">🔊⚡</button>
                      </div>
                    </div>
                    <input type="range" id="voiceNoteVolumeSlider" min="0" max="300" value="300" step="1" aria-label="Voice Speech Volume Slider" />
                  </div>

                  <div class="voice-vol-channel">
                    <div class="voice-vol-popover-header">
                      <span>🎵 BG Music</span>
                      <div class="voice-vol-actions-row">
                        <span id="voiceBgVolVal" class="voice-vol-val-text">7%</span>
                        <button type="button" class="voice-vol-mute-btn" id="voiceBgMuteBtn" title="Mute/Unmute Music">🔊</button>
                      </div>
                    </div>
                    <input type="range" id="voiceBgVolumeSlider" min="0" max="100" value="7" step="1" aria-label="Background Music Volume Slider" />
                  </div>

                  <div class="voice-vol-presets">
                    <button type="button" class="vol-preset-btn" data-voice="100" data-bg="7">100%</button>
                    <button type="button" class="vol-preset-btn" data-voice="175" data-bg="7">175% ⚡</button>
                    <button type="button" class="vol-preset-btn" data-voice="250" data-bg="7">250% 🔥</button>
                    <button type="button" class="vol-preset-btn" data-voice="300" data-bg="7">300% 🚀</button>
                  </div>
                </div>
              </div>
            </div>
            <audio id="voiceAudioPlayer" class="hidden" preload="metadata" src="${data.voiceAudio || 'audio/myrecording-volume-adjusted.m4r'}">
              <source src="${data.voiceAudio || 'audio/myrecording-volume-adjusted.m4r'}">
              <source src="myrecording-volume-adjusted.m4r">
            </audio>
          </div>
        </div>
        ` : ''}
      </div>
    </header>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["hero"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
