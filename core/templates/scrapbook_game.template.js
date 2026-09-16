/**
 * Template Renderer: scrapbook_game
 * Modular Decomposed Component - Hyper-Realistic Tactile Scrapbook Engine
 */
(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

  const renderTemplate = (data = {}, rootData = {}) => {
    const sb = Array.isArray(data) ? { items: data } : (data || {});
    const p1 = sb.partner1 || rootData.partner1 || "Partner 1";
    const p2 = sb.partner2 || rootData.partner2 || "Partner 2";
    const tag = sb.tag || "Interactive Couple Scrapbook 📓✨";
    const title = sb.title || "How Well Do You Know Me? ✂️";
    const desc = sb.desc || "Test your connection, flip polaroids for secret confessions, and collect vinyl memory stickers!";

    const certTitle = sb.certTitle || "Official Soulmate Certification 🏆";
    const certAwardee = sb.certAwardee || ("Presented with Endless Love to " + p2);
    const certQuote = sb.certQuote || "« Through every flight, inside joke, and quiet glance — you know my heart completely. »";
    const certNote = sb.certNote || ("Certified eternal bond between " + p1 + " and " + p2 + " with infinite hugs, kisses, and late-night talks.");

    return `
    <section class="section scrapbook-section" id="section-scrapbook_game" data-widget-id="scrapbook_game">
      <div class="container">
        <!-- Tactile Scrapbook Album with Spiral Binder Rings -->
        <div class="scrapbook-album-outer">
          <!-- Spiral Spine Rings -->
          <div class="scrapbook-spiral-spine" aria-hidden="true">
            ${Array.from({ length: 9 }).map((_, i) => `
              <div class="spiral-loop">
                <div class="spiral-hole left-hole"></div>
                <div class="spiral-wire"></div>
                <div class="spiral-hole right-hole"></div>
              </div>
            `).join("")}
          </div>

          <div class="scrapbook-album glass-panel">
            <!-- Washi Tape Strips -->
            <div class="scrapbook-tape washi-tape washi-tape-zigzag washi-pink scrapbook-tape-top-left"></div>
            <div class="scrapbook-tape washi-tape washi-tape-zigzag washi-gold scrapbook-tape-top-right"></div>
            <div class="scrapbook-tape washi-tape washi-mint scrapbook-tape-bottom-right"></div>

            <!-- Decorative Stamps & Pins -->
            <div class="scrapbook-corner-pin pin-copper"></div>
            <div class="scrapbook-airmail-stamp">
              <span class="stamp-code">PAR AVION ✈️</span>
              <span class="stamp-date">LOVE POST</span>
            </div>

            <!-- Heading -->
            <div class="section-heading scrapbook-header">
              <span class="section-tag">${esc(tag)}</span>
              <h2 class="section-title">${esc(title)}</h2>
              <p class="section-desc">${esc(desc)}</p>
            </div>

            <!-- Dynamic Interactive Ribbon Bar -->
            <div class="scrapbook-ribbon-bar">
              <div class="ribbon-left-meta">
                <span class="scrapbook-ribbon-label">🔖 Sticker Collection:</span>
                <div id="scrapbookRibbonBadges" class="scrapbook-ribbon-badges">
                  <span class="ribbon-empty-hint">Answer prompts to slap collectible stickers onto your album!</span>
                </div>
              </div>
              <div class="ribbon-right-pills">
                <div id="scrapbookStreakPill" class="scrapbook-streak-pill hidden">
                  <span class="streak-flame">🔥</span>
                  <span id="scrapbookStreakCount" class="streak-text">Streak x2</span>
                </div>
                <div class="scrapbook-score-pill">
                  <span class="score-icon">💖</span>
                  <span class="score-label">Affinity:</span>
                  <span id="scrapbookScoreDisplay" class="score-val">0 / 0</span>
                </div>
              </div>
            </div>

            <!-- Card Viewport -->
            <div id="scrapbookCardContainer" class="scrapbook-card-viewport">
              <div class="scrapbook-card-placeholder">
                <div class="scrapbook-loading-spinner">📸</div>
                <p>Opening scrapbook album...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Full-Bleed Keepsake Book Modal -->
      <div id="scrapbookKeepsakeModal" class="scrapbook-modal hidden">
        <div class="scrapbook-modal-backdrop"></div>
        <div class="scrapbook-modal-content">
          <button type="button" class="scrapbook-modal-close" id="btnScrapbookCloseKeepsake" title="Close">✕</button>

          <div class="scrapbook-keepsake-book" id="scrapbookKeepsakeBook">
            <!-- Left Page: Polaroid Memories Collage -->
            <div class="keepsake-page keepsake-page-left">
              <div class="keepsake-page-tape washi-tape washi-gold"></div>
              <h4 class="keepsake-page-heading">Our Memory Snapshot Collage</h4>
              <div id="sbCertCollageGrid" class="keepsake-collage-grid"></div>
              <div class="keepsake-stickers-deck">
                <span class="stickers-deck-label">Collected Vinyl Stickers:</span>
                <div id="sbCertStickerGrid" class="keepsake-sticker-grid"></div>
              </div>
            </div>

            <!-- Right Page: Wax-Sealed Certificate -->
            <div class="keepsake-page keepsake-page-right">
              <div class="keepsake-gold-foil-border">
                <div class="wax-seal-container">
                  <div class="wax-seal">
                    <span class="seal-heart">❤️</span>
                  </div>
                </div>
                <div class="keepsake-stamp-badge">OFFICIALLY VERIFIED & STAMPED</div>
                <h3 class="keepsake-title" id="sbCertTitle">${esc(certTitle)}</h3>
                <p class="keepsake-awardee" id="sbCertAwardee">${esc(certAwardee)}</p>

                <div class="keepsake-score-seal">
                  <div class="seal-rating-stars">★★★★★</div>
                  <span id="sbCertScoreText" class="seal-score">100% Affinity Match</span>
                </div>

                <blockquote class="keepsake-quote" id="sbCertQuote">${esc(certQuote)}</blockquote>
                <p class="keepsake-note" id="sbCertNote">${esc(certNote)}</p>

                <div class="keepsake-sign-block">
                  <div class="sign-line">
                    <span class="sign-handwritten" id="sbCertSignSender">${esc(p1)}</span>
                    <span class="sign-label">Partner 1</span>
                  </div>
                  <div class="sign-heart-knot">♾️</div>
                  <div class="sign-line">
                    <span class="sign-handwritten" id="sbCertSignRecipient">${esc(p2)}</span>
                    <span class="sign-label">Partner 2</span>
                  </div>
                </div>

                <div class="keepsake-actions">
                  <button type="button" id="btnScrapbookDownloadCert" class="btn-sm btn-gold-action">
                    <span>📥</span> Download Keepsake Card
                  </button>
                  <button type="button" id="btnScrapbookReplay" class="btn-sm btn-secondary">
                    <span>🔄</span> Replay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["scrapbook_game"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
