(function() {
  const AudioEngine = {
    ctx: null,
    getCtx() {
      if (!this.ctx && typeof window !== "undefined") {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) this.ctx = new AC();
        } catch (e) {}
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

  if (typeof window !== "undefined") {
    const unlockAudio = () => {
      AudioEngine.getCtx();
      window.removeEventListener("touchstart", unlockAudio, true);
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("click", unlockAudio, true);
    };
    window.addEventListener("touchstart", unlockAudio, { capture: true, once: true, passive: true });
    window.addEventListener("pointerdown", unlockAudio, { capture: true, once: true, passive: true });
    window.addEventListener("click", unlockAudio, { capture: true, once: true, passive: true });
  }

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

  const WHOLE_FRAME_OVERLAYS = [
    { id: "none", name: "Clean", icon: "◻️" },
    { id: "lace", name: "Lace & Hearts", icon: "🤍" },
    { id: "film35", name: "35mm Kodak", icon: "🎞️" },
    { id: "botanical", name: "Gold Leaf", icon: "🌿" },
    { id: "airmail", name: "Airmail Post", icon: "✈️" },
    { id: "y2k_wings", name: "Y2K Sparkle", icon: "🪽" },
    { id: "editorial", name: "Gazette", icon: "📰" },
    { id: "celestial", name: "Celestial", icon: "🌙" }
  ];

  const DECO_ITEMS = {
    stamps: [
      { id: "wax_seal_heart", type: "stamp", label: "Wax Seal", icon: "🔴", text: "♡" },
      { id: "postmark_paris", type: "stamp", label: "Paris Postmark", icon: "📮", text: "PARIS" },
      { id: "stamp_airmail", type: "stamp", label: "Airmail Stamp", icon: "📬", text: "PAR AVION" },
      { id: "stamp_certified", type: "stamp", label: "Certified Love", icon: "💮", text: "100% LOVE" },
      { id: "stamp_photomaton", type: "stamp", label: "Photomaton", icon: "🏷️", text: "PARIS '26" }
    ],
    washi: [
      { id: "washi_rose", type: "washi", label: "Rose Gold", icon: "✨" },
      { id: "washi_gingham", type: "washi", label: "Gingham", icon: "🌸" },
      { id: "washi_kraft", type: "washi", label: "Kraft Paper", icon: "📜" },
      { id: "washi_corners", type: "washi", label: "Brass Corners", icon: "📐" }
    ],
    stickers: [
      { id: "stk_heart_sparkle", type: "emoji", val: "💖" },
      { id: "stk_heart_hands", type: "emoji", val: "🫶" },
      { id: "stk_kiss", type: "emoji", val: "💋" },
      { id: "stk_bow", type: "emoji", val: "🎀" },
      { id: "stk_sparkles", type: "emoji", val: "✨" },
      { id: "stk_cherry_blossom", type: "emoji", val: "🌸" },
      { id: "stk_cherries", type: "emoji", val: "🍒" },
      { id: "stk_love_letter", type: "emoji", val: "💌" },
      { id: "stk_teddy", type: "emoji", val: "🧸" },
      { id: "stk_ring", type: "emoji", val: "💍" },
      { id: "stk_crown", type: "emoji", val: "👑" },
      { id: "stk_cheers", type: "emoji", val: "🥂" },
      { id: "stk_rose", type: "emoji", val: "🌹" },
      { id: "stk_dove", type: "emoji", val: "🕊️" },
      { id: "stk_film_frames", type: "emoji", val: "🎞️" },
      { id: "stk_gold_star", type: "emoji", val: "⭐" },
      { id: "stk_croissant", type: "emoji", val: "🥐" },
      { id: "stk_bouquet", type: "emoji", val: "💐" },
      { id: "stk_cupcake", type: "emoji", val: "🧁" },
      { id: "stk_strawberry", type: "emoji", val: "🍓" }
    ]
  };

  const STICKERS = DECO_ITEMS.stickers.map(s => s.val);

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

  class LdrManager {
    constructor(session) {
      this.session = session;
      this.ws = null;
      this.eventSource = null;
      this.useHttp = false;
      this.roomCode = null;
      this.role = null;
      this.participantId = "p_" + Math.random().toString(36).slice(2, 9);
      this.pc = null;
      this.localStream = null;
      this.lastCursorSend = 0;
      this.wsAttempts = 0;
    }

    connect(code) {
      this.manualDisconnect = false;
      this.roomCode = (code || "").toUpperCase();
      const disp = document.getElementById("ldrRoomCodeDisplay");
      if (disp) disp.textContent = this.roomCode;

      if (this.useHttp) {
        this.startHttpTransport();
        return;
      }

      if (this.ws) {
        try { this.ws.close(); } catch (e) {}
        this.ws = null;
      }

      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host || "localhost:4000";
      const wsUrl = `${proto}//${host}/photobooth-ws`;

      let wsConnected = false;
      const wsFallbackTimeout = setTimeout(() => {
        if (!wsConnected && !this.manualDisconnect) {
          console.warn("⚠️ Photobooth: WebSocket handshake timeout. Falling back to HTTP SSE transport.");
          this.startHttpTransport();
        }
      }, 3500);

      try {
        this.ws = new WebSocket(wsUrl);
      } catch (err) {
        console.warn("Photobooth WS connect failed:", err);
        clearTimeout(wsFallbackTimeout);
        this.startHttpTransport();
        return;
      }

      this.ws.onopen = () => {
        wsConnected = true;
        clearTimeout(wsFallbackTimeout);
        this.wsAttempts = 0;
        this.send("JOIN_ROOM", {
          roomCode: this.roomCode,
          payload: { name: this.session.p1 || "Partner 1" }
        });
      };

      this.ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          this.handleMessage(msg);
        } catch (e) {}
      };

      this.ws.onerror = () => {
        if (!wsConnected && !this.manualDisconnect) {
          clearTimeout(wsFallbackTimeout);
          this.startHttpTransport();
        }
      };

      this.ws.onclose = () => {
        clearTimeout(wsFallbackTimeout);
        if (!wsConnected && !this.manualDisconnect) {
          this.startHttpTransport();
          return;
        }
        const badge = document.getElementById("ldrPartnerStatusText");
        if (badge) badge.textContent = "Reconnecting to room...";
        const dot = document.getElementById("ldrPulseDot");
        if (dot) dot.className = "status-pulse-dot waiting";
        if (this.roomCode && !this.manualDisconnect) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            if (this.roomCode && !this.manualDisconnect) {
              if (++this.wsAttempts >= 2) {
                this.startHttpTransport();
              } else {
                this.connect(this.roomCode);
              }
            }
          }, 2000);
        }
      };
    }

    startHttpTransport() {
      this.useHttp = true;
      if (this.ws) {
        try { this.ws.close(); } catch (e) {}
        this.ws = null;
      }
      if (this.eventSource) {
        try { this.eventSource.close(); } catch (e) {}
        this.eventSource = null;
      }

      const sseUrl = `/api/photobooth/rooms/${encodeURIComponent(this.roomCode)}/events?id=${encodeURIComponent(this.participantId)}&name=${encodeURIComponent(this.session.p1 || "Partner")}`;
      try {
        this.eventSource = new EventSource(sseUrl);
      } catch (err) {
        console.warn("Photobooth SSE connect failed:", err);
        return;
      }

      this.eventSource.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          this.handleMessage(msg);
        } catch (e) {}
      };

      this.eventSource.onerror = () => {
        const badge = document.getElementById("ldrPartnerStatusText");
        if (badge && !this.role) badge.textContent = "Reconnecting to room...";
        const dot = document.getElementById("ldrPulseDot");
        if (dot && !this.role) dot.className = "status-pulse-dot waiting";
      };
    }

    disconnect() {
      this.manualDisconnect = true;
      clearTimeout(this.reconnectTimer);
      if (this.pc) {
        try { this.pc.close(); } catch (e) {}
        this.pc = null;
      }
      if (this.ws) {
        try { this.ws.close(); } catch (e) {}
        this.ws = null;
      }
      if (this.eventSource) {
        try { this.eventSource.close(); } catch (e) {}
        this.eventSource = null;
      }
    }

    send(type, payload = {}) {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type, roomCode: this.roomCode, payload }));
      } else if (this.useHttp && this.roomCode) {
        fetch(`/api/photobooth/rooms/${encodeURIComponent(this.roomCode)}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            payload,
            senderId: this.participantId,
            senderName: this.session.p1 || "Partner"
          })
        }).catch(err => console.warn("LDR HTTP POST failed:", err));
      }
    }

    sendCursor(x, y) {
      const now = Date.now();
      if (now - this.lastCursorSend < 40) return;
      this.lastCursorSend = now;
      this.send("CURSOR_MOVE", { x, y });
    }

    sendAction(action, field, value) {
      this.send("ACTION_CLICK", { action, field, value });
    }

    handleMessage(msg) {
      const { type, state, partner, role } = msg;

      if (type === "ROOM_JOINED") {
        this.role = role;
        if (msg.participantId) this.participantId = msg.participantId;
        if (state) {
          if (state.format) this.session.setFormat(state.format, true);
          if (state.style) this.session.setStyle(state.style, true);
          if (state.filter) this.session.applyFilter(state.filter, true);
          if (state.caption) this.session.updatePhraseDisplays(state.caption, true);
          if (state.strokes) {
            this.session.paintStrokes = [...state.strokes];
            this.session.redrawPaintCanvas();
          }
        }
        const syncBadge = document.getElementById("ldrSyncBadge");
        if (syncBadge) syncBadge.style.display = "inline-flex";
        const badge = document.getElementById("ldrPartnerStatusText");
        const dot = document.getElementById("ldrPulseDot");
        if (msg.participantCount >= 2) {
          if (badge) badge.textContent = "Partner connected 💕";
          if (dot) dot.className = "status-pulse-dot connected";
        } else {
          if (badge) badge.textContent = "Waiting for partner...";
          if (dot) dot.className = "status-pulse-dot waiting";
        }
        return;
      }

      if (type === "PARTNER_JOINED") {
        const badge = document.getElementById("ldrPartnerStatusText");
        if (badge) badge.textContent = `${partner?.name || "Partner"} connected 💕`;
        const dot = document.getElementById("ldrPulseDot");
        if (dot) dot.className = "status-pulse-dot connected";

        if (this.localStream) {
          this.setupWebRTC(this.localStream);
        }
        return;
      }

      if (type === "PARTNER_LEFT") {
        const badge = document.getElementById("ldrPartnerStatusText");
        if (badge) badge.textContent = "Partner disconnected";
        const dot = document.getElementById("ldrPulseDot");
        if (dot) dot.className = "status-pulse-dot waiting";
        const remoteVideo = document.getElementById("photoboothVideoRemote");
        if (remoteVideo) remoteVideo.srcObject = null;
        const placeholder = document.getElementById("remoteVideoPlaceholder");
        if (placeholder) placeholder.style.display = "flex";
        return;
      }

      if (type === "REMOTE_CURSOR") {
        const cursor = document.getElementById("photoboothRemoteCursor");
        if (cursor) {
          cursor.style.display = "flex";
          cursor.style.left = `${msg.x * 100}%`;
          cursor.style.top = `${msg.y * 100}%`;
        }
        const tag = document.getElementById("remoteCursorTag");
        if (tag && msg.senderName) tag.textContent = msg.senderName;
        return;
      }

      if (type === "ACTION_APPLIED") {
        const { action, value } = msg;
        const ripple = document.getElementById("remoteClickRipple");
        if (ripple) {
          ripple.classList.remove("rippling");
          void ripple.offsetWidth;
          ripple.classList.add("rippling");
        }
        if (action === "SET_FORMAT" && value) this.session.setFormat(value, true);
        else if (action === "SET_STYLE" && value) this.session.setStyle(value, true);
        else if (action === "SET_FILTER" && value) this.session.applyFilter(value, true);
        else if (action === "SET_CAPTION" && value) this.session.updatePhraseDisplays(value, true);
        return;
      }

      if (type === "BURST_START_SYNC") {
        this.session.runBurstSequence(msg.shotCount);
        return;
      }

      if (type === "WEBRTC_SIGNAL") {
        this.handleWebRtcSignal(msg.signal);
        return;
      }

      if (type === "PHOTO_SELECTION_UPDATED") {
        this.session.selectedCandidateIndices = [...(msg.selectedIndices || [])];
        this.session.renderCandidateCards();
        return;
      }

      if (type === "RETRY_BURST_APPROVED") {
        this.session.retryCount = msg.retryCount;
        this.session.updateRetryBudgetUi();
        if (this.session.selectionTray) this.session.selectionTray.style.display = "none";
        this.session.openCamera();
        this.session.runBurstSequence(this.session.getShotCount());
        return;
      }

      if (type === "REMOTE_PAINT_STROKE") {
        if (msg.stroke) {
          this.session.paintStrokes.push(msg.stroke);
          this.session.drawStrokeOnCanvas(msg.stroke);
        }
        return;
      }

      if (type === "PAINT_CLEARED") {
        this.session.paintStrokes = [];
        this.session.clearPaintCanvas();
        return;
      }

      if (type === "PAINT_STATE_RESET") {
        this.session.paintStrokes = [...(msg.strokes || [])];
        this.session.redrawPaintCanvas();
        return;
      }
    }

    async setupWebRTC(stream) {
      this.localStream = stream;
      if (typeof RTCPeerConnection === "undefined") return;

      if (this.pc) {
        try { this.pc.close(); } catch (e) {}
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      this.pc = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (evt) => {
        const remoteVideo = document.getElementById("photoboothVideoRemote");
        const placeholder = document.getElementById("remoteVideoPlaceholder");
        if (remoteVideo && evt.streams[0]) {
          remoteVideo.srcObject = evt.streams[0];
          remoteVideo.play().catch(() => {});
          if (placeholder) placeholder.style.display = "none";
        }
      };

      pc.onicecandidate = (evt) => {
        if (evt.candidate) {
          this.send("WEBRTC_SIGNAL", { signal: { candidate: evt.candidate } });
        }
      };

      if (this.role === "host") {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          this.send("WEBRTC_SIGNAL", { signal: { sdp: pc.localDescription } });
        } catch (err) {
          console.warn("WebRTC Offer failed:", err);
        }
      }
    }

    async handleWebRtcSignal(signal) {
      if (!signal || !this.pc) return;
      try {
        if (signal.sdp) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          if (signal.sdp.type === "offer") {
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);
            this.send("WEBRTC_SIGNAL", { signal: { sdp: this.pc.localDescription } });
          }
        } else if (signal.candidate) {
          await this.pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn("WebRTC Signal error:", err);
      }
    }
  }

  class PhotoboothSession {
    constructor(config = {}, heroData = {}) {
      this.config = { ...config };
      this.hero = { ...heroData };
      const appEl = (typeof document !== "undefined") ? document.querySelector(".photobooth-apparatus") : null;
      const ds = appEl ? appEl.dataset : {};

      this.p1 = this.config.partner1 || this.hero.partner1 || "Alex";
      this.p2 = this.config.partner2 || this.hero.partner2 || "Sam";
      this.caption = this.config.stripCaption || ds.stripCaption || `${this.p1} & ${this.p2} ♡ Forever`;
      this.location = this.config.stripLocation || ds.stripLocation || "PARIS • 2026";
      this.sfxEnabled = this.config.sfxEnabled !== false;
      this.hapticsEnabled = this.config.hapticsEnabled !== false;
      this.showDate = this.config.showDate !== false;

      this.currentFilter = this.config.defaultFilter || ds.defaultFilter || "vintage_90s";
      this.currentFormat = this.config.defaultFormat || ds.defaultFormat || ds.defaultLayout || "classic_3cut";
      this.currentLayout = this.config.defaultLayout || ds.defaultLayout || this.currentFormat;
      this.currentStyle = this.config.defaultStyle || ds.defaultStyle || "style_cyan_stars";
      this.currentOverlay = this.config.defaultOverlay || "none";
      this.currentDecoTab = "frames";
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

      // LDR & Selection & Paint State
      this.isLdrMode = false;
      this.ldrManager = null;
      this.candidatePhotos = [];
      this.selectedCandidateIndices = [];
      this.retryBudget = 1;
      this.retryCount = 0;
      this.paintStrokes = [];
      this.paintColor = "#ff2d55";
      this.paintSize = 6;
      this.isPainting = false;

      this.sectionEl = document.getElementById("section-photobooth") || document.querySelector(".photobooth-section");
      this.videoEl = document.getElementById("photoboothVideo");
      this.videoLocalEl = document.getElementById("photoboothVideoLocal");
      this.videoRemoteEl = document.getElementById("photoboothVideoRemote");
      this.viewfinderSplitScreen = document.getElementById("viewfinderSplitScreen");
      this.remoteCursorEl = document.getElementById("photoboothRemoteCursor");
      this.remoteCursorTag = document.getElementById("remoteCursorTag");
      this.remoteClickRipple = document.getElementById("remoteClickRipple");
      this.boothLdrPanel = document.getElementById("boothLdrPanel");
      this.btnModeSolo = document.getElementById("btnModeSolo");
      this.btnModeLdr = document.getElementById("btnModeLdr");
      this.selectionTray = document.getElementById("photoboothSelectionTray");
      this.selectionCandidatesGrid = document.getElementById("selectionCandidatesGrid");
      this.btnConfirmSelection = document.getElementById("btnConfirmSelection");
      this.btnRetryExtraSet = document.getElementById("btnRetryExtraSet");
      this.retryBudgetBadge = document.getElementById("retryBudgetBadge");
      this.selectionTargetCount = document.getElementById("selectionTargetCount");
      this.paintCanvas = document.getElementById("photoboothPaintCanvas");
      this.boothPaintPalette = document.getElementById("boothPaintPalette");
      this.boothStickerPalette = document.getElementById("boothStickerPalette");

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
      this.setFormat(this.currentFormat);
      this.initPaintEngine();

      if (typeof window !== "undefined" && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("booth_room")) {
          this.switchMode("ldr", urlParams.get("booth_room"));
        }
      }
    }

    switchMode(mode, customCode = null) {
      if (mode === "ldr") {
        this.isLdrMode = true;
        this.btnModeSolo?.classList.remove("active");
        this.btnModeLdr?.classList.add("active");
        if (this.boothLdrPanel) this.boothLdrPanel.style.display = "block";
        if (!this.ldrManager) {
          this.ldrManager = new LdrManager(this);
        }
        const code = customCode || this.generateRoomCode();
        this.ldrManager.connect(code);
        this.play("beep", 660, 0.05);
      } else {
        this.isLdrMode = false;
        this.btnModeLdr?.classList.remove("active");
        this.btnModeSolo?.classList.add("active");
        if (this.boothLdrPanel) this.boothLdrPanel.style.display = "none";
        if (this.remoteCursorEl) this.remoteCursorEl.style.display = "none";
        if (this.ldrManager) {
          this.ldrManager.disconnect();
          this.ldrManager = null;
        }
        this.play("beep", 440, 0.05);
      }
    }

    generateRoomCode() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    copyInviteLink() {
      if (!this.ldrManager || !this.ldrManager.roomCode) return;
      const url = `${window.location.origin}${window.location.pathname}?booth_room=${this.ldrManager.roomCode}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          const btn = document.getElementById("btnCopyInviteLink");
          if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = "<span>✅ Link Copied!</span>";
            setTimeout(() => { btn.innerHTML = orig; }, 2000);
          }
        }).catch(() => {});
      }
      this.play("beep", 880, 0.05);
    }

    generateNewRoom() {
      if (this.ldrManager) {
        const newCode = this.generateRoomCode();
        this.ldrManager.connect(newCode);
        this.play("beep", 520, 0.05);
      }
    }

    bindControls() {
      this.btnModeSolo?.addEventListener("click", () => this.switchMode("solo"));
      this.btnModeLdr?.addEventListener("click", () => this.switchMode("ldr"));
      document.getElementById("btnCopyInviteLink")?.addEventListener("click", () => this.copyInviteLink());
      document.getElementById("btnNewRoomCode")?.addEventListener("click", () => this.generateNewRoom());

      const appEl = document.querySelector(".photobooth-apparatus");
      appEl?.addEventListener("pointermove", (e) => {
        if (!this.isLdrMode || !this.ldrManager) return;
        const rect = appEl.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        this.ldrManager.sendCursor(Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y)));
      });

      this.btnRetryExtraSet?.addEventListener("click", () => this.requestRetryExtraSet());
      this.btnConfirmSelection?.addEventListener("click", () => this.confirmPhotoSelection());

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
      document.getElementById("btnReviewRetakeTop")?.addEventListener("click", () => this.retake());
      document.getElementById("btnReviewBackToLobby")?.addEventListener("click", () => this.backToLobby());
      document.getElementById("btnReviewBackLobbyBottom")?.addEventListener("click", () => this.backToLobby());
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
        if (this.videoLocalEl) this.videoLocalEl.classList.toggle("booth-no-mirror", !this.isMirror);
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

      const phraseInput = document.getElementById("boothPhraseInput");
      phraseInput?.addEventListener("input", (e) => this.updatePhraseDisplays(e.target.value));
      document.querySelectorAll(".phrase-preset-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const phrase = btn.dataset.phrase;
          if (phrase) this.updatePhraseDisplays(phrase);
          this.play("beep", 660, 0.04);
          this.vibrate(15);
        });
      });

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

      document.getElementById("btnClearDeco")?.addEventListener("click", () => this.clearDeco());

      document.querySelectorAll(".deco-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".deco-tab-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.currentDecoTab = btn.dataset.tab;
          const stripOuter = document.getElementById("photoboothStripOuter");
          if (this.currentDecoTab === "paint") {
            if (this.boothPaintPalette) this.boothPaintPalette.style.display = "flex";
            if (this.boothStickerPalette) this.boothStickerPalette.style.display = "none";
            if (stripOuter) stripOuter.classList.add("paint-mode-active");
            this.resizePaintCanvas();
          } else {
            if (this.boothPaintPalette) this.boothPaintPalette.style.display = "none";
            if (this.boothStickerPalette) this.boothStickerPalette.style.display = "flex";
            if (stripOuter) stripOuter.classList.remove("paint-mode-active");
            this.renderStickerPalette();
          }
          this.play("beep", 550, 0.04);
          this.vibrate(15);
        });
      });

      document.addEventListener("pointerdown", (e) => {
        if (!e.target.closest(".photobooth-deco-sticker") && !e.target.closest(".photobooth-sticker-tray") && !e.target.closest(".photobooth-deco-tabs") && !e.target.closest(".photobooth-paint-palette")) {
          if (this.selectedStickerId) {
            this.selectedStickerId = null;
            this.renderStickers();
          }
        }
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
        if (this.isLdrMode) {
          if (this.viewfinderSplitScreen) this.viewfinderSplitScreen.style.display = "grid";
          if (this.videoEl) this.videoEl.style.display = "none";
          if (this.videoLocalEl) {
            this.videoLocalEl.srcObject = stream;
            this.videoLocalEl.classList.toggle("facing-environment", this.facingMode === "environment");
            await this.videoLocalEl.play().catch(() => {});
          }
          if (this.ldrManager) {
            this.ldrManager.setupWebRTC(stream);
          }
        } else {
          if (this.viewfinderSplitScreen) this.viewfinderSplitScreen.style.display = "none";
          if (this.videoEl) {
            this.videoEl.style.display = "block";
            this.videoEl.srcObject = stream;
            this.videoEl.classList.toggle("facing-environment", this.facingMode === "environment");
            await this.videoEl.play();
          }
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
      if (this.videoEl) this.videoEl.srcObject = null;
      if (this.videoLocalEl) this.videoLocalEl.srcObject = null;
      if (this.viewfinderSplitScreen) this.viewfinderSplitScreen.style.display = "none";
      if (this.videoEl) this.videoEl.style.display = "block";
    }

    async switchCamera() {
      this.facingMode = this.facingMode === "user" ? "environment" : "user";
      this.vibrate(20);
      this.play("beep", 660, 0.05);
      await this.startCamera();
    }

    updatePhraseDisplays(text, isRemote = false) {
      if (text != null) this.caption = text;
      const inp = document.getElementById("boothPhraseInput");
      if (inp && inp.value !== this.caption) inp.value = this.caption;
      document.querySelectorAll(".frame-phrase-text").forEach(el => el.textContent = this.caption);
      document.querySelectorAll(".strip-phrase-display").forEach(el => el.textContent = this.caption);
      const stripCap = document.querySelector(".strip-caption-txt");
      if (stripCap) stripCap.textContent = this.caption;
      const stripHdr = document.querySelector(".strip-header-banner span:nth-child(2)");
      if (stripHdr) stripHdr.textContent = this.caption;

      if (this.isLdrMode && !isRemote && this.ldrManager) {
        this.ldrManager.sendAction("SET_CAPTION", "caption", this.caption);
      }
    }

    applyFilter(filterKey, isRemote = false) {
      this.currentFilter = filterKey;
      const css = FILTERS[filterKey]?.css || "none";
      if (this.videoEl) {
        this.videoEl.style.filter = css;
      }
      if (this.videoLocalEl) {
        this.videoLocalEl.style.filter = css;
      }
      if (this.videoRemoteEl) {
        this.videoRemoteEl.style.filter = css;
      }
      if (this.sectionEl) {
        this.sectionEl.dataset.activeFilter = filterKey;
        this.sectionEl.classList.remove(
          "filter-bg-natural",
          "filter-bg-vintage_90s",
          "filter-bg-bw_noir",
          "filter-bg-golden_sunset",
          "filter-bg-dreamy_bloom",
          "filter-bg-cyberpunk"
        );
        this.sectionEl.classList.add(`filter-bg-${filterKey}`);
      }
      document.querySelectorAll("#boothLayoutChips .mini-window img").forEach(img => {
        img.style.filter = css;
      });
      document.querySelectorAll(".filter-chip-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.filter === filterKey);
      });
      this.renderStrip();

      if (this.isLdrMode && !isRemote && this.ldrManager) {
        this.ldrManager.sendAction("SET_FILTER", "filter", filterKey);
      }
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
      const photos = this.capturedPhotos.length ? this.capturedPhotos : DEFAULT_SAMPLES;
      const filterCss = FILTERS[this.currentFilter]?.css || "none";
      const customPhrase = this.caption || "Forever & Always ♡";
      const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));
      const win = (idx) => `<div class="mini-window"><img src="${photos[idx % photos.length]}" alt="" class="mini-window-img" style="filter: ${filterCss};"></div>`;
      const phraseBlock = (pos, txt) => `<div class="frame-phrase-block pos-${pos}"><span class="frame-phrase-text">${esc(txt || customPhrase)}</span></div>`;

      switch (fmt) {
        case "grid_3x3":
          return `<div class="mini-windows-wrap fmt-grid_3x3">${Array(9).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "film_grid":
          return `<div class="mini-windows-wrap fmt-film_grid">${Array(4).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "classic_strip":
          return `<div class="mini-windows-wrap fmt-classic_strip">${Array(4).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "double_6cut":
          return `<div class="mini-windows-wrap fmt-double_6cut">${Array(6).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "double_8cut":
          return `<div class="mini-windows-wrap fmt-double_8cut">${Array(8).fill(0).map((_, i) => win(i)).join("")}</div>${phraseBlock("bottom", customPhrase)}`;
        case "portrait_pair":
          return `<div class="mini-windows-wrap fmt-portrait_pair">${win(0)}${win(1)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "wide_collage":
        case "asym_collage":
          return `<div class="mini-windows-wrap fmt-asym_collage"><div class="mini-window asym-hero"><img src="${photos[0]}" alt="" class="mini-window-img" style="filter: ${filterCss};"></div><div class="mini-window asym-sub"><img src="${photos[1 % photos.length]}" alt="" class="mini-window-img" style="filter: ${filterCss};"></div><div class="mini-window asym-sub"><img src="${photos[2 % photos.length]}" alt="" class="mini-window-img" style="filter: ${filterCss};"></div></div>${phraseBlock("corner", customPhrase)}`;
        case "polaroid_single":
          return `<div class="mini-windows-wrap fmt-polaroid_single">${win(0)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "landscape_hero":
          return `<div class="mini-windows-wrap fmt-landscape_hero">${win(0)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "landscape_2split":
          return `<div class="mini-windows-wrap fmt-landscape_2split">${win(0)}${win(1)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "landscape_toptext":
          return `${phraseBlock("top", customPhrase)}<div class="mini-windows-wrap fmt-landscape_toptext">${win(0)}${win(1)}</div>`;
        case "triptych_3cut":
          return `<div class="mini-windows-wrap fmt-triptych_3cut">${win(0)}${win(1)}${win(2)}</div>${phraseBlock("bottom", customPhrase)}`;
        case "triptych_toptext":
          return `${phraseBlock("top", customPhrase)}<div class="mini-windows-wrap fmt-triptych_toptext">${win(0)}${win(1)}${win(2)}</div>`;
        case "classic_3cut":
        default:
          return `<div class="mini-windows-wrap fmt-classic_3cut">${win(0)}${win(1)}${win(2)}</div>${phraseBlock("bottom", customPhrase)}`;
      }
    }

    setFormat(fmtKey, isRemote = false) {
      this.currentFormat = fmtKey;
      this.currentLayout = fmtKey;

      document.querySelectorAll(".format-pill-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.format === fmtKey);
      });

      const isSquare = fmtKey === "film_grid" || fmtKey === "grid_3x3";
      const chips = document.getElementById("boothLayoutChips");
      if (chips) {
        chips.dataset.format = fmtKey;
        chips.classList.toggle("format-is-square", isSquare);
      }
      document.querySelectorAll(".layout-chip-btn").forEach((btn) => {
        btn.dataset.layout = fmtKey;
      });

      const markup = this.getMiniWindowsHtml(fmtKey);
      document.querySelectorAll("#boothLayoutChips .frame-mini-strip").forEach((strip) => {
        strip.innerHTML = markup;
      });

      this.vibrate(15);
      if (this.capturedPhotos.length) this.renderStrip();

      if (this.isLdrMode && !isRemote && this.ldrManager) {
        this.ldrManager.sendAction("SET_FORMAT", "format", fmtKey);
      }
    }

    setStyle(styleKey, isRemote = false) {
      this.currentStyle = styleKey;
      document.querySelectorAll(".layout-chip-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.style === styleKey);
      });
      this.vibrate(15);
      if (this.capturedPhotos.length) this.renderStrip();

      if (this.isLdrMode && !isRemote && this.ldrManager) {
        this.ldrManager.sendAction("SET_STYLE", "style", styleKey);
      }
    }

    setLayout(layoutKey) {
      this.setFormat(layoutKey);
    }

    getShotCount() {
      const counts = {
        polaroid_single: 1,
        landscape_hero: 1,
        portrait_pair: 2,
        landscape_2split: 2,
        landscape_toptext: 2,
        classic_3cut: 3,
        wide_collage: 3,
        asym_collage: 3,
        triptych_3cut: 3,
        triptych_toptext: 3,
        classic_strip: 4,
        film_grid: 4,
        double_6cut: 6,
        double_8cut: 8,
        grid_3x3: 9
      };
      return counts[this.currentFormat] || counts[this.currentLayout] || 3;
    }

    async startBurst(isRemote = false) {
      if (this.isCapturing) return;

      if (this.isLdrMode && !isRemote && this.ldrManager) {
        this.ldrManager.send("BURST_START_REQ", {
          shotCount: this.getShotCount(),
          timerSeconds: this.countdownSeconds
        });
        return;
      }

      await this.runBurstSequence(this.getShotCount());
    }

    async runBurstSequence(totalShots) {
      if (this.isCapturing) return;
      this.isCapturing = true;
      this.capturedPhotos = [];

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
      this.showSelectionTray();
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

      const canvas = this.offscreenCanvas;
      const ctx = canvas.getContext("2d");

      if (this.isLdrMode) {
        const W = 960, H = 720;
        canvas.width = W;
        canvas.height = H;

        // Left Half: Local Partner
        const localVideo = this.videoLocalEl || this.videoEl;
        if (localVideo && localVideo.videoWidth) {
          const vw = localVideo.videoWidth, vh = localVideo.videoHeight;
          const cropW = Math.min(vw, vh * (W / 2) / H);
          const cropH = cropW * H / (W / 2);
          const sx = (vw - cropW) / 2, sy = (vh - cropH) / 2;
          ctx.save();
          if (this.isMirror) {
            ctx.translate(W / 2, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(localVideo, sx, sy, cropW, cropH, 0, 0, W / 2, H);
          } else {
            ctx.drawImage(localVideo, sx, sy, cropW, cropH, 0, 0, W / 2, H);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = "#2c1524";
          ctx.fillRect(0, 0, W / 2, H);
        }

        // Right Half: Remote Partner
        const remoteVideo = this.videoRemoteEl;
        if (remoteVideo && remoteVideo.videoWidth && remoteVideo.srcObject) {
          const rvw = remoteVideo.videoWidth, rvh = remoteVideo.videoHeight;
          const rcropW = Math.min(rvw, rvh * (W / 2) / H);
          const rcropH = rcropW * H / (W / 2);
          const rsx = (rvw - rcropW) / 2, rsy = (rvh - rcropH) / 2;
          ctx.drawImage(remoteVideo, rsx, rsy, rcropW, rcropH, W / 2, 0, W / 2, H);
        } else {
          const grad = ctx.createRadialGradient(3 * W / 4, H / 2, 10, 3 * W / 4, H / 2, 250);
          grad.addColorStop(0, "#4a1c32");
          grad.addColorStop(1, "#150918");
          ctx.fillStyle = grad;
          ctx.fillRect(W / 2, 0, W / 2, H);

          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.font = "bold 32px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("💕", 3 * W / 4, H / 2 - 10);
          ctx.font = "bold 16px sans-serif";
          ctx.fillText(this.p2 || "Partner", 3 * W / 4, H / 2 + 30);
        }

        // Vertical Seam Divider
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(W / 2 - 1, 0, 2, H);

        const shotData = canvas.toDataURL("image/jpeg", 0.92);
        this.candidatePhotos.push(shotData);
        this.capturedPhotos.push(shotData);
      } else {
        const video = this.videoEl;
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

        const shotData = canvas.toDataURL("image/jpeg", 0.92);
        this.candidatePhotos.push(shotData);
        this.capturedPhotos.push(shotData);
      }
    }

    showSelectionTray() {
      const frameSection = document.getElementById("photoboothFrameSection");
      const viewfinder = document.getElementById("photoboothViewfinder");
      const review = document.getElementById("photoboothReviewWorkspace");
      if (viewfinder) viewfinder.style.display = "none";
      if (frameSection) frameSection.style.display = "none";
      if (review) review.style.display = "none";

      const targetCount = this.getShotCount();
      if (this.selectionTargetCount) this.selectionTargetCount.textContent = targetCount;

      if (!this.selectedCandidateIndices.length || this.selectedCandidateIndices.length !== targetCount) {
        this.selectedCandidateIndices = [];
        for (let i = 0; i < Math.min(targetCount, this.candidatePhotos.length); i++) {
          this.selectedCandidateIndices.push(i);
        }
      }

      this.updateRetryBudgetUi();
      this.renderCandidateCards();

      if (this.selectionTray) {
        this.selectionTray.style.display = "flex";
        this.selectionTray.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    updateRetryBudgetUi() {
      const retryBtn = document.getElementById("btnRetryExtraSet");
      const badge = document.getElementById("retryBudgetBadge");
      const retriesRemaining = Math.max(0, this.retryBudget - this.retryCount);

      if (badge) {
        badge.textContent = `${retriesRemaining} Retry Left (${retriesRemaining}/${this.retryBudget})`;
        badge.classList.toggle("exhausted", retriesRemaining === 0);
      }
      if (retryBtn) {
        retryBtn.disabled = (retriesRemaining === 0);
        retryBtn.innerHTML = retriesRemaining > 0
          ? `<span>🔄 Retake Extra Set (${retriesRemaining} try left)</span>`
          : `<span>🚫 No Retries Left</span>`;
      }
    }

    renderCandidateCards() {
      if (!this.selectionCandidatesGrid) return;
      const targetCount = this.getShotCount();

      this.selectionCandidatesGrid.innerHTML = this.candidatePhotos.map((src, idx) => {
        const selPos = this.selectedCandidateIndices.indexOf(idx);
        const isSelected = selPos !== -1;
        const badgeText = isSelected ? String(selPos + 1) : "";
        return `
          <div class="candidate-card ${isSelected ? 'selected' : ''}" data-cand-idx="${idx}" tabindex="0">
            <img src="${src}" alt="Candidate ${idx + 1}">
            <span class="candidate-order-badge">${badgeText}</span>
            <span class="candidate-time-tag">Shot ${idx + 1}</span>
          </div>
        `;
      }).join("");

      this.selectionCandidatesGrid.querySelectorAll(".candidate-card").forEach((card) => {
        card.addEventListener("click", () => {
          const idx = Number(card.dataset.candIdx);
          this.toggleCandidateSelection(idx);
        });
      });

      if (this.btnConfirmSelection) {
        const isReady = (this.selectedCandidateIndices.length === targetCount);
        this.btnConfirmSelection.disabled = !isReady;
      }
    }

    toggleCandidateSelection(idx) {
      const targetCount = this.getShotCount();
      const existingPos = this.selectedCandidateIndices.indexOf(idx);

      if (existingPos !== -1) {
        this.selectedCandidateIndices.splice(existingPos, 1);
      } else {
        if (this.selectedCandidateIndices.length < targetCount) {
          this.selectedCandidateIndices.push(idx);
        } else {
          this.selectedCandidateIndices.shift();
          this.selectedCandidateIndices.push(idx);
        }
      }

      this.play("beep", 520, 0.04);
      this.vibrate(15);
      this.renderCandidateCards();

      if (this.isLdrMode && this.ldrManager) {
        this.ldrManager.send("SYNC_PHOTO_SELECTION", {
          selectedIndices: this.selectedCandidateIndices
        });
      }
    }

    confirmPhotoSelection() {
      const selectedPhotos = this.selectedCandidateIndices.map(i => this.candidatePhotos[i]).filter(Boolean);
      if (selectedPhotos.length) {
        this.capturedPhotos = [...selectedPhotos];
      }
      if (this.selectionTray) this.selectionTray.style.display = "none";
      this.showReview();
    }

    requestRetryExtraSet() {
      if (this.retryCount >= this.retryBudget) return;
      if (this.isLdrMode && this.ldrManager) {
        this.ldrManager.send("REQ_RETRY_BURST");
      } else {
        this.retryCount++;
        this.updateRetryBudgetUi();
        if (this.selectionTray) this.selectionTray.style.display = "none";
        this.openCamera();
        this.runBurstSequence(this.getShotCount());
      }
    }

    useSamplePhotos() {
      const list = (this.config.samplePhotos && this.config.samplePhotos.length) ? this.config.samplePhotos : DEFAULT_SAMPLES;
      this.capturedPhotos = [...list];
      this.candidatePhotos = [...list];
      this.play("filmMotor");
      this.vibrate(30);
      this.stopCamera();
      if (this.selectionTray) this.selectionTray.style.display = "none";
      this.showReview();
    }

    handleFileUpload(e) {
      const files = Array.from(e.target.files || []).slice(0, 4);
      if (!files.length) return;
      this.capturedPhotos = [];
      this.candidatePhotos = [];
      let loaded = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.capturedPhotos.push(evt.target.result);
          this.candidatePhotos.push(evt.target.result);
          loaded++;
          if (loaded === files.length) {
            this.play("filmMotor");
            this.stopCamera();
            if (this.selectionTray) this.selectionTray.style.display = "none";
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
      if (this.selectionTray) this.selectionTray.style.display = "none";
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
      if (this.selectionTray) this.selectionTray.style.display = "none";
      if (frameSection) {
        frameSection.style.display = "block";
        frameSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      this.stopCamera();
      this.play("beep", 440, 0.05);
      this.vibrate(15);
      if (this.capturedPhotos.length) {
        this.setFormat(this.currentFormat);
      }
    }

    showReview() {
      const frameSection = document.getElementById("photoboothFrameSection");
      const viewfinder = document.getElementById("photoboothViewfinder");
      if (viewfinder) viewfinder.style.display = "none";
      if (frameSection) frameSection.style.display = "none";
      if (this.selectionTray) this.selectionTray.style.display = "none";
      if (this.reviewWorkspace) {
        this.reviewWorkspace.style.display = "flex";
        this.reviewWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      this.renderStrip();
      setTimeout(() => this.resizePaintCanvas(), 60);
    }

    retake() {
      if (this.reviewWorkspace) this.reviewWorkspace.style.display = "none";
      if (this.selectionTray) this.selectionTray.style.display = "none";
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
      const isTopText = this.currentFormat === "landscape_toptext" || this.currentFormat === "triptych_toptext";
      const topPhraseHtml = isTopText ? `<div class="strip-phrase-slot pos-top"><span class="strip-phrase-display">${this.caption}</span></div>` : "";
      const botPhraseHtml = !isTopText ? `<div class="strip-phrase-slot pos-bottom"><span class="strip-phrase-display">${this.caption}</span></div>` : "";

      if (this.currentFormat === "film_grid") {
        photosHtml = `<div class="grid-2x2-wrap">${activePhotos.map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}</div>${botPhraseHtml}`;
      } else if (this.currentFormat === "grid_3x3") {
        photosHtml = `<div class="grid-3x3-wrap">${activePhotos.map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}</div>${botPhraseHtml}`;
      } else if (this.currentFormat === "double_6cut") {
        photosHtml = `<div class="grid-double-6-wrap">${activePhotos.map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}</div>${botPhraseHtml}`;
      } else if (this.currentFormat === "double_8cut") {
        photosHtml = `<div class="grid-double-8-wrap">${activePhotos.map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}</div>${botPhraseHtml}`;
      } else if (this.currentFormat === "landscape_2split" || this.currentFormat === "landscape_toptext") {
        photosHtml = `${topPhraseHtml}<div class="landscape-2split-wrap">${activePhotos.slice(0, 2).map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}</div>${botPhraseHtml}`;
      } else if (this.currentFormat === "triptych_3cut" || this.currentFormat === "triptych_toptext") {
        photosHtml = `${topPhraseHtml}<div class="triptych-wrap">${activePhotos.slice(0, 3).map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}</div>${botPhraseHtml}`;
      } else if (this.currentFormat === "wide_collage" || this.currentFormat === "asym_collage") {
        photosHtml = `
          <div class="asym-collage-wrap">
            <div class="strip-photo-card asym-hero-card" data-idx="0" title="Tap to swap photo position">
              <img src="${activePhotos[0] || DEFAULT_SAMPLES[0]}" alt="Photobooth Snap 1" style="filter: ${filterCss};">
              <span class="photo-idx-badge">#1</span>
            </div>
            <div class="asym-sub-col">
              ${activePhotos.slice(1, 3).map((src, i) => `
                <div class="strip-photo-card asym-sub-card" data-idx="${i + 1}" title="Tap to swap photo position">
                  <img src="${src}" alt="Photobooth Snap ${i + 2}" style="filter: ${filterCss};">
                  <span class="photo-idx-badge">#${i + 2}</span>
                </div>
              `).join("")}
            </div>
          </div>
          ${botPhraseHtml}
        `;
      } else if (this.currentFormat === "polaroid_single" || this.currentFormat === "landscape_hero") {
        photosHtml = `
          <div class="strip-photo-card ${this.currentFormat === 'polaroid_single' ? 'polaroid-single-card' : 'landscape-hero-card'}" data-idx="0">
            <img src="${activePhotos[0] || DEFAULT_SAMPLES[0]}" alt="Photobooth Single" style="filter: ${filterCss};">
          </div>
          ${botPhraseHtml}
        `;
      } else {
        photosHtml = `${activePhotos.map((src, i) => `
          <div class="strip-photo-card" data-idx="${i}" title="Tap to swap photo position">
            <img src="${src}" alt="Photobooth Snap ${i + 1}" style="filter: ${filterCss};">
            <span class="photo-idx-badge">#${i + 1}</span>
          </div>
        `).join("")}${botPhraseHtml}`;
      }

      this.stripContainer.className = `photobooth-strip-container strip-layout-${this.currentLayout} strip-format-${this.currentFormat} strip-style-${this.currentStyle}`;
      this.stripContainer.innerHTML = `
        <div class="strip-whole-frame-overlay overlay-${this.currentOverlay || 'none'}" aria-hidden="true"></div>
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

    setFrameOverlay(overlayId) {
      this.currentOverlay = overlayId;
      const overlayEl = this.stripContainer?.querySelector(".strip-whole-frame-overlay");
      if (overlayEl) {
        overlayEl.className = `strip-whole-frame-overlay overlay-${overlayId}`;
      } else {
        this.renderStrip();
      }
      this.renderStickerPalette();
      this.play("beep", 660, 0.05);
      this.vibrate(15);
    }

    clearDeco() {
      this.stickers = [];
      this.selectedStickerId = null;
      this.currentOverlay = "none";
      this.renderStrip();
      this.renderStickerPalette();
      this.play("beep", 400, 0.06);
      this.vibrate(25);
    }

    switchDecoTab(tabName) {
      const btn = document.querySelector(`.deco-tab-btn[data-tab="${tabName}"]`);
      if (btn) btn.click();
    }

    renderStickerPalette() {
      const palette = document.getElementById("boothStickerPalette");
      if (!palette) return;

      if (this.currentDecoTab === "frames") {
        palette.innerHTML = WHOLE_FRAME_OVERLAYS.map((f) => `
          <button type="button" class="sticker-item-btn ${this.currentOverlay === f.id ? 'active-overlay' : ''}" data-overlay="${f.id}" title="${f.name}">
            <span>${f.icon}</span>
            <span class="sticker-item-label">${f.name}</span>
          </button>
        `).join("");

        palette.querySelectorAll(".sticker-item-btn").forEach((btn) => {
          btn.addEventListener("click", () => this.setFrameOverlay(btn.dataset.overlay));
        });
      } else if (this.currentDecoTab === "stamps") {
        palette.innerHTML = DECO_ITEMS.stamps.map((item) => `
          <button type="button" class="sticker-item-btn" data-id="${item.id}" title="${item.label}">
            <span>${item.icon}</span>
            <span class="sticker-item-label">${item.label}</span>
          </button>
        `).join("");

        palette.querySelectorAll(".sticker-item-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const item = DECO_ITEMS.stamps.find(s => s.id === btn.dataset.id);
            if (item) this.addSticker(item);
            this.play("beep", 660, 0.05);
            this.vibrate(15);
          });
        });
      } else if (this.currentDecoTab === "washi") {
        palette.innerHTML = DECO_ITEMS.washi.map((item) => `
          <button type="button" class="sticker-item-btn" data-id="${item.id}" title="${item.label}">
            <span>${item.icon}</span>
            <span class="sticker-item-label">${item.label}</span>
          </button>
        `).join("");

        palette.querySelectorAll(".sticker-item-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const item = DECO_ITEMS.washi.find(w => w.id === btn.dataset.id);
            if (item) this.addSticker(item);
            this.play("beep", 660, 0.05);
            this.vibrate(15);
          });
        });
      } else {
        palette.innerHTML = DECO_ITEMS.stickers.map((item) => `
          <button type="button" class="sticker-item-btn" data-id="${item.id}" data-emoji="${item.val}">${item.val}</button>
        `).join("");

        palette.querySelectorAll(".sticker-item-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const item = DECO_ITEMS.stickers.find(s => s.id === btn.dataset.id) || { type: "emoji", val: btn.dataset.emoji };
            this.addSticker(item);
            this.play("beep", 660, 0.05);
            this.vibrate(15);
          });
        });
      }
    }

    addSticker(item) {
      const id = "stk_" + Math.random().toString(36).slice(2, 9);
      const sticker = {
        id,
        type: item.type || "emoji",
        val: item.val || item.text || item.id,
        itemKey: item.id,
        x: 35 + Math.random() * 30,
        y: 25 + Math.random() * 40,
        scale: 1,
        rot: Math.round((Math.random() - 0.5) * 20)
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
        const isSelected = this.selectedStickerId === s.id;
        el.className = `photobooth-deco-sticker type-${s.type} ${isSelected ? "selected-sticker" : ""}`;
        el.dataset.id = s.id;
        el.style.left = `${s.x}%`;
        el.style.top = `${s.y}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${s.rot}deg) scale(${s.scale})`;

        let contentHtml = "";
        if (s.type === "emoji") {
          contentHtml = `<span style="font-size:32px;">${s.val}</span>`;
        } else if (s.type === "stamp") {
          if (s.itemKey === "wax_seal_heart") {
            contentHtml = `<div class="deco-item-wax">♡</div>`;
          } else if (s.itemKey === "postmark_paris") {
            contentHtml = `<div class="deco-item-postmark"><span>PARIS RP</span><span>14.02.26</span><span>AMOUR</span></div>`;
          } else if (s.itemKey === "stamp_airmail") {
            contentHtml = `<div class="deco-item-airmail_stamp"><span>✈ PAR AVION</span><span>0.70 €</span></div>`;
          } else if (s.itemKey === "stamp_certified") {
            contentHtml = `<div class="deco-item-certified"><span>CERTIFIED</span><span>♡</span><span>100% LOVE</span></div>`;
          } else {
            contentHtml = `<div class="deco-item-photomaton">PHOTO-AUTOMATIQUE PARIS</div>`;
          }
        } else if (s.type === "washi") {
          if (s.itemKey === "washi_rose") {
            contentHtml = `<div class="deco-washi-tape washi-rose"></div>`;
          } else if (s.itemKey === "washi_gingham") {
            contentHtml = `<div class="deco-washi-tape washi-gingham"></div>`;
          } else if (s.itemKey === "washi_kraft") {
            contentHtml = `<div class="deco-washi-tape washi-kraft"></div>`;
          } else {
            contentHtml = `<div class="washi-corners"></div>`;
          }
        }

        let floatingBarHtml = "";
        if (isSelected) {
          floatingBarHtml = `
            <div class="sticker-float-bar">
              <button type="button" class="float-btn float-btn-minus" data-act="minus" title="Smaller">−</button>
              <button type="button" class="float-btn float-btn-plus" data-act="plus" title="Larger">+</button>
              <button type="button" class="float-btn float-btn-rot" data-act="rot" title="Rotate 45°">↻</button>
              <button type="button" class="float-btn float-btn-del" data-act="del" title="Remove">🗑</button>
            </div>
          `;
        }

        el.innerHTML = contentHtml + floatingBarHtml;
        el.addEventListener("pointerdown", (e) => this.onStickerPointerDown(e, s, el));
        layer.appendChild(el);
      });

      layer.querySelectorAll(".float-btn").forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
          const act = btn.dataset.act;
          const s = this.stickers.find(stk => stk.id === this.selectedStickerId);
          if (!s) return;
          if (act === "minus") {
            s.scale = Math.max(0.5, Number((s.scale - 0.15).toFixed(2)));
            this.renderStickers();
            this.play("beep", 400, 0.04);
          } else if (act === "plus") {
            s.scale = Math.min(2.5, Number((s.scale + 0.15).toFixed(2)));
            this.renderStickers();
            this.play("beep", 600, 0.04);
          } else if (act === "rot") {
            s.rot = (s.rot + 45) % 360;
            this.renderStickers();
            this.play("beep", 520, 0.04);
          } else if (act === "del") {
            this.stickers = this.stickers.filter(stk => stk.id !== s.id);
            this.selectedStickerId = null;
            this.renderStickers();
            this.play("beep", 350, 0.05);
          }
          this.vibrate(15);
        });
      });
    }

    onStickerPointerDown(e, sticker, el) {
      if (e.target.closest(".sticker-float-bar")) return;
      e.stopPropagation();

      if (this.selectedStickerId !== sticker.id) {
        this.selectedStickerId = sticker.id;
        this.renderStickers();
        const newEl = document.querySelector(`.photobooth-deco-sticker[data-id="${sticker.id}"]`);
        if (newEl) el = newEl;
      }

      const container = this.stripContainer;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = sticker.x;
      const origY = sticker.y;

      try { el.setPointerCapture(e.pointerId); } catch (err) {}

      const onMove = (ev) => {
        const dx = ((ev.clientX - startX) / rect.width) * 100;
        const dy = ((ev.clientY - startY) / rect.height) * 100;
        sticker.x = Math.max(5, Math.min(95, origX + dx));
        sticker.y = Math.max(5, Math.min(95, origY + dy));
        el.style.left = `${sticker.x}%`;
        el.style.top = `${sticker.y}%`;
      };

      const onUp = (ev) => {
        try { el.releasePointerCapture(ev.pointerId); } catch (err) {}
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
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
        double_6cut: { w: 460, h: 680 },
        double_8cut: { w: 460, h: 860 },
        film_grid: { w: 460, h: 500 },
        grid_3x3: { w: 480, h: 520 },
        portrait_pair: { w: 340, h: 720 },
        wide_collage: { w: 460, h: 480 },
        asym_collage: { w: 460, h: 480 },
        polaroid_single: { w: 340, h: 440 },
        landscape_hero: { w: 520, h: 420 },
        landscape_2split: { w: 540, h: 360 },
        landscape_toptext: { w: 540, h: 360 },
        triptych_3cut: { w: 640, h: 320 },
        triptych_toptext: { w: 640, h: 320 }
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
      } else if (this.currentFormat === "landscape_hero") {
        const pw = dim.w - sideMargin * 2;
        const ph = dim.h - 130;
        drawCover(loadedImages[0], sideMargin, 44, pw, ph);
      } else if (this.currentFormat === "landscape_2split" || this.currentFormat === "landscape_toptext") {
        const gap = 12;
        const pw = (dim.w - sideMargin * 2 - gap) / 2;
        const ph = dim.h - 130;
        const startY = this.currentFormat === "landscape_toptext" ? 56 : 44;
        drawCover(loadedImages[0], sideMargin, startY, pw, ph);
        drawCover(loadedImages[1], sideMargin + pw + gap, startY, pw, ph);
      } else if (this.currentFormat === "triptych_3cut" || this.currentFormat === "triptych_toptext") {
        const gap = 10;
        const pw = (dim.w - sideMargin * 2 - gap * 2) / 3;
        const ph = dim.h - 130;
        const startY = this.currentFormat === "triptych_toptext" ? 56 : 44;
        drawCover(loadedImages[0], sideMargin, startY, pw, ph);
        drawCover(loadedImages[1], sideMargin + pw + gap, startY, pw, ph);
        drawCover(loadedImages[2], sideMargin + (pw + gap) * 2, startY, pw, ph);
      } else if (this.currentFormat === "double_6cut") {
        const gap = 10;
        const colW = (dim.w - sideMargin * 2 - gap) / 2;
        const rowH = (dim.h - 140) / 3;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 2; c++) {
            const idx = r * 2 + c;
            const x = sideMargin + c * (colW + gap);
            const y = 44 + r * (rowH + gap);
            drawCover(loadedImages[idx % loadedImages.length], x, y, colW, rowH);
          }
        }
      } else if (this.currentFormat === "double_8cut") {
        const gap = 10;
        const colW = (dim.w - sideMargin * 2 - gap) / 2;
        const rowH = (dim.h - 140) / 4;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 2; c++) {
            const idx = r * 2 + c;
            const x = sideMargin + c * (colW + gap);
            const y = 44 + r * (rowH + gap);
            drawCover(loadedImages[idx % loadedImages.length], x, y, colW, rowH);
          }
        }
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
        const gap = 10;
        const sz = (dim.w - (sideMargin * 2 + gap)) / 2;
        const coords = [
          { x: sideMargin, y: 44 },
          { x: sideMargin + sz + gap, y: 44 },
          { x: sideMargin, y: 44 + sz + gap },
          { x: sideMargin + sz + gap, y: 44 + sz + gap }
        ];
        coords.forEach((pt, i) => drawCover(loadedImages[i % loadedImages.length], pt.x, pt.y, sz, sz));
      } else if (this.currentFormat === "wide_collage" || this.currentFormat === "asym_collage") {
        const heroW = (dim.w - sideMargin * 2 - 10) * 0.58;
        const subW = (dim.w - sideMargin * 2 - 10) * 0.42;
        const ph = dim.h - 130;
        const subH = (ph - 10) / 2;
        drawCover(loadedImages[0], sideMargin, 44, heroW, ph);
        drawCover(loadedImages[1], sideMargin + heroW + 10, 44, subW, subH);
        drawCover(loadedImages[2], sideMargin + heroW + 10, 44 + subH + 10, subW, subH);
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

      // Draw Whole Frame Overlay on Canvas
      if (this.currentOverlay && this.currentOverlay !== "none") {
        ctx.save();
        if (this.currentOverlay === "lace") {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 10;
          ctx.strokeRect(5, 5, dim.w - 10, dim.h - 10);
          ctx.strokeStyle = "#f3d2dc";
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, dim.w - 20, dim.h - 20);
          ctx.fillStyle = "#ff758c";
          ctx.font = "bold 16px sans-serif";
          ctx.fillText("♡", dim.w - 20, 22);
        } else if (this.currentOverlay === "film35") {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, 14, dim.h);
          ctx.fillRect(dim.w - 14, 0, 14, dim.h);
          ctx.fillStyle = "#ffffff";
          for (let y = 14; y < dim.h - 20; y += 26) {
            ctx.fillRect(2, y, 10, 14);
            ctx.fillRect(dim.w - 12, y, 10, 14);
          }
          ctx.fillStyle = "#ffd166";
          ctx.font = "bold 9px monospace";
          ctx.fillText("KODAK 400 • 35MM", 75, 18);
          ctx.fillStyle = "#ff4757";
          ctx.fillText("▶ 24A", dim.w - 40, dim.h - 10);
        } else if (this.currentOverlay === "botanical") {
          ctx.strokeStyle = "#d4af37";
          ctx.lineWidth = 4;
          ctx.strokeRect(8, 8, dim.w - 16, dim.h - 16);
          ctx.lineWidth = 1;
          ctx.strokeRect(14, 14, dim.w - 28, dim.h - 28);
          ctx.fillStyle = "#d4af37";
          ctx.font = "14px sans-serif";
          ctx.fillText("🌿", 22, 24);
          ctx.fillText("🌿", dim.w - 22, 24);
        } else if (this.currentOverlay === "airmail") {
          const stripeW = 12;
          ctx.save();
          for (let x = 0; x < dim.w; x += stripeW * 2) {
            ctx.fillStyle = "#d32f2f";
            ctx.fillRect(x, 0, stripeW, 10);
            ctx.fillRect(x, dim.h - 10, stripeW, 10);
            ctx.fillStyle = "#1976d2";
            ctx.fillRect(x + stripeW, 0, stripeW, 10);
            ctx.fillRect(x + stripeW, dim.h - 10, stripeW, 10);
          }
          for (let y = 0; y < dim.h; y += stripeW * 2) {
            ctx.fillStyle = "#d32f2f";
            ctx.fillRect(0, y, 10, stripeW);
            ctx.fillRect(dim.w - 10, y, 10, stripeW);
            ctx.fillStyle = "#1976d2";
            ctx.fillRect(0, y + stripeW, 10, stripeW);
            ctx.fillRect(dim.w - 10, y + stripeW, 10, stripeW);
          }
          ctx.restore();
          ctx.fillStyle = "#1976d2";
          ctx.font = "bold 9px monospace";
          ctx.fillText("✈ PAR AVION", dim.w - 50, 22);
        } else if (this.currentOverlay === "y2k_wings") {
          ctx.strokeStyle = "#ff007f";
          ctx.lineWidth = 5;
          ctx.strokeRect(6, 6, dim.w - 12, dim.h - 12);
          ctx.fillStyle = "#ff007f";
          ctx.font = "bold 9px monospace";
          ctx.fillText("✦ Y2K SPARKLE ✦", dim.w / 2, 18);
        } else if (this.currentOverlay === "editorial") {
          ctx.strokeStyle = "#221e20";
          ctx.lineWidth = 3;
          ctx.strokeRect(6, 6, dim.w - 12, dim.h - 12);
          ctx.lineWidth = 1;
          ctx.strokeRect(10, 10, dim.w - 20, dim.h - 20);
          ctx.fillStyle = "#221e20";
          ctx.font = "bold 9px 'Times New Roman', serif";
          ctx.fillText("• LOVE CHRONICLE SPECIAL •", dim.w / 2, 20);
        } else if (this.currentOverlay === "celestial") {
          ctx.strokeStyle = "#f9d776";
          ctx.lineWidth = 3;
          ctx.strokeRect(6, 6, dim.w - 12, dim.h - 12);
          ctx.fillStyle = "#f9d776";
          ctx.font = "11px sans-serif";
          ctx.fillText("☾ ✦ ★", 30, 20);
        }
        ctx.restore();
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
        ctx.scale(s.scale, s.scale);

        if (s.type === "emoji" || !s.type) {
          ctx.font = `28px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(s.val || s.emoji, 0, 0);
        } else if (s.type === "stamp") {
          if (s.itemKey === "wax_seal_heart") {
            ctx.fillStyle = "#9b111e";
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#e63946";
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("♡", 0, 0);
          } else if (s.itemKey === "postmark_paris") {
            ctx.strokeStyle = "#b71c1c";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(0, 0, 26, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#b71c1c";
            ctx.font = "bold 7px monospace";
            ctx.textAlign = "center";
            ctx.fillText("PARIS RP", 0, -8);
            ctx.fillText("14.02.26", 0, 2);
            ctx.fillText("AMOUR", 0, 12);
          } else if (s.itemKey === "stamp_airmail") {
            ctx.fillStyle = "#0077b6";
            ctx.fillRect(-26, -18, 52, 36);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(-24, -16, 48, 32);
            ctx.setLineDash([]);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 7px monospace";
            ctx.textAlign = "center";
            ctx.fillText("✈ PAR AVION", 0, -2);
            ctx.fillText("0.70 €", 0, 9);
          } else if (s.itemKey === "stamp_certified") {
            ctx.fillStyle = "#d4af37";
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffd166";
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#4a3500";
            ctx.font = "bold 7px monospace";
            ctx.textAlign = "center";
            ctx.fillText("CERTIFIED", 0, -6);
            ctx.fillText("♡ LOVE", 0, 6);
          } else {
            ctx.fillStyle = "#111111";
            ctx.fillRect(-35, -12, 70, 24);
            ctx.fillStyle = "#eeeeee";
            ctx.font = "bold 7px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("PHOTOMATON", 0, 0);
          }
        } else if (s.type === "washi") {
          if (s.itemKey === "washi_rose") {
            ctx.fillStyle = "rgba(255, 182, 193, 0.85)";
            ctx.fillRect(-40, -10, 80, 20);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            ctx.strokeRect(-40, -10, 80, 20);
          } else if (s.itemKey === "washi_gingham") {
            ctx.fillStyle = "rgba(255, 105, 180, 0.7)";
            ctx.fillRect(-40, -10, 80, 20);
          } else if (s.itemKey === "washi_kraft") {
            ctx.fillStyle = "#c5a059";
            ctx.fillRect(-40, -10, 80, 20);
          } else {
            ctx.fillStyle = "#d4af37";
            ctx.beginPath();
            ctx.moveTo(-15, -15);
            ctx.lineTo(15, -15);
            ctx.lineTo(-15, 15);
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.restore();
      });

      // Render Paint Strokes onto High-Res Final Strip
      if (this.paintStrokes && this.paintStrokes.length > 0) {
        this.paintStrokes.forEach((stroke) => {
          if (!stroke || !stroke.points || stroke.points.length === 0) return;
          const scale = totalW / 360;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size * scale;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x * totalW, stroke.points[0].y * totalH);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x * totalW, stroke.points[i].y * totalH);
          }
          ctx.stroke();
        });
      }

      return canvas;
    }

    initPaintEngine() {
      this.paintCanvas = document.getElementById("photoboothPaintCanvas");
      if (!this.paintCanvas) return;

      document.querySelectorAll(".color-swatch-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".color-swatch-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.paintColor = btn.dataset.color || "#ff2d55";
          this.play("beep", 600, 0.03);
        });
      });

      document.querySelectorAll(".size-chip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".size-chip-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.paintSize = Number(btn.dataset.size) || 6;
          this.play("beep", 500, 0.03);
        });
      });

      document.getElementById("btnPaintUndo")?.addEventListener("click", () => this.undoPaintStroke());
      document.getElementById("btnPaintClear")?.addEventListener("click", () => this.clearPaintCanvas());

      let currentStroke = null;

      const getCanvasCoords = (e) => {
        const rect = this.paintCanvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return { x: 0, y: 0 };
        const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
        const clientX = touch ? touch.clientX : e.clientX;
        const clientY = touch ? touch.clientY : e.clientY;
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
      };

      const onStart = (e) => {
        if (this.currentDecoTab !== "paint") return;
        if (e.cancelable) e.preventDefault();
        this.isPainting = true;
        if (e.pointerId) this.paintCanvas.setPointerCapture?.(e.pointerId);
        const p = getCanvasCoords(e);
        currentStroke = {
          color: this.paintColor,
          size: this.paintSize,
          points: [p]
        };
        this.drawStrokePoint(p, this.paintColor, this.paintSize);
      };

      const onMove = (e) => {
        if (!this.isPainting || !currentStroke) return;
        if (e.cancelable) e.preventDefault();
        const p = getCanvasCoords(e);
        const prev = currentStroke.points[currentStroke.points.length - 1];
        currentStroke.points.push(p);
        this.drawStrokeLine(prev, p, this.paintColor, this.paintSize);
      };

      const onEnd = () => {
        if (!this.isPainting || !currentStroke) return;
        this.isPainting = false;
        if (currentStroke.points.length > 0) {
          this.paintStrokes.push(currentStroke);
          if (this.isLdrMode && this.ldrManager) {
            this.ldrManager.send("PAINT_STROKE", { stroke: currentStroke });
          }
        }
        currentStroke = null;
      };

      this.paintCanvas.addEventListener("pointerdown", onStart);
      this.paintCanvas.addEventListener("pointermove", onMove);
      this.paintCanvas.addEventListener("pointerup", onEnd);
      this.paintCanvas.addEventListener("pointercancel", onEnd);

      this.paintCanvas.addEventListener("touchstart", onStart, { passive: false });
      this.paintCanvas.addEventListener("touchmove", onMove, { passive: false });
      this.paintCanvas.addEventListener("touchend", onEnd, { passive: false });
      this.paintCanvas.addEventListener("touchcancel", onEnd, { passive: false });

      window.addEventListener("resize", () => this.resizePaintCanvas());
      window.addEventListener("orientationchange", () => setTimeout(() => this.resizePaintCanvas(), 100));
    }

    resizePaintCanvas() {
      if (!this.paintCanvas) return;
      const container = document.getElementById("photoboothStripOuter") || document.getElementById("photoboothStripContainer");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.paintCanvas.width = Math.floor(rect.width * dpr);
      this.paintCanvas.height = Math.floor(rect.height * dpr);
      this.paintCanvas.style.width = `${rect.width}px`;
      this.paintCanvas.style.height = `${rect.height}px`;

      this.redrawPaintCanvas();
    }

    drawStrokePoint(p, color, size) {
      if (!this.paintCanvas) return;
      const ctx = this.paintCanvas.getContext("2d");
      const w = this.paintCanvas.width, h = this.paintCanvas.height;
      const scale = w / 360;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, (size * scale) / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    drawStrokeLine(p1, p2, color, size) {
      if (!this.paintCanvas) return;
      const ctx = this.paintCanvas.getContext("2d");
      const w = this.paintCanvas.width, h = this.paintCanvas.height;
      const scale = w / 360;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(p1.x * w, p1.y * h);
      ctx.lineTo(p2.x * w, p2.y * h);
      ctx.stroke();
    }

    drawStrokeOnCanvas(stroke) {
      if (!this.paintCanvas || !stroke || !stroke.points || stroke.points.length === 0) return;
      const ctx = this.paintCanvas.getContext("2d");
      const w = this.paintCanvas.width, h = this.paintCanvas.height;
      const scale = w / 360;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
      }
      ctx.stroke();
    }

    redrawPaintCanvas() {
      if (!this.paintCanvas) return;
      const ctx = this.paintCanvas.getContext("2d");
      ctx.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
      this.paintStrokes.forEach(s => this.drawStrokeOnCanvas(s));
    }

    undoPaintStroke() {
      this.paintStrokes.pop();
      this.redrawPaintCanvas();
      this.play("beep", 400, 0.04);
      if (this.isLdrMode && this.ldrManager) {
        this.ldrManager.send("PAINT_UNDO");
      }
    }

    clearPaintCanvas() {
      this.paintStrokes = [];
      this.redrawPaintCanvas();
      this.play("beep", 320, 0.06);
      if (this.isLdrMode && this.ldrManager) {
        this.ldrManager.send("PAINT_CLEAR");
      }
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
