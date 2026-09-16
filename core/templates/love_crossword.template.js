(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

  const renderTemplate = (data = {}, rootData = {}) => {
    const cw = Array.isArray(data) ? { words: data } : (data || {});
    const p1 = cw.partner1 || rootData.partner1 || "Partner 1";
    const p2 = cw.partner2 || rootData.partner2 || "Partner 2";
    const tag = cw.tag || "Couple Trivia Puzzle 🧩❤️";
    const title = cw.title || "The Love Crossword";
    const desc = cw.desc || "Crack the secret clues of our journey, inside jokes, and favorites to unlock our certificate!";
    const certTitle = cw.certTitle || "Crossword Master of My Heart 🏆";
    const certQuote = cw.certQuote || "« Solved every clue of our story with brilliance and boundless love. »";

    const words = Array.isArray(cw.words) && cw.words.length ? cw.words : [
      { id: "A1", dir: "across", num: 1, word: "MATCHA", clue: "Our favorite creamy green morning drink ritual 🍵", r: 2, c: 0 },
      { id: "A2", dir: "across", num: 2, word: "LOVEISBLIND", clue: "The reality drama we binge-watched on date night 📺", r: 5, c: 0 },
      { id: "A3", dir: "across", num: 3, word: "DONUT", clue: "Our favorite sweet late-night bakery snack 🍩", r: 8, c: 0 },
      { id: "A4", dir: "across", num: 4, word: "TARTE", clue: "Her must-have cruelty-free beauty & blush essential 💄", r: 8, c: 5 },
      { id: "A5", dir: "across", num: 5, word: "PORSCHE", clue: "Your dream sports car in Miami blue 🏎️", r: 11, c: 2 },
      { id: "D1", dir: "down", num: 1, word: "TAYLOR", clue: "The artist behind our favorite playlist 🎵", r: 1, c: 1 },
      { id: "D2", dir: "down", num: 2, word: "PEANUT", clue: "Your silly nickname when you act adorable 🥜", r: 4, c: 3 },
      { id: "D3", dir: "down", num: 3, word: "PARIS", clue: "The city where we promised our next anniversary 🥐", r: 1, c: 5 },
      { id: "D4", dir: "down", num: 4, word: "TIMOTHEE", clue: "Your celebrity crush from Dune 🎬", r: 4, c: 8 },
      { id: "D5", dir: "down", num: 5, word: "LAVENDER", clue: "Her favorite pastel hue & relaxing aroma 🪻", r: 0, c: 10 }
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
