/**
 * LoveSaas — High-Converting Luxury Interactive Storefront Engine
 */

document.addEventListener("DOMContentLoaded", () => {
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
  // 5. PRESETS & 5 LUXURY THEME PALETTES
  // ------------------------------------------------------------------
  const PRESET_MAP = {
    complete: {
      title: "Complete Romance Suite",
      desc: "The full production experience containing all 13 interactive widgets. Perfect for anniversaries, milestones, and lifelong memory preservation.",
      icon: "💖",
      badges: ["👑 Hero & Clocks", "📈 Lof-O-Meter", "🗺️ Interactive Map", "📖 Timeline", "💌 Audio Letter", "📸 Polaroids", "🍾 Truth / Dare", "🎡 Spinner", "🎟️ Coupons", "✈️ Boarding Pass", "❓ Love Quiz", "🎵 Soundtrack"]
    },
    storyteller: {
      title: "The Storyteller Layout",
      desc: "Focused on your narrative journey, milestone chapters, travel locations, and romantic letters. Best for storytelling and travel memories.",
      icon: "📖",
      badges: ["👑 Hero Header", "📖 Timeline Chapters", "🗺️ Interactive Map", "📸 Memories Gallery", "✈️ Boarding Pass", "💌 Wax-Sealed Letter"]
    },
    playful: {
      title: "Playful & Interactive Fun",
      desc: "Packed with cute games, date night spinners, quiz competitions, scratchable love coupons, and the explosive Lof-O-Meter.",
      icon: "🎮",
      badges: ["👑 Hero Header", "📈 Lof-O-Meter", "🍾 Truth / Dare", "🎡 Date Night Spinner", "🎟️ Love Coupons", "❓ Love Quiz", "🕹️ Playful Games"]
    },
    minimal: {
      title: "Minimal Aesthetic Gallery",
      desc: "Clean, elegant, distraction-free photo showcase with your favorite background music and personal love letter.",
      icon: "📸",
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

      document.getElementById("presetTitle").textContent = data.title;
      document.getElementById("presetDesc").textContent = data.desc;
      document.getElementById("presetIcon").textContent = data.icon;

      const badgeWrap = document.getElementById("presetBadges");
      badgeWrap.innerHTML = data.badges.map(b => `<span class="preset-widget-badge">${b}</span>`).join("");
    });
  });

  const btnChoosePreset = document.getElementById("btnChoosePreset");
  if (btnChoosePreset) {
    btnChoosePreset.addEventListener("click", () => openCheckoutModal("vip"));
  }

  // Theme Swatches
  const themeSwatches = document.querySelectorAll(".theme-swatch");
  const heroMockupFrame = document.getElementById("heroMockupFrame");
  const activeThemeLabel = document.getElementById("activeThemeLabel");

  const THEME_STYLES = {
    pink: {
      name: "Theme: Romantic Rose",
      gradient: "linear-gradient(180deg, #241424 0%, #0d111d 100%)",
      border: "rgba(244, 63, 94, 0.5)",
      labelColor: "#f43f5e"
    },
    indigo: {
      name: "Theme: Starry Night",
      gradient: "linear-gradient(180deg, #151b44 0%, #080c18 100%)",
      border: "rgba(99, 102, 241, 0.6)",
      labelColor: "#818cf8"
    },
    peach: {
      name: "Theme: Sunset Peach",
      gradient: "linear-gradient(180deg, #331a0e 0%, #0c101b 100%)",
      border: "rgba(249, 115, 22, 0.55)",
      labelColor: "#fb923c"
    },
    emerald: {
      name: "Theme: Emerald Forest",
      gradient: "linear-gradient(180deg, #0e2a20 0%, #07130e 100%)",
      border: "rgba(16, 185, 129, 0.55)",
      labelColor: "#34d399"
    },
    purple: {
      name: "Theme: Velvet Midnight",
      gradient: "linear-gradient(180deg, #2b1340 0%, #0a0814 100%)",
      border: "rgba(168, 85, 247, 0.6)",
      labelColor: "#c084fc"
    }
  };

  themeSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      themeSwatches.forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      const themeKey = swatch.dataset.theme;
      const theme = THEME_STYLES[themeKey] || THEME_STYLES.pink;

      activeThemeLabel.textContent = theme.name;
      activeThemeLabel.style.color = theme.labelColor;

      if (heroMockupFrame) {
        heroMockupFrame.style.boxShadow = `0 35px 90px -20px rgba(0, 0, 0, 0.9), 0 0 60px -5px ${theme.border}`;
        heroMockupFrame.style.borderColor = theme.border;
        const bContent = heroMockupFrame.querySelector(".browser-content");
        if (bContent) bContent.style.background = theme.gradient;
      }
    });
  });

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
    reasons: { title: "💌 Reasons Why I Lof You", cat: "STORY", sub: "Categorized card deck with flip animations" }
  };

  // Category Filter Bar
  const filterBtns = document.querySelectorAll(".widget-filter-btn");
  const widgetCards = document.querySelectorAll(".widget-card");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;
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

  window.addEventListener("scroll", () => {
    if (window.scrollY > 600) {
      stickyCtaBar.classList.add("visible");
    } else {
      stickyCtaBar.classList.remove("visible");
    }
  });

  if (btnStickyBuy) btnStickyBuy.addEventListener("click", () => openCheckoutModal("vip"));
  if (btnStickyDemo) {
    btnStickyDemo.addEventListener("click", () => {
      const demoIframe = document.getElementById("demoIframe");
      demoIframe.src = "/sites/demo";
      openModal(document.getElementById("demoPreviewModal"));
    });
  }

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
  // 9. MODALS & IFRAME CONTROLLER
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

  const btnHeroDemo = document.getElementById("btnHeroDemo");
  if (btnHeroDemo) {
    btnHeroDemo.addEventListener("click", () => {
      demoIframe.src = "/sites/demo";
      openModal(demoPreviewModal);
    });
  }

  const btnCloseDemoModal = document.getElementById("btnCloseDemoModal");
  if (btnCloseDemoModal) {
    btnCloseDemoModal.addEventListener("click", () => {
      closeModal(demoPreviewModal);
      demoIframe.src = "";
    });
  }

  // Mobile Menu Toggle
  const btnMobileMenuToggle = document.getElementById("btnMobileMenuToggle");
  const navLinks = document.getElementById("navLinks");
  if (btnMobileMenuToggle && navLinks) {
    const toggleMenu = (open) => {
      const shouldOpen = open !== undefined ? open : !navLinks.classList.contains("mobile-open");
      navLinks.classList.toggle("mobile-open", shouldOpen);
      btnMobileMenuToggle.textContent = shouldOpen ? "✕" : "☰";
      btnMobileMenuToggle.setAttribute("aria-expanded", String(shouldOpen));
    };

    btnMobileMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

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
    if (currentUser) {
      window.location.href = "/builder";
      return;
    }
    checkoutState.step = 1;
    const isAdmin = currentUser && currentUser.role === "admin";
    checkoutState.plan = isAdmin ? "vip" : preferredPlan;

    const saved = getSavedCreationInputs();
    const elP1 = document.getElementById("inputPartner1");
    const elP2 = document.getElementById("inputPartner2");
    const elEmail = document.getElementById("inputEmail");
    const elAnniv = document.getElementById("inputAnniversary");

    if (elP1 && !elP1.value && saved.partner1) elP1.value = saved.partner1;
    if (elP2 && !elP2.value && saved.partner2) elP2.value = saved.partner2;
    if (elAnniv && !elAnniv.value && saved.anniversaryDate) elAnniv.value = saved.anniversaryDate;

    if (currentUser && currentUser.email) {
      if (elEmail) elEmail.value = currentUser.email;
    } else if (elEmail && !elEmail.value && saved.email) {
      elEmail.value = saved.email;
    }

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
  if (btnHeroBuy) btnHeroBuy.addEventListener("click", () => openCheckoutModal("vip"));

  const btnNavGetStarted = document.getElementById("btnNavGetStarted");
  if (btnNavGetStarted) btnNavGetStarted.addEventListener("click", () => openCheckoutModal("vip"));

  const btnMobileGetStarted = document.getElementById("btnMobileGetStarted");
  if (btnMobileGetStarted) btnMobileGetStarted.addEventListener("click", () => openCheckoutModal("vip"));

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
        btnCheckoutNext.innerHTML = `<span>🚀 Instant Provision Site & Launch Studio (Admin)</span> <span>✨</span>`;
      } else {
        checkoutModalSubtitle.textContent = `One-time payment • Lifetime access • Instant Studio unlock ($${cost})`;
        btnCheckoutNext.innerHTML = `<span>💖 Claim Site & Launch Studio ($${cost})</span> <span>🚀</span>`;
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
      btnCheckoutNext.innerHTML = `<span>Activating Site & Studio...</span> <span>⏳</span>`;

      try {
        const res = await fetch("/api/checkout", {
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

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create couple website");
        }

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
        
        const btnLaunch = document.getElementById("btnLaunchBuilderStudio");
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

  function renderUserState() {
    const name = currentUser ? (currentUser.name || currentUser.email.split("@")[0]) : "";
    const initial = name ? name[0].toUpperCase() : "👤";
    const btnNavGetStarted = document.getElementById("btnNavGetStarted");
    const btnHeroBuy = document.getElementById("btnHeroBuy");
    const btnStickyBuy = document.getElementById("btnStickyBuy");
    const btnMobileGetStarted = document.getElementById("btnMobileGetStarted");

    if (currentUser) {
      if (navAuthLoggedOut) navAuthLoggedOut.style.display = "none";
      if (navAuthLoggedIn) navAuthLoggedIn.style.display = "flex";
      if (navUserName) navUserName.textContent = name;
      if (navUserAvatar) navUserAvatar.textContent = initial;

      if (btnNavGetStarted) btnNavGetStarted.style.display = "none";

      if (btnHeroBuy) {
        btnHeroBuy.innerHTML = `<span>🚀</span> Go to Builder`;
        btnHeroBuy.onclick = (e) => { e.preventDefault(); window.location.href = "/builder"; };
      }
      if (btnStickyBuy) {
        btnStickyBuy.innerHTML = `<span>🚀</span> Go to Builder`;
        btnStickyBuy.onclick = (e) => { e.preventDefault(); window.location.href = "/builder"; };
      }
      if (btnMobileGetStarted) {
        btnMobileGetStarted.style.display = "none";
      }

      if (mobileAuthLoggedOut) mobileAuthLoggedOut.style.display = "none";
      if (mobileAuthLoggedIn) mobileAuthLoggedIn.style.display = "flex";
      if (mobileUserName) mobileUserName.textContent = name;

      const portalAvatar = document.getElementById("portalAvatar");
      const portalTitle = document.getElementById("userPortalModalTitle");
      const portalEmail = document.getElementById("portalEmail");
      const profileName = document.getElementById("profileName");
      const profileEmail = document.getElementById("profileEmail");
      if (portalAvatar) portalAvatar.textContent = initial;
      if (portalTitle) portalTitle.textContent = name;
      if (portalEmail) portalEmail.textContent = currentUser.email;
      if (profileName) profileName.value = currentUser.name || "";
      if (profileEmail) profileEmail.value = currentUser.email;
    } else {
      if (navAuthLoggedOut) navAuthLoggedOut.style.display = "flex";
      if (navAuthLoggedIn) navAuthLoggedIn.style.display = "none";
      if (btnNavGetStarted) btnNavGetStarted.style.display = "inline-flex";

      if (btnHeroBuy) {
        btnHeroBuy.innerHTML = `<span>💖</span> Create Our Couple Site — From $19`;
        btnHeroBuy.onclick = () => openCheckoutModal("vip");
      }
      if (btnStickyBuy) {
        btnStickyBuy.innerHTML = `<span>💖</span> Claim Site & Launch Studio`;
        btnStickyBuy.onclick = () => openCheckoutModal("vip");
      }
      if (btnMobileGetStarted) {
        btnMobileGetStarted.innerHTML = `<span>💖</span> Create Site`;
        btnMobileGetStarted.onclick = () => openCheckoutModal("vip");
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
      const res = await fetch("/api/auth/user-me", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
      } else {
        clearUserToken();
        currentUser = null;
      }
    } catch {
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
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid email or password");

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
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to register account");

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
  // 12. USER PORTAL (Designs, Purchases, Profile, Logout)
  // ------------------------------------------------------------------
  const btnUserPortal = document.getElementById("btnUserPortal");
  const btnMobileUserPortal = document.getElementById("btnMobileUserPortal");
  const btnCloseUserPortalModal = document.getElementById("btnCloseUserPortalModal");
  const btnPortalLogout = document.getElementById("btnPortalLogout");
  const btnMobileLogout = document.getElementById("btnMobileLogout");
  const btnPortalCreateNewSite = document.getElementById("btnPortalCreateNewSite");

  const portalTabs = document.querySelectorAll(".portal-tab-btn[data-portal-tab]");
  const portalPanes = {
    designs: document.getElementById("panePortalDesigns"),
    purchases: document.getElementById("panePortalPurchases"),
    settings: document.getElementById("panePortalSettings")
  };

  function switchPortalTab(tabKey) {
    portalTabs.forEach(t => t.classList.toggle("active", t.dataset.portalTab === tabKey));
    Object.entries(portalPanes).forEach(([k, pane]) => {
      if (pane) pane.classList.toggle("active", k === tabKey);
    });
  }

  portalTabs.forEach(t => {
    t.addEventListener("click", () => switchPortalTab(t.dataset.portalTab));
  });

  async function openUserPortal() {
    if (!currentUser) {
      await checkCurrentUser();
      if (!currentUser) {
        openModal(signInModal);
        return;
      }
    }
    renderUserState();
    switchPortalTab("designs");
    openModal(userPortalModal);
    loadUserDesigns();
    loadUserPurchases();
  }

  if (btnUserPortal) btnUserPortal.addEventListener("click", openUserPortal);
  if (btnMobileUserPortal) btnMobileUserPortal.addEventListener("click", openUserPortal);
  if (btnCloseUserPortalModal) btnCloseUserPortalModal.addEventListener("click", () => closeModal(userPortalModal));
  if (btnPortalCreateNewSite) {
    btnPortalCreateNewSite.addEventListener("click", () => {
      closeModal(userPortalModal);
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
  }

  if (btnPortalLogout) btnPortalLogout.addEventListener("click", performLogout);
  if (btnMobileLogout) btnMobileLogout.addEventListener("click", performLogout);

  // Load User Designs
  async function loadUserDesigns() {
    const listEl = document.getElementById("portalDesignsList");
    const countBadge = document.getElementById("badgeDesignsCount");
    if (!listEl) return;

    listEl.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">Loading your websites...</div>`;

    try {
      const res = await fetch("/api/user/designs", { headers: authHeaders() });
      if (res.status === 401) {
        clearUserToken();
        currentUser = null;
        renderUserState();
        closeModal(userPortalModal);
        openModal(signInModal);
        return;
      }
      if (!res.ok) throw new Error("Could not load designs");
      const data = await res.json();
      const designs = data.designs || [];
      if (countBadge) countBadge.textContent = designs.length;

      if (designs.length === 0) {
        listEl.innerHTML = `
          <div class="portal-empty-state" style="grid-column: 1/-1;">
            <div class="empty-icon">💍</div>
            <h4>No couple sites found</h4>
            <p>You haven't created any couple websites yet. Create one now to begin your romantic digital keepsake!</p>
            <button type="button" class="btn btn-primary btn-sm" id="btnEmptyCreateSite" style="margin-top: 10px;">
              <span>💖</span> Create Couple Site
            </button>
          </div>
        `;
        const btnEmpty = document.getElementById("btnEmptyCreateSite");
        if (btnEmpty) btnEmpty.addEventListener("click", () => {
          closeModal(userPortalModal);
          openCheckoutModal("vip");
        });
        return;
      }

      listEl.innerHTML = designs.map(d => {
        const studioUrl = `/builder?slug=${encodeURIComponent(d.slug)}&token=${encodeURIComponent(d.authToken || "")}`;
        const liveUrl = `/sites/${encodeURIComponent(d.slug)}`;
        const planName = d.plan === "starter" ? "Starter ($19)" : "Forever VIP ($39)";
        const dateStr = d.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d.createdAt)) : "Active";

        return `
          <div class="portal-design-card" data-slug="${d.slug}">
            <div class="portal-design-top">
              <span class="portal-plan-tag ${d.plan === "starter" ? "plan-starter" : "plan-vip"}">${planName}</span>
              <span style="font-size: 0.76rem; color: var(--text-muted);">${dateStr}</span>
            </div>
            <h4 class="portal-design-title">${escapeHtml(d.partner1)} & ${escapeHtml(d.partner2)}</h4>
            <div class="portal-design-slug">
              <a href="${liveUrl}" target="_blank" rel="noopener">/sites/${escapeHtml(d.slug)} ↗</a>
            </div>
            <div class="portal-design-actions">
              <a href="${studioUrl}" class="btn btn-primary btn-sm portal-studio-launch-btn" data-slug="${escapeHtml(d.slug)}" data-token="${escapeHtml(d.authToken || "")}" data-plan="${escapeHtml(d.plan || "vip")}" style="flex: 1; justify-content: center; text-decoration: none;">
                <span>🚀 Open Studio</span>
              </a>
              <a href="${liveUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="text-decoration: none;" title="View public site">
                <span>👁️</span>
              </a>
            </div>
          </div>
        `;
      }).join("");

      listEl.querySelectorAll(".portal-studio-launch-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          localStorage.setItem("lovesaas_auth", JSON.stringify({
            slug: btn.dataset.slug,
            authToken: btn.dataset.token,
            plan: btn.dataset.plan,
            role: "user"
          }));
        });
      });
    } catch (err) {
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
      const res = await fetch("/api/user/purchases", { headers: authHeaders() });
      if (res.status === 401) {
        clearUserToken();
        currentUser = null;
        renderUserState();
        closeModal(userPortalModal);
        openModal(signInModal);
        return;
      }
      if (!res.ok) throw new Error("Could not load purchases");
      const data = await res.json();
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
              <div><span class="meta-label">Site:</span> <a href="/sites/${escapeHtml(p.tenantSlug)}" target="_blank">/sites/${escapeHtml(p.tenantSlug)} ↗</a></div>
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

        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update profile");

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
