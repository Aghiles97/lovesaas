/**
 * Builder Inspector Module: scrapbook_game
 * Enhanced with Hint, Polaroid Backstory Date/Location & Direct R2 Uploads.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["scrapbook_game"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {}
    } = ctx || {};

    const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])));

    if (Array.isArray(state.sectionsData.scrapbook_game)) {
      state.sectionsData.scrapbook_game = {
        tag: "Interactive Couple Scrapbook 📓✨",
        title: "How Well Do You Know Me? ✂️",
        desc: "Test your connection, flip polaroids for secret confessions, and collect vinyl memory stickers!",
        certTitle: "Official Soulmate Certification 🏆",
        certAwardee: "Certified Heart Keeper",
        certQuote: "« Through every flight, inside joke, and quiet glance — you know my heart completely. »",
        certNote: "Certified eternal bond with infinite hugs, kisses, and late-night talks.",
        items: state.sectionsData.scrapbook_game
      };
    } else if (!state.sectionsData.scrapbook_game) {
      state.sectionsData.scrapbook_game = {
        tag: "Interactive Couple Scrapbook 📓✨",
        title: "How Well Do You Know Me? ✂️",
        desc: "Test your connection, flip polaroids for secret confessions, and collect vinyl memory stickers!",
        certTitle: "Official Soulmate Certification 🏆",
        certAwardee: 'Certified Heart Keeper of ' + (state.partner2 || "Ella"),
        certQuote: "« Through every flight, inside joke, and quiet glance — you know my heart completely. »",
        certNote: "Certified eternal bond with infinite hugs, kisses, and late-night talks.",
        items: []
      };
    }

    const sb = state.sectionsData.scrapbook_game;
    if (!Array.isArray(sb.items)) sb.items = [];
    const questions = sb.items;

    let listHtml = "";
    questions.forEach((item, idx) => {
      const opts = Array.isArray(item.options) ? item.options : ["Option A", "Option B", "Option C", "Option D"];
      let optionsFields = "";
      opts.forEach((opt, optIdx) => {
        optionsFields += `
          <div class="input-group" style="margin-bottom:6px;">
            <label>Option ${optIdx + 1}</label>
            <input type="text" class="sb-opt-input" data-opt-idx="${optIdx}" value="${esc(opt)}">
          </div>
        `;
      });

      listHtml += `
        <div class="item-editor-card" data-idx="${idx}" style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-bottom:14px;">
          <div class="item-editor-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <span class="item-editor-title" style="font-weight:700;">📖 Memory Card #${idx + 1}</span>
            <div style="display:flex; gap:4px;">
              <button type="button" class="btn-sm btn-reorder-up" data-idx="${idx}" ${idx === 0 ? "disabled" : ""} title="Move Up">▲</button>
              <button type="button" class="btn-sm btn-reorder-down" data-idx="${idx}" ${idx === questions.length - 1 ? "disabled" : ""} title="Move Down">▼</button>
              <button type="button" class="btn-sm btn-preview-step" data-idx="${idx}" title="Preview Step">▶️ Test</button>
              <button type="button" class="btn-remove-item" data-remove-sb="${idx}" title="Delete">🗑️</button>
            </div>
          </div>

          <div class="grid-2">
            <div class="input-group">
              <label>Question Prompt</label>
              <input type="text" class="sb-q-input" value="${esc(item.q || "")}">
            </div>
            <div class="input-group">
              <label>Sticker Emoji</label>
              <input type="text" class="sb-sticker-input" value="${esc(item.sticker || "⭐")}">
            </div>
          </div>

          <div class="grid-2" style="margin-top:6px;">
            <div class="input-group">
              <label>Whisper Hint (Optional)</label>
              <input type="text" class="sb-hint-input" value="${esc(item.hint || "")}" placeholder="Cute clue if they get stuck...">
            </div>
            <div class="input-group">
              <label>Date & Location (Polaroid Back)</label>
              <input type="text" class="sb-dateloc-input" value="${esc(item.dateLocation || "")}" placeholder="e.g. Guangzhou • Nov 2024">
            </div>
          </div>

          <div class="grid-2" style="margin-top:6px;">
            <div class="input-group">
              <label>Polaroid Photo URL</label>
              <div style="display:flex; gap:6px;">
                <input type="text" class="sb-img-input" value="${esc(item.image || "")}" style="flex:1;">
                <label class="btn-sm btn-secondary" style="margin:0; cursor:pointer; display:inline-flex; align-items:center;">
                  <span>📁 Upload</span>
                  <input type="file" accept="image/*" class="sb-file-upload-input" style="display:none;" data-idx="${idx}">
                </label>
              </div>
            </div>
            <div class="input-group">
              <label>Polaroid Caption</label>
              <input type="text" class="sb-caption-input" value="${esc(item.caption || "")}">
            </div>
          </div>

          <div class="sb-options-group" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px;">
            ${optionsFields}
          </div>

          <div class="grid-2" style="margin-top:8px;">
            <div class="input-group">
              <label>Correct Choice</label>
              <select class="sb-correct-select">
                ${opts.map((_, i) => '<option value="' + i + '" ' + (item.correct === i ? "selected" : "") + '>Option ' + (i + 1) + '</option>').join("")}
              </select>
            </div>
            <div class="input-group">
              <label>Heart Confession / Backstory</label>
              <input type="text" class="sb-memory-input" value="${esc(item.memoryNote || "")}">
            </div>
          </div>
        </div>
      `;
    });

    inspectorFormContainer.innerHTML = `
      <div class="section-settings-card" style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-bottom:16px;">
        <h4 style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:12px;">Scrapbook Header</h4>
        <div class="grid-2">
          <div class="input-group">
            <label>Tag / Badge</label>
            <input type="text" id="sb_tag" value="${esc(sb.tag || "")}">
          </div>
          <div class="input-group">
            <label>Main Title</label>
            <input type="text" id="sb_title" value="${esc(sb.title || "")}">
          </div>
        </div>
        <div class="input-group">
          <label>Description</label>
          <input type="text" id="sb_desc" value="${esc(sb.desc || "")}">
        </div>
      </div>

      <div class="section-settings-card" style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-bottom:16px;">
        <h4 style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:12px;">Keepsake Award Certificate</h4>
        <div class="grid-2">
          <div class="input-group">
            <label>Award Title</label>
            <input type="text" id="sb_certTitle" value="${esc(sb.certTitle || "")}">
          </div>
          <div class="input-group">
            <label>Awardee Subtitle</label>
            <input type="text" id="sb_certAwardee" value="${esc(sb.certAwardee || "")}">
          </div>
        </div>
        <div class="input-group">
          <label>Award Quote</label>
          <input type="text" id="sb_certQuote" value="${esc(sb.certQuote || "")}">
        </div>
        <div class="input-group">
          <label>Keepsake Note</label>
          <textarea id="sb_certNote" rows="2">${esc(sb.certNote || "")}</textarea>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-bottom:16px;">
        <h4 style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:8px;">🎮 Live Interactive Test Controls</h4>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" id="btnTestScrapbookReset" class="btn-sm btn-secondary">🔄 Reset to Step 1</button>
          <button type="button" id="btnTestScrapbookKeepsake" class="btn-sm btn-primary">🏆 Open Keepsake Book</button>
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <h4 style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin:0;">Memory Questions (${questions.length})</h4>
        <button type="button" id="btnAddScrapbookQ" class="btn-sm btn-primary">➕ Add Memory</button>
      </div>

      <div id="scrapbookListContainer">${listHtml}</div>
    `;

    document.getElementById("sb_tag").oninput = (e) => { sb.tag = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("sb_title").oninput = (e) => { sb.title = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("sb_desc").oninput = (e) => { sb.desc = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("sb_certTitle").oninput = (e) => { sb.certTitle = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("sb_certAwardee").oninput = (e) => { sb.certAwardee = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("sb_certQuote").oninput = (e) => { sb.certQuote = e.target.value; debouncedLiveUpdate(); };
    document.getElementById("sb_certNote").oninput = (e) => { sb.certNote = e.target.value; debouncedLiveUpdate(); };

    document.getElementById("btnTestScrapbookReset").onclick = () => {
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "SCRAPBOOK_RESET" }, window.location.origin);
      }
    };
    document.getElementById("btnTestScrapbookKeepsake").onclick = () => {
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: "SCRAPBOOK_OPEN_KEEPSAKE" }, window.location.origin);
      }
    };

    document.querySelectorAll("#scrapbookListContainer .item-editor-card").forEach(card => {
      const idx = parseInt(card.dataset.idx, 10);
      card.querySelector(".sb-q-input").oninput = (e) => { questions[idx].q = e.target.value; debouncedLiveUpdate(); };
      card.querySelector(".sb-sticker-input").oninput = (e) => { questions[idx].sticker = e.target.value; debouncedLiveUpdate(); };
      card.querySelector(".sb-img-input").oninput = (e) => { questions[idx].image = e.target.value; debouncedLiveUpdate(); };
      card.querySelector(".sb-caption-input").oninput = (e) => { questions[idx].caption = e.target.value; debouncedLiveUpdate(); };
      card.querySelector(".sb-hint-input").oninput = (e) => { questions[idx].hint = e.target.value; debouncedLiveUpdate(); };
      card.querySelector(".sb-dateloc-input").oninput = (e) => { questions[idx].dateLocation = e.target.value; debouncedLiveUpdate(); };
      card.querySelector(".sb-memory-input").oninput = (e) => { questions[idx].memoryNote = e.target.value; debouncedLiveUpdate(); };

      // R2 File Upload Handler
      const fileInput = card.querySelector(".sb-file-upload-input");
      if (fileInput) {
        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            const uploadedUrl = await uploadFileToR2(file);
            if (uploadedUrl) {
              questions[idx].image = uploadedUrl;
              card.querySelector(".sb-img-input").value = uploadedUrl;
              debouncedLiveUpdate();
              debouncedAutoSaveLayout();
            }
          } catch (err) {
            console.error("R2 upload error:", err);
          }
        };
      }

      card.querySelectorAll(".sb-opt-input").forEach(optInput => {
        const optIdx = parseInt(optInput.dataset.optIdx, 10);
        optInput.oninput = (e) => {
          questions[idx].options[optIdx] = e.target.value;
          debouncedLiveUpdate();
        };
      });

      card.querySelector(".sb-correct-select").onchange = (e) => {
        questions[idx].correct = parseInt(e.target.value, 10);
        debouncedLiveUpdate();
      };

      const upBtn = card.querySelector(".btn-reorder-up");
      if (upBtn) {
        upBtn.onclick = () => {
          if (idx > 0) {
            const temp = questions[idx];
            questions[idx] = questions[idx - 1];
            questions[idx - 1] = temp;
            renderWidgetInspector("scrapbook_game");
            debouncedLiveUpdate();
          }
        };
      }

      const downBtn = card.querySelector(".btn-reorder-down");
      if (downBtn) {
        downBtn.onclick = () => {
          if (idx < questions.length - 1) {
            const temp = questions[idx];
            questions[idx] = questions[idx + 1];
            questions[idx + 1] = temp;
            renderWidgetInspector("scrapbook_game");
            debouncedLiveUpdate();
          }
        };
      }

      const previewBtn = card.querySelector(".btn-preview-step");
      if (previewBtn) {
        previewBtn.onclick = () => {
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({ type: "SCRAPBOOK_JUMP_STEP", step: idx }, window.location.origin);
          }
        };
      }

      card.querySelector('[data-remove-sb="' + idx + '"]').onclick = () => {
        questions.splice(idx, 1);
        renderWidgetInspector("scrapbook_game");
        debouncedLiveUpdate();
      };
    });

    document.getElementById("btnAddScrapbookQ").onclick = () => {
      questions.push({
        q: "What is my favorite thing to do together on a quiet evening?",
        options: ["Watch movies wrapped in blankets 🎬", "Cook a silly new recipe 👩‍🍳", "Walk under the city lights 🌃", "Talk for hours about our future 💭"],
        correct: 0,
        sticker: "🎬",
        hint: "Cozy snacks and streaming our favorite show!",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
        caption: "Cozy quiet moments",
        dateLocation: "Living Room Haven • 9:00 PM",
        memoryNote: "Being cuddled up next to you with our favorite snacks is the happiest place on earth."
      });
      renderWidgetInspector("scrapbook_game");
      debouncedLiveUpdate();
    };
  };
})();
