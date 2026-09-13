/**
 * Runtime Engine: Candle Blow-Out Widget
 */
(function() {
  let micAudioContext = null;
  let micStream = null;
  let micAnalyser = null;
  let micAnimationId = null;
  let isListening = false;
  let sfxAudioCtx = null;

  function getAudioContext() {
    if (!sfxAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) sfxAudioCtx = new AudioCtx();
    }
    if (sfxAudioCtx && sfxAudioCtx.state === "suspended") {
      sfxAudioCtx.resume().catch(() => {});
    }
    return sfxAudioCtx;
  }

  function playSparklerFizz() {
    if (window.state && window.state.romanticSfx === false) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.4 ? 1 : 0.1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3800, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  function playBlowWhoosh() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const dur = 0.65;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  function playGoldenHarpChord() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [
        { f: 523.25, t: 0.00 }, // C5
        { f: 659.25, t: 0.07 }, // E5
        { f: 783.99, t: 0.14 }, // G5
        { f: 987.77, t: 0.21 }, // B5
        { f: 1046.50, t: 0.28 }, // C6
        { f: 1318.51, t: 0.35 }, // E6
        { f: 1567.98, t: 0.42 }, // G6
        { f: 2093.00, t: 0.50 }  // C7 (sparkle chime)
      ];

      notes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const oscHarm = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);

        oscHarm.type = "triangle";
        oscHarm.frequency.setValueAtTime(f * 2, ctx.currentTime + t);

        const startTime = ctx.currentTime + t;
        const decayTime = 1.8;

        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + decayTime);

        osc.connect(noteGain);
        oscHarm.connect(noteGain);
        noteGain.connect(ctx.destination);

        osc.start(startTime);
        oscHarm.start(startTime);
        osc.stop(startTime + decayTime);
        oscHarm.stop(startTime + decayTime);
      });
    } catch (e) {}
  }

  function triggerGoldenHeartExplosion(container) {
    if (!container) return;
    container.innerHTML = "";
    const symbols = ["💛", "✨", "⭐", "💖", "🌟", "✨"];
    const count = 38;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "golden-heart-particle";
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
      const distance = 70 + Math.random() * 150;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 40;
      const rot = (Math.random() - 0.5) * 120;

      heart.style.setProperty("--tx", `${tx}px`);
      heart.style.setProperty("--ty", `${ty}px`);
      heart.style.setProperty("--rot", `${rot}deg`);
      heart.style.left = "50%";
      heart.style.top = "40%";
      heart.style.fontSize = `${16 + Math.random() * 14}px`;
      heart.style.animationDelay = `${Math.random() * 0.15}s`;

      container.appendChild(heart);
    }
    setTimeout(() => { container.innerHTML = ""; }, 2200);
  }

  function triggerConfettiBurst() {
    if (typeof window.confetti === "function") {
      window.confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      setTimeout(() => window.confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 } }), 200);
      setTimeout(() => window.confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 } }), 380);
    } else {
      const emojis = ["🎂", "🎉", "✨", "💖", "🎈", "🥳", "💛"];
      for (let i = 0; i < 35; i++) {
        const el = document.createElement("div");
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.cssText = `position:fixed; left:${40 + Math.random() * 20}%; top:${50 + Math.random() * 20}%; font-size:${20 + Math.random() * 16}px; z-index:99999; pointer-events:none; transition: all 1.2s cubic-bezier(0.25, 1, 0.5, 1); transform: translate(${(Math.random() - 0.5) * 300}px, ${-100 - Math.random() * 250}px) rotate(${Math.random() * 360}deg); opacity: 1;`;
        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 1200); }, 50);
      }
    }
  }

  window.setupCandleBlowout = function(data) {
    if (window._candleBlowoutStopMic) {
      try { window._candleBlowoutStopMic(); } catch (e) {}
    }
    const section = document.getElementById("candleBlowoutSection");
    if (!section) return;

    const candles = section.querySelectorAll(".cake-candle");
    const btnClick = document.getElementById("btnBlowCandlesClick");
    const btnMic = document.getElementById("btnBlowCandlesMic");
    const btnRelight = document.getElementById("btnRelightCandles");
    const wishCard = document.getElementById("wishRevealCard");
    const btnConfetti = document.getElementById("btnCelebrationConfetti");
    const micMeterWrap = document.getElementById("micMeterWrap");
    const micMeterBar = document.getElementById("micMeterBar");
    const heartsContainer = document.getElementById("goldenHeartsContainer");

    function checkAllBlown() {
      const remaining = section.querySelectorAll(".cake-candle:not(.blown-out)");
      if (remaining.length === 0) {
        if (wishCard) wishCard.classList.add("revealed");
        if (btnRelight) btnRelight.classList.remove("hidden");
        playGoldenHarpChord();
        triggerGoldenHeartExplosion(heartsContainer);
        triggerConfettiBurst();
        stopMicListening();
      }
    }

    candles.forEach(c => {
      c.onclick = function() {
        if (!c.classList.contains("blown-out")) {
          playBlowWhoosh();
          c.classList.add("blown-out");
          checkAllBlown();
        }
      };
    });

    if (btnClick) {
      btnClick.onclick = function() {
        playBlowWhoosh();
        candles.forEach(c => c.classList.add("blown-out"));
        checkAllBlown();
      };
    }

    if (btnRelight) {
      btnRelight.onclick = function() {
        playSparklerFizz();
        candles.forEach(c => c.classList.remove("blown-out"));
        if (wishCard) wishCard.classList.remove("revealed");
        btnRelight.classList.add("hidden");
      };
    }

    if (btnConfetti) {
      btnConfetti.onclick = function() {
        playGoldenHarpChord();
        triggerConfettiBurst();
      };
    }

    function stopMicListening() {
      if (micAnimationId) cancelAnimationFrame(micAnimationId);
      if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
      }
      if (micAudioContext && micAudioContext.state !== "closed") {
        micAudioContext.close().catch(() => {});
        micAudioContext = null;
      }
      isListening = false;
      if (micMeterWrap) micMeterWrap.classList.remove("active");
      if (btnMic) btnMic.classList.remove("btn-pulse");
    }

    window._candleBlowoutStopMic = stopMicListening;

    async function startMicListening() {
      if (isListening) {
        stopMicListening();
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone access is not supported in this browser context. You can tap candles or click the button!");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream = stream;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        micAudioContext = new AudioCtx();
        const source = micAudioContext.createMediaStreamSource(stream);
        micAnalyser = micAudioContext.createAnalyser();
        micAnalyser.fftSize = 256;
        source.connect(micAnalyser);

        isListening = true;
        if (micMeterWrap) micMeterWrap.classList.add("active");
        if (btnMic) btnMic.classList.add("btn-pulse");

        const bufferLength = micAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function checkBlowLoop() {
          if (!isListening) return;
          micAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          const pct = Math.min(100, (avg / 128) * 100);
          if (micMeterBar) micMeterBar.style.width = pct + "%";

          if (avg > 45) {
            const unblown = section.querySelectorAll(".cake-candle:not(.blown-out)");
            if (unblown.length > 0) {
              playBlowWhoosh();
              unblown[0].classList.add("blown-out");
              checkAllBlown();
            }
          }

          micAnimationId = requestAnimationFrame(checkBlowLoop);
        }
        checkBlowLoop();
      } catch (err) {
        alert("Microphone access unavailable or denied. You can still tap candles or use the Click button!");
        stopMicListening();
      }
    }

    if (btnMic) {
      btnMic.onclick = startMicListening;
    }

    window.candleBlowoutBlowAll = function() {
      playBlowWhoosh();
      candles.forEach(c => c.classList.add("blown-out"));
      checkAllBlown();
    };

    window.candleBlowoutRelight = function() {
      playSparklerFizz();
      candles.forEach(c => c.classList.remove("blown-out"));
      if (wishCard) wishCard.classList.remove("revealed");
      if (btnRelight) btnRelight.classList.add("hidden");
    };
  };
})();
