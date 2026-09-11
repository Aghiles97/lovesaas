/**
 * Builder Inspector Module: party_jukebox
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["party_jukebox"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    
    if (!state.sectionsData.party_jukebox) state.sectionsData.party_jukebox = {};
    const pj = state.sectionsData.party_jukebox;

    const defaultTracks = [
      { title: "Celebration Jam", artist: "Kool & The Gang", url: "audio/taylor-swift-fate-of-ophelia.m4r" },
      { title: "Birthday Anthem", artist: "Sweet Melody", url: "audio/lady-gaga-always-remember-us-this-way.m4r" },
      { title: "Dancing Queen Vibes", artist: "Party Beats", url: "audio/imagine-dragons-i-follow-you.m4r" }
    ];

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📻 Party Jukebox Header</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="pj_tag" value="${safeVal(pj.tag || "Birthday Soundtrack 🎵")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="pj_title" value="${safeVal(pj.title || "Party Jukebox & Playlist 📻")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="pj_desc" rows="2">${safeVal(pj.desc || "Spin the retro vinyl disc, pump up the volume, and groove to our birthday playlist!")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Turntable Controls</span>
        </div>
        <button type="button" class="btn-builder-action" id="btnTestJukeboxPlay">▶️ Toggle Jukebox Vinyl</button>
      </div>
    `;

    function syncJukeboxData() {
      pj.tag = document.getElementById("pj_tag").value.trim();
      pj.title = document.getElementById("pj_title").value.trim();
      pj.desc = document.getElementById("pj_desc").value.trim();

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    }

    inspectorFormContainer.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", syncJukeboxData);
    });

    const btnPlay = document.getElementById("btnTestJukeboxPlay");
    if (btnPlay) {
      btnPlay.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "JUKEBOX_TOGGLE" }, "*");
          try { previewIframe.contentWindow.jukeboxToggle?.(); } catch (e) {}
        }
      };
    }

  };
})();
