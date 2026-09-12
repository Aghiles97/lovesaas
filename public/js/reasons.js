// Tactile Romantic Love Card Deck Engine
let currentReasonIndex = 0;
let currentReasonCategory = "all";

const REASON_CATEGORY_ICONS = {
  romance: "💖",
  travel: "✈️",
  humor: "😂",
  food: "🍜",
  ldr: "🌙"
};

function normalizeReason(item, index) {
  if (typeof item === "object" && item !== null && item.note) {
    const cat = item.category || "romance";
    const defaultIcon = REASON_CATEGORY_ICONS[cat] || "💌";
    return {
      ...item,
      category: cat,
      badgeIcon: item.badgeIcon || defaultIcon,
      tag: item.tag || (cat === "romance" ? "💖 Sweet Note" : "💌 Sweet Reason"),
      originalIndex: index
    };
  }
  return {
    id: `custom-${index}`,
    category: "romance",
    tag: "💌 Custom Note",
    badgeIcon: "💌",
    note: typeof item === "string" ? item : "I lof you so much!",
    footnote: "Added straight from my heart.",
    originalIndex: index
  };
}

function getFilteredReasons() {
  const starredList = JSON.parse(localStorage.getItem("gf_starred_notes") || "[]");
  const all = REASONS.map((r, i) => normalizeReason(r, i));
  if (currentReasonCategory === "all") return all;
  if (currentReasonCategory === "starred") {
    return all.filter(r => starredList.includes(`"${r.note}"`) || starredList.includes(r.note));
  }
  return all.filter(r => r.category === currentReasonCategory);
}

function updateFilterCounts() {
  const starredList = JSON.parse(localStorage.getItem("gf_starred_notes") || "[]");
  const allCountEl = document.getElementById("countFilterAll");
  const starCountEl = document.getElementById("countFilterStarred");
  const romanceCountEl = document.getElementById("countFilterRomance");
  const travelCountEl = document.getElementById("countFilterTravel");
  const humorCountEl = document.getElementById("countFilterHumor");
  const foodCountEl = document.getElementById("countFilterFood");
  const ldrCountEl = document.getElementById("countFilterLdr");
  const browseCountEl = document.getElementById("browseAllCount");
  const descCountEl = document.getElementById("countDeckDesc");
  const settingsCountEl = document.getElementById("customReasonsCount");

  const counts = { romance: 0, travel: 0, humor: 0, food: 0, ldr: 0 };
  REASONS.forEach(r => {
    if (counts[r.category] !== undefined) counts[r.category]++;
  });

  if (allCountEl) allCountEl.textContent = REASONS.length;
  if (starCountEl) starCountEl.textContent = starredList.length;
  if (romanceCountEl) romanceCountEl.textContent = counts.romance;
  if (travelCountEl) travelCountEl.textContent = counts.travel;
  if (humorCountEl) humorCountEl.textContent = counts.humor;
  if (foodCountEl) foodCountEl.textContent = counts.food;
  if (ldrCountEl) ldrCountEl.textContent = counts.ldr;
  if (browseCountEl) browseCountEl.textContent = REASONS.length;
  if (descCountEl) descCountEl.textContent = REASONS.length;
  if (settingsCountEl) settingsCountEl.textContent = `Loaded in deck: ${REASONS.length} reasons ✨`;
  const headerCountEl = document.getElementById("editAllReasonsCount");
  if (headerCountEl) headerCountEl.textContent = REASONS.length;
}

