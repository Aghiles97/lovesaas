/**
 * Runtime Engine: Party Jukebox Widget
 */
(function() {
  let isPlaying = false;
  let currentTrackIdx = 0;
  let visualizerAnimId = null;
  let internalAudio = null;

  window.setupPartyJukebox = function(data) {
    const section = document.getElementById("partyJukeboxSection");
    if (!section) return;

    const tracks = (data && Array.isArray(data.tracks) && data.tracks.length) ? data.tracks : [
      { title: "Celebration Jam", artist: "Kool & The Gang", url: "audio/taylor-swift-fate-of-ophelia.m4r" },
      { title: "Birthday Anthem", artist: "Sweet Melody", url: "audio/lady-gaga-always-remember-us-this-way.m4r" },
      { title: "Dancing Queen Vibes", artist: "Party Beats", url: "audio/imagine-dragons-i-follow-you.m4r" }
    ];

    const vinyl = document.getElementById("jukeboxVinyl");
    const toneArm = document.getElementById("jukeboxToneArm");
    const btnPlay = document.getElementById("btnJukeboxPlay");
    const btnPrev = document.getElementById("btnJukeboxPrev");
    const btnNext = document.getElementById("btnJukeboxNext");
    const volSlider = document.getElementById("jukeboxVolume");
    const titleEl = document.getElementById("jukeboxTitle");
    const artistEl = document.getElementById("jukeboxArtist");
    const playlistWrap = document.getElementById("jukeboxPlaylistList");
    const vBars = section.querySelectorAll(".v-bar");

    if (!internalAudio) {
      internalAudio = new Audio();
      internalAudio.addEventListener("ended", () => {
        playNext();
      });
    }

    const bgAudioEl = document.getElementById("bgAudioPlayer");
    if (bgAudioEl && !bgAudioEl._jukeboxBound) {
      bgAudioEl._jukeboxBound = true;
      bgAudioEl.addEventListener("play", () => {
        if (isPlaying) setPlayState(false);
      });
    }

    function updateTrackUI() {
      const track = tracks[currentTrackIdx] || tracks[0];
      if (titleEl) titleEl.textContent = track.title || "Birthday Track";
      if (artistEl) artistEl.textContent = track.artist || "Party Playlist";

      if (playlistWrap) {
        playlistWrap.querySelectorAll(".playlist-track-item").forEach((item, idx) => {
          item.classList.toggle("playing", idx === currentTrackIdx);
        });
      }
    }

    function animateVisualizer() {
      if (!isPlaying) {
        vBars.forEach(b => b.style.height = "6px");
        return;
      }
      vBars.forEach(b => {
        const h = Math.floor(Math.random() * 40) + 8;
        b.style.height = h + "px";
      });
      visualizerAnimId = setTimeout(animateVisualizer, 100);
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
          // Simulated playback if audio cannot auto-play
          setPlayState(true);
        });
      } else {
        setPlayState(true);
      }
    }

    function setPlayState(playing) {
      isPlaying = playing;
      if (vinyl) vinyl.classList.toggle("spinning", playing);
      if (toneArm) toneArm.classList.toggle("on-record", playing);
      if (btnPlay) btnPlay.innerHTML = playing ? "⏸️ Pause" : "▶️ Play";

      if (playing) {
        const bgAudio = document.getElementById("bgAudioPlayer");
        if (bgAudio && !bgAudio.paused) bgAudio.pause();
        animateVisualizer();
      } else {
        if (visualizerAnimId) clearTimeout(visualizerAnimId);
        vBars.forEach(b => b.style.height = "6px");
        if (internalAudio && !internalAudio.paused) internalAudio.pause();
      }
    }

    function togglePlay() {
      if (isPlaying) {
        setPlayState(false);
      } else {
        if (internalAudio && internalAudio.src) {
          internalAudio.play().catch(() => {});
          setPlayState(true);
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

    updateTrackUI();

    window.jukeboxPlayTrack = playTrack;
    window.jukeboxToggle = togglePlay;
  };
})();
