/**
 * Runtime Widget Engine: ambient-soundtrack.runtime.js
 * Modularized for high maintainability.
 */
function createSoundtrackChipElement(song) {
  const chip = document.createElement("div");
  chip.className = "soundtrack-chip";
  chip.setAttribute("data-src", song.src);
  chip.setAttribute("data-start", song.start || 0);
  chip.setAttribute("data-title", song.title || "Custom Soundtrack");
  chip.setAttribute("data-artist", song.artist || "Special Choice ✨");
  chip.innerHTML = `
    <div class="track-vinyl-mini">💿</div>
    <div class="chip-info">
      <strong class="chip-name">${song.title || "Custom Track"}</strong>
      <span class="chip-artist">${song.artist || "Special Choice ✨"}</span>
    </div>
    <button type="button" class="btn-sample-preview" title="Preview Sample" aria-label="Preview">
      <span class="sample-icon">▶️</span>
    </button>
  `;
  return chip;
}

function bindSoundtrackChip(chip) {
  if (chip._bound) return;
  chip._bound = true;

  const src = chip.getAttribute("data-src");
  const title = chip.getAttribute("data-title");
  const artist = chip.getAttribute("data-artist");
  const startSec = parseFloat(chip.getAttribute("data-start")) || 0;
  const previewBtn = chip.querySelector(".btn-sample-preview");

  if (previewBtn) {
    previewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (chip.classList.contains("playing-sample")) {
        stopSampleAudio();
        return;
      }
      stopSampleAudio();

      const sampleAudio = new Audio(src);
      currentSampleAudio = sampleAudio;
      sampleAudio.volume = 0.9;

      const setTimeAndPlay = () => {
        if (startSec > 0 && (!sampleAudio.duration || sampleAudio.duration > (startSec + 2))) {
          try { sampleAudio.currentTime = startSec; } catch (err) {}
        }
      };

      sampleAudio.addEventListener("loadedmetadata", setTimeAndPlay);
      sampleAudio.addEventListener("canplay", setTimeAndPlay, { once: true });

      const stopAt = (startSec > 0 ? startSec : 0) + 10;
      sampleAudio.addEventListener("timeupdate", () => {
        if (currentSampleAudio === sampleAudio && sampleAudio.currentTime >= stopAt && sampleAudio.currentTime >= 10) {
          stopSampleAudio();
        }
      });

      sampleAudio.play().then(() => {
        setTimeAndPlay();
        chip.classList.add("playing-sample");
        previewBtn.classList.add("playing");
        const icon = previewBtn.querySelector(".sample-icon");
        if (icon) icon.textContent = "⏸️";

        if (sampleTimeout) clearTimeout(sampleTimeout);
        sampleTimeout = setTimeout(() => {
          if (currentSampleAudio === sampleAudio) stopSampleAudio();
        }, 10000);
      }).catch((err) => {
        console.log("Audio preview error:", err);
        stopSampleAudio();
        if (typeof audio !== "undefined" && audio.playSparkle) audio.playSparkle();
      });

      sampleAudio.onended = () => stopSampleAudio();
      sampleAudio.onerror = () => stopSampleAudio();
    });
  }

  chip.addEventListener("click", () => {
    document.querySelectorAll(".soundtrack-chip, .soundtrack-card").forEach(c => c.classList.remove("selected"));
    chip.classList.add("selected");

    const selectorBar = document.querySelector(".soundtrack-selector-bar");
    if (selectorBar) selectorBar.classList.remove("must-choose");

    const waxSeal = document.getElementById("openEnvelopeBtn");
    if (waxSeal) waxSeal.classList.add("ready-to-open");

    const envHint = document.getElementById("envelopeHint") || document.querySelector(".envelope-hint");
    if (envHint) {
      envHint.textContent = `✨ '${title}' selected! Tap the wax seal to enter your magical birthday world 🎂💕`;
      envHint.classList.remove("hint-alert");
      envHint.classList.add("song-ready");
    }

    const start = parseFloat(chip.getAttribute("data-start")) || 0;
    currentChosenSong = { src, start, title, artist };
    state.customMusicAudio = src;
    try { localStorage.setItem("gf_music_audio", src); } catch (e) {}
    if (typeof saveToComputer === "function") saveToComputer({ gf_music_audio: src });

    const label = document.getElementById("selectedSongLabel");
    const floatingTitle = document.querySelector(".song-title");
    const floatingArtist = document.querySelector(".song-artist");
    if (label) label.textContent = `${title} — ${artist}`;
    if (floatingTitle) floatingTitle.textContent = title;
    if (floatingArtist) floatingArtist.textContent = artist;

    if (typeof audio !== "undefined" && typeof audio.hideEndedNotification === "function") {
      audio.hideEndedNotification();
    }
    if (typeof audio !== "undefined" && audio.playPop) audio.playPop();
    if (typeof particles !== "undefined" && particles.burst) {
      const rect = chip.getBoundingClientRect();
      particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
    }
  });
}

