(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["bucket_list"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      renderWidgetInspector = () => {}
    } = ctx || {};

    const safe = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");

    if (!state.sectionsData.bucket_list) {
      state.sectionsData.bucket_list = {
        tag: "Our Shared Horizon 🎯",
        title: "The Couple Bucket List",
        desc: "All the dreams we've conquered together and the wild adventures still waiting for us.",
        items: []
      };
    }
    const b = state.sectionsData.bucket_list;
    if (!Array.isArray(b.items)) b.items = [];
    const items = b.items;

    let itemsHtml = "";
    items.forEach((item, idx) => {
      itemsHtml += `
        <div class="item-editor-card" data-idx="${idx}">
          <div class="item-editor-header">
            <span class="item-editor-title">${item.icon || "🎯"} Goal #${idx + 1}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button type="button" class="btn-subtle" data-move-goal="${idx}" data-dir="-1" title="Move earlier" ${idx === 0 ? "disabled" : ""} style="padding: 2px 6px; font-size: 0.75rem;">▲</button>
              <button type="button" class="btn-subtle" data-move-goal="${idx}" data-dir="1" title="Move later" ${idx === items.length - 1 ? "disabled" : ""} style="padding: 2px 6px; font-size: 0.75rem;">▼</button>
              <button type="button" class="btn-remove-item" data-remove-goal="${idx}">🗑️</button>
            </div>
          </div>

          <div class="grid-2">
            <div class="input-group">
              <label>Goal Title</label>
              <input type="text" class="goal-title-input" value="${safe(item.title || "")}">
            </div>
            <div class="input-group">
              <label>Icon / Emoji</label>
              <input type="text" class="goal-icon-input" value="${safe(item.icon || "🎯")}">
            </div>
          </div>

          <div class="grid-2">
            <div class="input-group">
              <label>Category</label>
              <select class="goal-category-input">
                <option value="Travel" ${item.category === "Travel" ? "selected" : ""}>✈️ Travel</option>
                <option value="Adventure" ${item.category === "Adventure" ? "selected" : ""}>🧗 Adventure</option>
                <option value="Romance" ${item.category === "Romance" ? "selected" : ""}>💖 Romance</option>
                <option value="Home" ${item.category === "Home" ? "selected" : ""}>🏡 Home</option>
                <option value="General" ${!["Travel", "Adventure", "Romance", "Home"].includes(item.category) ? "selected" : ""}>🌟 General</option>
              </select>
            </div>
            <div class="input-group">
              <label>Target Year / Date</label>
              <input type="text" class="goal-date-input" value="${safe(item.targetDate || "")}" placeholder="e.g. Summer 2027">
            </div>
          </div>

          <div style="margin-top: 6px; display: flex; align-items: center; gap: 8px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
              <input type="checkbox" class="goal-completed-input" ${item.completed ? "checked" : ""}>
              <span>Mark Conquered / Completed ✨</span>
            </label>
          </div>
        </div>
      `;
    });

    inspectorFormContainer.innerHTML = `
      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">🎯 Bucket List Settings</span>
        </div>
        <div class="input-group">
          <label>Category Tag</label>
          <input type="text" id="bl_tag" value="${safe(b.tag || "Our Shared Horizon 🎯")}">
        </div>
        <div class="input-group">
          <label>Title</label>
          <input type="text" id="bl_title" value="${safe(b.title || "The Couple Bucket List")}">
        </div>
        <div class="input-group">
          <label>Description</label>
          <textarea id="bl_desc" rows="2">${safe(b.desc || "All the dreams we've conquered together and the wild adventures still waiting for us.")}</textarea>
        </div>
      </div>

      <div class="inspector-section-card">
        <div class="inspector-card-header">
          <span class="inspector-card-title">📋 Checklist Goals (${items.length})</span>
        </div>
        <div id="bucketGoalsList">${itemsHtml}</div>
        <button type="button" id="btnAddGoal" class="btn-add-item" style="margin-top: 10px;">➕ Add New Bucket List Goal</button>
      </div>
    `;

    const syncHeader = () => {
      b.tag = document.getElementById("bl_tag").value.trim();
      b.title = document.getElementById("bl_title").value.trim();
      b.desc = document.getElementById("bl_desc").value.trim();
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };

    document.getElementById("bl_tag").oninput = syncHeader;
    document.getElementById("bl_title").oninput = syncHeader;
    document.getElementById("bl_desc").oninput = syncHeader;

    document.querySelectorAll("#bucketGoalsList .item-editor-card").forEach(card => {
      const idx = parseInt(card.dataset.idx, 10);
      card.querySelector(".goal-title-input").oninput = (e) => {
        items[idx].title = e.target.value;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
      card.querySelector(".goal-icon-input").oninput = (e) => {
        items[idx].icon = e.target.value;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
      card.querySelector(".goal-category-input").onchange = (e) => {
        items[idx].category = e.target.value;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
      card.querySelector(".goal-date-input").oninput = (e) => {
        items[idx].targetDate = e.target.value;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
      card.querySelector(".goal-completed-input").onchange = (e) => {
        items[idx].completed = e.target.checked;
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
      card.querySelector(`[data-remove-goal="${idx}"]`).onclick = () => {
        items.splice(idx, 1);
        renderWidgetInspector("bucket_list");
        debouncedLiveUpdate();
        debouncedAutoSaveLayout();
      };
    });

    document.querySelectorAll("[data-move-goal]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.moveGoal, 10);
        const dir = parseInt(btn.dataset.dir, 10);
        const target = idx + dir;
        if (target >= 0 && target < items.length) {
          const [moved] = items.splice(idx, 1);
          items.splice(target, 0, moved);
          renderWidgetInspector("bucket_list");
          debouncedLiveUpdate();
          debouncedAutoSaveLayout();
        }
      };
    });

    document.getElementById("btnAddGoal").onclick = () => {
      items.push({
        id: "b-" + Date.now(),
        title: "New Bucket List Dream",
        category: "Adventure",
        icon: "🌟",
        completed: false,
        targetDate: "Soon"
      });
      renderWidgetInspector("bucket_list");
      debouncedLiveUpdate();
      debouncedAutoSaveLayout();
    };
  };
})();
