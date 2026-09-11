(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["then_now_slider"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      openMediaPicker = null
    } = ctx || {};

    const safe = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.then_now_slider) {
      state.sectionsData.then_now_slider = {};
    }
    const d = state.sectionsData.then_now_slider;

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🌗 Then vs. Now Slider Settings</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="tns_tag" value="${safe(d.tag || "Our Journey Through Time 🌗")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="tns_title" value="${safe(d.title || "Then vs. Now: How It Started & How It's Going")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="tns_desc" rows="2">${safe(d.desc || "From the shy smiles of day one to the unbreakable bond of today. Slide to witness our growth.")}</textarea>
        </div>
        <div class="input-group">
          <label>Initial Split Position (<span id="tns_split_val">${d.initialSplit ?? 50}</span>%)</label>
          <input type="range" id="tns_initialSplit" min="0" max="100" value="${d.initialSplit ?? 50}">
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⏳ THEN Side (How It Started)</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Year / Date</label>
            <input type="text" id="tns_thenDate" placeholder="e.g. 2021" value="${safe(d.thenDate || "2021")}">
          </div>
          <div class="input-group">
            <label>Badge Label</label>
            <input type="text" id="tns_thenLabel" placeholder="e.g. THEN (First Date - 2021)" value="${safe(d.thenLabel || "THEN (First Date - 2021)")}">
          </div>
        </div>
        <div class="img-upload-row" style="margin-top: 6px;">
          <img src="${d.thenImg || "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80"}" class="img-thumb" id="tns_thenThumb" alt="Then photo" onerror="this.src='https://via.placeholder.com/60';">
          <div style="flex: 1;">
            <input type="text" id="tns_thenImg" value="${safe(d.thenImg || "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80")}" placeholder="Image URL">
            <div style="display: flex; gap: 6px; margin-top: 4px;">
              <label class="file-upload-btn" style="flex: 1; margin: 0;">
                <span>☁️ Upload</span>
                <input type="file" accept="image/*" id="tns_thenFile" style="display: none;">
              </label>
              <button type="button" class="btn-pick-from-media" id="tns_thenPicker">📁 Library</button>
            </div>
          </div>
        </div>
        <div class="input-group" style="margin-top: 8px;">
          <label>Memory Caption</label>
          <textarea id="tns_thenCaption" rows="2">${safe(d.thenCaption || "Coffee cups shaking, butterflies in our stomachs, talking until the café closed.")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">✨ NOW Side (How It's Going)</span>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Year / Date</label>
            <input type="text" id="tns_nowDate" placeholder="e.g. 2026" value="${safe(d.nowDate || "2026")}">
          </div>
          <div class="input-group">
            <label>Badge Label</label>
            <input type="text" id="tns_nowLabel" placeholder="e.g. NOW (Present Day - 2026)" value="${safe(d.nowLabel || "NOW (Present Day - 2026)")}">
          </div>
        </div>
        <div class="img-upload-row" style="margin-top: 6px;">
          <img src="${d.nowImg || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80"}" class="img-thumb" id="tns_nowThumb" alt="Now photo" onerror="this.src='https://via.placeholder.com/60';">
          <div style="flex: 1;">
            <input type="text" id="tns_nowImg" value="${safe(d.nowImg || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80")}" placeholder="Image URL">
            <div style="display: flex; gap: 6px; margin-top: 4px;">
              <label class="file-upload-btn" style="flex: 1; margin: 0;">
                <span>☁️ Upload</span>
                <input type="file" accept="image/*" id="tns_nowFile" style="display: none;">
              </label>
              <button type="button" class="btn-pick-from-media" id="tns_nowPicker">📁 Library</button>
            </div>
          </div>
        </div>
        <div class="input-group" style="margin-top: 8px;">
          <label>Memory Caption</label>
          <textarea id="tns_nowCaption" rows="2">${safe(d.nowCaption || "5 years of laughter, thousands of inside jokes, and a love deeper than the ocean.")}</textarea>
        </div>
      </div>
    `;

    const sync = () => {
      d.tag = document.getElementById("tns_tag").value.trim();
      d.title = document.getElementById("tns_title").value.trim();
      d.desc = document.getElementById("tns_desc").value.trim();
      d.initialSplit = parseInt(document.getElementById("tns_initialSplit").value, 10) || 50;
      d.thenDate = document.getElementById("tns_thenDate").value.trim();
      d.thenLabel = document.getElementById("tns_thenLabel").value.trim();
      d.thenImg = document.getElementById("tns_thenImg").value.trim();
      d.thenCaption = document.getElementById("tns_thenCaption").value.trim();
      d.nowDate = document.getElementById("tns_nowDate").value.trim();
      d.nowLabel = document.getElementById("tns_nowLabel").value.trim();
      d.nowImg = document.getElementById("tns_nowImg").value.trim();
      d.nowCaption = document.getElementById("tns_nowCaption").value.trim();

      document.getElementById("tns_thenThumb").src = d.thenImg;
      document.getElementById("tns_nowThumb").src = d.nowImg;
      document.getElementById("tns_split_val").textContent = d.initialSplit;

      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    inspectorFormContainer.querySelectorAll("input, textarea").forEach(el => {
      if (el.type !== "file") el.addEventListener("input", sync);
    });

    const bindUploader = (fileEl, imgInput, thumbEl, key) => {
      fileEl.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          imgInput.value = "Uploading...";
          const url = await uploadFileToR2(file);
          d[key] = url;
          imgInput.value = url;
          thumbEl.src = url;
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        } catch (err) {
          alert("Upload failed: " + err.message);
          imgInput.value = d[key] || "";
        }
      };
    };

    bindUploader(document.getElementById("tns_thenFile"), document.getElementById("tns_thenImg"), document.getElementById("tns_thenThumb"), "thenImg");
    bindUploader(document.getElementById("tns_nowFile"), document.getElementById("tns_nowImg"), document.getElementById("tns_nowThumb"), "nowImg");

    const bindPicker = (btn, imgInput, thumbEl, key) => {
      btn.onclick = () => {
        if (typeof openMediaPicker === "function") {
          openMediaPicker({
            filter: "image",
            onSelect: (url) => {
              d[key] = url;
              imgInput.value = url;
              thumbEl.src = url;
              debouncedLiveUpdate();
              debouncedAutoSaveLayout();
            }
          });
        }
      };
    };

    bindPicker(document.getElementById("tns_thenPicker"), document.getElementById("tns_thenImg"), document.getElementById("tns_thenThumb"), "thenImg");
    bindPicker(document.getElementById("tns_nowPicker"), document.getElementById("tns_nowImg"), document.getElementById("tns_nowThumb"), "nowImg");
  };
})();
