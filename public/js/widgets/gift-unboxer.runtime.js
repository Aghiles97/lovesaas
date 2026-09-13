/**
 * Runtime Engine: Gift Unboxer Widget
 */
(function() {
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playRibbonZipSound() {
    if (window.state && window.state.romanticSfx === false) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const dur = 0.35;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + dur);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  function playLidPopWhoosh() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // Acoustic Pop
      const osc = ctx.createOscillator();
      const popGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.12);

      popGain.gain.setValueAtTime(0.35, ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(popGain);
      popGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);

      // Airy whoosh
      const dur = 0.55;
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
      filter.frequency.setValueAtTime(1600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + dur);

      const whooshGain = ctx.createGain();
      whooshGain.gain.setValueAtTime(0.001, ctx.currentTime);
      whooshGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      noise.connect(filter);
      filter.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  function playSparkleChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const chord = [
        { f: 587.33, t: 0.00 }, // D5
        { f: 739.99, t: 0.08 }, // F#5
        { f: 880.00, t: 0.16 }, // A5
        { f: 1108.73, t: 0.24 }, // C#6
        { f: 1479.98, t: 0.32 }, // F#6
        { f: 1760.00, t: 0.40 }, // A6
        { f: 2217.46, t: 0.48 }  // C#7 sparkle
      ];

      chord.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const harmonic = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);

        harmonic.type = "triangle";
        harmonic.frequency.setValueAtTime(f * 2, ctx.currentTime + t);

        const startTime = ctx.currentTime + t;
        const decay = 2.0;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.16, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

        osc.connect(gain);
        harmonic.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        harmonic.start(startTime);
        osc.stop(startTime + decay);
        harmonic.stop(startTime + decay);
      });
    } catch (e) {}
  }

  window.setupGiftUnboxer = function(data) {
    const section = document.getElementById("giftUnboxerSection");
    if (!section) return;

    let stage = 1; // 1: ribbon on, 2: ribbon off, 3: lid off & revealed
    const boxWrap = section.querySelector(".gift-stage-wrap");
    const giftBox = document.getElementById("giftBox3d");
    const revealCard = document.getElementById("giftSurpriseReveal");
    const btnRewrap = document.getElementById("btnRewrapGift");
    const dot1 = document.getElementById("dotStep1");
    const dot2 = document.getElementById("dotStep2");
    const dot3 = document.getElementById("dotStep3");

    function setStage(newStage) {
      stage = newStage;
      if (dot1) dot1.classList.toggle("active", stage >= 1);
      if (dot2) dot2.classList.toggle("active", stage >= 2);
      if (dot3) dot3.classList.toggle("active", stage >= 3);

      if (stage === 1) {
        if (boxWrap) {
          boxWrap.classList.remove("stage-ribbon-off", "stage-lid-off", "stage-revealed");
        }
        if (revealCard) revealCard.classList.remove("shown");
      } else if (stage === 2) {
        playRibbonZipSound();
        if (boxWrap) {
          boxWrap.classList.add("stage-ribbon-off");
          boxWrap.classList.remove("stage-lid-off", "stage-revealed");
        }
      } else if (stage === 3) {
        playLidPopWhoosh();
        setTimeout(() => playSparkleChime(), 180);
        if (boxWrap) {
          boxWrap.classList.add("stage-ribbon-off", "stage-lid-off", "stage-revealed");
        }
        if (revealCard) revealCard.classList.add("shown");
        if (typeof window.confetti === "function") {
          window.confetti({ particleCount: 80, spread: 85, origin: { y: 0.65 } });
          setTimeout(() => window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.55 } }), 300);
        }
      }
    }

    if (giftBox) {
      giftBox.onclick = function() {
        if (stage === 1) setStage(2);
        else if (stage === 2) setStage(3);
      };
    }

    if (btnRewrap) {
      btnRewrap.onclick = function() {
        setStage(1);
      };
    }

    const btnClaimWhatsapp = document.getElementById("btnClaimWhatsapp");
    if (btnClaimWhatsapp) {
      btnClaimWhatsapp.onclick = function() {
        playSparkleChime();
        if (typeof window.confetti === "function") {
          window.confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
        }
      };
    }

    const btnClaim = document.getElementById("btnClaimGift");
    if (btnClaim) {
      btnClaim.onclick = function(e) {
        const href = btnClaim.getAttribute("href");
        if (!href || href === "#" || href === "") {
          e.preventDefault();
          playSparkleChime();
          if (typeof window.confetti === "function") {
            window.confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
          } else {
            alert("🎉 VIP Birthday Pass Claimed! Get ready for an unforgettable romantic celebration! 💖");
          }
        }
      };
    }

    window.unboxGiftStep = function() {
      if (stage < 3) setStage(stage + 1);
    };
    window.unboxGiftReset = function() {
      setStage(1);
    };
  };
})();
