// Romantic Story Timeline Engine
let timelineSlideTimers = new Map();
let timelineChapterObserver = null;

function setupChapterAutoSlide(item, images) {
  if (!images || images.length <= 1) return;

  const imgEl = item.querySelector(".timeline-photo-preview img");
  const thumbsStrip = item.querySelector(".timeline-photo-thumbs-strip");
  const thumbs = thumbsStrip ? thumbsStrip.querySelectorAll(".timeline-thumb-pill") : [];
  if (!imgEl) return;

  let currentIdx = 0;
  item.dataset.activeIdx = "0";
  item.dataset.activeImg = images[0];

  const goToImage = (nextIdx, manual = false) => {
    currentIdx = (nextIdx + images.length) % images.length;
    item.dataset.activeIdx = String(currentIdx);
    const targetSrc = images[currentIdx];
    item.dataset.activeImg = targetSrc;

    imgEl.style.opacity = "0.35";
    setTimeout(() => {
      imgEl.src = targetSrc;
      imgEl.style.opacity = "1";
    }, 150);

    if (thumbs.length > 0) {
      thumbs.forEach((t, i) => {
        const isActive = (i === currentIdx);
        t.classList.toggle("active", isActive);
        if (isActive && manual) {
          t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      });
    }
  };

  const startSlide = () => {
    if (timelineSlideTimers.has(item)) return;
    const timer = setInterval(() => {
      goToImage(currentIdx + 1);
    }, 3200);
    timelineSlideTimers.set(item, timer);
  };

  const stopSlide = () => {
    if (timelineSlideTimers.has(item)) {
      clearInterval(timelineSlideTimers.get(item));
      timelineSlideTimers.delete(item);
    }
  };

  const photoPreview = item.querySelector(".timeline-photo-preview");
  if (photoPreview) {
    photoPreview.addEventListener("mouseenter", stopSlide);
    photoPreview.addEventListener("mouseleave", () => {
      if (item.dataset.inView === "true") startSlide();
    });
  }
  if (thumbsStrip) {
    thumbsStrip.addEventListener("mouseenter", stopSlide);
    thumbsStrip.addEventListener("mouseleave", () => {
      if (item.dataset.inView === "true") startSlide();
    });
  }

  thumbs.forEach((thumb, idx) => {
    thumb.addEventListener("click", (e) => {
      e.stopPropagation();
      stopSlide();
      goToImage(idx, true);
      if (item.dataset.inView === "true") startSlide();
    });
  });

  item._startAutoSlide = startSlide;
  item._stopAutoSlide = stopSlide;
}

function initTimelineSlideObservers() {
  if (timelineChapterObserver) {
    timelineChapterObserver.disconnect();
  }
  timelineSlideTimers.forEach(timer => clearInterval(timer));
  timelineSlideTimers.clear();

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".timeline-item").forEach(item => {
      if (typeof item._startAutoSlide === "function") item._startAutoSlide();
    });
    return;
  }

  timelineChapterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const item = entry.target;
      if (entry.isIntersecting) {
        item.dataset.inView = "true";
        if (typeof item._startAutoSlide === "function") item._startAutoSlide();
      } else {
        item.dataset.inView = "false";
        if (typeof item._stopAutoSlide === "function") item._stopAutoSlide();
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: "0px 0px -40px 0px"
  });

  document.querySelectorAll(".timeline-item").forEach(item => {
    if (typeof item._startAutoSlide === "function") {
      timelineChapterObserver.observe(item);
    }
  });
}

function getActiveTimelineChapters() {
  if (typeof window !== "undefined" && Array.isArray(window.TIMELINE_CHAPTERS)) {
    return window.TIMELINE_CHAPTERS;
  }
  return typeof TIMELINE_CHAPTERS !== "undefined" && Array.isArray(TIMELINE_CHAPTERS) ? TIMELINE_CHAPTERS : [];
}

