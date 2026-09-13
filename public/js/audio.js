// Web Audio Synthesizer Engine
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.musicInterval = null;
    this.step = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq, duration = 0.4, type = "sine", gainVal = 0.15) {
    if (window.state && window.state.romanticSfx === false) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playChimeCascade() {
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.6, "triangle", 0.12), i * 100);
    });
  }

  playPop() {
    this.playTone(560, 0.08, "sine", 0.16);
  }

  playKiss() {
    [700, 950].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.12, "sine", 0.1), i * 80);
    });
  }

  playSparkle() {
    [880, 1174.66, 1567.98].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.25, "sine", 0.08), i * 65);
    });
  }

  playFanfare() {
    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.8, "triangle", 0.2), i * 120);
    });
  }

  playAlarm() {
    [800, 1200, 800, 1200].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.15, "square", 0.05), i * 150);
    });
  }

  playTick() {
    this.playTone(850 + Math.random() * 150, 0.03, "square", 0.08);
  }

  playScratch() {
    if (window.state && window.state.romanticSfx === false) return;
    this.init();
    if (!this.ctx) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playWobbleFail() {
    [320, 290, 260, 230].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.15, "sawtooth", 0.06), i * 110);
    });
  }

  playSuccessChime() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.35, "sine", 0.1), i * 70);
    });
  }

  toggleMusic(onToggle) {
    this.init();
    this.hideEndedNotification();
    const bgAudio = document.getElementById("bgAudioPlayer");
    const widget = document.getElementById("musicPlayerWidget");
    const vinyl = document.getElementById("vinylDisc");
    const icon = document.getElementById("musicPlayIcon");
    const label = document.getElementById("musicPlayLabel");

    const isPlaying = bgAudio ? (!bgAudio.paused && !bgAudio.ended) : state.musicPlaying;
    if (isPlaying) {
      if (bgAudio) bgAudio.pause();
      clearInterval(this.musicInterval);
      state.musicPlaying = false;
      if (vinyl) vinyl.classList.remove("playing");
      if (widget) widget.classList.remove("playing");
      if (icon) icon.textContent = "▶️";
      if (label) label.textContent = "Play";
      if (onToggle) onToggle(false);
      return;
    }

    state.musicPlaying = true;
    if (vinyl) vinyl.classList.add("playing");
    if (widget) widget.classList.add("playing");
    if (icon) icon.textContent = "⏸️";
    if (label) label.textContent = "Pause";
    if (onToggle) onToggle(true);

    if (bgAudio) {
      const fallbackSrc = (typeof SOUNDTRACK_PLAYLIST !== "undefined" && SOUNDTRACK_PLAYLIST.length)
        ? SOUNDTRACK_PLAYLIST[0].src
        : "taylor-swift-fate-of-ophelia.m4r";
      const targetSrc = (typeof currentChosenSong !== "undefined" && currentChosenSong && currentChosenSong.src)
        || state.customMusicAudio
        || fallbackSrc;
      if (!bgAudio.src || !bgAudio.src.includes(targetSrc)) {
        bgAudio.src = targetSrc;
      }
      if (bgAudio.ended || (bgAudio.duration && bgAudio.currentTime >= bgAudio.duration - 0.5)) {
        bgAudio.currentTime = 0;
      }
      const voicePlayer = document.getElementById("voiceAudioPlayer");
      const letterPlayer = document.getElementById("letterAudioPlayer");
      const isVoicePlaying = (voicePlayer && !voicePlayer.paused) || (letterPlayer && !letterPlayer.paused);
      const savedVol = parseInt(localStorage.getItem("gf_volume") || "80", 10) / 100;
      const voiceBgVol = parseInt(localStorage.getItem("gf_voice_bg_volume") || "7", 10) / 100;
      bgAudio.volume = isVoicePlaying ? Math.min(Math.max(voiceBgVol, 0), 1) : Math.min(Math.max(savedVol, 0), 1);
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          state.musicPlaying = true;
          if (vinyl) vinyl.classList.add("playing");
          if (widget) widget.classList.add("playing");
          if (icon) icon.textContent = "⏸️";
          if (label) label.textContent = "Pause";
          if (onToggle) onToggle(true);
        }).catch(() => {
          state.musicPlaying = false;
          if (vinyl) vinyl.classList.remove("playing");
          if (widget) widget.classList.remove("playing");
          if (icon) icon.textContent = "▶️";
          if (label) label.textContent = "Play";
          this.startOpheliaSynth();
        });
      }
    } else {
      this.startOpheliaSynth();
    }
  }

  fadeInMusic(durationMs = 1800) {
    const bgAudio = document.getElementById("bgAudioPlayer");
    if (!bgAudio) return;
    if (window.state && window.state.soundtrackAutoplay === false) return;
    if (typeof state !== "undefined" && state.musicPlaying === false && bgAudio.paused) return;

    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }

    const savedVol = parseInt(localStorage.getItem("gf_volume") || "80", 10) / 100;
    const targetVol = Math.min(Math.max(savedVol, 0), 1);

    const vinyl = document.getElementById("vinylDisc");
    const widget = document.getElementById("musicPlayerWidget");
    const icon = document.getElementById("musicPlayIcon");
    const label = document.getElementById("musicPlayLabel");

    if (bgAudio.paused || bgAudio.ended) {
      if (bgAudio.ended) bgAudio.currentTime = 0;
      bgAudio.volume = Math.min(bgAudio.volume || 0.2, targetVol);
      const p = bgAudio.play();
      if (p !== undefined) {
        p.then(() => {
          state.musicPlaying = true;
          if (vinyl) vinyl.classList.add("playing");
          if (widget) widget.classList.add("playing");
          if (icon) icon.textContent = "⏸️";
          if (label) label.textContent = "Pause";
        }).catch(() => {
          state.musicPlaying = false;
          if (vinyl) vinyl.classList.remove("playing");
          if (widget) widget.classList.remove("playing");
          if (icon) icon.textContent = "▶️";
          if (label) label.textContent = "Play";
        });
      }
    } else {
      state.musicPlaying = true;
      if (vinyl) vinyl.classList.add("playing");
      if (widget) widget.classList.add("playing");
      if (icon) icon.textContent = "⏸️";
      if (label) label.textContent = "Pause";
    }

    const startVol = Math.min(Math.max(bgAudio.volume, 0), targetVol);
    if (startVol >= targetVol) {
      bgAudio.volume = targetVol;
      return;
    }

    const steps = 36;
    const stepTime = Math.max(durationMs / steps, 25);
    let currentStep = 0;

    this._fadeInterval = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const newVol = startVol + (targetVol - startVol) * easeOut;
      bgAudio.volume = Math.min(Math.max(newVol, 0), targetVol);

      if (progress >= 1) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
        bgAudio.volume = targetVol;
      }
    }, stepTime);
  }

  cancelFade() {
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }
  }

  setupEndedListener() {
    const bgAudio = document.getElementById("bgAudioPlayer");
    if (bgAudio && !bgAudio.dataset.endedBound) {
      bgAudio.dataset.endedBound = "true";
      const isLoop = window.state && window.state.soundtrackLoop !== undefined ? !!window.state.soundtrackLoop : true;
      bgAudio.loop = isLoop;

      bgAudio.addEventListener("play", () => {
        state.musicPlaying = true;
        const vinyl = document.getElementById("vinylDisc");
        const widget = document.getElementById("musicPlayerWidget");
        const icon = document.getElementById("musicPlayIcon");
        const label = document.getElementById("musicPlayLabel");
        if (vinyl) vinyl.classList.add("playing");
        if (widget) widget.classList.add("playing");
        if (icon) icon.textContent = "⏸️";
        if (label) label.textContent = "Pause";
      });

      bgAudio.addEventListener("pause", () => {
        state.musicPlaying = false;
        const vinyl = document.getElementById("vinylDisc");
        const widget = document.getElementById("musicPlayerWidget");
        const icon = document.getElementById("musicPlayIcon");
        const label = document.getElementById("musicPlayLabel");
        if (vinyl) vinyl.classList.remove("playing");
        if (widget) widget.classList.remove("playing");
        if (icon) icon.textContent = "▶️";
        if (label) label.textContent = "Play";
      });

      bgAudio.addEventListener("ended", () => {
        this.handleMusicEnded();
      });

      bgAudio.addEventListener("error", () => {
        state.musicPlaying = false;
        const vinyl = document.getElementById("vinylDisc");
        const widget = document.getElementById("musicPlayerWidget");
        const icon = document.getElementById("musicPlayIcon");
        const label = document.getElementById("musicPlayLabel");
        if (vinyl) vinyl.classList.remove("playing");
        if (widget) widget.classList.remove("playing");
        if (icon) icon.textContent = "▶️";
        if (label) label.textContent = "Play";
      });
    }

    const replayBtn = document.getElementById("musicReplayBtn");
    if (replayBtn && !replayBtn.dataset.bound) {
      replayBtn.dataset.bound = "true";
      replayBtn.addEventListener("click", () => {
        this.playAgain();
      });
    }

    const nextBtn = document.getElementById("musicNextBtn");
    if (nextBtn && !nextBtn.dataset.bound) {
      nextBtn.dataset.bound = "true";
      nextBtn.addEventListener("click", () => {
        this.playNext();
      });
    }

    const closeBtn = document.getElementById("closeMusicEndedBtn");
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = "true";
      closeBtn.addEventListener("click", () => this.hideEndedNotification());
    }
  }

  handleMusicEnded() {
    const bgAudio = document.getElementById("bgAudioPlayer");
    if ((bgAudio && bgAudio.loop) || (window.state && window.state.soundtrackLoop !== false)) {
      this.playAgain();
      return;
    }
    state.musicPlaying = false;
    const vinyl = document.getElementById("vinylDisc");
    const widget = document.getElementById("musicPlayerWidget");
    const icon = document.getElementById("musicPlayIcon");
    const label = document.getElementById("musicPlayLabel");
    if (vinyl) vinyl.classList.remove("playing");
    if (widget) widget.classList.remove("playing");
    if (icon) icon.textContent = "▶️";
    if (label) label.textContent = "Play";

    this.showEndedNotification();
  }

  showEndedNotification() {
    const notif = document.getElementById("musicEndedNotification");
    if (!notif) return;

    const list = typeof SOUNDTRACK_PLAYLIST !== "undefined" ? SOUNDTRACK_PLAYLIST : [];
    const current = (typeof currentChosenSong !== "undefined" && currentChosenSong)
      ? currentChosenSong
      : (list[0] || { title: "Soundtrack", artist: "" });

    const currentSrc = current.src || "";
    const currentIdx = list.findIndex(s => s.src === currentSrc);
    const nextSong = list.length > 0 ? list[(currentIdx + 1) % list.length] : current;

    const descEl = document.getElementById("musicEndedDesc");
    if (descEl) {
      descEl.innerHTML = `<strong>${current.title}</strong> finished.<br><span class="next-song-hint">Next up: ${nextSong.title} — ${nextSong.artist}</span>`;
    }

    notif.classList.remove("hidden");
    notif.classList.add("visible");
    this.playSparkle();

    if (this._notifTimeout) clearTimeout(this._notifTimeout);
    this._notifTimeout = setTimeout(() => this.hideEndedNotification(), 28000);
  }

  hideEndedNotification() {
    if (this._notifTimeout) clearTimeout(this._notifTimeout);
    const notif = document.getElementById("musicEndedNotification");
    if (notif) {
      notif.classList.remove("visible");
      notif.classList.add("hidden");
    }
  }

  playAgain() {
    this.hideEndedNotification();
    const list = typeof SOUNDTRACK_PLAYLIST !== "undefined" ? SOUNDTRACK_PLAYLIST : [];
    const current = (typeof currentChosenSong !== "undefined" && currentChosenSong)
      ? currentChosenSong
      : (list[0] || { title: "Soundtrack", src: "taylor-swift-fate-of-ophelia.m4r" });

    if (typeof selectAndPlaySong === "function") {
      selectAndPlaySong(current);
    } else {
      const bgAudio = document.getElementById("bgAudioPlayer");
      if (bgAudio) {
        bgAudio.currentTime = 0;
        bgAudio.play().catch(() => {});
        state.musicPlaying = true;
      }
    }
    this.playSparkle();
    if (typeof showComplimentToast === "function") {
      showComplimentToast(window.innerWidth / 2, 90, `🔁 Replaying '${current.title}' 🎵`);
    }
  }

  playNext() {
    this.hideEndedNotification();
    const list = typeof SOUNDTRACK_PLAYLIST !== "undefined" ? SOUNDTRACK_PLAYLIST : [];
    if (!list.length) return;

    const currentSrc = (typeof currentChosenSong !== "undefined" && currentChosenSong) ? currentChosenSong.src : "";
    const currentIdx = list.findIndex(s => s.src === currentSrc);
    const nextSong = list[(currentIdx + 1) % list.length];

    if (typeof selectAndPlaySong === "function") {
      selectAndPlaySong(nextSong);
    } else {
      if (typeof currentChosenSong !== "undefined") currentChosenSong = nextSong;
      state.customMusicAudio = nextSong.src;
      const bgAudio = document.getElementById("bgAudioPlayer");
      if (bgAudio) {
        bgAudio.src = nextSong.src;
        bgAudio.currentTime = 0;
        bgAudio.play().catch(() => {});
      }
    }
    this.playFanfare();
    if (typeof showComplimentToast === "function") {
      showComplimentToast(window.innerWidth / 2, 90, `⏭️ Playing Next: '${nextSong.title}' 🎵`);
    }
  }

  startOpheliaSynth() {
    clearInterval(this.musicInterval);
    const opheliaChords = [
      [261.63, 329.63, 392.00, 523.25],
      [329.63, 415.30, 493.88, 587.33],
      [220.00, 261.63, 329.63, 440.00],
      [174.61, 220.00, 261.63, 349.23],
      [196.00, 246.94, 293.66, 392.00]
    ];
    const opheliaMelody = [
      [523.25, 587.33, 659.25],
      [659.25, 622.25, 659.25],
      [440.00, 523.25, 659.25],
      [349.23, 440.00, 523.25],
      [392.00, 493.88, 587.33]
    ];

    const playBar = () => {
      if (!state.musicPlaying) return;
      const idx = this.step % opheliaChords.length;
      const chord = opheliaChords[idx];
      const lead = opheliaMelody[idx];

      chord.forEach((freq) => this.playTone(freq, 1.6, "triangle", 0.04));
      lead.forEach((freq, i) => {
        setTimeout(() => {
          if (state.musicPlaying) this.playTone(freq, 0.5, "sine", 0.06);
        }, (i + 1) * 350);
      });

      this.step++;
    };

    playBar();
    this.musicInterval = setInterval(playBar, 1700);
  }
}

const audio = new SoundEngine();
window.audio = audio;
window.fadeInBgMusic = (d) => audio.fadeInMusic(d);