function selectAndPlaySong(song) {
  if (!song) return;
  currentChosenSong = song;
  state.customMusicAudio = song.src;
  try { localStorage.setItem("gf_music_audio", song.src); } catch (e) {}
  if (typeof saveToComputer === "function") saveToComputer({ gf_music_audio: song.src });

  const label = document.getElementById("selectedSongLabel");
  const floatingTitle = document.querySelector(".song-title");
  const floatingArtist = document.querySelector(".song-artist");
  if (label) label.textContent = `${song.title} — ${song.artist}`;
  if (floatingTitle) floatingTitle.textContent = song.title;
  if (floatingArtist) floatingArtist.textContent = song.artist;

  const grid = document.getElementById("soundtrackGrid");
  let matched = Array.from(document.querySelectorAll(".soundtrack-chip, .soundtrack-card")).find(c => c.getAttribute("data-src") === song.src);
  if (!matched && grid) {
    matched = createSoundtrackChipElement(song);
    grid.appendChild(matched);
    bindSoundtrackChip(matched);
  }

  document.querySelectorAll(".soundtrack-chip, .soundtrack-card").forEach(c => {
    if (c.getAttribute("data-src") === song.src) {
      c.classList.add("selected");
    } else {
      c.classList.remove("selected");
    }
  });

  const bgAudio = document.getElementById("bgAudioPlayer");
  if (bgAudio) {
    bgAudio.src = song.src;
    bgAudio.currentTime = 0;
    const savedVol = parseInt(localStorage.getItem("gf_volume") || "80", 10) / 100;
    bgAudio.volume = Math.min(Math.max(savedVol, 0), 1);
    bgAudio.play().catch(() => {});
  }

  state.musicPlaying = true;
  const vinyl = document.getElementById("vinylDisc");
  const widget = document.getElementById("musicPlayerWidget");
  const icon = document.getElementById("musicPlayIcon");
  const playLabel = document.getElementById("musicPlayLabel");
  if (vinyl) vinyl.classList.add("playing");
  if (widget) widget.classList.add("playing");
  if (icon) icon.textContent = "⏸️";
  if (playLabel) playLabel.textContent = "Pause";

  if (typeof audio !== "undefined" && typeof audio.hideEndedNotification === "function") {
    audio.hideEndedNotification();
  }
}
window.selectAndPlaySong = selectAndPlaySong;

let currentSampleAudio = null;
let sampleTimeout = null;

function stopSampleAudio() {
  if (sampleTimeout) {
    clearTimeout(sampleTimeout);
    sampleTimeout = null;
  }
  if (currentSampleAudio) {
    try { currentSampleAudio.pause(); } catch (err) {}
    currentSampleAudio = null;
  }
  document.querySelectorAll(".soundtrack-chip, .soundtrack-card").forEach(c => {
    c.classList.remove("playing-sample");
    const btn = c.querySelector(".btn-sample-preview");
    if (btn) {
      btn.classList.remove("playing");
      const icon = btn.querySelector(".sample-icon");
      if (icon) icon.textContent = "▶️";
    }
  });
}
window.stopSampleAudio = stopSampleAudio;

function setupIntroSoundtrackSelector(heroData) {
  const grid = document.getElementById("soundtrackGrid");
  if (grid && heroData && heroData.musicTrackUrl) {
    const existing = Array.from(grid.querySelectorAll(".soundtrack-chip")).find(c => c.getAttribute("data-src") === heroData.musicTrackUrl);
    if (!existing) {
      const customChip = createSoundtrackChipElement({
        src: heroData.musicTrackUrl,
        title: heroData.musicTrackTitle || "Custom Soundtrack",
        artist: heroData.musicTrackArtist || "Special Choice ✨",
        start: 0
      });
      grid.appendChild(customChip);
    }
  }

  const chips = document.querySelectorAll(".soundtrack-chip, .soundtrack-card");
  chips.forEach(chip => bindSoundtrackChip(chip));

  const preferredSrc = (heroData && heroData.musicTrackUrl) || state.customMusicAudio || localStorage.getItem("gf_music_audio");
  if (preferredSrc) {
    const matchedChip = Array.from(chips).find(c => c.getAttribute("data-src") === preferredSrc);
    if (matchedChip) {
      matchedChip.click();
      return;
    }
  }
  if (!currentChosenSong && chips.length > 0) {
    chips[0].click();
  }
}

// Floating Glide to Top Engine
function setupScrollToTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 380) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    audio.playSparkle();
    particles.burst(window.innerWidth - 60, window.innerHeight - 60, 25);
  });
}

// Floating Audio Visualizer & Volume Control Engine
function setupAudioVisualizerAndVolume() {
  const volumeBtn = document.getElementById("volumeBtn");
  const volumeWrap = document.getElementById("volumeControlWrap");
  const popover = document.getElementById("volumeSliderPopover");
  const slider = document.getElementById("volumeSlider");
  const volText = document.getElementById("volumeVal");
  const volIcon = document.getElementById("volumeIcon");
  const bgAudio = document.getElementById("bgAudioPlayer");

  if (!volumeBtn || !slider || !bgAudio) return;

  const savedVol = parseInt(localStorage.getItem("gf_volume") || "80", 10);
  slider.value = savedVol;
  bgAudio.volume = savedVol / 100;
  if (volText) volText.textContent = `${savedVol}%`;

  const updateVolIcon = (val) => {
    if (!volIcon) return;
    if (val === 0) volIcon.textContent = "🔇";
    else if (val < 40) volIcon.textContent = "🔈";
    else if (val < 75) volIcon.textContent = "🔉";
    else volIcon.textContent = "🔊";
  };
  updateVolIcon(savedVol);

  volumeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    popover.classList.toggle("open");
    audio.playPop();
  });

  document.addEventListener("click", (e) => {
    if (volumeWrap && !volumeWrap.contains(e.target)) {
      popover.classList.remove("open");
    }
  });

  slider.addEventListener("input", () => {
    const val = parseInt(slider.value, 10);
    bgAudio.volume = val / 100;
    if (volText) volText.textContent = `${val}%`;
    updateVolIcon(val);
    localStorage.setItem("gf_volume", val);
  });
}

// Love Letter Audio Narration & Synchronized Typewriter Ink Reveal
