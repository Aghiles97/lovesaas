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

  const defaultTracks = [
    { title: "Celebration Jam", artist: "Kool & The Gang", url: "audio/taylor-swift-fate-of-ophelia.m4r", duration: "3:42" },
    { title: "Birthday Anthem", artist: "Sweet Melody", url: "audio/lady-gaga-always-remember-us-this-way.m4r", duration: "3:30" },
    { title: "Dancing Queen Vibes", artist: "Party Beats", url: "audio/imagine-dragons-i-follow-you.m4r", duration: "3:51" }
  ];

  const tracks = Array.isArray(data.tracks) && data.tracks.length ? data.tracks : defaultTracks;
  const initialTrack = tracks[0] || { title: "Birthday Soundtrack", artist: "Party Jukebox" };

  const playlistHtml = tracks.map((t, idx) => `
    <div class="playlist-track-item ${idx === 0 ? 'playing' : ''}" data-track-idx="${idx}">
      <div>
        <span style="font-weight:700;">${idx + 1}. ${escapeHtml(t.title || 'Track')}</span>
        <span style="display:block; font-size:0.78rem; opacity:0.8;">${escapeHtml(t.artist || 'Artist')}</span>
      </div>
      <span style="font-size:0.8rem; opacity:0.7;">${escapeHtml(t.duration || '3:00')}</span>
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
            <div class="jukebox-layout">
              <div class="turntable-deck-area">
                <div class="vinyl-platter" id="jukeboxVinyl">
                  <div class="vinyl-label-center">🎂</div>
                </div>
                <div class="tone-arm" id="jukeboxToneArm">
                  <div class="tone-arm-rod"></div>
                  <div class="tone-arm-head"></div>
                </div>
              </div>

              <div class="jukebox-player-side">
                <div class="jukebox-track-info">
                  <div class="jukebox-track-title" id="jukeboxTitle">${escapeHtml(initialTrack.title)}</div>
                  <div class="jukebox-track-artist" id="jukeboxArtist">${escapeHtml(initialTrack.artist)}</div>
                </div>

                <div class="visualizer-bars-row" id="jukeboxVisualizer">
                  <span class="v-bar"></span><span class="v-bar"></span><span class="v-bar"></span>
                  <span class="v-bar"></span><span class="v-bar"></span><span class="v-bar"></span>
                  <span class="v-bar"></span><span class="v-bar"></span><span class="v-bar"></span>
                  <span class="v-bar"></span><span class="v-bar"></span><span class="v-bar"></span>
                  <span class="v-bar"></span><span class="v-bar"></span><span class="v-bar"></span>
                </div>

                <div class="jukebox-controls-row">
                  <button type="button" class="btn btn-secondary" id="btnJukeboxPrev" title="Previous Track">⏮️</button>
                  <button type="button" class="btn btn-primary" id="btnJukeboxPlay" title="Play/Pause">▶️ Play</button>
                  <button type="button" class="btn btn-secondary" id="btnJukeboxNext" title="Next Track">⏭️</button>
                  <input type="range" id="jukeboxVolume" min="0" max="100" value="80" style="width:90px; accent-color:#ff4365;" title="Volume" />
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
