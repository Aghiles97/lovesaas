(function() {
  const root = typeof window !== "undefined" ? window : global;

  const MOOD_MAP = [
    { max: 30, emoji: "😡", label: "Furious", color: "#ef4444", aura: "rgba(239, 68, 68, 0.45)" },
    { max: 70, emoji: "😤", label: "Annoyed", color: "#f59e0b", aura: "rgba(245, 158, 11, 0.45)" },
    { max: 100, emoji: "🕊️", label: "Truce", color: "#10b981", aura: "rgba(16, 185, 129, 0.45)" }
  ];

  let audioCtx = null;
  const getAudioCtx = () => {
    if (typeof window === "undefined") return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  };

  const playCelebratoryChime = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + idx * 0.09;
      const dur = 0.55;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    });
  };

  const triggerConfetti = (sourceEl) => {
    if (typeof window === "undefined") return;
    if (typeof window.confetti === "function") {
      window.confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      return;
    }
    const rect = sourceEl && typeof sourceEl.getBoundingClientRect === "function"
      ? sourceEl.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"];
    const container = document.createElement("div");
    container.className = "forgiveness-confetti-container";
    container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("div");
      p.style.cssText = `position:absolute;width:${Math.random() * 8 + 6}px;height:${Math.random() * 8 + 6}px;background:${colors[i % colors.length]};left:${rect.left}px;top:${rect.top}px;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};opacity:1;transition:transform 1.1s cubic-bezier(0.22,1,0.36,1),opacity 1.1s ease-out;`;
      container.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 220 + 60;
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 60}px) rotate(${Math.random() * 720}deg)`;
        p.style.opacity = "0";
      });
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1200);
  };

  function setupForgivenessMeter(data = {}) {
    if (typeof document === "undefined") return;

    const slider = document.getElementById("forgivenessSlider") ||
      document.querySelector("[data-forgiveness-slider]") ||
      document.querySelector(".forgiveness-slider") ||
      document.querySelector(".forgiveness-range-slider");
    const emojiEl = document.getElementById("forgivenessMoodEmoji") ||
      document.querySelector(".forgiveness-mood-emoji") ||
      document.querySelector(".mood-emoji");
    const labelEl = document.getElementById("forgivenessMoodLabel") ||
      document.querySelector(".forgiveness-mood-label") ||
      document.querySelector(".mood-text");
    const percentEl = document.getElementById("forgivenessPercentage") ||
      document.getElementById("forgivenessPercent") ||
      document.querySelector(".forgiveness-percent") ||
      document.querySelector(".mood-percentage");
    const fillBar = document.getElementById("forgivenessFillBar") ||
      document.getElementById("forgivenessMeterFill") ||
      document.querySelector(".slider-fill-bar") ||
      document.querySelector(".forgiveness-fill");
    const auraEl = document.getElementById("forgivenessAura") ||
      document.querySelector(".forgiveness-meter-card") ||
      document.getElementById("forgivenessMeterSection") ||
      document.querySelector(".forgiveness-aura");
    const rewardCard = document.getElementById("forgivenessRewardCard") ||
      document.getElementById("forgivenessRewardModal") ||
      document.querySelector(".forgiveness-reward-card");
    const claimBtn = document.getElementById("btnClaimForgivenessReward") ||
      document.querySelector(".btn-claim-reward");
    const resetBtn = document.getElementById("forgivenessResetBtn") ||
      document.querySelector(".forgiveness-reset-btn");

    let celebrated = false;

    const customMinLabel = slider?.dataset?.minLabel;
    const customMidLabel = slider?.dataset?.midLabel;
    const customMaxLabel = slider?.dataset?.maxLabel;

    const updateUI = (pct) => {
      const clamped = Math.max(0, Math.min(100, Math.round(pct)));
      const tier = MOOD_MAP.find(t => clamped <= t.max) || MOOD_MAP[MOOD_MAP.length - 1];

      let effectiveLabel = tier.label;
      if (clamped <= 30 && customMinLabel) effectiveLabel = customMinLabel;
      else if (clamped <= 70 && customMidLabel) effectiveLabel = customMidLabel;
      else if (clamped > 70 && customMaxLabel) effectiveLabel = customMaxLabel;

      if (slider && Number(slider.value) !== clamped) slider.value = clamped;
      if (emojiEl) emojiEl.textContent = tier.emoji;
      if (labelEl) {
        labelEl.textContent = effectiveLabel;
        labelEl.style.color = tier.color;
      }
      if (percentEl) percentEl.textContent = `${clamped}%`;
      if (fillBar) {
        fillBar.style.width = `${clamped}%`;
        fillBar.style.backgroundColor = tier.color;
      }
      if (auraEl) {
        auraEl.style.boxShadow = `0 10px 40px ${tier.aura}`;
      }

      if (clamped >= 100) {
        if (!celebrated) {
          celebrated = true;
          playCelebratoryChime();
          triggerConfetti(slider || auraEl);
        }
        if (rewardCard) {
          rewardCard.classList.remove("hidden");
          rewardCard.classList.add("revealed");
          rewardCard.style.display = "block";
        }
      } else {
        celebrated = false;
        if (rewardCard && !rewardCard.dataset.keepOpen) {
          rewardCard.classList.remove("revealed");
          rewardCard.classList.add("hidden");
          rewardCard.style.display = "none";
        }
      }
    };

    if (slider && !slider._bound) {
      slider._bound = true;
      slider.addEventListener("input", e => updateUI(Number(e.target.value)));
      slider.addEventListener("change", e => updateUI(Number(e.target.value)));
    }

    if (claimBtn && !claimBtn._bound) {
      claimBtn._bound = true;
      claimBtn.addEventListener("click", () => {
        triggerConfetti(claimBtn);
        playCelebratoryChime();
        claimBtn.textContent = "Reconciliation Sealed ❤️";
        claimBtn.setAttribute("disabled", "true");
      });
    }

    if (resetBtn && !resetBtn._bound) {
      resetBtn._bound = true;
      resetBtn.addEventListener("click", () => {
        celebrated = false;
        updateUI(data.initialLevel != null ? Number(data.initialLevel) : 0);
      });
    }

    root.forgivenessMeterSetLevel = (pct) => updateUI(Number(pct));
    updateUI(data.sliderVal != null ? Number(data.sliderVal) : (data.level != null ? Number(data.level) : (slider ? Number(slider.value) : 0)));
  }

  root.setupForgivenessMeter = setupForgivenessMeter;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setupForgivenessMeter());
    } else {
      setupForgivenessMeter();
    }
  }
})();