function renderCurrentReason(animationType = null) {
  const list = getFilteredReasons();
  const card = document.getElementById("reasonCard");
  const numEl = document.getElementById("reasonNumber");
  const currentNumEl = document.getElementById("reasonCurrentNum");
  const totalCountEl = document.getElementById("reasonTotalCount");
  const textEl = document.getElementById("reasonText");
  const iconEl = document.getElementById("noteCategoryIcon");
  const tagEl = document.getElementById("noteCategoryTag");
  const footnoteEl = document.getElementById("noteFootnoteText");

  updateFilterCounts();

  if (!list.length) {
    if (currentReasonCategory === "starred") {
      if (numEl) numEl.textContent = "0";
      if (currentNumEl) currentNumEl.textContent = "0";
      if (totalCountEl) totalCountEl.textContent = "0";
      if (iconEl) iconEl.textContent = "⭐";
      if (tagEl) tagEl.textContent = "No Favorites Yet";
      if (textEl) textEl.textContent = '"You haven\'t favorited any notes yet! Tap the ⭐ Favorite Note button on your favorite cards to collect them here."';
      if (footnoteEl) footnoteEl.textContent = "— Tap 'All' above to browse through all reasons 💕";
    } else {
      if (textEl) textEl.textContent = '"No reasons found in this category."';
    }
    updateStarState();
    return;
  }

  if (currentReasonIndex >= list.length) currentReasonIndex = 0;
  if (currentReasonIndex < 0) currentReasonIndex = list.length - 1;

  const reason = list[currentReasonIndex];
  const originalNum = reason.originalIndex !== undefined ? reason.originalIndex + 1 : currentReasonIndex + 1;

  if (numEl) numEl.textContent = originalNum;
  if (currentNumEl) currentNumEl.textContent = currentReasonIndex + 1;
  if (totalCountEl) totalCountEl.textContent = list.length;
  if (textEl) textEl.textContent = `"${reason.note}"`;
  if (iconEl) iconEl.textContent = reason.badgeIcon || "💌";
  if (tagEl) tagEl.textContent = reason.tag || `Reason #${originalNum}`;
  if (footnoteEl) footnoteEl.textContent = reason.footnote ? `— ${reason.footnote}` : "— Always and forever in my heart.";

  if (card && animationType) {
    card.classList.remove("card-slide-next", "card-slide-prev", "card-shuffle-pop");
    void card.offsetWidth;
    const animClass = animationType === "next" ? "card-slide-next" : animationType === "prev" ? "card-slide-prev" : "card-shuffle-pop";
    card.classList.add(animClass);

    const underlay1 = document.querySelector(".underlay-1");
    const underlay2 = document.querySelector(".underlay-2");
    if (underlay1 && underlay2) {
      const randRot1 = (Math.random() * 4 - 2).toFixed(1);
      const randRot2 = (Math.random() * 4 - 2).toFixed(1);
      underlay1.style.transform = `translateY(6px) scale(0.97) rotate(${randRot1}deg)`;
      underlay2.style.transform = `translateY(12px) scale(0.93) rotate(${randRot2}deg)`;
    }
  }

  updateStarState();
}

function updateStarState() {
  const starBtn = document.getElementById("starNoteBtn");
  if (!starBtn) return;
  const starredList = JSON.parse(localStorage.getItem("gf_starred_notes") || "[]");
  const currentText = document.getElementById("reasonText") ? document.getElementById("reasonText").textContent : "";
  const isStarred = starredList.includes(currentText);

  starBtn.classList.toggle("starred", isStarred);
  const starIcon = document.getElementById("starNoteIcon");
  const starText = document.getElementById("starNoteText");
  if (starIcon) starIcon.textContent = isStarred ? "⭐" : "☆";
  if (starText) starText.textContent = isStarred ? "Favorited!" : "Favorite Note";
  updateFilterCounts();
}

function nextReason() {
  const list = getFilteredReasons();
  if (list.length <= 1) return;
  currentReasonIndex = (currentReasonIndex + 1) % list.length;
  renderCurrentReason("next");
  audio.playSparkle();
}

function prevReason() {
  const list = getFilteredReasons();
  if (list.length <= 1) return;
  currentReasonIndex = (currentReasonIndex - 1 + list.length) % list.length;
  renderCurrentReason("prev");
  audio.playSparkle();
}

function shuffleReason() {
  const list = getFilteredReasons();
  if (!list.length) return;
  let newIdx;
  do {
    newIdx = Math.floor(Math.random() * list.length);
  } while (list.length > 1 && newIdx === currentReasonIndex);
  currentReasonIndex = newIdx;
  renderCurrentReason("shuffle");
  audio.playSparkle();
  const card = document.getElementById("reasonCard");
  if (card) {
    const rect = card.getBoundingClientRect();
    particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 3, 24);
  }
}

