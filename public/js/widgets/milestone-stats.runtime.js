/**
 * Runtime Engine: Milestone Stats Widget
 */
(function() {
  let timerInterval = null;
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

  function playChimeNote(freq = 659.25) {
    if (window.state && window.state.romanticSfx === false) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {}
  }

  function spawnMiniHeartBurst(clientX, clientY) {
    const emojis = ["💖", "💓", "✨", "💕", "❤️", "🥰"];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "mini-heart-particle";
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const dist = 35 + Math.random() * 55;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 25;
      const rot = (Math.random() - 0.5) * 90;

      p.style.setProperty("--tx", `${tx}px`);
      p.style.setProperty("--ty", `${ty}px`);
      p.style.setProperty("--rot", `${rot}deg`);
      p.style.left = `${clientX}px`;
      p.style.top = `${clientY}px`;
      p.style.fontSize = `${14 + Math.random() * 10}px`;

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1150);
    }
  }

  window.setupMilestoneStats = function(data, heroData) {
    if (window._milestoneStatsInterval) {
      clearInterval(window._milestoneStatsInterval);
      window._milestoneStatsInterval = null;
    }
    const section = document.getElementById("milestoneStatsSection");
    if (!section) return;

    const rawDate = (data && data.birthDate) || section.dataset.birthdate || (heroData && heroData.anniversaryDate) || "2000-01-01T00:00";
    let birthTime = new Date(rawDate).getTime();
    if (isNaN(birthTime)) birthTime = new Date("2000-01-01T00:00").getTime();

    function formatNumber(num) {
      return Math.floor(num).toLocaleString();
    }

    let prevSeconds = null;

    function updateCounters() {
      const now = Date.now();
      const diffMs = Math.max(0, now - birthTime);
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const elDays = document.getElementById("milestoneDays");
      const elHours = document.getElementById("milestoneHours");
      const elMinutes = document.getElementById("milestoneMinutes");
      const elSeconds = document.getElementById("milestoneSeconds");

      if (elDays) elDays.textContent = formatNumber(days);
      if (elHours) elHours.textContent = String(hours).padStart(2, "0");
      if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, "0");

      if (elSeconds) {
        const secStr = String(seconds).padStart(2, "0");
        if (secStr !== prevSeconds) {
          prevSeconds = secStr;
          elSeconds.textContent = secStr;
          elSeconds.classList.remove("digit-rolling");
          requestAnimationFrame(() => elSeconds.classList.add("digit-rolling"));
        }
      }

      // Update quirky metric cards
      const cards = section.querySelectorAll(".quirky-metric-card");
      cards.forEach(card => {
        const id = card.dataset.metricId;
        const factor = parseFloat(card.dataset.factor) || 1;
        const valEl = document.getElementById("metric_val_" + id);
        if (!valEl) return;

        if (id === "solar") {
          valEl.textContent = (days / 365.25).toFixed(2);
        } else {
          valEl.textContent = formatNumber(days * factor);
        }
      });
    }

    // 3D Tilt effect on cards
    const tiltCards = section.querySelectorAll(".tilt-card");
    tiltCards.forEach((card, idx) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -9;
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
        card.style.setProperty("--glare-x", `${x}px`);
        card.style.setProperty("--glare-y", `${y}px`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      });

      // Sound & mini heart burst on click
      const pentatonicNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
      card.addEventListener("click", (e) => {
        const note = pentatonicNotes[idx % pentatonicNotes.length];
        playChimeNote(note);
        spawnMiniHeartBurst(e.clientX, e.clientY);
      });
    });

    // Slots click events
    const tickerSlots = section.querySelectorAll(".ticker-slot");
    tickerSlots.forEach((slot, sIdx) => {
      slot.addEventListener("click", (e) => {
        e.stopPropagation();
        const slotNotes = [783.99, 880.00, 1046.50, 1318.51];
        playChimeNote(slotNotes[sIdx % slotNotes.length]);
        spawnMiniHeartBurst(e.clientX, e.clientY);
      });
    });

    let isVisible = !document.hidden;
    let isIntersecting = true;

    function startTimer() {
      if (!timerInterval && isVisible && isIntersecting) {
        updateCounters();
        timerInterval = setInterval(updateCounters, 1000);
        window._milestoneStatsInterval = timerInterval;
      }
    }

    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        window._milestoneStatsInterval = null;
      }
    }

    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(entries => {
        isIntersecting = entries[0].isIntersecting;
        if (isIntersecting) startTimer();
        else stopTimer();
      }, { threshold: 0.05 });
      obs.observe(section);
    }

    document.addEventListener("visibilitychange", () => {
      isVisible = !document.hidden;
      if (isVisible) startTimer();
      else stopTimer();
    });

    startTimer();
    window.updateMilestoneCounters = updateCounters;
  };
})();
