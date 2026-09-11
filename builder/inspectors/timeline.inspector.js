/**
 * Builder Inspector Module: timeline
 * Professional, comprehensive accordion editor for journey chapters.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  const MAP_DESTINATIONS = [
    { key: "guangzhou", label: "Guangzhou (Canton Tower)", flag: "⭐", region: "China Tour" },
    { key: "shenzhen", label: "Shenzhen (Beach & Ferris Wheel)", flag: "🌆", region: "China Tour" },
    { key: "chongqing", label: "Chongqing (Mountain BBQ & Cats)", flag: "🌶️", region: "China Tour" },
    { key: "chengdu", label: "Chengdu (Panda Sanctuary)", flag: "🐼", region: "China Tour" },
    { key: "bipenggou", label: "Bipenggou (Frozen Lake)", flag: "❄️", region: "China Tour" },
    { key: "dagu", label: "Dagu Glacier (5,000m Summit)", flag: "🗻", region: "China Tour" },
    { key: "jiuzhaigou", label: "Jiuzhaigou (Turquoise Waters)", flag: "🏔️", region: "China Tour" },
    { key: "huanglong", label: "Huanglong (High Altitude Hike)", flag: "🏞️", region: "China Tour" },
    { key: "nansha", label: "Nansha Port (Road Trip & EV)", flag: "🚗", region: "China Tour" },
    { key: "wuhan", label: "Wuhan (Ancient Temple & Bikes)", flag: "🌸", region: "China Tour" },
    { key: "nanjing", label: "Nanjing (Buddha Mountain)", flag: "🛕", region: "China Tour" },
    { key: "shanghai", label: "Shanghai (Turkish Feast & Skyline)", flag: "🌃", region: "China Tour" },
    { key: "algeria", label: "Algeria (Boyfriend's Origin)", flag: "🇩🇿", region: "Global Flight Route" },
    { key: "china-base", label: "China Base (Where We Met)", flag: "🇨🇳", region: "Global Flight Route" },
    { key: "vietnam", label: "Vietnam (16h Layover)", flag: "🇻🇳", region: "Global Flight Route" },
    { key: "indonesia", label: "Indonesia (Girl's Origin)", flag: "🇮🇩", region: "Global Flight Route" },
    { key: "bali", label: "Bali (Beaches, Villa & ATV)", flag: "🌴", region: "Indonesia Tour" },
    { key: "jakarta", label: "Jakarta (Home, Indomie & Tekken)", flag: "🏡", region: "Indonesia Tour" }
  ];

  let expandedChapterIds = new Set();

  window.WIDGET_INSPECTORS["timeline"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      deleteAssetFromR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {},
      openMediaPicker = null
    } = ctx || {};

    let timelineData = state.sectionsData.timeline;
    if (!timelineData) {
      timelineData = state.sectionsData.timeline = {};
    }
    const isObject = !Array.isArray(timelineData);
    const timelineTag = isObject ? (timelineData.tag || "Our Chronological Story") : "Our Chronological Story";
    const timelineTitle = isObject ? (timelineData.title || "Chapters of Our Lof Story 📖") : "Chapters of Our Lof Story 📖";
    const timelineDesc = isObject ? (timelineData.desc || "Every unforgettable milestone, journey, and adventure along our path.") : "Every unforgettable milestone, journey, and adventure along our path.";

    let chapters = isObject ? (timelineData.chapters || (timelineData.chapters = [])) : timelineData;
    if (!Array.isArray(chapters)) {
      chapters = [];
      if (isObject) timelineData.chapters = chapters;
      else state.sectionsData.timeline = chapters;
    }

    let targetChId = null;
    const requestedTarget = state.targetChapterId || state.targetCityKey;
    if (requestedTarget) {
      const match = chapters.find((c, i) =>
        c.id === requestedTarget ||
        c.cityKey === requestedTarget ||
        `chap-${i}` === requestedTarget ||
        String(i) === requestedTarget
      );
      targetChId = match ? (match.id || `chap-${chapters.indexOf(match)}`) : requestedTarget;
      expandedChapterIds.clear();
      expandedChapterIds.add(targetChId);
    } else if (expandedChapterIds.size === 0 && chapters.length > 0) {
      expandedChapterIds.add(chapters[0].id || "chap-0");
    }

    const notifyUpdate = () => {
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    const ensureObjectState = () => {
      if (Array.isArray(state.sectionsData.timeline)) {
        state.sectionsData.timeline = {
          tag: timelineTag,
          title: timelineTitle,
          desc: timelineDesc,
          chapters: state.sectionsData.timeline
        };
      }
    };

    const renderDestinationOptions = (selectedKey) => {
      const grouped = {};
      MAP_DESTINATIONS.forEach(d => {
        grouped[d.region] = grouped[d.region] || [];
        grouped[d.region].push(d);
      });
      let html = `<option value="">-- No Map Pin Link --</option>`;
      Object.entries(grouped).forEach(([region, list]) => {
        html += `<optgroup label="${region}">`;
        list.forEach(item => {
          const isSel = item.key === selectedKey ? "selected" : "";
          html += `<option value="${item.key}" ${isSel}>${item.flag} ${item.label}</option>`;
        });
        html += `</optgroup>`;
      });
      const exists = MAP_DESTINATIONS.some(d => d.key === selectedKey);
      if (selectedKey && !exists) {
        html += `<option value="${selectedKey}" selected>Custom: ${selectedKey}</option>`;
      }
      return html;
    };

    const renderChapterAccordion = (ch, idx) => {
      const chId = ch.id || `chap-${idx}`;
      const isExpanded = expandedChapterIds.has(chId);
      const highlightsStr = (ch.highlights || []).join("\n");
      const images = Array.isArray(ch.images) && ch.images.length > 0 ? ch.images : (ch.img ? [ch.img] : []);
      const coverImg = images[0] || ch.img || "";

      let poolTilesHtml = images.map((imgUrl, imgIdx) => `
        <div class="photo-pool-tile ${imgIdx === 0 ? 'is-main' : ''}" draggable="true" data-photo-idx="${imgIdx}" title="${imgIdx === 0 ? 'Main Cover' : 'Drag to reorder / Click ⭐ to make main'}">
          <img src="${imgUrl || 'https://via.placeholder.com/80'}" alt="Photo" onerror="this.src='https://via.placeholder.com/80';">
          ${imgIdx === 0
            ? `<span class="tile-main-badge">⭐ Main</span>`
            : `<button type="button" class="tile-make-main-btn" data-make-main="${imgIdx}" title="Make Main">⭐ Main</button>`}
          <button type="button" class="tile-del-btn" data-del-photo="${imgIdx}" title="Delete">✕</button>
        </div>
      `).join("");

      return `
        <div class="chap-card-accordion ${isExpanded ? 'is-open' : 'is-collapsed'}" data-id="${chId}" data-idx="${idx}" draggable="true">
          <div class="chap-card-header">
            <div class="chap-header-left">
              <span class="chap-drag-handle" title="Drag to reorder chapter">⋮⋮</span>
              <span class="chap-expand-icon">${isExpanded ? '▼' : '▶'}</span>
              <span class="chap-index-badge">#${idx + 1}</span>
              <span class="chap-flag-preview">${ch.countryFlag || '🇨🇳'}</span>
              <span class="chap-icon-preview">${ch.icon || '💖'}</span>
              <div class="chap-header-meta">
                <strong class="chap-header-title">${ch.title || 'Untitled Chapter'}</strong>
                <span class="chap-header-subtitle">${ch.city || ch.location || 'Unknown City'} • ${ch.tag || 'No Date'}</span>
              </div>
            </div>
            <div class="chap-header-right">
              ${coverImg ? `<img src="${coverImg}" class="chap-mini-thumb" alt="Cover" onerror="this.style.display='none';">` : ''}
              <span class="chap-photo-count-pill">📷 ${images.length}</span>
              <button type="button" class="btn-sm btn-outline btn-chap-spotlight" data-city="${ch.cityKey || ''}" title="Spotlight on Map">🗺️</button>
              <button type="button" class="btn-remove-item btn-chap-delete" title="Delete Chapter">🗑️</button>
            </div>
          </div>

          <div class="chap-card-body" style="${isExpanded ? '' : 'display: none;'}">
            <!-- 1. Destination & Country Details -->
            <div class="chap-section-subheading">📍 Location & Route Linkage</div>
            <div class="grid-3">
              <div class="input-group">
                <label>Emoji Icon</label>
                <input type="text" class="chap-icon-input" value="${ch.icon || '⭐'}" placeholder="🗼">
              </div>
              <div class="input-group">
                <label>Country Flag</label>
                <input type="text" class="chap-flag-input" value="${ch.countryFlag || '🇨🇳'}" placeholder="🇨🇳">
              </div>
              <div class="input-group">
                <label>Country Name</label>
                <input type="text" class="chap-country-input" value="${ch.country || 'China'}" placeholder="China">
              </div>
            </div>

            <div class="grid-2" style="margin-top: 8px;">
              <div class="input-group">
                <label>City / Location Name</label>
                <input type="text" class="chap-city-input" value="${ch.city || ch.location || ''}" placeholder="e.g. Guangzhou">
              </div>
              <div class="input-group">
                <label>Linked Map Stop Pin</label>
                <select class="chap-citykey-select">
                  ${renderDestinationOptions(ch.cityKey || '')}
                </select>
              </div>
            </div>

            <div class="input-group" style="margin-top: 8px;">
              <label>Chapter Tag / Date Subtitle</label>
              <input type="text" class="chap-tag-input" value="${ch.tag || ''}" placeholder="e.g. 17 — 27 Sept • Canton Tower">
            </div>

            <!-- 2. Story Narrative & Title -->
            <div class="chap-section-subheading" style="margin-top: 14px;">📖 Story Narrative & Highlights</div>
            <div class="input-group">
              <label>Chapter Headline Title</label>
              <input type="text" class="chap-title-input" value="${ch.title || ''}" placeholder="e.g. Where Our Story Began 🗼✨">
            </div>

            <div class="input-group" style="margin-top: 8px;">
              <label>Narrative Story Description</label>
              <textarea class="chap-desc-input" rows="4" placeholder="Write about your journey and emotions...">${ch.desc || ''}</textarea>
            </div>

            <div class="input-group" style="margin-top: 8px;">
              <label>Highlights (one memory per line)</label>
              <textarea class="chap-highlights-input" rows="3" placeholder="7 hours talking by Canton Tower&#10;Watching city traffic until sunrise">${highlightsStr}</textarea>
            </div>

            <!-- 3. Photo Pool -->
            <div class="photo-pool-header">
              <span class="chap-section-subheading" style="margin-bottom: 0; border-bottom: none;">Photos Pool (${images.length})</span>
              <div class="photo-pool-actions">
                <label class="btn-sm btn-outline photo-upload-label" title="Upload photos">
                  <span>☁️ Add</span>
                  <input type="file" multiple accept="image/*" class="pool-upload-direct-btn" style="display: none;">
                </label>
                ${openMediaPicker ? `<button type="button" class="btn-sm btn-outline btn-pool-lib btn-chap-pick-media" title="Pick from Library">📁 Library</button>` : ''}
                <button type="button" class="btn-sm btn-outline btn-pool-url" title="Add Image URL">🔗 URL</button>
              </div>
            </div>

            <div class="photo-pool" data-pool-idx="${idx}" tabindex="0" title="Drop pictures here or paste directly (Ctrl+V / ⌘V)">
              ${poolTilesHtml}
              <label class="photo-pool-dropzone" title="Drop photos, paste from clipboard, or click to browse">
                <input type="file" multiple accept="image/*" class="pool-dropzone-input" style="display: none;">
                <span class="dropzone-icon">📷+</span>
                <span class="dropzone-text">Drop / Paste</span>
              </label>
            </div>

            <div class="input-group" style="margin-top: 8px;">
              <label>Photo Caption</label>
              <input type="text" class="chap-caption-input" value="${ch.caption || ''}" placeholder="e.g. 7 hours talking by Canton Tower ❤️">
            </div>
          </div>
        </div>
      `;
    };

    let chaptersHtml = chapters.map((ch, idx) => renderChapterAccordion(ch, idx)).join("");

    inspectorFormContainer.innerHTML = `
      <div class="item-editor-card" style="margin-bottom: 12px; background: rgba(244, 63, 94, 0.04); border-color: rgba(244, 63, 94, 0.25);">
        <div class="item-editor-header">
          <span class="item-editor-title">📖 Timeline Section Header</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Section Tag</label>
            <input type="text" id="tl_tag" value="${timelineTag}">
          </div>
          <div class="input-group">
            <label>Section Title</label>
            <input type="text" id="tl_title" value="${timelineTitle}">
          </div>
        </div>
        <div class="input-group" style="margin-top: 6px;">
          <label>Section Description</label>
          <textarea id="tl_desc" rows="2">${timelineDesc}</textarea>
        </div>
      </div>

      <div class="chap-toolbar">
        <div class="chap-search-wrap">
          <input type="text" id="chapSearchInput" placeholder="🔍 Search chapters (city, title, tag)...">
        </div>
        <div class="chap-toolbar-actions">
          <button type="button" class="btn-sm btn-outline" id="btnExpandAllChaps" title="Expand All Chapters">⤢ Expand All</button>
          <button type="button" class="btn-sm btn-outline" id="btnCollapseAllChaps" title="Collapse All Chapters">⤡ Collapse All</button>
          <span class="chap-badge-total" id="chapTotalCount">${chapters.length} Chapters</span>
        </div>
      </div>

      <div id="timelineAccordionList">
        ${chaptersHtml || `
          <div class="chap-empty-state" style="text-align: center; padding: 36px 16px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; margin-bottom: 12px;">
            <div style="font-size: 2rem; margin-bottom: 8px;">📖</div>
            <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">No Chapters Yet</div>
            <div style="font-size: 0.82rem; color: var(--text-muted, #888);">Click "➕ Add New Journey Chapter" below to add your first destination.</div>
          </div>
        `}
      </div>

      <button type="button" id="btnAddChapterBottom" class="btn-add-item" style="margin-top: 12px;">
        ➕ Add New Journey Chapter
      </button>
    `;

    // Header inputs binding
    const tlTagInput = document.getElementById("tl_tag");
    const tlTitleInput = document.getElementById("tl_title");
    const tlDescInput = document.getElementById("tl_desc");
    if (tlTagInput) tlTagInput.oninput = (e) => { ensureObjectState(); state.sectionsData.timeline.tag = e.target.value; notifyUpdate(); };
    if (tlTitleInput) tlTitleInput.oninput = (e) => { ensureObjectState(); state.sectionsData.timeline.title = e.target.value; notifyUpdate(); };
    if (tlDescInput) tlDescInput.oninput = (e) => { ensureObjectState(); state.sectionsData.timeline.desc = e.target.value; notifyUpdate(); };

    // Search filter
    const searchInput = document.getElementById("chapSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        const q = e.target.value.toLowerCase().trim();
        const cards = inspectorFormContainer.querySelectorAll(".chap-card-accordion");
        let matched = 0;
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          const match = !q || text.includes(q);
          card.style.display = match ? "" : "none";
          if (match) matched++;
        });
        const totalBadge = document.getElementById("chapTotalCount");
        if (totalBadge) totalBadge.textContent = q ? `${matched} of ${chapters.length}` : `${chapters.length} Chapters`;
      };
    }

    // Expand / Collapse All
    const btnExpandAll = document.getElementById("btnExpandAllChaps");
    if (btnExpandAll) {
      btnExpandAll.onclick = () => {
        chapters.forEach((c, i) => expandedChapterIds.add(c.id || `chap-${i}`));
        inspectorFormContainer.querySelectorAll(".chap-card-accordion").forEach(c => {
          c.classList.remove("is-collapsed");
          c.classList.add("is-open");
          const icon = c.querySelector(".chap-expand-icon");
          if (icon) icon.textContent = "▼";
          const body = c.querySelector(".chap-card-body");
          if (body) body.style.display = "";
        });
      };
    }

    const btnCollapseAll = document.getElementById("btnCollapseAllChaps");
    if (btnCollapseAll) {
      btnCollapseAll.onclick = () => {
        expandedChapterIds.clear();
        inspectorFormContainer.querySelectorAll(".chap-card-accordion").forEach(c => {
          c.classList.remove("is-open");
          c.classList.add("is-collapsed");
          const icon = c.querySelector(".chap-expand-icon");
          if (icon) icon.textContent = "▶";
          const body = c.querySelector(".chap-card-body");
          if (body) body.style.display = "none";
        });
      };
    }

    // Attach listeners to cards
    const bindChapterCardEvents = (card) => {
      const idx = parseInt(card.dataset.idx, 10);
      const ch = chapters[idx];
      if (!ch) return;
      const chId = ch.id || `chap-${idx}`;

      // Chapter card drag & drop reordering
      card.ondragstart = (e) => {
        if (e.target.closest("input, textarea, select, button, .photo-pool-tile, .photo-pool-grid")) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("application/x-chapter-index", String(idx));
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("is-dragging-card");
      };
      card.ondragover = (e) => {
        if (e.dataTransfer && e.dataTransfer.types.includes("application/x-chapter-index")) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          card.classList.add("drag-over-card");
        }
      };
      card.ondragleave = () => {
        card.classList.remove("drag-over-card");
      };
      card.ondrop = (e) => {
        if (e.dataTransfer && e.dataTransfer.types.includes("application/x-chapter-index")) {
          e.preventDefault();
          e.stopPropagation();
          card.classList.remove("drag-over-card");
          const fromIdx = parseInt(e.dataTransfer.getData("application/x-chapter-index"), 10);
          if (!isNaN(fromIdx) && fromIdx !== idx) {
            const [moved] = chapters.splice(fromIdx, 1);
            chapters.splice(idx, 0, moved);
            renderWidgetInspector("timeline");
            notifyUpdate();
          }
        }
      };
      card.ondragend = () => {
        card.classList.remove("is-dragging-card");
        if (inspectorFormContainer && inspectorFormContainer.querySelectorAll) {
          inspectorFormContainer.querySelectorAll(".chap-card-accordion").forEach(c => c.classList.remove("drag-over-card"));
        }
      };

      const scrollToThisChapterInPreview = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({
            type: "SCROLL_TO_CHAPTER",
            chapterId: chId,
            cityKey: ch.cityKey
          }, window.location.origin);
        }
      };

      card.addEventListener("click", (e) => {
        if (card.classList.contains("is-dragging-card")) return;
        if (e.target.closest(".btn-remove-item, .btn-chap-delete, .chap-drag-handle")) return;
        scrollToThisChapterInPreview();
      });

      card.addEventListener("focusin", (e) => {
        if (e.target.closest(".btn-remove-item, .btn-chap-delete")) return;
        scrollToThisChapterInPreview();
      });

      // Accordion header toggle (click header to expand/collapse)
      const header = card.querySelector(".chap-card-header");
      if (header) {
        header.onclick = (e) => {
          if (card.classList.contains("is-dragging-card")) return;
          if (e.target.closest("button") || e.target.closest("input") || e.target.closest("label") || e.target.closest(".chap-drag-handle")) return;
          const body = card.querySelector(".chap-card-body");
          const icon = card.querySelector(".chap-expand-icon");
          if (card.classList.contains("is-open")) {
            card.classList.remove("is-open");
            card.classList.add("is-collapsed");
            if (body) body.style.display = "none";
            if (icon) icon.textContent = "▶";
            expandedChapterIds.delete(chId);
          } else {
            card.classList.remove("is-collapsed");
            card.classList.add("is-open");
            if (body) body.style.display = "";
            if (icon) icon.textContent = "▼";
            expandedChapterIds.add(chId);
          }
          scrollToThisChapterInPreview();
        };
      }

      // Live inputs
      const bindInput = (selector, key, transform = v => v) => {
        const el = card.querySelector(selector);
        if (el) {
          el.oninput = (e) => {
            ch[key] = transform(e.target.value);
            if (key === "title") {
              const headTitle = card.querySelector(".chap-header-title");
              if (headTitle) headTitle.textContent = e.target.value || "Untitled Chapter";
            }
            if (key === "icon") {
              const headIcon = card.querySelector(".chap-icon-preview");
              if (headIcon) headIcon.textContent = e.target.value || "💖";
            }
            if (key === "countryFlag") {
              const headFlag = card.querySelector(".chap-flag-preview");
              if (headFlag) headFlag.textContent = e.target.value || "🇨🇳";
            }
            if (key === "city" || key === "tag") {
              const headSub = card.querySelector(".chap-header-subtitle");
              if (headSub) headSub.textContent = `${ch.city || ch.location || 'Unknown City'} • ${ch.tag || 'No Date'}`;
            }
            notifyUpdate();
          };
        }
      };

      bindInput(".chap-icon-input", "icon");
      bindInput(".chap-flag-input", "countryFlag");
      bindInput(".chap-country-input", "country");
      bindInput(".chap-city-input", "city");
      bindInput(".chap-tag-input", "tag");
      bindInput(".chap-title-input", "title");
      bindInput(".chap-desc-input", "desc");
      bindInput(".chap-caption-input", "caption");
      bindInput(".chap-highlights-input", "highlights", v => v.split("\n").map(s => s.trim()).filter(Boolean));

      // City key select
      const citySelect = card.querySelector(".chap-citykey-select");
      if (citySelect) {
        citySelect.onchange = (e) => {
          ch.cityKey = e.target.value;
          const spotBtn = card.querySelector(".btn-chap-spotlight");
          if (spotBtn) spotBtn.dataset.city = ch.cityKey;
          notifyUpdate();
        };
      }

      // Spotlight on map
      const spotBtn = card.querySelector(".btn-chap-spotlight");
      if (spotBtn) {
        spotBtn.onclick = (e) => {
          e.stopPropagation();
          const targetCity = ch.cityKey || "guangzhou";
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({ type: "SPOTLIGHT_CITY", cityKey: targetCity }, window.location.origin);
          }
        };
      }

      // Delete Chapter
      const btnDel = card.querySelector(".btn-chap-delete");
      if (btnDel) {
        btnDel.onclick = async (e) => {
          e.stopPropagation();
          if (confirm(`Delete chapter "${ch.title || 'Untitled'}"?`)) {
            expandedChapterIds.delete(chId);
            const imgs = Array.isArray(ch.images) ? ch.images : (ch.img ? [ch.img] : []);
            for (const im of imgs) {
              if (im) await deleteAssetFromR2(im);
            }
            chapters.splice(idx, 1);
            renderWidgetInspector("timeline");
            notifyUpdate();
          }
        };
      }

      // Photo Pool Manager
      const ensureImagesArray = () => {
        if (!Array.isArray(ch.images)) {
          ch.images = ch.img ? [ch.img] : [];
        }
        return ch.images;
      };

      const syncCoverImage = () => {
        const imgs = ensureImagesArray();
        ch.img = imgs[0] || "";
        const miniThumb = card.querySelector(".chap-mini-thumb");
        if (miniThumb) {
          if (ch.img) {
            miniThumb.src = ch.img;
            miniThumb.style.display = "";
          } else {
            miniThumb.style.display = "none";
          }
        }
        const countPill = card.querySelector(".chap-photo-count-pill");
        if (countPill) countPill.textContent = `📷 ${imgs.length}`;
      };

      const uploadFiles = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        const files = Array.from(fileList).filter(f => f.type && f.type.startsWith("image/"));
        if (files.length === 0) return;
        const imgs = ensureImagesArray();
        for (const file of files) {
          if (file.size > 15 * 1024 * 1024) {
            alert(`File "${file.name}" exceeds 15MB!`);
            continue;
          }
          try {
            const url = await uploadFileToR2(file);
            if (url) imgs.push(url);
          } catch (err) {
            alert("Upload failed: " + err.message);
          }
        }
        syncCoverImage();
        renderWidgetInspector("timeline");
        notifyUpdate();
      };

      // Dropzone & File inputs
      const dropInput = card.querySelector(".pool-dropzone-input");
      if (dropInput) {
        dropInput.onchange = (e) => uploadFiles(e.target.files);
      }
      const directInput = card.querySelector(".pool-upload-direct-btn");
      if (directInput) {
        directInput.onchange = (e) => uploadFiles(e.target.files);
      }

      // Drag & drop files onto photo pool
      const photoPool = card.querySelector(".photo-pool");
      if (photoPool) {
        photoPool.ondragover = (e) => {
          if (e.dataTransfer && e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            photoPool.classList.add("drag-active");
          }
        };
        photoPool.ondragleave = (e) => {
          if (!photoPool.contains(e.relatedTarget)) {
            photoPool.classList.remove("drag-active");
          }
        };
        photoPool.ondrop = (e) => {
          photoPool.classList.remove("drag-active");
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            uploadFiles(e.dataTransfer.files);
          }
        };
      }

      // Direct Paste from Clipboard (Ctrl+V / ⌘V)
      card.addEventListener("paste", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          if (!e.clipboardData || !e.clipboardData.files || e.clipboardData.files.length === 0) {
            return;
          }
        }
        const clipboardItems = e.clipboardData ? e.clipboardData.items : [];
        const imageFiles = [];
        for (let i = 0; i < clipboardItems.length; i++) {
          if (clipboardItems[i].type && clipboardItems[i].type.startsWith("image/")) {
            const blob = clipboardItems[i].getAsFile();
            if (blob) imageFiles.push(blob);
          }
        }
        if (imageFiles.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          uploadFiles(imageFiles);
        }
      });

      // Draggable Tile Reordering (drag & drop between tiles)
      const tiles = card.querySelectorAll(".photo-pool-tile");
      tiles.forEach(tile => {
        const pIdx = parseInt(tile.dataset.photoIdx, 10);
        tile.ondragstart = (e) => {
          e.stopPropagation();
          e.dataTransfer.setData("application/x-photo-idx", String(pIdx));
          e.dataTransfer.effectAllowed = "move";
          tile.classList.add("is-dragging");
        };
        tile.ondragend = (e) => {
          e.stopPropagation();
          tile.classList.remove("is-dragging");
          card.querySelectorAll(".photo-pool-tile").forEach(t => t.classList.remove("drag-over"));
        };
        tile.ondragover = (e) => {
          if (e.dataTransfer && e.dataTransfer.types.includes("application/x-photo-idx")) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
            tile.classList.add("drag-over");
          }
        };
        tile.ondragleave = (e) => {
          e.stopPropagation();
          tile.classList.remove("drag-over");
        };
        tile.ondrop = (e) => {
          if (e.dataTransfer && e.dataTransfer.types.includes("application/x-photo-idx")) {
            e.preventDefault();
            e.stopPropagation();
            tile.classList.remove("drag-over");
            const fromIdx = parseInt(e.dataTransfer.getData("application/x-photo-idx"), 10);
            if (!isNaN(fromIdx) && fromIdx !== pIdx) {
              const imgs = ensureImagesArray();
              const [moved] = imgs.splice(fromIdx, 1);
              imgs.splice(pIdx, 0, moved);
              syncCoverImage();
              renderWidgetInspector("timeline");
              notifyUpdate();
            }
          }
        };
      });

      // Make Main Photo
      card.querySelectorAll("[data-make-main]").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const pIdx = parseInt(btn.dataset.makeMain, 10);
          const imgs = ensureImagesArray();
          if (!isNaN(pIdx) && imgs[pIdx]) {
            const [picked] = imgs.splice(pIdx, 1);
            imgs.unshift(picked);
            syncCoverImage();
            renderWidgetInspector("timeline");
            notifyUpdate();
          }
        };
      });

      // Delete Photo
      card.querySelectorAll("[data-del-photo]").forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const pIdx = parseInt(btn.dataset.delPhoto, 10);
          const imgs = ensureImagesArray();
          if (!isNaN(pIdx)) {
            const [removed] = imgs.splice(pIdx, 1);
            if (removed && typeof deleteAssetFromR2 === "function") {
              await deleteAssetFromR2(removed);
            }
            syncCoverImage();
            renderWidgetInspector("timeline");
            notifyUpdate();
          }
        };
      });

      // Media Library Picker & URL Modal/Prompt
      const btnLib = card.querySelector(".btn-pool-lib");
      if (btnLib && typeof openMediaPicker === "function") {
        btnLib.onclick = () => {
          openMediaPicker({
            filter: "image",
            onSelect: (url) => {
              if (url) {
                const imgs = ensureImagesArray();
                imgs.push(url);
                syncCoverImage();
                renderWidgetInspector("timeline");
                notifyUpdate();
              }
            }
          });
        };
      }
      const btnUrl = card.querySelector(".btn-pool-url");
      if (btnUrl) {
        btnUrl.onclick = () => {
          const u = prompt("Paste image URL:");
          if (u && u.trim()) {
            const imgs = ensureImagesArray();
            imgs.push(u.trim());
            syncCoverImage();
            renderWidgetInspector("timeline");
            notifyUpdate();
          }
        };
      }
    };

    const chapCards = inspectorFormContainer.querySelectorAll ? inspectorFormContainer.querySelectorAll(".chap-card-accordion") : [];
    chapCards.forEach(bindChapterCardEvents);

    if (targetChId) {
      const targetId = targetChId;
      setTimeout(() => {
        const targetCard = inspectorFormContainer.querySelector
          ? (inspectorFormContainer.querySelector(`.chap-card-accordion[data-id="${targetId}"]`) ||
             inspectorFormContainer.querySelector(`.chap-card-accordion[data-id="${targetChId}"]`))
          : null;
        if (targetCard) {
          targetCard.classList.remove("is-collapsed");
          targetCard.classList.add("is-open");
          const formPane = document.getElementById("inspectorFormContainer");
          if (formPane) {
            const topOffset = targetCard.offsetTop - formPane.offsetTop - 12;
            formPane.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
          } else {
            targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          targetCard.classList.add("highlight-pulse");
          setTimeout(() => targetCard.classList.remove("highlight-pulse"), 2200);
        }
        delete state.targetChapterId;
        delete state.targetCityKey;
      }, 50);
    }

    // Add New Chapter Bottom
    const btnAddBottom = document.getElementById("btnAddChapterBottom");
    if (btnAddBottom) {
      btnAddBottom.onclick = () => {
        const newId = "chap-" + Date.now();
        expandedChapterIds.add(newId);
        chapters.push({
          id: newId,
          icon: "💖",
          countryFlag: "🇨🇳",
          country: "China",
          city: "New Destination",
          location: "New Destination 💖",
          tag: `Chapter ${chapters.length + 1}`,
          title: "New Milestone",
          cityKey: "guangzhou",
          desc: "Write about this special chapter in your relationship...",
          highlights: ["A special milestone together"],
          img: "",
          images: [],
          caption: "A romantic moment ❤️"
        });
        renderWidgetInspector("timeline");
        notifyUpdate();
      };
    }
  };
})();

