/**
 * Runtime Widget Engine: scrapbook-game.runtime.js
 * Tactile Scrapbook "How Well Do You Know Me?" Interactive Engine
 * With Procedural Web Audio, 3D Polaroid Flipping, Combo Streaks & Canvas PNG Exporter.
 */
(function() {
  let currentStep = 0;
  let score = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let unlockedBadges = [];
  let cachedData = null;
  let cachedHero = null;

  // Web Audio Procedural Sound Synthesizer
  const SoundFX = {
    ctx: null,
    getCtx() {
      if (!this.ctx && typeof window !== "undefined") {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    },
    shutter() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      // White noise burst for click
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(now);
    },
    stickerSlap() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    },
    pageFlip() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(1600, now + 0.12);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(now);
    },
    chimeFanfare() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.8);
      });
    },
    failWobble() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    }
  };

  function getScrapbookConfig() {
    if (cachedData && Array.isArray(cachedData.items) && cachedData.items.length > 0) {
      return cachedData;
    }
    if (typeof window.SCRAPBOOK_DATA !== "undefined" && window.SCRAPBOOK_DATA && Array.isArray(window.SCRAPBOOK_DATA.items)) {
      return window.SCRAPBOOK_DATA;
    }
    return {
      items: [
        {
          q: "What is my absolute favorite comfort meal when we are tired?",
          options: ["Spicy Noodles 🍜", "Cheese Pizza 🍕", "Warm Rice Bowl 🍚", "Sweet Dessert Crepe 🥞"],
          correct: 0,
          sticker: "🍜",
          hint: "Think hot broth and maximum spicy chili oil late at night!",
          image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
          caption: "Late-night food crawls together!",
          dateLocation: "Night Street Market • 11:42 PM",
          memoryNote: "Every time we walk around late, you already know spicy noodles with extra soup is the instant mood fixer!"
        },
        {
          q: "Where was the place we spent 7 hours talking without noticing time?",
          options: ["At the airport cafe ✈️", "Under Canton Tower lights 🗼", "On the beach sand 🏖️", "Inside the train carriage 🚆"],
          correct: 1,
          sticker: "🗼",
          hint: "The tall tower lights were shimmering across the river reflection!",
          image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
          caption: "Golden midnight breeze",
          dateLocation: "Pearl River Promenade • 3:15 AM",
          memoryNote: "We sat by the river with the tower shining above us until the sunrise told us 7 hours had already passed."
        },
        {
          q: "What is my favorite nickname for you when no one else is around?",
          options: ["My Sweetest Honey 🍯", "My Precious Princess 👑", "Little Trouble Maker 😜", "My Forever Lof ❤️"],
          correct: 3,
          sticker: "❤️",
          hint: "Spelled with our cute special spelling that means infinity!",
          image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
          caption: "Secret code of our hearts",
          dateLocation: "Our Private Universe • Always",
          memoryNote: "Because no word in any dictionary fits you more perfectly than my eternal Lof!"
        }
      ]
    };
  }

  function updateRibbon(questions) {
    const ribbonBadges = document.getElementById("scrapbookRibbonBadges");
    const scoreDisplay = document.getElementById("scrapbookScoreDisplay");
    const streakPill = document.getElementById("scrapbookStreakPill");
    const streakCount = document.getElementById("scrapbookStreakCount");

    if (scoreDisplay) {
      scoreDisplay.textContent = score + " / " + (questions ? questions.length : 0);
    }
    if (streakPill && streakCount) {
      if (currentStreak > 1) {
        streakPill.classList.remove("hidden");
        streakCount.textContent = "Streak x" + currentStreak + " 🔥";
      } else {
        streakPill.classList.add("hidden");
      }
    }
    if (!ribbonBadges) return;

    if (!unlockedBadges.length) {
      ribbonBadges.innerHTML = '<span class="ribbon-empty-hint">Answer prompts to slap collectible stickers onto your album!</span>';
      return;
    }

    ribbonBadges.innerHTML = unlockedBadges.map(item =>
      '<span class="ribbon-sticker-item" title="' + (item.label || "Unlocked Memory") + '">' + item.sticker + '</span>'
    ).join("");
  }

  function renderCard() {
    const container = document.getElementById("scrapbookCardContainer");
    if (!container) return;

    const config = getScrapbookConfig();
    const questions = config.items || [];
    updateRibbon(questions);

    if (!questions.length) {
      container.innerHTML = '<p style="text-align:center; padding:30px; color:#8c6a5b;">No scrapbook memories configured yet.</p>';
      return;
    }

    if (currentStep >= questions.length) {
      openKeepsakeModal();
      return;
    }

    const q = questions[currentStep];
    const opts = Array.isArray(q.options) ? q.options : [];
    const polaroidImg = q.image || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80";
    const polaroidCap = q.caption || ("Memory #" + (currentStep + 1));
    const dateLoc = q.dateLocation || "Our Journey Together • Special Moment";
    const letters = ["A", "B", "C", "D"];

    container.innerHTML = `
      <div class="scrapbook-card" id="activeScrapbookCard">
        <!-- 3D Flippable Polaroid Scene -->
        <div class="polaroid-3d-scene" id="polaroid3dScene" title="Click to flip photo!">
          <div class="polaroid-card-inner" id="polaroidCardInner">
            <!-- Front Face -->
            <div class="polaroid-face polaroid-face-front">
              <div class="polaroid-tape-header washi-tape washi-pink"></div>
              <img src="${polaroidImg}" alt="Polaroid Memory" class="scrapbook-polaroid-img" />
              <div class="scrapbook-polaroid-caption">${polaroidCap}</div>
              <div class="polaroid-flip-hint"><span>🔄</span> Tap photo to flip for secret note</div>
            </div>
            <!-- Back Face -->
            <div class="polaroid-face polaroid-face-back">
              <div class="polaroid-back-postmark">
                <span>SEALED</span>
                <span>MEMORY</span>
              </div>
              <p class="polaroid-back-note">${q.memoryNote || "Every memory with you is carved into my heart forever."}</p>
              <div class="polaroid-back-footer">
                <span>📍 ${dateLoc}</span>
                <span>✨ Unlocked</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Question, Hint, and Choice Content -->
        <div class="scrapbook-content-side">
          <div>
            <div class="scrapbook-card-meta">
              <span class="scrapbook-step-tag">Memory Card ${currentStep + 1} of ${questions.length}</span>
              <span class="scrapbook-card-sticker-badge">${q.sticker || "⭐"}</span>
            </div>
            <h3 class="scrapbook-prompt-title">${q.q || ""}</h3>

            ${q.hint ? `
              <div class="scrapbook-whisper-hint">
                <button type="button" class="btn-toggle-hint" id="btnToggleHint">
                  <span>💡</span> Need a Whisper Hint?
                </button>
                <div class="hint-unfolded-box hidden" id="hintUnfoldedBox">
                  <strong>Psst:</strong> ${q.hint}
                </div>
              </div>
            ` : ""}

            <div class="scrapbook-choices-grid">
              ${opts.map((opt, i) => `
                <button type="button" class="scrapbook-choice-btn" data-choice-idx="${i}">
                  <span class="choice-badge-idx">${letters[i] || (i + 1)}</span>
                  <span class="choice-text">${opt}</span>
                </button>
              `).join("")}
            </div>
          </div>

          <div id="scrapbookFeedbackSlot"></div>
        </div>
      </div>
    `;

    // 3D Polaroid Flip on Click
    const polaroidInner = container.querySelector("#polaroidCardInner");
    if (polaroidInner) {
      polaroidInner.addEventListener("click", () => {
        polaroidInner.classList.toggle("is-flipped");
        SoundFX.pageFlip();
      });
    }

    // Hint toggle
    const hintBtn = container.querySelector("#btnToggleHint");
    const hintBox = container.querySelector("#hintUnfoldedBox");
    if (hintBtn && hintBox) {
      hintBtn.addEventListener("click", () => {
        hintBox.classList.toggle("hidden");
        SoundFX.pageFlip();
      });
    }

    // Interactive Choice Buttons
    container.querySelectorAll(".scrapbook-choice-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const selectedIdx = parseInt(btn.getAttribute("data-choice-idx"), 10);
        const isCorrect = selectedIdx === q.correct;
        const rect = btn.getBoundingClientRect();
        const activeCard = container.querySelector("#activeScrapbookCard");

        container.querySelectorAll(".scrapbook-choice-btn").forEach(b => {
          b.disabled = true;
        });

        if (isCorrect) {
          btn.classList.add("selected-correct");
          score++;
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
          unlockedBadges.push({ sticker: q.sticker || "⭐", label: q.q, img: polaroidImg, cap: polaroidCap });
          updateRibbon(questions);
          SoundFX.stickerSlap();
          if (typeof window.particles !== "undefined" && window.particles.burst) {
            window.particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
          }
        } else {
          btn.classList.add("selected-wrong");
          currentStreak = 0;
          updateRibbon(questions);
          if (activeCard) {
            activeCard.classList.add("shake-error");
            setTimeout(() => activeCard.classList.remove("shake-error"), 500);
          }
          const correctBtn = container.querySelector('.scrapbook-choice-btn[data-choice-idx="' + q.correct + '"]');
          if (correctBtn) correctBtn.classList.add("selected-correct");
          SoundFX.failWobble();
        }

        // Reveal memory card
        const feedbackSlot = container.querySelector("#scrapbookFeedbackSlot");
        if (feedbackSlot) {
          const isLast = currentStep + 1 >= questions.length;
          feedbackSlot.innerHTML = `
            <div class="scrapbook-memory-card">
              <div class="memory-note-header">
                <span class="scrapbook-stamp ${isCorrect ? "stamp-correct" : "stamp-wrong"}">
                  ${isCorrect ? "✨ SPOT ON!" : "🙈 SO CLOSE!"}
                </span>
                <span class="memory-note-tag">Secret Memory Unlocked</span>
              </div>
              <p class="memory-note-body">${q.memoryNote || "Every memory with you is carved into my heart forever."}</p>
              <button type="button" class="btn-scrapbook-next" id="btnScrapbookNext">
                ${isLast ? "Open Soulmate Scrapbook 🏆" : "Next Scrapbook Memory →"}
              </button>
            </div>
          `;

          const nextBtn = feedbackSlot.querySelector("#btnScrapbookNext");
          if (nextBtn) {
            nextBtn.addEventListener("click", () => {
              currentStep++;
              SoundFX.pageFlip();
              renderCard();
            });
          }
        }
      });
    });
  }

  function openKeepsakeModal() {
    const modal = document.getElementById("scrapbookKeepsakeModal");
    if (!modal) return;

    const config = getScrapbookConfig();
    const questions = config.items || [];
    const total = questions.length || 1;
    const ratio = Math.round((score / total) * 100);

    const scoreSeal = modal.querySelector("#sbCertScoreText");
    if (scoreSeal) scoreSeal.textContent = ratio + "% Telepathic Affinity (" + score + "/" + total + ")";

    // Left Page: Collage Grid of Polaroids
    const collageGrid = modal.querySelector("#sbCertCollageGrid");
    if (collageGrid) {
      collageGrid.innerHTML = questions.map((q, idx) => `
        <div class="collage-polaroid-item">
          <img src="${q.image || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=300&q=80"}" alt="Memory" />
          <div class="cap">${q.caption || ("Memory #" + (idx + 1))}</div>
        </div>
      `).join("");
    }

    // Stickers Grid
    const stickerGrid = modal.querySelector("#sbCertStickerGrid");
    if (stickerGrid) {
      const stickers = unlockedBadges.length ? unlockedBadges : [{ sticker: "💖" }, { sticker: "✨" }];
      stickerGrid.innerHTML = stickers.map(b => `
        <span class="ribbon-sticker-item" style="width:36px;height:36px;font-size:20px;">${b.sticker}</span>
      `).join("");
    }

    modal.classList.remove("hidden");
    SoundFX.chimeFanfare();

    if (typeof window.particles !== "undefined" && window.particles.burst) {
      window.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 60);
    }
  }

  function closeKeepsakeModal() {
    const modal = document.getElementById("scrapbookKeepsakeModal");
    if (modal) modal.classList.add("hidden");
  }

  // High-Res PNG Certificate Canvas Downloader
  function downloadKeepsakePNG() {
    const config = getScrapbookConfig();
    const p1 = (cachedHero && (cachedHero.partner1 || cachedHero.senderName)) || "Partner 1";
    const p2 = (cachedHero && (cachedHero.partner2 || cachedHero.partnerName)) || "Partner 2";
    const questions = config.items || [];
    const ratio = Math.round((score / Math.max(1, questions.length)) * 100);

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    // Parchment / Kraft background
    ctx.fillStyle = "#faf6ee";
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative Borders
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#ecdccc";
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#d4af37";
    ctx.strokeRect(50, 50, 1100, 700);

    // Header Stamp
    ctx.textAlign = "center";
    ctx.fillStyle = "#b03a60";
    ctx.font = "bold 20px -apple-system, sans-serif";
    ctx.fillText("★ OFFICIAL SOULMATE KEEPSAKE CERTIFICATE ★", 600, 120);

    // Main Title
    ctx.fillStyle = "#2b1e1a";
    ctx.font = "bold 44px -apple-system, sans-serif";
    ctx.fillText(config.certTitle || "How Well Do You Know Me? 📓", 600, 190);

    // Awardee
    ctx.fillStyle = "#b03a60";
    ctx.font = "italic 28px -apple-system, sans-serif";
    ctx.fillText("Awarded with Eternal Devotion to " + p2, 600, 250);

    // Score Badge
    ctx.fillStyle = "#d35400";
    ctx.font = "bold 34px -apple-system, sans-serif";
    ctx.fillText(ratio + "% Telepathic Affinity Match (" + score + "/" + questions.length + ")", 600, 320);

    // Quote
    ctx.fillStyle = "#55443e";
    ctx.font = "italic 22px -apple-system, sans-serif";
    ctx.fillText(config.certQuote || "« You know every secret glance, smile, and heartbeat of mine. »", 600, 390);

    // Stickers Emojis
    const stickerText = unlockedBadges.map(b => b.sticker).join("   ") || "💖   ⭐   ✨   🗼";
    ctx.font = "40px -apple-system, sans-serif";
    ctx.fillText(stickerText, 600, 480);

    // Note
    ctx.fillStyle = "#795548";
    ctx.font = "18px -apple-system, sans-serif";
    ctx.fillText("Valid throughout Algeria, China, Indonesia, and across all infinity with unlimited hugs & kisses.", 600, 560);

    // Signatures
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#d5c0aa";
    ctx.beginPath();
    ctx.moveTo(250, 680);
    ctx.lineTo(450, 680);
    ctx.moveTo(750, 680);
    ctx.lineTo(950, 680);
    ctx.stroke();

    ctx.fillStyle = "#2b1e1a";
    ctx.font = "italic bold 24px cursive, sans-serif";
    ctx.fillText(p1, 350, 665);
    ctx.fillText(p2, 850, 665);

    ctx.fillStyle = "#8c7368";
    ctx.font = "14px -apple-system, sans-serif";
    ctx.fillText("Signed Partner 1", 350, 710);
    ctx.fillText("Signed Partner 2", 850, 710);

    // Download trigger
    const link = document.createElement("a");
    link.download = "scrapbook-soulmate-keepsake.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    SoundFX.shutter();
  }

  function setupScrapbookGame(data, hero) {
    if (data) cachedData = data;
    if (hero) cachedHero = hero;
    currentStep = 0;
    score = 0;
    currentStreak = 0;
    unlockedBadges = [];

    const closeBtn = document.getElementById("btnScrapbookCloseKeepsake");
    const replayBtn = document.getElementById("btnScrapbookReplay");
    const downloadBtn = document.getElementById("btnScrapbookDownloadCert");

    if (closeBtn) closeBtn.onclick = closeKeepsakeModal;
    if (replayBtn) {
      replayBtn.onclick = () => {
        closeKeepsakeModal();
        currentStep = 0;
        score = 0;
        currentStreak = 0;
        unlockedBadges = [];
        SoundFX.pageFlip();
        renderCard();
      };
    }
    if (downloadBtn) downloadBtn.onclick = downloadKeepsakePNG;

    renderCard();
  }

  // Global Window Hooks for Live Builder Preview
  if (typeof window !== "undefined") {
    window.setupScrapbookGame = setupScrapbookGame;
    window.scrapbookJumpToQuestion = function(step) {
      currentStep = Math.max(0, step || 0);
      SoundFX.pageFlip();
      renderCard();
    };
    window.scrapbookReset = function() {
      currentStep = 0;
      score = 0;
      currentStreak = 0;
      unlockedBadges = [];
      closeKeepsakeModal();
      SoundFX.pageFlip();
      renderCard();
    };
    window.scrapbookOpenKeepsake = function() {
      openKeepsakeModal();
    };

    window.addEventListener("message", function(e) {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "SCRAPBOOK_JUMP_STEP" && typeof window.scrapbookJumpToQuestion === "function") {
        window.scrapbookJumpToQuestion(e.data.step);
      }
      if (e.data.type === "SCRAPBOOK_RESET" && typeof window.scrapbookReset === "function") {
        window.scrapbookReset();
      }
      if (e.data.type === "SCRAPBOOK_OPEN_KEEPSAKE" && typeof window.scrapbookOpenKeepsake === "function") {
        window.scrapbookOpenKeepsake();
      }
    });
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { setupScrapbookGame };
  }
})();
