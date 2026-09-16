(function() {
  const AudioEngine = {
    ctx: null,
    getCtx() {
      if (!this.ctx && typeof window !== "undefined") {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      return this.ctx;
    },
    beep(freq = 440, duration = 0.08) {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + duration);
    },
    shutter() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime, len = Math.floor(ctx.sampleRate * 0.05);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1300, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start(now);
    },
    filmMotor() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.4);
      osc.frequency.linearRampToValueAtTime(95, now + 1.0);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(550, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.05);
      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 1.1);
    },
    sparkle() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
        const t = now + idx * 0.07, osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.35);
      });
    }
  };

  const FILTERS = {
    natural: { name: "Natural", css: "none" },
    vintage_90s: { name: "90s Film", css: "contrast(1.18) saturate(1.15) sepia(0.28) hue-rotate(-6deg)" },
    bw_noir: { name: "B&W Noir", css: "grayscale(1) contrast(1.45) brightness(0.92)" },
    golden_sunset: { name: "Golden Sunset", css: "sepia(0.42) saturate(1.45) brightness(1.06) contrast(1.12)" },
    dreamy_bloom: { name: "Dreamy Bloom", css: "brightness(1.1) saturate(1.35) contrast(0.96)" },
    cyberpunk: { name: "Cyberpunk", css: "hue-rotate(190deg) saturate(1.8) contrast(1.2)" }
  };

  const POSE_HINTS = [
    "Pose 1: Smile big! 😊",
    "Pose 2: Make a heart! 🫶",
    "Pose 3: Silly funny face! 🤪",
    "Pose 4: Blow a sweet kiss! 😘"
  ];

  const STICKERS = ["💖", "🫶", "💋", "🎀", "✨", "🌸", "🍒", "💌", "🧸", "💍", "👑", "🥂", "🌹", "🕊️", "🎞️", "⭐"];

  const DEFAULT_SAMPLES = [
    "/public/images/landing-v2/avatar-couple-1.jpg",
    "/public/images/landing-v2/avatar-couple-2.png",
    "/public/images/landing-v2/avatar-couple-3.jpg",
    "/public/images/puzzle-couple.jpg",
    "/public/images/landing-v2/avatar-couple-1.jpg",
    "/public/images/landing-v2/avatar-couple-2.png",
    "/public/images/landing-v2/avatar-couple-3.jpg",
    "/public/images/puzzle-couple.jpg",
    "/public/images/landing-v2/avatar-couple-1.jpg"
  ];

  let activeBooth = null;

  class PhotoboothSession {
    constructor(config = {}, heroData = {}) {
      this.config = { ...config };
      this.hero = { ...heroData };
      this.p1 = this.config.partner1 || this.hero.partner1 || "Alex";
      this.p2 = this.config.partner2 || this.hero.partner2 || "Sam";
      this.caption = this.config.stripCaption || `${this.p1} & ${this.p2} ♡ Forever`;
      this.location = this.config.stripLocation || "PARIS • 2026";
      this.sfxEnabled = this.config.sfxEnabled !== false;
      this.hapticsEnabled = this.config.hapticsEnabled !== false;
      this.showDate = this.config.showDate !== false;

      this.currentFilter = this.config.defaultFilter || "vintage_90s";
      this.currentFormat = this.config.defaultFormat || "classic_3cut";
      this.currentLayout = this.config.defaultLayout || this.currentFormat;
      this.currentStyle = this.config.defaultStyle || "style_cyan_stars";
      this.countdownSeconds = 3;
      this.isMirror = true;
      this.flashEnabled = true;
      this.filmGrainEnabled = true;
      this.dateStampEnabled = true;

      this.facingMode = "user";
      this.mediaStream = null;
      this.isCapturing = false;
      this.capturedPhotos = [];
      this.stickers = [];
      this.selectedStickerId = null;

      this.sectionEl = document.getElementById("section-photobooth") || document.querySelector(".photobooth-section");
      this.videoEl = document.getElementById("photoboothVideo");
      this.offscreenCanvas = document.getElementById("photoboothOffscreen") || document.createElement("canvas");
      this.countdownOverlay = document.getElementById("photoboothCountdown");
      this.countdownDigit = document.getElementById("countdownDigit");
      this.posePill = document.getElementById("photoboothPosePill");
      this.poseText = document.getElementById("photoboothPoseText");
      this.flashEl = document.getElementById("photoboothFlash");
      this.fallbackWrap = document.getElementById("photoboothFallback");
      this.reviewWorkspace = document.getElementById("photoboothReviewWorkspace");
      this.stripContainer = document.getElementById("photoboothStripContainer");
      this.fileInput = document.getElementById("photoboothFileInput");

      this.init();
    }

    vibrate(pattern) {
      if (this.hapticsEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(pattern); } catch (e) {}
      }
    }

    play(fnName, ...args) {
      if (!this.sfxEnabled) return;
      try { AudioEngine[fnName](...args); } catch (e) {}
    }

    init() {
      if (!this.sectionEl) return;
      this.bindControls();
      this.renderStickerPalette();
      this.applyFilter(this.currentFilter);
    }

    bindControls() {
      document.getElementById("btnHeaderTake")?.addEventListener("click", () => this.openCamera());
      document.getElementById("btnBackToLobby")?.addEventListener("click", () => this.backToLobby());
      document.getElementById("btnChangeFrame")?.addEventListener("click", () => this.backToLobby());
      document.getElementById("btnHeaderUpload")?.addEventListener("click", () => {
        this.fileInput?.click();
      });
      document.getElementById("btnStartBurst")?.addEventListener("click", () => this.startBurst());
      document.getElementById("btnSwitchCamera")?.addEventListener("click", () => this.switchCamera());
      document.getElementById("btnToggleAudio")?.addEventListener("click", () => this.toggleAudio());
      document.getElementById("btnRetakeBurst")?.addEventListener("click", () => this.retake());
      document.getElementById("btnExportStrip")?.addEventListener("click", () => this.exportStrip());
      document.getElementById("btnShareStrip")?.addEventListener("click", () => this.shareStrip());
      document.getElementById("btnUseSamplePhotos")?.addEventListener("click", () => this.useSamplePhotos());

      document.getElementById("btnShufflePhotos")?.addEventListener("click", () => this.shufflePhotos());
      document.getElementById("btnToggleGrain")?.addEventListener("click", (e) => {
        this.filmGrainEnabled = !this.filmGrainEnabled;
        e.currentTarget.classList.toggle("active", this.filmGrainEnabled);
        this.renderStrip();
      });
      document.getElementById("btnToggleDateStamp")?.addEventListener("click", (e) => {
        this.dateStampEnabled = !this.dateStampEnabled;
        e.currentTarget.classList.toggle("active", this.dateStampEnabled);
        this.renderStrip();
      });

      document.querySelectorAll(".pro-chip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".pro-chip-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.countdownSeconds = Number(btn.dataset.timer) || 3;
          this.vibrate(15);
        });
      });

      document.getElementById("btnToggleMirror")?.addEventListener("click", (e) => {
        this.isMirror = !this.isMirror;
        e.currentTarget.classList.toggle("active", this.isMirror);
        if (this.videoEl) this.videoEl.classList.toggle("booth-no-mirror", !this.isMirror);
        this.vibrate(20);
      });

      document.getElementById("btnToggleFlashMode")?.addEventListener("click", (e) => {
        this.flashEnabled = !this.flashEnabled;
        e.currentTarget.classList.toggle("active", this.flashEnabled);
        const icon = document.getElementById("flashModeIcon");
        if (icon) icon.textContent = this.flashEnabled ? "⚡" : "🚫";
        this.vibrate(20);
      });

      document.querySelectorAll(".format-pill-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".format-pill-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.setFormat(btn.dataset.format);
        });
      });

      this.fileInput?.addEventListener("change", (e) => this.handleFileUpload(e));

      document.querySelectorAll(".filter-chip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".filter-chip-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.applyFilter(btn.dataset.filter);
        });
      });

      document.querySelectorAll(".layout-chip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".layout-chip-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          if (btn.dataset.style) this.setStyle(btn.dataset.style);
        });
      });

      window.addEventListener("beforeunload", () => this.stopCamera());
      window.addEventListener("pagehide", () => this.stopCamera());
    }

    async startCamera() {
      this.stopCamera();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (this.fallbackWrap) this.fallbackWrap.style.display = "flex";
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: this.facingMode,
            width: { ideal: 1280 },
            height: { ideal: 960 }
          },
          audio: false
        });
        this.mediaStream = stream;
        if (this.videoEl) {
          this.videoEl.srcObject = stream;
          this.videoEl.classList.toggle("facing-environment", this.facingMode === "environment");
          await this.videoEl.play();
        }
        if (this.fallbackWrap) this.fallbackWrap.style.display = "none";
      } catch (err) {
        console.warn("Photobooth Camera Access Failed:", err);
        if (this.fallbackWrap) this.fallbackWrap.style.display = "flex";
      }
    }

    stopCamera() {
      if (this.mediaStream) {
        try {
          this.mediaStream.getTracks().forEach((t) => t.stop());
        } catch (e) {}
        this.mediaStream = null;
      }
      if (this.videoEl) {
        this.videoEl.srcObject = null;
      }
    }

    async switchCamera() {
      this.facingMode = this.facingMode === "user" ? "environment" : "user";
      this.vibrate(20);
      this.play("beep", 660, 0.05);
      await this.startCamera();
    }

    applyFilter(filterKey) {
      this.currentFilter = filterKey;
      const css = FILTERS[filterKey]?.css || "none";
      if (this.videoEl) {
        this.videoEl.style.filter = css;
      }
      this.renderStrip();
    }

    toggleAudio() {
      this.sfxEnabled = !this.sfxEnabled;
      const icon = document.getElementById("boothAudioIcon");
      if (icon) icon.textContent = this.sfxEnabled ? "🔊" : "🔇";
      this.vibrate(15);
      if (this.sfxEnabled) this.play("beep", 520, 0.08);
    }

    shufflePhotos() {
      if (this.capturedPhotos.length > 1) {
        this.capturedPhotos.push(this.capturedPhotos.shift());
        this.renderStrip();
        this.play("beep", 540, 0.05);
        this.vibrate(20);
      }
    }

    getMiniWindowsHtml(fmt) {
      switch (fmt) {
        case "grid_3x3":
          return `<div class="mini-windows-wrap fmt-grid_3x3">${Array(9).fill('<div class="mini-window"></div>').join("")}</div>`;
        case "film_grid":
          return `<div class="mini-windows-wrap fmt-film_grid">${Array(4).fill('<div class="mini-window"></div>').join("")}</div>`;
        case "classic_strip":
          return `<div class="mini-windows-wrap fmt-classic_strip">${Array(4).fill('<div class="mini-window"></div>').join("")}</div>`;
        case "portrait_pair":
          return `<div class="mini-windows-wrap fmt-portrait_pair">${Array(2).fill('<div class="mini-window"></div>').join("")}</div>`;
        case "wide_collage":
          return `<div class="mini-windows-wrap fmt-wide_collage"><div class="mini-window mini-win-top"></div><div class="mini-window mini-win-top"></div><div class="mini-window mini-win-bot"></div></div>`;
        case "polaroid_single":
          return `<div class="mini-windows-wrap fmt-polaroid_single"><div class="mini-window"></div></div>`;
        case "classic_3cut":
        default:
          return `<div class="mini-windows-wrap fmt-classic_3cut">${Array(3).fill('<div class="mini-window"></div>').join("")}</div>`;
      }
    }

    setFormat(fmtKey) {
      this.currentFormat = fmtKey;
      this.currentLayout = fmtKey;

      document.querySelectorAll(".format-pill-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.format === fmtKey);
      });

      const markup = this.getMiniWindowsHtml(fmtKey);
      document.querySelectorAll("#boothLayoutChips .frame-mini-strip").forEach((strip) => {
        const wrap = strip.querySelector(".mini-windows-wrap");
        if (wrap) {
          wrap.outerHTML = markup;
        } else {
          const oldWindows = strip.querySelectorAll(".mini-window");
          if (oldWindows.length) {
            const temp = document.createElement("div");
            temp.innerHTML = markup;
            oldWindows[0].parentNode.insertBefore(temp.firstElementChild, oldWindows[0]);
            oldWindows.forEach(w => w.remove());
          }
        }
      });

      this.vibrate(15);
      if (this.capturedPhotos.length) this.renderStrip();
    }

    setStyle(styleKey) {
      this.currentStyle = styleKey;
      document.querySelectorAll(".layout-chip-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.style === styleKey);
      });
      this.vibrate(15);
      if (this.capturedPhotos.length) this.renderStrip();
    }

    setLayout(layoutKey) {
      this.setFormat(layoutKey);
    }

    getShotCount() {
      const counts = {
        polaroid_single: 1,
        portrait_pair: 2,
        classic_3cut: 3,
        wide_collage: 3,
        classic_strip: 4,
        film_grid: 4,
        grid_3x3: 9
      };
      return counts[this.currentFormat] || counts[this.currentLayout] || 3;
    }

    async startBurst() {
      if (this.isCapturing) return;
      this.isCapturing = true;
      this.capturedPhotos = [];
      const totalShots = this.getShotCount();

      for (let i = 0; i < totalShots; i++) {
        await this.runShotCountdown(i, totalShots);
        this.captureFrame();
        if (i < totalShots - 1) await new Promise((r) => setTimeout(r, 900));
      }

      this.isCapturing = false;
      this.play("sparkle");
      this.play("filmMotor");
      this.vibrate([40, 50, 40]);
      this.stopCamera();
      this.showReview();
    }

    runShotCountdown(shotIdx, totalShots) {
      return new Promise((resolve) => {
        if (this.posePill && this.poseText) {
          this.poseText.textContent = POSE_HINTS[shotIdx % POSE_HINTS.length];
          this.posePill.style.display = "block";
        }
        if (this.countdownOverlay) this.countdownOverlay.style.display = "flex";

        let count = this.countdownSeconds;
        if (count <= 1) {
          if (this.countdownOverlay) this.countdownOverlay.style.display = "none";
          if (this.posePill) this.posePill.style.display = "none";
          resolve();
          return;
        }

        const tick = () => {
          if (this.countdownDigit) this.countdownDigit.textContent = count;
          if (count > 0) {
            this.play("beep", count === 1 ? 880 : 440, 0.09);
            count--;
            setTimeout(tick, 1000);
          } else {
            if (this.countdownOverlay) this.countdownOverlay.style.display = "none";
            if (this.posePill) this.posePill.style.display = "none";
            resolve();
          }
        };
        tick();
      });
    }

    triggerFlash() {
      if (!this.flashEnabled || !this.flashEl) return;
      this.flashEl.classList.remove("camera-flash-active");
      void this.flashEl.offsetWidth;
      this.flashEl.classList.add("camera-flash-active");
      setTimeout(() => this.flashEl?.classList.remove("camera-flash-active"), 400);
    }

    captureFrame() {
      this.play("shutter");
      this.vibrate(35);
      this.triggerFlash();

      const video = this.videoEl;
      const canvas = this.offscreenCanvas;
      const ctx = canvas.getContext("2d");
      const vw = video?.videoWidth || 640;
      const vh = video?.videoHeight || 480;

      canvas.width = vw;
      canvas.height = vh;
      if (this.facingMode === "user" && this.isMirror) {
        ctx.translate(vw, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, vw, vh);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      this.capturedPhotos.push(canvas.toDataURL("image/jpeg", 0.92));
    }

    useSamplePhotos() {
      const list = (this.config.samplePhotos && this.config.samplePhotos.length) ? this.config.samplePhotos : DEFAULT_SAMPLES;
      this.capturedPhotos = [...list];
      this.play("filmMotor");
      this.vibrate(30);
      this.stopCamera();
      this.showReview();
    }

    handleFileUpload(e) {
      const files = Array.from(e.target.files || []).slice(0, 4);
      if (!files.length) return;
      this.capturedPhotos = [];
      let loaded = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.capturedPhotos.push(evt.target.result);
          loaded++;
          if (loaded === files.length) {
            this.play("filmMotor");
            this.stopCamera();
            this.showReview();
          }
        };
        reader.readAsDataURL(file);
      });
    }

    openCamera() {
      const frameSection = document.getElementById("photoboothFrameSection");
      const viewfinder = document.getElementById("photoboothViewfinder");
      const review = document.getElementById("photoboothReviewWorkspace");
      if (frameSection) frameSection.style.display = "none";
      if (review) review.style.display = "none";
      if (viewfinder) {
        viewfinder.style.display = "flex";
        viewfinder.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      this.play("beep", 660, 0.06);
      this.vibrate(25);
      this.startCamera();
    }

    backToLobby() {
      const frameSection = document.getElementById("photoboothFrameSection");
      const viewfinder = document.getElementById("photoboothViewfinder");
      const review = document.getElementById("photoboothReviewWorkspace");
      if (viewfinder) viewfinder.style.display = "none";
      if (review) review.style.display = "none";
      if (frameSection) {
        frameSection.style.display = "block";
        frameSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      this.stopCamera();
      this.play("beep", 440, 0.05);
      this.vibrate(15);
    }

    showReview() {
      const frameSection = document.getElementById("photoboothFrameSection");
      const viewfinder = document.getElementById("photoboothViewfinder");
      if (viewfinder) viewfinder.style.display = "none";
      if (frameSection) frameSection.style.display = "none";
      if (this.reviewWorkspace) {
        this.reviewWorkspace.style.display = "flex";
        this.reviewWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      this.renderStrip();
    }

    retake() {
      this.capturedPhotos = [];
      this.stickers = [];
      if (this.reviewWorkspace) this.reviewWorkspace.style.display = "none";
      this.openCamera();
    }

    renderStrip() {
      if (!this.stripContainer) return;
      const photos = this.capturedPhotos.length ? this.capturedPhotos : DEFAULT_SAMPLES;
      const count = this.getShotCount();
      const activePhotos = photos.slice(0, count);
      const filterCss = FILTERS[this.currentFilter]?.css || "none";
      const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const dateDigital = `'${String(now.getFullYear()).slice(-2)} ${pad(now.getMonth() + 1)} ${pad(now.getDate())}`;

      let photosHtml = "";
      if (this.currentFormat === "film_grid") {
        photosHtml = `<div class="grid-2x2-wrap">${activePhotos.map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}</div>`;
      } else if (this.currentFormat === "grid_3x3") {
        photosHtml = `<div class="grid-3x3-wrap">${activePhotos.map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}</div>`;
      } else if (this.currentFormat === "wide_collage") {
        photosHtml = `
          <div class="collage-grid-row">
            ${activePhotos.slice(0, 2).map((src, i) => `
              <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
                <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
                <span class="photo-idx-badge">#${i + 1}</span>
              </div>
            `).join("")}
          </div>
          ${activePhotos[2] ? `
            <div class="strip-photo-card collage-hero-card" data-idx="2" title="Tap to swap photo position">
              <img src="${activePhotos[2]}" alt="Photobooth Snap 3" style="filter: ${filterCss};">
              <span class="photo-idx-badge">#3</span>
            </div>
          ` : ""}
        `;
      } else if (this.currentFormat === "polaroid_single") {
        photosHtml = `
          <div class="strip-photo-card polaroid-single-card" data-idx="0">
            <img src="${activePhotos[0] || DEFAULT_SAMPLES[0]}" alt="Photobooth Single Polar" style="filter: ${filterCss};">
          </div>
        `;
      } else {
        photosHtml = activePhotos.map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("");
      }

      this.stripContainer.className = `photobooth-strip-container strip-layout-${this.currentLayout} strip-format-${this.currentFormat} strip-style-${this.currentStyle}`;
      this.stripContainer.innerHTML = `
        ${this.currentStyle === "style_noir_film" ? `
          <div class="film-sprockets-track film-sprockets-left" aria-hidden="true"></div>
          <div class="film-sprockets-track film-sprockets-right" aria-hidden="true"></div>
        ` : ""}
        ${this.filmGrainEnabled ? `<div class="strip-film-grain" aria-hidden="true"></div>` : ""}
        <div class="strip-header-banner">
          <span>✦</span>
          <span>${this.caption}</span>
          <span>✦</span>
        </div>
        ${photosHtml}
        <div class="strip-footer-meta">
          <div class="strip-caption-txt">${this.caption}</div>
          <div class="strip-sub-txt">${this.location}${this.showDate ? ` • ${dateStr}` : ""}</div>
          ${this.dateStampEnabled ? `<div class="strip-date-stamp-digital">${dateDigital}</div>` : ""}
          <div class="strip-barcode-line">||| | || |||| | ||| | ||</div>
        </div>
        <div class="strip-stickers-layer" id="stripStickersLayer"></div>
      `;

      this.stripContainer.querySelectorAll(".strip-photo-card").forEach((card) => {
        card.addEventListener("click", () => {
          const idx = Number(card.dataset.idx);
          if (this.capturedPhotos.length > 1) {
            const nextIdx = (idx + 1) % this.capturedPhotos.length;
            const tmp = this.capturedPhotos[idx];
            this.capturedPhotos[idx] = this.capturedPhotos[nextIdx];
            this.capturedPhotos[nextIdx] = tmp;
            this.renderStrip();
            this.play("beep", 520, 0.05);
            this.vibrate(20);
          }
        });
      });

      this.renderStickers();
    }

    renderStickerPalette() {
      const palette = document.getElementById("boothStickerPalette");
      if (!palette) return;
      palette.innerHTML = STICKERS.map((emoji) => `
        <button type="button" class="sticker-item-btn" data-emoji="${emoji}">${emoji}</button>
      `).join("");

      palette.querySelectorAll(".sticker-item-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.addSticker(btn.dataset.emoji);
          this.play("beep", 660, 0.05);
          this.vibrate(15);
        });
      });
    }

    addSticker(emoji) {
      const id = "stk_" + Math.random().toString(36).slice(2, 9);
      const sticker = {
        id,
        emoji,
        x: 40 + Math.random() * 20,
        y: 30 + Math.random() * 40,
        scale: 1,
        rot: Math.round((Math.random() - 0.5) * 30)
      };
      this.stickers.push(sticker);
      this.selectedStickerId = id;
      this.renderStickers();
    }

    renderStickers() {
      const layer = document.getElementById("stripStickersLayer");
      if (!layer) return;
      layer.innerHTML = "";

      this.stickers.forEach((s) => {
        const el = document.createElement("div");
        el.className = `photobooth-deco-sticker ${this.selectedStickerId === s.id ? "selected-sticker" : ""}`;
        el.dataset.id = s.id;
        el.style.left = `${s.x}%`;
        el.style.top = `${s.y}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${s.rot}deg) scale(${s.scale})`;
        el.innerHTML = `
          <span>${s.emoji}</span>
          ${this.selectedStickerId === s.id ? `
            <div class="sticker-control-btn" data-del="${s.id}" title="Remove">✕</div>
            <div class="sticker-rotate-btn" data-rot="${s.id}" title="Rotate & Scale">↻</div>
          ` : ""}
        `;

        el.addEventListener("pointerdown", (e) => this.onStickerPointerDown(e, s, el));
        layer.appendChild(el);
      });

      layer.querySelectorAll(".sticker-control-btn").forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
          this.stickers = this.stickers.filter((stk) => stk.id !== btn.dataset.del);
          this.renderStickers();
        });
      });

      layer.querySelectorAll(".sticker-rotate-btn").forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => this.onRotateHandlePointerDown(e, btn.dataset.rot));
      });
    }

    onStickerPointerDown(e, sticker, el) {
      if (e.target.closest(".sticker-control-btn") || e.target.closest(".sticker-rotate-btn")) return;
      e.stopPropagation();
      this.selectedStickerId = sticker.id;
      this.renderStickers();

      const container = this.stripContainer;
      const rect = container.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = sticker.x;
      const origY = sticker.y;

      const onMove = (ev) => {
        const dx = ((ev.clientX - startX) / rect.width) * 100;
        const dy = ((ev.clientY - startY) / rect.height) * 100;
        sticker.x = Math.max(5, Math.min(95, origX + dx));
        sticker.y = Math.max(5, Math.min(95, origY + dy));
        el.style.left = `${sticker.x}%`;
        el.style.top = `${sticker.y}%`;
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    onRotateHandlePointerDown(e, stickerId) {
      e.stopPropagation();
      const sticker = this.stickers.find((s) => s.id === stickerId);
      if (!sticker) return;
      const el = document.querySelector(`.photobooth-deco-sticker[data-id="${stickerId}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const initDist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const initScale = sticker.scale;
      const initAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) - sticker.rot;

      const onMove = (ev) => {
        const curDist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
        const curAngle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
        sticker.scale = Math.max(0.6, Math.min(2.5, initScale * (curDist / initDist)));
        sticker.rot = Math.round(curAngle - initAngle);
        el.style.transform = `translate(-50%, -50%) rotate(${sticker.rot}deg) scale(${sticker.scale})`;
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        this.renderStickers();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    async generateExportCanvas() {
      const photos = this.capturedPhotos.length ? this.capturedPhotos : DEFAULT_SAMPLES;
      const count = this.getShotCount();
      const activePhotos = photos.slice(0, count);
      const filterCss = FILTERS[this.currentFilter]?.css || "none";
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      const dateDigital = `'${String(now.getFullYear()).slice(2)} ${String(now.getMonth() + 1).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}`;

      const loadedImages = await Promise.all(
        activePhotos.map((src) => new Promise((res) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => res(img);
          img.onerror = () => res(null);
          img.src = src;
        }))
      );

      const dimensions = {
        classic_strip: { w: 320, h: 260 + count * 220 },
        classic_3cut: { w: 320, h: 260 + 3 * 220 },
        film_grid: { w: 440, h: 560 },
        grid_3x3: { w: 460, h: 580 },
        portrait_pair: { w: 340, h: 720 },
        wide_collage: { w: 460, h: 480 },
        polaroid_single: { w: 340, h: 440 }
      };
      const dim = dimensions[this.currentFormat] || dimensions[this.currentLayout] || dimensions.classic_strip;
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = dim.w * scale;
      canvas.height = dim.h * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      const styles = {
        style_cyan_stars: { bg: "#4ab3bf", frame: "#ffffff", border: "#3ba1ad", text: "#ffffff", sub: "#e0f7fa", font: "'Playfair Display', Georgia, serif" },
        style_floral: { bg: "#fbf8f3", frame: "#ffffff", border: "#52a297", text: "#2e534d", sub: "#52a297", font: "'Playfair Display', Georgia, serif" },
        style_retro_swirl: { bg: "#fff5eb", frame: "#ffffff", border: "#f77f00", text: "#b73e00", sub: "#e76f51", font: "'Playfair Display', Georgia, serif" },
        style_lavender_stripes: { bg: "#f3e8f7", frame: "#ffffff", border: "#d4b0e5", text: "#55276c", sub: "#8a58a6", font: "'Playfair Display', Georgia, serif" },
        style_noir_film: { bg: "#110e14", frame: "#1e1a22", border: "#383240", text: "#e4dfea", sub: "#9c94a6", font: "sans-serif" },
        style_y2k_pink: { bg: "#ffe8f1", frame: "#ffffff", border: "#ff416c", text: "#c2185b", sub: "#ff416c", font: "sans-serif" },
        style_newspaper: { bg: "#f2eee5", frame: "#ffffff", border: "#221e20", text: "#1b1819", sub: "#554d48", font: "'Times New Roman', Times, serif" },
        style_minimal_white: { bg: "#ffffff", frame: "#ffffff", border: "#dcdad8", text: "#111111", sub: "#666666", font: "sans-serif" }
      };
      const theme = styles[this.currentStyle] || styles.style_cyan_stars;

      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, dim.w, dim.h);

      if (this.currentStyle === "style_lavender_stripes") {
        ctx.fillStyle = "rgba(216, 180, 226, 0.35)";
        for (let x = 0; x < dim.w; x += 16) {
          ctx.fillRect(x, 0, 8, dim.h);
        }
      } else if (this.currentStyle === "style_retro_swirl") {
        ctx.strokeStyle = "#fcbf49";
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, dim.w - 12, dim.h - 12);
        ctx.strokeStyle = "#f77f00";
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, dim.w - 20, dim.h - 20);
      } else if (this.currentStyle === "style_newspaper") {
        ctx.strokeStyle = "#221e20";
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, dim.w - 12, dim.h - 12);
        ctx.lineWidth = 1;
        ctx.strokeRect(11, 11, dim.w - 22, dim.h - 22);
      } else if (this.currentStyle === "style_floral") {
        ctx.strokeStyle = "#52a297";
        ctx.lineWidth = 5;
        ctx.strokeRect(6, 6, dim.w - 12, dim.h - 12);
      } else if (this.currentStyle === "style_y2k_pink") {
        ctx.strokeStyle = "#ff416c";
        ctx.lineWidth = 5;
        ctx.strokeRect(6, 6, dim.w - 12, dim.h - 12);
      } else if (this.currentStyle === "style_noir_film") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        for (let y = 14; y < dim.h - 20; y += 26) {
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(7, y, 9, 14, 2) : ctx.rect(7, y, 9, 14);
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(dim.w - 16, y, 9, 14, 2) : ctx.rect(dim.w - 16, y, 9, 14);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, dim.w - 16, dim.h - 16);
      }

      ctx.font = `bold 13px ${theme.font}`;
      ctx.fillStyle = theme.text;
      ctx.textAlign = "center";
      ctx.fillText(`✦ ${this.caption.toUpperCase()} ✦`, dim.w / 2, 28);

      let lastPhotoBox = null;

      const drawCover = (img, x, y, w, h) => {
        lastPhotoBox = { x, y, w, h };
        if (!img) {
          ctx.fillStyle = "#e2d8ce";
          ctx.fillRect(x, y, w, h);
          return;
        }
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const r = Math.max(w / iw, h / ih);
        const nw = iw * r;
        const nh = ih * r;
        const cx = (w - nw) / 2;
        const cy = (h - nh) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.filter = filterCss;
        ctx.drawImage(img, x + cx, y + cy, nw, nh);
        ctx.restore();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      };

      const isNoir = this.currentStyle === "style_noir_film";
      const sideMargin = isNoir ? 28 : 18;

      if (this.currentFormat === "polaroid_single") {
        const sz = dim.w - 48;
        drawCover(loadedImages[0], 24, 44, sz, sz);
      } else if (this.currentFormat === "grid_3x3") {
        const sz = (dim.w - (sideMargin * 2 + 16)) / 3;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const idx = row * 3 + col;
            const x = sideMargin + col * (sz + 8);
            const y = 44 + row * (sz + 8);
            drawCover(loadedImages[idx % loadedImages.length], x, y, sz, sz);
          }
        }
      } else if (this.currentFormat === "film_grid" || this.currentLayout === "film_grid") {
        const sz = (dim.w - (sideMargin * 2 + 10)) / 2;
        const coords = [
          { x: sideMargin, y: 44 },
          { x: sideMargin + sz + 10, y: 44 },
          { x: sideMargin, y: 54 + sz },
          { x: sideMargin + sz + 10, y: 54 + sz }
        ];
        coords.forEach((pt, i) => drawCover(loadedImages[i % loadedImages.length], pt.x, pt.y, sz, sz));
      } else if (this.currentFormat === "wide_collage" || this.currentLayout === "wide_collage") {
        const topW = (dim.w - (sideMargin * 2 + 10)) / 2;
        const topH = 160;
        drawCover(loadedImages[0], sideMargin, 44, topW, topH);
        drawCover(loadedImages[1], sideMargin + topW + 10, 44, topW, topH);
        drawCover(loadedImages[2], sideMargin, 54 + topH, dim.w - sideMargin * 2, 170);
      } else {
        const pw = dim.w - sideMargin * 2;
        const ph = (dim.h - 120) / count;
        loadedImages.forEach((img, i) => {
          const y = 42 + i * (ph + 10);
          drawCover(img, sideMargin, y, pw, ph);
          if (this.currentStyle === "style_cyan_stars") {
            ctx.fillStyle = "#ffffff";
            ctx.font = "11px sans-serif";
            ctx.fillText("★", 8, y + ph / 2);
            ctx.fillText("★", dim.w - 8, y + ph / 2);
          }
        });
      }

      if (this.dateStampEnabled && lastPhotoBox) {
        ctx.save();
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = "#ff6a00";
        ctx.shadowColor = "rgba(255, 106, 0, 0.8)";
        ctx.shadowBlur = 4;
        ctx.fillText(dateDigital, lastPhotoBox.x + lastPhotoBox.w - 8, lastPhotoBox.y + lastPhotoBox.h - 8);
        ctx.restore();
      }

      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = theme.text;
      ctx.font = `bold 15px ${theme.font}`;
      ctx.fillText(this.caption, dim.w / 2, dim.h - 48);
      ctx.fillStyle = theme.sub;
      ctx.font = "11px sans-serif";
      ctx.fillText(`${this.location}${this.showDate ? ` • ${dateStr}` : ""}`, dim.w / 2, dim.h - 32);
      ctx.font = "9px monospace";
      ctx.fillStyle = theme.sub;
      ctx.fillText("||| | || |||| | ||| | ||", dim.w / 2, dim.h - 18);
      ctx.restore();

      if (this.filmGrainEnabled) {
        ctx.save();
        const imgData = ctx.getImageData(0, 0, dim.w * scale, dim.h * scale);
        const data = imgData.data;
        const grainIntensity = 10;
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * grainIntensity;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
        ctx.restore();
      }

      this.stickers.forEach((s) => {
        const sx = (s.x / 100) * dim.w;
        const sy = (s.y / 100) * dim.h;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate((s.rot * Math.PI) / 180);
        ctx.font = `${Math.round(28 * s.scale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, 0, 0);
        ctx.restore();
      });

      return canvas;
    }

    async exportStrip() {
      this.play("filmMotor");
      this.vibrate([30, 40, 30]);
      const canvas = await this.generateExportCanvas();
      const link = document.createElement("a");
      link.download = "photobooth-strip.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    async shareStrip() {
      const canvas = await this.generateExportCanvas();
      canvas.toBlob(async (blob) => {
        if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], "photobooth-strip.png", { type: "image/png" })] })) {
          try {
            await navigator.share({
              files: [new File([blob], "photobooth-strip.png", { type: "image/png" })],
              title: "Our Love Photo Strip 📸",
              text: "Look at our sweet photobooth strip!"
            });
            return;
          } catch (e) {}
        }
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Our Love Photo Strip 📸",
              text: "Look at our sweet photobooth strip!",
              url: window.location.href
            });
            return;
          } catch (e) {}
        }
        this.exportStrip();
      });
    }
  }

  window.setupPhotobooth = function(data = {}, hero = {}) {
    const config = (data && typeof data === "object") ? data : (window.PHOTOBOOTH_DATA || {});
    activeBooth = new PhotoboothSession(config, hero);
    return activeBooth;
  };

  window.addEventListener("message", (e) => {
    if (!e.data || typeof e.data !== "object" || !activeBooth) return;
    const { type, filter, layout, format, style, caption, location, photos, config } = e.data;
    if (type === "PHOTOBOOTH_START_BURST") activeBooth.startBurst();
    else if (type === "PHOTOBOOTH_TEST_FLASH") {
      activeBooth.play("shutter");
      activeBooth.triggerFlash();
    } else if (type === "PHOTOBOOTH_SET_FILTER" && filter) activeBooth.applyFilter(filter);
    else if (type === "PHOTOBOOTH_SET_FORMAT" && format) activeBooth.setFormat(format);
    else if (type === "PHOTOBOOTH_SET_LAYOUT" && layout) activeBooth.setFormat(layout);
    else if (type === "PHOTOBOOTH_SET_STYLE" && style) activeBooth.setStyle(style);
    else if (type === "PHOTOBOOTH_USE_SAMPLES") activeBooth.useSamplePhotos();
    else if (type === "PHOTOBOOTH_SHUFFLE_PHOTOS") activeBooth.shufflePhotos();
    else if (type === "PHOTOBOOTH_EXPORT") activeBooth.exportStrip();
    else if (type === "PHOTOBOOTH_RESET_LOBBY") activeBooth.backToLobby();
    else if (type === "PHOTOBOOTH_SET_PHOTOS" && Array.isArray(photos)) {
      activeBooth.capturedPhotos = [...photos];
      activeBooth.renderStrip();
    } else if (type === "PHOTOBOOTH_SET_CAPTION") {
      if (caption) activeBooth.caption = caption;
      if (location) activeBooth.location = location;
      activeBooth.renderStrip();
    } else if (type === "PHOTOBOOTH_UPDATE_CONFIG" && config) {
      Object.assign(activeBooth, config);
      if (config.defaultFormat) activeBooth.setFormat(config.defaultFormat);
      if (config.defaultStyle) activeBooth.setStyle(config.defaultStyle);
      if (config.defaultFilter) activeBooth.applyFilter(config.defaultFilter);
      activeBooth.renderStrip();
    }
  });

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("section-photobooth") || document.querySelector(".photobooth-section")) {
          window.setupPhotobooth();
        }
      });
    } else {
      if (document.getElementById("section-photobooth") || document.querySelector(".photobooth-section")) {
        window.setupPhotobooth();
      }
    }
  }
})();
