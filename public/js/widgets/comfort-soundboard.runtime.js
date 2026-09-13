(function() {
  const root = typeof window !== "undefined" ? window : global;

  let audioCtx = null;
  let masterGain = null;
  let analyser = null;
  let isPlaying = false;
  let channels = {};

  const getAudioCtx = () => {
    if (typeof window === "undefined") return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioCtx) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      masterGain.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  };

  const createNoiseBuffer = (ctx, seconds, type = "white") => {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "brown") {
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else if (type === "pink") {
        data[i] = (lastOut + (0.05 * white)) / 1.05;
        lastOut = data[i];
        data[i] *= 2.5;
      } else {
        data[i] = white * 0.5;
      }
    }
    return buffer;
  };

  const buildRainNode = (ctx) => {
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0, ctx.currentTime);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(ctx, 4, "pink");
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(rainGain);
    noiseSource.start();

    const dropletInterval = setInterval(() => {
      if (!isPlaying || rainGain.gain.value === 0) return;
      try {
        const drop = ctx.createOscillator();
        const dropGain = ctx.createGain();
        const freq = 1200 + Math.random() * 800;
        drop.frequency.setValueAtTime(freq, ctx.currentTime);
        drop.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.04);
        dropGain.gain.setValueAtTime(0.04 * rainGain.gain.value, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        drop.connect(dropGain);
        dropGain.connect(masterGain);
        drop.start();
        drop.stop(ctx.currentTime + 0.04);
      } catch (_) {}
    }, 180);

    return { gain: rainGain, cleanup: () => { clearInterval(dropletInterval); noiseSource.stop(); } };
  };

  const buildOceanNode = (ctx) => {
    const oceanGain = ctx.createGain();
    oceanGain.gain.setValueAtTime(0, ctx.currentTime);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(ctx, 5, "brown");
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(350, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);
    lfo.connect(filter.frequency);
    lfo.start();

    noiseSource.connect(filter);
    filter.connect(oceanGain);
    noiseSource.start();

    return { gain: oceanGain, cleanup: () => { lfo.stop(); noiseSource.stop(); } };
  };

  const buildCampfireNode = (ctx) => {
    const fireGain = ctx.createGain();
    fireGain.gain.setValueAtTime(0, ctx.currentTime);

    const rumble = ctx.createBufferSource();
    rumble.buffer = createNoiseBuffer(ctx, 4, "brown");
    rumble.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(240, ctx.currentTime);
    rumble.connect(filter);
    filter.connect(fireGain);
    rumble.start();

    const crackleInterval = setInterval(() => {
      if (!isPlaying || fireGain.gain.value === 0) return;
      try {
        const pop = ctx.createBufferSource();
        pop.buffer = createNoiseBuffer(ctx, 0.02, "white");
        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.08 * fireGain.gain.value, ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
        pop.connect(popGain);
        popGain.connect(masterGain);
        pop.start();
      } catch (_) {}
    }, 140 + Math.random() * 260);

    return { gain: fireGain, cleanup: () => { clearInterval(crackleInterval); rumble.stop(); } };
  };

  const buildLofiNode = (ctx) => {
    const lofiGain = ctx.createGain();
    lofiGain.gain.setValueAtTime(0, ctx.currentTime);

    const chordFreqs = [174.61, 220.00, 261.63, 329.63];
    const oscs = [];
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.25, ctx.currentTime);
    lfoGain.gain.setValueAtTime(4, ctx.currentTime);
    lfo.start();

    chordFreqs.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      lfoGain.connect(osc.frequency);
      osc.connect(filter);
      osc.start();
      oscs.push(osc);
    });

    filter.connect(lofiGain);

    return { gain: lofiGain, cleanup: () => { lfo.stop(); oscs.forEach(o => o.stop()); } };
  };

  const SOUND_BUILDERS = {
    rain: buildRainNode,
    ocean: buildOceanNode,
    waves: buildOceanNode,
    campfire: buildCampfireNode,
    fireplace: buildCampfireNode,
    lofi: buildLofiNode,
    breeze: buildLofiNode,
    coffee: buildCampfireNode
  };

  function setupEqualizer(container) {
    if (!container || !analyser) return;

    if (container.tagName && container.tagName.toLowerCase() === "canvas") {
      const ctx = container.getContext("2d");
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const render = () => {
        requestAnimationFrame(render);
        const w = container.width;
        const h = container.height;
        ctx.clearRect(0, 0, w, h);

        if (!isPlaying) {
          ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
          for (let i = 0; i < 16; i++) {
            ctx.fillRect(i * (w / 16) + 2, h - 4, (w / 16) - 4, 4);
          }
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        const barWidth = (w / 16) - 4;
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * 2] || 0;
          const barHeight = Math.max(4, (val / 255) * h);
          const grad = ctx.createLinearGradient(0, h - barHeight, 0, h);
          grad.addColorStop(0, "#8b5cf6");
          grad.addColorStop(1, "#3b82f6");
          ctx.fillStyle = grad;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(i * (w / 16) + 2, h - barHeight, barWidth, barHeight, 2);
          } else {
            ctx.rect(i * (w / 16) + 2, h - barHeight, barWidth, barHeight);
          }
          ctx.fill();
        }
      };
      render();
      return;
    }

    const eqBars = Array.from(container.querySelectorAll(".eq-bar"));
    if (eqBars.length > 0) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const render = () => {
        requestAnimationFrame(render);
        if (!isPlaying) {
          eqBars.forEach(bar => { bar.style.height = "6px"; bar.style.opacity = "0.35"; });
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        eqBars.forEach((bar, idx) => {
          const val = dataArray[idx * 2] || 0;
          const pct = Math.max(12, (val / 255) * 100);
          bar.style.height = `${pct}%`;
          bar.style.opacity = "1";
        });
      };
      render();
    }
  }

  function setupPhotoCarousel() {
    const carouselWrap = document.getElementById("calmingCarouselWrap") ||
      document.getElementById("comfortCarousel") ||
      document.querySelector(".calming-photo-stream") ||
      document.querySelector(".comfort-carousel");
    if (!carouselWrap) return;

    const slides = Array.from(carouselWrap.querySelectorAll(".carousel-slide, .comfort-slide"));
    const dots = Array.from(carouselWrap.querySelectorAll(".carousel-dot"));
    if (slides.length <= 1) return;

    let currentIdx = 0;
    let timer = null;

    const showSlide = (idx) => {
      slides.forEach((s, i) => {
        const isActive = i === idx;
        s.classList.toggle("active", isActive);
        s.style.opacity = isActive ? "1" : "0";
        s.style.display = isActive ? "block" : "none";
      });
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      currentIdx = idx;
    };

    const nextSlide = () => showSlide((currentIdx + 1) % slides.length);
    const prevSlide = () => showSlide((currentIdx - 1 + slides.length) % slides.length);

    const startTimer = () => {
      stopTimer();
      timer = setInterval(nextSlide, 5000);
    };
    const stopTimer = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    carouselWrap.addEventListener("mouseenter", stopTimer);
    carouselWrap.addEventListener("mouseleave", startTimer);
    carouselWrap.addEventListener("touchstart", stopTimer, { passive: true });
    carouselWrap.addEventListener("touchend", startTimer);

    const nextBtn = document.getElementById("btnCarouselNext") ||
      document.getElementById("comfortNextBtn") ||
      carouselWrap.querySelector(".carousel-arrow.next");
    const prevBtn = document.getElementById("btnCarouselPrev") ||
      document.getElementById("comfortPrevBtn") ||
      carouselWrap.querySelector(".carousel-arrow.prev");

    if (nextBtn && !nextBtn._bound) {
      nextBtn._bound = true;
      nextBtn.addEventListener("click", () => { nextSlide(); startTimer(); });
    }
    if (prevBtn && !prevBtn._bound) {
      prevBtn._bound = true;
      prevBtn.addEventListener("click", () => { prevSlide(); startTimer(); });
    }

    dots.forEach((dot, dIdx) => {
      if (!dot._bound) {
        dot._bound = true;
        dot.addEventListener("click", () => { showSlide(dIdx); startTimer(); });
      }
    });

    showSlide(0);
    startTimer();
  }

  function setupComfortSoundboard(data = {}) {
    if (typeof document === "undefined") return;

    const masterPlayBtn = document.getElementById("btnSoundboardMasterPlay") ||
      document.getElementById("soundboardMasterPlayBtn") ||
      document.querySelector(".soundboard-master-play");
    const masterMuteBtn = document.getElementById("btnSoundboardMasterMute") ||
      document.querySelector(".soundboard-master-mute");
    const eqContainer = document.getElementById("soundboardEqualizer") ||
      document.querySelector(".soundboard-equalizer");

    const channelElements = Array.from(document.querySelectorAll(".sound-rack-channel, [data-sound-id]"));
    const soundIds = channelElements.length > 0
      ? channelElements.map(el => el.dataset.soundId).filter(Boolean)
      : ["rain", "ocean", "campfire", "lofi"];

    const initChannels = () => {
      const ctx = getAudioCtx();
      if (!ctx) return;
      soundIds.forEach(rawId => {
        const id = rawId.toLowerCase();
        if (!channels[id]) {
          const builder = SOUND_BUILDERS[id] || SOUND_BUILDERS.lofi;
          const ch = builder(ctx);
          ch.gain.connect(masterGain);
          channels[id] = {
            ...ch,
            targetVolume: 0.5,
            active: true
          };
        }
      });
    };

    const toggleChannel = (key, forcedState) => {
      initChannels();
      const id = key.toLowerCase();
      const ch = channels[id];
      if (!ch) return;
      ch.active = forcedState !== undefined ? forcedState : !ch.active;
      const ctx = getAudioCtx();
      const val = ch.active && isPlaying ? ch.targetVolume : 0;
      ch.gain.gain.setValueAtTime(ch.gain.gain.value, ctx.currentTime);
      ch.gain.gain.linearRampToValueAtTime(val, ctx.currentTime + 0.1);

      const btn = document.querySelector(`.btn-channel-mute[data-sound-id="${key}"], [data-soundboard-toggle="${key}"]`);
      if (btn) {
        btn.classList.toggle("active", ch.active);
        const icon = btn.querySelector(".mute-icon") || btn;
        icon.textContent = ch.active ? "🔊" : "🔇";
      }
    };

    const setChannelVolume = (key, volume) => {
      initChannels();
      const id = key.toLowerCase();
      const ch = channels[id];
      if (!ch) return;
      ch.targetVolume = Math.max(0, Math.min(1, volume));
      if (ch.active && isPlaying) {
        const ctx = getAudioCtx();
        ch.gain.gain.setValueAtTime(ch.gain.gain.value, ctx.currentTime);
        ch.gain.gain.linearRampToValueAtTime(ch.targetVolume, ctx.currentTime + 0.05);
      }
      const valDisplay = document.querySelector(`.sound-rack-channel[data-sound-id="${key}"] .channel-volume-val`);
      if (valDisplay) valDisplay.textContent = `${Math.round(ch.targetVolume * 100)}%`;
    };

    const setMasterPlay = (play) => {
      isPlaying = play;
      initChannels();
      const ctx = getAudioCtx();
      soundIds.forEach(rawId => {
        const id = rawId.toLowerCase();
        const ch = channels[id];
        if (!ch) return;
        const val = isPlaying && ch.active ? ch.targetVolume : 0;
        ch.gain.gain.setValueAtTime(ch.gain.gain.value, ctx.currentTime);
        ch.gain.gain.linearRampToValueAtTime(val, ctx.currentTime + 0.15);
      });

      if (masterPlayBtn) {
        masterPlayBtn.classList.toggle("playing", isPlaying);
        const text = masterPlayBtn.querySelector(".master-play-text") || masterPlayBtn;
        const icon = masterPlayBtn.querySelector(".master-play-icon") || masterPlayBtn.querySelector(".play-icon");
        if (text) text.textContent = isPlaying ? "Pause Calming Ambience" : "Play Calming Ambience";
        if (icon) icon.textContent = isPlaying ? "⏸" : "▶";
      }
    };

    if (masterPlayBtn && !masterPlayBtn._bound) {
      masterPlayBtn._bound = true;
      masterPlayBtn.addEventListener("click", () => setMasterPlay(!isPlaying));
    }

    if (masterMuteBtn && !masterMuteBtn._bound) {
      masterMuteBtn._bound = true;
      let allMuted = false;
      masterMuteBtn.addEventListener("click", () => {
        allMuted = !allMuted;
        soundIds.forEach(sid => toggleChannel(sid, !allMuted));
        masterMuteBtn.textContent = allMuted ? "🔊 Unmute All" : "🔇 Mute All";
      });
    }

    channelElements.forEach(chEl => {
      const sid = chEl.dataset.soundId;
      const toggleBtn = chEl.querySelector(".btn-channel-mute, [data-soundboard-toggle]");
      const volSlider = chEl.querySelector(".sound-volume-slider, [data-soundboard-vol]");

      if (toggleBtn && !toggleBtn._bound) {
        toggleBtn._bound = true;
        toggleBtn.addEventListener("click", () => {
          if (!isPlaying) setMasterPlay(true);
          toggleChannel(sid);
        });
      }

      if (volSlider && !volSlider._bound) {
        volSlider._bound = true;
        volSlider.addEventListener("input", (e) => {
          const val = Number(e.target.value) / 100;
          setChannelVolume(sid, isNaN(val) ? 0.5 : val);
        });
      }
    });

    if (eqContainer) setupEqualizer(eqContainer);
    setupPhotoCarousel();

    root.soundboardToggleChannel = toggleChannel;
    root.soundboardSetVolume = setChannelVolume;
    root.soundboardSetMasterPlay = setMasterPlay;
  }

  root.setupComfortSoundboard = setupComfortSoundboard;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setupComfortSoundboard());
    } else {
      setupComfortSoundboard();
    }
  }
})();
