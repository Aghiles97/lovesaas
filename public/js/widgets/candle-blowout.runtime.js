/**
 * Runtime Engine: Candle Blow-Out Widget
 */
(function() {
  let micAudioContext = null;
  let micStream = null;
  let micAnalyser = null;
  let micAnimationId = null;
  let isListening = false;

  function triggerConfettiBurst() {
    if (typeof window.confetti === "function") {
      window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => window.confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }), 250);
      setTimeout(() => window.confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }), 400);
    } else {
      // Lightweight DOM emoji burst fallback
      const emojis = ["🎂", "🎉", "✨", "💖", "🎈", "🥳"];
      for (let i = 0; i < 30; i++) {
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

    function checkAllBlown() {
      const remaining = section.querySelectorAll(".cake-candle:not(.blown-out)");
      if (remaining.length === 0) {
        if (wishCard) wishCard.classList.add("revealed");
        if (btnRelight) btnRelight.classList.remove("hidden");
        triggerConfettiBurst();
        stopMicListening();
      }
    }

    candles.forEach(c => {
      c.onclick = function() {
        c.classList.add("blown-out");
        checkAllBlown();
      };
    });

    if (btnClick) {
      btnClick.onclick = function() {
        candles.forEach(c => c.classList.add("blown-out"));
        checkAllBlown();
      };
    }

    if (btnRelight) {
      btnRelight.onclick = function() {
        candles.forEach(c => c.classList.remove("blown-out"));
        if (wishCard) wishCard.classList.remove("revealed");
        btnRelight.classList.add("hidden");
      };
    }

    if (btnConfetti) {
      btnConfetti.onclick = function() {
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

          // Threshold for blowing into mic
          if (avg > 45) {
            const unblown = section.querySelectorAll(".cake-candle:not(.blown-out)");
            if (unblown.length > 0) {
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
      candles.forEach(c => c.classList.add("blown-out"));
      checkAllBlown();
    };

    window.candleBlowoutRelight = function() {
      candles.forEach(c => c.classList.remove("blown-out"));
      if (wishCard) wishCard.classList.remove("revealed");
      if (btnRelight) btnRelight.classList.add("hidden");
    };
  };
})();
