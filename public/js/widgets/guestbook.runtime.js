/**
 * Runtime Engine: Guestbook Wish Wall Widget
 */
(function() {
  const escapeHtml = (typeof window !== "undefined" && typeof window.escapeHtml === "function")
    ? window.escapeHtml
    : (str => (str == null ? "" : String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")));

  let gbAudioCtx = null;
  function getGbAudioCtx() {
    if (!gbAudioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) gbAudioCtx = new AC();
    }
    if (gbAudioCtx && gbAudioCtx.state === "suspended") {
      gbAudioCtx.resume().catch(() => {});
    }
    return gbAudioCtx;
  }

  function playPinPopSound() {
    const ctx = getGbAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  function playLoveChimeSound() {
    const ctx = getGbAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }

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

    // Polaroid Lightbox Elements
    const lightboxModal = document.getElementById("guestbookLightboxModal");
    const btnCloseLightbox = document.getElementById("btnCloseGuestbookLightbox");
    const lbPhotoFrame = document.getElementById("lightboxPhotoFrame");
    const lbPhotoImg = document.getElementById("lightboxPhotoImg");
    const lbNoteText = document.getElementById("lightboxNoteText");
    const lbAuthor = document.getElementById("lightboxAuthor");
    const lbRelation = document.getElementById("lightboxRelation");
    const lbStamp = document.getElementById("lightboxStamp");
    const btnLove = document.getElementById("btnLightboxLove");
    const lbLoveCount = document.getElementById("lightboxLoveCount");

    let currentActiveNote = null;

    let savedNotes = [];
    try {
      const local = localStorage.getItem(storageKey);
      if (local) savedNotes = JSON.parse(local) || [];
    } catch (e) {}

    const seedNotes = (data && Array.isArray(data.notes) && data.notes.length) ? data.notes : [
      { id: "note-1", author: "Aghiles", relation: "Partner ❤️", note: "Happy Birthday my sweetest princess! You illuminate my whole life with your laugh and love.", color: "pink", stamp: "👑", washi: "gold", pin: "pink", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80" },
      { id: "note-2", author: "Maya", relation: "Best Friend 🌸", note: "Happy 24th birthday bff! May all your wildest dreams come true this year!", color: "yellow", stamp: "💖", washi: "floral", pin: "red", photo: "" },
      { id: "note-3", author: "Leo", relation: "Family 🌟", note: "Wishing you radiant health, peace, and endless joy. So proud of everything you do!", color: "blue", stamp: "🎂", washi: "grid", pin: "blue", photo: "" },
      { id: "note-4", author: "Sophie", relation: "Friend 🥂", note: "To the most gorgeous girl and unforgettable memories! Cheers to year 24!", color: "green", stamp: "🥂", washi: "polka", pin: "gold", photo: "" }
    ];

    const allNotes = [...seedNotes, ...savedNotes];

    const washis = ["gold", "floral", "grid", "polka"];
    const pins = ["pink", "red", "gold", "blue"];

    function renderNotes() {
      if (!grid) return;
      grid.innerHTML = allNotes.map((n, i) => {
        const rot = ((i % 5) - 2) * 2.5; // -5deg to +5deg
        const washi = n.washi || washis[i % washis.length];
        const pin = n.pin || pins[i % pins.length];
        const stamp = n.stamp || n.sticker || "💖";
        return `
          <div class="sticky-note-card note-${escapeHtml(n.color || 'yellow')}" style="transform: rotate(${rot}deg);" data-note-idx="${i}">
            <span class="note-pin pin-${escapeHtml(pin)}"></span>
            <div class="washi-tape tape-${escapeHtml(washi)}"></div>
            ${n.photo ? `<div class="note-photo-frame"><img src="${escapeHtml(n.photo)}" class="note-photo-pin" alt="Wish Photo" /></div>` : ''}
            <div class="note-content-text">${escapeHtml(n.note || '')}</div>
            <div class="note-footer-meta">
              <div class="note-author-info">
                <span class="note-author">${escapeHtml(n.author || 'Friend')}</span>
                <span class="note-relation-tag">${escapeHtml(n.relation || 'Guest')}</span>
              </div>
              <span class="note-stamp">${escapeHtml(stamp)}</span>
            </div>
          </div>
        `;
      }).join('');

      if (countEl) countEl.textContent = allNotes.length;

      // Attach click handlers to open enlarged polaroid lightbox
      grid.querySelectorAll(".sticky-note-card").forEach(card => {
        card.onclick = function() {
          const idx = parseInt(card.dataset.noteIdx, 10);
          const note = allNotes[idx];
          if (note) openLightbox(note);
        };
      });
    }

    function openLightbox(note) {
      if (!lightboxModal) return;
      currentActiveNote = note;
      if (lbAuthor) lbAuthor.textContent = note.author || "Friend";
      if (lbRelation) lbRelation.textContent = note.relation || "Guest";
      if (lbNoteText) lbNoteText.textContent = note.note || "";
      if (lbStamp) lbStamp.textContent = note.stamp || note.sticker || "💖";

      if (lbPhotoFrame && lbPhotoImg) {
        if (note.photo) {
          lbPhotoImg.src = note.photo;
          lbPhotoFrame.classList.remove("hidden");
        } else {
          lbPhotoFrame.classList.add("hidden");
        }
      }

      if (lbLoveCount) lbLoveCount.textContent = note.loves || 1;

      lightboxModal.classList.remove("hidden");
    }

    function closeLightbox() {
      if (lightboxModal) lightboxModal.classList.add("hidden");
      currentActiveNote = null;
    }

    if (btnCloseLightbox) btnCloseLightbox.onclick = closeLightbox;
    if (lightboxModal) {
      lightboxModal.onclick = function(e) {
        if (e.target === lightboxModal) closeLightbox();
      };
    }

    if (btnLove) {
      btnLove.onclick = function() {
        playLoveChimeSound();
        if (currentActiveNote) {
          currentActiveNote.loves = (currentActiveNote.loves || 1) + 1;
          if (lbLoveCount) lbLoveCount.textContent = currentActiveNote.loves;
        }
        if (typeof window.confetti === "function") {
          window.confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        }
      };
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
        const photo = document.getElementById("gbPhoto")?.value.trim() || "";
        const colorRadio = form.querySelector("input[name='gbColor']:checked");
        const color = colorRadio ? colorRadio.value : "yellow";
        const stampRadio = form.querySelector("input[name='gbStamp']:checked");
        const stamp = stampRadio ? stampRadio.value : "💖";

        if (!author || !noteText) return;

        playPinPopSound();

        const randomWashi = washis[Math.floor(Math.random() * washis.length)];
        const randomPin = pins[Math.floor(Math.random() * pins.length)];

        const newNote = {
          id: "note-" + Date.now(),
          author,
          relation,
          note: noteText,
          color,
          stamp,
          photo,
          washi: randomWashi,
          pin: randomPin,
          loves: 1,
          timestamp: Date.now()
        };

        savedNotes.push(newNote);
        allNotes.push(newNote);
        try {
          localStorage.setItem(storageKey, JSON.stringify(savedNotes));
        } catch (err) {}

        renderNotes();
        closeModal();

        if (typeof window.confetti === "function") {
          window.confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
        }
      };
    }
  };
})();
