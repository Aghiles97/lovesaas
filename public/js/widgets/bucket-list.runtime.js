(function() {
  window.setupBucketList = function(data, heroData) {
    const section = document.getElementById("bucketListSection");
    if (!section) return;

    const cards = Array.from(section.querySelectorAll(".bucket-card"));
    const tabs = Array.from(section.querySelectorAll(".bucket-tab"));
    const countEl = document.getElementById("bucketCompletedCount");
    const totalEl = document.getElementById("bucketTotalCount");
    const fillEl = document.getElementById("bucketProgressFill");
    const pctEl = document.getElementById("bucketProgressPct");

    let currentFilter = "all";

    const updateStats = () => {
      const total = cards.length;
      const completed = cards.filter(c => c.dataset.completed === "true").length;
      const pct = total ? Math.round((completed / total) * 100) : 0;

      if (countEl) countEl.textContent = completed;
      if (totalEl) totalEl.textContent = total;
      if (pctEl) pctEl.textContent = `${pct}%`;
      if (fillEl) fillEl.style.width = `${pct}%`;
    };

    const applyFilter = (filter) => {
      currentFilter = filter;
      tabs.forEach(t => t.classList.toggle("active", t.dataset.filter === filter));

      cards.forEach(card => {
        const isDone = card.dataset.completed === "true";
        const cat = (card.dataset.category || "").toLowerCase();
        const filterMap = {
          all: true,
          completed: isDone,
          todo: !isDone
        };
        const visible = filterMap[filter] !== undefined ? filterMap[filter] : cat === filter;
        card.style.display = visible ? "flex" : "none";
      });
    };

    tabs.forEach(tab => {
      tab.onclick = () => applyFilter(tab.dataset.filter);
    });

    cards.forEach(card => {
      const checkbox = card.querySelector(".bucket-checkbox");
      if (!checkbox) return;

      checkbox.onchange = (e) => {
        const isChecked = e.target.checked;
        card.classList.toggle("is-completed", isChecked);
        card.dataset.completed = isChecked ? "true" : "false";

        if (isChecked) {
          const rect = checkbox.getBoundingClientRect();
          if (typeof confetti === "function") {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
              },
              colors: ["#ff4365", "#fb7185", "#f43f5e", "#ffd166", "#10b981"]
            });
          }
          if (typeof audio !== "undefined" && audio.playSparkle) audio.playSparkle();
          if (typeof particles !== "undefined" && particles.burst) {
            particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
          }
        }

        updateStats();
        applyFilter(currentFilter);
      };
    });

    updateStats();
  };
})();
