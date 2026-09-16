/**
 * Runtime Widget Engine: love-letter.runtime.js
 * Modularized for high maintainability.
 */
const INDIVIDUAL_FLOWER_VARIETIES = [
  // Royal Peonies & Classic Blooms
  { url: "/images/flowers/flower_hydrangea.png", baseSize: 345, tier: "huge" },
  { url: "/images/flowers/flower_peony.png", baseSize: 325, tier: "huge" },
  { url: "/images/flowers/flower_pink_peony.png", baseSize: 320, tier: "huge" },
  { url: "/images/flowers/flower_stargazer.png", baseSize: 295, tier: "large" },
  { url: "/images/flowers/flower_lily.png", baseSize: 280, tier: "large" },
  { url: "/images/flowers/flower_peach_rose.png", baseSize: 235, tier: "medium-large" },
  { url: "/images/flowers/flower_rose.png", baseSize: 230, tier: "medium-large" },
  { url: "/images/flowers/flower_carnation.png", baseSize: 200, tier: "medium" },
  { url: "/images/flowers/flower_spray_rose.png", baseSize: 180, tier: "medium" },
  { url: "/images/flowers/flower_mini_rose.png", baseSize: 135, tier: "small" },
  { url: "/images/flowers/flower_rosebud.png", baseSize: 120, tier: "small" },
  // Sakura Cherry Blossoms
  { url: "/images/flowers/flower_sakura_1.png", baseSize: 310, tier: "large" },
  { url: "/images/flowers/flower_sakura_2.png", baseSize: 285, tier: "medium-large" },
  { url: "/images/flowers/flower_sakura_branch.png", baseSize: 340, tier: "huge" },
  // Golden Sunflowers & Daisies
  { url: "/images/flowers/flower_sunflower_1.png", baseSize: 350, tier: "huge" },
  { url: "/images/flowers/flower_sunflower_2.png", baseSize: 320, tier: "huge" },
  { url: "/images/flowers/flower_sunflower_bloom.png", baseSize: 300, tier: "large" },
  { url: "/images/flowers/flower_daisy_1.png", baseSize: 240, tier: "medium" },
  { url: "/images/flowers/flower_daisy_2.png", baseSize: 220, tier: "medium" },
  // Spring Tulips & Poppies
  { url: "/images/flowers/flower_tulip_red.png", baseSize: 310, tier: "large" },
  { url: "/images/flowers/flower_tulip_pink.png", baseSize: 300, tier: "large" },
  { url: "/images/flowers/flower_poppy_1.png", baseSize: 270, tier: "medium-large" },
  { url: "/images/flowers/flower_poppy_2.png", baseSize: 260, tier: "medium-large" },
  // Purple Lilacs & Violas
  { url: "/images/flowers/flower_lilac_1.png", baseSize: 330, tier: "huge" },
  { url: "/images/flowers/flower_lilac_2.png", baseSize: 310, tier: "large" },
  { url: "/images/flowers/flower_viola_purple.png", baseSize: 260, tier: "medium-large" },
  // Foliage & Petals
  { url: "/images/flowers/flower_eucalyptus.png", baseSize: 190, tier: "foliage" },
  { url: "/images/flowers/flower_eucalyptus_leaf.png", baseSize: 115, tier: "foliage" },
  { url: "/images/flowers/petal_1.png", baseSize: 90, tier: "petal" },
  { url: "/images/flowers/petal_2.png", baseSize: 85, tier: "petal" },
  { url: "/images/flowers/petal_3.png", baseSize: 80, tier: "petal" },
  { url: "/images/flowers/petal_4.png", baseSize: 75, tier: "petal" }
];

// Preload flower assets
INDIVIDUAL_FLOWER_VARIETIES.forEach(item => {
  const pre = new Image();
  pre.src = item.url;
});

window.ACTIVE_FLOWER_THEME = "royal-blend";

const FLOWER_THEMES = {
  "royal-blend": INDIVIDUAL_FLOWER_VARIETIES,
  "garden-roses": INDIVIDUAL_FLOWER_VARIETIES.filter(f => f.url.includes("rose") || f.tier === "petal"),
  "sakura-dream": INDIVIDUAL_FLOWER_VARIETIES.filter(f => f.url.includes("sakura") || f.url.includes("pink_peony") || f.tier === "petal"),
  "golden-sunflower": INDIVIDUAL_FLOWER_VARIETIES.filter(f => f.url.includes("sunflower") || f.url.includes("daisy") || f.url.includes("peach_rose")),
  "spring-tulips": INDIVIDUAL_FLOWER_VARIETIES.filter(f => f.url.includes("tulip") || f.url.includes("daisy") || f.url.includes("poppy") || f.url.includes("eucalyptus")),
  "lavender-lilac": INDIVIDUAL_FLOWER_VARIETIES.filter(f => f.url.includes("lilac") || f.url.includes("viola") || f.url.includes("hydrangea") || f.url.includes("peony"))
};

