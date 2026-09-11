(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["audio_capsule"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      renderWidgetInspector = () => {},
      previewIframe = null
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.audio_capsule) state.sectionsData.audio_capsule = {};
    const ac = state.sectionsData.audio_capsule;

    if (!Array.isArray(ac.memos)) {
      ac.memos = [
        { id: "m1", title: "First Birthday Message", speaker: "Alex", year: "2021", date: "Jun 18, 2021", duration: "0:45", audioUrl: "audio/taylor-swift-fate-of-ophelia.m4r" },
        { id: "m2", title: "Midnight Flight Voice Note", speaker: "Ella", year: "2022", date: "Nov 03, 2022", duration: "1:12", audioUrl: "audio/lady-gaga-always-remember-us-this-way.m4r" },
        { id: "m3", title: "Saying Yes in Tuscany", speaker: "Alex & Ella", year: "2023", date: "Sep 14, 2023", duration: "0:58", audioUrl: "audio/imagine-dragons-i-follow-you.m4r" },
        { id: "m4", title: "Our 3-Year Anniversary Promise", speaker: "Ella", year: "2024", date: "Jun 18, 2024", duration: "1:35", audioUrl: "audio/taylor-swift-fate-of-ophelia.m4r" }
      ];
    }
    const memos = ac.memos;

    const listHtml = memos.map((m, idx) => `
      <div class="item-editor-card" data-idx="${idx}">
        <div class="item-editor-header">
          <span class="item-editor-title">🎙️ Memo #${idx + 1}: ${safeVal(m.title || "Untitled")}</span>
          <div style="display:flex; gap:4px; align-items:center;">
            <button type="button" class="btn-subtle" data-move-memo="${idx}" data-dir="-1" title="Move up" ${idx === 0 ? 'disabled' : ''} style="padding:2px 6px; font-size:0.75rem;">▲</button>
            <button type="button" class="btn-subtle" data-move-memo="${idx}" data-dir="1" title="Move down" ${idx === memos.length - 1 ? 'disabled' : ''} style="padding:2px 6px; font-size:0.75rem;">▼</button>
            <button type="button" class="btn-remove-item" data-remove-memo="${idx}">🗑️</button>
          </div>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Title</label>
            <input type="text" class="memo-title-input" value="${safeVal(m.title || '')}">
          </div>
          <div class="input-group">
            <label>Speaker</label>
            <input type="text" class="memo-speaker-input" value="${safeVal(m.speaker || '')}">
          </div>
        </div>
        <div class="grid-3">
          <div class="input-group">
            <label>Date</label>
            <input type="text" class="memo-date-input" value="${safeVal(m.date || '')}">
          </div>
          <div class="input-group">
            <label>Year</label>
            <input type="text" class="memo-year-input" value="${safeVal(m.year || '')}">
          </div>
          <div class="input-group">
            <label>Duration</label>
            <input type="text" class="memo-duration-input" value="${safeVal(m.duration || '1:00')}">
          </div>
        </div>
        <div class="input-group">
          <label>Audio File / URL</label>
          <input type="text" class="memo-url-input" value="${safeVal(m.audioUrl || '')}">
        </div>
      </div>
    `).join("");

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎙️ Audio Capsule Info</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="ac_tag" value="${safeVal(ac.tag || "Voice Memories Across Time 🎙️")}">
        </div>
        <div class="input-group">
          <label>Section Title</label>
          <input type="text" id="ac_title" value="${safeVal(ac.title || "Audio Time Capsule")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="ac_desc" rows="2">${safeVal(ac.desc || "A sonic vault of archived voice notes, late-night whispers, and anniversary promises across the years.")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">⚡ Playback Test Controls</span>
        </div>
        <button type="button" class="btn-builder-action" id="btnTestCapsulePlay">▶️ Toggle Capsule Playback</button>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📼 Voice Memo Archive (${memos.length})</span>
        </div>
        <div id="capsuleMemosListContainer">${listHtml}</div>
        <button type="button" id="btnAddCapsuleMemo" class="btn-add-item" style="margin-top:10px;">➕ Add Voice Memo</button>
      </div>
    `;

    const notify = () => {
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    document.getElementById("ac_tag").oninput = (e) => { ac.tag = e.target.value; notify(); };
    document.getElementById("ac_title").oninput = (e) => { ac.title = e.target.value; notify(); };
    document.getElementById("ac_desc").oninput = (e) => { ac.desc = e.target.value; notify(); };

    document.querySelectorAll("#capsuleMemosListContainer .item-editor-card").forEach(card => {
      const idx = parseInt(card.dataset.idx, 10);
      card.querySelector(".memo-title-input").oninput = (e) => { memos[idx].title = e.target.value; notify(); };
      card.querySelector(".memo-speaker-input").oninput = (e) => { memos[idx].speaker = e.target.value; notify(); };
      card.querySelector(".memo-date-input").oninput = (e) => { memos[idx].date = e.target.value; notify(); };
      card.querySelector(".memo-year-input").oninput = (e) => { memos[idx].year = e.target.value; notify(); };
      card.querySelector(".memo-duration-input").oninput = (e) => { memos[idx].duration = e.target.value; notify(); };
      card.querySelector(".memo-url-input").oninput = (e) => { memos[idx].audioUrl = e.target.value; notify(); };

      card.querySelector(`[data-remove-memo="${idx}"]`).onclick = () => {
        memos.splice(idx, 1);
        renderWidgetInspector("audio_capsule");
        notify();
      };
    });

    document.querySelectorAll("[data-move-memo]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.moveMemo, 10);
        const dir = parseInt(btn.dataset.dir, 10);
        const target = idx + dir;
        if (target >= 0 && target < memos.length) {
          const [moved] = memos.splice(idx, 1);
          memos.splice(target, 0, moved);
          renderWidgetInspector("audio_capsule");
          notify();
        }
      };
    });

    document.getElementById("btnAddCapsuleMemo").onclick = () => {
      memos.push({
        id: "m" + Date.now(),
        title: "New Sweet Voice Note",
        speaker: "Alex & Ella",
        year: String(new Date().getFullYear()),
        date: "Today",
        duration: "1:00",
        audioUrl: "audio/taylor-swift-fate-of-ophelia.m4r"
      });
      renderWidgetInspector("audio_capsule");
      notify();
    };

    const btnTestPlay = document.getElementById("btnTestCapsulePlay");
    if (btnTestPlay) {
      btnTestPlay.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "CAPSULE_TOGGLE" }, window.location.origin);
          try { previewIframe.contentWindow.capsuleToggle?.(); } catch (e) {}
        }
      };
    }
  };
})();
