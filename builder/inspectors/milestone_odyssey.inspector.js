(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["milestone_odyssey"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      renderWidgetInspector = () => {},
      previewIframe = null
    } = ctx || {};

    const safeVal = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.milestone_odyssey) state.sectionsData.milestone_odyssey = {};
    const mo = state.sectionsData.milestone_odyssey;

    if (!Array.isArray(mo.milestones)) {
      mo.milestones = [
        { id: "mo1", date: "June 18, 2021", title: "The First Hello", location: "Little Paris Bistro", icon: "☕", desc: "A two-hour coffee date turned into a six-hour walk through the city lights.", imgUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80" },
        { id: "mo2", date: "October 12, 2021", title: "Official Day One", location: "City Park Lookout", icon: "💍", desc: "Under the autumn stars, we decided to take on the entire world together.", imgUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80" },
        { id: "mo3", date: "August 24, 2022", title: "First Big Flight", location: "Tokyo, Japan", icon: "✈️", desc: "Lost in Shibuya crossing, laughing in ramen shops, our very first international adventure.", imgUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80" },
        { id: "mo4", date: "May 15, 2023", title: "Moving In Together", location: "Our First Apartment", icon: "🔑", desc: "Unpacking endless cardboard boxes, painting the walls, and officially sharing a key.", imgUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80" },
        { id: "mo5", date: "September 14, 2024", title: "The Proposal", location: "Tuscany Sunset Hills", icon: "💖", desc: "Kneeling on the cobblestones as golden hour washed over the vineyards. She said YES!", imgUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80" },
        { id: "mo6", date: "Present Day", title: "The Infinity Chapter", location: "Everywhere With You", icon: "♾️", desc: "Still writing our favorite adventure every single sunrise.", imgUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80" }
      ];
    }
    const milestones = mo.milestones;

    const listHtml = milestones.map((m, idx) => `
      <div class="item-editor-card" data-idx="${idx}">
        <div class="item-editor-header">
          <span class="item-editor-title">${safeVal(m.icon || '📍')} #${idx + 1}: ${safeVal(m.title || "Milestone")}</span>
          <div style="display:flex; gap:4px; align-items:center;">
            <button type="button" class="btn-subtle" data-move-ms="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''} style="padding:2px 6px; font-size:0.75rem;">▲</button>
            <button type="button" class="btn-subtle" data-move-ms="${idx}" data-dir="1" title="Move later" ${idx === milestones.length - 1 ? 'disabled' : ''} style="padding:2px 6px; font-size:0.75rem;">▼</button>
            <button type="button" class="btn-remove-item" data-remove-ms="${idx}">🗑️</button>
          </div>
        </div>
        <div class="grid-3">
          <div class="input-group">
            <label>Icon / Emoji</label>
            <input type="text" class="ms-icon-input" value="${safeVal(m.icon || '📍')}">
          </div>
          <div class="input-group" style="grid-column: span 2;">
            <label>Milestone Title</label>
            <input type="text" class="ms-title-input" value="${safeVal(m.title || '')}">
          </div>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label>Date Tag</label>
            <input type="text" class="ms-date-input" value="${safeVal(m.date || '')}">
          </div>
          <div class="input-group">
            <label>Location Badge</label>
            <input type="text" class="ms-location-input" value="${safeVal(m.location || '')}">
          </div>
        </div>
        <div class="input-group">
          <label>Story Description / Snippet</label>
          <textarea class="ms-desc-input" rows="2">${safeVal(m.desc || '')}</textarea>
        </div>
        <div class="input-group">
          <label>Photo URL (Optional)</label>
          <input type="text" class="ms-img-input" value="${safeVal(m.imgUrl || '')}">
        </div>
      </div>
    `).join("");

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🚀 Milestone Odyssey Info</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="mo_tag" value="${safeVal(mo.tag || "Our Love Timeline 🚀")}">
        </div>
        <div class="input-group">
          <label>Section Title</label>
          <input type="text" id="mo_title" value="${safeVal(mo.title || "Milestone Odyssey")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="mo_desc" rows="2">${safeVal(mo.desc || "Charting the monumental checkpoints of our universe from the first hello to forever.")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">✨ Odyssey Interactive Test</span>
        </div>
        <button type="button" class="btn-builder-action" id="btnTestOdysseyScroll">↔️ Pan Journey Track</button>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📍 Milestones Roadmap (${milestones.length})</span>
        </div>
        <div id="odysseyListContainer">${listHtml}</div>
        <button type="button" id="btnAddMilestone" class="btn-add-item" style="margin-top:10px;">➕ Add Milestone Checkpoint</button>
      </div>
    `;

    const notify = () => {
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    document.getElementById("mo_tag").oninput = (e) => { mo.tag = e.target.value; notify(); };
    document.getElementById("mo_title").oninput = (e) => { mo.title = e.target.value; notify(); };
    document.getElementById("mo_desc").oninput = (e) => { mo.desc = e.target.value; notify(); };

    document.querySelectorAll("#odysseyListContainer .item-editor-card").forEach(card => {
      const idx = parseInt(card.dataset.idx, 10);
      card.querySelector(".ms-icon-input").oninput = (e) => { milestones[idx].icon = e.target.value; notify(); };
      card.querySelector(".ms-title-input").oninput = (e) => { milestones[idx].title = e.target.value; notify(); };
      card.querySelector(".ms-date-input").oninput = (e) => { milestones[idx].date = e.target.value; notify(); };
      card.querySelector(".ms-location-input").oninput = (e) => { milestones[idx].location = e.target.value; notify(); };
      card.querySelector(".ms-desc-input").oninput = (e) => { milestones[idx].desc = e.target.value; notify(); };
      card.querySelector(".ms-img-input").oninput = (e) => { milestones[idx].imgUrl = e.target.value; notify(); };

      card.querySelector(`[data-remove-ms="${idx}"]`).onclick = () => {
        milestones.splice(idx, 1);
        renderWidgetInspector("milestone_odyssey");
        notify();
      };
    });

    document.querySelectorAll("[data-move-ms]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.moveMs, 10);
        const dir = parseInt(btn.dataset.dir, 10);
        const target = idx + dir;
        if (target >= 0 && target < milestones.length) {
          const [moved] = milestones.splice(idx, 1);
          milestones.splice(target, 0, moved);
          renderWidgetInspector("milestone_odyssey");
          notify();
        }
      };
    });

    document.getElementById("btnAddMilestone").onclick = () => {
      milestones.push({
        id: "mo" + Date.now(),
        date: "New Date",
        title: "Next Big Adventure",
        location: "Our Next Destination",
        icon: "🌟",
        desc: "Another unforgettable chapter in our beautiful love story.",
        imgUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80"
      });
      renderWidgetInspector("milestone_odyssey");
      notify();
    };

    const btnTestScroll = document.getElementById("btnTestOdysseyScroll");
    if (btnTestScroll) {
      btnTestScroll.onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "ODYSSEY_SCROLL_NEXT" }, "*");
          try { previewIframe.contentWindow.odysseyScrollNext?.(); } catch (e) {}
        }
      };
    }
  };
})();
