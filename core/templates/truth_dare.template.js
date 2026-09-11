/**
 * Template Renderer: truth_dare
 * Modular Decomposed Component
 */
(function() {
  if (typeof escapeHtml !== "function") {
    if (typeof window !== "undefined") {
      window.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };
    } else {
      global.escapeHtml = function(str) {
        if (str === null || str === undefined) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };
    }
  }
  if (typeof safeVal !== "function") {
    if (typeof window !== "undefined") {
      window.safeVal = function(v) {
        return String(v == null ? "" : v).replace(/"/g, "&quot;");
      };
    } else {
      global.safeVal = function(v) {
        return String(v == null ? "" : v).replace(/"/g, "&quot;");
      };
    }
  }

  const renderTemplate = (data = {}, rootData = {}) => {
    const p1 = data.p1Name || rootData.partner1 || "Aghiles";
    const p2 = data.p2Name || rootData.partner2 || "Ela";
    const tag = data.tag || "High-Stakes Couple's Duel 🎭";
    const title = data.title || "Truth or Dare: 100% Fair & Square ⚖️";
    const desc = data.desc || `Best of 3 games between ${p2} and ${p1}. Spin the bottle of destiny! (Algorithm verified by ${p1} 😏)`;
    const p1Title = data.p1Title || "Mastermind";
    const p2Title = data.p2Title || "Princess";
    const p1Avatar = data.p1Avatar || "🇩🇿👑";
    const p2Avatar = data.p2Avatar || "🇮🇩👸🏻";
    const p1Flag = data.p1Flag || "🇩🇿";
    const p2Flag = data.p2Flag || "🇮🇩";
    const p1WinsLabel = data.p1WinsLabel || `${p1} Wins`;
    const p2WinsLabel = data.p2WinsLabel || `${p2} Wins`;
    const bottleSkin = data.bottleStyle || "wine";
    const rigMode = data.rigMode || "p1_rigged";

    const getBottleSvg = (skin) => {
      if (skin === "champagne") {
        return `
          <svg viewBox="0 0 70 180" class="tod-bottle-svg tod-svg-champagne" aria-hidden="true">
            <defs>
              <linearGradient id="todChampagneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffeaa7"/>
                <stop offset="40%" stop-color="#fdcb6e"/>
                <stop offset="100%" stop-color="#b28900"/>
              </linearGradient>
              <linearGradient id="todGoldFoil" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stop-color="#ffeaa7"/>
                <stop offset="50%" stop-color="#d4af37"/>
                <stop offset="100%" stop-color="#997300"/>
              </linearGradient>
            </defs>
            <!-- Foil Neck -->
            <polygon points="35,0 25,12 45,12" fill="url(#todGoldFoil)" stroke="#d4af37" stroke-width="1.5"/>
            <rect x="26" y="12" width="18" height="16" rx="2" fill="url(#todGoldFoil)"/>
            <path d="M 26 28 L 44 28 L 42 66 L 28 66 Z" fill="url(#todGoldFoil)" stroke="#ffffff" stroke-width="0.8"/>
            <!-- Body -->
            <path d="M 28 66 C 14 74, 11 88, 11 114 L 11 162 C 11 174, 21 178, 35 178 C 49 178, 59 174, 59 162 L 59 114 C 59 88, 56 74, 42 66 Z" fill="url(#todChampagneGrad)" stroke="#ffffff" stroke-width="1.5"/>
            <!-- Shine -->
            <path d="M 17 105 Q 15 135 17 158 Q 23 165 23 150 Q 21 125 23 105 Z" fill="rgba(255,255,255,0.45)"/>
            <!-- Label -->
            <rect x="18" y="100" width="34" height="42" rx="6" fill="#2d3436" stroke="#d4af37" stroke-width="1.5"/>
            <text x="35" y="118" font-size="13" text-anchor="middle" fill="#ffeaa7">✨</text>
            <text x="35" y="132" font-size="8" font-weight="bold" fill="#fdcb6e" text-anchor="middle" font-family="'Outfit', sans-serif">CHAMPAGNE</text>
          </svg>
        `;
      }
      if (skin === "potion") {
        return `
          <svg viewBox="0 0 70 180" class="tod-bottle-svg tod-svg-potion" aria-hidden="true">
            <defs>
              <radialGradient id="todPotionGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#e056fd"/>
                <stop offset="60%" stop-color="#be2edd"/>
                <stop offset="100%" stop-color="#4834d4"/>
              </radialGradient>
              <linearGradient id="todGlassCap" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f8a5c2"/>
                <stop offset="100%" stop-color="#f78fb3"/>
              </linearGradient>
            </defs>
            <!-- Crystal Stopper -->
            <polygon points="35,2 26,14 44,14" fill="#f8a5c2" stroke="#e056fd" stroke-width="1.5"/>
            <rect x="29" y="14" width="12" height="14" rx="2" fill="#d4a373"/>
            <!-- Flask Neck -->
            <path d="M 28 28 L 42 28 L 40 68 L 30 68 Z" fill="rgba(255,255,255,0.3)" stroke="#e056fd" stroke-width="1.2"/>
            <!-- Round Cauldron Body -->
            <circle cx="35" cy="118" r="48" fill="url(#todPotionGrad)" stroke="#ffffff" stroke-width="2"/>
            <!-- Magic Sparkles & Heart -->
            <circle cx="28" cy="108" r="3" fill="#ffffff" opacity="0.8"/>
            <circle cx="44" cy="122" r="2.5" fill="#ffffff" opacity="0.6"/>
            <circle cx="33" cy="132" r="4" fill="#ffffff" opacity="0.7"/>
            <text x="35" y="122" font-size="16" text-anchor="middle">🔮</text>
            <text x="35" y="142" font-size="7.5" font-weight="900" fill="#f8a5c2" text-anchor="middle" font-family="'Outfit', sans-serif">LOVE POTION</text>
          </svg>
        `;
      }
      // Default: Wine
      return `
        <svg viewBox="0 0 70 180" class="tod-bottle-svg tod-svg-wine" aria-hidden="true">
          <defs>
            <linearGradient id="todBottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ff758c"/>
              <stop offset="50%" stop-color="#ff4365"/>
              <stop offset="100%" stop-color="#a81d45"/>
            </linearGradient>
            <linearGradient id="todGlassShine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.7)"/>
              <stop offset="50%" stop-color="rgba(255,255,255,0.05)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0.4)"/>
            </linearGradient>
          </defs>
          <polygon points="35,0 24,14 46,14" fill="#ffd166" stroke="#e09f3e" stroke-width="1.5"/>
          <rect x="27" y="14" width="16" height="14" rx="3" fill="#d4a373" stroke="#8d5b4c" stroke-width="1.5"/>
          <path d="M 27 28 L 43 28 L 41 62 L 29 62 Z" fill="url(#todBottleGrad)" stroke="#ffffff" stroke-width="1"/>
          <path d="M 29 62 C 14 70, 12 85, 12 110 L 12 160 C 12 172, 22 178, 35 178 C 48 178, 58 172, 58 160 L 58 110 C 58 85, 56 70, 41 62 Z" fill="url(#todBottleGrad)" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M 18 105 Q 16 135 18 158 Q 24 165 24 150 Q 22 125 24 105 Z" fill="url(#todGlassShine)"/>
          <rect x="20" y="98" width="30" height="42" rx="6" fill="#ffffff" opacity="0.95" stroke="#ffccd5" stroke-width="1"/>
          <text x="35" y="118" font-size="14" text-anchor="middle">❤️</text>
          <text x="35" y="132" font-size="8" font-weight="bold" fill="#ff4365" text-anchor="middle" font-family="'Outfit', sans-serif">LOF</text>
        </svg>
      `;
    };

    return `
    <section class="section truth-dare-section" id="truthDareSection" data-rig="${safeVal(rigMode)}" data-skin="${safeVal(bottleSkin)}">
      <div class="container">
        <div class="truth-dare-box glass-panel">
          <div class="section-heading">
            <span class="section-tag">${tag}</span>
            <h2 class="section-title">${title}</h2>
            <p class="section-desc">${desc}</p>
          </div>

          <!-- Scoreboard -->
          <div class="tod-scoreboard" id="todScoreboard">
            <div class="tod-player-card tod-player-aghiles" id="todCardAghiles">
              <div class="tod-avatar">${p1Avatar}</div>
              <div class="tod-player-meta">
                <span class="tod-player-name">${p1}</span>
                <span class="tod-player-title">${p1Title}</span>
              </div>
              <div class="tod-score-pill" id="todScoreAghiles">0</div>
            </div>

            <div class="tod-versus-center">
              <div class="tod-vs-tag">VS</div>
              <span class="tod-round-badge" id="todRoundBadge">Game 1/3</span>
            </div>

            <div class="tod-player-card tod-player-ela" id="todCardElla">
              <div class="tod-avatar">${p2Avatar}</div>
              <div class="tod-player-meta">
                <span class="tod-player-name">${p2}</span>
                <span class="tod-player-title">${p2Title}</span>
              </div>
              <div class="tod-score-pill" id="todScoreEla">0</div>
            </div>
          </div>

          <!-- Stage Container -->
          <div class="tod-stage-container">
            <div class="tod-arena">
              <div class="tod-bottle-zone" id="todBottleZone">
                <div class="tod-target-badge tod-target-aghiles" id="todTargetP1">
                  <span class="tod-flag">${p1Flag}</span>
                  <span class="tod-label">${p1WinsLabel}</span>
                  <span class="tod-target-arrow">▲</span>
                </div>

                <div class="tod-bottle-disc" id="todBottleDisc" title="Click or flick to spin!">
                  <div class="tod-disc-crosshairs"></div>
                  <div class="tod-bottle-wrapper tod-skin-${bottleSkin}" id="todBottleWrapper">
                    ${getBottleSvg(bottleSkin)}
                  </div>
                  <div class="tod-flick-hint" id="todFlickHint">
                    <span>👆 Tap or Flick</span>
                  </div>
                </div>

                <div class="tod-target-badge tod-target-ela" id="todTargetP2">
                  <span class="tod-target-arrow">▼</span>
                  <span class="tod-flag">${p2Flag}</span>
                  <span class="tod-label">${p2WinsLabel}</span>
                </div>
              </div>

              <div class="tod-status-alert" id="todStatusAlert">
                Tap or flick below to spin the bottle! Round 1 awaits! 🍾
              </div>

              <div class="tod-action-row" id="todSpinRow">
                <button type="button" id="todSpinBtn" class="btn btn-primary btn-pulse">
                  <span>Spin Bottle! 🍾🎲</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Challenge Card (Rounds 1, 2, 3) -->
            <div class="tod-challenge-card hidden" id="todChallengeCard"></div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["truth_dare"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
