/**
 * LoveSaas — High-Converting Luxury Interactive Storefront Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // 0. SCROLL RESET: Always ensure landing page starts at the beginning (top)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  const isDirectOrReload = (() => {
    try {
      const navEntry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      return !navEntry || navEntry.type === "navigate" || navEntry.type === "reload";
    } catch {
      return true;
    }
  })();

  if (isDirectOrReload) {
    if (window.location.hash && ["#pricing", "#builder", "#features", "#presets", "#demo-preview"].includes(window.location.hash)) {
      history.replaceState(null, null, window.location.pathname);
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  window.addEventListener("load", () => {
    if (!window.location.hash || window.location.hash === "#") {
      window.scrollTo(0, 0);
    }
  });

  const navBrandLogo = document.querySelector(".nav-brand");
  if (navBrandLogo) {
    navBrandLogo.addEventListener("click", (e) => {
      if (window.location.pathname === "/welcome" || window.location.pathname === "/") {
        e.preventDefault();
        if (window.location.hash) history.replaceState(null, null, window.location.pathname);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Safe fetch helper that guarantees clean JSON parsing and friendly errors on HTML responses
  async function safeJsonFetch(url, options = {}) {
    let res;
    try {
      res = await fetch(url, options);
    } catch (networkErr) {
      const err = new Error("Network connection failed. Please check your internet connection.");
      err.isNetwork = true;
      throw err;
    }

    const contentType = res.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = null;
      }
    }

    if (!res.ok) {
      let errorMsg = (data && data.error) ? data.error : "";
      if (!errorMsg) {
        if (res.status === 401) errorMsg = "Invalid email or password.";
        else if (res.status === 403) errorMsg = "Access forbidden.";
        else if (res.status === 404) errorMsg = "Service endpoint not found (404).";
        else if (res.status === 429) errorMsg = "Too many requests. Please wait a moment.";
        else if (res.status >= 500) errorMsg = "Server is temporarily unavailable. Please try again in a moment.";
        else errorMsg = `Request failed (${res.status})`;
      }
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }
  window.safeJsonFetch = safeJsonFetch;

  // ------------------------------------------------------------------
  // 1. AMBIENT PARTICLES CANVAS (FLOATING HEARTS & SPARKLES)
  // ------------------------------------------------------------------
  const canvas = document.getElementById("ambientCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const heartSymbols = ["❤️", "💖", "✨", "💕", "🌸", "💍"];

    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        symbol: heartSymbols[Math.floor(Math.random() * heartSymbols.length)],
        size: 14 + Math.random() * 18,
        speedY: 0.35 + Math.random() * 0.75,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: 0.12 + Math.random() * 0.35,
        fadeSpeed: 0.0015 + Math.random() * 0.0025
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity -= p.fadeSpeed;

        if (p.y < -30 || p.opacity <= 0) {
          p.y = height + 20;
          p.x = Math.random() * width;
          p.opacity = 0.15 + Math.random() * 0.35;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.symbol, p.x, p.y);
        ctx.restore();
      });
      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  // ------------------------------------------------------------------
  // 2. HERO LIVE TIMEZONE CLOCKS
  // ------------------------------------------------------------------
  function updateHeroClocks() {
    const now = new Date();
    const parisTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(now);
    const tokyoTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" }).format(now);
    const elParis = document.getElementById("mockParisTime");
    const elTokyo = document.getElementById("mockTokyoTime");
    if (elParis) elParis.textContent = parisTime;
    if (elTokyo) elTokyo.textContent = tokyoTime;
  }
  updateHeroClocks();
  setInterval(updateHeroClocks, 10000);

  // ------------------------------------------------------------------
  // 3. 3D PARALLAX TILT ON HERO MOCKUP
  // ------------------------------------------------------------------
  const heroMockup = document.getElementById("heroMockupFrame");
  if (heroMockup && window.innerWidth > 900) {
    heroMockup.addEventListener("mousemove", (e) => {
      const rect = heroMockup.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / rect.height) * 7;
      const rotateY = (x / rect.width) * 7;
      heroMockup.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });
    heroMockup.addEventListener("mouseleave", () => {
      heroMockup.style.transform = "perspective(1200px) rotateX(2deg) rotateY(0deg)";
    });
  }

  // ------------------------------------------------------------------
  // 4. INTERACTIVE HERO MOCKUP TABS
  // ------------------------------------------------------------------
  const mockupTabs = document.querySelectorAll("[data-mockup-tab]");
  const mockupPanes = {
    clocks: document.getElementById("paneClocks"),
    meter: document.getElementById("paneMeter"),
    letter: document.getElementById("paneLetter"),
    bottle: document.getElementById("paneBottle")
  };

  mockupTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      mockupTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.dataset.mockupTab;
      Object.entries(mockupPanes).forEach(([k, pane]) => {
        if (pane) pane.classList.toggle("active", k === key);
      });
    });
  });

  // Floating Emoji Helper
  function spawnFloatingEmoji(emoji, targetBtn) {
    const rect = targetBtn.getBoundingClientRect();
    const el = document.createElement("div");
    el.textContent = emoji;
    el.style.position = "fixed";
    el.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 40}px`;
    el.style.top = `${rect.top - 10}px`;
    el.style.fontSize = "2rem";
    el.style.pointerEvents = "none";
    el.style.zIndex = "9999";
    el.style.transition = "all 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)";
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translateY(-${80 + Math.random() * 40}px) scale(1.5)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 900);
  }

  // Interactive Lof-O-Meter
  let meterCount = 9847293847192840320n;
  let meterFillPercent = 78;
  const mockMeterDisplay = document.getElementById("mockMeterDisplay");
  const mockMeterFill = document.getElementById("mockMeterFill");
  const btnMockPump = document.getElementById("btnMockPump");
  const btnMockKiss = document.getElementById("btnMockKiss");
  const btnMockHug = document.getElementById("btnMockHug");

  if (btnMockPump) {
    btnMockPump.addEventListener("click", () => {
      meterCount += 500000000000000n;
      mockMeterDisplay.textContent = meterCount.toLocaleString();
      meterFillPercent = Math.min(100, meterFillPercent + 2);
      mockMeterFill.style.width = `${meterFillPercent}%`;
      spawnFloatingEmoji("💖", btnMockPump);
    });
  }

  if (btnMockKiss) {
    btnMockKiss.addEventListener("click", () => {
      meterCount += 100000000000000n;
      mockMeterDisplay.textContent = meterCount.toLocaleString();
      spawnFloatingEmoji("💋", btnMockKiss);
    });
  }

  if (btnMockHug) {
    btnMockHug.addEventListener("click", () => {
      meterCount += 100000000000000n;
      mockMeterDisplay.textContent = meterCount.toLocaleString();
      spawnFloatingEmoji("🤗", btnMockHug);
    });
  }

  // Interactive Wax Letter
  const btnBreakWaxSeal = document.getElementById("btnBreakWaxSeal");
  const waxLetterContent = document.getElementById("waxLetterContent");
  const waxPromptText = document.getElementById("waxPromptText");

  if (btnBreakWaxSeal) {
    btnBreakWaxSeal.addEventListener("click", () => {
      btnBreakWaxSeal.style.transform = "scale(0.85) rotate(15deg)";
      btnBreakWaxSeal.style.opacity = "0.6";
      setTimeout(() => {
        waxPromptText.style.display = "none";
        waxLetterContent.classList.add("open");
        spawnFloatingEmoji("✨", btnBreakWaxSeal);
      }, 200);
    });
  }

  // Interactive Spin Bottle
  const mockSpinBottle = document.getElementById("mockSpinBottle");
  const mockPromptCard = document.getElementById("mockPromptCard");
  let bottleRotation = 0;
  const funPrompts = [
    "Truth: What was the exact second you knew you fell in love with me?",
    "Dare: Give your partner a slow, gentle 2-minute shoulder massage right now.",
    "Truth: What is your favorite physical feature of mine?",
    "Dare: Whisper your favorite memory of us softly into my ear.",
    "Truth: What is one secret romantic trip you want us to take next?",
    "Dare: Take a sweet couple selfie right now and make it your lockscreen!"
  ];

  if (mockSpinBottle) {
    mockSpinBottle.addEventListener("click", () => {
      bottleRotation += 720 + Math.floor(Math.random() * 360);
      mockSpinBottle.style.transform = `rotate(${bottleRotation}deg)`;
      mockPromptCard.textContent = "Spinning the bottle...";
      setTimeout(() => {
        const picked = funPrompts[Math.floor(Math.random() * funPrompts.length)];
        mockPromptCard.innerHTML = `<strong>${picked}</strong>`;
        spawnFloatingEmoji("🍾", mockSpinBottle);
      }, 1200);
    });
  }

  // ------------------------------------------------------------------
  // 5. PRESETS, REAL THEMES & MINI BUILDER DEMO
  // ------------------------------------------------------------------
  const PRESET_MAP = {
    complete: {
      title: "Complete Romance Suite",
      desc: "The full production experience with all 26 interactive modules. Perfect for anniversaries, milestones, and lifelong memory preservation.",
      badges: ["👑 Hero & Clocks", "💌 Audio Letter", "🗺️ Travel Map", "📖 Timeline", "📸 Polaroids", "📈 Lof-O-Meter", "✈️ Boarding Pass", "🍾 Truth / Dare", "🎡 Spinner", "🎟️ Coupons", "🧠 Love Quiz", "🎂 Candle Wish", "⏳ Life Stats", "🎁 Gift Unboxer"]
    },
    storyteller: {
      title: "The Storyteller Layout",
      desc: "Focused on your narrative journey, milestone chapters, travel locations, and romantic letters. Best for storytelling and travel memories.",
      badges: ["👑 Hero Header", "📖 Timeline Chapters", "🗺️ Interactive Map", "📸 Memories Gallery", "✈️ Boarding Pass", "💌 Wax-Sealed Letter", "⏳ Life Stats"]
    },
    playful: {
      title: "Playful & Interactive Fun",
      desc: "Packed with cute games, date night spinners, quiz competitions, scratchable love coupons, and the explosive Lof-O-Meter.",
      badges: ["👑 Hero Header", "📈 Lof-O-Meter", "🍾 Truth / Dare", "🎡 Date Night Spinner", "🎟️ Love Coupons", "🧠 Love Quiz", "🙈 Runaway Button", "🥂 Roast & Toast"]
    },
    birthday: {
      title: "Birthday Bash Suite",
      desc: "Dedicated to their special day with interactive candle blowouts, audio messages, gift unboxer, and guestbook wishes.",
      badges: ["👑 Hero Header", "🎂 Candle Blow-Out", "🎁 Gift Unboxer", "📌 Guestbook Wall", "📸 Polaroids", "💌 Wax Letter", "🎵 Birthday Song"]
    },
    anniversary: {
      title: "Anniversary Keepsake",
      desc: "Celebrates your time together with relationship countdowns, milestone odyssey map, anniversary card deck, and love receipts.",
      badges: ["👑 Hero & Clocks", "💍 Anniversary Deck", "🗺️ Milestone Odyssey", "📖 Timeline", "📸 Memories Gallery", "💌 Wax-Sealed Letter"]
    },
    minimal: {
      title: "Minimal Aesthetic Gallery",
      desc: "Clean, elegant, distraction-free photo showcase with your favorite background music and personal love letter.",
      badges: ["👑 Hero Header", "📸 Polaroid Memories", "💌 Wax-Sealed Letter", "🎵 Background Soundtrack"]
    }
  };

  const presetTabs = document.querySelectorAll(".preset-tab-btn");
  presetTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      presetTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.dataset.preset;
      const data = PRESET_MAP[key] || PRESET_MAP.complete;

      const pTitle = document.getElementById("presetTitle");
      const pDesc = document.getElementById("presetDesc");
      const badgeWrap = document.getElementById("presetBadges");
      if (pTitle) pTitle.textContent = data.title;
      if (pDesc) pDesc.textContent = data.desc;
      if (badgeWrap) {
        badgeWrap.innerHTML = data.badges.map(b => `<span class="preset-widget-badge">${b}</span>`).join("");
      }
    });
  });

  const btnChoosePreset = document.getElementById("btnChoosePreset");
  if (btnChoosePreset) {
    btnChoosePreset.addEventListener("click", () => openCheckoutModal("vip"));
  }

  // Real Themes Showcase in Presets Section
  const REAL_THEMES_MAP = {
    "theme-pink": {
      name: "Romantic Rose",
      category: "CLASSIC PALETTE",
      badge: "FOREVER LOVE",
      desc: "Soft romantic blush with champagne gold accents and warm rose tones.",
      icon: "🌸",
      cardBg: "linear-gradient(145deg, rgba(36, 20, 36, 0.95), rgba(13, 17, 29, 0.95))",
      boxBg: "rgba(244, 63, 94, 0.12)",
      accent: "#ff4d6d",
      btnBg: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
    },
    "theme-midnight": {
      name: "Starry Night",
      category: "DEEP COSMIC",
      badge: "UNDER THE STARS",
      desc: "Deep sapphire blues and starlight silver for calm, dreamy, intimate memories.",
      icon: "🌌",
      cardBg: "linear-gradient(145deg, rgba(15, 23, 55, 0.95), rgba(8, 12, 24, 0.95))",
      boxBg: "rgba(59, 130, 246, 0.12)",
      accent: "#3b82f6",
      btnBg: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
    },
    "theme-purple": {
      name: "Lavender Dream",
      category: "LUXURY VELVET",
      badge: "FAIRYTALE",
      desc: "Regal lilac and amethyst hues evoking timeless romance and poetic devotion.",
      icon: "💜",
      cardBg: "linear-gradient(145deg, rgba(43, 19, 64, 0.95), rgba(10, 8, 20, 0.95))",
      boxBg: "rgba(168, 85, 247, 0.12)",
      accent: "#9b5de5",
      btnBg: "linear-gradient(135deg, #9b5de5 0%, #7928ca 100%)"
    },
    "theme-gold": {
      name: "Sunset Gold",
      category: "GOLDEN HOUR",
      badge: "WARM RADIANCE",
      desc: "Luminous amber, apricot gold, and honey glow reminiscent of sunsets at the beach.",
      icon: "🌅",
      cardBg: "linear-gradient(145deg, rgba(51, 26, 14, 0.95), rgba(12, 16, 27, 0.95))",
      boxBg: "rgba(247, 127, 0, 0.12)",
      accent: "#f77f00",
      btnBg: "linear-gradient(135deg, #f77f00 0%, #d62828 100%)"
    },
    "theme-emerald": {
      name: "Emerald Garden",
      category: "BOTANICAL",
      badge: "EVERGREEN",
      desc: "Serene forest emeralds and mint undertones for earthy, growing relationships.",
      icon: "🌿",
      cardBg: "linear-gradient(145deg, rgba(14, 42, 32, 0.95), rgba(7, 19, 14, 0.95))",
      boxBg: "rgba(16, 185, 129, 0.12)",
      accent: "#10b981",
      btnBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    "theme-img-watercolor-frame": {
      name: "Watercolor Floral",
      category: "ART BACKDROP",
      badge: "HAND-PAINTED",
      desc: "Delicate hand-painted botanical watercolor border framing your shared story.",
      icon: "🎨",
      cardBg: "linear-gradient(145deg, rgba(40, 20, 30, 0.95), rgba(15, 12, 22, 0.95))",
      boxBg: "rgba(251, 113, 133, 0.12)",
      accent: "#fb7185",
      btnBg: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)"
    },
    "theme-img-pop-stickers": {
      name: "Pop Stickers",
      category: "ART BACKDROP",
      badge: "PLAYFUL & BOLD",
      desc: "Vibrant retro sticker collage backdrop with hearts, kisses, and sparkler decals.",
      icon: "💋",
      cardBg: "linear-gradient(145deg, rgba(45, 12, 35, 0.95), rgba(15, 8, 22, 0.95))",
      boxBg: "rgba(255, 0, 127, 0.12)",
      accent: "#ff007f",
      btnBg: "linear-gradient(135deg, #ff007f 0%, #ff4d6d 100%)"
    },
    "theme-birthday": {
      name: "Birthday Party",
      category: "CELEBRATION",
      badge: "BIRTHDAY BASH",
      desc: "Festive candy pinks, glowing candles, party poppers, and celebratory confetti.",
      icon: "🎂",
      cardBg: "linear-gradient(145deg, rgba(48, 14, 38, 0.95), rgba(15, 9, 24, 0.95))",
      boxBg: "rgba(255, 46, 147, 0.12)",
      accent: "#ff2e93",
      btnBg: "linear-gradient(135deg, #ff2e93 0%, #f72585 100%)"
    },
    "theme-anniversary": {
      name: "Anniversary Crimson",
      category: "HIGH LUXURY",
      badge: "DECADE OF LOVE",
      desc: "Rich ruby crimson velvet tones and polished metallic borders celebrating deep love.",
      icon: "💍",
      cardBg: "linear-gradient(145deg, rgba(45, 10, 24, 0.95), rgba(12, 8, 18, 0.95))",
      boxBg: "rgba(201, 24, 74, 0.12)",
      accent: "#c9184a",
      btnBg: "linear-gradient(135deg, #c9184a 0%, #800f2f 100%)"
    }
  };

  const themePills = document.querySelectorAll(".theme-pill-btn");
  const themeCard = document.getElementById("themePreviewCard");
  const realThemeIcon = document.getElementById("realThemeIcon");
  const realThemeName = document.getElementById("realThemeName");
  const realThemeCategory = document.getElementById("realThemeCategory");
  const realThemeBadge = document.getElementById("realThemeBadge");
  const realThemeDesc = document.getElementById("realThemeDesc");
  const realThemeSampleBox = document.getElementById("realThemeSampleBox");
  const realThemeSampleBtn = document.getElementById("realThemeSampleBtn");

  themePills.forEach(pill => {
    pill.addEventListener("click", () => {
      themePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const key = pill.dataset.realTheme;
      const data = REAL_THEMES_MAP[key] || REAL_THEMES_MAP["theme-pink"];

      if (themeCard) {
        themeCard.style.background = data.cardBg;
        themeCard.style.borderColor = `${data.accent}55`;
      }
      if (realThemeIcon) realThemeIcon.textContent = data.icon;
      if (realThemeName) realThemeName.textContent = data.name;
      if (realThemeCategory) realThemeCategory.textContent = data.category;
      if (realThemeBadge) {
        realThemeBadge.textContent = data.badge;
        realThemeBadge.style.color = data.accent;
        realThemeBadge.style.borderColor = `${data.accent}44`;
        realThemeBadge.style.background = `${data.accent}22`;
      }
      if (realThemeDesc) realThemeDesc.textContent = data.desc;
      if (realThemeSampleBox) {
        realThemeSampleBox.style.background = data.boxBg;
        realThemeSampleBox.style.borderColor = `${data.accent}44`;
      }
      if (realThemeSampleBtn) {
        realThemeSampleBtn.style.background = data.btnBg;
      }
    });
  });

  // ------------------------------------------------------------------
  // 5B. INTERACTIVE MINI BUILDER DEMO IN BUILDER EXPERIENCE
  // ------------------------------------------------------------------
  const MINI_THEMES = {
    pink: {
      name: "Theme: Rose",
      bg: "linear-gradient(180deg, #1f111c 0%, #0c0f18 100%)",
      border: "#ff4d6d",
      badgeColor: "#fda4af",
      badgeBg: "rgba(244, 63, 94, 0.2)",
      widgetBorder: "rgba(255, 77, 109, 0.25)"
    },
    midnight: {
      name: "Theme: Night",
      bg: "linear-gradient(180deg, #0d1527 0%, #060911 100%)",
      border: "#3b82f6",
      badgeColor: "#93c5fd",
      badgeBg: "rgba(59, 130, 246, 0.2)",
      widgetBorder: "rgba(59, 130, 246, 0.25)"
    },
    purple: {
      name: "Theme: Lilac",
      bg: "linear-gradient(180deg, #1d1127 0%, #090710 100%)",
      border: "#9b5de5",
      badgeColor: "#d8b4fe",
      badgeBg: "rgba(155, 93, 229, 0.2)",
      widgetBorder: "rgba(155, 93, 229, 0.25)"
    },
    gold: {
      name: "Theme: Sunset",
      bg: "linear-gradient(180deg, #24140a 0%, #0b0d13 100%)",
      border: "#f77f00",
      badgeColor: "#fdba74",
      badgeBg: "rgba(247, 127, 0, 0.2)",
      widgetBorder: "rgba(247, 127, 0, 0.25)"
    },
    emerald: {
      name: "Theme: Emerald",
      bg: "linear-gradient(180deg, #0b1e16 0%, #050d0a 100%)",
      border: "#10b981",
      badgeColor: "#6ee7b7",
      badgeBg: "rgba(16, 185, 129, 0.2)",
      widgetBorder: "rgba(16, 185, 129, 0.25)"
    }
  };

  const miniThemeBtns = document.querySelectorAll(".mini-theme-btn");
  const miniStage = document.getElementById("miniPreviewStage");
  const miniBadge = document.getElementById("miniBuilderThemeBadge");

  miniThemeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      miniThemeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.dataset.miniTheme;
      const theme = MINI_THEMES[key] || MINI_THEMES.pink;

      if (miniStage) {
        miniStage.style.background = theme.bg;
        miniStage.style.borderColor = `${theme.border}66`;
        miniStage.style.boxShadow = `0 15px 35px rgba(0,0,0,0.5), inset 0 0 40px ${theme.border}15`;
        miniStage.querySelectorAll(".mini-dumb-widget").forEach(w => {
          w.style.borderColor = theme.widgetBorder;
        });
      }
      if (miniBadge) {
        miniBadge.textContent = theme.name;
        miniBadge.style.color = theme.badgeColor;
        miniBadge.style.background = theme.badgeBg;
        miniBadge.style.borderColor = `${theme.border}44`;
      }
    });
  });

  // Mini Builder: Widget Toggles
  const miniToggles = document.querySelectorAll(".mini-widget-toggle input");
  const miniCount = document.getElementById("miniWidgetsCount");

  function updateMiniWidgetsCount() {
    if (!miniCount) return;
    const checkedCount = document.querySelectorAll(".mini-widget-toggle input:checked").length;
    miniCount.textContent = `${checkedCount} Active`;
  }

  miniToggles.forEach(chk => {
    chk.addEventListener("change", () => {
      const widgetKey = chk.dataset.miniToggle;
      const widgetEl = document.getElementById(`miniWidget_${widgetKey}`);
      if (widgetEl) {
        widgetEl.style.display = chk.checked ? "flex" : "none";
      }
      updateMiniWidgetsCount();
    });
  });

  // Mini Builder: Kiss Button interaction
  const btnMiniPumpLove = document.getElementById("btnMiniPumpLove");
  if (btnMiniPumpLove) {
    btnMiniPumpLove.addEventListener("click", () => {
      spawnFloatingEmoji("💋", btnMiniPumpLove);
      spawnFloatingEmoji("💖", btnMiniPumpLove);
    });
  }

  // ------------------------------------------------------------------
  // 6. WIDGET LIGHTBOX MODAL (HIGH-RES SVGS)
  // ------------------------------------------------------------------
  const widgetLightboxModal = document.getElementById("widgetLightboxModal");
  const widgetLightboxImg = document.getElementById("widgetLightboxImg");
  const widgetLightboxTitle = document.getElementById("widgetLightboxTitle");
  const widgetLightboxSubtitle = document.getElementById("widgetLightboxSubtitle");
  const widgetLightboxCatBadge = document.getElementById("widgetLightboxCatBadge");
  const btnCloseWidgetLightbox = document.getElementById("btnCloseWidgetLightbox");
  const btnLightboxGetStarted = document.getElementById("btnLightboxGetStarted");

  const WIDGET_TITLES = {
    hero: { title: "👑 Hero Header & Dual LDR Clocks", cat: "HEADER", sub: "Live timezone clocks, countdown, flight ticket & soundtrack" },
    map: { title: "🗺️ Interactive Love Map", cat: "STORY", sub: "Custom Leaflet pins, memory markers & flight path lines" },
    love_meter: { title: "📈 The Real-Time Lof-O-Meter", cat: "INTERACTIVE", sub: "Pump button scaling to quintillions with particle bursts" },
    timeline: { title: "📖 Milestone Journey Chapters", cat: "STORY", sub: "Rich story chapters with photo carousels & full reading modal" },
    letter: { title: "💌 Wax-Sealed Audio Love Letter", cat: "LETTER", sub: "Realistic breaking wax seal, parchment note & recorded voice memo" },
    memories: { title: "📸 Polaroid Memories Gallery", cat: "GALLERY", sub: "Draggable vintage photo cards with authentic rotation physics" },
    truth_dare: { title: "🍾 Truth or Dare: 100% Fair", cat: "GAMES", sub: "Spinning bottle physics & romantic/spicy question bank" },
    spinner: { title: "🎡 Couples Date Night Spinner", cat: "GAMES", sub: "Customizable color roulette for dinner and date ideas" },
    coupons: { title: "🎟️ Scratchable Love Coupons", cat: "GAMES", sub: "Interactive scratch-to-reveal canvas with claim tracking" },
    boarding_pass: { title: "✈️ First-Class Boarding Pass", cat: "KEEPSAKE", sub: "Realistic airline boarding ticket for trips & reunions" },
    quiz: { title: "❓ Couples Love Quiz", cat: "GAMES", sub: "Trivia game with instant score & celebratory confetti" },
    reasons: { title: "💌 Reasons Why I Lof You", cat: "STORY", sub: "Categorized card deck with flip animations" },
    candle_blowout: { title: "🎂 Candle Blow-Out & Wish", cat: "BIRTHDAY", sub: "Microphone or tap triggered candle flame blow-out with confetti" },
    milestone_stats: { title: "⏳ Milestone Life Stats", cat: "STATS", sub: "Live seconds alive ticker with quirky relationship counters" },
    gift_unboxer: { title: "🎁 3D Surprise Gift Unboxer", cat: "SURPRISE", sub: "Multi-stage 3D unwrapping animation revealing special gift" },
    roast_toast: { title: "🥂 Roast & Toast Spinner", cat: "GAMES", sub: "Decelerating roulette wheel alternating playful roasts and toasts" },
    playful: { title: "🙈 Playful Runaway Button", cat: "GAMES", sub: "Playful question with an evasive No button that flees cursor" },
    guestbook: { title: "📌 Guestbook Wish Wall", cat: "COMMUNITY", sub: "Corkboard sticky-notes with visitor messages and photos" },
    party_jukebox: { title: "📻 Party Jukebox & Playlist", cat: "MUSIC", sub: "Vinyl turntable audio player with animated equalizer" },
    tenure_ticker: { title: "⏳ Precision Tenure Ticker", cat: "STATS", sub: "Live elapsed time counter with next milestone tracker" },
    star_map: { title: "✨ Night Sky Star Map", cat: "ROMANCE", sub: "Constellation alignment rendering on your exact date & location" },
    then_now_slider: { title: "🌗 Then vs. Now Photo Slider", cat: "PHOTOS", sub: "Interactive split-screen slider comparing first vs recent photo" },
    bucket_list: { title: "🎯 Couple Bucket List", cat: "GOALS", sub: "Shared relationship goals checklist with progress tracking" },
    audio_capsule: { title: "🎙️ Audio Time Capsule", cat: "AUDIO", sub: "Waveform voice memo player archiving messages across years" },
    milestone_odyssey: { title: "🚀 Milestone Odyssey Map", cat: "STORY", sub: "Horizontal constellation line map connecting key memories" },
    valentine_scratch: { title: "💝 Valentine Date Scratchcard", cat: "VALENTINE", sub: "Interactive scratch-off card with secret itinerary reveal" },
    forgiveness_meter: { title: "🕊️ Forgiveness Meter", cat: "RECONCILIATION", sub: "Interactive forgiveness slider with mood aura & celebration unlock" },
    truce_agreement: { title: "📜 Bilateral Truce Treaty", cat: "RECONCILIATION", sub: "Hold-to-sign peace treaty with wax seal & downloadable keepsake" },
    reform_deck: { title: "🃏 The Honest Reform Deck", cat: "RECONCILIATION", sub: "3D flip card deck with accountability promises & commitments" },
    reparation_coupons: { title: "🎟️ Reparation Coupons", cat: "RECONCILIATION", sub: "Scratch-off peace offering vouchers with claimed status tracking" },
    comfort_soundboard: { title: "🎧 Comfort Soundboard", cat: "AUDIO", sub: "Procedural ambient soundscapes mixer with calming photo stream" },
    scrapbook_game: { title: "📓 Scrapbook: How Well Do You Know Me?", cat: "GAMES", sub: "Tactile couple scrapbook challenge with taped polaroids, choice stickers & keepsake" },
    love_crossword: { title: "🧩 Love Story Crossword", cat: "GAMES", sub: "Interactive couple crossword with procedural audio, trivia clues & keepsake diploma" },
    puzzle_photo: { title: "🧩 Memory Photo Puzzle", cat: "GAMES", sub: "Interactive slide & swap photo jigsaw with solvable shuffle, audio SFX & secret keepsake reveal" },
    photobooth: { title: "📸 Vintage Photobooth", cat: "INTERACTIVE", sub: "Multi-shot burst camera with vintage frames, colour filters, sticker deco & keepsake strip" }
  };

  // More Widgets Toggle & Filter Bar
  const btnToggleMoreWidgets = document.getElementById("btnToggleMoreWidgets");
  const widgetsGrid = document.getElementById("widgetsGrid");
  const moreWidgetsWrap = document.querySelector(".more-widgets-wrap");
  const moreWidgetsArrow = document.getElementById("moreWidgetsArrow");

  if (btnToggleMoreWidgets && widgetsGrid) {
    btnToggleMoreWidgets.addEventListener("click", () => {
      const isCollapsed = widgetsGrid.classList.toggle("collapsed-widgets");
      const label = btnToggleMoreWidgets.querySelector("span");
      if (label) {
        label.textContent = isCollapsed ? "✨ Show All 31 Widgets (+19 More)" : "▴ Show Less Widgets";
      }
      if (moreWidgetsArrow) {
        moreWidgetsArrow.textContent = isCollapsed ? "▾" : "▴";
      }
    });
  }

  // Category Filter Bar
  const filterBtns = document.querySelectorAll(".widget-filter-btn");
  const widgetCards = document.querySelectorAll(".widget-card");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;

      if (cat !== "all" && widgetsGrid) {
        widgetsGrid.classList.remove("collapsed-widgets");
        if (moreWidgetsWrap) moreWidgetsWrap.style.display = "none";
      } else if (widgetsGrid) {
        widgetsGrid.classList.add("collapsed-widgets");
        if (moreWidgetsWrap) {
          moreWidgetsWrap.style.display = "flex";
          const label = btnToggleMoreWidgets?.querySelector("span");
          if (label) label.textContent = "✨ Show All 26 Widgets (+14 More)";
          if (moreWidgetsArrow) moreWidgetsArrow.textContent = "▾";
        }
      }

      widgetCards.forEach(card => {
        if (cat === "all" || card.dataset.category === cat) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  document.querySelectorAll("[data-preview-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const widgetId = btn.dataset.previewId;
      const previewUri = window.getWidgetPreviewImage ? window.getWidgetPreviewImage(widgetId) : null;
      const meta = WIDGET_TITLES[widgetId] || { title: "Widget Preview", cat: "FEATURE", sub: "Fully customizable" };

      widgetLightboxTitle.textContent = meta.title;
      widgetLightboxSubtitle.textContent = meta.sub;
      widgetLightboxCatBadge.textContent = meta.cat;

      if (previewUri && widgetLightboxImg) {
        widgetLightboxImg.src = previewUri;
      }
      openModal(widgetLightboxModal);
    });
  });

  if (btnCloseWidgetLightbox) {
    btnCloseWidgetLightbox.addEventListener("click", () => closeModal(widgetLightboxModal));
  }

  if (btnLightboxGetStarted) {
    btnLightboxGetStarted.addEventListener("click", () => {
      closeModal(widgetLightboxModal);
      openCheckoutModal("vip");
    });
  }

  // ------------------------------------------------------------------
  // 7. STICKY BOTTOM FLOATING CTA BAR
  // ------------------------------------------------------------------
  const stickyCtaBar = document.getElementById("stickyCtaBar");
  const btnStickyBuy = document.getElementById("btnStickyBuy");
  const btnStickyDemo = document.getElementById("btnStickyDemo");
  const mainNav = document.getElementById("mainNav");

  window.addEventListener("scroll", () => {
    if (mainNav) {
      if (window.scrollY > 20) {
        mainNav.classList.add("nav-scrolled");
      } else {
        mainNav.classList.remove("nav-scrolled");
      }
    }
    if (stickyCtaBar) {
      if (window.scrollY > 600) {
        stickyCtaBar.classList.add("visible");
      } else {
        stickyCtaBar.classList.remove("visible");
      }
    }
  }, { passive: true });

  if (btnStickyBuy) btnStickyBuy.addEventListener("click", () => openCheckoutModal("vip"));

  // ------------------------------------------------------------------
  // 8. FAQ ACCORDION
  // ------------------------------------------------------------------
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const q = item.querySelector(".faq-question");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });

  // ------------------------------------------------------------------
  // 9. MODALS & FULL-SCREEN DEMO CONTROLLER
  // ------------------------------------------------------------------
  const checkoutModal = document.getElementById("checkoutModal");
  const signInModal = document.getElementById("signInModal");
  const userPortalModal = document.getElementById("userPortalModal");
  const demoPreviewModal = document.getElementById("demoPreviewModal");
  const demoIframe = document.getElementById("demoIframe");

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Full-Screen Website Demo Handler
  function openDemoModal() {
    if (!demoPreviewModal || !demoIframe) return;
    const loader = document.getElementById("demoIframeLoader");
    if (loader) loader.classList.remove("hidden");
    demoIframe.src = "/sites/demo";
    demoIframe.onload = () => {
      if (loader) loader.classList.add("hidden");
    };
    openModal(demoPreviewModal);
  }

  function closeDemoModal() {
    if (!demoPreviewModal) return;
    closeModal(demoPreviewModal);
    if (demoIframe) demoIframe.src = "";
    const loader = document.getElementById("demoIframeLoader");
    if (loader) loader.classList.remove("hidden");
  }

  const btnHeroDemo = document.getElementById("btnHeroDemo");
  if (btnHeroDemo) btnHeroDemo.addEventListener("click", openDemoModal);
  if (btnStickyDemo) btnStickyDemo.addEventListener("click", openDemoModal);

  const btnCloseDemoModal = document.getElementById("btnCloseDemoModal");
  const btnCloseDemoModalX = document.getElementById("btnCloseDemoModalX");
  if (btnCloseDemoModal) btnCloseDemoModal.addEventListener("click", closeDemoModal);
  if (btnCloseDemoModalX) btnCloseDemoModalX.addEventListener("click", closeDemoModal);


  const btnDemoClaimKeepsake = document.getElementById("btnDemoClaimKeepsake");
  if (btnDemoClaimKeepsake) {
    btnDemoClaimKeepsake.addEventListener("click", () => {
      closeDemoModal();
      openCheckoutModal("vip");
    });
  }

  // Mobile Menu Toggle
  const btnMobileMenuToggle = document.getElementById("btnMobileMenuToggle");
  const navLinks = document.getElementById("navLinks");
  const mobileNavBackdrop = document.getElementById("mobileNavBackdrop");
  if (btnMobileMenuToggle && navLinks) {
    const toggleMenu = (open) => {
      const shouldOpen = open !== undefined ? open : !navLinks.classList.contains("mobile-open");
      navLinks.classList.toggle("mobile-open", shouldOpen);
      const mainNav = document.getElementById("mainNav");
      if (mainNav) mainNav.classList.toggle("navbar-menu-open", shouldOpen);
      if (mobileNavBackdrop) mobileNavBackdrop.classList.toggle("active", shouldOpen);
      btnMobileMenuToggle.textContent = shouldOpen ? "✕" : "☰";
      btnMobileMenuToggle.setAttribute("aria-expanded", String(shouldOpen));
      document.body.style.overflow = shouldOpen ? "hidden" : "";
    };
    window.toggleMenu = toggleMenu;

    btnMobileMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    if (mobileNavBackdrop) {
      mobileNavBackdrop.addEventListener("click", () => toggleMenu(false));
    }

    navLinks.querySelectorAll("a, button").forEach(item => {
      item.addEventListener("click", () => toggleMenu(false));
    });

    document.addEventListener("click", (e) => {
      if (navLinks.classList.contains("mobile-open") && !navLinks.contains(e.target) && e.target !== btnMobileMenuToggle) {
        toggleMenu(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && navLinks.classList.contains("mobile-open")) {
        toggleMenu(false);
      }
    });
  }

  const btnMobileSignIn = document.getElementById("btnMobileSignIn");
  if (btnMobileSignIn) {
    btnMobileSignIn.addEventListener("click", () => {
      if (typeof switchAuthTab === "function") switchAuthTab("login");
      openModal(signInModal);
    });
  }

  // ------------------------------------------------------------------
  // 10. CHECKOUT ENGINE
  // ------------------------------------------------------------------
  const checkoutState = {
    step: 1,
    plan: "vip",
    slugAvailable: false,
    partner1: "",
    partner2: "",
    slug: "",
    email: "",
    provisionedData: null
  };

  const planChips = document.querySelectorAll(".plan-chip");
  planChips.forEach(chip => {
    chip.addEventListener("click", () => {
      planChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      checkoutState.plan = chip.dataset.plan;
      renderCheckoutStep();
    });
  });

  function getSavedCreationInputs() {
    try {
      return JSON.parse(localStorage.getItem("lovesaas_saved_creation_inputs") || "{}");
    } catch {
      return {};
    }
  }

  function saveCreationInputs(obj) {
    try {
      const existing = getSavedCreationInputs();
      localStorage.setItem("lovesaas_saved_creation_inputs", JSON.stringify({ ...existing, ...obj }));
    } catch {}
  }

  function openCheckoutModal(preferredPlan = "vip") {
    checkoutState.step = 1;
    const isAdmin = currentUser && currentUser.role === "admin";
    checkoutState.plan = isAdmin ? "vip" : preferredPlan;

    const saved = getSavedCreationInputs();
    const elP1 = document.getElementById("inputPartner1");
    const elP2 = document.getElementById("inputPartner2");
    const elEmail = document.getElementById("inputEmail");
    const elAnniv = document.getElementById("inputAnniversary");
    const adminNotice = document.getElementById("checkoutAdminNotice");

    if (elP1 && !elP1.value && saved.partner1) elP1.value = saved.partner1;
    if (elP2 && !elP2.value && saved.partner2) elP2.value = saved.partner2;
    if (elAnniv && !elAnniv.value && saved.anniversaryDate) elAnniv.value = saved.anniversaryDate;

    if (currentUser && currentUser.email) {
      if (elEmail) {
        elEmail.value = currentUser.email;
        elEmail.readOnly = true;
      }
    } else if (elEmail) {
      elEmail.value = saved.email || "";
      elEmail.readOnly = false;
    }

    if (adminNotice) adminNotice.style.display = isAdmin ? "flex" : "none";

    planChips.forEach(c => {
      if (c.dataset.plan === checkoutState.plan) c.classList.add("active");
      else c.classList.remove("active");
    });
    renderCheckoutStep();
    openModal(checkoutModal);
  }

  document.querySelectorAll("[data-plan-trigger]").forEach(btn => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.planTrigger || "vip";
      openCheckoutModal(plan);
    });
  });

  const btnHeroBuy = document.getElementById("btnHeroBuy");
  if (btnHeroBuy) {
    btnHeroBuy.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/builder?slug=demo";
    });
  }

  const btnNavGetStarted = document.getElementById("btnNavGetStarted");
  if (btnNavGetStarted) {
    btnNavGetStarted.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/builder?slug=demo";
    });
  }

  const btnMobileGetStarted = document.getElementById("btnMobileGetStarted");
  if (btnMobileGetStarted) {
    btnMobileGetStarted.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/builder?slug=demo";
    });
  }

  function setupQuickPersonalizer(p1Id, p2Id, btnId) {
    const p1 = document.getElementById(p1Id);
    const p2 = document.getElementById(p2Id);
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const launch = () => {
      const v1 = (p1?.value || "").trim();
      const v2 = (p2?.value || "").trim();
      let url = "/builder?slug=demo";
      if (v1) url += `&partner1=${encodeURIComponent(v1)}`;
      if (v2) url += `&partner2=${encodeURIComponent(v2)}`;
      window.location.href = url;
    };
    btn.addEventListener("click", launch);
    [p1, p2].forEach(inp => {
      if (inp) {
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            launch();
          }
        });
      }
    });
  }
  setupQuickPersonalizer("v1QuickP1", "v1QuickP2", "btnV1QuickStart");
  setupQuickPersonalizer("v2QuickP1", "v2QuickP2", "btnV2QuickStart");

  const btnCloseCheckoutModal = document.getElementById("btnCloseCheckoutModal");
  if (btnCloseCheckoutModal) {
    btnCloseCheckoutModal.addEventListener("click", () => closeModal(checkoutModal));
  }

  // Real-Time Slug Check
  const inputSlug = document.getElementById("inputSlug");
  const slugFeedback = document.getElementById("slugFeedback");
  let slugDebounce = null;

  if (inputSlug) {
    inputSlug.addEventListener("input", () => {
      clearTimeout(slugDebounce);
      const raw = inputSlug.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      inputSlug.value = raw;

      if (!raw || raw.length < 2) {
        slugFeedback.className = "slug-feedback";
        slugFeedback.textContent = "Enter 2-40 letters, numbers, or dashes";
        checkoutState.slugAvailable = false;
        return;
      }

      slugFeedback.className = "slug-feedback";
      slugFeedback.textContent = "Checking availability...";

      slugDebounce = setTimeout(async () => {
        try {
          const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(raw)}`);
          const data = await res.json();
          if (data.available) {
            slugFeedback.className = "slug-feedback available";
            slugFeedback.textContent = `✓ '${raw}' is available!`;
            checkoutState.slugAvailable = true;
          } else {
            slugFeedback.className = "slug-feedback unavailable";
            slugFeedback.textContent = `✕ ${data.error || "Slug is taken or reserved"}`;
            checkoutState.slugAvailable = false;
          }
        } catch (err) {
          slugFeedback.className = "slug-feedback unavailable";
          slugFeedback.textContent = "Error checking slug availability";
        }
      }, 300);
    });
  }

  const inputP1 = document.getElementById("inputPartner1");
  const inputP2 = document.getElementById("inputPartner2");
  function autoSuggestSlug() {
    if (!inputSlug.value && inputP1.value.trim() && inputP2.value.trim()) {
      const s1 = inputP1.value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const s2 = inputP2.value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      if (s1 && s2) {
        inputSlug.value = `${s1}-and-${s2}`;
        inputSlug.dispatchEvent(new Event("input"));
      }
    }
  }
  if (inputP1) inputP1.addEventListener("blur", autoSuggestSlug);
  if (inputP2) inputP2.addEventListener("blur", autoSuggestSlug);

  const checkoutStep1 = document.getElementById("checkoutStep1");
  const checkoutStep3 = document.getElementById("checkoutStep3");
  const btnCheckoutNext = document.getElementById("btnCheckoutNext");
  const btnCancelCheckout = document.getElementById("btnCancelCheckout");
  const checkoutModalFooter = document.getElementById("checkoutModalFooter");
  const checkoutModalSubtitle = document.getElementById("checkoutModalSubtitle");
  const checkoutAdminNotice = document.getElementById("checkoutAdminNotice");
  const checkoutPlanSelectWrap = document.getElementById("checkoutPlanSelectWrap");

  if (btnCancelCheckout) {
    btnCancelCheckout.addEventListener("click", () => closeModal(checkoutModal));
  }

  function renderCheckoutStep() {
    const isAdmin = currentUser && currentUser.role === "admin";
    const cost = isAdmin ? 0 : (checkoutState.plan === "starter" ? 19 : 39);

    if (checkoutAdminNotice) checkoutAdminNotice.style.display = isAdmin ? "flex" : "none";
    if (checkoutPlanSelectWrap) checkoutPlanSelectWrap.style.display = isAdmin ? "none" : "block";

    if (checkoutState.step === 1) {
      checkoutStep1.style.display = "block";
      checkoutStep3.style.display = "none";
      checkoutModalFooter.style.display = "flex";
      if (isAdmin) {
        checkoutModalSubtitle.textContent = "Master Admin Mode • Instant Provisioning • Zero Cost ($0)";
        btnCheckoutNext.innerHTML = `<span>🚀 Instant Provision Project & Launch Studio (Admin)</span> <span>✨</span>`;
      } else {
        checkoutModalSubtitle.textContent = `One-time payment • Lifetime access • Instant Studio unlock ($${cost})`;
        btnCheckoutNext.innerHTML = `<span>💖 Claim Project & Launch Studio ($${cost})</span> <span>🚀</span>`;
      }
    } else if (checkoutState.step === 3) {
      checkoutStep1.style.display = "none";
      checkoutStep3.style.display = "block";
      checkoutModalFooter.style.display = "none";
      checkoutModalSubtitle.textContent = "✨ Studio Unlocked & Ready!";
    }
  }

  btnCheckoutNext.addEventListener("click", async () => {
    if (checkoutState.step === 1) {
      const p1 = inputP1.value.trim();
      const p2 = inputP2.value.trim();
      const slug = inputSlug.value.trim();
      const email = document.getElementById("inputEmail").value.trim();
      const elAnniv = document.getElementById("inputAnniversary");
      const anniversaryDate = elAnniv ? elAnniv.value : null;

      if (!p1 || !p2) return alert("Please enter both partner names.");
      if (!slug || !checkoutState.slugAvailable) return alert("Please choose an available URL slug.");
      if (!email || !email.includes("@")) return alert("Please enter a valid account email.");

      checkoutState.partner1 = p1;
      checkoutState.partner2 = p2;
      checkoutState.slug = slug;
      checkoutState.email = email;

      // Persist entered info to localStorage for reuse
      saveCreationInputs({ partner1: p1, partner2: p2, email, anniversaryDate });

      const isAdmin = currentUser && currentUser.role === "admin";
      btnCheckoutNext.disabled = true;
      btnCheckoutNext.innerHTML = `<span>Activating Project & Studio...</span> <span>⏳</span>`;

      try {
        const data = await safeJsonFetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            partner1: checkoutState.partner1,
            partner2: checkoutState.partner2,
            slug: checkoutState.slug,
            customerEmail: checkoutState.email,
            plan: isAdmin ? "vip" : checkoutState.plan,
            preset: (isAdmin || checkoutState.plan === "vip") ? "complete" : "storyteller",
            anniversaryDate
          })
        });

        if (data.userToken) {
          setUserToken(data.userToken);
          await checkCurrentUser();
        }

        checkoutState.provisionedData = data;

        localStorage.setItem("lovesaas_auth", JSON.stringify({
          slug: data.tenant.slug,
          authToken: data.tenant.authToken,
          partner1: data.tenant.partner1,
          partner2: data.tenant.partner2,
          plan: data.tenant.plan,
          role: data.isAdmin ? "admin" : "user"
        }));

        document.getElementById("successSiteUrl").textContent = data.siteUrl;
        document.getElementById("successPlanBadge").textContent = data.isAdmin
          ? "Forever VIP Suite (Admin Bypass $0)"
          : (data.tenant.plan === "starter" ? "Love Story Starter ($19)" : "Forever VIP Suite ($39)");
        
        const btnLaunch = document.getElementById("btnLaunchBuilder");
        btnLaunch.href = data.builderUrl;
        
        const btnLive = document.getElementById("btnViewLiveSite");
        btnLive.href = data.siteUrl;

        checkoutState.step = 3;
        renderCheckoutStep();
      } catch (err) {
        alert(err.message);
      } finally {
        btnCheckoutNext.disabled = false;
      }
    }
  });

  // ------------------------------------------------------------------
  // 11. USER AUTHENTICATION & PORTAL ENGINE
  // ------------------------------------------------------------------
  let currentUser = null;

  function getUserToken() {
    return localStorage.getItem("lovesaas_user_token");
  }

  function setUserToken(tok) {
    if (tok) localStorage.setItem("lovesaas_user_token", tok);
  }

  function clearUserToken() {
    localStorage.removeItem("lovesaas_user_token");
  }

  function authHeaders() {
    const tok = getUserToken();
    return tok ? { "Authorization": `Bearer ${tok}`, "X-User-Token": tok } : {};
  }

  const navAuthLoggedOut = document.getElementById("navAuthLoggedOut");
  const navAuthLoggedIn = document.getElementById("navAuthLoggedIn");
  const navUserName = document.getElementById("navUserName");
  const navUserAvatar = document.getElementById("navUserAvatar");
  const mobileAuthLoggedOut = document.getElementById("mobileAuthLoggedOut");
  const mobileAuthLoggedIn = document.getElementById("mobileAuthLoggedIn");
  const mobileUserName = document.getElementById("mobileUserName");
  const mobileUserCard = document.getElementById("mobileUserCard");
  const mobileUserAvatar = document.getElementById("mobileUserAvatar");
  const mobileUserEmail = document.getElementById("mobileUserEmail");
  const mobileBadgeSitesCount = document.getElementById("mobileBadgeSitesCount");

  async function fetchSitesCount() {
    try {
      const tok = getUserToken();
      if (!tok) return;
      const data = await safeJsonFetch("/api/user/designs", { headers: authHeaders() });
      const count = (data.designs || []).length;
      const mobileBadge = document.getElementById("mobileBadgeSitesCount");
      const navBadge = document.getElementById("navBadgeSitesCount");
      const dropBadge = document.getElementById("dropdownBadgeSitesCount");
      if (mobileBadge) mobileBadge.textContent = count;
      if (navBadge) navBadge.textContent = count;
      if (dropBadge) dropBadge.textContent = count;
    } catch {}
  }

  function renderUserState() {
    const name = currentUser ? (currentUser.name || currentUser.email.split("@")[0]) : "";
    const initial = name ? name[0].toUpperCase() : "👤";
    const btnNavGetStarted = document.getElementById("btnNavGetStarted");
    const btnHeroBuy = document.getElementById("btnHeroBuy");
    const btnStickyBuy = document.getElementById("btnStickyBuy");
    const btnMobileGetStarted = document.getElementById("btnMobileGetStarted");
    const drawerAccountSection = document.getElementById("drawerAccountSection");
    const drawerGuestSection = document.getElementById("drawerGuestSection");

    if (currentUser) {
      document.body.classList.add("user-logged-in");
      if (drawerAccountSection) drawerAccountSection.style.display = "flex";
      if (drawerGuestSection) drawerGuestSection.style.display = "none";

      if (navAuthLoggedOut) navAuthLoggedOut.style.display = "none";
      if (navAuthLoggedIn) navAuthLoggedIn.style.display = "flex";
      if (navUserName) navUserName.textContent = name;
      if (navUserAvatar) navUserAvatar.textContent = initial;

      if (mobileUserCard) mobileUserCard.style.display = "flex";
      if (mobileUserAvatar) mobileUserAvatar.textContent = initial;
      if (mobileUserName) mobileUserName.textContent = name;
      if (mobileUserEmail) mobileUserEmail.textContent = currentUser.email;

      // Dropdown user card & avatar letter
      const navAvatarLetter = document.getElementById("navUserAvatarLetter");
      const dropdownAvatar = document.getElementById("dropdownAvatarLetter");
      const dropdownName = document.getElementById("dropdownUserName");
      const dropdownEmail = document.getElementById("dropdownUserEmail");
      if (navAvatarLetter) navAvatarLetter.textContent = initial;
      if (dropdownAvatar) dropdownAvatar.textContent = initial;
      if (dropdownName) dropdownName.textContent = name;
      if (dropdownEmail) dropdownEmail.textContent = currentUser.email;

      if (btnNavGetStarted) btnNavGetStarted.style.display = "none";

      // Hide hamburger on mobile when logged in — avatar dropdown replaces it
      const mobileMenuBtn = document.getElementById("btnMobileMenuToggle");
      if (mobileMenuBtn) mobileMenuBtn.style.display = "none";

      // Auto-fetch sites count
      fetchSitesCount();

      if (btnHeroBuy) {
        btnHeroBuy.innerHTML = `<span>🚀</span> Go to Studio`;
        btnHeroBuy.onclick = (e) => { e.preventDefault(); window.location.href = "/builder"; };
      }
      if (btnStickyBuy) {
        btnStickyBuy.innerHTML = `<span>🚀</span> Go to Studio`;
        btnStickyBuy.onclick = (e) => { e.preventDefault(); window.location.href = "/builder"; };
      }
      if (btnMobileGetStarted) {
        btnMobileGetStarted.style.display = "none";
      }

      if (mobileAuthLoggedOut) mobileAuthLoggedOut.style.display = "none";
      if (mobileAuthLoggedIn) mobileAuthLoggedIn.style.display = "flex";

      const portalAvatar = document.getElementById("portalAvatar");
      const portalTitle = document.getElementById("userPortalModalTitle");
      const profileName = document.getElementById("profileName");
      const profileEmail = document.getElementById("profileEmail");
      if (portalAvatar) portalAvatar.textContent = initial;
      if (portalTitle) portalTitle.textContent = "My Websites";
      if (profileName) profileName.value = currentUser.name || "";
      if (profileEmail) profileEmail.value = currentUser.email;
    } else {
      document.body.classList.remove("user-logged-in");
      if (drawerAccountSection) drawerAccountSection.style.display = "none";
      if (drawerGuestSection) drawerGuestSection.style.display = "flex";

      if (mobileUserCard) mobileUserCard.style.display = "none";
      if (navAuthLoggedOut) navAuthLoggedOut.style.display = "flex";
      if (navAuthLoggedIn) navAuthLoggedIn.style.display = "none";
      if (btnNavGetStarted) btnNavGetStarted.style.display = "inline-flex";

      // Show hamburger for guests
      const mobileMenuBtn = document.getElementById("btnMobileMenuToggle");
      if (mobileMenuBtn) mobileMenuBtn.style.display = "";

      if (btnHeroBuy) {
        btnHeroBuy.innerHTML = `<span class="hero-btn-badge">FREE</span> <span>✨</span> Start Building Your Website →`;
        btnHeroBuy.onclick = (e) => { e.preventDefault(); window.location.href = "/builder?slug=demo"; };
      }
      if (btnStickyBuy) {
        btnStickyBuy.innerHTML = `<span>✨</span> Start Building Free →`;
        btnStickyBuy.onclick = (e) => { e.preventDefault(); window.location.href = "/builder?slug=demo"; };
      }
      if (btnMobileGetStarted) {
        btnMobileGetStarted.innerHTML = `<span>✨</span> Start Building Free →`;
        btnMobileGetStarted.onclick = (e) => { e.preventDefault(); window.location.href = "/builder?slug=demo"; };
      }

      if (mobileAuthLoggedOut) mobileAuthLoggedOut.style.display = "flex";
      if (mobileAuthLoggedIn) mobileAuthLoggedIn.style.display = "none";
    }
  }

  async function checkCurrentUser() {
    const tok = getUserToken();
    if (!tok) {
      currentUser = null;
      renderUserState();
      return;
    }
    try {
      const data = await safeJsonFetch("/api/auth/user-me", { headers: authHeaders() });
      currentUser = data.user;
    } catch {
      clearUserToken();
      currentUser = null;
    }
    renderUserState();
  }

  // Auth Modal Segmented Tabs & Switchers
  const authTabs = document.querySelectorAll(".auth-tab-btn[data-auth-tab]");
  const authPanes = {
    login: document.getElementById("formAuthLogin"),
    register: document.getElementById("formAuthRegister")
  };
  const authAlertError = document.getElementById("authAlertError");
  const authAlertSuccess = document.getElementById("authAlertSuccess");

  function setAuthAlert(msg, isError = true) {
    if (!authAlertError || !authAlertSuccess) return;
    authAlertError.style.display = "none";
    authAlertSuccess.style.display = "none";
    if (!msg) return;
    const target = isError ? authAlertError : authAlertSuccess;
    target.textContent = msg;
    target.style.display = "block";
  }

  function switchAuthTab(tabKey) {
    setAuthAlert("");
    authTabs.forEach(t => t.classList.toggle("active", t.dataset.authTab === tabKey));
    Object.entries(authPanes).forEach(([k, pane]) => {
      if (pane) pane.classList.toggle("active", k === tabKey);
    });
  }

  authTabs.forEach(t => {
    t.addEventListener("click", () => switchAuthTab(t.dataset.authTab));
  });

  const linkSwitchToRegister = document.getElementById("linkSwitchToRegister");
  if (linkSwitchToRegister) {
    linkSwitchToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      switchAuthTab("register");
    });
  }

  const linkSwitchToLogin = document.getElementById("linkSwitchToLogin");
  if (linkSwitchToLogin) {
    linkSwitchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      switchAuthTab("login");
    });
  }

  // Open / Close Auth Modal Buttons
  const btnOpenSignInModal = document.getElementById("btnOpenSignInModal");
  const footerSignInBtn = document.getElementById("footerSignInBtn");
  const btnCloseSignInModal = document.getElementById("btnCloseSignInModal");
  if (btnOpenSignInModal) btnOpenSignInModal.addEventListener("click", () => {
    switchAuthTab("login");
    openModal(signInModal);
  });
  if (footerSignInBtn) {
    footerSignInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentUser) {
        openUserPortal();
      } else {
        switchAuthTab("login");
        openModal(signInModal);
      }
    });
  }
  const btnFooterStart = document.getElementById("btnFooterStart");
  if (btnFooterStart) {
    btnFooterStart.addEventListener("click", () => openCheckoutModal("vip"));
  }
  if (btnCloseSignInModal) btnCloseSignInModal.addEventListener("click", () => closeModal(signInModal));

  // Form Submissions:
  // 1. Login
  const formAuthLogin = document.getElementById("formAuthLogin");
  const btnSubmitLogin = document.getElementById("btnSubmitLogin");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  if (formAuthLogin) {
    formAuthLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginEmail ? loginEmail.value.trim() : "";
      const password = loginPassword ? loginPassword.value : "";
      if (!email || !password) return setAuthAlert("Please enter both email and password.");

      btnSubmitLogin.disabled = true;
      btnSubmitLogin.innerHTML = `<span>Signing In... ⏳</span>`;
      setAuthAlert("");

      try {
        const data = await safeJsonFetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        setUserToken(data.token);
        currentUser = data.user;
        renderUserState();
        closeModal(signInModal);
        openUserPortal();
      } catch (err) {
        setAuthAlert(err.message);
      } finally {
        btnSubmitLogin.disabled = false;
        btnSubmitLogin.innerHTML = `<span>🔑 Sign In</span>`;
      }
    });
  }

  // Password visibility toggles
  document.querySelectorAll(".btn-toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
        btn.title = "Hide password";
      } else {
        input.type = "password";
        btn.textContent = "👁️";
        btn.title = "Show password";
      }
    });
  });

  // 2. Register
  const formAuthRegister = document.getElementById("formAuthRegister");
  const btnSubmitRegister = document.getElementById("btnSubmitRegister");
  const regName = document.getElementById("regName");
  const regEmail = document.getElementById("regEmail");
  const regPassword = document.getElementById("regPassword");

  if (formAuthRegister) {
    formAuthRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = regName ? regName.value.trim() : "";
      const email = regEmail ? regEmail.value.trim() : "";
      const password = regPassword ? regPassword.value : "";
      if (!name || !email || !password) return setAuthAlert("Please fill in all fields.");
      if (password.length < 4) return setAuthAlert("Password must be at least 4 characters.");

      btnSubmitRegister.disabled = true;
      btnSubmitRegister.innerHTML = `<span>Creating Account... ⏳</span>`;
      setAuthAlert("");

      try {
        const data = await safeJsonFetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        setUserToken(data.token);
        currentUser = data.user;
        renderUserState();
        closeModal(signInModal);
        openUserPortal();
      } catch (err) {
        setAuthAlert(err.message);
      } finally {
        btnSubmitRegister.disabled = false;
        btnSubmitRegister.innerHTML = `<span>✨ Create My Account</span>`;
      }
    });
  }

  // ------------------------------------------------------------------
  // 12. USER PORTAL (Websites, Settings, Receipts, Logout)
  // ------------------------------------------------------------------
  const btnUserPortal = document.getElementById("btnUserPortal");
  const btnCloseUserPortalModal = document.getElementById("btnCloseUserPortalModal");
  const btnPortalCreateNewSite = document.getElementById("btnPortalCreateNewSite");

  const accountSettingsModal = document.getElementById("accountSettingsModal");
  const receiptsModal = document.getElementById("receiptsModal");
  const btnCloseAccountSettingsModal = document.getElementById("btnCloseAccountSettingsModal");
  const btnCloseReceiptsModal = document.getElementById("btnCloseReceiptsModal");
  const btnDesktopAccountSettings = document.getElementById("btnDesktopAccountSettings");
  const btnDesktopLogout = document.getElementById("btnDesktopLogout");

  const btnDrawerOpenProjects = document.getElementById("btnDrawerOpenProjects");
  const btnDrawerOpenSettings = document.getElementById("btnDrawerOpenSettings");
  const btnDrawerOpenReceipts = document.getElementById("btnDrawerOpenReceipts");
  const btnDrawerLogout = document.getElementById("btnDrawerLogout");
  const btnCloseMobileDrawer = document.getElementById("btnCloseMobileDrawer");

  // Desktop user avatar dropdown
  const btnNavUserAvatar = document.getElementById("btnNavUserAvatar");
  const navUserDropdownMenu = document.getElementById("navUserDropdownMenu");
  const navUserAvatarLetter = document.getElementById("navUserAvatarLetter");

  if (btnNavUserAvatar && navUserDropdownMenu) {
    btnNavUserAvatar.addEventListener("click", (e) => {
      e.stopPropagation();
      navUserDropdownMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!navUserDropdownMenu.classList.contains("hidden") &&
          !navUserDropdownMenu.contains(e.target) &&
          e.target !== btnNavUserAvatar) {
        navUserDropdownMenu.classList.add("hidden");
      }
    });
  }

  async function openUserPortal() {
    if (!currentUser) {
      await checkCurrentUser();
      if (!currentUser) {
        openModal(signInModal);
        return;
      }
    }
    renderUserState();
    openModal(userPortalModal);
    loadUserDesigns();
  }
  window.openUserPortal = openUserPortal;

  async function openAccountSettings() {
    if (!currentUser) {
      await checkCurrentUser();
      if (!currentUser) {
        openModal(signInModal);
        return;
      }
    }
    renderUserState();
    openModal(accountSettingsModal);
  }

  async function openReceipts() {
    if (!currentUser) {
      await checkCurrentUser();
      if (!currentUser) {
        openModal(signInModal);
        return;
      }
    }
    renderUserState();
    openModal(receiptsModal);
    loadUserPurchases();
  }

  if (btnUserPortal) btnUserPortal.addEventListener("click", openUserPortal);
  if (btnDrawerOpenProjects) btnDrawerOpenProjects.addEventListener("click", () => {
    if (typeof window.toggleMenu === "function") window.toggleMenu(false);
    openUserPortal();
  });
  if (btnDrawerOpenSettings) btnDrawerOpenSettings.addEventListener("click", () => {
    if (typeof window.toggleMenu === "function") window.toggleMenu(false);
    openAccountSettings();
  });
  if (btnDrawerOpenReceipts) btnDrawerOpenReceipts.addEventListener("click", () => {
    if (typeof window.toggleMenu === "function") window.toggleMenu(false);
    openReceipts();
  });
  if (btnCloseMobileDrawer) btnCloseMobileDrawer.addEventListener("click", () => {
    if (typeof window.toggleMenu === "function") window.toggleMenu(false);
  });

  if (btnCloseUserPortalModal) btnCloseUserPortalModal.addEventListener("click", () => closeModal(userPortalModal));
  if (btnCloseAccountSettingsModal) btnCloseAccountSettingsModal.addEventListener("click", () => closeModal(accountSettingsModal));
  if (btnCloseReceiptsModal) btnCloseReceiptsModal.addEventListener("click", () => closeModal(receiptsModal));

  const btnDropdownMyWebsites = document.getElementById("btnDropdownMyWebsites");
  const btnDropdownReceipts = document.getElementById("btnDropdownReceipts");

  if (btnDropdownMyWebsites) btnDropdownMyWebsites.addEventListener("click", () => {
    if (navUserDropdownMenu) navUserDropdownMenu.classList.add("hidden");
    openUserPortal();
  });

  if (btnDropdownReceipts) btnDropdownReceipts.addEventListener("click", () => {
    if (navUserDropdownMenu) navUserDropdownMenu.classList.add("hidden");
    openReceipts();
  });

  if (btnDesktopAccountSettings) btnDesktopAccountSettings.addEventListener("click", () => {
    if (navUserDropdownMenu) navUserDropdownMenu.classList.add("hidden");
    openAccountSettings();
  });

  if (btnPortalCreateNewSite) {
    btnPortalCreateNewSite.addEventListener("click", () => {
      window.location.href = "/builder?create=1";
    });
  }

  // Logout handler
  async function performLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: authHeaders()
      });
    } catch {}
    clearUserToken();
    currentUser = null;
    renderUserState();
    closeModal(userPortalModal);
    closeModal(accountSettingsModal);
    closeModal(receiptsModal);
  }

  if (btnDrawerLogout) btnDrawerLogout.addEventListener("click", () => {
    if (typeof window.toggleMenu === "function") window.toggleMenu(false);
    performLogout();
  });
  if (btnDesktopLogout) btnDesktopLogout.addEventListener("click", () => {
    if (navUserDropdownMenu) navUserDropdownMenu.classList.add("hidden");
    performLogout();
  });

  function formatLastModified(dateStr) {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Recently";
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  }
  if (userPortalModal) {
    userPortalModal.addEventListener("wheel", (e) => {
      const body = userPortalModal.querySelector(".user-portal-body");
      if (!body) return;
      if (e.target.closest(".user-portal-body")) return;
      body.scrollTop += e.deltaY;
    }, { passive: true });
  }

  // Load User Designs (Simple, clean rows with ✏️ and 🗑️ icons)
  async function loadUserDesigns() {
    const listEl = document.getElementById("portalDesignsList");
    const mobileBadge = document.getElementById("mobileBadgeSitesCount");
    const navBadge = document.getElementById("navBadgeSitesCount");
    if (!listEl) return;

    listEl.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);"><div style="font-size: 2rem; margin-bottom: 8px;">⏳</div>Loading your websites...</div>`;

    try {
      const data = await safeJsonFetch("/api/user/designs", { headers: authHeaders() });
      const designs = data.designs || [];
      const dropBadge = document.getElementById("dropdownBadgeSitesCount");
      if (mobileBadge) mobileBadge.textContent = designs.length;
      if (navBadge) navBadge.textContent = designs.length;
      if (dropBadge) dropBadge.textContent = designs.length;

      if (designs.length === 0) {
        listEl.innerHTML = `
          <div class="portal-empty-state">
            <div class="empty-icon" style="font-size: 2.8rem; margin-bottom: 10px;">💍✨</div>
            <h4 style="font-size: 1.18rem; margin-bottom: 6px;">Create Your First Couple Website</h4>
            <p style="max-width: 360px; margin: 0 auto 16px; color: var(--text-secondary); font-size: 0.88rem; line-height: 1.45;">
              You don't have any websites yet. Start with our easy studio to create your romantic private keepsake.
            </p>
            <button type="button" class="btn btn-primary btn-lg" id="btnEmptyCreateSite" style="width: 100%; justify-content: center;">
              <span>💖</span> Create Website Now
            </button>
          </div>
        `;
        const btnEmpty = document.getElementById("btnEmptyCreateSite");
        if (btnEmpty) btnEmpty.addEventListener("click", () => {
          window.location.href = "/builder?create=1";
        });
        return;
      }

      listEl.innerHTML = designs.map(d => {
        const builderUrl = `/builder?slug=${encodeURIComponent(d.slug)}&token=${encodeURIComponent(d.authToken || "")}`;
        const liveUrl = `/sites/${encodeURIComponent(d.slug)}`;
        const title = (d.partner1 && d.partner2) ? `${escapeHtml(d.partner1)} &amp; ${escapeHtml(d.partner2)}` : escapeHtml(d.slug);
        const modDate = d.updatedAt || d.createdAt;
        const modifiedText = formatLastModified(modDate);
        const fullDate = modDate ? new Date(modDate).toLocaleString() : "";

        return `
          <div class="portal-simple-row" data-slug="${escapeHtml(d.slug)}">
            <div class="portal-simple-info">
              <div class="portal-simple-title">
                <span class="portal-simple-icon">💍</span>
                <span class="portal-simple-name">${title}</span>
              </div>
              <div class="portal-simple-meta">
                <a href="${liveUrl}" target="_blank" rel="noopener" class="portal-simple-link" title="Visit live website">
                  /sites/${escapeHtml(d.slug)} ↗
                </a>
                <span class="portal-simple-separator">•</span>
                <span class="portal-simple-modified" title="Last modified: ${escapeHtml(fullDate)}">
                  🕒 Modified ${escapeHtml(modifiedText)}
                </span>
              </div>
            </div>
            <div class="portal-simple-actions">
              <a href="${builderUrl}" class="btn-icon-action btn-edit-icon" title="Edit in Studio" data-slug="${escapeHtml(d.slug)}" data-token="${escapeHtml(d.authToken || "")}" data-plan="${escapeHtml(d.plan || "vip")}">
                ✏️
              </a>
              ${d.slug === "demo" ? "" : `
                <button type="button" class="btn-icon-action btn-delete-icon" title="Delete website" data-slug="${escapeHtml(d.slug)}">
                  🗑️
                </button>
              `}
            </div>
          </div>
        `;
      }).join("");

      const launchBuilder = (slug, token, plan) => {
        localStorage.setItem("lovesaas_auth", JSON.stringify({
          slug: slug,
          authToken: token,
          plan: plan || "vip",
          role: "user"
        }));
      };

      listEl.querySelectorAll(".btn-edit-icon").forEach(btn => {
        btn.addEventListener("click", (e) => {
          launchBuilder(btn.dataset.slug, btn.dataset.token, btn.dataset.plan);
        });
      });

      listEl.querySelectorAll(".btn-delete-icon").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const slug = btn.getAttribute("data-slug");
          if (!confirm(`Delete website "/sites/${slug}"? This cannot be undone.`)) return;
          try {
            btn.textContent = "⏳";
            btn.disabled = true;
            await safeJsonFetch(`/api/user/designs/${encodeURIComponent(slug)}`, {
              method: "DELETE",
              headers: authHeaders()
            });
            await loadUserDesigns();
          } catch (err) {
            alert(err.message || "Failed to delete website");
            btn.textContent = "🗑️";
            btn.disabled = false;
          }
        });
      });
    } catch (err) {
      if (err.status === 401) {
        clearUserToken();
        currentUser = null;
        renderUserState();
        closeModal(userPortalModal);
        openModal(signInModal);
        return;
      }
      listEl.innerHTML = `<div style="text-align: center; padding: 20px; color: #ef4444;">${err.message}</div>`;
    }
  }

  // Load User Purchases
  async function loadUserPurchases() {
    const listEl = document.getElementById("portalPurchasesList");
    const countBadge = document.getElementById("badgePurchasesCount");
    if (!listEl) return;

    listEl.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">Loading receipts...</div>`;

    try {
      const data = await safeJsonFetch("/api/user/purchases", { headers: authHeaders() });
      const purchases = data.purchases || [];
      if (countBadge) countBadge.textContent = purchases.length;

      if (purchases.length === 0) {
        listEl.innerHTML = `
          <div class="portal-empty-state">
            <div class="empty-icon">🧾</div>
            <h4>No purchases recorded yet</h4>
            <p>Receipts for lifetime couple website licenses will appear here.</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = purchases.map(p => {
        const dateStr = p.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(p.createdAt)) : "Recently";
        const amt = Number(p.amount || 0).toFixed(2);
        const orderShort = p.id ? String(p.id).slice(0, 8).toUpperCase() : "ORD";
        const planTitle = p.plan === "starter" ? "Love Story Starter License" : "Forever VIP Suite License";

        return `
          <div class="purchase-receipt-card">
            <div class="receipt-header">
              <div>
                <span class="receipt-order-id">#${orderShort}</span>
                <span class="receipt-plan-name">${planTitle}</span>
              </div>
              <span class="receipt-badge-status">Lifetime Paid</span>
            </div>
            <div class="receipt-meta-grid">
              <div><span class="meta-label">Amount:</span> <strong style="color: var(--primary);">$${amt} ${p.currency || "USD"}</strong></div>
              <div><span class="meta-label">Date:</span> <span>${dateStr}</span></div>
              <div><span class="meta-label">Project:</span> <a href="/sites/${escapeHtml(p.tenantSlug)}" target="_blank">/sites/${escapeHtml(p.tenantSlug)} ↗</a></div>
              <div><span class="meta-label">License:</span> <span>Perpetual</span></div>
            </div>
          </div>
        `;
      }).join("");
    } catch (err) {
      listEl.innerHTML = `<div style="text-align: center; padding: 20px; color: #ef4444;">${err.message}</div>`;
    }
  }

  // Profile Update Form
  const formPortalProfile = document.getElementById("formPortalUpdateProfile");
  const btnSaveProfile = document.getElementById("btnSaveProfile");
  const profileAlert = document.getElementById("profileAlert");

  if (formPortalProfile) {
    formPortalProfile.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("profileName").value.trim();
      const password = document.getElementById("profileNewPassword").value;

      if (btnSaveProfile) {
        btnSaveProfile.disabled = true;
        btnSaveProfile.innerHTML = `<span>Saving... ⏳</span>`;
      }
      if (profileAlert) profileAlert.style.display = "none";

      try {
        const payload = { name };
        if (password) {
          if (password.length < 4) throw new Error("New password must be at least 4 characters");
          payload.password = password;
        }

        const data = await safeJsonFetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(payload)
        });

        currentUser = data.user;
        renderUserState();
        if (profileAlert) {
          profileAlert.className = "auth-alert-box success";
          profileAlert.textContent = "Profile updated successfully! ✨";
          profileAlert.style.display = "block";
        }
        document.getElementById("profileNewPassword").value = "";
      } catch (err) {
        if (profileAlert) {
          profileAlert.className = "auth-alert-box error";
          profileAlert.textContent = err.message;
          profileAlert.style.display = "block";
        }
      } finally {
        if (btnSaveProfile) {
          btnSaveProfile.disabled = false;
          btnSaveProfile.innerHTML = `<span>💾 Save Changes</span>`;
        }
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Check auth state on page load
  checkCurrentUser();

  // Global overlay click
  const allModals = [checkoutModal, signInModal, userPortalModal, demoPreviewModal, widgetLightboxModal];
  allModals.forEach(m => {
    if (m) {
      m.addEventListener("click", (e) => {
        if (e.target === m) closeModal(m);
      });
    }
  });

  // Escape key closes open modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      allModals.forEach(m => {
        if (m && m.classList.contains("active")) closeModal(m);
      });
    }
  });

  // Cross-tab session sync
  window.addEventListener("storage", (e) => {
    if (e.key === "lovesaas_user_token") {
      checkCurrentUser();
    }
  });
});