function renderAllNotesDrawer() {
  const grid = document.getElementById("allNotesGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const all = REASONS.map((r, i) => normalizeReason(r, i));
  const starredList = JSON.parse(localStorage.getItem("gf_starred_notes") || "[]");

  all.forEach((item, i) => {
    const mini = document.createElement("div");
    mini.className = "mini-note-card";
    const isCurrent = currentReasonIndex === i && currentReasonCategory === "all";
    if (isCurrent) mini.classList.add("active-note");

    const isStarred = starredList.includes(`"${item.note}"`) || starredList.includes(item.note);

    mini.innerHTML = `
      <div class="mini-note-header">
        <span class="mini-note-tag">${item.badgeIcon || "💌"} ${item.tag || "Note"}</span>
        <div class="mini-note-header-actions">
          <span class="mini-note-num">${isStarred ? "⭐ " : ""}#${i + 1}</span>
          <button type="button" class="mini-note-edit-btn" title="Edit this note" aria-label="Edit note">✏️</button>
        </div>
      </div>
      <p class="mini-note-text">"${item.note}"</p>
      ${item.footnote ? `<p class="mini-note-footnote">— ${item.footnote}</p>` : ""}
    `;

    const editBtn = mini.querySelector(".mini-note-edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditAllReasonsModal(item.originalIndex !== undefined ? item.originalIndex : i);
      });
    }

    mini.addEventListener("click", () => {
      currentReasonCategory = "all";
      document.querySelectorAll(".deck-filter-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.category === "all");
      });
      currentReasonIndex = i;
      renderCurrentReason("shuffle");
      const drawer = document.getElementById("allNotesDrawer");
      if (drawer) drawer.classList.add("hidden");
      const section = document.getElementById("sweetNotesSection");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    grid.appendChild(mini);
  });
}

function setupReasonsDeck() {
  const nextBtn = document.getElementById("nextReasonBtn");
  const prevBtn = document.getElementById("prevReasonBtn");
  const shuffleBtn = document.getElementById("shuffleReasonBtn");
  const burstBtn = document.getElementById("burstHeartsBtn");
  const starBtn = document.getElementById("starNoteBtn");
  const filterBtns = document.querySelectorAll(".deck-filter-btn");

  if (nextBtn) nextBtn.addEventListener("click", nextReason);
  if (prevBtn) prevBtn.addEventListener("click", prevReason);
  if (shuffleBtn) shuffleBtn.addEventListener("click", shuffleReason);

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentReasonCategory = btn.dataset.category || "all";
      currentReasonIndex = 0;
      renderCurrentReason("shuffle");
      audio.playPop();
    });
  });

  if (starBtn) {
    starBtn.addEventListener("click", () => {
      const starredList = JSON.parse(localStorage.getItem("gf_starred_notes") || "[]");
      const currentText = document.getElementById("reasonText") ? document.getElementById("reasonText").textContent : "";
      if (!currentText) return;
      const idx = starredList.indexOf(currentText);

      if (idx >= 0) {
        starredList.splice(idx, 1);
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "Removed from favorites ☆");
        audio.playPop();
      } else {
        starredList.push(currentText);
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "⭐ Added to your Favorite Notes! 💖");
        audio.playFanfare();
        particles.burst(window.innerWidth / 2, window.innerHeight / 2, 35);
      }
      localStorage.setItem("gf_starred_notes", JSON.stringify(starredList));
      if (typeof saveToComputer === "function") saveToComputer();
      updateStarState();
      if (currentReasonCategory === "starred") {
        renderCurrentReason("shuffle");
      }
    });
  }

  if (burstBtn) {
    burstBtn.addEventListener("click", () => {
      const rect = burstBtn.getBoundingClientRect();
      particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
      state.bonusLof += 500000000000;
      showComplimentToast(rect.left, rect.top, "Lof Reaction Sent! 💖 (+500B)");
      audio.playKiss();
    });
  }

  // Browse All Notes Drawer
  const browseBtn = document.getElementById("browseAllNotesBtn");
  const allNotesDrawer = document.getElementById("allNotesDrawer");
  const closeAllNotes = document.getElementById("closeAllNotes");
  const allNotesBackdrop = document.getElementById("allNotesBackdrop");

  if (browseBtn && allNotesDrawer) {
    browseBtn.addEventListener("click", () => {
      renderAllNotesDrawer();
      allNotesDrawer.classList.remove("hidden");
    });
  }
  if (closeAllNotes && allNotesDrawer) {
    closeAllNotes.addEventListener("click", () => allNotesDrawer.classList.add("hidden"));
  }
  if (allNotesBackdrop && allNotesDrawer) {
    allNotesBackdrop.addEventListener("click", () => allNotesDrawer.classList.add("hidden"));
  }

  // Touch Swipe Gesture Support
  const card = document.getElementById("reasonCard");
  if (card) {
    let startX = 0;
    let startY = 0;
    card.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    card.addEventListener("touchend", (e) => {
      const diffX = e.changedTouches[0].clientX - startX;
      const diffY = e.changedTouches[0].clientY - startY;
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) nextReason();
        else prevReason();
      }
    }, { passive: true });
  }

  // Keyboard Navigation (Left / Right Arrow Keys)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const allModal = document.getElementById("editAllReasonsModal");
      if (allModal && !allModal.classList.contains("hidden")) {
        closeEditAllReasonsModal();
      }
      return;
    }
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
    if (e.key === "ArrowRight") nextReason();
    else if (e.key === "ArrowLeft") prevReason();
  });

  const editHeaderBtn = document.getElementById("editReasonsHeaderBtn");
  const browseHeaderBtn = document.getElementById("browseAllHeaderBtn");
  const editCurrentBtn = document.getElementById("editCurrentReasonBtn");
  const editDrawerBtn = document.getElementById("editAllFromDrawerBtn");

  if (editHeaderBtn) {
    editHeaderBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openEditAllReasonsModal();
    });
  }
  if (browseHeaderBtn) {
    browseHeaderBtn.addEventListener("click", () => {
      renderAllNotesDrawer();
      const allDrawer = document.getElementById("allNotesDrawer");
      if (allDrawer) allDrawer.classList.remove("hidden");
    });
  }
  if (editCurrentBtn) {
    editCurrentBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const list = getFilteredReasons();
      const current = list[currentReasonIndex];
      const idx = current?.originalIndex !== undefined ? current.originalIndex : currentReasonIndex;
      openEditAllReasonsModal(idx);
    });
  }
  if (editDrawerBtn) {
    editDrawerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const allDrawer = document.getElementById("allNotesDrawer");
      if (allDrawer) allDrawer.classList.add("hidden");
      openEditAllReasonsModal();
    });
  }

  setupEditAllReasonsModal();
  renderCurrentReason(false);
}

