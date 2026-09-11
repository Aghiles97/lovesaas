(function() {
  if (typeof escapeHtml !== "function") {
    const esc = function(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    if (typeof window !== "undefined") window.escapeHtml = esc;
    else global.escapeHtml = esc;
  }

  const renderTemplate = (data = {}, rootData = {}) => {
    const tag = data.tag || "Voice Memories Across Time 🎙️";
    const title = data.title || "Audio Time Capsule";
    const desc = data.desc || "A sonic vault of archived voice notes, late-night whispers, and anniversary promises across the years.";

    const defaultMemos = [
      { id: "m1", title: "First Birthday Message", speaker: "Alex", year: "2021", date: "Jun 18, 2021", duration: "0:45", audioUrl: "audio/taylor-swift-fate-of-ophelia.m4r" },
      { id: "m2", title: "Midnight Flight Voice Note", speaker: "Ella", year: "2022", date: "Nov 03, 2022", duration: "1:12", audioUrl: "audio/lady-gaga-always-remember-us-this-way.m4r" },
      { id: "m3", title: "Saying Yes in Tuscany", speaker: "Alex & Ella", year: "2023", date: "Sep 14, 2023", duration: "0:58", audioUrl: "audio/imagine-dragons-i-follow-you.m4r" },
      { id: "m4", title: "Our 3-Year Anniversary Promise", speaker: "Ella", year: "2024", date: "Jun 18, 2024", duration: "1:35", audioUrl: "audio/taylor-swift-fate-of-ophelia.m4r" }
    ];

    const memos = Array.isArray(data.memos) && data.memos.length ? data.memos : defaultMemos;
    const initialMemo = memos[0] || { title: "Voice Memo", speaker: "Us", duration: "0:00" };

    const years = ["All", ...new Set(memos.map(m => m.year || (m.date ? String(m.date).slice(-4) : "2024")).filter(Boolean))];

    const filterPillsHtml = years.map((yr, i) => `
      <button type="button" class="capsule-filter-pill ${i === 0 ? 'active' : ''}" data-year="${escapeHtml(yr)}">
        ${escapeHtml(yr)}
      </button>
    `).join("");

    const memosListHtml = memos.map((m, idx) => `
      <div class="capsule-memo-card ${idx === 0 ? 'active' : ''}" data-idx="${idx}" data-year="${escapeHtml(m.year || (m.date ? String(m.date).slice(-4) : '2024'))}" data-url="${escapeHtml(m.audioUrl || '')}">
        <div class="capsule-memo-main">
          <div class="capsule-memo-header">
            <span class="capsule-speaker-badge">🎙️ ${escapeHtml(m.speaker || "Special Voice")}</span>
            <span class="capsule-memo-date">${escapeHtml(m.date || m.year || "")}</span>
          </div>
          <h4 class="capsule-memo-title">${escapeHtml(m.title || "Voice Note")}</h4>
          <div class="capsule-memo-preview-bars" aria-hidden="true">
            <span style="height: 35%"></span><span style="height: 70%"></span><span style="height: 45%"></span>
            <span style="height: 90%"></span><span style="height: 60%"></span><span style="height: 80%"></span>
            <span style="height: 40%"></span><span style="height: 65%"></span><span style="height: 30%"></span>
            <span style="height: 85%"></span><span style="height: 50%"></span><span style="height: 75%"></span>
          </div>
        </div>
        <div class="capsule-memo-actions">
          <span class="capsule-memo-dur">${escapeHtml(m.duration || "1:00")}</span>
          <button type="button" class="btn-capsule-play-memo" data-play-memo="${idx}" aria-label="Play Memo">
            <span class="play-icon">▶</span>
          </button>
        </div>
      </div>
    `).join("");

    return `
      <section class="section audio-capsule-section" id="audioCapsuleSection">
        <div class="container">
          <div class="audio-capsule-box">
            <div class="section-heading">
              <span class="section-tag">${escapeHtml(tag)}</span>
              <h2 class="section-title">${escapeHtml(title)}</h2>
              <p class="section-desc">${escapeHtml(desc)}</p>
            </div>

            <div class="capsule-player-deck">
              <div class="capsule-tape-chassis">
                <div class="capsule-reels-row">
                  <div class="capsule-reel" id="capsuleReelLeft">
                    <div class="capsule-reel-spokes"></div>
                  </div>
                  <div class="capsule-tape-window">
                    <div class="capsule-tape-bridge"></div>
                    <div class="capsule-now-meta">
                      <span class="capsule-speaker-glow" id="capsuleNowSpeaker">${escapeHtml(initialMemo.speaker || "Us")}</span>
                      <strong class="capsule-now-title" id="capsuleNowTitle">${escapeHtml(initialMemo.title || "Time Capsule Audio")}</strong>
                      <span class="capsule-now-date" id="capsuleNowDate">${escapeHtml(initialMemo.date || initialMemo.year || "")}</span>
                    </div>
                  </div>
                  <div class="capsule-reel" id="capsuleReelRight">
                    <div class="capsule-reel-spokes"></div>
                  </div>
                </div>

                <div class="capsule-waveform-container" title="Click anywhere to scrub">
                  <canvas class="capsule-waveform-canvas" id="capsuleWaveformCanvas" width="700" height="74"></canvas>
                  <div class="capsule-scrub-hover" id="capsuleScrubHover"></div>
                </div>

                <div class="capsule-deck-controls">
                  <div class="capsule-time-box">
                    <span class="capsule-time-cur" id="capsuleTimeCur">0:00</span>
                    <span class="capsule-time-sep">/</span>
                    <span class="capsule-time-dur" id="capsuleTimeDur">${escapeHtml(initialMemo.duration || "0:00")}</span>
                  </div>

                  <div class="capsule-btns-group">
                    <button type="button" class="btn-capsule-ctrl" id="btnCapsulePrev" title="Previous Memo">⏮</button>
                    <button type="button" class="btn-capsule-play-main" id="btnCapsulePlay" title="Play / Pause">
                      <span id="capsulePlayIcon">▶</span>
                    </button>
                    <button type="button" class="btn-capsule-ctrl" id="btnCapsuleNext" title="Next Memo">⏭</button>
                    <button type="button" class="btn-capsule-speed" id="btnCapsuleSpeed" title="Speed">1.0x</button>
                  </div>

                  <div class="capsule-vol-wrap">
                    <span class="capsule-vol-icon">🔉</span>
                    <input type="range" class="capsule-vol-slider" id="capsuleVolume" min="0" max="100" value="85" title="Volume" />
                  </div>
                </div>
              </div>
            </div>

            <div class="capsule-archive-deck">
              <div class="capsule-filters-row">
                <span class="capsule-filter-label">Vault Filter:</span>
                <div class="capsule-filter-pills" id="capsuleFilterPills">
                  ${filterPillsHtml}
                </div>
              </div>

              <div class="capsule-memos-grid" id="capsuleMemosGrid">
                ${memosListHtml}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["audio_capsule"] = renderTemplate;
  }
})();
