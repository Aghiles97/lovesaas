/**
 * Template Renderer: reasons
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

  const renderTemplate = (reasonsData = [], rootData = {}) => {
    const list = Array.isArray(reasonsData) ? reasonsData : (reasonsData.list || (typeof window !== "undefined" && window.REASONS ? window.REASONS : []));
    const title = (reasonsData && reasonsData.title) || "Reasons Why I Lof Lof You ✨";
    const tag = (reasonsData && reasonsData.tag) || "💌 Little Sweet Notes";
    const count = list.length || 37;
    const first = list[0] || {};
    const firstText = first.note || first.text || "Facing the glowing Canton Tower at night in Guangzhou with my arms wrapped around you.";
    const firstFootnote = first.footnote || "My favorite view in the universe is right beside you.";
    const firstCat = first.category || "romance";
    const firstTag = first.tag || first.title || "Reason #1";
    const firstIcon = first.badgeIcon || (firstCat === "travel" ? "✈️" : firstCat === "humor" ? "😂" : firstCat === "food" ? "🍜" : firstCat === "ldr" ? "🌙" : "💖");

    const counts = {
      all: count,
      romance: list.filter(r => r.category === "romance").length || 0,
      travel: list.filter(r => r.category === "travel").length || 0,
      humor: list.filter(r => r.category === "humor").length || 0,
      food: list.filter(r => r.category === "food").length || 0,
      ldr: list.filter(r => r.category === "ldr").length || 0
    };

    return `
    <section class="section reasons-section" id="sweetNotesSection">
      <div class="container">
        <div class="section-heading">
          <span class="section-tag">${tag}</span>
          <h2 class="section-title">${title}</h2>
          <div class="reasons-header-actions">
            <button type="button" id="editReasonsHeaderBtn" class="btn btn-primary btn-edit-all-reasons" title="Edit and customize all reasons">
              <span class="btn-icon">✏️</span>
              <span class="btn-text">Edit All Reasons</span>
              <span class="edit-counter-badge" id="editAllReasonsCount">${counts.all}</span>
            </button>
            <button type="button" id="browseAllHeaderBtn" class="btn btn-outline btn-sm" title="Browse all reasons">
              <span>📋 Browse Deck</span>
            </button>
          </div>
          <p class="section-desc">A tactile deck of <span id="countDeckDesc">${counts.all}</span> heartfelt memories, adventures, and reminders straight from my heart.</p>
        </div>

        <!-- Category Filter Tabs -->
        <div class="deck-filter-bar" id="reasonsFilterBar">
          <button type="button" class="deck-filter-btn active" data-category="all">✨ All (<span id="countFilterAll">${counts.all}</span>)</button>
          <button type="button" class="deck-filter-btn" data-category="romance">💖 Romance (<span id="countFilterRomance">${counts.romance}</span>)</button>
          <button type="button" class="deck-filter-btn" data-category="travel">✈️ Adventures (<span id="countFilterTravel">${counts.travel}</span>)</button>
          <button type="button" class="deck-filter-btn" data-category="humor">😂 Inside Jokes (<span id="countFilterHumor">${counts.humor}</span>)</button>
          <button type="button" class="deck-filter-btn" data-category="food">🍜 Foodie (<span id="countFilterFood">${counts.food}</span>)</button>
          <button type="button" class="deck-filter-btn" data-category="ldr">🌙 LDR (<span id="countFilterLdr">${counts.ldr}</span>)</button>
          <button type="button" class="deck-filter-btn" data-category="starred">⭐ Starred (<span id="countFilterStarred">0</span>)</button>
        </div>

        <div class="deck-interactive-wrap">
          <!-- 3D Card Stack Container -->
          <div class="love-deck-container" id="loveDeckContainer">
            <!-- Decorative Underlay Cards for Stacked Depth -->
            <div class="deck-card-underlay underlay-2"></div>
            <div class="deck-card-underlay underlay-1"></div>

            <!-- Active Card -->
            <div id="reasonCard" class="sweet-note-card glass-panel" role="region" aria-live="polite">
              <div class="sweet-note-top-row">
                <div class="sweet-note-badge" id="noteBadgeContainer">
                  <span id="noteCategoryIcon">${firstIcon}</span>
                  <span id="noteCategoryTag">${firstTag}</span>
                </div>
                <div class="deck-progress-indicator">
                  <span id="reasonProgressText"><strong id="reasonCurrentNum">1</strong> / <span id="reasonTotalCount">${counts.all}</span></span>
                </div>
              </div>

              <p id="reasonText" class="sweet-note-text">"${firstText}"</p>
              
              <p class="sweet-note-footnote" id="noteFootnoteText">— ${firstFootnote}</p>

              <!-- Main Navigation & Surprise Controls -->
              <div class="sweet-note-nav-row">
                <button type="button" id="prevReasonBtn" class="btn btn-outline btn-deck-nav" aria-label="Previous Note" title="Previous Note (or Left Arrow)">
                  <span>← Prev</span>
                </button>
                <button type="button" id="shuffleReasonBtn" class="btn btn-primary btn-pulse" title="Random Surprise Note">
                  <span>✨ Surprise Me 🎲</span>
                </button>
                <button type="button" id="nextReasonBtn" class="btn btn-outline btn-deck-nav" aria-label="Next Note" title="Next Note (or Right Arrow)">
                  <span>Next →</span>
                </button>
              </div>

              <!-- Secondary Actions Bar -->
              <div class="sweet-note-actions">
                <button type="button" id="starNoteBtn" class="btn btn-outline btn-sm" title="Save this note as a favorite">
                  <span id="starNoteIcon">☆</span> <span id="starNoteText">Favorite Note</span>
                </button>
                <button type="button" id="burstHeartsBtn" class="btn btn-secondary btn-sm" title="Send a reaction">
                  <span>💖 Send Lof Lof</span>
                </button>
                <button type="button" id="editCurrentReasonBtn" class="btn btn-secondary btn-sm" title="Edit all reasons in deck">
                  <span>✏️ Edit All Reasons</span>
                </button>
                <button type="button" id="browseAllNotesBtn" class="btn btn-outline btn-sm" title="View all notes at once">
                  <span>📋 View All (<span id="browseAllCount">${counts.all}</span>)</span>
                </button>
              </div>
            </div>
          </div>
          <div class="deck-hint-bar">
            <span>💡 Tip: Swipe or use ← → arrow keys to flip through cards</span>
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["reasons"] = renderTemplate;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
})();