function renderTimeline() {
  const container = document.getElementById("timelineList");
  if (!container) return;
  container.innerHTML = "";

  const chapters = getActiveTimelineChapters();
  if (chapters.length === 0) {
    container.innerHTML = `
      <div class="timeline-empty-state glass-panel" style="text-align: center; padding: 48px 20px; color: var(--text-muted, rgba(255,255,255,0.7));">
        <p style="font-size: 2.5rem; margin-bottom: 12px;">📖</p>
        <h4 style="font-size: 1.15rem; margin-bottom: 6px; font-family: var(--font-title, inherit); color: var(--text-main, inherit);">Your Timeline is Empty</h4>
        <p style="font-size: 0.9rem; opacity: 0.85;">Add your story chapters and photos in the inspector to start your journey.</p>
      </div>
    `;
    return;
  }

  const cleanChapterTag = (str) => {
    if (!str) return "";
    return str
      .replace(/(\s*•\s*)?(✈️|🚄|🚌|🚗|Train|Airplane|Flight|Bus|Didi)\b[^\w•]*/gi, "")
      .replace(/\b\d{1,2}\s*(?:—|-|to)\s*\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\b/gi, "")
      .replace(/\b\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\b/gi, "")
      .replace(/^[•\s—-]+|[•\s—-]+$/g, "")
      .trim();
  };

  chapters.forEach((ch, chIdx) => {
    const photoData = getCityPhotoData(ch.id, ch.cityKey);
    const descText = (photoData.desc && photoData.desc.trim()) ? photoData.desc : ch.desc;
    const highlightsList = (photoData.highlights && photoData.highlights.length > 0) ? photoData.highlights : (ch.highlights || []);
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.id = ch.id || ch.cityKey || `chap-${chIdx}`;
    item.setAttribute("data-chapter-id", ch.id || "");
    if (ch.cityKey) item.setAttribute("data-city-key", ch.cityKey);
    const tagStr = cleanChapterTag(ch.tag);
    item.innerHTML = `
      <div class="timeline-dot">${ch.icon || '💖'}</div>
      <div class="timeline-card glass-panel">
        <div class="timeline-header-row">
          <div class="timeline-country-banner">
            <span class="timeline-flag">${ch.countryFlag || "🇨🇳"}</span>
            ${ch.country ? `<span class="timeline-country-text">${ch.country.toUpperCase()}</span> • ` : ''}<span class="timeline-city-text">${ch.city || ch.location || ''}</span>
          </div>
          ${tagStr ? `<span class="timeline-tag">${tagStr}</span>` : ''}
        </div>
        <h3 class="timeline-title">${ch.title}</h3>

        <div class="timeline-photo-preview" role="button" tabindex="0" title="Click photo to enlarge, or edit button to customize">
          <img src="${photoData.img}" alt="${ch.title}" ${chIdx === 0 ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async" onerror="if(this.dataset.tried!=='1'){this.dataset.tried='1';this.src='${photoData.svgFallback}';}">
          ${(photoData.images && photoData.images.length > 1) ? `<span class="timeline-multi-badge">📷 ${photoData.images.length} photos</span>` : ''}
          <span class="timeline-photo-edit-hint">✏️ Edit Story & Photo</span>
          <span class="timeline-photo-caption">${photoData.caption || ch.title}</span>
        </div>
        ${(photoData.images && photoData.images.length > 1) ? `
          <div class="timeline-photo-thumbs-strip">
            ${photoData.images.map((im, idx) => `
              <button type="button" class="timeline-thumb-pill ${idx === 0 ? 'active' : ''}" data-src="${im}" title="View photo ${idx + 1}">
                <img src="${im}" alt="thumb ${idx + 1}" loading="lazy" decoding="async" fetchpriority="low" onerror="if(!this.dataset.tried){this.dataset.tried='1';const c=(typeof LOCAL_IMG_CACHE!=='undefined')?(LOCAL_IMG_CACHE['city_${ch.id}_${idx}']||LOCAL_IMG_CACHE['${ch.id}_${idx}']):'';if(c&&c.startsWith('data:')){this.src=c;}else{this.style.opacity='0.4';}}">
              </button>
            `).join("")}
          </div>
        ` : ''}

        <div class="timeline-desc-container">
          <p class="timeline-text ${(descText && descText.length > 95) ? 'collapsed' : ''}">${descText}</p>
          ${(descText && descText.length > 95) ? `
            <button type="button" class="timeline-read-more-btn">
              <span>📖 Read Full Story →</span>
            </button>
          ` : ''}
        </div>

        <div class="timeline-highlights-list" role="button" title="Click to edit highlights ✨" style="cursor: pointer;">
          ${highlightsList.map(h => `<span class="timeline-pill">✨ ${h}</span>`).join("")}
        </div>

        <div class="timeline-card-actions">
          <button type="button" class="btn btn-sm btn-primary timeline-edit-chapter-btn" title="Edit this chapter story and photo">
            <span>✏️ Edit Photo & Story</span>
          </button>
          <button type="button" class="btn btn-sm btn-outline timeline-map-btn" data-city="${ch.cityKey}">
            <span>🗺️ Spotlight on Map</span>
          </button>
          <button type="button" class="btn btn-sm btn-secondary timeline-stamp-btn">
            <span>💖 Stamp Lof (+100B)</span>
          </button>
        </div>
      </div>
    `;

    // Click highlights to edit directly
    const hlList = item.querySelector(".timeline-highlights-list");
    if (hlList) {
      hlList.addEventListener("click", (e) => {
        e.stopPropagation();
        openDirectChapterEditor(ch.id, ch.cityKey);
      });
    }

    // Direct Chapter Edit button click
    const editBtn = item.querySelector(".timeline-edit-chapter-btn");
    if (editBtn) {
      editBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDirectChapterEditor(ch.id, ch.cityKey);
      };
    }

    // Auto-slide & thumbnail switcher for multi-photo chapters
    if (photoData.images && photoData.images.length > 1) {
      setupChapterAutoSlide(item, photoData.images);
    }

    // Photo preview click: if clicking the edit hint, open editor, else open in-depth chapter viewer
    const photoPreview = item.querySelector(".timeline-photo-preview");
    if (photoPreview) {
      photoPreview.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target.closest(".timeline-photo-edit-hint")) {
          openDirectChapterEditor(ch.id, ch.cityKey);
        } else {
          const currentIdx = parseInt(item.dataset.activeIdx, 10) || 0;
          if (typeof window.openStoryChapterDetailModal === "function") {
            window.openStoryChapterDetailModal(ch.id, ch.cityKey, currentIdx);
          } else {
            openLightbox({
              img: item.dataset.activeImg || photoData.img,
              title: `${ch.title} — ${photoData.caption || ch.location}`,
              desc: descText
            });
          }
        }
      });
    }

    // Description text click: open in-depth chapter viewer
    const descTextEl = item.querySelector(".timeline-text");
    if (descTextEl) {
      descTextEl.setAttribute("title", "Click to read full story & explore all chapter photos");
      descTextEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentIdx = parseInt(item.dataset.activeIdx, 10) || 0;
        if (typeof window.openStoryChapterDetailModal === "function") {
          window.openStoryChapterDetailModal(ch.id, ch.cityKey, currentIdx);
        }
      });
    }

    // Read More → open full chapter detail modal (Window B)
    const readMoreBtn = item.querySelector(".timeline-read-more-btn");
    if (readMoreBtn) {
      readMoreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        audio.playPop();
        const currentIdx = parseInt(item.dataset.activeIdx, 10) || 0;
        if (typeof window.openStoryChapterDetailModal === "function") {
          window.openStoryChapterDetailModal(ch.id, ch.cityKey, currentIdx);
        }
      });
    }

    // Spotlight on map button
    const mapBtn = item.querySelector(".timeline-map-btn");
    if (mapBtn) {
      mapBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const cityKey = mapBtn.getAttribute("data-city") || ch.cityKey;
        if (typeof window.spotlightMapCity === "function") {
          window.spotlightMapCity(cityKey);
        } else {
          const mapFrame = document.getElementById("mapFrame") || document.querySelector(".map-section");
          if (mapFrame) mapFrame.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }

    // Stamp Lof button
    const stampBtn = item.querySelector(".timeline-stamp-btn");
    if (stampBtn) {
      stampBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.bonusLof += 100000000000;
        stampBtn.innerHTML = "<span>💌 STAMPED WITH INFINITE LOF! ❤️</span>";
        stampBtn.style.background = "linear-gradient(135deg, #ff4365, #ff758c)";
        stampBtn.style.color = "#ffffff";
        audio.playChimeCascade();
        const rect = stampBtn.getBoundingClientRect();
        particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
      });
    }

    const prewarmPhotos = () => {
      if (photoData.images && Array.isArray(photoData.images)) {
        photoData.images.forEach(src => {
          if (typeof window.preloadImage === "function") window.preloadImage(src, "low");
        });
      }
    };
    item.addEventListener("mouseenter", prewarmPhotos, { passive: true, once: true });
    item.addEventListener("touchstart", prewarmPhotos, { passive: true, once: true });

    item.addEventListener("click", (e) => {
      if (e.target.closest("button, .timeline-photo-edit-hint, .timeline-highlights-list, .timeline-thumb-pill")) {
        return;
      }
      audio.playPop();
      const rect = item.getBoundingClientRect();
      particles.burst(rect.left + 30, rect.top + 20, 18);
      const currentIdx = parseInt(item.dataset.activeIdx, 10) || 0;
      if (typeof window.openStoryChapterDetailModal === "function") {
        window.openStoryChapterDetailModal(ch.id, ch.cityKey, currentIdx);
      }
    });

    container.appendChild(item);
  });

  initTimelineSlideObservers();
}

