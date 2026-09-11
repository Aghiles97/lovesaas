(function() {
  if (typeof escapeHtml !== "function") {
    const esc = (s) => (s == null ? "" : String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"));
    if (typeof window !== "undefined") window.escapeHtml = esc;
    else global.escapeHtml = esc;
  }
  if (typeof safeVal !== "function") {
    const sv = (v) => String(v == null ? "" : v).replace(/"/g, "&quot;");
    if (typeof window !== "undefined") window.safeVal = sv;
    else global.safeVal = sv;
  }

  const defaultItems = [
    { id: "b1", title: "Watch Northern Lights from glass igloo", category: "Travel", icon: "🌌", completed: true, targetDate: "Dec 2023" },
    { id: "b2", title: "Adopt our rescue puppy", category: "Home", icon: "🐶", completed: true, targetDate: "May 2024" },
    { id: "b3", title: "Road trip along the Amalfi Coast", category: "Adventure", icon: "🚗", completed: false, targetDate: "Summer 2027" },
    { id: "b4", title: "Take authentic pasta making class in Rome", category: "Romance", icon: "🍝", completed: true, targetDate: "Sep 2023" },
    { id: "b5", title: "Hot air balloon ride in Cappadocia at sunrise", category: "Adventure", icon: "🎈", completed: false, targetDate: "Autumn 2027" },
    { id: "b6", title: "Build our cozy countryside home with a garden", category: "Home", icon: "🏡", completed: false, targetDate: "2029" }
  ];

  const renderTemplate = (data = {}, rootData = {}) => {
    const tag = data.tag || "Our Shared Horizon 🎯";
    const title = data.title || "The Couple Bucket List";
    const desc = data.desc || "All the dreams we've conquered together and the wild adventures still waiting for us.";
    const rawItems = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : defaultItems);
    const items = rawItems.length ? rawItems : defaultItems;

    const completedCount = items.filter(i => !!i.completed).length;
    const totalCount = items.length;
    const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    const categories = ["Travel", "Adventure", "Romance", "Home"];

    const itemsHtml = items.map(item => `
      <div class="bucket-card ${item.completed ? "is-completed" : ""}" data-id="${escapeHtml(item.id || "")}" data-category="${escapeHtml(item.category || "General")}" data-completed="${item.completed ? "true" : "false"}">
        <label class="bucket-checkbox-label">
          <input type="checkbox" class="bucket-checkbox" data-goal-id="${escapeHtml(item.id || "")}" ${item.completed ? "checked" : ""}>
          <span class="bucket-checkmark"></span>
        </label>
        <span class="bucket-icon">${escapeHtml(item.icon || "🎯")}</span>
        <div class="bucket-details">
          <div class="bucket-header-line">
            <span class="bucket-title">${escapeHtml(item.title || "")}</span>
            <span class="bucket-category-pill badge-${escapeHtml((item.category || "general").toLowerCase())}">${escapeHtml(item.category || "General")}</span>
          </div>
          ${item.targetDate ? `<span class="bucket-date">📅 ${escapeHtml(item.targetDate)}</span>` : ""}
        </div>
        <div class="bucket-completed-badge">CONQUERED ✨</div>
      </div>
    `).join("");

    return `
      <section class="section bucket-list-section" id="bucketListSection">
        <div class="container">
          <div class="bucket-list-box">
            <div class="section-heading">
              <span class="section-tag">${escapeHtml(tag)}</span>
              <h2 class="section-title">${escapeHtml(title)}</h2>
              <p class="section-desc">${escapeHtml(desc)}</p>
            </div>

            <div class="bucket-stats-panel">
              <div class="bucket-stats-header">
                <div class="bucket-stats-title">
                  <span>Dream Progress</span>
                  <span class="bucket-stats-counter">
                    <strong id="bucketCompletedCount">${completedCount}</strong> of <strong id="bucketTotalCount">${totalCount}</strong> Goals
                  </span>
                </div>
                <span class="bucket-stats-pct" id="bucketProgressPct">${pct}%</span>
              </div>
              <div class="bucket-progress-track">
                <div class="bucket-progress-fill" id="bucketProgressFill" style="width: ${pct}%;"></div>
              </div>
            </div>

            <div class="bucket-filter-tabs" id="bucketFilterTabs">
              <button type="button" class="bucket-tab active" data-filter="all">All (${totalCount})</button>
              <button type="button" class="bucket-tab" data-filter="completed">Completed ✨</button>
              <button type="button" class="bucket-tab" data-filter="todo">To Do 🎯</button>
              ${categories.map(c => `<button type="button" class="bucket-tab" data-filter="${escapeHtml(c.toLowerCase())}">${escapeHtml(c)}</button>`).join("")}
            </div>

            <div class="bucket-cards-grid" id="bucketCardsGrid">
              ${itemsHtml}
            </div>
          </div>
        </div>
      </section>
    `;
  };

  if (typeof module !== "undefined" && module.exports) module.exports = renderTemplate;
  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["bucket_list"] = renderTemplate;
  }
})();
