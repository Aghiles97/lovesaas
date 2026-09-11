/**
 * Builder Inspector Module: memories
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["memories"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {},
      openMediaPicker = () => {}
    } = ctx || {};

if (!state.sectionsData.memories) {
        state.sectionsData.memories = {
          tag: "Captured Memories",
          title: "Our Favorite Moments 📷",
          desc: "Snapshots of our laughter, late-night talks, warm hugs, and infinite love. ✨",
          addBtnText: "📷 Add Our Photo / Video Memory",
          items: []
        };
      } else if (Array.isArray(state.sectionsData.memories)) {
        state.sectionsData.memories = {
          tag: "Captured Memories",
          title: "Our Favorite Moments 📷",
          desc: "Snapshots of our laughter, late-night talks, warm hugs, and infinite love. ✨",
          addBtnText: "📷 Add Our Photo / Video Memory",
          items: state.sectionsData.memories
        };
      }
      const memObj = state.sectionsData.memories;
      if (!Array.isArray(memObj.items)) memObj.items = [];
      const memories = memObj.items;

      let listHtml = "";
      memories.forEach((m, idx) => {
        listHtml += `
          <div class="item-editor-card" data-idx="${idx}">
            <div class="item-editor-header">
              <span class="item-editor-title">📷 Photo #${idx + 1}</span>
              <div style="display: flex; gap: 4px; align-items: center;">
                <button type="button" class="btn-subtle" data-move-mem="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
                <button type="button" class="btn-subtle" data-move-mem="${idx}" data-dir="1" title="Move later" ${idx === memories.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
                <button type="button" class="btn-remove-item" data-remove-mem="${idx}">🗑️</button>
              </div>
            </div>
            <div class="img-upload-row">
              <img src="${m.img || 'https://via.placeholder.com/60'}" class="img-thumb" id="mem_thumb_${idx}" alt="Thumb" onerror="this.src='https://via.placeholder.com/60';">
              <div style="flex: 1;">
                <input type="text" class="mem-img-input" value="${safeVal(m.img || '')}" placeholder="Image URL (CDN / R2 / local)">
                <div style="display: flex; gap: 6px; margin-top: 4px;">
                  <label class="file-upload-btn" style="flex: 1; margin: 0;">
                    <span>☁️ Upload R2</span>
                    <input type="file" accept="image/*" class="mem-file-trigger" style="display: none;">
                  </label>
                  <button type="button" class="btn-pick-from-media btn-mem-pick-media" title="Choose from uploaded assets">📁 Library</button>
                </div>
              </div>
            </div>
            <div class="input-group" style="margin-top: 8px;">
              <label>Caption Title</label>
              <input type="text" class="mem-title-input" value="${safeVal(m.title || '')}">
            </div>
            <div class="input-group">
              <label>Memory Story / Description</label>
              <textarea class="mem-desc-input" rows="2">${safeVal(m.desc || '')}</textarea>
            </div>
          </div>
        `;
      });

      inspectorFormContainer.innerHTML = `
        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">📷 Section Heading & Call-to-Action</span>
          </div>
          <div class="input-group">
            <label>Section Tag</label>
            <input type="text" id="mem_tag" value="${safeVal(memObj.tag || "Captured Memories")}">
          </div>
          <div class="input-group">
            <label>Section Title</label>
            <input type="text" id="mem_title" value="${safeVal(memObj.title || "Our Favorite Moments 📷")}">
          </div>
          <div class="input-group">
            <label>Section Description</label>
            <textarea id="mem_desc" rows="2">${safeVal(memObj.desc || "Snapshots of our laughter, late-night talks, warm hugs, and infinite love. ✨")}</textarea>
          </div>
          <div class="input-group">
            <label>Add Memory Button Label</label>
            <input type="text" id="mem_addBtnText" value="${safeVal(memObj.addBtnText || "📷 Add Our Photo / Video Memory")}">
          </div>
        </div>

        <div class="inspector-section-card" style="background: linear-gradient(135deg, rgba(255,240,245,0.8), rgba(255,255,255,0.9)); border: 1px dashed var(--primary);">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🎬 Live Interactive Test Controls</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Trigger polaroid actions inside the live preview window:</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" id="btnMemSlideshow" class="btn-subtle" style="font-size: 0.78rem;">▶️ Launch Slideshow</button>
            <button type="button" id="btnMemAddModal" class="btn-subtle" style="font-size: 0.78rem;">➕ Open Add Memory Modal</button>
          </div>
        </div>

        <div class="inspector-section-card">
          <div class="inspector-card-header">
            <span class="inspector-card-title">🖼️ Polaroid Wall Photos (${memories.length})</span>
          </div>
          <div id="memoriesListContainer">${listHtml}</div>
          <button type="button" id="btnAddMem" class="btn-add-item" style="margin-top: 10px;">➕ Add Polaroid Photo</button>
        </div>
      `;

      // Header bindings
      document.getElementById("mem_tag").oninput = (e) => { memObj.tag = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("mem_title").oninput = (e) => { memObj.title = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("mem_desc").oninput = (e) => { memObj.desc = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("mem_addBtnText").oninput = (e) => { memObj.addBtnText = e.target.value; debouncedLiveUpdate(); };

      // Live test controls
      document.getElementById("btnMemSlideshow").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "LAUNCH_SLIDESHOW" }, "*");
        }
      };
      document.getElementById("btnMemAddModal").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "OPEN_ADD_MEMORY" }, "*");
        }
      };

      // Item bindings
      document.querySelectorAll("#memoriesListContainer .item-editor-card").forEach(card => {
        const idx = parseInt(card.dataset.idx, 10);
        const urlInput = card.querySelector(".mem-img-input");
        const thumb = card.querySelector(".img-thumb");
        const fileInput = card.querySelector(".mem-file-trigger");

        urlInput.oninput = (e) => {
          memories[idx].img = e.target.value.trim();
          thumb.src = memories[idx].img;
          debouncedLiveUpdate();
        };

        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            urlInput.value = "Uploading photo (max 10 Mo)...";
            const publicUrl = await uploadFileToR2(file);
            memories[idx].img = publicUrl;
            urlInput.value = publicUrl;
            thumb.src = publicUrl;
            debouncedLiveUpdate();
          } catch (err) {
            alert("Upload failed: " + err.message);
            urlInput.value = memories[idx].img || "";
          }
        };

        const btnPickMedia = card.querySelector(".btn-mem-pick-media");
        if (btnPickMedia) {
          btnPickMedia.onclick = () => {
            if (typeof openMediaPicker === "function") {
              openMediaPicker({
                filter: "image",
                onSelect: (url) => {
                  memories[idx].img = url;
                  urlInput.value = url;
                  thumb.src = url;
                  debouncedLiveUpdate();
                }
              });
            }
          };
        }

        card.querySelector(".mem-title-input").oninput = (e) => { memories[idx].title = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(".mem-desc-input").oninput = (e) => { memories[idx].desc = e.target.value; debouncedLiveUpdate(); };
        card.querySelector(`[data-remove-mem="${idx}"]`).onclick = () => {
          memories.splice(idx, 1);
          renderWidgetInspector("memories");
          debouncedLiveUpdate();
        };
      });

      // Move controls
      document.querySelectorAll("[data-move-mem]").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.moveMem, 10);
          const dir = parseInt(btn.dataset.dir, 10);
          const target = idx + dir;
          if (target >= 0 && target < memories.length) {
            const [moved] = memories.splice(idx, 1);
            memories.splice(target, 0, moved);
            renderWidgetInspector("memories");
            debouncedLiveUpdate();
          }
        };
      });

      document.getElementById("btnAddMem").onclick = () => {
        memories.push({
          id: "mem-" + Date.now(),
          title: "Our Special Moment ❤️",
          desc: "A warm memory we will cherish forever.",
          img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop"
        });
        renderWidgetInspector("memories");
        debouncedLiveUpdate();
      };
  };
})();
