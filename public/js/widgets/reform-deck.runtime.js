(function() {
  const root = typeof window !== "undefined" ? window : global;

  let audioCtx = null;
  const getAudioCtx = () => {
    if (typeof window === "undefined") return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  };

  const playCardFlipSound = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.04, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (_) {}
  };

  function setupReformDeck(data = {}) {
    if (typeof document === "undefined") return;

    const cards = Array.from(document.querySelectorAll(".reform-card-item, .reform-card, .flip-card, [data-reform-card]"));
    const filterBtns = Array.from(document.querySelectorAll(".reform-filter-btn, [data-reform-filter]"));
    const flippedCountEl = document.getElementById("reformFlippedCount");
    const progressBadge = document.getElementById("reformProgressBadge") ||
      document.querySelector(".reform-progress-badge") ||
      document.querySelector(".reform-status-tracker");
    const flipAllBtn = document.getElementById("btnFlipAllReform") ||
      document.querySelector(".btn-flip-all-reform");

    const flippedSet = new Set();
    const totalCount = cards.length || (Array.isArray(data.cards) ? data.cards.length : 4);

    const updateTracker = () => {
      const count = flippedSet.size;
      if (flippedCountEl) flippedCountEl.textContent = String(count);

      if (progressBadge) {
        if (count >= totalCount && totalCount > 0) {
          progressBadge.classList.add("complete");
          const trackerLabel = progressBadge.querySelector(".tracker-label");
          if (trackerLabel) trackerLabel.textContent = "All Reviewed:";
          if (!progressBadge.dataset.badgeCustom) {
            progressBadge.title = `All ${totalCount} commitments reviewed ❤️`;
          }
        } else {
          progressBadge.classList.remove("complete");
        }
      }
    };

    cards.forEach((card, idx) => {
      if (card._bound) return;
      card._bound = true;

      const flip = () => {
        card.classList.toggle("is-flipped");
        playCardFlipSound();
        if (card.classList.contains("is-flipped")) {
          flippedSet.add(idx);
        } else {
          flippedSet.delete(idx);
        }
        updateTracker();
      };

      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.addEventListener("click", flip);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          flip();
        }
      });
    });

    if (flipAllBtn && !flipAllBtn._bound) {
      flipAllBtn._bound = true;
      let allFlipped = false;
      flipAllBtn.addEventListener("click", () => {
        allFlipped = !allFlipped;
        cards.forEach((card, i) => {
          setTimeout(() => {
            if (allFlipped) {
              card.classList.add("is-flipped");
              flippedSet.add(i);
            } else {
              card.classList.remove("is-flipped");
              flippedSet.delete(i);
            }
            playCardFlipSound();
            updateTracker();
          }, i * 70);
        });
        const btnSpan = flipAllBtn.querySelector("span") || flipAllBtn;
        btnSpan.textContent = allFlipped ? "Unflip All ↺" : "Flip All Cards 🔄";
      });
    }

    filterBtns.forEach(btn => {
      if (btn._bound) return;
      btn._bound = true;

      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const targetCat = btn.dataset.reformFilter || btn.dataset.category || btn.textContent.trim().toLowerCase();
        cards.forEach(card => {
          const cardCat = (card.dataset.category || "").toLowerCase();
          const matches = !targetCat || targetCat === "all" || cardCat.includes(targetCat);
          card.style.display = matches ? "" : "none";
        });
      });
    });

    root.reformDeckFlipAll = () => {
      if (flipAllBtn) flipAllBtn.click();
      else {
        cards.forEach((c, i) => {
          c.classList.add("is-flipped");
          flippedSet.add(i);
        });
        updateTracker();
      }
    };

    updateTracker();
  }

  root.setupReformDeck = setupReformDeck;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setupReformDeck());
    } else {
      setupReformDeck();
    }
  }
})();
