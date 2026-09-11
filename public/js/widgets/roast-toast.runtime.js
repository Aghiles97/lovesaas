/**
 * Runtime Engine: Roast & Toast Wheel Widget
 */
(function() {
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTickSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.025);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch (e) {}
  }

  function playFanfareSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const t = ctx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch (e) {}
  }

  function playGaspSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  function playKissSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1250, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  function spawnKissParticles(originEl) {
    const rect = originEl ? originEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const kissIcons = ["💋", "😘", "💖", "💋", "🥰", "✨"];
    for (let i = 0; i < 24; i++) {
      const el = document.createElement("div");
      el.className = "floating-kiss-particle";
      el.textContent = kissIcons[Math.floor(Math.random() * kissIcons.length)];
      const dx = (Math.random() - 0.5) * 220;
      const rot = (Math.random() - 0.5) * 50;
      el.style.left = (rect.left + 30 + (Math.random() - 0.5) * 80) + "px";
      el.style.top = (rect.top + (Math.random() - 0.5) * 40) + "px";
      el.style.setProperty("--dx", dx + "px");
      el.style.setProperty("--rot", rot + "deg");
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1450);
    }
  }

  window.setupRoastToast = function(data) {
    const section = document.getElementById("roastToastSection");
    if (!section) return;

    const canvas = document.getElementById("roastToastWheelCanvas");
    const rim = document.getElementById("wheelGoldRim");
    const btnSpin = document.getElementById("btnSpinRoastToast");
    const modal = document.getElementById("roastToastResultModal");
    const pill = document.getElementById("resultTypePill");
    const msg = document.getElementById("resultMsgBody");
    const btnClose = document.getElementById("btnCloseRoastToastResult");
    const toastVisual = document.getElementById("toastCheersVisual");
    const roastVisual = document.getElementById("roastFlameVisual");
    const btnCounterKisses = document.getElementById("btnCounterKisses");
    const kissFeedback = document.getElementById("kissFeedbackBanner");

    const roasts = (data && Array.isArray(data.roasts) && data.roasts.length) ? data.roasts : [
      "🔥 Takes 45 minutes to get ready, then claims you are the one running late!",
      "🔥 Always 'just resting their eyes' 5 minutes into a movie you picked.",
      "🔥 Said 'I am not hungry' but finished half of your french fries!",
      "🔥 Has 87 open browser tabs and refuses to close a single one."
    ];

    const toasts = (data && Array.isArray(data.toasts) && data.toasts.length) ? data.toasts : [
      "🥂 The kindest, most radiant soul in every single room you enter.",
      "🥂 Cheers to the person who makes the ordinary moments feel like magic.",
      "🥂 Aging like the finest champagne—more breathtaking with every year.",
      "🥂 To your boundless generosity, infectious laugh, and golden heart."
    ];

    const numSlices = 8;
    let currentRotation = 0;
    let isSpinning = false;
    let spinAnimId = null;

    function drawWheel() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const size = canvas.width;
      const center = size / 2;
      const radius = center - 8;
      const sliceAngle = (2 * Math.PI) / numSlices;

      ctx.clearRect(0, 0, size, size);

      for (let i = 0; i < numSlices; i++) {
        const isRoast = (i % 2 === 0);
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, i * sliceAngle, (i + 1) * sliceAngle);

        const grad = ctx.createRadialGradient(center, center, 40, center, center, radius);
        if (isRoast) {
          grad.addColorStop(0, "#ff4b72");
          grad.addColorStop(1, "#e11d48");
        } else {
          grad.addColorStop(0, "#fbbf24");
          grad.addColorStop(1, "#d97706");
        }
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.stroke();

        // Outer golden metallic peg on each slice divider
        const pegAngle = i * sliceAngle;
        const pegX = center + (radius - 12) * Math.cos(pegAngle);
        const pegY = center + (radius - 12) * Math.sin(pegAngle);
        ctx.beginPath();
        ctx.arc(pegX, pegY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#fef08a";
        ctx.fill();
        ctx.strokeStyle = "#854d0e";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate((i + 0.5) * sliceAngle);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 21px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.fillText(isRoast ? "ROAST 🔥" : "TOAST 🥂", radius - 26, 8);
        ctx.restore();
      }
    }

    drawWheel();

    function spin() {
      if (isSpinning) return;
      isSpinning = true;
      getAudioCtx();
      if (modal) modal.classList.remove("shown");
      if (kissFeedback) kissFeedback.classList.add("hidden");
      if (rim) rim.classList.add("spinning");

      const extraRounds = 5 + Math.floor(Math.random() * 4);
      const targetSlice = Math.floor(Math.random() * numSlices);
      const sliceAngleDeg = 360 / numSlices;
      const targetDeg = (extraRounds * 360) + (targetSlice * sliceAngleDeg) + (sliceAngleDeg / 2);

      const startAngle = currentRotation;
      const totalDelta = targetDeg;
      const duration = 4200;
      const startTime = performance.now();
      let lastPegIndex = -1;

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Easing: cubic ease-out
        const ease = 1 - Math.pow(1 - progress, 3.2);
        const curAngle = startAngle + totalDelta * ease;

        if (canvas) {
          canvas.style.transform = "rotate(" + curAngle + "deg)";
        }

        // Trigger tick when wheel passes pegs (every sliceAngleDeg)
        const pegIndex = Math.floor(curAngle / sliceAngleDeg);
        if (pegIndex !== lastPegIndex) {
          lastPegIndex = pegIndex;
          playTickSound();
        }

        if (progress < 1) {
          spinAnimId = requestAnimationFrame(step);
        } else {
          currentRotation = curAngle;
          isSpinning = false;
          if (rim) rim.classList.remove("spinning");

          const normalizedDeg = (currentRotation % 360);
          const pointerSlice = Math.floor(((360 - (normalizedDeg % 360) + 270) % 360) / sliceAngleDeg);
          const isRoast = (pointerSlice % 2 === 0);

          if (isRoast) {
            playGaspSound();
          } else {
            playFanfareSound();
          }

          if (modal && pill && msg) {
            modal.className = "roast-toast-result-modal shown " + (isRoast ? "mode-roast" : "mode-toast");
            pill.className = "result-type-pill " + (isRoast ? "roast" : "toast");
            pill.textContent = isRoast ? "ROAST 🔥" : "TOAST 🥂";

            if (toastVisual) toastVisual.classList.toggle("hidden", isRoast);
            if (roastVisual) roastVisual.classList.toggle("hidden", !isRoast);
            if (btnCounterKisses) btnCounterKisses.classList.toggle("hidden", !isRoast);

            const pool = isRoast ? roasts : toasts;
            const chosen = pool[Math.floor(Math.random() * pool.length)];
            msg.textContent = chosen;
          }

          if (typeof window.confetti === "function") {
            window.confetti({ particleCount: isRoast ? 35 : 70, spread: 65, origin: { y: 0.65 } });
          }
        }
      }

      spinAnimId = requestAnimationFrame(step);
    }

    if (btnSpin) btnSpin.onclick = spin;

    if (btnCounterKisses) {
      btnCounterKisses.onclick = function() {
        playKissSound();
        spawnKissParticles(btnCounterKisses);
        if (kissFeedback) kissFeedback.classList.remove("hidden");
        if (typeof window.confetti === "function") {
          window.confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        }
      };
    }

    if (btnClose && modal) {
      btnClose.onclick = function() {
        modal.classList.remove("shown");
        if (kissFeedback) kissFeedback.classList.add("hidden");
      };
    }

    window.roastToastSpin = spin;
  };
})();