const initFlowerSelector = () => {
  const chips = document.querySelectorAll(".flower-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      window.ACTIVE_FLOWER_THEME = chip.getAttribute("data-style") || "royal-blend";
      if (typeof audio !== "undefined" && audio.playPop) {
        audio.playPop();
      }
    });
    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        chip.click();
      }
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFlowerSelector);
} else {
  initFlowerSelector();
}

let ambientPetalsInterval = null;

const spawnRealisticFloralScreenBurst = (originX, originY) => {
  let canvas = document.getElementById("individualFlowersCanvas");
  if (!canvas) {
    canvas = document.createElement("div");
    canvas.id = "individualFlowersCanvas";
    canvas.className = "individual-flowers-screen-canvas";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);
  }
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  canvas.classList.remove("fade-out");
  canvas.innerHTML = "";

  const letterSec = document.querySelector(".letter-section");
  if (letterSec) letterSec.classList.add("floral-active");

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const ox = (originX && !isNaN(originX)) ? originX : vw / 2;
  const oy = (originY && !isNaN(originY)) ? originY : vh / 2;

  const isMobile = vw < 768;
  const currentTheme = window.ACTIVE_FLOWER_THEME || "royal-blend";
  const pool = (FLOWER_THEMES[currentTheme] && FLOWER_THEMES[currentTheme].length > 0)
    ? FLOWER_THEMES[currentTheme]
    : INDIVIDUAL_FLOWER_VARIETIES;

  // Optimized screen-filling grid (balanced for maximum density + 60/120fps lock)
  const cols = isMobile ? 6 : 9;
  const rows = isMobile ? 8 : 6;
  const cellW = vw / cols;
  const cellH = vh / rows;
  const targets = [];

  // Primary grid targets with organic jitter and edge bleed
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jx = (Math.random() - 0.5) * (cellW * 0.55);
      const jy = (Math.random() - 0.5) * (cellH * 0.55);
      targets.push({
        x: Math.round((c + 0.5) * cellW + jx),
        y: Math.round((r + 0.5) * cellH + jy)
      });
    }
  }

  // Edge and center filler blooms to guarantee zero empty spots
  const extraBlooms = isMobile ? 14 : 20;
  for (let k = 0; k < extraBlooms; k++) {
    targets.push({
      x: Math.round((Math.random() * 1.12 - 0.06) * vw),
      y: Math.round((Math.random() * 1.12 - 0.06) * vh)
    });
  }

  // Radial distance sorting from wax seal for fluid outward wave
  targets.sort((a, b) => Math.hypot(a.x - ox, a.y - oy) - Math.hypot(b.x - ox, b.y - oy));

  const totalCount = targets.length;
  const baseMult = isMobile ? 1.05 : 1.34;

  for (let i = 0; i < totalCount; i++) {
    const item = pool[i % pool.length];
    const target = targets[i];
    const el = document.createElement("div");
    el.className = "screen-flower-cell";

    const scaleMult = (0.92 + Math.random() * 0.24);
    const size = Math.round(item.baseSize * baseMult * scaleMult);

    const destX = target.x;
    const destY = target.y;

    // Smooth parabolic arc: launches up from envelope mouth, then expands into screen
    const midDistRatio = 0.38;
    const midX = Math.round(ox + (destX - ox) * midDistRatio);
    const midY = Math.round(oy + (destY - oy) * midDistRatio - (55 + Math.random() * 65));

    // Continuous angular deceleration: 72% spin in first 38% of time, gentle settle to 100%
    const rotStart = Math.round((Math.random() - 0.5) * 80);
    const spinSpeed = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 220);
    const rotMid = Math.round(rotStart + spinSpeed * 0.72);
    const rotEnd = Math.round(rotStart + spinSpeed);

    const delayMs = Math.round((i / totalCount) * 580 + Math.random() * 20);
    const durationMs = Math.round(750 + Math.random() * 160);

    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    const img = document.createElement("img");
    img.src = item.url;
    img.alt = "Bloom";
    img.loading = "eager";
    el.appendChild(img);
    canvas.appendChild(el);

    // Monotonic scaling (0.08 -> 0.68 -> 1.0) with segmented easings for 100% fluid motion
    el.animate([
      {
        transform: `translate3d(${ox - size / 2}px, ${oy - size / 2}px, 0) scale(0.08) rotate(${rotStart}deg)`,
        opacity: 0,
        easing: "cubic-bezier(0.22, 0.61, 0.36, 1)"
      },
      {
        transform: `translate3d(${midX - size / 2}px, ${midY - size / 2}px, 0) scale(0.68) rotate(${rotMid}deg)`,
        opacity: 1,
        offset: 0.38,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      {
        transform: `translate3d(${destX - size / 2}px, ${destY - size / 2}px, 0) scale(1.0) rotate(${rotEnd}deg)`,
        opacity: 1
      }
    ], {
      duration: durationMs,
      delay: delayMs,
      fill: "forwards"
    });
  }
};

