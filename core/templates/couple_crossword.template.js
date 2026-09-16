/**
 * Template Renderer: couple_crossword
 * Modular Decomposed Component
 */
(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));
  const safe = (v) => String(v ?? "").replace(/\"/g, "&quot;");

  const renderTemplate = (data = {}, rootData = {}) => {
    const cw = data || {};
    const p1 = cw.partner1 || rootData.partner1 || "Aghiles";
    const p2 = cw.partner2 || rootData.partner2 || "Ella";
    const tag = cw.tag || "Interactive Couple Crossword 🧩✨";
    const title = cw.title || ("How Well Do You Know " + p2 + "? ✏️");
    const desc = cw.desc || ("Solve intersecting relationship clues, secret inside jokes, and favorite memories with " + p2 + "!");

    return `
    <section class="section couple-crossword-section" id="section-couple_crossword" data-widget-id="couple_crossword">
      <div class="container">
        <div class="crossword-board-card glass-panel">
          <div class="section-heading crossword-header">
            <span class="section-tag">${esc(tag)}</span>
            <h2 class="section-title">${esc(title)}</h2>
            <p class="section-desc">${esc(desc)}</p>
          </div>

          <!-- Crossword Top Status & Hint Bar -->
          <div class="crossword-action-bar">
            <div class="crossword-progress-pill">
              <span class="progress-label">Words Solved:</span>
              <span id="cwSolvedCount" class="progress-val">0 / 8</span>
            </div>
            <div class="crossword-btn-group">
              <button type="button" id="btnCwHint" class="btn-sm btn-secondary cw-hint-btn" title="Reveal selected letter">
                💡 Need a Hint?
              </button>
              <button type="button" id="btnCwCheck" class="btn-sm btn-primary cw-check-btn" title="Check your answers">
                ✓ Check Puzzle
              </button>
            </div>
          </div>

          <!-- Main Puzzle Layout (Grid + Clues) -->
          <div class="crossword-layout">
            <!-- Left Side: Interactive Grid -->
            <div class="crossword-grid-wrap">
              <div id="crosswordGrid" class="crossword-grid" role="grid" aria-label="Couples Crossword Puzzle">
                <!-- Dynamically generated cells -->
              </div>
              <div class="crossword-active-clue-banner" id="cwActiveClueBanner">
                <span class="clue-badge" id="cwBannerNum">1 ACROSS</span>
                <span class="clue-text" id="cwBannerText">Click any cell or clue to begin!</span>
              </div>
            </div>

            <!-- Right Side: Clues List -->
            <div class="crossword-clues-panel">
              <div class="clues-column across-column">
                <h4 class="clues-title">➡️ ACROSS</h4>
                <ul id="cwAcrossCluesList" class="clues-list"></ul>
              </div>
              <div class="clues-column down-column">
                <h4 class="clues-title">⬇️ DOWN</h4>
                <ul id="cwDownCluesList" class="clues-list"></ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Victory Solved Modal -->
      <div id="crosswordSolveModal" class="crossword-modal hidden">
        <div class="crossword-modal-backdrop"></div>
        <div class="crossword-modal-content">
          <button type="button" class="crossword-modal-close" id="btnCwCloseModal" title="Close">✕</button>
          <div class="crossword-victory-frame">
            <div class="victory-ribbon">100% PERFECT MATCH 🏆</div>
            <h3 class="victory-title" id="cwVictoryTitle">You Know My Heart Inside Out! ❤️</h3>
            <p class="victory-subtitle" id="cwVictorySubtitle">
              Certified Master of ${esc(p2)}'s favorite things, quirks & sweetest memories.
            </p>
            <div class="victory-seal">
              <span class="seal-icon">🧩</span>
              <span class="seal-text">Infinite Love Stamped</span>
            </div>
            <p class="victory-note" id="cwVictoryNote">
              Every single word solved connects another piece of our eternal story together.
            </p>
            <div class="victory-actions">
              <button type="button" id="btnCwReplay" class="btn-sm btn-primary">🔄 Play Again</button>
              <button type="button" id="btnCwDismiss" class="btn-sm btn-secondary">Close</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["couple_crossword"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
