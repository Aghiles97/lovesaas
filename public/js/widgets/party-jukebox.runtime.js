/**
 * Runtime Engine: Party Jukebox Widget
 */
(function() {
  let isPlaying = false;
  let currentTrackIdx = 0;
  let visualizerAnimId = null;
  let internalAudio = null;
  let currentMode = "vinyl"; // "vinyl" | "cassette"

  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  window.setupPartyJukebox = function(data) {
    const section = document.getElementById("partyJukeboxSection");
    if (!section) return;

    const tracks = (data && Array.isArray(data.tracks) && data.tracks.length) ? data.tracks : [
      { title: "Celebration Jam", artist: "Kool & The Gang", url: "audio/taylor-swift-fate-of-ophelia.m4r", duration: "3:42" },
      { title: "Birthday Anthem", artist: "Sweet Melody", url: "audio/lady-gaga-always-remember-us-this-way.m4r", duration: "3:30" },
      { title: "Dancing Queen Vibes", artist: "Party Beats", url: "audio/imagine-dragons-i-follow-you.m4r", duration: "3:51" }
    ];

    // Media & Mode elements
    const vinylView = document.getElementById("vinylDeckView");
    const cassetteView = document.getElementById("cassetteDeckView");
    const btnModeVinyl = document.getElementById("btnModeVinyl");
    const btnModeCassette = document.getElementById("btnModeCassette");
    const vinyl = document.getElementById("jukeboxVinyl");
    const toneArm = document.getElementById("jukeboxToneArm");
    const cassette = document.getElementById("jukeboxCassette");

    // Player Controls
    const btnPlay = document.getElementById("btnJukeboxPlay");
    const btnPrev = document.getElementById("btnJukeboxPrev");
    const btnNext = document.getElementById("btnJukeboxNext");
    const volSlider = document.getElementById("jukeboxVolume");
    const titleEl = document.getElementById("jukeboxTitle");
    const artistEl = document.getElementById("jukeboxArtist");
    const curTimeEl = document.getElementById("jukeboxCurrentTime");
    const totalTimeEl = document.getElementById("jukeboxTotalTime");
    const playlistWrap = document.getElementById("jukeboxPlaylistList");
    const vBars = section.querySelectorAll(".v-bar");

    if (!internalAudio) {
      internalAudio = new Audio();
      internalAudio.addEventListener("ended", () => {
        playNext();
      });
      internalAudio.addEventListener("timeupdate", () => {
        if (curTimeEl && internalAudio.duration) {
          curTimeEl.textContent = formatTime(internalAudio.currentTime);
          if (totalTimeEl && !isNaN(internalAudio.duration)) {
            totalTimeEl.textContent = formatTime(internalAudio.duration);
          }
        }
      });
    }

    // Mutual exclusion with background music
    const bgAudioEl = document.getElementById("bgAudioPlayer");
    if (bgAudioEl && !bgAudioEl._jukeboxBound) {
      bgAudioEl._jukeboxBound = true;
      bgAudioEl.addEventListener("play", () => {
        if (isPlaying) setPlayState(false);
      });
    }

    function switchMode(mode) {
      currentMode = mode;
      if (btnModeVinyl) btnModeVinyl.classList.toggle("active", mode === "vinyl");
      if (btnModeCassette) btnModeCassette.classList.toggle("active", mode === "cassette");
      if (vinylView) vinylView.classList.toggle("hidden", mode !== "vinyl");
      if (cassetteView) cassetteView.classList.toggle("hidden", mode !== "cassette");
      syncDeckAnimation();
    }

    if (btnModeVinyl) {
      btnModeVinyl.onclick = () => switchMode("vinyl");
    }
    if (btnModeCassette) {
      btnModeCassette.onclick = () => switchMode("cassette");
    }

    function syncDeckAnimation() {
      if (vinyl) vinyl.classList.toggle("spinning", isPlaying && currentMode === "vinyl");
      if (toneArm) toneArm.classList.toggle("on-record", isPlaying && currentMode === "vinyl");
      if (cassette) cassette.classList.toggle("spinning", isPlaying && currentMode === "cassette");
    }

    function updateTrackUI() {
      const track = tracks[currentTrackIdx] || tracks[0];
      if (titleEl) titleEl.textContent = track.title || "Birthday Track";
      if (artistEl) artistEl.textContent = track.artist || "Party Playlist";
      if (totalTimeEl && track.duration) totalTimeEl.textContent = track.duration;
      if (curTimeEl) curTimeEl.textContent = "0:00";

      if (playlistWrap) {
        playlistWrap.querySelectorAll(".playlist-track-item").forEach((item, idx) => {
          item.classList.toggle("playing", idx === currentTrackIdx);
        });
      }
    }

    // 16-Bar Equalizer Visualizer
    function animateVisualizer() {
      if (!isPlaying) {
        vBars.forEach(b => b.style.height = "6px");
        return;
      }
      vBars.forEach((b, idx) => {
        // Natural audio spectrum curve:
        // 0-3 (bass): 16px - 46px
        // 4-9 (mids): 12px - 40px
        // 10-15 (treble): 8px - 32px
        let maxH = 38;
        let minH = 8;
        if (idx < 4) { maxH = 48; minH = 16; }
        else if (idx < 10) { maxH = 42; minH = 12; }
        else { maxH = 32; minH = 7; }

        const h = Math.floor(Math.random() * (maxH - minH)) + minH;
        b.style.height = h + "px";
      });
      visualizerAnimId = setTimeout(animateVisualizer, 85);
    }

    function setPlayState(playing) {
      isPlaying = playing;
      syncDeckAnimation();
      if (btnPlay) btnPlay.innerHTML = playing ? "⏸️ Pause" : "▶️ Play";

      if (playing) {
        // Silence background music
        if (bgAudioEl && !bgAudioEl.paused) {
          bgAudioEl.pause();
        }
        animateVisualizer();
      } else {
        if (visualizerAnimId) clearTimeout(visualizerAnimId);
        vBars.forEach(b => b.style.height = "6px");
        if (internalAudio && !internalAudio.paused) {
          internalAudio.pause();
        }
      }
    }

    function playTrack(idx) {
      currentTrackIdx = (idx + tracks.length) % tracks.length;
      updateTrackUI();
      const track = tracks[currentTrackIdx];

      if (track && track.url) {
        internalAudio.src = track.url;
        internalAudio.volume = volSlider ? (volSlider.value / 100) : 0.8;
        internalAudio.play().then(() => {
          setPlayState(true);
        }).catch(() => {
          // Graceful simulated playback if audio autoplay is restricted
          setPlayState(true);
        });
      } else {
        setPlayState(true);
      }
    }

    function togglePlay() {
      if (isPlaying) {
        setPlayState(false);
      } else {
        if (internalAudio && internalAudio.src) {
          internalAudio.play().then(() => {
            setPlayState(true);
          }).catch(() => {
            setPlayState(true);
          });
        } else {
          playTrack(currentTrackIdx);
        }
      }
    }

    function playNext() {
      playTrack(currentTrackIdx + 1);
    }
    function playPrev() {
      playTrack(currentTrackIdx - 1);
    }

    if (btnPlay) btnPlay.onclick = togglePlay;
    if (btnNext) btnNext.onclick = playNext;
    if (btnPrev) btnPrev.onclick = playPrev;

    if (volSlider) {
      volSlider.oninput = function() {
        if (internalAudio) internalAudio.volume = volSlider.value / 100;
      };
    }

    if (playlistWrap) {
      playlistWrap.querySelectorAll(".playlist-track-item").forEach(item => {
        item.onclick = function() {
          const idx = parseInt(item.dataset.trackIdx, 10);
          playTrack(idx);
        };
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (visualizerAnimId) clearTimeout(visualizerAnimId);
      } else if (isPlaying) {
        animateVisualizer();
      }
    });

    updateTrackUI();

    window.jukeboxPlayTrack = playTrack;
    window.jukeboxToggle = togglePlay;
  };
})();