const fadeAndRemoveFloralScreen = (delayMs = 0) => {
  clearInterval(ambientPetalsInterval);
  const canvas = document.getElementById("individualFlowersCanvas");
  if (canvas) {
    setTimeout(() => {
      canvas.classList.add("fade-out");
      setTimeout(() => {
        canvas.innerHTML = "";
        canvas.classList.remove("fade-out");
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }, 880);
    }, delayMs);
  }
  document.querySelectorAll(".floating-flower-petal").forEach(p => {
    p.style.transition = "opacity 0.5s ease";
    p.style.opacity = "0";
    setTimeout(() => p.remove(), 550);
  });
  const letterSec = document.querySelector(".letter-section");
  if (letterSec) letterSec.classList.remove("floral-active");
};

const dismissRealisticFloralScreen = fadeAndRemoveFloralScreen;

window.spawnRealisticFloralScreenBurst = spawnRealisticFloralScreenBurst;
window.dismissRealisticFloralScreen = dismissRealisticFloralScreen;
window.fadeAndRemoveFloralScreen = fadeAndRemoveFloralScreen;

function setupLoveLetterFeatures() {
  const letterEl = document.getElementById("letterContent");
  const playBtn = document.getElementById("btnPlayLetter");
  const playIcon = document.getElementById("letterPlayIcon");
  const playText = document.getElementById("letterPlayText");
  const copyBtn = document.getElementById("btnCopyLetter");
  const letterPlayer = document.getElementById("letterAudioPlayer");
  const bgAudio = document.getElementById("bgAudioPlayer");

  const volBtn = document.getElementById("letterVolBtn");
  const volWrap = document.getElementById("letterVolWrap");
  const volPopover = document.getElementById("letterVolPopover");
  const voiceVolSlider = document.getElementById("letterVoiceVolumeSlider");
  const voiceVolVal = document.getElementById("letterVoiceVolVal");
  const voiceMuteBtn = document.getElementById("letterVoiceMuteBtn");
  const bgVolSlider = document.getElementById("letterBgVolumeSlider");
  const bgVolVal = document.getElementById("letterBgVolVal");
  const bgMuteBtn = document.getElementById("letterBgMuteBtn");

  if (!letterPlayer) return;

  const rawLetterSrc = state.letterAudio || "audio/letter_voice-volume-adjusted.m4r";
  let letterAudioSrc = rawLetterSrc;
  if (rawLetterSrc.includes("letter_voice") && !rawLetterSrc.includes("letter_voice-volume-adjusted")) {
    letterAudioSrc = "audio/letter_voice-volume-adjusted.m4r";
  }
  if (!letterPlayer.src || !letterPlayer.src.endsWith(letterAudioSrc)) {
    letterPlayer.src = letterAudioSrc;
    letterPlayer.load();
  }

  const envelopeWrap = document.getElementById("bdayLetterEnvelope");
  const envelopeCard = document.getElementById("bdayEnvelopeCard");
  const openBtn = document.getElementById("btnOpenBdayLetter");
  const openedWrap = document.getElementById("bdayLetterOpened");
  const resealBtn = document.getElementById("btnResealLetter");

  if (openedWrap) {
    openedWrap.classList.add("hidden");
    openedWrap.style.display = "none";
  }
  if (envelopeWrap) {
    envelopeWrap.classList.remove("hidden");
    envelopeWrap.style.display = "";
  }

  const salutationEl = document.getElementById("letterSalutation");
  const closingEl = document.getElementById("letterClosing");
  const closingPhraseEl = document.getElementById("letterClosingPhrase");
  const senderNameEl = document.getElementById("senderNameDisplay");

  let animFrameId = null;
  let letterGainNode = null;
  let letterCompressorNode = null;

  // Acoustic speech timestamps measured from audio/letter_voice-volume-adjusted.wav
  const BODY_TIMINGS = [
    { start: 2.4, end: 19.5 },  // Para 0: "First of all, I want to say happy birthday..."
    { start: 20.9, end: 32.5 }, // Para 1: "I want to say that I am so happy..."
    { start: 33.5, end: 50.2 }, // Para 2: "We shared so many great memories..."
    { start: 52.0, end: 65.8 }, // Para 3: "During our time together, we had the chance..."
    { start: 67.8, end: 79.2 }, // Para 4: "I am running out of ink, so my last words to you are that my bebe i lofe you, I miss you, I adore you, and I crave you."
    { start: 80.2, end: 84.6 }  // Para 5: "Huuuum Huummmm Monchichi Monchichi Huuuum"
  ];

  const syncLetterExperience = (currentTime) => {
    const letData = window.LETTER_DATA || {};
    const partner = letData.recipient || (window.state && window.state.partnerName) || document.querySelector(".partner-name-display")?.textContent || "Ella";
    const senderSignature = letData.sender || (window.state && window.state.senderName) || "Your Love from Algeria ❤️";
    const closingPhrase = letData.closingPhrase || "Forever and always, with infinite kiss kiss & hug hug,";
    const salutationPrefix = letData.salutation || "Dearest";
    const letterBody = letData.body || (window.state && window.state.letter) || "";
    const rawParas = letterBody ? letterBody.split("\n\n") : [];
    let salutationText = `${salutationPrefix} ${partner},`;
    let bodyParas = [...rawParas];
    if (bodyParas.length > 0 && bodyParas[0].trim().toLowerCase().startsWith("dearest")) {
      salutationText = bodyParas[0].trim();
      bodyParas = bodyParas.slice(1);
    }

    if (currentTime >= 88.0) {
      if (salutationEl) salutationEl.textContent = salutationText;
      if (letterEl) letterEl.innerHTML = bodyParas.map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
      if (closingEl) closingEl.style.opacity = "1";
      if (closingPhraseEl) closingPhraseEl.textContent = closingPhrase;
      if (senderNameEl) senderNameEl.textContent = senderSignature;
      return;
    }

    // 1. Salutation (0.9s -> 2.1s)
    if (salutationEl) {
      if (currentTime < 0.9) {
        salutationEl.innerHTML = '<span class="typewriter-cursor"></span>';
      } else if (currentTime >= 0.9 && currentTime <= 2.1) {
        const p = (currentTime - 0.9) / (2.1 - 0.9);
        const chars = Math.floor(p * salutationText.length);
        salutationEl.innerHTML = `${salutationText.slice(0, chars)}<span class="typewriter-cursor"></span>`;
      } else {
        salutationEl.textContent = salutationText;
      }
    }

    // 2. Body Paragraphs (2.4s -> 84.6s)
    if (letterEl) {
      if (currentTime < 2.4) {
        letterEl.innerHTML = (currentTime >= 2.1) ? '<p><span class="typewriter-cursor"></span></p>' : '';
      } else {
        const htmlParas = [];
        const isStandard = bodyParas.length === BODY_TIMINGS.length;

        for (let i = 0; i < bodyParas.length; i++) {
          const pText = bodyParas[i];
          let timing;
          if (isStandard) {
            timing = BODY_TIMINGS[i];
          } else {
            const totalChars = bodyParas.reduce((acc, p) => acc + p.length, 0) || 1;
            let prevChars = 0;
            for (let j = 0; j < i; j++) prevChars += bodyParas[j].length;
            const start = 2.4 + (prevChars / totalChars) * 82.2;
            const end = start + (pText.length / totalChars) * 82.2;
            timing = { start, end };
          }

          if (currentTime < timing.start) {
            break;
          } else if (currentTime >= timing.start && currentTime <= timing.end) {
            let charCount;
            if (isStandard && i === 4) {
              const t = currentTime;
              if (t < 71.2) {
                charCount = Math.floor(((t - 67.8) / (71.2 - 67.8)) * 58);
              } else if (t < 71.5) {
                charCount = 58;
              } else if (t < 73.8) {
                charCount = 58 + Math.floor(((t - 71.5) / (73.8 - 71.5)) * 21);
              } else if (t < 74.1) {
                charCount = 79;
              } else if (t < 75.1) {
                charCount = 79 + Math.floor(((t - 74.1) / (75.1 - 74.1)) * 12);
              } else if (t < 75.2) {
                charCount = 91;
              } else if (t < 76.4) {
                charCount = 91 + Math.floor(((t - 75.2) / (76.4 - 75.2)) * 13);
              } else if (t < 76.7) {
                charCount = 104;
              } else {
                charCount = 104 + Math.floor(((t - 76.7) / (79.2 - 76.7)) * 15);
              }
              charCount = Math.min(Math.max(charCount, 0), pText.length);
            } else {
              const pProgress = (timing.end > timing.start) ? Math.min(Math.max((currentTime - timing.start) / (timing.end - timing.start), 0), 1) : 1;
              charCount = Math.floor(pProgress * pText.length);
            }

            const slice = pText.slice(0, charCount);
            htmlParas.push(`<p>${slice.replace(/\n/g, "<br>")}<span class="typewriter-cursor"></span></p>`);
            break;
          } else {
            const nextTiming = isStandard ? (i + 1 < BODY_TIMINGS.length ? BODY_TIMINGS[i + 1] : { start: 84.8 }) : null;
            if (nextTiming && currentTime < nextTiming.start) {
              htmlParas.push(`<p>${pText.replace(/\n/g, "<br>")}<span class="typewriter-cursor"></span></p>`);
              break;
            } else {
              htmlParas.push(`<p>${pText.replace(/\n/g, "<br>")}</p>`);
            }
          }
        }
        letterEl.innerHTML = htmlParas.join("") || '<p><span class="typewriter-cursor"></span></p>';
      }
    }

    // 3. Closing & Handwritten Signature (after Monchichi: 84.8s -> 88.0s)
    if (closingEl && closingPhraseEl && senderNameEl) {
      if (currentTime < 84.8) {
        closingEl.style.opacity = "0";
        closingPhraseEl.textContent = "";
        senderNameEl.textContent = "";
      } else if (currentTime >= 84.8 && currentTime < 86.4) {
        closingEl.style.opacity = "1";
        const p = (currentTime - 84.8) / (86.4 - 84.8);
        const chars = Math.floor(p * closingPhrase.length);
        closingPhraseEl.innerHTML = `${closingPhrase.slice(0, chars)}<span class="typewriter-cursor"></span>`;
        senderNameEl.textContent = "";
      } else if (currentTime >= 86.4 && currentTime <= 88.0) {
        closingEl.style.opacity = "1";
        closingPhraseEl.textContent = closingPhrase;
        const p = (currentTime - 86.4) / (88.0 - 86.4);
        const chars = Math.floor(p * senderSignature.length);
        senderNameEl.innerHTML = `${senderSignature.slice(0, chars)}<span class="typewriter-cursor signature-cursor"></span>`;
      } else {
        closingEl.style.opacity = "1";
        closingPhraseEl.textContent = closingPhrase;
        senderNameEl.textContent = senderSignature;
      }
    }
  };

  const updateTypewriter = () => {
    syncLetterExperience(letterPlayer.currentTime);
    if (!letterPlayer.paused && !letterPlayer.ended) {
      animFrameId = requestAnimationFrame(updateTypewriter);
    }
  };

  const initLetterAmplifier = () => {
    if (letterGainNode) return letterGainNode;
    try {
      if (typeof audio !== "undefined") audio.init();
      const ctx = (typeof audio !== "undefined" && audio.ctx) ? audio.ctx : new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      if (!letterPlayer._webAudioSource) {
        letterPlayer._webAudioSource = ctx.createMediaElementSource(letterPlayer);
        letterGainNode = ctx.createGain();
        letterCompressorNode = ctx.createDynamicsCompressor();
        letterCompressorNode.threshold.setValueAtTime(-1.0, ctx.currentTime);
        letterCompressorNode.knee.setValueAtTime(12, ctx.currentTime);
        letterCompressorNode.ratio.setValueAtTime(3.0, ctx.currentTime);
        letterCompressorNode.attack.setValueAtTime(0.005, ctx.currentTime);
        letterCompressorNode.release.setValueAtTime(0.1, ctx.currentTime);
        letterPlayer._webAudioSource.connect(letterGainNode);
        letterGainNode.connect(letterCompressorNode);
        letterCompressorNode.connect(ctx.destination);
      }
      return letterGainNode;
    } catch (e) {
      return null;
    }
  };

  const applyLetterVoiceVolGain = (volPercent) => {
    const gainVal = volPercent / 100;
    if (gainVal <= 1.0 && !letterPlayer._webAudioSource) {
      letterPlayer.volume = Math.min(Math.max(gainVal, 0), 1.0);
      return;
    }
    const gainNode = initLetterAmplifier();
    if (gainNode) {
      try {
        const ctx = (typeof audio !== "undefined" && audio.ctx) ? audio.ctx : null;
        if (ctx && ctx.state === "suspended") ctx.resume();
        gainNode.gain.setValueAtTime(gainVal, ctx ? ctx.currentTime : 0);
        letterPlayer.volume = 1.0;
        return;
      } catch (e) {}
    }
    letterPlayer.volume = Math.min(gainVal, 1.0);
  };
  window.applyLetterVoiceVolGain = applyLetterVoiceVolGain;

  const getLetterVoiceVol = () => {
    let v = localStorage.getItem("gf_letter_voice_volume");
    if (!v || v === "100" || v === "175") {
      v = "300";
      localStorage.setItem("gf_letter_voice_volume", "300");
    }
    const num = parseInt(v || "300", 10);
    return Math.min(Math.max(isNaN(num) ? 300 : num, 0), 300);
  };

  const getLetterBgVol = () => {
    let v = localStorage.getItem("gf_letter_bg_volume");
    if (!v || v === "20") {
      v = "7";
      localStorage.setItem("gf_letter_bg_volume", "7");
    }
    const num = parseInt(v || "7", 10);
    return Math.min(Math.max(isNaN(num) ? 7 : num, 0), 100) / 100;
  };

  let _wasBgPlaying = false;

  const restoreBgVolume = () => {
    if (!_wasBgPlaying) return;
    _wasBgPlaying = false;
    if (typeof fadeInBgMusic === "function") {
      fadeInBgMusic();
    } else if (bgAudio) {
      const savedVol = parseInt(localStorage.getItem("gf_volume") || "80", 10) / 100;
      bgAudio.volume = Math.min(Math.max(savedVol, 0), 1);
    }
  };

  const syncLetterVoiceVolUI = (val) => {
    const num = Math.min(Math.max(parseInt(val, 10) || 0, 0), 300);
    if (voiceVolSlider) voiceVolSlider.value = num;
    if (voiceVolVal) {
      voiceVolVal.textContent = num > 100 ? `${num}% ⚡` : `${num}%`;
      voiceVolVal.classList.toggle("voice-vol-boosted", num > 100);
    }
    if (voiceMuteBtn) voiceMuteBtn.textContent = num === 0 ? "🔇" : (num < 50 ? "🔉" : (num > 100 ? "🔊⚡" : "🔊"));
    const settingsSlider = document.getElementById("inputLetterVoiceVolume");
    const settingsVal = document.getElementById("inputLetterVoiceVolumeVal");
    if (settingsSlider) settingsSlider.value = num;
    if (settingsVal) settingsVal.textContent = num > 100 ? `${num}% ⚡` : `${num}%`;
    applyLetterVoiceVolGain(num);
    if (typeof state !== "undefined") state.letterVoiceVolume = num;
  };

  const syncLetterBgVolUI = (val) => {
    const num = Math.min(Math.max(parseInt(val, 10) || 0, 0), 100);
    if (bgVolSlider) bgVolSlider.value = num;
    if (bgVolVal) bgVolVal.textContent = `${num}%`;
    if (bgMuteBtn) bgMuteBtn.textContent = num === 0 ? "🔇" : (num < 50 ? "🔉" : "🔊");
    const settingsSlider = document.getElementById("inputLetterBgVolume");
    const settingsVal = document.getElementById("inputLetterBgVolumeVal");
    if (settingsSlider) settingsSlider.value = num;
    if (settingsVal) settingsVal.textContent = `${num}%`;
    if (typeof state !== "undefined") state.letterBgVolume = num;
  };

  syncLetterVoiceVolUI(getLetterVoiceVol());
  syncLetterBgVolUI(getLetterBgVol() * 100);

  if (volBtn && volPopover) {
    volBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      volPopover.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (volWrap && !volWrap.contains(e.target)) {
        volPopover.classList.remove("open");
      }
    });
  }

  if (voiceVolSlider) {
    voiceVolSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      syncLetterVoiceVolUI(val);
      localStorage.setItem("gf_letter_voice_volume", val);
      if (typeof saveToComputer === "function") saveToComputer();
    });
  }

  if (bgVolSlider) {
    bgVolSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      syncLetterBgVolUI(val);
      localStorage.setItem("gf_letter_bg_volume", val);
      if (letterPlayer && !letterPlayer.paused && bgAudio) {
        bgAudio.volume = val / 100;
      }
      if (typeof saveToComputer === "function") saveToComputer();
    });
  }

  let prevVoiceVol = 100;
  if (voiceMuteBtn) {
    voiceMuteBtn.addEventListener("click", () => {
      const cur = getLetterVoiceVol();
      if (cur > 0) {
        prevVoiceVol = cur;
        syncLetterVoiceVolUI(0);
        localStorage.setItem("gf_letter_voice_volume", 0);
      } else {
        const target = prevVoiceVol || 100;
        syncLetterVoiceVolUI(target);
        localStorage.setItem("gf_letter_voice_volume", target);
      }
      if (typeof saveToComputer === "function") saveToComputer();
    });
  }

  let prevBgVol = 7;
  if (bgMuteBtn) {
    bgMuteBtn.addEventListener("click", () => {
      const cur = parseInt(localStorage.getItem("gf_letter_bg_volume") || "7", 10);
      if (cur > 0) {
        prevBgVol = cur;
        syncLetterBgVolUI(0);
        localStorage.setItem("gf_letter_bg_volume", 0);
        if (letterPlayer && !letterPlayer.paused && bgAudio) bgAudio.volume = 0;
      } else {
        const target = prevBgVol || 7;
        syncLetterBgVolUI(target);
        localStorage.setItem("gf_letter_bg_volume", target);
        if (letterPlayer && !letterPlayer.paused && bgAudio) bgAudio.volume = target / 100;
      }
      if (typeof saveToComputer === "function") saveToComputer();
    });
  }

  document.querySelectorAll(".letter-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const vVoice = parseInt(btn.dataset.voice || "100", 10);
      const bgVol = parseInt(btn.dataset.bg || "7", 10);
      syncLetterVoiceVolUI(vVoice);
      syncLetterBgVolUI(bgVol);
      localStorage.setItem("gf_letter_voice_volume", vVoice);
      localStorage.setItem("gf_letter_bg_volume", bgVol);
      if (letterPlayer && !letterPlayer.paused && bgAudio) {
        bgAudio.volume = bgVol / 100;
      }
      if (typeof audio !== "undefined") audio.playPop();
      if (typeof saveToComputer === "function") saveToComputer();
    });
  });

  letterPlayer.addEventListener("play", () => {
    if (typeof audio !== "undefined" && typeof audio.cancelFade === "function") {
      audio.cancelFade();
    }
    const voicePlayer = document.getElementById("voiceAudioPlayer");
    if (voicePlayer && !voicePlayer.paused) {
      voicePlayer.pause();
      const voicePlayIcon = document.getElementById("voicePlayIcon");
      const voicePlayText = document.getElementById("voicePlayText");
      if (voicePlayIcon) voicePlayIcon.textContent = "▶️";
      if (voicePlayText) voicePlayText.textContent = "Listen";
    }
    applyLetterVoiceVolGain(getLetterVoiceVol());
    _wasBgPlaying = Boolean(bgAudio && !bgAudio.paused && !bgAudio.ended);
    if (bgAudio && _wasBgPlaying) {
      const bgVol = getLetterBgVol();
      bgAudio.volume = bgVol;
    }
    if (playIcon) playIcon.textContent = "⏸️";
    if (playText) playText.textContent = "Pause";
    cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(updateTypewriter);
  });

  letterPlayer.addEventListener("pause", () => {
    cancelAnimationFrame(animFrameId);
    updateTypewriter();
    if (letterPlayer.currentTime < 88.0) {
      restoreBgVolume();
      if (playIcon) playIcon.textContent = "▶️";
      if (playText) playText.textContent = "Resume";
    }
  });

  letterPlayer.addEventListener("ended", () => {
    cancelAnimationFrame(animFrameId);
    syncLetterExperience(88.5);
    restoreBgVolume();
    if (playIcon) playIcon.textContent = "▶️";
    if (playText) playText.textContent = "Replay";
    if (typeof audio !== "undefined") audio.playSparkle();
    if (typeof particles !== "undefined") particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
  });

  letterPlayer.addEventListener("timeupdate", () => {
    if (letterPlayer.paused) updateTypewriter();
  });

  const playLetterAudio = () => {
    if (typeof audio !== "undefined" && typeof audio.init === "function") {
      audio.init();
    }
    const ctx = (typeof audio !== "undefined" && audio.ctx) ? audio.ctx : null;
    if (ctx && ctx.state === "suspended") ctx.resume();

    if (letterPlayer.paused) {
      if (letterPlayer.currentTime >= 88.0) {
        letterPlayer.currentTime = 0;
        syncLetterExperience(0);
      }
      applyLetterVoiceVolGain(getLetterVoiceVol());
      const p = letterPlayer.play();
      if (p !== undefined) {
        p.then(() => {
          if (playIcon) playIcon.textContent = "⏸️";
          if (playText) playText.textContent = "Pause";
        }).catch(() => {
          letterPlayer.src = "audio/letter_voice-volume-adjusted.m4r";
          letterPlayer.load();
          letterPlayer.play().then(() => {
            if (playIcon) playIcon.textContent = "⏸️";
            if (playText) playText.textContent = "Pause";
          }).catch(() => {
            letterPlayer.src = "letter_voice-volume-adjusted.m4r";
            letterPlayer.load();
            letterPlayer.play().catch(() => {});
          });
        });
      }
    }
  };

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (letterPlayer.paused) {
        playLetterAudio();
      } else {
        letterPlayer.pause();
        if (playIcon) playIcon.textContent = "▶️";
        if (playText) playText.textContent = "Resume";
      }
    });
  }

  const openLetterEnvelope = () => {
    if (!envelopeCard || !openedWrap) return;
    envelopeCard.classList.add("opening");
    if (typeof audio !== "undefined") audio.playPop();

    const rect = envelopeCard.getBoundingClientRect();
    const waxSealEl = document.getElementById("bdayWaxSeal");
    const sealRect = waxSealEl ? waxSealEl.getBoundingClientRect() : rect;
    const originX = sealRect.left + sealRect.width / 2;
    const originY = sealRect.top + sealRect.height / 2;

    spawnRealisticFloralScreenBurst(originX, originY);

    if (typeof particles !== "undefined") {
      particles.burst(originX, originY, 40);
    }

    setTimeout(() => {
      if (typeof audio !== "undefined") audio.playChimeCascade();
    }, 160);

    setTimeout(() => {
      if (envelopeWrap) {
        envelopeWrap.classList.add("hidden");
        envelopeWrap.style.display = "none";
      }
      if (openedWrap) {
        openedWrap.classList.remove("hidden");
        openedWrap.style.display = "";
        openedWrap.classList.add("unfolding");
      }
      fadeAndRemoveFloralScreen(100);
      syncLetterExperience(0);
      playLetterAudio();
    }, 2100);
  };

  if (envelopeCard) {
    envelopeCard.addEventListener("click", openLetterEnvelope);
    envelopeCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLetterEnvelope();
      }
    });
  }

  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openLetterEnvelope();
    });
  }

  if (resealBtn) {
    resealBtn.addEventListener("click", () => {
      if (!letterPlayer.paused) {
        letterPlayer.pause();
      }
      restoreBgVolume();
      dismissRealisticFloralScreen();
      if (playIcon) playIcon.textContent = "▶️";
      if (playText) playText.textContent = "Play";
      if (openedWrap) {
        openedWrap.classList.add("hidden");
        openedWrap.style.display = "none";
        openedWrap.classList.remove("unfolding");
      }
      if (envelopeWrap) {
        envelopeWrap.classList.remove("hidden");
        envelopeWrap.style.display = "";
      }
      if (envelopeCard) {
        envelopeCard.classList.remove("opening");
      }
      if (typeof audio !== "undefined") audio.playPop();
      syncLetterExperience(88.5);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const letData = window.LETTER_DATA || {};
      const partner = letData.recipient || (window.state && window.state.partnerName) || "Ella";
      const senderSignature = letData.sender || (window.state && window.state.senderName) || "Your Love from Algeria ❤️";
      const closingPhrase = letData.closingPhrase || "Forever and always, with infinite kiss kiss & hug hug,";
      const salutationPrefix = letData.salutation || "Dearest";
      const letterDate = letData.dateDisplay || "Today & Always";
      const letterBody = letData.body || (window.state && window.state.letter) || "";
      const rawParas = letterBody ? letterBody.split("\n\n") : [];
      const bodyParas = (rawParas.length > 0 && rawParas[0].trim().toLowerCase().startsWith("dearest")) ? rawParas.slice(1) : rawParas;
      const keepsake = `💌 A Letter for ${partner}\nDate: ${letterDate}\n\n${salutationPrefix} ${partner},\n\n${bodyParas.join("\n\n")}\n\n${closingPhrase}\n${senderSignature}`;

      navigator.clipboard.writeText(keepsake).then(() => {
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "💌 Love Letter copied to clipboard!");
        if (typeof audio !== "undefined") audio.playChimeCascade();
      }).catch(() => {
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "💌 Letter text ready to keep!");
      });
    });
  }

  window.openLoveLetterEnvelope = openLetterEnvelope;
  window.resealLoveLetter = () => { if (resealBtn) resealBtn.click(); };
  window.togglePlayLoveLetter = () => { if (playBtn) playBtn.click(); };
  window.copyLoveLetterKeepsake = () => { if (copyBtn) copyBtn.click(); };

  syncLetterExperience(88.5);
}

// Magic Cursor Sparkle Trail Engine
