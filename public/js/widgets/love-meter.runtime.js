/**
 * Runtime Widget Engine: love-meter.runtime.js
 * Modularized for high maintainability.
 */
function spawnKissStamp(x, y) {
  const el = document.createElement("div");
  el.className = "floating-kiss-stamp";
  const icons = ["💋", "😘", "💖", "💋", "🥰", "💋"];
  el.textContent = icons[Math.floor(Math.random() * icons.length)];
  el.style.setProperty("--rot", `${(Math.random() * 40 - 20).toFixed(1)}deg`);
  el.style.left = `${x + (Math.random() * 30 - 15)}px`;
  el.style.top = `${y + (Math.random() * 20 - 10)}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1050);
}

function spawnKissFlurry(count = 2) {
  if (typeof window !== "undefined" && window.parent && window.parent !== window) return;
  const safeCount = Math.min(count, 2);
  for (let i = 0; i < safeCount; i++) {
    setTimeout(() => {
      const rx = Math.random() * (window.innerWidth - 80) + 40;
      const ry = window.innerHeight * 0.25 + Math.random() * (window.innerHeight * 0.5);
      spawnKissStamp(rx, ry);
    }, i * 100);
  }
}

function spawnHugStamp(x, y) {
  const el = document.createElement("div");
  el.className = "floating-kiss-stamp";
  const icons = ["🤗", "💖", "🥰"];
  el.textContent = icons[Math.floor(Math.random() * icons.length)];
  el.style.setProperty("--rot", `${(Math.random() * 40 - 20).toFixed(1)}deg`);
  el.style.left = `${x + (Math.random() * 30 - 15)}px`;
  el.style.top = `${y + (Math.random() * 20 - 10)}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function spawnHugFlurry(count = 2) {
  if (typeof window !== "undefined" && window.parent && window.parent !== window) return;
  const safeCount = Math.min(count, 2);
  for (let i = 0; i < safeCount; i++) {
    setTimeout(() => {
      const rx = Math.random() * (window.innerWidth - 80) + 40;
      const ry = window.innerHeight * 0.25 + Math.random() * (window.innerHeight * 0.5);
      spawnHugStamp(rx, ry);
    }, i * 100);
  }
}

let hugKissShown = false;

// Lof-O-Meter Engine
function setupLoveMeter() {
  const pumpBtn = document.getElementById("pumpMeterBtn");
  const kissBtn = document.getElementById("kissKissBtn");
  const hugBtn = document.getElementById("hugHugBtn");
  const resetBtn = document.getElementById("resetMeterBtn");
  const fill = document.getElementById("meterFill");
  const qMeterEl = document.getElementById("meterQuintillionNumber");
  const status = document.getElementById("meterStatus");
  const container = document.getElementById("meterBoxContainer");
  const kissBtnSpan = kissBtn ? kissBtn.querySelector("span") : null;
  const hugBtnSpan = hugBtn ? hugBtn.querySelector("span") : null;
  const meterSection = document.querySelector(".love-meter-section");
  const blockerModal = document.getElementById("pumpBlockerModal");
  const returnBtn = document.getElementById("returnToPumpBtn");
  const blockerBackdrop = document.getElementById("pumpBlockerBackdrop");
  if (!pumpBtn || !fill) return;

  let pumpCount = 0;
  let kissCombo = 0;
  let kissComboTimer = null;
  let hugCombo = 0;
  let hugComboTimer = null;

  const isPumpBlockActive = () => pumpCount >= 4 && !hugKissShown;

  const handleReturnToPump = () => {
    if (blockerModal) blockerModal.classList.add("hidden");
    document.body.style.overflow = "";
    if (meterSection) meterSection.scrollIntoView({ behavior: "smooth", block: "center" });
    if (pumpBtn) {
      pumpBtn.classList.add("btn-highlight-shake");
      setTimeout(() => pumpBtn.classList.remove("btn-highlight-shake"), 1200);
      pumpBtn.focus();
    }
    if (typeof audio !== "undefined") audio.playSparkle();
  };

  if (returnBtn) returnBtn.onclick = handleReturnToPump;
  if (blockerBackdrop) blockerBackdrop.onclick = handleReturnToPump;

  let isBlockingScroll = false;
  window.addEventListener("scroll", () => {
    if (!isPumpBlockActive() || isBlockingScroll) return;
    if (!meterSection) return;
    const rect = meterSection.getBoundingClientRect();
    if (rect.bottom < 120) {
      isBlockingScroll = true;
      if (blockerModal) blockerModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      meterSection.scrollIntoView({ behavior: "smooth", block: "center" });
      if (pumpBtn) {
        pumpBtn.classList.add("btn-highlight-shake");
        setTimeout(() => pumpBtn.classList.remove("btn-highlight-shake"), 1200);
      }
      if (typeof audio !== "undefined") audio.playKiss();
      setTimeout(() => { isBlockingScroll = false; }, 600);
    }
  }, { passive: true });

  pumpBtn.onclick = () => {
    pumpCount++;
    state.bonusLof += 500000000000000000;
    const progress = Math.min(20 + pumpCount * 12, 100);
    fill.style.width = `${progress}%`;

    const rect = pumpBtn.getBoundingClientRect();
    if (typeof particles !== "undefined") particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
    if (typeof audio !== "undefined") audio.playSparkle();

    const tease = PUMP_TEASE_MAP[pumpCount];
    if (tease) {
      status.textContent = tease.status;
      showComplimentToast(rect.left, rect.top, tease.toast);
      const btnSpan = pumpBtn.querySelector("span");
      if (btnSpan && tease.btn) btnSpan.textContent = tease.btn;
      container.style.boxShadow = "0 0 35px rgba(255, 84, 112, 0.7)";
      if (typeof audio !== "undefined") audio.playKiss();
      spawnKissFlurry(4);
    } else if (pumpCount >= 9) {
      if (qMeterEl) {
        qMeterEl.setAttribute("data-infinity", "true");
        qMeterEl.innerHTML = "✨ ∞ ABSOLUTE INFINITE LOF LOF & KISSES ∞ ✨";
      }
      status.textContent = "💥 COSMIC SUPERNOVA: Scale shattered by infinite lof! 🤗💋";
      container.style.boxShadow = "0 0 60px rgba(255, 67, 101, 1)";
      fill.classList.add("meter-cosmic-glow");
      document.body.classList.add("screen-shake");
      setTimeout(() => document.body.classList.remove("screen-shake"), 600);
      if (typeof particles !== "undefined") {
        particles.burst(window.innerWidth / 2, window.innerHeight / 2, 80);
        particles.burst(rect.left + rect.width / 2, rect.top + 50, 50);
      }
      spawnKissFlurry(15);
      if (typeof audio !== "undefined") audio.playFanfare();
      triggerHugKissOverlay();
    } else {
      status.textContent = `Lof Level: Level ${pumpCount + 1} (${progress}% Capacity) ❤️‍🔥`;
    }
  };

  if (kissBtn) {
    kissBtn.onclick = (e) => {
      kissCombo++;
      clearTimeout(kissComboTimer);
      kissComboTimer = setTimeout(() => {
        kissCombo = 0;
        if (kissBtnSpan) kissBtnSpan.textContent = kissBtn.getAttribute("data-orig-text") || "Send Kiss Kiss 💋";
      }, 5000);

      if (kissBtnSpan) kissBtnSpan.textContent = `Kiss Kiss 💋 (x${kissCombo})`;

      if (typeof audio !== "undefined") audio.playKiss();
      state.bonusLof += 200000000000000 * kissCombo;
      const rect = kissBtn.getBoundingClientRect();
      const clickX = e.clientX || (rect.left + rect.width / 2);
      const clickY = e.clientY || (rect.top + rect.height / 2);

      spawnKissStamp(clickX, clickY);
      if (typeof particles !== "undefined") particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25 + Math.min(kissCombo * 5, 40));

      const lvl = KISS_COMBO_LEVELS.find((l) => kissCombo >= l.min) || KISS_COMBO_LEVELS[KISS_COMBO_LEVELS.length - 1];
      spawnKissFlurry(lvl.flurry);
      showComplimentToast(rect.left, rect.top, lvl.toast);
      status.textContent = lvl.status;

      if (lvl.fanfare) {
        if (typeof audio !== "undefined") audio.playFanfare();
        container.style.boxShadow = "0 0 45px rgba(255, 67, 101, 0.9)";
      }
    };
  }

  if (hugBtn) {
    hugBtn.onclick = (e) => {
      hugCombo++;
      clearTimeout(hugComboTimer);
      hugComboTimer = setTimeout(() => {
        hugCombo = 0;
        if (hugBtnSpan) hugBtnSpan.textContent = hugBtn.getAttribute("data-orig-text") || "Send Hug Hug 🤗";
      }, 5000);

      if (hugBtnSpan) hugBtnSpan.textContent = `Hug Hug 🤗 (x${hugCombo})`;

      if (typeof audio !== "undefined") audio.playKiss();
      state.bonusLof += 200000000000000 * hugCombo;
      const rect = hugBtn.getBoundingClientRect();
      const clickX = e.clientX || (rect.left + rect.width / 2);
      const clickY = e.clientY || (rect.top + rect.height / 2);

      spawnHugStamp(clickX, clickY);
      if (typeof particles !== "undefined") particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25 + Math.min(hugCombo * 5, 40));

      const lvl = HUG_COMBO_LEVELS.find((l) => hugCombo >= l.min) || HUG_COMBO_LEVELS[HUG_COMBO_LEVELS.length - 1];
      spawnHugFlurry(lvl.flurry);
      showComplimentToast(rect.left, rect.top, lvl.toast);
      status.textContent = lvl.status;

      if (lvl.fanfare) {
        if (typeof audio !== "undefined") audio.playFanfare();
        container.style.boxShadow = "0 0 45px rgba(255, 105, 180, 0.9)";
      }
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      pumpCount = 0;
      hugKissShown = false;
      if (blockerModal) blockerModal.classList.add("hidden");
      document.body.style.overflow = "";
      kissCombo = 0;
      hugCombo = 0;
      state.bonusLof = 0;
      fill.style.width = "20%";
      if (qMeterEl) qMeterEl.removeAttribute("data-infinity");
      status.textContent = status.getAttribute("data-orig-text") || "Lof Level: Exploding ❤️";
      const btnSpan = pumpBtn.querySelector("span");
      if (btnSpan) btnSpan.textContent = pumpBtn.getAttribute("data-orig-text") || "Pump Lof Lof! 💖 (+500 Quadrillion)";
      if (kissBtnSpan) kissBtnSpan.textContent = (kissBtn && kissBtn.getAttribute("data-orig-text")) || "Send Kiss Kiss 💋";
      if (hugBtnSpan) hugBtnSpan.textContent = (hugBtn && hugBtn.getAttribute("data-orig-text")) || "Send Hug Hug 🤗";
      container.style.boxShadow = "";
      if (typeof audio !== "undefined") audio.playPop();
    };
  }
}
window.setupLoveMeter = setupLoveMeter;

function triggerHugKissOverlay() {
  hugKissShown = true;
  const blockerModal = document.getElementById("pumpBlockerModal");
  if (blockerModal) blockerModal.classList.add("hidden");
  document.body.style.overflow = "";

  const overlay = document.getElementById("hugKissOverlay");
  if (!overlay) return;
  overlay.classList.remove("hidden");
  if (typeof audio !== "undefined") audio.playFanfare();
  if (typeof particles !== "undefined") particles.burst(window.innerWidth / 2, window.innerHeight / 2, 50);
}
window.triggerHugKissOverlay = triggerHugKissOverlay;

// Truth or Dare Game (100% Fair & Square Duel)
