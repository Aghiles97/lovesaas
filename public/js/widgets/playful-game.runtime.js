/**
 * Runtime Widget Engine: playful-game.runtime.js
 * Modularized for high maintainability.
 */
function setupPlayfulGame() {
  const noBtn = document.getElementById("noBtn");
  const yesBtn = document.getElementById("yesBtn");
  const teasingText = document.getElementById("teasingFeedback");
  const area = document.getElementById("buttonPlayArea");

  let evasiveCount = 0;
  const wittyDialogues = [
    "Nice try, but you're legally stuck with me forever! 💍😜",
    "Error 404: 'No' button disconnected! 💖",
    "Your fingers slipped! Tap the giant shiny YES! 🥰",
    "There is NO escaping my kissies and hugs! 🤗💋",
    "PUPU alert! The NO button ran away to Nanjing! 💩🛕",
    "Resistance is futile, sweetheart! I lof you too much! 💕",
    "Look how big the YES button is becoming! Just tap it! ✨"
  ];

  const moveNoButton = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    evasiveCount++;
    const areaRect = area ? area.getBoundingClientRect() : null;
    const areaW = areaRect ? areaRect.width : 300;
    const areaH = areaRect ? areaRect.height : 120;

    noBtn.style.position = "absolute";
    const btnW = noBtn.offsetWidth || 80;
    const btnH = noBtn.offsetHeight || 44;

    const pad = 10;
    const maxL = Math.max(0, areaW - btnW - pad);
    const maxT = Math.max(0, areaH - btnH - pad);

    let randL = pad + Math.random() * maxL;
    let randT = pad + Math.random() * maxT;

    if (yesBtn && areaRect) {
      const yR = yesBtn.getBoundingClientRect();
      const yesL = yR.left - areaRect.left;
      const yesRight = yR.right - areaRect.left;
      const yesT = yR.top - areaRect.top;
      const yesB = yR.bottom - areaRect.top;

      if (randL + btnW > yesL - 6 && randL < yesRight + 6 && randT + btnH > yesT - 6 && randT < yesB + 6) {
        if (Math.random() > 0.5 && yesL - btnW - pad > 10) {
          randL = pad + Math.random() * (yesL - btnW - pad);
        } else if (maxL > yesRight + pad) {
          randL = yesRight + 8 + Math.random() * Math.max(0, maxL - yesRight - 8);
        } else if (randT > (yesT + yesB) / 2) {
          randT = Math.min(maxT, yesB + 6);
        } else {
          randT = Math.max(pad, yesT - btnH - 6);
        }
      }
    }

    randL = Math.max(pad, Math.min(maxL, randL));
    randT = Math.max(pad, Math.min(maxT, randT));

    const noScale = Math.max(0.65, 1 - evasiveCount * 0.06);
    noBtn.style.left = `${Math.round(randL)}px`;
    noBtn.style.top = `${Math.round(randT)}px`;
    noBtn.style.transform = `scale(${noScale})`;
    noBtn.style.zIndex = "10";

    if (yesBtn) {
      const yesScale = Math.min(1.35, 1 + evasiveCount * 0.08);
      yesBtn.style.transform = `scale(${yesScale})`;
    }

    const customQuotes = (window.PLAYFUL_DATA && Array.isArray(window.PLAYFUL_DATA.teasingQuotes) && window.PLAYFUL_DATA.teasingQuotes.length)
      ? window.PLAYFUL_DATA.teasingQuotes
      : ((typeof getTeasingQuotes === "function") ? getTeasingQuotes() : wittyDialogues);
    const quote = customQuotes[evasiveCount % customQuotes.length];
    if (teasingText) teasingText.textContent = quote;
    if (typeof audio !== "undefined" && audio.playPop) audio.playPop();

    if (evasiveCount >= 7) {
      noBtn.style.display = "none";
      const vanishText = (window.PLAYFUL_DATA && window.PLAYFUL_DATA.vanishQuote)
        ? window.PLAYFUL_DATA.vanishQuote
        : "PUPU ALERT! 💩 The 'No' button gave up and vanished! Tap YES! 💖";
      if (teasingText) teasingText.textContent = vanishText;
    }
  };

  if (noBtn) {
    noBtn.addEventListener("mouseenter", moveNoButton);
    noBtn.addEventListener("touchstart", moveNoButton, { passive: false });
    noBtn.addEventListener("click", moveNoButton);
  }

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      const rect = yesBtn.getBoundingClientRect();
      if (typeof particles !== "undefined" && particles.burst) {
        particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
        particles.burst(window.innerWidth / 2, window.innerHeight / 2, 60);
      }
      if (typeof audio !== "undefined") {
        if (audio.playFanfare) audio.playFanfare();
        if (audio.playChimeCascade) audio.playChimeCascade();
      }
      document.body.classList.add("screen-shake");
      setTimeout(() => document.body.classList.remove("screen-shake"), 600);
      const modal = document.getElementById("celebrationModal");
      if (modal) modal.classList.remove("hidden");
    });
  }

  window.playfulTriggerYes = function() {
    if (yesBtn) yesBtn.click();
  };

  window.playfulTriggerNoEvasion = function() {
    moveNoButton();
  };

  window.playfulReset = function() {
    evasiveCount = 0;
    if (noBtn) {
      noBtn.style.position = "";
      noBtn.style.left = "";
      noBtn.style.top = "";
      noBtn.style.transform = "";
      noBtn.style.display = "";
      noBtn.style.zIndex = "";
    }
    if (yesBtn) {
      yesBtn.style.transform = "";
    }
    if (teasingText) {
      teasingText.textContent = "";
    }
    const modal = document.getElementById("celebrationModal");
    if (modal) modal.classList.add("hidden");
    if (typeof audio !== "undefined" && audio.playSparkle) audio.playSparkle();
  };
}

// Intro Soundtrack Selection Engine
let currentChosenSong = (typeof SOUNDTRACK_PLAYLIST !== "undefined" && SOUNDTRACK_PLAYLIST.length)
  ? SOUNDTRACK_PLAYLIST[0]
  : null;