// Direct Chapter Editor Engine (Multiple Photos Supported)
let currentEditingChapterKey = "guangzhou";
let currentEditingChapterFallback = "guangzhou";
let currentEditingChapterImg = null;
let currentEditingChapterImages = [];

function updateSetMainBtn() {
  const setMainBtn = document.getElementById("setAsMainPhotoBtn");
  if (!setMainBtn) return;
  if (currentEditingChapterImages.length > 1 && currentEditingChapterImg && currentEditingChapterImages[0] !== currentEditingChapterImg) {
    setMainBtn.classList.remove("hidden");
  } else {
    setMainBtn.classList.add("hidden");
  }
}

let draggedThumbIdx = null;

function renderDirectChapterGalleryThumbs() {
  const countEl = document.getElementById("directChapterPhotoCount");
  const thumbsWrap = document.getElementById("directChapterGalleryThumbs");
  if (countEl) countEl.textContent = currentEditingChapterImages.length;
  updateSetMainBtn();
  if (!thumbsWrap) return;

  if (currentEditingChapterImages.length === 0) {
    thumbsWrap.innerHTML = '<span class="gallery-empty-hint">No photos added yet. Upload or paste above!</span>';
    return;
  }

  thumbsWrap.innerHTML = currentEditingChapterImages.map((imgSrc, idx) => `
    <div class="direct-gallery-item ${imgSrc === currentEditingChapterImg ? 'active' : ''}" data-idx="${idx}" draggable="true" title="Drag to reorder • Click to view">
      <img src="${imgSrc}" alt="Photo ${idx + 1}" loading="lazy" decoding="async" onerror="if(!this.dataset.tried){this.dataset.tried='1';const c=(typeof LOCAL_IMG_CACHE!=='undefined')?(LOCAL_IMG_CACHE['city_${currentEditingChapterKey}_${idx}']||LOCAL_IMG_CACHE['${currentEditingChapterKey}_${idx}']||LOCAL_IMG_CACHE['city_${currentEditingChapterKey}']):'';if(c&&c.startsWith('data:')){this.src=c;}else{this.style.opacity='0.4';}}">
      ${idx === 0
        ? '<span class="cover-badge" title="Main Cover Photo">⭐ Main</span>'
        : `<span class="thumb-order-badge">#${idx + 1}</span>`
      }
      <button type="button" class="del-photo-btn" data-idx="${idx}" title="Remove photo">✕</button>
      <div class="thumb-action-bar">
        ${idx > 0
          ? `<button type="button" class="thumb-move-btn move-left" data-idx="${idx}" data-dir="-1" title="Move Left">◀</button>`
          : '<span class="thumb-btn-placeholder"></span>'
        }
        ${idx !== 0
          ? `<button type="button" class="thumb-star-btn" data-idx="${idx}" title="Set as Main Photo">⭐</button>`
          : '<span class="thumb-main-dot" title="Main Photo">💖</span>'
        }
        ${idx < currentEditingChapterImages.length - 1
          ? `<button type="button" class="thumb-move-btn move-right" data-idx="${idx}" data-dir="1" title="Move Right">▶</button>`
          : '<span class="thumb-btn-placeholder"></span>'
        }
      </div>
    </div>
  `).join("");

  thumbsWrap.querySelectorAll(".direct-gallery-item").forEach(item => {
    const idx = parseInt(item.getAttribute("data-idx"), 10);

    item.addEventListener("click", (e) => {
      if (e.target.closest(".del-photo-btn") || e.target.closest(".thumb-star-btn") || e.target.closest(".thumb-move-btn")) return;
      currentEditingChapterImg = currentEditingChapterImages[idx];
      const previewImg = document.getElementById("directChapterPreviewImg");
      if (previewImg) previewImg.src = currentEditingChapterImg;
      renderDirectChapterGalleryThumbs();
      audio.playPop();
    });

    item.addEventListener("dragstart", (e) => {
      draggedThumbIdx = idx;
      item.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(idx));
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      thumbsWrap.querySelectorAll(".direct-gallery-item").forEach(el => el.classList.remove("drag-over"));
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      item.classList.add("drag-over");
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over");
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.classList.remove("drag-over");
      if (draggedThumbIdx === null || draggedThumbIdx === idx) return;
      const moved = currentEditingChapterImages.splice(draggedThumbIdx, 1)[0];
      currentEditingChapterImages.splice(idx, 0, moved);
      draggedThumbIdx = null;
      renderDirectChapterGalleryThumbs();
      audio.playPop();
    });
  });

  thumbsWrap.querySelectorAll(".thumb-star-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      const picked = currentEditingChapterImages.splice(idx, 1)[0];
      currentEditingChapterImages.unshift(picked);
      currentEditingChapterImg = picked;
      const previewImg = document.getElementById("directChapterPreviewImg");
      if (previewImg) previewImg.src = picked;
      renderDirectChapterGalleryThumbs();
      audio.playSparkle();
      showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "⭐ Set as Main Photo! 💕");
    });
  });

  thumbsWrap.querySelectorAll(".thumb-move-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      const dir = parseInt(btn.getAttribute("data-dir"), 10);
      const targetIdx = idx + dir;
      if (targetIdx >= 0 && targetIdx < currentEditingChapterImages.length) {
        const temp = currentEditingChapterImages[idx];
        currentEditingChapterImages[idx] = currentEditingChapterImages[targetIdx];
        currentEditingChapterImages[targetIdx] = temp;
        renderDirectChapterGalleryThumbs();
        audio.playPop();
      }
    });
  });

  thumbsWrap.querySelectorAll(".del-photo-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      const [removed] = currentEditingChapterImages.splice(idx, 1);
      if (removed && typeof deleteFileFromDisk === "function") {
        await deleteFileFromDisk(removed);
      }
      currentEditingChapterImg = currentEditingChapterImages[0] || "";
      const previewImg = document.getElementById("directChapterPreviewImg");
      if (previewImg) {
        previewImg.src = currentEditingChapterImg || generateDefaultCitySvg(currentEditingChapterKey);
      }
      renderDirectChapterGalleryThumbs();
      audio.playPop();
    });
  });
}

function renderHighlightsPreview() {
  const highlightsInput = document.getElementById("directChapterHighlights");
  const previewEl = document.getElementById("directChapterHighlightsPreview");
  if (!previewEl || !highlightsInput) return;
  const lines = highlightsInput.value.split("\n")
    .map(s => s.replace(/^[✨•\-\*]\s*/, '').trim())
    .filter(Boolean);
  if (lines.length === 0) {
    previewEl.innerHTML = '<span class="gallery-empty-hint">Type highlights above (one per line) to preview live pills ✨</span>';
    return;
  }
  previewEl.innerHTML = lines.map(h => `<span class="timeline-pill">✨ ${h}</span>`).join("");
}

function openDirectChapterEditor(chapterIdOrCityKey, fallbackCityKey) {
  if (typeof isAdminEditAllowed === "function" && !isAdminEditAllowed()) return;
  currentEditingChapterKey = chapterIdOrCityKey || "guangzhou";
  currentEditingChapterFallback = fallbackCityKey || currentEditingChapterKey;

  const isIframe = window.parent && window.parent !== window;
  if (isIframe) {
    window.parent.postMessage({
      type: "SELECT_WIDGET",
      widgetId: "timeline",
      chapterId: currentEditingChapterKey,
      cityKey: currentEditingChapterFallback
    }, "*");
    return;
  }

  const modal = document.getElementById("directChapterModal");
  if (!modal) return;

  const modalTitle = document.getElementById("directChapterModalTitle");
  const modalSub = document.getElementById("directChapterModalSub");
  const titleInput = document.getElementById("directChapterTitle");
  const previewImg = document.getElementById("directChapterPreviewImg");
  const fileInput = document.getElementById("directChapterFile");
  const captionInput = document.getElementById("directChapterCaption");
  const descInput = document.getElementById("directChapterDesc");
  const highlightsInput = document.getElementById("directChapterHighlights");

  if (fileInput) fileInput.value = "";

  const chapters = getActiveTimelineChapters();
  const ch = chapters.find(c => c.id === currentEditingChapterKey || c.cityKey === currentEditingChapterKey);
  const cityKey = ch ? ch.cityKey : (fallbackCityKey || currentEditingChapterKey);
  const story = (typeof CITY_STORIES !== "undefined" ? CITY_STORIES[cityKey] : null) || { title: currentEditingChapterKey, desc: "" };
  const photoData = getCityPhotoData(currentEditingChapterKey, cityKey);

  if (modalTitle) modalTitle.textContent = `Edit Chapter: ${ch ? (ch.title || ch.id) : (story.title || currentEditingChapterKey)}`;
  if (modalSub) modalSub.textContent = `Customize photos, caption, story & highlight pills for this destination.`;
  if (titleInput) titleInput.value = (ch && ch.title) ? ch.title : (story.title || "");
  if (captionInput) captionInput.value = (ch && ch.caption !== undefined) ? ch.caption : ((photoData.caption && photoData.caption.trim()) ? photoData.caption : "");
  if (descInput) descInput.value = (ch && ch.desc !== undefined) ? ch.desc : ((photoData.desc && photoData.desc.trim()) ? photoData.desc : (story.desc || ""));

  const activeHighlights = (ch && Array.isArray(ch.highlights))
    ? ch.highlights
    : ((photoData.highlights && photoData.highlights.length > 0) ? photoData.highlights : []);
  if (highlightsInput) {
    highlightsInput.value = activeHighlights.join("\n");
  }
  renderHighlightsPreview();

  currentEditingChapterImages = (ch && Array.isArray(ch.images) && ch.images.length > 0)
    ? [...ch.images]
    : ((photoData.images && photoData.images.length > 0)
      ? [...photoData.images]
      : ((ch && ch.img) ? [ch.img] : ((photoData.img && !photoData.img.startsWith("data:image/svg+xml")) ? [photoData.img] : [])));
  currentEditingChapterImg = currentEditingChapterImages[0] || "";

  if (previewImg) {
    previewImg.src = currentEditingChapterImg || photoData.svgFallback || generateDefaultCitySvg(currentEditingChapterKey);
  }
  renderDirectChapterGalleryThumbs();

  modal.classList.remove("hidden");
  if (titleInput) setTimeout(() => titleInput.focus(), 80);
}

function closeDirectChapterEditor() {
  const modal = document.getElementById("directChapterModal");
  if (modal) modal.classList.add("hidden");
}

function initDirectChapterEditor() {
  const modal = document.getElementById("directChapterModal");
  if (!modal || modal.dataset.initialized === "true") return;
  modal.dataset.initialized = "true";

  const fileInput = document.getElementById("directChapterFile");
  const previewImg = document.getElementById("directChapterPreviewImg");
  const dropZone = document.getElementById("directChapterDropZone");
  const closeBtn = document.getElementById("closeDirectChapterModal");
  const cancelBtn = document.getElementById("cancelDirectChapterBtn");
  const backdrop = document.getElementById("directChapterBackdrop");
  const saveBtn = document.getElementById("saveDirectChapterBtn");
  const resetBtn = document.getElementById("resetDirectChapterBtn");
  const highlightsInput = document.getElementById("directChapterHighlights");
  const setMainBtn = document.getElementById("setAsMainPhotoBtn");

  if (setMainBtn) {
    setMainBtn.addEventListener("click", () => {
      const idx = currentEditingChapterImages.indexOf(currentEditingChapterImg);
      if (idx > 0) {
        const picked = currentEditingChapterImages.splice(idx, 1)[0];
        currentEditingChapterImages.unshift(picked);
        currentEditingChapterImg = picked;
        renderDirectChapterGalleryThumbs();
        audio.playSparkle();
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "⭐ Set as Main Photo! 💕");
      }
    });
  }

  if (highlightsInput) {
    highlightsInput.addEventListener("input", renderHighlightsPreview);
  }

  const applyChapterImages = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter(f => f && f.type && f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    let addedCount = 0;
    for (const file of fileList) {
      const optimized = await optimizeImage(file);
      if (optimized) {
        currentEditingChapterImages.push(optimized);
        currentEditingChapterImg = optimized;
        addedCount++;
      }
    }
    if (previewImg) previewImg.src = currentEditingChapterImg || "";
    renderDirectChapterGalleryThumbs();
    audio.playSparkle();
    showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, `📷 ${addedCount} photo(s) added! 💕`);
  };

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files.length > 0) {
        applyChapterImages(fileInput.files);
      }
    });
  }

  document.addEventListener("paste", async (e) => {
    if (!modal || modal.classList.contains("hidden")) return;
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;
    const pastedFiles = [];
    for (const item of items) {
      if (item.type && item.type.indexOf("image") !== -1) {
        pastedFiles.push(item.getAsFile());
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      await applyChapterImages(pastedFiles);
    }
  });

  if (dropZone) {
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); e.stopPropagation(); });
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) applyChapterImages(files);
    });
  }

  [closeBtn, cancelBtn, backdrop].forEach(el => {
    if (el) {
      el.addEventListener("click", () => {
        closeDirectChapterEditor();
        audio.playPop();
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const lb = document.getElementById("photoLightbox");
    if (lb && !lb.classList.contains("hidden")) return;
    closeDirectChapterEditor();
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const titleInput = document.getElementById("directChapterTitle");
      const captionInput = document.getElementById("directChapterCaption");
      const descInput = document.getElementById("directChapterDesc");
      const title = titleInput ? titleInput.value.trim() : "";
      const caption = captionInput ? captionInput.value.trim() : "";
      const desc = descInput ? descInput.value.trim() : "";
      const parsedHighlights = highlightsInput
        ? highlightsInput.value.split("\n").map(s => s.replace(/^[✨•\-\*]\s*/, '').trim()).filter(Boolean)
        : undefined;

      saveBtn.disabled = true;
      saveBtn.innerHTML = "<span>⏳ Saving...</span>";

      try {
        await saveCityPhotoData(currentEditingChapterKey, currentEditingChapterImages, caption, desc, currentEditingChapterFallback, parsedHighlights, title);

        const refreshed = getCityPhotoData(currentEditingChapterKey, currentEditingChapterFallback);
        if (refreshed && Array.isArray(refreshed.images)) {
          currentEditingChapterImages = [...refreshed.images];
          currentEditingChapterImg = refreshed.images[0] || "";
        }

        const chapters = getActiveTimelineChapters();
        const ch = chapters.find(c => c.id === currentEditingChapterKey || c.cityKey === currentEditingChapterKey);
        if (ch) {
          if (title) ch.title = title;
          if (caption !== undefined) ch.caption = caption;
          if (desc !== undefined) ch.desc = desc;
          if (parsedHighlights) ch.highlights = parsedHighlights;
          ch.images = [...currentEditingChapterImages];
          ch.img = currentEditingChapterImages[0] || "";
        }

        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: "SYNC_CHAPTER",
            chapterId: ch ? ch.id : currentEditingChapterKey,
            chapter: {
              id: ch ? ch.id : currentEditingChapterKey,
              title: (ch && ch.title) || title || "",
              caption: (ch && ch.caption) || caption || "",
              desc: (ch && ch.desc) || desc || "",
              highlights: (ch && ch.highlights) || parsedHighlights || [],
              images: currentEditingChapterImages,
              img: currentEditingChapterImages[0] || ""
            }
          }, window.location.origin);
        }

        renderTimeline();

        const detailModal = document.getElementById("storyChapterDetailModal");
        if (detailModal && !detailModal.classList.contains("hidden")) {
          if (typeof openStoryChapterDetailModal === "function") {
            openStoryChapterDetailModal(currentEditingChapterKey, currentEditingChapterFallback);
          }
        }

        const mapModal = document.getElementById("mapStoryModal");
        if (mapModal && !mapModal.classList.contains("hidden")) {
          const storyImg = document.getElementById("mapStoryImg");
          const storyCap = document.getElementById("mapStoryCaption");
          const popupDesc = document.getElementById("mapPopupDesc");
          if (storyImg) storyImg.src = refreshed.img;
          if (storyCap) storyCap.textContent = refreshed.caption;
          if (popupDesc) popupDesc.textContent = refreshed.desc;
        }

        closeDirectChapterEditor();
        audio.playChimeCascade();
        particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "🗺️ Story, highlights & photos saved! 💕");
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "<span>💾 Save Chapter Story</span>";
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      let photos = {};
      try {
        const saved = localStorage.getItem("gf_city_photos");
        if (saved) {
          photos = JSON.parse(saved);
          const toDeleteImgs = new Set(currentEditingChapterImages);
          if (photos[currentEditingChapterKey]) {
            const item = photos[currentEditingChapterKey];
            if (Array.isArray(item.images)) item.images.forEach(im => toDeleteImgs.add(im));
            if (item.img) toDeleteImgs.add(item.img);
          }
          if (typeof deleteFileFromDisk === "function") {
            for (const im of toDeleteImgs) {
              if (im) await deleteFileFromDisk(im);
            }
          }
          delete photos[currentEditingChapterKey];
          if (currentEditingChapterFallback) delete photos[currentEditingChapterFallback];
          localStorage.setItem("gf_city_photos", JSON.stringify(photos));
        }
      } catch (e) {}
      delete LOCAL_IMG_CACHE[`city_${currentEditingChapterKey}`];
      delete LOCAL_IMG_CACHE[currentEditingChapterKey];
      await saveImageToLocalDb(`city_${currentEditingChapterKey}`, null);
      await saveImageToLocalDb(currentEditingChapterKey, null);
      if (currentEditingChapterFallback) {
        delete LOCAL_IMG_CACHE[`city_${currentEditingChapterFallback}`];
        delete LOCAL_IMG_CACHE[currentEditingChapterFallback];
        await saveImageToLocalDb(`city_${currentEditingChapterFallback}`, null);
        await saveImageToLocalDb(currentEditingChapterFallback, null);
      }
      for (let i = 1; i <= 25; i++) {
        delete LOCAL_IMG_CACHE[`city_${currentEditingChapterKey}_${i}`];
        delete LOCAL_IMG_CACHE[`${currentEditingChapterKey}_${i}`];
        await saveImageToLocalDb(`city_${currentEditingChapterKey}_${i}`, null);
        await saveImageToLocalDb(`${currentEditingChapterKey}_${i}`, null);
        if (currentEditingChapterFallback) {
          delete LOCAL_IMG_CACHE[`city_${currentEditingChapterFallback}_${i}`];
          delete LOCAL_IMG_CACHE[`${currentEditingChapterFallback}_${i}`];
          await saveImageToLocalDb(`city_${currentEditingChapterFallback}_${i}`, null);
          await saveImageToLocalDb(`${currentEditingChapterFallback}_${i}`, null);
        }
        if (typeof deleteFileFromDisk === "function") {
          await deleteFileFromDisk(`${currentEditingChapterKey}_${i}.jpg`);
          if (currentEditingChapterFallback && currentEditingChapterFallback !== currentEditingChapterKey) {
            await deleteFileFromDisk(`${currentEditingChapterFallback}_${i}.jpg`);
          }
        }
      }
      if (typeof deleteFileFromDisk === "function") {
        await deleteFileFromDisk(`${currentEditingChapterKey}.jpg`);
        if (currentEditingChapterFallback && currentEditingChapterFallback !== currentEditingChapterKey) {
          await deleteFileFromDisk(`${currentEditingChapterFallback}.jpg`);
        }
      }
      if (typeof saveToComputer === "function") {
        await saveToComputer({ gf_city_photos: JSON.stringify(photos) });
      }
      renderTimeline();

      const detailModal = document.getElementById("storyChapterDetailModal");
      if (detailModal && !detailModal.classList.contains("hidden")) {
        if (typeof openStoryChapterDetailModal === "function") {
          openStoryChapterDetailModal(currentEditingChapterKey, currentEditingChapterFallback);
        }
      }

      const mapModal = document.getElementById("mapStoryModal");
      if (mapModal && !mapModal.classList.contains("hidden")) {
        const refreshed = getCityPhotoData(currentEditingChapterKey, currentEditingChapterFallback);
        const storyImg = document.getElementById("mapStoryImg");
        const storyCap = document.getElementById("mapStoryCaption");
        const popupDesc = document.getElementById("mapPopupDesc");
        if (storyImg) storyImg.src = refreshed.img;
        if (storyCap) storyCap.textContent = refreshed.caption;
        if (popupDesc) popupDesc.textContent = refreshed.desc;
      }

      closeDirectChapterEditor();
      audio.playPop();
      showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "🔄 Reset chapter to default illustration.");
    });
  }

  const downloadBtn = document.getElementById("downloadDirectChapterBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      if (!currentEditingChapterImg) return;
      const targetName = `${currentEditingChapterFallback || currentEditingChapterKey}.jpg`;
      const ok = await saveFileToDisk(currentEditingChapterImg, targetName);
      if (ok) {
        audio.playChimeCascade();
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, `📥 Saved ${targetName} for images/ folder! 💕`);
      }
    });
  }
}
