/**
 * Template Renderer: party_jukebox
 * Modular Birthday Component
 */
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
  if (typeof safeVal !== "function") {
    const sv = function(v) {
      return String(v == null ? "" : v).replace(/"/g, "&quot;");
    };
    if (typeof window !== "undefined") window.safeVal = sv;
    else global.safeVal = sv;
  }

  const renderTemplate = (data = {}, rootData = {}) => {
  const tag = data.tag || "Birthday Soundtrack 🎵";
  const title = data.title || "Party Jukebox & Playlist 📻";
  const desc = data.desc || "Spin the retro vinyl disc, pump up the volume, and groove to our birthday playlist!";

  const partner = rootData.partner2 || rootData.partnerName || "Ella";
  const defaultTracks = [
    { title: "Celebration Jam", artist: "Kool & The Gang", url: "audio/taylor-swift-fate-of-ophelia.m4r", duration: "3:42" },
    { title: "Birthday Anthem", artist: "Sweet Melody", url: "audio/lady-gaga-always-remember-us-this-way.m4r", duration: "3:30" },
    { title: "Dancing Queen Vibes", artist: "Party Beats", url: "audio/imagine-dragons-i-follow-you.m4r", duration: "3:51" }
  ];

  const tracks = Array.isArray(data.tracks) && data.tracks.length ? data.tracks : defaultTracks;
  const initialTrack = tracks[0] || { title: "Birthday Soundtrack", artist: "Party Jukebox" };

  const playlistHtml = tracks.map((t, idx) => `
    <div class="playlist-track-item ${idx === 0 ? 'playing' : ''}" data-track-idx="${idx}">
      <div class="track-left-info">
        <span class="track-title-text">${idx + 1}. ${escapeHtml(t.title || 'Track')}</span>
        <span class="track-artist-text">${escapeHtml(t.artist || 'Artist')}</span>
      </div>
      <span class="track-duration-text">${escapeHtml(t.duration || '3:00')}</span>
    </div>
  `).join('');

  return `
    <section class="section party-jukebox-section" id="partyJukeboxSection">
      <div class="container">
        <div class="party-jukebox-box">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="jukebox-deck">
            <!-- Mode Switcher: Vinyl vs Cassette -->
            <div class="jukebox-mode-selector">
              <button type="button" class="btn-mode-toggle active" id="btnModeVinyl" data-mode="vinyl">
                <span>💽 Vinyl Record</span>
              </button>
              <button type="button" class="btn-mode-toggle" id="btnModeCassette" data-mode="cassette">
                <span>📼 Cassette Deck</span>
              </button>
            </div>

            <div class="jukebox-layout">
              <!-- Left Deck View -->
              <div class="deck-media-container">
                <!-- Vinyl Player Mode -->
                <div class="turntable-deck-area" id="vinylDeckView">
                  <div class="vinyl-platter-well">
                    <div class="vinyl-platter" id="jukeboxVinyl">
                      <div class="vinyl-groove-shimmer"></div>
                      <div class="vinyl-label-center">
                        <div class="vinyl-label-text-top">${escapeHtml(partner)}'s 24th</div>
                        <div class="vinyl-label-icon">🎂</div>
                        <div class="vinyl-label-text-bot">SPECIAL EDITION</div>
                        <div class="vinyl-spindle-hole"></div>
                      </div>
                    </div>
                  </div>
                  <div class="tone-arm" id="jukeboxToneArm">
                    <div class="tone-arm-base"></div>
                    <div class="tone-arm-rod"></div>
                    <div class="tone-arm-cartridge">
                      <div class="tone-arm-stylus"></div>
                    </div>
                  </div>
                </div>

                <!-- Cassette Deck Mode -->
                <div class="cassette-deck-area hidden" id="cassetteDeckView">
                  <div class="cassette-shell" id="jukeboxCassette">
                    <div class="cassette-screw top-left"></div>
                    <div class="cassette-screw top-right"></div>
                    <div class="cassette-screw bot-left"></div>
                    <div class="cassette-screw bot-right"></div>
                    <div class="cassette-label-sticker">
                      <span class="cassette-label-title">💖 ${escapeHtml(partner)}'s Party Mixtape Vol. 1</span>
                      <span class="cassette-side-indicator">SIDE A • STEREO</span>
                    </div>
                    <div class="cassette-window">
                      <div class="cassette-spool left-spool">
                        <span class="spool-teeth"></span>
                      </div>
                      <div class="cassette-tape-ribbon"></div>
                      <div class="cassette-spool right-spool">
                        <span class="spool-teeth"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Control & Playlist Side -->
              <div class="jukebox-player-side">
                <div class="jukebox-track-info">
                  <div class="jukebox-now-playing-badge">NOW GROOVING 🎶</div>
                  <div class="jukebox-track-title" id="jukeboxTitle">${escapeHtml(initialTrack.title)}</div>
                  <div class="jukebox-track-artist" id="jukeboxArtist">${escapeHtml(initialTrack.artist)}</div>
                  <div class="jukebox-time-display">
                    <span id="jukeboxCurrentTime">0:00</span> / <span id="jukeboxTotalTime">${escapeHtml(initialTrack.duration || '3:30')}</span>
                  </div>
                </div>

                <!-- 16-Bar Glowing Equalizer Visualizer -->
                <div class="visualizer-bars-row" id="jukeboxVisualizer">
                  ${Array.from({length: 16}).map((_, i) => `<span class="v-bar" data-bar-idx="${i}"></span>`).join('')}
                </div>

                <div class="jukebox-controls-row">
                  <button type="button" class="btn btn-secondary btn-deck-ctrl" id="btnJukeboxPrev" title="Previous Track">⏮️</button>
                  <button type="button" class="btn btn-primary btn-deck-play" id="btnJukeboxPlay" title="Play/Pause">▶️ Play</button>
                  <button type="button" class="btn btn-secondary btn-deck-ctrl" id="btnJukeboxNext" title="Next Track">⏭️</button>
                  <div class="volume-slider-wrap">
                    <span class="vol-icon">🔊</span>
                    <input type="range" id="jukeboxVolume" min="0" max="100" value="80" class="jukebox-vol-slider" title="Volume" />
                  </div>
                </div>

                <div class="jukebox-playlist-list" id="jukeboxPlaylistList">
                  ${playlistHtml}
                </div>
              </div>
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
    window.WIDGET_TEMPLATES["party_jukebox"] = renderTemplate;
  }
})();
