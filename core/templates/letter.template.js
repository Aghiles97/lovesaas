/**
 * Template Renderer: letter
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

  const renderTemplate = (data = {}, rootData = {}) => {
    const letObj = typeof data === "string" ? { body: data } : (data || {});
    const tag = letObj.tag || "Straight From My Heart • Birthday Edition";
    const title = letObj.title || "A Birthday Love Letter For You 📜🎂";
    const seal = letObj.seal || "💌";
    const partner = letObj.recipient || rootData.partner2 || "Ella";
    const sender = letObj.sender || rootData.partner1 || "Your Love from Algeria ❤️";
    const badge = letObj.envelopeBadge || (`👑 For My Princess ${partner}`);
    const envTitle = letObj.envelopeTitle || "A Birthday Love Letter 🎂";
    const envSub = letObj.envelopeSub || "Sealed with infinite love, kissies & romantic voice reading";
    const openBtnText = letObj.openBtnText || "💌 Break Seal & Open Letter";
    const envHint = letObj.envelopeHint || "✨ Tap the sealed envelope to break the seal, open your letter, and listen to my voice ❤️";
    const dateDisplay = letObj.dateDisplay || "Today & Always";
    const salutation = letObj.salutation || "Dearest";
    const closingPhrase = letObj.closingPhrase || "Forever and always, with infinite kiss kiss & hug hug,";
    const audioUrl = letObj.audioUrl || "audio/letter_voice-volume-adjusted.m4r";
    const bodyText = letObj.body || "";

    const bodyHtml = bodyText
      ? bodyText.split("\n\n").map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")
      : "";

    return `
    <section class="section letter-section">
      <div class="container">
        <div class="section-heading">
          <span class="section-tag">${escapeHtml(tag)}</span>
          <h2 class="section-title">${escapeHtml(title)}</h2>
        </div>
        <!-- 1. Sealed Birthday Envelope (Initial state) -->
        <div id="bdayLetterEnvelope" class="bday-letter-envelope-wrap">
          <div class="bday-envelope-card" id="bdayEnvelopeCard" role="button" tabindex="0" aria-label="Open Birthday Love Letter">
            <div class="bday-envelope-flap"></div>
            <div class="bday-envelope-gold-trim"></div>
            <div class="bday-wax-seal" id="bdayWaxSeal">
              <span class="bday-wax-icon">${escapeHtml(seal)}</span>
            </div>
            <div class="bday-envelope-content">
              <span class="bday-envelope-badge">${escapeHtml(badge)}</span>
              <h3 class="bday-envelope-title">${escapeHtml(envTitle)}</h3>
              <p class="bday-envelope-sub">${escapeHtml(envSub)}</p>
              <div class="bday-envelope-action">
                <button type="button" class="btn btn-primary bday-open-btn" id="btnOpenBdayLetter">
                  <span>${escapeHtml(openBtnText)}</span>
                </button>
              </div>
            </div>
          </div>
          <p class="bday-envelope-hint">${escapeHtml(envHint)}</p>
        </div>

        <!-- 2. Revealed Letter Experience (Hidden until opened) -->
        <div id="bdayLetterOpened" class="bday-letter-opened-wrap hidden" style="display: none;">
          <!-- Interactive Letter Experience Bar -->
          <div class="letter-actions-bar">
            <button type="button" id="btnPlayLetter" class="btn btn-sm btn-primary" title="Play love letter voice reading with synchronized typewriter ink">
              <span class="btn-icon" id="letterPlayIcon">▶️</span>
              <span class="btn-text" id="letterPlayText">Play</span>
            </button>
            <div class="letter-vol-wrap" id="letterVolWrap">
              <button id="letterVolBtn" class="voice-vol-btn" title="Adjust Letter Voice & Background Music Volume" type="button" aria-label="Adjust Letter Voice & Background Music Volume">
                <span id="letterVolIcon">🎛️</span>
                <span id="letterVolBtnText">Audio</span>
              </button>
              <div class="voice-vol-popover" id="letterVolPopover">
                <div class="voice-vol-popover-title">
                  <span>🎛️ Letter Audio Controls</span>
                </div>

                <!-- Letter Reading Voice Volume -->
                <div class="voice-vol-channel">
                  <div class="voice-vol-popover-header">
                    <span>🎙️ Reading Voice</span>
                    <div class="voice-vol-actions-row">
                      <span id="letterVoiceVolVal" class="voice-vol-val-text voice-vol-boosted">300% ⚡</span>
                      <button type="button" class="voice-vol-mute-btn" id="letterVoiceMuteBtn" title="Mute/Unmute Letter Voice">🔊⚡</button>
                    </div>
                  </div>
                  <input type="range" id="letterVoiceVolumeSlider" min="0" max="300" value="300" step="1" aria-label="Letter Voice Volume Slider" />
                </div>

                <!-- Background Music Volume -->
                <div class="voice-vol-channel">
                  <div class="voice-vol-popover-header">
                    <span>🎵 BG Music</span>
                    <div class="voice-vol-actions-row">
                      <span id="letterBgVolVal" class="voice-vol-val-text">7%</span>
                      <button type="button" class="voice-vol-mute-btn" id="letterBgMuteBtn" title="Mute/Unmute Background Music">🔊</button>
                    </div>
                  </div>
                  <input type="range" id="letterBgVolumeSlider" min="0" max="100" value="7" step="1" aria-label="Letter BG Music Volume Slider" />
                </div>

                <!-- Quick Balance & Boost Presets -->
                <div class="voice-vol-presets">
                  <button type="button" class="letter-preset-btn" data-voice="100" data-bg="7">100%</button>
                  <button type="button" class="letter-preset-btn" data-voice="175" data-bg="7">175% ⚡</button>
                  <button type="button" class="letter-preset-btn" data-voice="250" data-bg="7">250% 🔥</button>
                  <button type="button" class="letter-preset-btn" data-voice="300" data-bg="7">300% 🚀</button>
                </div>
              </div>
            </div>
            <button type="button" id="btnCopyLetter" class="btn btn-sm btn-outline" title="Copy letter text to keep forever">
              <span class="btn-icon">📋</span>
              <span class="btn-text">Copy Keepsake</span>
            </button>
            <button type="button" id="btnResealLetter" class="btn btn-sm btn-outline" title="Fold back into envelope">
              <span class="btn-icon">💌</span>
              <span class="btn-text">Reseal</span>
            </button>
            <audio id="letterAudioPlayer" class="hidden" preload="metadata">
              <source src="${escapeHtml(audioUrl)}" type="audio/mp4">
              <source src="audio/letter_voice-volume-adjusted.m4r" type="audio/mp4">
              <source src="letter_voice-volume-adjusted.m4r" type="audio/mp4">
            </audio>
          </div>

          <div class="letter-parchment" id="letterParchment">
            <div class="parchment-tape"></div>
            <div class="letter-header">
              <span class="letter-date" id="letterDateDisplay">${escapeHtml(dateDisplay)}</span>
              <span class="letter-stamp">${escapeHtml(seal)}</span>
            </div>
            <div class="letter-salutation" id="letterSalutation">
              ${escapeHtml(salutation)} <span class="partner-name-display">${escapeHtml(partner)}</span>,
            </div>
            <div class="letter-body" id="letterContent">
              ${bodyHtml}
            </div>
            <div class="letter-closing" id="letterClosing">
              <span class="letter-closing-phrase" id="letterClosingPhrase">${escapeHtml(closingPhrase)}</span>
              <span class="signature-text" id="senderNameDisplay">${escapeHtml(sender)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["letter"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
