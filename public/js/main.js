// App State Engine
let rawSavedDate = localStorage.getItem("gf_start_date");
if (rawSavedDate && rawSavedDate.startsWith("2023")) {
  rawSavedDate = "2025-09-17T00:00";
  localStorage.setItem("gf_start_date", rawSavedDate);
}

let state = {
  partnerName: localStorage.getItem("gf_name") || DEFAULTS.partnerName,
  senderName: localStorage.getItem("gf_sender") || DEFAULTS.senderName,
  startDate: rawSavedDate || DEFAULTS.startDate,
  letter: (() => {
    const saved = localStorage.getItem("gf_letter");
    if (saved && !saved.toLowerCase().includes("monchichi")) {
      return DEFAULTS.letter;
    }
    return saved || DEFAULTS.letter;
  })(),
  giftTitle: localStorage.getItem("gf_gift_title") || DEFAULTS.giftTitle,
  memories: typeof loadStoredMemories === "function" ? loadStoredMemories() : (typeof DEFAULTS !== "undefined" ? DEFAULTS.memories || [] : []),
  voiceAudio: (() => {
    const v = localStorage.getItem("gf_voice_audio");
    if (v && v.includes("myrecording") && !v.includes("myrecording-volume-adjusted")) {
      return "audio/myrecording-volume-adjusted.mp3";
    }
    return v || DEFAULTS.voiceAudio || "audio/myrecording-volume-adjusted.mp3";
  })(),
  letterAudio: localStorage.getItem("gf_letter_audio") || (DEFAULTS.letterAudio !== undefined ? DEFAULTS.letterAudio : "audio/letter_voice-volume-adjusted.mp3"),
  customMusicAudio: localStorage.getItem("gf_music_audio") || null,
  voiceVolume: parseInt((() => {
    const v = localStorage.getItem("gf_voice_volume");
    if (!v || v === "100" || v === "175") {
      localStorage.setItem("gf_voice_volume", "300");
      return "300";
    }
    return v || (DEFAULTS.voiceVolume !== undefined ? DEFAULTS.voiceVolume : 300);
  })(), 10),
  voiceBgVolume: parseInt((() => {
    const v = localStorage.getItem("gf_voice_bg_volume");
    if (!v || v === "20") {
      localStorage.setItem("gf_voice_bg_volume", "7");
      return "7";
    }
    return v || (DEFAULTS.voiceBgVolume !== undefined ? DEFAULTS.voiceBgVolume : 7);
  })(), 10),
  letterVoiceVolume: parseInt((() => {
    const v = localStorage.getItem("gf_letter_voice_volume");
    if (!v || v === "100" || v === "175") {
      localStorage.setItem("gf_letter_voice_volume", "300");
      return "300";
    }
    return v || (DEFAULTS.letterVoiceVolume !== undefined ? DEFAULTS.letterVoiceVolume : 300);
  })(), 10),
  letterBgVolume: parseInt((() => {
    const v = localStorage.getItem("gf_letter_bg_volume");
    if (!v || v === "20") {
      localStorage.setItem("gf_letter_bg_volume", "7");
      return "7";
    }
    return v || (DEFAULTS.letterBgVolume !== undefined ? DEFAULTS.letterBgVolume : 7);
  })(), 10),
  bonusLof: 0,
  musicPlaying: false
};

function isAdminEditAllowed() {
  return true;
}
window.isAdminEditAllowed = isAdminEditAllowed;

function applyAdminEditMode(allowed) {
  document.body.classList.toggle("admin-edit-on", !!allowed);
  document.body.classList.toggle("admin-mode", !!allowed);
  const noBtn = document.getElementById("adminEditNoBtn");
  const yesBtn = document.getElementById("adminEditYesBtn");
  const hiddenInput = document.getElementById("inputAdminEdit");
  if (noBtn && yesBtn) {
    noBtn.classList.toggle("active", !allowed);
    yesBtn.classList.toggle("active", !!allowed);
  }
  if (hiddenInput) hiddenInput.value = allowed ? "yes" : "no";
}
window.applyAdminEditMode = applyAdminEditMode;

// Live LDR Clocks (Algeria & Jakarta)
function updateLDRClocks() {
  const hour12 = (localStorage.getItem("gf_clock_format") === "12");
  const now = new Date();
  const timeAlgStr = now.toLocaleTimeString("en-US", { timeZone: "Africa/Algiers", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12 });
  const timeJakStr = now.toLocaleTimeString("en-US", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12 });

  document.querySelectorAll(".time-alg-live").forEach(el => { el.textContent = timeAlgStr; });
  document.querySelectorAll(".time-jak-live").forEach(el => { el.textContent = timeJakStr; });

  const diffBadge = document.getElementById("ldrTimeDiffBadge");
  if (diffBadge) {
    diffBadge.textContent = "6 Hours Apart in Time • 0.00 mm Apart in Heart ❤️";
  }
}

// Quintillion Live Counter Engine
function formatQuintillion(bigNum) {
  return bigNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let tickerSubStep = 0n;
let cachedTickerPace = null;

let isQuintillionInView = true;
function setupQuintillionObserver() {
  if (!("IntersectionObserver" in window)) return;
  isQuintillionInView = false;
  const targets = [document.getElementById("quintillionNumber"), document.getElementById("meterQuintillionNumber")].filter(Boolean);
  if (!targets.length) { isQuintillionInView = true; return; }
  const observer = new IntersectionObserver((entries) => {
    isQuintillionInView = entries.some(e => e.isIntersecting);
    if (isQuintillionInView) updateQuintillionLive();
  }, { threshold: 0.05 });
  targets.forEach(t => observer.observe(t));
}
window.setupQuintillionObserver = setupQuintillionObserver;

function updateQuintillionLive() {
  if (document.hidden || !isQuintillionInView) return;
  const start = new Date(state.startDate).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - start);

  // Baseline Big Number starting in the quintillions
  const baseQuintillion = BigInt("9847293847192840000");
  if (cachedTickerPace === null) {
    cachedTickerPace = parseInt(localStorage.getItem("gf_ticker_pace")) || 17;
  }
  tickerSubStep += BigInt(cachedTickerPace);
  const liveLof = baseQuintillion + BigInt(Math.floor(diffMs / 1000) * 120) + tickerSubStep + BigInt(state.bonusLof);

  const formatted = formatQuintillion(liveLof);
  const qEl = document.getElementById("quintillionNumber");
  const qMeterEl = document.getElementById("meterQuintillionNumber");
  const daysEl = document.getElementById("daysTogetherCount");

  if (qEl) qEl.textContent = formatted;
  if (qMeterEl && !qMeterEl.getAttribute("data-infinity")) qMeterEl.textContent = formatted;

  if (daysEl) {
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    daysEl.textContent = days;
  }
}

