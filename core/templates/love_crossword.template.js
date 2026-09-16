(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

  const renderTemplate = (data = {}, rootData = {}) => {
    const cw = Array.isArray(data) ? { words: data } : (data || {});
    const p1 = cw.partner1 || rootData.partner1 || "Partner 1";
    const p2 = cw.partner2 || rootData.partner2 || "Partner 2";
    const tag = cw.tag || "Aghiles & Ella's Love Story 🧩❤️";
    const title = cw.title || "How Well Do You Know Our Story? 🧩";
    const desc = cw.desc || "Crack the secret clues of our journey from Guangzhou to Bali, inside jokes & forever memories!";
    const certTitle = cw.certTitle || "Certified Soulmate & Heart Cryptographer 🏆";
    const certQuote = cw.certQuote || "« Through Guangzhou midnight towers, freezing Dagu summits, and Bali sunsets — you are my greatest puzzle and forever soulmate. »";

    const words = Array.isArray(cw.words) && cw.words.length ? cw.words : [
      { id: "A1", dir: "across", num: 3, word: "CANTON", clue: "The iconic Guangzhou tower where we talked for 7 hours until sunrise 🗼", r: 1, c: 6 },
      { id: "A2", dir: "across", num: 5, word: "ALGERIA", clue: "My home country waiting with Mediterranean beaches to welcome you 🇩🇿", r: 3, c: 2 },
      { id: "A3", dir: "across", num: 8, word: "BEBEK", clue: "The Balinese duck dinner that means \"your father\" in Algerian Arabic 🦆", r: 6, c: 0 },
      { id: "A4", dir: "across", num: 9, word: "VIETNAM", clue: "The transit airport where we wore 4 pairs of pants each in 30°C heat 🇻🇳", r: 8, c: 4 },
      { id: "A5", dir: "across", num: 10, word: "SEEDS", clue: "Two special sunflower items given on April 23 to ask you to be mine 🌻", r: 11, c: 0 },
      { id: "D1", dir: "down", num: 1, word: "BALI", clue: "Our dream island escape with sunset beaches, private villa & ATV trails 🌴", r: 0, c: 7 },
      { id: "D2", dir: "down", num: 2, word: "DAGU", clue: "Freezing 5,000m summit glacier where we warmed up together in the chalet 🏔️", r: 1, c: 4 },
      { id: "D3", dir: "down", num: 4, word: "NANJING", clue: "The rainy mountain where we climbed together to the Buddha temple 🛕", r: 1, c: 11 },
      { id: "D4", dir: "down", num: 6, word: "PERFUME", clue: "The sweet surprise gift you handed me at your apartment on Dec 10 🎁", r: 5, c: 1 },
      { id: "D5", dir: "down", num: 7, word: "JAKARTA", clue: "The city where we met Lili & Ayung, played games, and ordered snacks 🇮🇩", r: 5, c: 9 }
    ];

    const acrossWords = words.filter(w => w.dir === "across").sort((a, b) => a.num - b.num);
    const downWords = words.filter(w => w.dir === "down").sort((a, b) => a.num - b.num);

    return `
    <section class="section couple-crossword-section" id="section-love_crossword" data-widget-id="love_crossword">
      <div class="container">
        <div class="crossword-board-card glass-panel">
          <div class="crossword-header text-center">
            <span class="section-tag">${esc(tag)}</span>
            <h2 class="section-title">${esc(title)}</h2>
            <p class="section-desc">${esc(desc)}</p>
          </div>

          <div class="crossword-hud-bar">
            <div class="hud-left">
              <div class="hud-stat-pill">
                <span class="stat-icon">🧩</span>
                <span class="stat-text"><strong id="cwSolvedCount">0</strong>/${words.length} Solved</span>
              </div>
              <div class="hud-stat-pill">
                <span class="stat-icon">⏱️</span>
                <span id="cwTimerText" class="stat-text">00:00</span>
              </div>
              <div class="hud-stat-pill">
                <span class="stat-icon">❤️</span>
                <span class="stat-text"><strong id="cwScoreText">1000</strong> pts</span>
              </div>
            </div>
            <div class="hud-right">
              <button type="button" id="btnCwHint" class="cw-action-btn hint-btn" title="Reveal letter (-20 pts)">
                <span>💡</span> Hint
              </button>
              <button type="button" id="btnCwCheck" class="cw-action-btn check-btn" title="Check active word (-5 pts)">
                <span>❤️</span> Check
              </button>
              <button type="button" id="btnCwSolveWord" class="cw-action-btn solve-btn" title="Solve active word (-60 pts)">
                <span>✨</span> Reveal
              </button>
              <button type="button" id="btnCwReset" class="cw-action-btn reset-btn" title="Reset puzzle">
                <span>🔄</span>
              </button>
            </div>
          </div>

          <div class="cw-active-clue-banner" id="cwActiveClueBanner">
            <button type="button" id="btnCwDirToggle" class="cw-dir-badge" aria-label="Toggle Direction">
              <span id="cwDirIcon">↔️</span>
              <span id="cwDirLabel">ACROSS</span>
            </button>
            <div class="cw-banner-text-wrap">
              <span id="cwActiveClueNum" class="cw-banner-num">1</span>
              <span id="cwActiveClueText" class="cw-banner-clue">Select a cell to begin solving...</span>
            </div>
            <div class="cw-banner-nav">
              <button type="button" id="btnCwPrevClue" class="cw-banner-nav-btn" aria-label="Previous Clue">◀</button>
              <button type="button" id="btnCwNextClue" class="cw-banner-nav-btn" aria-label="Next Clue">▶</button>
            </div>
          </div>

          <div class="crossword-main-layout">
            <div class="crossword-grid-wrap">
              <div class="crossword-grid" id="crosswordGrid" role="grid" aria-label="Crossword Grid">
              </div>
              <input type="text" id="cwHiddenInput" class="cw-hidden-input" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" inputmode="text" aria-hidden="true" tabindex="-1">
            </div>

            <div class="crossword-clues-panel">
              <div class="clues-tabs-header">
                <button type="button" class="clue-tab-btn active" data-clue-tab="across">Across (${acrossWords.length})</button>
                <button type="button" class="clue-tab-btn" data-clue-tab="down">Down (${downWords.length})</button>
              </div>

              <div class="clues-columns-wrapper">
                <div class="clues-column" id="cwAcrossColumn" data-tab-content="across">
                  <h4 class="clue-col-title">↔️ Across</h4>
                  <ul class="clues-list" id="cwAcrossCluesList">
                    ${acrossWords.map(w => `
                      <li class="clue-item" data-word-id="${esc(w.id)}" data-dir="across" data-num="${w.num}" tabindex="0">
                        <span class="clue-num">${w.num}.</span>
                        <span class="clue-body">${esc(w.clue)}</span>
                        <span class="clue-len">(${w.word.length})</span>
                        <span class="clue-status-badge"></span>
                      </li>
                    `).join("")}
                  </ul>
                </div>

                <div class="clues-column" id="cwDownColumn" data-tab-content="down">
                  <h4 class="clue-col-title">↕️ Down</h4>
                  <ul class="clues-list" id="cwDownCluesList">
                    ${downWords.map(w => `
                      <li class="clue-item" data-word-id="${esc(w.id)}" data-dir="down" data-num="${w.num}" tabindex="0">
                        <span class="clue-num">${w.num}.</span>
                        <span class="clue-body">${esc(w.clue)}</span>
                        <span class="clue-len">(${w.word.length})</span>
                        <span class="clue-status-badge"></span>
                      </li>
                    `).join("")}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="crossword-mobile-keypad" id="cwMobileKeypad" aria-label="Touch Keyboard">
            <div class="keypad-row">
              ${["Q","W","E","R","T","Y","U","I","O","P"].map(k => `<button type="button" class="cw-key" data-key="${k}">${k}</button>`).join("")}
            </div>
            <div class="keypad-row">
              ${["A","S","D","F","G","H","J","K","L"].map(k => `<button type="button" class="cw-key" data-key="${k}">${k}</button>`).join("")}
            </div>
            <div class="keypad-row">
              <button type="button" class="cw-key key-special" data-key="DIR" title="Toggle Direction">⇄</button>
              ${["Z","X","C","V","B","N","M"].map(k => `<button type="button" class="cw-key" data-key="${k}">${k}</button>`).join("")}
              <button type="button" class="cw-key key-special" data-key="BACK" title="Delete Letter">⌫</button>
            </div>
          </div>
        </div>

        <div class="crossword-modal-backdrop" id="crosswordSolveModal" aria-hidden="true">
          <div class="crossword-modal-card glass-panel">
            <div class="modal-confetti-emitter"></div>
            <div class="modal-badge-crown">🏆</div>
            <h3 class="modal-cert-title" id="cwModalCertTitle">${esc(certTitle)}</h3>
            <p class="modal-cert-sub">Presented with Infinite Love to ${esc(p2)} &amp; ${esc(p1)}</p>

            <div class="modal-score-plaque">
              <div class="modal-score-val" id="cwModalAffinity">100% Soulmate Affinity</div>
              <div class="modal-score-stats">
                <span id="cwModalTimeStat">Time: 00:00</span> •
                <span id="cwModalHintsStat">Hints: 0</span> •
                <span id="cwModalPointsStat">Score: 1000 pts</span>
              </div>
            </div>

            <blockquote class="modal-quote" id="cwModalQuote">${esc(certQuote)}</blockquote>

            <div class="modal-actions">
              <button type="button" id="btnCwDownloadCert" class="btn-cert-download">
                <span>📥</span> Download Keepsake Card
              </button>
              <button type="button" id="btnCwReplay" class="btn-cert-replay">
                <span>🔄</span> Play Again
              </button>
              <button type="button" id="btnCwCloseModal" class="btn-cert-close">
                <span>✖</span> Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["love_crossword"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
