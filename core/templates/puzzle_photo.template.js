(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

  const renderTemplate = (data = {}, rootData = {}) => {
    const pz = (data && typeof data === "object") ? data : {};
    const p1 = pz.partner1 || rootData.partner1 || "Alex";
    const p2 = pz.partner2 || rootData.partner2 || "Sam";
    const tag = pz.tag || "Memory Puzzle 🧩";
    const title = pz.title || "Piece Our Love Together";
    const desc = pz.desc || "Solve the puzzle to reveal our special memory & secret note.";
    const photoUrl = pz.photoUrl || "/public/images/puzzle-couple.jpg";
    const defaultMode = (pz.mode === "swap" ? "swap" : "slide");
    const gridSize = [3, 4, 5].includes(Number(pz.gridSize)) ? Number(pz.gridSize) : 3;
    const allowModeSwitch = pz.allowModeSwitch !== false;
    const allowHints = pz.allowHints !== false;
    const sfxEnabled = pz.sfxEnabled !== false;

    const reward = pz.reward || {};
    const rBadge = reward.badge || "💌 Secret Keepsake Unlocked";
    const rTitle = reward.title || "You Complete My World 💕";
    const rLetter = reward.letter || `« Every single moment, laugh, and adventure we share fits into my heart like the final missing piece of an eternal puzzle. I love you endlessly, ${p2}! »`;
    const rActionText = reward.actionText || "Claim Romantic Date 🥂";
    const rActionUrl = reward.actionUrl || `https://api.whatsapp.com/send?text=${encodeURIComponent(`I solved our photo puzzle! Time to claim my romantic date, ${p1}! ❤️🥂`)}`;

    return `
    <section class="section puzzle-photo-section" id="section-puzzle_photo" data-widget-id="puzzle_photo">
      <div class="container">
        <div class="puzzle-card glass-panel">
          <div class="puzzle-header text-center">
            <span class="section-tag">${esc(tag)}</span>
            <h2 class="section-title">${esc(title)}</h2>
            <p class="section-desc">${esc(desc)}</p>
          </div>

          <!-- HUD Control Bar -->
          <div class="puzzle-hud-bar">
            <div class="hud-stats-group">
              <div class="hud-pill" title="Time elapsed">
                <span class="hud-pill-icon">⏱️</span>
                <span id="puzzleTimerText" class="hud-pill-val">00:00</span>
              </div>
              <div class="hud-pill" title="Move count">
                <span class="hud-pill-icon">🔄</span>
                <span class="hud-pill-val"><strong id="puzzleMovesCount">0</strong> moves</span>
              </div>
              <div class="hud-pill hud-pill-target" title="Pieces in place">
                <span class="hud-pill-icon">🎯</span>
                <span class="hud-pill-val"><strong id="puzzleSolvedCount">0</strong>/<span id="puzzleTotalCount">${gridSize * gridSize}</span></span>
              </div>
              <div class="hud-pill hud-pill-best" id="puzzleBestPill" title="Personal best record" style="display:none;">
                <span class="hud-pill-icon">🏆</span>
                <span id="puzzleBestText" class="hud-pill-val">Best: --:--</span>
              </div>
            </div>

            <div class="hud-controls-group">
              ${allowModeSwitch ? `
              <div class="hud-segmented-switch hud-mode-switch" role="group" aria-label="Puzzle Mode">
                <button type="button" class="switch-pill-btn ${defaultMode === 'slide' ? 'active' : ''}" data-mode="slide" title="15-puzzle sliding tiles">
                  <span>Slide</span>
                </button>
                <button type="button" class="switch-pill-btn ${defaultMode === 'swap' ? 'active' : ''}" data-mode="swap" title="Tap two pieces to swap">
                  <span>Swap</span>
                </button>
              </div>
              ` : ''}

              <div class="hud-segmented-switch hud-diff-switch" role="group" aria-label="Grid Size">
                <button type="button" class="switch-pill-btn ${gridSize === 3 ? 'active' : ''}" data-size="3" title="3x3 (Casual)">3×3</button>
                <button type="button" class="switch-pill-btn ${gridSize === 4 ? 'active' : ''}" data-size="4" title="4x4 (Classic)">4×4</button>
                <button type="button" class="switch-pill-btn ${gridSize === 5 ? 'active' : ''}" data-size="5" title="5x5 (Master)">5×5</button>
              </div>

              <div class="hud-actions-group">
                ${allowHints ? `
                <button type="button" id="btnPuzzlePeek" class="hud-action-btn hint-btn" title="Hold or tap to peek original photo" aria-label="Peek original photo">
                  <span>👁️</span> <span class="btn-text">Peek</span>
                </button>
                <button type="button" id="btnPuzzleNumbers" class="hud-action-btn numbers-btn" title="Toggle guide numbers on tiles" aria-label="Toggle tile numbers">
                  <span>🔢</span>
                </button>
                ` : ''}
                <button type="button" id="btnPuzzleSound" class="hud-action-btn sound-btn ${sfxEnabled ? '' : 'muted'}" title="Toggle audio SFX" aria-label="Toggle sound">
                  <span id="puzzleSoundIcon">${sfxEnabled ? '🔊' : '🔇'}</span>
                </button>
                <button type="button" id="btnPuzzleScramble" class="hud-action-btn scramble-btn" title="Scramble puzzle" aria-label="Scramble puzzle">
                  <span>🔀</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Puzzle Board Container -->
          <div class="puzzle-board-wrapper">
            <div class="puzzle-board-container">
              <div class="puzzle-board" id="puzzleBoard" role="grid" aria-label="Interactive Photo Puzzle" style="--n: ${gridSize}; --img: url('${esc(photoUrl)}');">
                <!-- Tiles dynamically populated by runtime engine -->
              </div>
              <div class="puzzle-ghost-overlay" id="puzzleGhost" style="background-image: url('${esc(photoUrl)}');" aria-hidden="true"></div>
              <div class="puzzle-completed-overlay" id="puzzleCompletedOverlay" style="background-image: url('${esc(photoUrl)}');" aria-hidden="true">
                <div class="completion-heart-burst">💖</div>
              </div>
            </div>
            <div class="puzzle-mobile-hint">
              <span id="puzzleMobileInstructions">${defaultMode === 'slide' ? '👉 Tap tiles adjacent to the open slot to slide them' : '👉 Tap one piece, then tap another to swap them'}</span>
            </div>
          </div>

          <!-- Secret Keepsake Reveal Modal -->
          <div class="puzzle-modal-backdrop" id="puzzleKeepsakeModal" role="dialog" aria-modal="true" aria-labelledby="puzzleModalTitle" style="display:none;">
            <div class="puzzle-modal-card glass-panel">
              <div class="modal-ribbon-badge">
                <span>${esc(rBadge)}</span>
              </div>
              <div class="modal-polaroid-preview polaroid-3d-scene">
                <div class="polaroid-frame" id="polaroidTiltCard">
                  <div class="washi-tape washi-tape-top-left"></div>
                  <div class="washi-tape washi-tape-top-right"></div>
                  <img id="puzzleKeepsakeImg" src="${esc(photoUrl)}" alt="Completed Memory Photo" class="polaroid-photo" loading="lazy" />
                  <div class="polaroid-caption">
                    <span class="caption-date">${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span class="caption-stamp">100% SOLVED ❤️</span>
                  </div>
                </div>
              </div>

              <div class="modal-content-body text-center">
                <h3 id="puzzleModalTitle" class="modal-title">${esc(rTitle)}</h3>
                <div class="modal-stats-summary">
                  <span class="summary-chip">⏱️ <strong id="modalStatTime">00:00</strong></span>
                  <span class="summary-chip">🔄 <strong id="modalStatMoves">0</strong> moves</span>
                  <span class="summary-chip">🧩 <strong id="modalStatMode">3×3 Slide</strong></span>
                </div>
                <div class="modal-letter-scroll">
                  <p id="puzzleModalLetter" class="letter-text">${esc(rLetter)}</p>
                </div>
              </div>

              <div class="modal-actions-footer">
                <a id="btnPuzzleWhatsApp" href="${esc(rActionUrl)}" target="_blank" rel="noopener noreferrer" class="btn-puzzle-cta">
                  <span>💌</span> ${esc(rActionText)}
                </a>
                <button type="button" id="btnPuzzleDownloadPNG" class="btn-puzzle-download">
                  <span>🎨</span> Save Keepsake PNG
                </button>
                <button type="button" id="btnPuzzleReplay" class="btn-puzzle-replay">
                  <span>🔄</span> Play Again
                </button>
              </div>
              <button type="button" id="btnPuzzleCloseModal" class="btn-modal-close" aria-label="Close modal">×</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["puzzle_photo"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
