/**
 * Runtime Engine: Guestbook Wish Wall Widget
 */
(function() {
  const escapeHtml = (typeof window !== "undefined" && typeof window.escapeHtml === "function")
    ? window.escapeHtml
    : (str => (str == null ? "" : String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")));

  window.setupGuestbook = function(data) {
    const section = document.getElementById("guestbookSection");
    if (!section) return;

    const tenantSlug = window.CURRENT_TENANT_SLUG || "demo";
    const storageKey = "gf_guestbook_notes_" + tenantSlug;
    const grid = document.getElementById("stickyNotesGrid");
    const countEl = document.getElementById("guestbookCount");
    const btnOpenModal = document.getElementById("btnOpenAddWishModal");
    const modalOverlay = document.getElementById("guestbookModalOverlay");
    const btnCloseModal = document.getElementById("btnCloseGuestbookModal");
    const btnCancel = document.getElementById("btnCancelGuestbookForm");
    const form = document.getElementById("guestbookForm");

    let savedNotes = [];
    try {
      const local = localStorage.getItem(storageKey);
      if (local) savedNotes = JSON.parse(local) || [];
    } catch (e) {}

    const seedNotes = (data && Array.isArray(data.notes) && data.notes.length) ? data.notes : [
      { id: "note-1", author: "Aghiles", relation: "Partner ❤️", note: "Happy Birthday my sweetest princess! You illuminate my whole life with your laugh and love.", color: "pink", sticker: "💖" },
      { id: "note-2", author: "Maya", relation: "Best Friend 🌸", note: "Happy 24th birthday bff! May all your wildest dreams come true this year!", color: "yellow", sticker: "🎉" }
    ];

    const allNotes = [...seedNotes, ...savedNotes];

    function renderNotes() {
      if (!grid) return;
      grid.innerHTML = allNotes.map((n, i) => {
        const rot = ((i % 5) - 2) * 2; // -4deg to 4deg
        return `
          <div class="sticky-note-card note-${n.color || 'yellow'}" style="transform: rotate(${rot}deg);" data-note-id="${n.id}">
            <span class="note-pin"></span>
            <div class="washi-tape"></div>
            ${n.photo ? `<img src="${n.photo}" class="note-photo-pin" alt="Wish Photo" />` : ''}
            <div class="note-content-text">${escapeHtml(n.note || '')}</div>
            <div class="note-footer-meta">
              <span class="note-author">${escapeHtml(n.author || 'Friend')}</span>
              <span class="note-relation-tag">${escapeHtml(n.relation || 'Guest')} ${n.sticker || '✨'}</span>
            </div>
          </div>
        `;
      }).join('');

      if (countEl) countEl.textContent = allNotes.length;
    }

    renderNotes();

    function openModal() {
      if (modalOverlay) modalOverlay.classList.remove("hidden");
    }
    function closeModal() {
      if (modalOverlay) modalOverlay.classList.add("hidden");
      if (form) form.reset();
    }

    if (btnOpenModal) btnOpenModal.onclick = openModal;
    if (btnCloseModal) btnCloseModal.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;

    if (form) {
      form.onsubmit = function(e) {
        e.preventDefault();
        const author = document.getElementById("gbAuthor")?.value.trim();
        const relation = document.getElementById("gbRelation")?.value.trim() || "Guest";
        const noteText = document.getElementById("gbNote")?.value.trim();
        const colorRadio = form.querySelector("input[name='gbColor']:checked");
        const color = colorRadio ? colorRadio.value : "yellow";

        if (!author || !noteText) return;

        const newNote = {
          id: "note-" + Date.now(),
          author,
          relation,
          note: noteText,
          color,
          sticker: "💌",
          timestamp: Date.now()
        };

        savedNotes.push(newNote);
        allNotes.push(newNote);
        try {
          localStorage.setItem(storageKey, JSON.stringify(savedNotes));
        } catch (e) {}

        renderNotes();
        closeModal();

        if (typeof window.confetti === "function") {
          window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
      };
    }
  };
})();
