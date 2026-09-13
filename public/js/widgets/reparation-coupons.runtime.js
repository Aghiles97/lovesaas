(function() {
  const root = typeof window !== "undefined" ? window : global;
  const STORAGE_KEY = "reparation_coupons_redeemed_state";

  let audioCtx = null;
  const getAudioCtx = () => {
    if (typeof window === "undefined") return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  };

  const playScratchSound = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.035);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1600, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (_) {}
  };

  const playStampSound = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  };

  const triggerConfetti = (rect) => {
    if (typeof window === "undefined") return;
    if (typeof window.confetti === "function") {
      window.confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      return;
    }
    const colors = ["#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#3b82f6"];
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      p.style.cssText = `position:absolute;width:${Math.random() * 7 + 5}px;height:${Math.random() * 7 + 5}px;background:${colors[i % colors.length]};left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};opacity:1;transition:transform 1s cubic-bezier(0.22,1,0.36,1),opacity 1s ease-out;`;
      container.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 150 + 40;
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 40}px) rotate(${Math.random() * 360}deg)`;
        p.style.opacity = "0";
      });
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1100);
  };

  const getRedeemedList = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (_) {
      return [];
    }
  };

  const saveRedeemedList = (list) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  };

  function setupReparationCanvas(canvas, card, couponId) {
    const parent = canvas.parentElement;
    const width = parent ? (parent.clientWidth || 320) : 320;
    const height = parent ? (parent.clientHeight || 180) : 180;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#d4af37");
    grad.addColorStop(0.3, "#fef08a");
    grad.addColorStop(0.6, "#cbd5e1");
    grad.addColorStop(1, "#94a3b8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ Scratch to Reveal Reparation ✨", width / 2, height / 2 - 8);
    ctx.font = "12px sans-serif";
    ctx.fillText("Hold & drag to reveal voucher", width / 2, height / 2 + 14);

    let isScratching = false;
    let isCleared = false;
    let lastCheckTime = 0;

    const checkScratchedArea = () => {
      if (isCleared) return;
      const now = performance.now();
      if (now - lastCheckTime < 80) return;
      lastCheckTime = now;

      const imgData = ctx.getImageData(0, 0, width, height).data;
      let clearedPixels = 0;
      const sampleStep = 32;
      const totalSamples = imgData.length / sampleStep;
      for (let i = 3; i < imgData.length; i += sampleStep) {
        if (imgData[i] === 0) clearedPixels++;
      }

      if (clearedPixels / totalSamples >= 0.6) {
        isCleared = true;
        canvas.style.transition = "opacity 0.4s ease-out";
        canvas.style.opacity = "0";
        setTimeout(() => {
          canvas.remove();
          card.classList.add("revealed");
          const redeemBtn = card.querySelector(".btn-redeem-stamp, .reparation-redeem-btn, .coupon-redeem-btn");
          if (redeemBtn) redeemBtn.style.display = "inline-flex";
        }, 400);
        triggerConfetti(card.getBoundingClientRect());
      }
    };

    const scratch = (clientX, clientY) => {
      if (isCleared) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      playScratchSound();
      checkScratchedArea();
    };

    canvas.addEventListener("pointerdown", (e) => {
      isScratching = true;
      scratch(e.clientX, e.clientY);
    });
    window.addEventListener("pointermove", (e) => {
      if (isScratching) scratch(e.clientX, e.clientY);
    });
    window.addEventListener("pointerup", () => isScratching = false);
    window.addEventListener("pointercancel", () => isScratching = false);
  }

  function setupReparationCoupons(data = {}) {
    if (typeof document === "undefined") return;

    const cards = Array.from(document.querySelectorAll(".reparation-card, .coupon-card, [data-coupon-id]"));
    const resetBtn = document.getElementById("btnResetReparations") ||
      document.getElementById("btnResetCoupons") ||
      document.querySelector(".btn-reset-coupons");
    const redeemed = getRedeemedList();

    cards.forEach((card, idx) => {
      const couponId = card.dataset.couponId || `coupon_${idx}`;
      const isRedeemed = redeemed.includes(couponId) || card.classList.contains("is-redeemed");
      const canvas = card.querySelector(".reparation-scratch-canvas, .scratch-canvas, canvas");
      const redeemBtn = card.querySelector(".btn-redeem-stamp, .reparation-redeem-btn, .coupon-redeem-btn");
      const stampEl = card.querySelector(".claimed-stamp-overlay, .reparation-stamp, .coupon-redeemed-stamp");

      if (isRedeemed) {
        if (canvas) canvas.remove();
        if (stampEl) {
          stampEl.classList.remove("hidden");
          stampEl.classList.add("active");
          stampEl.style.display = "block";
        }
        if (redeemBtn) {
          const btnSpan = redeemBtn.querySelector("span") || redeemBtn;
          btnSpan.textContent = "✓ Redeemed";
          redeemBtn.classList.replace("btn-primary", "btn-outline");
          redeemBtn.setAttribute("disabled", "true");
        }
      } else if (canvas) {
        setupReparationCanvas(canvas, card, couponId);
      }

      if (redeemBtn && !redeemBtn._bound) {
        redeemBtn._bound = true;
        redeemBtn.addEventListener("click", () => {
          playStampSound();
          const list = getRedeemedList();
          if (!list.includes(couponId)) {
            list.push(couponId);
            saveRedeemedList(list);
          }
          if (stampEl) {
            stampEl.classList.remove("hidden");
            stampEl.classList.add("active", "stamped");
            stampEl.style.display = "block";
          }
          card.classList.add("is-redeemed");
          const btnSpan = redeemBtn.querySelector("span") || redeemBtn;
          btnSpan.textContent = "✓ Redeemed";
          redeemBtn.classList.replace("btn-primary", "btn-outline");
          redeemBtn.setAttribute("disabled", "true");
          triggerConfetti(card.getBoundingClientRect());
        });
      }
    });

    if (resetBtn && !resetBtn._bound) {
      resetBtn._bound = true;
      resetBtn.addEventListener("click", () => {
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        setupReparationCoupons(data);
      });
    }

    root.resetReparationCoupons = () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      setupReparationCoupons(data);
    };
  }

  root.setupReparationCoupons = setupReparationCoupons;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setupReparationCoupons());
    } else {
      setupReparationCoupons();
    }
  }
})();
