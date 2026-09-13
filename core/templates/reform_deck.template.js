(function() {
  const esc = (str) => {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };
  const sv = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");
  const escapeHtml = (typeof window !== "undefined" && window.escapeHtml) || (typeof global !== "undefined" && global.escapeHtml) || esc;
  const safeVal = (typeof window !== "undefined" && window.safeVal) || (typeof global !== "undefined" && global.safeVal) || sv;

  const renderTemplate = (data = {}, rootData = {}) => {
    const partner = rootData.partner2 || rootData.partnerName || "Ella";
    const tag = data.tag || "Accountability & Reform 🃏";
    const title = data.title || "The Honest Reform Deck";
    const desc = data.desc || "Words alone are not enough. Flip each card to inspect the apology, true accountability, and actionable promise.";
    const defaultCards = [
      {
        frontTitle: "Listening Without Defensiveness",
        icon: "👂",
        apology: "I am truly sorry for reacting defensively when you were expressing vulnerability.",
        accountability: "I acknowledge that making it about my feelings dismissed your valid experience.",
        commitment: "I commit to breathing, listening completely, and validating you before speaking."
      },
      {
        frontTitle: "Consistent Communication",
        icon: "💬",
        apology: "I apologize for going quiet or taking too long to communicate when overwhelmed.",
        accountability: "I understand that emotional distance creates anxiety and hurts our closeness.",
        commitment: "I promise to stay transparent, give gentle updates, and never shut you out."
      },
      {
        frontTitle: "Patience & Gentle Tone",
        icon: "🕊️",
        apology: "I am deeply sorry for any sharpness, frustration, or impatience in my tone.",
        accountability: "You deserve softness, gentleness, and respect in every single interaction.",
        commitment: "I will maintain gentleness and speak from love, especially during tough talks."
      },
      {
        frontTitle: "Presence & Undivided Attention",
        icon: "✨",
        apology: "I apologize for moments where distractions robbed us of our quality moments.",
        accountability: "Your time is precious and you deserve my undivided presence and gaze.",
        commitment: "No phones or distractions during our dates and heart-to-heart talks."
      }
    ];

    const cards = Array.isArray(data.cards) && data.cards.length > 0 ? data.cards : defaultCards;

    let cardsHtml = "";
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i] || {};
      const fTitle = c.frontTitle || `Reflection #${i + 1}`;
      const icon = c.icon || "💌";
      const apology = c.apology || "I sincerely apologize for falling short.";
      const accountability = c.accountability || "I take complete ownership without excuses.";
      const commitment = c.commitment || "I commit to tangible change and consistent care.";

      cardsHtml += `
        <div class="reform-card-item" data-card-idx="${i}">
          <div class="reform-card-inner">
            <div class="reform-card-front">
              <div class="reform-front-badge">🃏 PLEDGE #${i + 1}</div>
              <div class="reform-icon-circle">${icon}</div>
              <h3 class="reform-front-title">${escapeHtml(fTitle)}</h3>
              <div class="reform-flip-prompt">
                <span>Tap to Reveal Reflection</span>
                <span class="flip-arrow">↻</span>
              </div>
            </div>
            <div class="reform-card-back">
              <div class="reform-back-header">
                <span class="reform-category-tag">${icon} ${escapeHtml(fTitle)}</span>
                <span class="promise-checkmark" title="Solemnly Promised">✅</span>
              </div>
              <div class="reform-detail-block apology">
                <strong class="reform-block-title">The Apology</strong>
                <p class="reform-block-text">${escapeHtml(apology)}</p>
              </div>
              <div class="reform-detail-block accountability">
                <strong class="reform-block-title">Accountability</strong>
                <p class="reform-block-text">${escapeHtml(accountability)}</p>
              </div>
              <div class="reform-detail-block commitment">
                <strong class="reform-block-title">Future Commitment</strong>
                <p class="reform-block-text">${escapeHtml(commitment)}</p>
              </div>
              <div class="reform-flip-back">
                <span>Flip Back</span>
                <span class="flip-arrow">↺</span>
              </div>
            </div>
          </div>
        </div>`;
    }

    return `
    <section class="section reform-deck-section" id="reformDeckSection">
      <div class="container">
        <div class="reform-deck-container glass-panel">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="reform-deck-toolbar">
            <div class="reform-status-tracker">
              <span class="tracker-label">Flipped:</span>
              <span class="tracker-val" id="reformFlippedCount">0</span>
              <span class="tracker-sep">/</span>
              <span class="tracker-total">${cards.length}</span>
            </div>
            <div class="reform-deck-actions">
              <button type="button" class="btn btn-outline btn-sm" id="btnFlipAllReform">
                <span>Flip All Cards 🔄</span>
              </button>
            </div>
          </div>

          <div class="reform-deck-grid" id="reformDeckGrid">
            ${cardsHtml}
          </div>
        </div>
      </div>
    </section>
    `;
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["reform_deck"] = renderTemplate;
  }
})();