let editReasonsDraft = [];

function escapeReasonHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function populateEditAllReasonsDraft() {
  editReasonsDraft = REASONS.map((r, i) => {
    const norm = normalizeReason(r, i);
    return {
      category: norm.category || "romance",
      tag: norm.tag || `Reason #${i + 1}`,
      note: norm.note || "",
      footnote: norm.footnote || "",
      badgeIcon: norm.badgeIcon || REASON_CATEGORY_ICONS[norm.category] || "💌",
      id: norm.id || `r-${i}`
    };
  });
}

function renderEditAllReasonsList(focusIndex = null) {
  const listEl = document.getElementById("editAllReasonsList");
  if (!listEl) return;
  const searchTerm = (document.getElementById("editAllSearchInput")?.value || "").toLowerCase().trim();
  const categoryFilter = document.getElementById("editAllCategoryFilter")?.value || "all";

  listEl.innerHTML = "";

  const statusEl = document.getElementById("editAllStatusText");
  if (statusEl) {
    statusEl.textContent = `Loaded in deck: ${editReasonsDraft.length} reasons`;
  }

  editReasonsDraft.forEach((item, index) => {
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter;
    const matchesSearch = !searchTerm ||
      (item.note || "").toLowerCase().includes(searchTerm) ||
      (item.tag || "").toLowerCase().includes(searchTerm) ||
      (item.footnote || "").toLowerCase().includes(searchTerm);

    if (!matchesCat || !matchesSearch) return;

    const row = document.createElement("div");
    row.className = "edit-reason-item";
    row.id = `editItem-${index}`;
    row.dataset.index = index;
    if (focusIndex === index) row.classList.add("highlight-target");

    row.innerHTML = `
      <div class="edit-reason-top-row">
        <span class="edit-reason-num">#${index + 1}</span>
        <select class="caption-input edit-item-cat" aria-label="Category">
          <option value="romance" ${item.category === "romance" ? "selected" : ""}>💖 Romance</option>
          <option value="travel" ${item.category === "travel" ? "selected" : ""}>✈️ Adventures</option>
          <option value="humor" ${item.category === "humor" ? "selected" : ""}>😂 Inside Jokes</option>
          <option value="food" ${item.category === "food" ? "selected" : ""}>🍜 Foodie</option>
          <option value="ldr" ${item.category === "ldr" ? "selected" : ""}>🌙 LDR</option>
        </select>
        <input type="text" class="caption-input edit-item-tag" value="${escapeReasonHtml(item.tag)}" placeholder="Tag / Title">
        <button type="button" class="btn-delete-reason" title="Delete reason #${index + 1}" aria-label="Delete reason">🗑️</button>
      </div>
      <div class="edit-reason-body">
        <textarea class="caption-input story-textarea edit-item-note" rows="2" placeholder="Write why you lof her...">${escapeReasonHtml(item.note)}</textarea>
        <input type="text" class="caption-input edit-item-footnote" value="${escapeReasonHtml(item.footnote)}" placeholder="— Footnote / Romantic reminder...">
      </div>
    `;

    const catSelect = row.querySelector(".edit-item-cat");
    const tagInput = row.querySelector(".edit-item-tag");
    const noteArea = row.querySelector(".edit-item-note");
    const footInput = row.querySelector(".edit-item-footnote");
    const deleteBtn = row.querySelector(".btn-delete-reason");

    catSelect?.addEventListener("change", () => {
      item.category = catSelect.value;
      item.badgeIcon = REASON_CATEGORY_ICONS[catSelect.value] || "💌";
    });
    tagInput?.addEventListener("input", () => { item.tag = tagInput.value; });
    noteArea?.addEventListener("input", () => { item.note = noteArea.value; });
    footInput?.addEventListener("input", () => { item.footnote = footInput.value; });

    deleteBtn?.addEventListener("click", () => {
      if (editReasonsDraft.length <= 1) {
        alert("At least one reason must remain in your deck! 💖");
        return;
      }
      editReasonsDraft.splice(index, 1);
      renderEditAllReasonsList();
      audio.playPop();
    });

    listEl.appendChild(row);
  });

  if (focusIndex !== null) {
    setTimeout(() => {
      const target = document.getElementById(`editItem-${focusIndex}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.querySelector("textarea")?.focus();
      }
    }, 100);
  }
}

function openEditAllReasonsModal(focusIndex = null) {
  if (typeof window !== "undefined" && window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "SELECT_WIDGET", widgetId: "reasons" }, "*");
    return;
  }
  if (typeof isAdminEditAllowed === "function" && !isAdminEditAllowed()) return;
  populateEditAllReasonsDraft();
  const searchInput = document.getElementById("editAllSearchInput");
  const catFilter = document.getElementById("editAllCategoryFilter");
  if (searchInput) searchInput.value = "";
  if (catFilter) catFilter.value = "all";

  renderEditAllReasonsList(focusIndex);
  const modal = document.getElementById("editAllReasonsModal");
  if (modal) modal.classList.remove("hidden");
  audio.playPop();
}

function closeEditAllReasonsModal() {
  const modal = document.getElementById("editAllReasonsModal");
  if (modal) modal.classList.add("hidden");
}

function addNewReasonToEditList(atTop = false) {
  const newReason = {
    category: "romance",
    tag: `💌 Reason #${editReasonsDraft.length + 1}`,
    note: "",
    footnote: "Always and forever in my heart.",
    badgeIcon: "💖",
    id: `custom-${Date.now()}`
  };

  if (atTop) {
    editReasonsDraft.unshift(newReason);
    renderEditAllReasonsList(0);
  } else {
    editReasonsDraft.push(newReason);
    renderEditAllReasonsList(editReasonsDraft.length - 1);
  }
  audio.playSparkle();
}

async function saveAllReasonsFromModal() {
  document.querySelectorAll(".edit-reason-item").forEach(row => {
    const idx = parseInt(row.dataset.index, 10);
    if (isNaN(idx) || !editReasonsDraft[idx]) return;
    const cat = row.querySelector(".edit-item-cat")?.value || "romance";
    const tag = row.querySelector(".edit-item-tag")?.value.trim() || "";
    const note = row.querySelector(".edit-item-note")?.value.trim() || "";
    const footnote = row.querySelector(".edit-item-footnote")?.value.trim() || "";

    editReasonsDraft[idx].category = cat;
    editReasonsDraft[idx].tag = tag || (cat === "romance" ? "💖 Sweet Note" : "💌 Sweet Reason");
    editReasonsDraft[idx].badgeIcon = REASON_CATEGORY_ICONS[cat] || "💌";
    editReasonsDraft[idx].note = note;
    editReasonsDraft[idx].footnote = footnote;
  });

  const validReasons = editReasonsDraft.filter(r => (r.note || "").trim().length > 0);
  if (!validReasons.length) {
    alert("Please write at least one sweet reason before saving! 💖");
    return;
  }

  REASONS = validReasons;

  const saveBtn = document.getElementById("saveAllReasonsBtn");
  const origBtnContent = saveBtn ? saveBtn.innerHTML : "";
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = "<span>⏳ Saving to Computer...</span>";
  }

  try {
    localStorage.setItem("gf_reasons", JSON.stringify(REASONS));
  } catch (e) {}

  if (typeof saveToComputer === "function") {
    await saveToComputer({ gf_reasons: JSON.stringify(REASONS) });
  }

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = origBtnContent;
  }

  updateFilterCounts();
  renderCurrentReason("shuffle");
  renderAllNotesDrawer();
  closeEditAllReasonsModal();

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "SYNC_REASONS", reasons: REASONS }, window.location.origin);
  }

  audio.playChimeCascade();
  particles.burst(window.innerWidth / 2, window.innerHeight / 2, 45);
  showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, `✨ Saved all ${REASONS.length} reasons to Love Deck! 💖`);
}

