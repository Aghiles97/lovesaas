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
    { id: "note-1", author: "Aghiles", relation: "Partner ❤️", note: "Happy Birthday my sweetest princess! You illuminate my whole life with your laugh and love.", color: "pink", stamp: "👑", washi: "gold", pin: "pink", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80" },
    { id: "note-2", author: "Maya", relation: "Best Friend 🌸", note: "Happy 24th birthday bff! May all your wildest dreams come true this year!", color: "yellow", stamp: "💖", washi: "floral", pin: "red", photo: "" },
    { id: "note-3", author: "Leo", relation: "Family 🌟", note: "Wishing you radiant health, peace, and endless joy. So proud of everything you do!", color: "blue", stamp: "🎂", washi: "grid", pin: "blue", photo: "" },
    { id: "note-4", author: "Sophie", relation: "Friend 🥂", note: "To the most gorgeous girl and unforgettable memories! Cheers to year 24!", color: "green", stamp: "🥂", washi: "polka", pin: "gold", photo: "" }
  ];

  const notes = Array.isArray(data.notes) && data.notes.length ? data.notes : defaultNotes;

  const notesHtml = notes.map(n => `
    <div class="sticky-note-card note-${escapeHtml(n.color || 'yellow')}" data-note-id="${escapeHtml(n.id || '')}">
      <span class="note-pin pin-${escapeHtml(n.pin || 'red')}"></span>
      <div class="washi-tape tape-${escapeHtml(n.washi || 'floral')}"></div>
      ${n.photo ? `<div class="note-photo-frame"><img src="${escapeHtml(n.photo)}" class="note-photo-pin" alt="Wish Photo" /></div>` : ''}
      <div class="note-content-text">${escapeHtml(n.note || '')}</div>
      <div class="note-footer-meta">
        <div class="note-author-info">
          <span class="note-author">${escapeHtml(n.author || 'Friend')}</span>
          <span class="note-relation-tag">${escapeHtml(n.relation || 'Guest')}</span>
        </div>
        <span class="note-stamp">${escapeHtml(n.stamp || n.sticker || '💖')}</span>
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
              <div class="corkboard-title-badge">
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
          <div class="modal-card-header">
            <h3 style="margin:0; font-size:1.3rem; color:#1e293b;">Pin Your Birthday Wish 📌</h3>
            <button type="button" id="btnCloseGuestbookModal" class="btn-modal-close">✕</button>
          </div>
          <form id="guestbookForm">
            <div class="form-group">
              <label class="form-label">Your Name</label>
              <input type="text" id="gbAuthor" required placeholder="e.g., Sarah" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Relationship / Title</label>
              <input type="text" id="gbRelation" placeholder="e.g., Bestie, Cousin, Partner" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Your Birthday Message</label>
              <textarea id="gbNote" required rows="3" placeholder="Write your heartfelt wish or sweet memory..." class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Photo URL (Optional)</label>
              <input type="url" id="gbPhoto" placeholder="Paste image link for Polaroid pin..." class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Cute Stamp</label>
              <div class="stamp-picker-row">
                <label class="stamp-opt"><input type="radio" name="gbStamp" value="👑" checked /> 👑</label>
                <label class="stamp-opt"><input type="radio" name="gbStamp" value="💖" /> 💖</label>
                <label class="stamp-opt"><input type="radio" name="gbStamp" value="🌸" /> 🌸</label>
                <label class="stamp-opt"><input type="radio" name="gbStamp" value="🎂" /> 🎂</label>
                <label class="stamp-opt"><input type="radio" name="gbStamp" value="🥂" /> 🥂</label>
                <label class="stamp-opt"><input type="radio" name="gbStamp" value="✨" /> ✨</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Sticky Note Color</label>
              <div class="color-picker-row">
                <label class="color-opt"><input type="radio" name="gbColor" value="yellow" checked /> 💛 Yellow</label>
                <label class="color-opt"><input type="radio" name="gbColor" value="pink" /> 💖 Pink</label>
                <label class="color-opt"><input type="radio" name="gbColor" value="blue" /> 💙 Blue</label>
                <label class="color-opt"><input type="radio" name="gbColor" value="green" /> 💚 Mint</label>
                <label class="color-opt"><input type="radio" name="gbColor" value="peach" /> 🍑 Peach</label>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
              <button type="button" class="btn btn-secondary" id="btnCancelGuestbookForm">Cancel</button>
              <button type="submit" class="btn btn-primary"><span>Pin Wish ✨</span></button>
            </div>
          </form>
        </div>
      </div>

      <!-- Polaroid Lightbox Note Viewer -->
      <div class="polaroid-lightbox-overlay hidden" id="guestbookLightboxModal">
        <div class="polaroid-card">
          <button type="button" class="btn-lightbox-close" id="btnCloseGuestbookLightbox">✕</button>
          <div class="polaroid-washi" id="lightboxWashi"></div>
          <div class="polaroid-photo-frame hidden" id="lightboxPhotoFrame">
            <img src="" id="lightboxPhotoImg" class="polaroid-photo-display" alt="Wish Photo" />
          </div>
          <div class="polaroid-body">
            <div class="polaroid-stamp" id="lightboxStamp">💖</div>
            <div class="polaroid-text" id="lightboxNoteText">...</div>
            <div class="polaroid-footer">
              <div>
                <span class="polaroid-author" id="lightboxAuthor">Aghiles</span>
                <span class="polaroid-relation" id="lightboxRelation">Partner ❤️</span>
              </div>
              <button type="button" class="btn-lightbox-love" id="btnLightboxLove">
                <span>Send Love 💕</span>
                <span class="love-counter" id="lightboxLoveCount">1</span>
              </button>
            </div>
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
    window.WIDGET_TEMPLATES["guestbook"] = renderTemplate;
  }
})();