// UI Initialization & Renderers
function renderDOM() {
  // Apply saved theme
  const currentDataTheme = document.documentElement.getAttribute("data-theme") || document.body.getAttribute("data-theme");
  const themeClass = currentDataTheme ? (currentDataTheme.startsWith("theme-") ? currentDataTheme : `theme-${currentDataTheme}`) : (`theme-${localStorage.getItem("gf_theme") || "pink"}`);
  const isAdmin = isAdminEditAllowed();
  const themeClasses = ["theme-pink", "theme-purple", "theme-gold", "theme-midnight", "theme-emerald", "theme-peach", "theme-sakura", "theme-sunset", "theme-ruby", "theme-lavender", "theme-birthday", "theme-birthday-cake", "theme-birthday-midnight", "theme-birthday-pastel", "theme-birthday-carnival", "theme-birthday-emoji", "theme-birthday-pixel", "theme-birthday-neon", "theme-birthday-papercraft", "theme-birthday-watercolor", "theme-watercolor-frame", "theme-pop-stickers", "theme-doodle-tapestry", "theme-img-watercolor-frame", "theme-img-pop-stickers", "theme-img-doodle-tapestry", "theme-img-gold-hearts", "theme-img-love-letter", "theme-img-be-mine", "theme-img-sweet-couple", "theme-img-line-hearts", "theme-img-stitched-hearts", "theme-img-heart-podiums", "theme-img-paper-sunset", "theme-apology", "theme-anniversary", "theme-scrapbook"];
  document.body.classList.remove(...themeClasses);
  Array.from(document.body.classList).filter(c => c.startsWith("theme-")).forEach(c => document.body.classList.remove(c));
  document.body.classList.add(themeClass);
  if (isAdmin) document.body.classList.add("admin-edit-on", "admin-mode");

  // Apply particles
  if (typeof particles !== "undefined" && particles.updateSymbols) {
    particles.updateSymbols();
  }

  // Apply thematic backdrop art
  if (typeof updateThemeBackdropDecorations === "function") {
    updateThemeBackdropDecorations(themeClass);
  }

  document.querySelectorAll(".partner-name-display").forEach(el => {
    el.textContent = state.partnerName || "Ella";
  });
  document.querySelectorAll(".recipient-name-preview").forEach(el => {
    el.textContent = state.partnerName || "Ella";
  });

  const senderEl = document.getElementById("senderNameDisplay");
  if (senderEl) senderEl.textContent = state.senderName;

  const certSender = document.getElementById("certSenderName");
  if (certSender) certSender.textContent = state.senderName;

  const giftTitle = document.getElementById("giftRevealTitle");
  const giftDesc = document.getElementById("giftRevealDesc");
  if (giftTitle) giftTitle.textContent = state.giftTitle;
  if (giftDesc) giftDesc.textContent = state.giftDesc;

  const anniDateEl = document.getElementById("anniversaryDateDisplay");
  if (anniDateEl && state.startDate) {
    const d = new Date(state.startDate);
    if (!isNaN(d.getTime())) {
      anniDateEl.textContent = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const daysEl = document.getElementById("daysTogetherCount");
      if (daysEl) {
        daysEl.textContent = Math.floor(Math.max(0, Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
  }

  // Boarding pass details
  const ticketSeat = document.getElementById("ticketSeatVal") || document.querySelector(".boarding-pass-card .highlight-gold");
  const savedSeat = localStorage.getItem("gf_seat_number");
  if (ticketSeat && savedSeat) ticketSeat.textContent = savedSeat;

  const ticketFlight = document.getElementById("ticketFlightVal") || document.querySelectorAll(".boarding-pass-card .t-val")[2];
  const savedFlight = localStorage.getItem("gf_flight_number");
  if (ticketFlight && savedFlight) ticketFlight.textContent = savedFlight;

  // Pump Button Label
  const pumpBtnSpan = document.querySelector("#pumpMeterBtn span");
  const savedPumpLabel = localStorage.getItem("gf_pump_label");
  if (pumpBtnSpan && savedPumpLabel) pumpBtnSpan.textContent = savedPumpLabel;

  // Wax Seal
  const sealIcon = document.querySelector(".envelope-seal");
  const savedSeal = localStorage.getItem("gf_envelope_seal");
  if (sealIcon && savedSeal) sealIcon.textContent = savedSeal;

  const savedAlg = localStorage.getItem("gf_city_alg");
  const savedJak = localStorage.getItem("gf_city_jak");
  const algTitle = document.querySelector("#clockAlgeria .clock-title");
  const jakTitle = document.querySelector("#clockJakarta .clock-title");
  if (algTitle && savedAlg) algTitle.textContent = savedAlg;
  if (jakTitle && savedJak) jakTitle.textContent = savedJak;

  const letterEl = document.getElementById("letterContent");
  if (letterEl) {
    const rawParas = state.letter.split("\n\n");
    const bodyParas = (rawParas.length > 0 && rawParas[0].trim().toLowerCase().startsWith("dearest")) ? rawParas.slice(1) : rawParas;
    letterEl.innerHTML = bodyParas
      .map(para => `<p>${para.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  // Populate settings inputs
  const inputName = document.getElementById("inputPartnerName");
  const inputNick = document.getElementById("inputPartnerNick");
  const inputSender = document.getElementById("inputSenderName");
  const inputSpecial = document.getElementById("inputSpecialWord");
  const inputStart = document.getElementById("inputStartDate");
  const inputLetter = document.getElementById("inputLetter");
  const inputGiftTitle = document.getElementById("inputGiftTitle");
  const inputGiftDesc = document.getElementById("inputGiftDesc");
  const inputSeat = document.getElementById("inputSeatNumber");
  const inputFlight = document.getElementById("inputFlightNumber");
  const inputBoyfriendPhone = document.getElementById("inputBoyfriendPhone");
  const inputSeal = document.getElementById("inputEnvelopeSeal");
  const inputParticleStyle = document.getElementById("inputParticleStyle");
  const inputParticleDensity = document.getElementById("inputParticleDensity");
  const inputClockFormat = document.getElementById("inputClockFormat");
  const inputPumpLabel = document.getElementById("inputPumpLabel");

  if (inputName) inputName.value = state.partnerName;
  if (inputNick) inputNick.value = localStorage.getItem("gf_partner_nick") || "My Indonesian Princess 👑";
  if (inputSender) inputSender.value = state.senderName;
  if (inputSpecial) inputSpecial.value = localStorage.getItem("gf_special_word") || "Pupu";
  if (inputStart) inputStart.value = state.startDate;
  if (inputLetter) inputLetter.value = state.letter;
  if (inputGiftTitle) inputGiftTitle.value = state.giftTitle;
  if (inputGiftDesc) inputGiftDesc.value = state.giftDesc;
  if (inputSeat) inputSeat.value = localStorage.getItem("gf_seat_number") || "1A (Beside Me Forever)";
  if (inputFlight) inputFlight.value = localStorage.getItem("gf_flight_number") || "LOF-999";
  if (inputBoyfriendPhone) inputBoyfriendPhone.value = localStorage.getItem("gf_boyfriend_phone") || "";
  if (inputSeal) inputSeal.value = localStorage.getItem("gf_envelope_seal") || "❤️";
  if (inputParticleStyle) inputParticleStyle.value = localStorage.getItem("gf_particle_style") || "hearts";
  if (inputParticleDensity) inputParticleDensity.value = localStorage.getItem("gf_particle_density") || "45";
  if (inputClockFormat) inputClockFormat.value = localStorage.getItem("gf_clock_format") || "24";
  if (inputPumpLabel) inputPumpLabel.value = localStorage.getItem("gf_pump_label") || "Pump Lof Lof! 💖 (+500 Quadrillion)";

  const inVoice = document.getElementById("inputVoiceVolume");
  const inVoiceVal = document.getElementById("inputVoiceVolumeVal");
  if (inVoice) {
    const val = state.voiceVolume !== undefined ? state.voiceVolume : 300;
    inVoice.value = val;
    if (inVoiceVal) inVoiceVal.textContent = val > 100 ? `${val}% ⚡` : `${val}%`;
  }

  const inLetterVoice = document.getElementById("inputLetterVoiceVolume");
  const inLetterVoiceVal = document.getElementById("inputLetterVoiceVolumeVal");
  if (inLetterVoice) {
    const val = state.letterVoiceVolume !== undefined ? state.letterVoiceVolume : 300;
    inLetterVoice.value = val;
    if (inLetterVoiceVal) inLetterVoiceVal.textContent = val > 100 ? `${val}% ⚡` : `${val}%`;
  }
  const inVoiceBg = document.getElementById("inputVoiceBgVolume");
  const inVoiceBgVal = document.getElementById("inputVoiceBgVolumeVal");
  if (inVoiceBg) {
    const val = state.voiceBgVolume !== undefined ? state.voiceBgVolume : 7;
    inVoiceBg.value = val;
    if (inVoiceBgVal) inVoiceBgVal.textContent = `${val}%`;
  }

  const inLetterBg = document.getElementById("inputLetterBgVolume");
  const inLetterBgVal = document.getElementById("inputLetterBgVolumeVal");
  if (inLetterBg) {
    const val = state.letterBgVolume !== undefined ? state.letterBgVolume : 7;
    inLetterBg.value = val;
    if (inLetterBgVal) inLetterBgVal.textContent = `${val}%`;
  }

  const reasonsCountEl = document.getElementById("customReasonsCount");
  if (reasonsCountEl) reasonsCountEl.textContent = `Loaded in deck: ${REASONS.length} reasons ✨`;

  renderPolaroids();
  renderTimeline();
  applyAdminEditMode(isAdminEditAllowed());
}

// Priority Image Preloader Engine
const _preloadedImageUrls = new Set();
function preloadImage(url, priority = "low") {
  if (!url || _preloadedImageUrls.has(url) || url.startsWith("data:")) return;
  _preloadedImageUrls.add(url);
  const img = new Image();
  if ("fetchPriority" in img) img.fetchPriority = priority;
  img.decoding = "async";
  img.src = url;
}
window.preloadImage = preloadImage;

function preloadPriorityImages() {
  if (typeof TIMELINE_CHAPTERS !== "undefined" && Array.isArray(TIMELINE_CHAPTERS)) {
    TIMELINE_CHAPTERS.slice(0, 3).forEach(ch => {
      const p = (typeof getCityPhotoData === "function") ? getCityPhotoData(ch.id, ch.cityKey) : null;
      if (p && p.img) preloadImage(p.img, "high");
    });
  }
  if (state && Array.isArray(state.memories)) {
    state.memories.slice(0, 6).forEach(m => {
      if (m && m.img) preloadImage(m.img, "auto");
    });
  }
}
window.preloadPriorityImages = preloadPriorityImages;

function preloadRemainingImagesProgressively() {
  const queue = [];
  if (typeof TIMELINE_CHAPTERS !== "undefined" && Array.isArray(TIMELINE_CHAPTERS)) {
    TIMELINE_CHAPTERS.slice(3).forEach(ch => {
      const p = (typeof getCityPhotoData === "function") ? getCityPhotoData(ch.id, ch.cityKey) : null;
      if (p && p.img) queue.push(p.img);
    });
  }
  if (state && Array.isArray(state.memories)) {
    state.memories.slice(6).forEach(m => {
      if (m && m.img) queue.push(m.img);
    });
  }

  let idx = 0;
  const processBatch = () => {
    if (idx >= queue.length) return;
    const batch = queue.slice(idx, idx + 3);
    idx += 3;
    batch.forEach(src => preloadImage(src, "low"));
    if (idx < queue.length) {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(processBatch, { timeout: 1200 });
      } else {
        setTimeout(processBatch, 600);
      }
    }
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(processBatch, { timeout: 1000 });
  } else {
    setTimeout(processBatch, 400);
  }
}
window.preloadRemainingImagesProgressively = preloadRemainingImagesProgressively;

function setupLoveConnectionHub() {
  const hubCard = document.getElementById("loveConnectionHub");
  const btnHubSync = document.getElementById("btnHubSync");
  const hubKmValue = document.getElementById("hubKmValue");
  const hubAlgBpm = document.getElementById("hubAlgBpm");
  const hubJakBpm = document.getElementById("hubJakBpm");
  const hubBpmDisplay = document.getElementById("hubBpmDisplay");
  const hubDistanceSubtext = document.getElementById("hubDistanceSubtext");
  const hubWhisperQuote = document.getElementById("hubWhisperQuote");
  const hubLiveTag = document.getElementById("hubLiveTag");
  const ringAlg = document.getElementById("hubAvatarLeftRing");
  const ringJak = document.getElementById("hubAvatarRightRing");
  const hubEkg = document.getElementById("hubEkgPath");
  if (!btnHubSync || !hubCard || !hubKmValue) return;

  const originalKmStr = hubKmValue.getAttribute("data-orig-km") || hubKmValue.textContent.trim() || "11,550";
  const originalKmNum = parseInt(originalKmStr.replace(/[^\d]/g, ""), 10) || 11550;
  const originalQuote = hubWhisperQuote ? hubWhisperQuote.textContent : `"Two hearts across ${originalKmStr} km beating in one exact rhythm 💕"`;

  let isHubBusy = false;
  btnHubSync.onclick = () => {
    if (isHubBusy) return;
    isHubBusy = true;

    const track = document.getElementById("hubStageTrack");
    if (track && ringAlg && ringJak) {
      const trackRect = track.getBoundingClientRect();
      const leftRingRect = ringAlg.getBoundingClientRect();
      const rightRingRect = ringJak.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      const pullLeft = (trackCenter - (ringAlg.offsetWidth / 2)) - leftRingRect.left + 4;
      const pullRight = (trackCenter + (ringJak.offsetWidth / 2)) - rightRingRect.right - 4;
      hubCard.style.setProperty("--pull-left", `${Math.round(pullLeft)}px`);
      hubCard.style.setProperty("--pull-right", `${Math.round(pullRight)}px`);
    }

    hubCard.classList.add("is-synced");
    ringAlg?.classList.add("pulse-synced");
    ringJak?.classList.add("pulse-synced");
    hubEkg?.classList.add("ekg-synced");

    if (hubAlgBpm) hubAlgBpm.textContent = "80";
    if (hubJakBpm) hubJakBpm.textContent = "80";
    if (hubBpmDisplay) hubBpmDisplay.textContent = "80 BPM Locked In Sync 💖";
    if (hubDistanceSubtext) hubDistanceSubtext.textContent = "Distance = 0.00 KM • In Your Warm Embrace ❤️";
    if (hubWhisperQuote) hubWhisperQuote.textContent = "“0 km between our souls — together forever 💕”";
    if (hubLiveTag) hubLiveTag.textContent = "Souls Locked In Sync ✨";

    if (typeof audio !== "undefined" && audio.playChimeCascade) audio.playChimeCascade();
    if (navigator.vibrate) navigator.vibrate([40, 60, 40, 80]);

    const startKm = originalKmNum;
    const startTs = performance.now();
    const dur = 1100;
    const stepKm = (now) => {
      const p = Math.min(1, (now - startTs) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      const curr = Math.round(startKm * (1 - ease));
      hubKmValue.textContent = p >= 1 ? "0.00" : curr.toLocaleString();
      if (p < 1) {
        requestAnimationFrame(stepKm);
      } else {
        if (typeof audio !== "undefined" && audio.playKiss) audio.playKiss();
        const r = btnHubSync.getBoundingClientRect();
        if (typeof particles !== "undefined" && particles.burst) particles.burst(r.left + r.width / 2, r.top + r.height / 2, 45);
        if (typeof showComplimentToast === "function") showComplimentToast(r.left + r.width / 2, r.top, "🧲 Distance collapsed to 0.00 KM! Two hearts beating as one 💕");
      }
    };
    requestAnimationFrame(stepKm);

    setTimeout(() => {
      hubCard.classList.remove("is-synced");
      hubCard.style.removeProperty("--pull-left");
      hubCard.style.removeProperty("--pull-right");
      ringAlg?.classList.remove("pulse-synced");
      ringJak?.classList.remove("pulse-synced");
      hubEkg?.classList.remove("ekg-synced");

      if (hubKmValue) hubKmValue.textContent = originalKmStr;
      if (hubAlgBpm) hubAlgBpm.textContent = "76";
      if (hubJakBpm) hubJakBpm.textContent = "78";
      if (hubBpmDisplay) hubBpmDisplay.textContent = "78 BPM In Sync";
      if (hubDistanceSubtext) hubDistanceSubtext.textContent = "Physical Distance • Tap Below to Collapse";
      if (hubWhisperQuote) hubWhisperQuote.textContent = originalQuote;
      if (hubLiveTag) hubLiveTag.textContent = "Synchronized in Heart & Soul";
      isHubBusy = false;
    }, 5000);
  };
}
window.setupLoveConnectionHub = setupLoveConnectionHub;

// Event Listeners Setup
function initEvents() {
  const envelopeScreen = document.getElementById("envelopeScreen");
  const mainEnvelopeCard = document.getElementById("mainEnvelopeCard");
  const mainApp = document.getElementById("mainApp") || document.getElementById("modularGridContainer");
  const openBtn = document.getElementById("openEnvelopeBtn");
  const samplePlayer = document.getElementById("sampleAudioPlayer");

  const triggerOpen = () => {
    if (!currentChosenSong) {
      const chips = document.querySelectorAll(".soundtrack-chip, .soundtrack-card");
      if (chips.length > 0) {
        chips[0].click();
      } else {
        currentChosenSong = {
          src: "taylor-swift-fate-of-ophelia.m4r",
          title: "The Fate of Ophelia",
          artist: "Taylor Swift ✨"
        };
      }
    }

    // Stop sample preview if playing
    if (typeof stopSampleAudio === "function") {
      stopSampleAudio();
    } else if (currentSampleAudio) {
      currentSampleAudio.pause();
      currentSampleAudio = null;
    }
    if (samplePlayer) {
      samplePlayer.pause();
      samplePlayer.currentTime = 0;
    }

    audio.init();
    audio.playFanfare();
    audio.playChimeCascade();

    if (mainEnvelopeCard) {
      mainEnvelopeCard.classList.add("envelope-opening-active");
    }

    const rect = openBtn ? openBtn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    if (typeof window.spawnRealisticFloralScreenBurst === "function") {
      window.spawnRealisticFloralScreenBurst(originX, originY);
    }
    particles.burst(originX, originY, 50);
    particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);

    const bgAudio = document.getElementById("bgAudioPlayer");
    if (bgAudio) {
      bgAudio.src = currentChosenSong.src;
      bgAudio.currentTime = 0;
    }

    setTimeout(() => {
      document.body.classList.add("letter-unsealed");
      if (envelopeScreen) envelopeScreen.classList.add("opened");
      if (mainApp) {
        mainApp.classList.remove("hidden");
        mainApp.classList.add("app-revealed");
      }
      if (typeof window.fadeAndRemoveFloralScreen === "function") {
        window.fadeAndRemoveFloralScreen(100);
      }
      renderScratchCoupons();
      renderQuizStep();
      if (!state.musicPlaying) {
        audio.toggleMusic();
      }
      showComplimentToast(window.innerWidth / 2, 100, `🎂 Happy Celebration ${state.partnerName || "Sweetheart"}! Welcome to your magical world! 💖🎉`);
      preloadRemainingImagesProgressively();
    }, 2100);
  };

  if (openBtn) {
    openBtn.addEventListener("click", triggerOpen);
    openBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") triggerOpen();
    });
  }

  if (mainEnvelopeCard) {
    mainEnvelopeCard.style.cursor = "pointer";
    mainEnvelopeCard.addEventListener("click", (e) => {
      if (!e.target.closest("#openEnvelopeBtn")) {
        triggerOpen();
      }
    });
  }

  // Direct Kiss to Algeria Launcher
  const sendKissBtn = document.getElementById("sendKissToAlgeriaBtn");
  if (sendKissBtn) {
    sendKissBtn.addEventListener("click", () => {
      audio.playKiss();
      audio.playChimeCascade();
      state.bonusLof += 1000000000000;
      const rect = sendKissBtn.getBoundingClientRect();
      spawnKissStamp(rect.left + rect.width / 2, rect.top);
      spawnKissFlurry(4);
      particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
      showComplimentToast(rect.left, rect.top, "💋 Instant Kiss Delivered to Algeria! (+1 Trillion Lof) 🇩🇿❤️");
    });
  }

  // Unified Love Connection Hub (Heartbeat + Distance Compactor)
  setupLoveConnectionHub();

  const musicToggle = document.getElementById("musicToggle");
  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      audio.toggleMusic();
    });
  }

  const burstHeartsBtn = document.getElementById("burstHeartsBtn");
  if (burstHeartsBtn) {
    burstHeartsBtn.addEventListener("click", (e) => {
      const r = e.target.getBoundingClientRect();
      particles.burst(r.left + r.width / 2, r.top + r.height / 2, 35);
      state.bonusLof += 500000000000;
      showComplimentToast(r.left, r.top, "Lof Reaction Sent! 💖 (+500B)");
      audio.playKiss();
    });
  }

  document.getElementById("closeLightbox")?.addEventListener("click", closeLightbox);
  document.getElementById("lightboxBackdrop")?.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  document.getElementById("closeCelebration")?.addEventListener("click", () => {
    document.getElementById("celebrationModal")?.classList.add("hidden");
  });
  document.getElementById("celebrationBackdrop")?.addEventListener("click", () => {
    document.getElementById("celebrationModal")?.classList.add("hidden");
  });

  // Certificate Modal & Claim Hugs
  document.getElementById("claimCertificateHugs")?.addEventListener("click", () => {
    document.getElementById("certificateModal")?.classList.add("hidden");
    triggerHugKissOverlay();
  });
  document.getElementById("certificateBackdrop")?.addEventListener("click", () => {
    document.getElementById("certificateModal")?.classList.add("hidden");
  });

  // Close Hug Overlay
  const closeHugBtn = document.getElementById("closeHugKissBtn");
  if (closeHugBtn) {
    closeHugBtn.addEventListener("click", () => {
      document.getElementById("hugKissOverlay")?.classList.add("hidden");
      audio.playChimeCascade();
    });
  }

  const settingsDrawer = document.getElementById("settingsDrawer");
  const settingsToggle = document.getElementById("settingsToggle");
  if (settingsToggle) {
    settingsToggle.addEventListener("click", () => {
      if (settingsDrawer) {
        settingsDrawer.classList.remove("hidden");
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "SELECT_WIDGET", widgetId: "hero" }, "*");
      } else {
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const slug = pathParts[1] || "demo";
        window.location.href = `/builder?slug=${encodeURIComponent(slug)}`;
      }
    });
  }
  document.getElementById("closeSettings")?.addEventListener("click", () => {
    settingsDrawer?.classList.add("hidden");
  });
  document.getElementById("settingsBackdrop")?.addEventListener("click", () => {
    settingsDrawer?.classList.add("hidden");
  });

  const adminNoBtn = document.getElementById("adminEditNoBtn");
  const adminYesBtn = document.getElementById("adminEditYesBtn");
  if (adminNoBtn && adminYesBtn) {
    adminNoBtn.addEventListener("click", () => {
      applyAdminEditMode(false);
      localStorage.setItem("gf_admin_edit", "no");
      audio.playPop();
    });
    adminYesBtn.addEventListener("click", () => {
      applyAdminEditMode(true);
      localStorage.setItem("gf_admin_edit", "yes");
      audio.playSparkle();
      particles.burst(window.innerWidth / 2, window.innerHeight / 2, 25);
    });
  }

  const themeBtns = document.querySelectorAll(".theme-chip-btn");
  const currentTheme = localStorage.getItem("gf_theme") || "pink";
  themeBtns.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-theme") === currentTheme);
    btn.addEventListener("click", () => {
      themeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const theme = btn.getAttribute("data-theme");
      const isAdmin = isAdminEditAllowed();
      document.body.className = `theme-${theme}${isAdmin ? " admin-edit-on admin-mode" : ""}`;
      localStorage.setItem("gf_theme", theme);
      audio.playPop();
    });
  });

  const paceSelect = document.getElementById("inputTickerPace");
  if (paceSelect) {
    const savedPace = localStorage.getItem("gf_ticker_pace");
    if (savedPace) paceSelect.value = savedPace;
  }

  const inputCityAlg = document.getElementById("inputCityAlg");
  const inputCityJak = document.getElementById("inputCityJak");
  if (inputCityAlg) {
    const savedAlg = localStorage.getItem("gf_city_alg");
    if (savedAlg) inputCityAlg.value = savedAlg;
  }
  if (inputCityJak) {
    const savedJak = localStorage.getItem("gf_city_jak");
    if (savedJak) inputCityJak.value = savedJak;
  }

  // Add Custom Reason to Love Deck
  const btnAddReason = document.getElementById("btnAddCustomReason");
  if (btnAddReason) {
    btnAddReason.addEventListener("click", () => {
      const input = document.getElementById("inputNewReason");
      const val = input ? input.value.trim() : "";
      if (!val) {
        alert("Please write a sweet reason before adding! 💖");
        return;
      }
      const customList = JSON.parse(localStorage.getItem("gf_custom_reasons")) || [];
      customList.push(val);
      localStorage.setItem("gf_custom_reasons", JSON.stringify(customList));
      const newReasonItem = {
        category: "romance",
        tag: `💌 Reason #${REASONS.length + 1}`,
        note: val,
        footnote: "Always and forever in my heart.",
        badgeIcon: "💖",
        id: `custom-${Date.now()}`
      };
      REASONS.push(newReasonItem);
      try { localStorage.setItem("gf_reasons", JSON.stringify(REASONS)); } catch (e) {}
      if (typeof saveToComputer === "function") saveToComputer({ gf_reasons: JSON.stringify(REASONS) });
      input.value = "";
      const countEl = document.getElementById("customReasonsCount");
      if (countEl) countEl.textContent = `Loaded in deck: ${REASONS.length} reasons ✨`;
      updateFilterCounts();
      renderCurrentReason("shuffle");
      audio.playSparkle();
      particles.burst(window.innerWidth / 2, window.innerHeight / 2, 30);
    });
  }

  const inputVoiceVolume = document.getElementById("inputVoiceVolume");
  const inputVoiceVolumeVal = document.getElementById("inputVoiceVolumeVal");
  if (inputVoiceVolume) {
    const savedVoiceVol = parseInt(localStorage.getItem("gf_voice_volume") || "300", 10);
    inputVoiceVolume.value = savedVoiceVol;
    if (inputVoiceVolumeVal) inputVoiceVolumeVal.textContent = savedVoiceVol > 100 ? `${savedVoiceVol}% ⚡` : `${savedVoiceVol}%`;
    inputVoiceVolume.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (inputVoiceVolumeVal) inputVoiceVolumeVal.textContent = val > 100 ? `${val}% ⚡` : `${val}%`;
      localStorage.setItem("gf_voice_volume", val);
      state.voiceVolume = val;
      const voiceVolSlider = document.getElementById("voiceNoteVolumeSlider");
      const voiceVolVal = document.getElementById("voiceNoteVolVal");
      const voiceMuteBtn = document.getElementById("voiceNoteMuteBtn");
      if (voiceVolSlider) voiceVolSlider.value = val;
      if (voiceVolVal) {
        voiceVolVal.textContent = val > 100 ? `${val}% ⚡` : `${val}%`;
        voiceVolVal.classList.toggle("voice-vol-boosted", val > 100);
      }
      if (voiceMuteBtn) voiceMuteBtn.textContent = val === 0 ? "🔇" : (val < 50 ? "🔉" : (val > 100 ? "🔊⚡" : "🔊"));
    });
  }

  const inputVoiceBgVolume = document.getElementById("inputVoiceBgVolume");
  const inputVoiceBgVolumeVal = document.getElementById("inputVoiceBgVolumeVal");
  if (inputVoiceBgVolume) {
    const savedVoiceBgVol = parseInt(localStorage.getItem("gf_voice_bg_volume") || "7", 10);
    inputVoiceBgVolume.value = savedVoiceBgVol;
    if (inputVoiceBgVolumeVal) inputVoiceBgVolumeVal.textContent = `${savedVoiceBgVol}%`;
    inputVoiceBgVolume.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (inputVoiceBgVolumeVal) inputVoiceBgVolumeVal.textContent = `${val}%`;
      localStorage.setItem("gf_voice_bg_volume", val);
      state.voiceBgVolume = val;
      const voiceSlider = document.getElementById("voiceBgVolumeSlider");
      const voiceVal = document.getElementById("voiceBgVolVal");
      const voiceBtnText = document.getElementById("voiceBgVolBtnText");
      if (voiceSlider) voiceSlider.value = val;
      if (voiceVal) voiceVal.textContent = `${val}%`;
      if (voiceBtnText) voiceBtnText.textContent = `${val}%`;
      const voicePlayer = document.getElementById("voiceAudioPlayer");
      const bgAudio = document.getElementById("bgAudioPlayer");
      if (voicePlayer && !voicePlayer.paused && bgAudio) {
        bgAudio.volume = val / 100;
      }
    });
  }

  const inputLetterVoiceVolume = document.getElementById("inputLetterVoiceVolume");
  const inputLetterVoiceVolumeVal = document.getElementById("inputLetterVoiceVolumeVal");
  if (inputLetterVoiceVolume) {
    const savedLetterVoiceVol = parseInt(localStorage.getItem("gf_letter_voice_volume") || "300", 10);
    inputLetterVoiceVolume.value = savedLetterVoiceVol;
    if (inputLetterVoiceVolumeVal) inputLetterVoiceVolumeVal.textContent = savedLetterVoiceVol > 100 ? `${savedLetterVoiceVol}% ⚡` : `${savedLetterVoiceVol}%`;
    inputLetterVoiceVolume.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (inputLetterVoiceVolumeVal) inputLetterVoiceVolumeVal.textContent = val > 100 ? `${val}% ⚡` : `${val}%`;
      localStorage.setItem("gf_letter_voice_volume", val);
      state.letterVoiceVolume = val;
      const letterVolSlider = document.getElementById("letterVoiceVolumeSlider");
      const letterVolVal = document.getElementById("letterVoiceVolVal");
      const letterMuteBtn = document.getElementById("letterVoiceMuteBtn");
      if (letterVolSlider) letterVolSlider.value = val;
      if (letterVolVal) {
        letterVolVal.textContent = val > 100 ? `${val}% ⚡` : `${val}%`;
        letterVolVal.classList.toggle("voice-vol-boosted", val > 100);
      }
      if (letterMuteBtn) letterMuteBtn.textContent = val === 0 ? "🔇" : (val < 50 ? "🔉" : (val > 100 ? "🔊⚡" : "🔊"));
      if (window.applyLetterVoiceVolGain) window.applyLetterVoiceVolGain(val);
    });
  }

  const inputLetterBgVolume = document.getElementById("inputLetterBgVolume");
  const inputLetterBgVolumeVal = document.getElementById("inputLetterBgVolumeVal");
  if (inputLetterBgVolume) {
    const savedLetterBgVol = parseInt(localStorage.getItem("gf_letter_bg_volume") || "7", 10);
    inputLetterBgVolume.value = savedLetterBgVol;
    if (inputLetterBgVolumeVal) inputLetterBgVolumeVal.textContent = `${savedLetterBgVol}%`;
    inputLetterBgVolume.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (inputLetterBgVolumeVal) inputLetterBgVolumeVal.textContent = `${val}%`;
      localStorage.setItem("gf_letter_bg_volume", val);
      state.letterBgVolume = val;
      const letterSlider = document.getElementById("letterBgVolumeSlider");
      const letterVal = document.getElementById("letterBgVolVal");
      if (letterSlider) letterSlider.value = val;
      if (letterVal) letterVal.textContent = `${val}%`;
      const letterPlayer = document.getElementById("letterAudioPlayer");
      const bgAudio = document.getElementById("bgAudioPlayer");
      if (letterPlayer && !letterPlayer.paused && bgAudio) {
        bgAudio.volume = val / 100;
      }
    });
  }

  document.getElementById("settingsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    state.partnerName = document.getElementById("inputPartnerName")?.value?.trim() || DEFAULTS.partnerName;
    state.senderName = document.getElementById("inputSenderName")?.value?.trim() || DEFAULTS.senderName;
    state.startDate = document.getElementById("inputStartDate")?.value || DEFAULTS.startDate;
    state.letter = document.getElementById("inputLetter")?.value?.trim() || DEFAULTS.letter;
    state.giftTitle = document.getElementById("inputGiftTitle")?.value?.trim() || DEFAULTS.giftTitle;
    state.giftDesc = document.getElementById("inputGiftDesc")?.value?.trim() || DEFAULTS.giftDesc;

    const inputPartnerNick = document.getElementById("inputPartnerNick");
    const inputSpecialWord = document.getElementById("inputSpecialWord");
    const inputClockFormat = document.getElementById("inputClockFormat");
    const inputParticleStyle = document.getElementById("inputParticleStyle");
    const inputParticleDensity = document.getElementById("inputParticleDensity");
    const inputPumpLabel = document.getElementById("inputPumpLabel");
    const inputSeatNumber = document.getElementById("inputSeatNumber");
    const inputFlightNumber = document.getElementById("inputFlightNumber");
    const inputBoyfriendPhone = document.getElementById("inputBoyfriendPhone");
    const inputEnvelopeSeal = document.getElementById("inputEnvelopeSeal");

    if (inputPartnerNick) localStorage.setItem("gf_partner_nick", inputPartnerNick.value.trim());
    if (inputSpecialWord) localStorage.setItem("gf_special_word", inputSpecialWord.value.trim());
    if (inputClockFormat) localStorage.setItem("gf_clock_format", inputClockFormat.value);
    if (inputParticleStyle) {
      localStorage.setItem("gf_particle_style", inputParticleStyle.value);
      if (particles) particles.updateSymbols();
    }
    if (inputParticleDensity) localStorage.setItem("gf_particle_density", inputParticleDensity.value);
    if (inputPumpLabel) localStorage.setItem("gf_pump_label", inputPumpLabel.value.trim());
    if (inputSeatNumber) localStorage.setItem("gf_seat_number", inputSeatNumber.value.trim());
    if (inputFlightNumber) localStorage.setItem("gf_flight_number", inputFlightNumber.value.trim());
    if (inputBoyfriendPhone) localStorage.setItem("gf_boyfriend_phone", inputBoyfriendPhone.value.trim());
    if (inputEnvelopeSeal) localStorage.setItem("gf_envelope_seal", inputEnvelopeSeal.value);

    if (inputCityAlg) localStorage.setItem("gf_city_alg", inputCityAlg.value.trim() || "Algeria 🇩🇿");
    if (paceSelect) {
      localStorage.setItem("gf_ticker_pace", paceSelect.value);
      cachedTickerPace = parseInt(paceSelect.value) || 17;
    }

    const inputAdminEdit = document.getElementById("inputAdminEdit");
    if (inputAdminEdit) {
      localStorage.setItem("gf_admin_edit", inputAdminEdit.value);
      applyAdminEditMode(inputAdminEdit.value === "yes");
    }

    if (inputVoiceVolume) {
      localStorage.setItem("gf_voice_volume", inputVoiceVolume.value);
      state.voiceVolume = parseInt(inputVoiceVolume.value, 10);
    }

    if (inputVoiceBgVolume) {
      localStorage.setItem("gf_voice_bg_volume", inputVoiceBgVolume.value);
      state.voiceBgVolume = parseInt(inputVoiceBgVolume.value, 10);
    }

    if (inputLetterVoiceVolume) {
      localStorage.setItem("gf_letter_voice_volume", inputLetterVoiceVolume.value);
      state.letterVoiceVolume = parseInt(inputLetterVoiceVolume.value, 10);
    }

    if (inputLetterBgVolume) {
      localStorage.setItem("gf_letter_bg_volume", inputLetterBgVolume.value);
      state.letterBgVolume = parseInt(inputLetterBgVolume.value, 10);
    }

    localStorage.setItem("gf_name", state.partnerName);
    localStorage.setItem("gf_sender", state.senderName);
    localStorage.setItem("gf_start_date", state.startDate);
    localStorage.setItem("gf_letter", state.letter);
    localStorage.setItem("gf_gift_title", state.giftTitle);
    localStorage.setItem("gf_gift_desc", state.giftDesc);
    if (typeof saveToComputer === "function") saveToComputer();

    renderDOM();
    if (settingsDrawer) settingsDrawer.classList.add("hidden");
    audio.playSparkle();
    particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
  });

  document.getElementById("resetDefaultsBtn")?.addEventListener("click", async () => {
    if (!confirm("Reset all settings and data back to defaults?")) return;
    localStorage.clear();
    applyAdminEditMode(true);
    if (typeof resetServerData === "function") await resetServerData();
    state = {
      ...DEFAULTS,
      memories: JSON.parse(JSON.stringify(DEFAULTS.memories)),
      voiceVolume: DEFAULTS.voiceVolume || 300,
      voiceBgVolume: DEFAULTS.voiceBgVolume || 7,
      letterVoiceVolume: DEFAULTS.letterVoiceVolume || 300,
      letterBgVolume: DEFAULTS.letterBgVolume || 7,
      musicPlaying: state.musicPlaying
    };
    REASONS = [...RICH_REASONS];
    renderDOM();
    if (typeof renderCurrentReason === "function") renderCurrentReason(true);
    settingsDrawer.classList.add("hidden");
    audio.playPop();
  });

  initDirectMemoryEditor();
  initDirectChapterEditor();
  if (typeof initDirectReasonEditor === "function") initDirectReasonEditor();

  const addMemoryBtn = document.getElementById("addMemoryBtn");
  if (addMemoryBtn) {
    addMemoryBtn.addEventListener("click", () => openDirectMemoryEditor(null));
  }

  setupIntroSoundtrackSelector();
  setupPlayfulGame();
  setupLoveMeter();
  setupReasonsDeck();
  setupInteractiveMap();
  setupTruthOrDareGame();
  setupDateSpinner();
  setupGiftBox();
  setupVoiceNotePlayer();
  initLoveBubbles();
  initMagicCursor();
  setupAudioVisualizerAndVolume();
  if (audio && typeof audio.setupEndedListener === "function") {
    audio.setupEndedListener();
  }
  setupLoveLetterFeatures();
  setupMemoryFilterAndSlideshow();
  setupCertificateDownload();
  preloadPriorityImages();
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  applyAdminEditMode(isAdminEditAllowed());
  particles = new ParticleEngine("particleCanvas");

  // Immediate synchronous first render from local storage (0ms wait)
  renderDOM();
  initEvents();
  if (typeof updateFilterCounts === "function") updateFilterCounts();
  if (typeof renderCurrentReason === "function") renderCurrentReason(false);
  if (typeof renderAllNotesDrawer === "function") renderAllNotesDrawer();
  setupQuintillionObserver();
  updateQuintillionLive();
  updateLDRClocks();
  setInterval(updateQuintillionLive, 250);
  setInterval(updateLDRClocks, 1000);

  // Background server & IndexedDB sync (zero UI blocking)
  (async () => {
    if (typeof syncComputerData === "function") {
      const synced = await syncComputerData();
      if (synced) {
        state.partnerName = localStorage.getItem("gf_name") || DEFAULTS.partnerName;
        state.senderName = localStorage.getItem("gf_sender") || DEFAULTS.senderName;
        let syncedStart = localStorage.getItem("gf_start_date");
        if (syncedStart && syncedStart.startsWith("2023")) {
          syncedStart = "2025-09-17T00:00";
          localStorage.setItem("gf_start_date", syncedStart);
        }
        state.startDate = syncedStart || DEFAULTS.startDate;
        state.letter = localStorage.getItem("gf_letter") || DEFAULTS.letter;
        state.giftTitle = localStorage.getItem("gf_gift_title") || DEFAULTS.giftTitle;
        state.giftDesc = localStorage.getItem("gf_gift_desc") || DEFAULTS.giftDesc;
        const rawVoice = localStorage.getItem("gf_voice_audio");
        state.voiceAudio = (rawVoice && rawVoice.includes("myrecording") && !rawVoice.includes("myrecording-volume-adjusted")) ? "audio/myrecording-volume-adjusted.mp3" : (rawVoice || DEFAULTS.voiceAudio || "audio/myrecording-volume-adjusted.mp3");
        state.letterAudio = localStorage.getItem("gf_letter_audio") || DEFAULTS.letterAudio || "audio/letter_voice-volume-adjusted.mp3";
        state.herVoiceAudio = null;
        state.customMusicAudio = localStorage.getItem("gf_music_audio") || null;
        
        const savedReasons = JSON.parse(localStorage.getItem("gf_reasons") || "null");
        if (Array.isArray(savedReasons) && savedReasons.length > 0) {
          REASONS = savedReasons;
        } else {
          const customList = JSON.parse(localStorage.getItem("gf_custom_reasons") || "[]");
          REASONS = [...RICH_REASONS, ...customList];
        }
        if (typeof loadStoredMemories === "function" && (!state.memories || state.memories.length === 0)) {
          state.memories = loadStoredMemories();
        }
        if (Array.isArray(state.memories)) {
          const seen = new Set();
          state.memories = state.memories.filter(m => m && m.id && !seen.has(m.id) && seen.add(m.id));
        }
        renderDOM();
        if (typeof updateFilterCounts === "function") updateFilterCounts();
        if (typeof renderCurrentReason === "function") renderCurrentReason(false);
      }
    }
    if (typeof syncLocalDbImages === "function") {
      await syncLocalDbImages();
    }
  })();
});