async function resetAllReasonsToDefaults() {
  if (!confirm("Are you sure you want to reset all reasons back to original defaults?")) return;
  REASONS = [...RICH_REASONS];
  try {
    localStorage.removeItem("gf_reasons");
    localStorage.removeItem("gf_custom_reasons");
  } catch (e) {}

  if (typeof saveToComputer === "function") {
    await saveToComputer({ gf_reasons: JSON.stringify(REASONS), gf_custom_reasons: "[]" });
  }

  populateEditAllReasonsDraft();
  renderEditAllReasonsList();
  updateFilterCounts();
  renderCurrentReason("shuffle");
  renderAllNotesDrawer();
  audio.playPop();
  showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "🔄 Love deck reset to defaults!");
}

function setupEditAllReasonsModal() {
  const modal = document.getElementById("editAllReasonsModal");
  if (!modal) return;

  const closeBtn = document.getElementById("closeEditAllReasonsModal");
  const cancelBtn = document.getElementById("cancelEditAllBtn");
  const backdrop = document.getElementById("editAllReasonsBackdrop");
  const saveBtn = document.getElementById("saveAllReasonsBtn");
  const addTopBtn = document.getElementById("addNewReasonTopBtn");
  const addBottomBtn = document.getElementById("addNewReasonBottomBtn");
  const resetBtn = document.getElementById("resetAllReasonsBtn");
  const searchInput = document.getElementById("editAllSearchInput");
  const catFilter = document.getElementById("editAllCategoryFilter");

  [closeBtn, cancelBtn, backdrop].forEach(el => {
    if (el) el.addEventListener("click", () => {
      closeEditAllReasonsModal();
      audio.playPop();
    });
  });

  if (saveBtn) saveBtn.addEventListener("click", saveAllReasonsFromModal);
  if (addTopBtn) addTopBtn.addEventListener("click", () => addNewReasonToEditList(true));
  if (addBottomBtn) addBottomBtn.addEventListener("click", () => addNewReasonToEditList(false));
  if (resetBtn) resetBtn.addEventListener("click", resetAllReasonsToDefaults);

  if (searchInput) searchInput.addEventListener("input", () => renderEditAllReasonsList());
  if (catFilter) catFilter.addEventListener("change", () => renderEditAllReasonsList());
}

window.setupReasonsDeck = setupReasonsDeck;
window.setupEditAllReasonsModal = setupEditAllReasonsModal;
window.renderCurrentReason = renderCurrentReason;
window.updateFilterCounts = updateFilterCounts;
window.renderAllNotesDrawer = renderAllNotesDrawer;
window.openEditAllReasonsModal = openEditAllReasonsModal;
window.initDirectReasonEditor = setupEditAllReasonsModal;

