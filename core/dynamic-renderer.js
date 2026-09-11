/**
 * Dynamic Modular Layout Renderer for Decomposed Production Widgets
 * Takes tenant config and renders active widgets in exact specified order,
 * then initializes their respective interactive event loops.
 */
if (typeof escapeHtml !== "function") {
  window.escapeHtml = function(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
}
if (typeof safeVal !== "function") {
  window.safeVal = function(v) {
    return String(v == null ? "" : v).replace(/"/g, "&quot;");
  };
}

class DynamicRenderer {
  constructor(containerId = "modularGridContainer") {
    this.container = document.getElementById(containerId);
  }

  ensureWidgetAssets(layoutOrder = []) {
    if (typeof document === "undefined" || !document.head) return;
    const registry = (typeof WIDGET_REGISTRY !== "undefined") ? WIDGET_REGISTRY : (typeof window !== "undefined" && window.WIDGET_REGISTRY ? window.WIDGET_REGISTRY : {});
    layoutOrder.forEach(widgetId => {
      const manifest = registry[widgetId];
      if (!manifest) return;
      if (manifest.css && !document.querySelector(`link[data-widget-css="${widgetId}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = manifest.css;
        link.dataset.widgetCss = widgetId;
        document.head.appendChild(link);
      }
    });
  }

  render(config) {
    if (!this.container) return;
    this.container.innerHTML = "";
    const { layoutOrder = [], sectionsData = {} } = config;
    const isEmptyLayout = Array.isArray(layoutOrder) && layoutOrder.length === 0;

    if (isEmptyLayout) {
      if (typeof document !== "undefined") {
        document.body.classList.add("letter-unsealed");
        const env = document.getElementById("envelopeScreen");
        if (env) {
          env.classList.add("opened");
          env.style.display = "none";
        }
        const app = document.getElementById("modularGridContainer") || document.getElementById("mainApp");
        if (app) app.classList.add("app-revealed");
        const bgAudio = document.getElementById("bgAudioPlayer");
        if (bgAudio) {
          bgAudio.pause();
          bgAudio.currentTime = 0;
          bgAudio.src = "";
        }
      }
      if (typeof window !== "undefined" && typeof window.stopMusic === "function") {
        try { window.stopMusic(); } catch (e) {}
      }
    }

    this.ensureWidgetAssets(layoutOrder);

    // Sync global data objects
    const hero = sectionsData.hero || {};
    const effectiveTitle = hero.pageTitle || `${hero.partner1 || 'Alex'} & ${hero.partner2 || 'Sam'} | Our Love Story ❤️`;
    if (typeof document !== "undefined") document.title = effectiveTitle;

    if (typeof state !== "undefined") {
      if (hero.partner2) state.partnerName = hero.partner2;
      if (hero.partner1) state.senderName = hero.partner1;
      if (hero.anniversaryDate) {
        state.startDate = hero.anniversaryDate;
        const daysEl = document.getElementById("daysTogetherCount");
        if (daysEl) {
          const start = new Date(hero.anniversaryDate).getTime();
          if (!isNaN(start)) {
            daysEl.textContent = Math.floor(Math.max(0, Date.now() - start) / (1000 * 60 * 60 * 24));
          }
        }
      }
      if (hero.voiceAudio && !isEmptyLayout) {
        state.voiceAudio = hero.voiceAudio;
        const voiceAudio = document.getElementById("voiceAudioPlayer");
        if (voiceAudio && !voiceAudio.src.endsWith(hero.voiceAudio)) {
          voiceAudio.src = hero.voiceAudio;
          voiceAudio.load();
        }
      }
      if (hero.musicTrackUrl && !isEmptyLayout) {
        state.customMusicAudio = hero.musicTrackUrl;
        const bgAudio = document.getElementById("bgAudioPlayer");
        if (bgAudio) {
          const wasPlaying = !bgAudio.paused;
          if (!bgAudio.src.endsWith(hero.musicTrackUrl)) {
            bgAudio.src = hero.musicTrackUrl;
            bgAudio.load();
            if (wasPlaying) bgAudio.play().catch(() => {});
          }
        }
        if (typeof window.selectAndPlaySong === "function") {
          window.selectAndPlaySong({
            src: hero.musicTrackUrl,
            title: hero.musicTrackTitle || "Soundtrack",
            artist: "Soundtrack",
            start: 0
          });
        }
      }
      if (hero.musicTrackTitle) {
        const floatingTitle = document.querySelector(".song-title");
        if (floatingTitle) floatingTitle.textContent = hero.musicTrackTitle;
      }
      if (sectionsData.letter) {
        const letObj = typeof sectionsData.letter === "string" ? { body: sectionsData.letter } : sectionsData.letter;
        window.LETTER_DATA = letObj;
        if (letObj.body) state.letter = letObj.body;
        if (letObj.sender) state.senderName = letObj.sender;
        if (letObj.recipient) state.partnerName = letObj.recipient;
        if (letObj.audioUrl) state.letterAudio = letObj.audioUrl;
      }
      if (sectionsData.memories) {
        const mems = Array.isArray(sectionsData.memories)
          ? sectionsData.memories
          : (Array.isArray(sectionsData.memories.items) ? sectionsData.memories.items : null);
        if (mems) {
          const seen = new Set();
          state.memories = mems.filter(m => m && m.id && !seen.has(m.id) && seen.add(m.id));
        }
      }
    }
    if (typeof DEFAULTS !== "undefined") {
      if (hero.partner2) DEFAULTS.partnerName = hero.partner2;
      if (hero.partner1) DEFAULTS.senderName = hero.partner1;
      if (hero.anniversaryDate) DEFAULTS.startDate = hero.anniversaryDate;
    }
    if (sectionsData.reasons && Array.isArray(sectionsData.reasons)) {
      window.REASONS = sectionsData.reasons;
    }
    if (sectionsData.timeline) {
      const chs = Array.isArray(sectionsData.timeline)
        ? sectionsData.timeline
        : (Array.isArray(sectionsData.timeline.chapters) ? sectionsData.timeline.chapters : null);
      if (chs) {
        window.TIMELINE_CHAPTERS = chs;
        if (typeof TIMELINE_CHAPTERS !== "undefined") {
          try { TIMELINE_CHAPTERS = chs; } catch (e) {}
        }
        try {
          let photos = {};
          const saved = localStorage.getItem("gf_city_photos");
          if (saved) photos = JSON.parse(saved) || {};
          chs.forEach(c => {
            if (c && c.id) {
              photos[c.id] = {
                title: c.title || "",
                caption: c.caption || "",
                desc: c.desc || "",
                highlights: Array.isArray(c.highlights) ? c.highlights : [],
                images: Array.isArray(c.images) ? c.images : (c.img ? [c.img] : []),
                img: (c.images && c.images[0]) || c.img || ""
              };
              if (typeof LOCAL_IMG_CACHE !== "undefined") {
                delete LOCAL_IMG_CACHE[`city_${c.id}`];
                delete LOCAL_IMG_CACHE[c.id];
                for (let i = 0; i <= 30; i++) {
                  delete LOCAL_IMG_CACHE[`city_${c.id}_${i}`];
                  delete LOCAL_IMG_CACHE[`${c.id}_${i}`];
                }
              }
              const dbSaver = (typeof window !== "undefined" && window.saveImageToLocalDb) || (typeof saveImageToLocalDb === "function" ? saveImageToLocalDb : null);
              if (dbSaver) {
                dbSaver(`city_${c.id}`, null);
                dbSaver(c.id, null);
                for (let i = 0; i <= 30; i++) {
                  dbSaver(`city_${c.id}_${i}`, null);
                  dbSaver(`${c.id}_${i}`, null);
                }
              }
            }
          });
          localStorage.setItem("gf_city_photos", JSON.stringify(photos));
        } catch (e) {}

        const directModal = document.getElementById("directChapterModal");
        if (directModal && !directModal.classList.contains("hidden") && typeof currentEditingChapterKey !== "undefined") {
          const currentCh = chs.find(c => c.id === currentEditingChapterKey || c.cityKey === currentEditingChapterKey);
          if (currentCh) {
            const titleIn = document.getElementById("directChapterTitle");
            const capIn = document.getElementById("directChapterCaption");
            const descIn = document.getElementById("directChapterDesc");
            const hlIn = document.getElementById("directChapterHighlights");
            if (titleIn && document.activeElement !== titleIn) titleIn.value = currentCh.title || "";
            if (capIn && document.activeElement !== capIn) capIn.value = currentCh.caption || "";
            if (descIn && document.activeElement !== descIn) descIn.value = currentCh.desc || "";
            if (hlIn && document.activeElement !== hlIn) {
              hlIn.value = (currentCh.highlights || []).join("\n");
              if (typeof renderHighlightsPreview === "function") renderHighlightsPreview();
            }
          }
        }
      }
    }
    if (sectionsData.map && sectionsData.map.stories) {
      window.CITY_STORIES = { ...(typeof CITY_STORIES !== "undefined" ? CITY_STORIES : {}), ...sectionsData.map.stories };
      if (typeof CITY_STORIES !== "undefined") {
        try { CITY_STORIES = window.CITY_STORIES; } catch (e) {}
      }
    }
    if (sectionsData.coupons) {
      const cps = Array.isArray(sectionsData.coupons)
        ? sectionsData.coupons
        : (Array.isArray(sectionsData.coupons.items) ? sectionsData.coupons.items : null);
      if (cps) window.COUPONS = cps;
    }
    if (sectionsData.quiz) {
      const qz = Array.isArray(sectionsData.quiz)
        ? sectionsData.quiz
        : (Array.isArray(sectionsData.quiz.items) ? sectionsData.quiz.items : null);
      if (qz) {
        window.QUIZ_QUESTIONS = qz;
        if (typeof TRIVIA_QUESTIONS !== "undefined") {
          try { TRIVIA_QUESTIONS = qz; } catch (e) {}
        }
      }
      const cert = Array.isArray(sectionsData.quiz) ? {} : sectionsData.quiz;
      window.QUIZ_CERT_DATA = cert;
      const certModalTitle = document.getElementById("certModalTitle");
      if (certModalTitle && cert.certTitle) certModalTitle.textContent = cert.certTitle;
      const certModalAwardee = document.getElementById("certModalAwardee");
      if (certModalAwardee && cert.certAwardee) certModalAwardee.innerHTML = `${cert.certAwardee} <strong class="partner-name-display">${document.querySelector(".partner-name-display")?.textContent || "Ella"}</strong>`;
      const certModalBody = document.getElementById("certModalBody");
      if (certModalBody && cert.certBody) certModalBody.innerHTML = cert.certBody;
      const certModalFooterPrefix = document.getElementById("certModalFooterPrefix");
      if (certModalFooterPrefix && cert.certFooter) certModalFooterPrefix.textContent = cert.certFooter;
      const certSenderName = document.getElementById("certSenderName");
      if (certSenderName && cert.certSender) certSenderName.textContent = cert.certSender;
    }
    if (sectionsData.spinner) {
      window.SPINNER_OPTIONS = sectionsData.spinner;
    }
    if (sectionsData.truth_dare) {
      window.TRUTH_DARE_DATA = sectionsData.truth_dare;
    }
    if (sectionsData.letter) {
      const letObj = typeof sectionsData.letter === "string" ? { body: sectionsData.letter } : sectionsData.letter;
      window.LETTER_DATA = letObj;
      if (typeof state !== "undefined") {
        if (letObj.body) state.letter = letObj.body;
        if (letObj.sender) state.senderName = letObj.sender;
        if (letObj.recipient) state.partnerName = letObj.recipient;
        if (letObj.audioUrl) state.letterAudio = letObj.audioUrl;
      }
    }
    if (sectionsData.playful) {
      window.PLAYFUL_DATA = sectionsData.playful;
      const pl = sectionsData.playful;
      const celebrationEmoji = document.getElementById("celebrationEmoji");
      if (celebrationEmoji && pl.celebrationEmoji) celebrationEmoji.textContent = pl.celebrationEmoji;
      const celebrationTitle = document.getElementById("celebrationTitle");
      if (celebrationTitle && pl.celebrationTitle) celebrationTitle.textContent = pl.celebrationTitle;
      const celebrationBody = document.getElementById("celebrationBody");
      if (celebrationBody && pl.celebrationBody) celebrationBody.textContent = pl.celebrationBody;
      const celebrationBtnText = document.getElementById("celebrationBtnText");
      if (celebrationBtnText && pl.celebrationBtnText) celebrationBtnText.textContent = pl.celebrationBtnText;
    }

    // Render active widgets in ordered sequence
    const templates = (typeof window !== "undefined" && window.WIDGET_TEMPLATES) ? window.WIDGET_TEMPLATES : (typeof WIDGET_TEMPLATES !== "undefined" ? WIDGET_TEMPLATES : {});
    const urlParams = (typeof window !== "undefined" && window.location) ? new URLSearchParams(window.location.search) : null;
    const isIframe = typeof window !== "undefined" && window.parent && window.parent !== window;
    const isBuilder = (typeof document !== "undefined" && (
      document.body.classList.contains("builder-mode") ||
      document.body.classList.contains("in-builder-preview")
    )) || (isIframe && Boolean(urlParams && (urlParams.get("preview") === "builder" || urlParams.get("builder") === "1")));

    const createAddDivider = (insertIndex) => {
      const isEnd = insertIndex === layoutOrder.length;
      const divider = document.createElement("div");
      divider.className = `site-add-section-divider${isEnd ? " site-add-section-bottom" : ""}`;
      divider.dataset.insertIndex = insertIndex;
      divider.innerHTML = `
        <div class="site-add-section-line"></div>
        <button type="button" class="btn-site-add-section" data-insert-index="${insertIndex}" title="Add section here">
          <span class="btn-site-add-plus">+</span>
          <span class="btn-site-add-label">Add Section</span>
        </button>
        <div class="site-add-section-line"></div>
      `;
      const btn = divider.querySelector(".btn-site-add-section");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isIframe) {
          window.parent.postMessage({ type: "OPEN_ADD_SECTION_MODAL", insertIndex }, "*");
        } else if (typeof window.openAddSectionModal === "function") {
          window.openAddSectionModal(insertIndex);
        }
      });
      return divider;
    };

    if (isBuilder && layoutOrder.length === 0) {
      this.container.appendChild(createAddDivider(0));
    }

    layoutOrder.forEach((widgetId, index) => {
      if (isBuilder && index === 0) {
        this.container.appendChild(createAddDivider(0));
      }

      const templateFn = templates[widgetId];
      if (typeof templateFn === "function") {
        const wrapper = document.createElement("div");
        wrapper.className = `widget-module-wrap widget-wrap-${widgetId}`;
        wrapper.innerHTML = templateFn(sectionsData[widgetId] || sectionsData, sectionsData.hero || sectionsData);
        const el = wrapper.firstElementChild || wrapper;
        if (!el.id) el.id = "section-" + widgetId;
        el.dataset.widgetId = widgetId;

        if (isBuilder) {
          const reg = (typeof WIDGET_REGISTRY !== "undefined" && WIDGET_REGISTRY[widgetId]) ? WIDGET_REGISTRY[widgetId] : { title: widgetId, icon: "🧩" };
          const toolbar = document.createElement("div");
          toolbar.className = "site-section-admin-toolbar";
          toolbar.innerHTML = `
            <span class="site-section-badge">${reg.icon || "🧩"} ${escapeHtml(reg.title || widgetId)}</span>
            <button type="button" class="btn-site-remove-section" data-remove-widget="${widgetId}" title="Remove this section from website">
              <span>✕</span> Remove
            </button>
          `;
          const removeBtn = toolbar.querySelector(".btn-site-remove-section");
          removeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isIframe) {
              window.parent.postMessage({ type: "REMOVE_WIDGET", widgetId }, "*");
            } else if (typeof window.removeWidgetFromSite === "function") {
              window.removeWidgetFromSite(widgetId);
            }
          };
          el.style.position = "relative";
          el.prepend(toolbar);
        }

        this.container.appendChild(el);
      }

      if (isBuilder) {
        this.container.appendChild(createAddDivider(index + 1));
      }
    });

    this.initInteractiveEngines(sectionsData, layoutOrder);
  }

  initInteractiveEngines(sectionsData, layoutOrder = []) {
    const isIframe = typeof window !== "undefined" && window.parent && window.parent !== window;
    if (isIframe && typeof particles !== "undefined" && particles.particles) {
      particles.particles = [];
    }

    // 1. Core DOM bindings and text displays
    if (typeof renderDOM === "function") {
      try { renderDOM(); } catch (e) { console.warn("renderDOM error:", e); }
    }

    // 2. Love Deck & Reasons
    if (layoutOrder.includes("reasons")) {
      if (typeof setupReasonsDeck === "function") try { setupReasonsDeck(); } catch (e) {}
      if (typeof setupEditAllReasonsModal === "function") try { setupEditAllReasonsModal(); } catch (e) {}
      if (typeof updateFilterCounts === "function") try { updateFilterCounts(); } catch (e) {}
      if (typeof renderCurrentReason === "function") try { renderCurrentReason(false); } catch (e) {}
      if (typeof renderAllNotesDrawer === "function") try { renderAllNotesDrawer(); } catch (e) {}
    }

    // 3. Timeline Chapters & Direct Editor
    if (layoutOrder.includes("timeline")) {
      if (typeof renderTimeline === "function") try { renderTimeline(); } catch (e) {}
      if (typeof initDirectChapterEditor === "function") try { initDirectChapterEditor(); } catch (e) {}
    }

    // 4. Illustrated Interactive Map
    if (layoutOrder.includes("map")) {
      if (typeof setupInteractiveMap === "function") try { setupInteractiveMap(); } catch (e) {}
    }

    // 5. Memories & Polaroids & Direct Editor
    if (layoutOrder.includes("memories")) {
      if (typeof renderPolaroids === "function") try { renderPolaroids(); } catch (e) {}
      if (typeof initDirectMemoryEditor === "function") try { initDirectMemoryEditor(); } catch (e) {}
    }

    // 6. Scratch Coupons
    if (layoutOrder.includes("coupons")) {
      if (typeof renderScratchCoupons === "function") try { renderScratchCoupons(); } catch (e) {}
    }

    // 7. Truth or Dare
    if (layoutOrder.includes("truth_dare")) {
      if (typeof setupTruthOrDareGame === "function") try { setupTruthOrDareGame(sectionsData.truth_dare, sectionsData.hero); } catch (e) {}
    }

    // 8. Date Night Spinner
    if (layoutOrder.includes("spinner")) {
      if (typeof setupDateSpinner === "function") try { setupDateSpinner(sectionsData.spinner, sectionsData.hero); } catch (e) {}
    }

    // 9. Boarding Pass & Adventure Picker
    if (layoutOrder.includes("boarding_pass")) {
      if (typeof setupGiftBox === "function") try { setupGiftBox(); } catch (e) {}
    }

    // 10. Quiz Trivia Challenge
    if (layoutOrder.includes("quiz")) {
      if (typeof renderQuizStep === "function") try { renderQuizStep(); } catch (e) {}
    }

    // 11. Love Meter
    if (layoutOrder.includes("love_meter")) {
      if (typeof setupLoveMeter === "function") try { setupLoveMeter(); } catch (e) {}
    }

    // 12. Love Letter
    if (layoutOrder.includes("letter")) {
      if (typeof setupLoveLetterFeatures === "function") try { setupLoveLetterFeatures(); } catch (e) {}
    }

    // 13. Playful Game
    if (layoutOrder.includes("playful")) {
      if (typeof setupPlayfulGame === "function") try { setupPlayfulGame(); } catch (e) {}
    }

    // 14. Candle Blow-Out
    if (layoutOrder.includes("candle_blowout")) {
      if (typeof setupCandleBlowout === "function") try { setupCandleBlowout(sectionsData.candle_blowout); } catch (e) {}
    }

    // 15. Milestone Life Stats
    if (layoutOrder.includes("milestone_stats")) {
      if (typeof setupMilestoneStats === "function") try { setupMilestoneStats(sectionsData.milestone_stats, sectionsData.hero); } catch (e) {}
    }

    // 16. 3D Surprise Gift Unboxer
    if (layoutOrder.includes("gift_unboxer")) {
      if (typeof setupGiftUnboxer === "function") try { setupGiftUnboxer(sectionsData.gift_unboxer); } catch (e) {}
    }

    // 17. Roast & Toast Wheel
    if (layoutOrder.includes("roast_toast")) {
      if (typeof setupRoastToast === "function") try { setupRoastToast(sectionsData.roast_toast); } catch (e) {}
    }

    // 18. Guestbook Wish Wall
    if (layoutOrder.includes("guestbook")) {
      if (typeof setupGuestbook === "function") try { setupGuestbook(sectionsData.guestbook); } catch (e) {}
    }

    // 19. Party Jukebox
    if (layoutOrder.includes("party_jukebox")) {
      if (typeof setupPartyJukebox === "function") try { setupPartyJukebox(sectionsData.party_jukebox); } catch (e) {}
    }

    // 20. Tenure Ticker
    if (layoutOrder.includes("tenure_ticker")) {
      if (typeof setupTenureTicker === "function") try { setupTenureTicker(sectionsData.tenure_ticker, sectionsData.hero); } catch (e) {}
    }

    // 21. Night Sky Star Map
    if (layoutOrder.includes("star_map")) {
      if (typeof setupStarMap === "function") try { setupStarMap(sectionsData.star_map, sectionsData.hero); } catch (e) {}
    }

    // 22. Then vs. Now Slider
    if (layoutOrder.includes("then_now_slider")) {
      if (typeof setupThenNowSlider === "function") try { setupThenNowSlider(sectionsData.then_now_slider, sectionsData.hero); } catch (e) {}
    }

    // 23. Couple Bucket List
    if (layoutOrder.includes("bucket_list")) {
      if (typeof setupBucketList === "function") try { setupBucketList(sectionsData.bucket_list, sectionsData.hero); } catch (e) {}
    }

    // 24. Audio Time Capsule
    if (layoutOrder.includes("audio_capsule")) {
      if (typeof setupAudioCapsule === "function") try { setupAudioCapsule(sectionsData.audio_capsule, sectionsData.hero); } catch (e) {}
    }

    // 25. Milestone Odyssey
    if (layoutOrder.includes("milestone_odyssey")) {
      if (typeof setupMilestoneOdyssey === "function") try { setupMilestoneOdyssey(sectionsData.milestone_odyssey, sectionsData.hero); } catch (e) {}
    }

    // 14. Audio, Vinyl Disc, & Equalizer
    if (typeof setupAudioVisualizerAndVolume === "function" && layoutOrder.length > 0) {
      try { setupAudioVisualizerAndVolume(); } catch (e) {}
    }

    // 15. Hero Live Quintillions, LDR Clocks, Hub & Voice Note Player
    if (layoutOrder.includes("hero")) {
      if (typeof setupQuintillionObserver === "function") {
        try { setupQuintillionObserver(); } catch (e) {}
      }
      if (typeof updateQuintillionLive === "function") {
        try { updateQuintillionLive(); } catch (e) {}
      }
      if (typeof updateLDRClocks === "function") {
        try { updateLDRClocks(); } catch (e) {}
      }
      if (typeof setupLoveConnectionHub === "function") {
        try { setupLoveConnectionHub(); } catch (e) {}
      }
      if (typeof setupVoiceNotePlayer === "function") {
        try { setupVoiceNotePlayer(); } catch (e) {}
      }
    }

    // 17. Bind in-place edit buttons & parent iframe sync
    this.bindDynamicEditTriggers();
  }

  bindDynamicEditTriggers() {
    const isIframe = window.parent && window.parent !== window;

    // Edit All Reasons buttons
    const editReasonsHeaderBtn = document.getElementById("editReasonsHeaderBtn");
    const editCurrentReasonBtn = document.getElementById("editCurrentReasonBtn");
    [editReasonsHeaderBtn, editCurrentReasonBtn].forEach(btn => {
      if (btn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          if (isIframe) {
            window.parent.postMessage({ type: "SELECT_WIDGET", widgetId: "reasons" }, "*");
          }
          if (typeof openEditAllReasonsModal === "function") {
            openEditAllReasonsModal();
          }
        };
      }
    });

    // Add Memory button
    const addMemoryBtn = document.getElementById("addMemoryBtn");
    if (addMemoryBtn) {
      addMemoryBtn.onclick = (e) => {
        e.stopPropagation();
        if (isIframe) {
          window.parent.postMessage({ type: "SELECT_WIDGET", widgetId: "memories" }, "*");
        }
        if (typeof openDirectMemoryEditor === "function") {
          openDirectMemoryEditor(null);
        }
      };
    }

    // Map direct edit button
    const editCityDirectBtn = document.getElementById("editCityDirectBtn");
    if (editCityDirectBtn) {
      editCityDirectBtn.addEventListener("click", () => {
        if (isIframe) {
          window.parent.postMessage({ type: "SELECT_WIDGET", widgetId: "map" }, "*");
        }
      });
    }

    // Timeline chapter edit buttons
    document.querySelectorAll(".timeline-edit-chapter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (isIframe) {
          const item = btn.closest(".timeline-item");
          const chapterId = item ? item.id : undefined;
          window.parent.postMessage({ type: "SELECT_WIDGET", widgetId: "timeline", chapterId }, "*");
        }
      });
    });
  }
}

if (typeof window !== "undefined") {
  window.DynamicRenderer = DynamicRenderer;
}
