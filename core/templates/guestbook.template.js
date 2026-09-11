/**
 * Template Renderer: guestbook
 * Modular Birthday Component
 */
(function() {
  if (typeof escapeHtml !== "function") {
    const esc = function(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    if (typeof window !== "undefined") window.escapeHtml = esc;
    else global.escapeHtml = esc;
  }
  if (typeof safeVal !== "function") {
    const sv = function(v) {
      return String(v == null ? "" : v).replace(/"/g, "&quot;");
    };
    if (typeof window !== "undefined") window.safeVal = sv;
    else global.safeVal = sv;
  }

  const renderTemplate = (data = {}, rootData = {}) => {
  const partner = rootData.partner2 || rootData.partnerName || "Ella";
  const tag = data.tag || "Birthday Guestbook 💌";
  const title = data.title || ("Warm Wishes Wall for " + partner + " 📌");
  const desc = data.desc || "Leave a heartfelt sticky note, post your photo, or share your sweetest memory!";
  const addBtnText = data.addBtnText || "✍️ Pin a Birthday Wish";

  const defaultNotes = [
    { id: "note-1", author: "Aghiles", relation: "Partner ❤️", note: "Happy Birthday my sweetest princess! You illuminate my whole life with your laugh and love.", color: "pink", sticker: "💖" },
    { id: "note-2", author: "Maya", relation: "Best Friend 🌸", note: "Happy 24th birthday bff! May all your wildest dreams come true this year!", color: "yellow", sticker: "🎉" },
    { id: "note-3", author: "Leo", relation: "Family 🌟", note: "Wishing you radiant health, peace, and endless joy. So proud of everything you do!", color: "blue", sticker: "🎂" }
  ];

  const notes = Array.isArray(data.notes) && data.notes.length ? data.notes : defaultNotes;

  const notesHtml = notes.map(n => `
    <div class="sticky-note-card note-${escapeHtml(n.color || 'yellow')}" data-note-id="${escapeHtml(n.id || '')}">
      <span class="note-pin"></span>
      <div class="washi-tape"></div>
      ${n.photo ? `<img src="${escapeHtml(n.photo)}" class="note-photo-pin" alt="Wish Photo" />` : ''}
      <div class="note-content-text">${escapeHtml(n.note || '')}</div>
      <div class="note-footer-meta">
        <span class="note-author">${escapeHtml(n.author || 'Friend')}</span>
        <span class="note-relation-tag">${escapeHtml(n.relation || 'Guest')} ${n.sticker || '✨'}</span>
      </div>
    </div>
  `).join('');

  return `
    <section class="section guestbook-section" id="guestbookSection">
      <div class="container">
        <div class="guestbook-box">
          <div class="section-heading">
            <span class="section-tag">${escapeHtml(tag)}</span>
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="section-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="corkboard-canvas">
            <div class="guestbook-toolbar">
              <div style="font-weight: 700; color: #78350f; font-size: 1.05rem;">
                📌 Pinned Notes (<span id="guestbookCount">${notes.length}</span>)
              </div>
              <button type="button" class="btn btn-primary" id="btnOpenAddWishModal">
                <span>${escapeHtml(addBtnText)}</span>
              </button>
            </div>

            <div class="sticky-notes-grid" id="stickyNotesGrid">
              ${notesHtml}
            </div>
          </div>
        </div>
      </div>

      <!-- Add Wish Modal Form -->
      <div class="guestbook-modal-overlay hidden" id="guestbookModalOverlay">
        <div class="guestbook-modal-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <h3 style="margin:0; font-size:1.3rem; color:#1e293b;">Pin Your Birthday Wish 📌</h3>
            <button type="button" id="btnCloseGuestbookModal" class="btn-modal-close" style="background:none; border:none; font-size:1.4rem; cursor:pointer;">✕</button>
          </div>
          <form id="guestbookForm">
            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:4px; color:#475569;">Your Name</label>
              <input type="text" id="gbAuthor" required placeholder="e.g., Sarah" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid #cbd5e1;" />
            </div>
            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:4px; color:#475569;">Relationship / Title</label>
              <input type="text" id="gbRelation" placeholder="e.g., Bestie, Cousin, Partner" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid #cbd5e1;" />
            </div>
            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:4px; color:#475569;">Your Birthday Message</label>
              <textarea id="gbNote" required rows="3" placeholder="Write your heartfelt wish or joke..." style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid #cbd5e1;"></textarea>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:4px; color:#475569;">Sticky Note Color</label>
              <div style="display:flex; gap:10px;">
                <label style="cursor:pointer;"><input type="radio" name="gbColor" value="yellow" checked /> 💛 Yellow</label>
                <label style="cursor:pointer;"><input type="radio" name="gbColor" value="pink" /> 💖 Pink</label>
                <label style="cursor:pointer;"><input type="radio" name="gbColor" value="blue" /> 💙 Blue</label>
                <label style="cursor:pointer;"><input type="radio" name="gbColor" value="green" /> 💚 Mint</label>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button type="button" class="btn btn-secondary" id="btnCancelGuestbookForm">Cancel</button>
              <button type="submit" class="btn btn-primary"><span>Pin Note ✨</span></button>
            </div>
          </form>
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
    window.WIDGET_TEMPLATES["guestbook"] = renderTemplate;
  }
})();
