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
    this.currentLayoutOrder = null;
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
    const { layoutOrder = [], sectionsData = {} } = config;
    const isEmptyLayout = Array.isArray(layoutOrder) && layoutOrder.length === 0;

    const isSameLayout = Array.isArray(this.currentLayoutOrder) &&
      this.currentLayoutOrder.length === layoutOrder.length &&
      this.currentLayoutOrder.every((id, i) => id === layoutOrder[i]) &&
      this.container.children.length > 0;

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
        const bgAudio = document.getElementById("bgAudioPlayer");
        const curSrc = bgAudio ? (bgAudio.currentSrc || bgAudio.src || "") : "";
        const isSongDifferent = !curSrc || (!curSrc.endsWith(hero.musicTrackUrl) && curSrc !== hero.musicTrackUrl);
        if (isSongDifferent) {
          state.customMusicAudio = hero.musicTrackUrl;
          if (bgAudio) {
            const wasPlaying = !bgAudio.paused;
            bgAudio.src = hero.musicTrackUrl;
            bgAudio.load();
            if (wasPlaying) bgAudio.play().catch(() => {});
          }
          if (typeof window.selectAndPlaySong === "function") {
            window.selectAndPlaySong({
              src: hero.musicTrackUrl,
              title: hero.musicTrackTitle || "Soundtrack",
              artist: "Soundtrack"
            });
          }
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
    if (sectionsData.reasons) {
      window.REASONS = Array.isArray(sectionsData.reasons)
        ? sectionsData.reasons
        : (Array.isArray(sectionsData.reasons.list) ? sectionsData.reasons.list : []);
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
                Object.keys(LOCAL_IMG_CACHE).forEach(k => {
                  if (k.startsWith(`city_${c.id}`) || k.startsWith(c.id)) delete LOCAL_IMG_CACHE[k];
                });
              }
              const dbSaver = (typeof window !== "undefined" && window.saveImageToLocalDb) || (typeof saveImageToLocalDb === "function" ? saveImageToLocalDb : null);
              if (dbSaver) {
                dbSaver(`city_${c.id}`, null);
                dbSaver(c.id, null);
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

    if (isSameLayout) {
      const activeId = config.activeWidgetId || config.modifiedWidgetId;
      const isIframe = typeof window !== "undefined" && window.parent && window.parent !== window;
      const urlParams = (typeof window !== "undefined" && window.location) ? new URLSearchParams(window.location.search) : null;
      const isBuilder = (typeof document !== "undefined" && (
        document.body.classList.contains("builder-mode") ||
        document.body.classList.contains("in-builder-preview")
      )) || (isIframe && Boolean(urlParams && (urlParams.get("preview") === "builder" || urlParams.get("builder") === "1")));

      if (activeId) {
        if (activeId === "timeline") {
          const tlSec = document.getElementById("section-timeline") || document.querySelector(".timeline-section");
          if (tlSec && sectionsData.timeline && !Array.isArray(sectionsData.timeline)) {
            const t = sectionsData.timeline;
            const tagEl = tlSec.querySelector(".section-tag");
            const titleEl = tlSec.querySelector(".section-title");
            const descEl = tlSec.querySelector(".section-desc");
            if (tagEl && t.tag) tagEl.textContent = t.tag;
            if (titleEl && t.title) titleEl.textContent = t.title;
            if (descEl && t.desc) descEl.textContent = t.desc;
          }
          if (typeof renderTimeline === "function") try { renderTimeline(); } catch (e) {}
        } else if (activeId === "memories") {
          const memSec = document.getElementById("section-memories") || document.querySelector(".memories-section");
          if (memSec && sectionsData.memories && !Array.isArray(sectionsData.memories)) {
            const m = sectionsData.memories;
            const tagEl = memSec.querySelector(".section-tag");
            const titleEl = memSec.querySelector(".section-title");
            const descEl = memSec.querySelector(".section-desc");
            if (tagEl && m.tag) tagEl.textContent = m.tag;
            if (titleEl && m.title) titleEl.textContent = m.title;
            if (descEl && m.desc) descEl.textContent = m.desc;
          }
          if (typeof renderPolaroids === "function") try { renderPolaroids(); } catch (e) {}
        } else {
          this.replaceWidgetElement(activeId, sectionsData, isBuilder, isIframe);
        }
        if (activeId === "hero" && typeof renderDOM === "function") {
          try { renderDOM(); } catch (e) {}
        }
      } else {
        this.replaceWidgetElement("hero", sectionsData, isBuilder, isIframe);
        if (typeof renderDOM === "function") try { renderDOM(); } catch (e) {}
        if (typeof renderTimeline === "function") try { renderTimeline(); } catch (e) {}
        if (typeof renderPolaroids === "function") try { renderPolaroids(); } catch (e) {}
        layoutOrder.forEach((wid) => {
          if (!["timeline", "memories", "hero"].includes(wid)) {
            this.replaceWidgetElement(wid, sectionsData, isBuilder, isIframe);
          }
        });
      }

      this.bindDynamicEditTriggers();
      return;
    }

    this.currentLayoutOrder = [...layoutOrder];
    const prevScrollTop = (typeof window !== "undefined") ? (window.scrollY || document.documentElement.scrollTop || 0) : 0;
    this.container.innerHTML = "";

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
            <button type="button" class="btn-site-edit-section" data-edit-widget="${widgetId}" title="Edit this section">
              <span>✏️</span> Edit
            </button>
            <button type="button" class="btn-site-remove-section" data-remove-widget="${widgetId}" title="Remove this section from website">
              <span>✕</span> Remove
            </button>
          `;
          const editBtn = toolbar.querySelector(".btn-site-edit-section");
          editBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ type: "SELECT_WIDGET", widgetId }, "*");
            }
          };
          const removeBtn = toolbar.querySelector(".btn-site-remove-section");
          removeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.parent && window.parent !== window) {
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

    if (typeof window !== "undefined") {
      const restoreScroll = () => {
        if (prevScrollTop >= 0) {
          window.scrollTo({ top: prevScrollTop, behavior: "instant" });
        }
      };
      restoreScroll();
      requestAnimationFrame(() => {
        restoreScroll();
        this.container.style.minHeight = "";
      });
    } else {
      this.container.style.minHeight = "";
    }
  }

  replaceWidgetElement(widgetId, sectionsData = {}, isBuilder = false, isIframe = false) {
    const templates = (typeof window !== "undefined" && window.WIDGET_TEMPLATES) ? window.WIDGET_TEMPLATES : (typeof WIDGET_TEMPLATES !== "undefined" ? WIDGET_TEMPLATES : {});
    if (typeof templates[widgetId] !== "function") return false;

    const existingEl = document.getElementById("section-" + widgetId) ||
      document.querySelector(`[data-widget-id="${widgetId}"]`) ||
      document.querySelector(`.${widgetId}-section`);
    if (!existingEl) return false;

    const wrapper = document.createElement("div");
    wrapper.className = `widget-module-wrap widget-wrap-${widgetId}`;
    wrapper.innerHTML = templates[widgetId](sectionsData[widgetId] || sectionsData, sectionsData.hero || sectionsData);
    const newEl = wrapper.firstElementChild || wrapper;
    if (!newEl.id) newEl.id = "section-" + widgetId;
    newEl.dataset.widgetId = widgetId;

    if (isBuilder) {
      const reg = (typeof WIDGET_REGISTRY !== "undefined" && WIDGET_REGISTRY[widgetId]) ? WIDGET_REGISTRY[widgetId] : { title: widgetId, icon: "🧩" };
      const toolbar = document.createElement("div");
      toolbar.className = "site-section-admin-toolbar";
      toolbar.innerHTML = `
        <span class="site-section-badge">${reg.icon || "🧩"} ${escapeHtml(reg.title || widgetId)}</span>
        <button type="button" class="btn-site-edit-section" data-edit-widget="${widgetId}" title="Edit this section">
          <span>✏️</span> Edit
        </button>
        <button type="button" class="btn-site-remove-section" data-remove-widget="${widgetId}" title="Remove this section from website">
          <span>✕</span> Remove
        </button>
      `;
      const editBtn = toolbar.querySelector(".btn-site-edit-section");
      editBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "SELECT_WIDGET", widgetId }, "*");
        }
      };
      const removeBtn = toolbar.querySelector(".btn-site-remove-section");
      removeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "REMOVE_WIDGET", widgetId }, "*");
        } else if (typeof window.removeWidgetFromSite === "function") {
          window.removeWidgetFromSite(widgetId);
        }
      };
      newEl.style.position = "relative";
      newEl.prepend(toolbar);
    }

    existingEl.replaceWith(newEl);
    this.initSingleWidgetEngine(widgetId, sectionsData);
    return true;
  }

  initSingleWidgetEngine(widgetId, sectionsData = {}) {
    const hero = sectionsData?.hero;
    const engines = {
      reasons: () => {
        if (typeof setupReasonsDeck === "function") try { setupReasonsDeck(); } catch (e) {}
        if (typeof setupEditAllReasonsModal === "function") try { setupEditAllReasonsModal(); } catch (e) {}
        if (typeof updateFilterCounts === "function") try { updateFilterCounts(); } catch (e) {}
        if (typeof renderCurrentReason === "function") try { renderCurrentReason(false); } catch (e) {}
        if (typeof renderAllNotesDrawer === "function") try { renderAllNotesDrawer(); } catch (e) {}
      },
      timeline: () => {
        if (typeof renderTimeline === "function") try { renderTimeline(); } catch (e) {}
        if (typeof initDirectChapterEditor === "function") try { initDirectChapterEditor(); } catch (e) {}
      },
      map: () => {
        if (typeof setupInteractiveMap === "function") try { setupInteractiveMap(); } catch (e) {}
      },
      memories: () => {
        if (typeof renderPolaroids === "function") try { renderPolaroids(); } catch (e) {}
        if (typeof initDirectMemoryEditor === "function") try { initDirectMemoryEditor(); } catch (e) {}
      },
      coupons: () => {
        if (typeof renderScratchCoupons === "function") try { renderScratchCoupons(); } catch (e) {}
      },
      truth_dare: () => {
        if (typeof setupTruthOrDareGame === "function") try { setupTruthOrDareGame(sectionsData.truth_dare, hero); } catch (e) {}
      },
      spinner: () => {
        if (typeof setupDateSpinner === "function") try { setupDateSpinner(sectionsData.spinner, hero); } catch (e) {}
      },
      boarding_pass: () => {
        if (typeof setupGiftBox === "function") try { setupGiftBox(); } catch (e) {}
      },
      quiz: () => {
        if (typeof renderQuizStep === "function") try { renderQuizStep(); } catch (e) {}
      },
      love_meter: () => {
        if (typeof setupLoveMeter === "function") try { setupLoveMeter(); } catch (e) {}
      },
      letter: () => {
        if (typeof setupLoveLetterFeatures === "function") try { setupLoveLetterFeatures(); } catch (e) {}
      },
      playful: () => {
        if (typeof setupPlayfulGame === "function") try { setupPlayfulGame(); } catch (e) {}
      },
      candle_blowout: () => {
        if (typeof setupCandleBlowout === "function") try { setupCandleBlowout(sectionsData.candle_blowout); } catch (e) {}
      },
      milestone_stats: () => {
        if (typeof setupMilestoneStats === "function") try { setupMilestoneStats(sectionsData.milestone_stats, hero); } catch (e) {}
      },
      gift_unboxer: () => {
        if (typeof setupGiftUnboxer === "function") try { setupGiftUnboxer(sectionsData.gift_unboxer); } catch (e) {}
      },
      roast_toast: () => {
        if (typeof setupRoastToast === "function") try { setupRoastToast(sectionsData.roast_toast); } catch (e) {}
      },
      guestbook: () => {
        if (typeof setupGuestbook === "function") try { setupGuestbook(sectionsData.guestbook); } catch (e) {}
      },
      party_jukebox: () => {
        if (typeof setupPartyJukebox === "function") try { setupPartyJukebox(sectionsData.party_jukebox); } catch (e) {}
      },
      tenure_ticker: () => {
        if (typeof setupTenureTicker === "function") try { setupTenureTicker(sectionsData.tenure_ticker, hero); } catch (e) {}
      },
      star_map: () => {
        if (typeof setupStarMap === "function") try { setupStarMap(sectionsData.star_map, hero); } catch (e) {}
      },
      then_now_slider: () => {
        if (typeof setupThenNowSlider === "function") try { setupThenNowSlider(sectionsData.then_now_slider, hero); } catch (e) {}
      },
      bucket_list: () => {
        if (typeof setupBucketList === "function") try { setupBucketList(sectionsData.bucket_list, hero); } catch (e) {}
      },
      audio_capsule: () => {
        if (typeof setupAudioCapsule === "function") try { setupAudioCapsule(sectionsData.audio_capsule, hero); } catch (e) {}
      },
      milestone_odyssey: () => {
        if (typeof setupMilestoneOdyssey === "function") try { setupMilestoneOdyssey(sectionsData.milestone_odyssey, hero); } catch (e) {}
      },
      valentine_scratch: () => {
        if (typeof setupValentineScratch === "function") try { setupValentineScratch(sectionsData.valentine_scratch); } catch (e) {}
      },
      hero: () => {
        if (typeof setupQuintillionObserver === "function") try { setupQuintillionObserver(); } catch (e) {}
        if (typeof updateQuintillionLive === "function") try { updateQuintillionLive(); } catch (e) {}
        if (typeof updateLDRClocks === "function") try { updateLDRClocks(); } catch (e) {}
        if (typeof setupLoveConnectionHub === "function") try { setupLoveConnectionHub(); } catch (e) {}
        if (typeof setupVoiceNotePlayer === "function") try { setupVoiceNotePlayer(); } catch (e) {}
      }
    };
    engines[widgetId]?.();
  }

  initInteractiveEngines(sectionsData, layoutOrder = []) {
    const isIframe = typeof window !== "undefined" && window.parent && window.parent !== window;
    if (isIframe && typeof particles !== "undefined" && particles.particles) {
      particles.particles = [];
    }

    if (typeof renderDOM === "function") {
      try { renderDOM(); } catch (e) { console.warn("renderDOM error:", e); }
    }

    layoutOrder.forEach(wid => this.initSingleWidgetEngine(wid, sectionsData));

    if (typeof setupAudioVisualizerAndVolume === "function" && layoutOrder.length > 0) {
      try { setupAudioVisualizerAndVolume(); } catch (e) {}
    }

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
            return;
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
          return;
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
  }
}

if (typeof window !== "undefined") {
  window.DynamicRenderer = DynamicRenderer;

  if (typeof document !== "undefined") {
    document.addEventListener("click", (e) => {
      const editSecBtn = e.target && e.target.closest ? e.target.closest(".btn-site-edit-section") : null;
      if (editSecBtn) {
        e.preventDefault();
        e.stopPropagation();
        const wid = editSecBtn.getAttribute("data-edit-widget") || editSecBtn.dataset.editWidget;
        if (wid && window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "SELECT_WIDGET", widgetId: wid }, "*");
        }
        return;
      }
      const editChapBtn = e.target && e.target.closest ? e.target.closest(".timeline-edit-chapter-btn, .timeline-photo-edit-hint") : null;
      if (editChapBtn) {
        e.preventDefault();
        e.stopPropagation();
        const item = editChapBtn.closest(".timeline-item");
        const chId = item?.getAttribute("data-chapter-id") || item?.dataset?.id || item?.id;
        const cityKey = item?.getAttribute("data-city-key") || item?.dataset?.cityKey;
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: "SELECT_WIDGET",
            widgetId: "timeline",
            chapterId: chId,
            cityKey: cityKey
          }, "*");
        }
      }
    }, true);
  }
}
