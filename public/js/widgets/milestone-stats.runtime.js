/**
 * Runtime Engine: Milestone Stats Widget
 */
(function() {
  let timerInterval = null;

  window.setupMilestoneStats = function(data, heroData) {
    if (window._milestoneStatsInterval) {
      clearInterval(window._milestoneStatsInterval);
      window._milestoneStatsInterval = null;
    }
    const section = document.getElementById("milestoneStatsSection");
    if (!section) return;

    const rawDate = (data && data.birthDate) || section.dataset.birthdate || (heroData && heroData.anniversaryDate) || "2000-01-01T00:00";
    let birthTime = new Date(rawDate).getTime();
    if (isNaN(birthTime)) birthTime = new Date("2000-01-01T00:00").getTime();

    function formatNumber(num) {
      return Math.floor(num).toLocaleString();
    }

    function updateCounters() {
      const now = Date.now();
      const diffMs = Math.max(0, now - birthTime);
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const elDays = document.getElementById("milestoneDays");
      const elHours = document.getElementById("milestoneHours");
      const elMinutes = document.getElementById("milestoneMinutes");
      const elSeconds = document.getElementById("milestoneSeconds");

      if (elDays) elDays.textContent = formatNumber(days);
      if (elHours) elHours.textContent = String(hours).padStart(2, "0");
      if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, "0");
      if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, "0");

      // Update quirky metric cards
      const cards = section.querySelectorAll(".quirky-metric-card");
      cards.forEach(card => {
        const id = card.dataset.metricId;
        const factor = parseFloat(card.dataset.factor) || 1;
        const valEl = document.getElementById("metric_val_" + id);
        if (!valEl) return;

        if (id === "solar") {
          valEl.textContent = (days / 365.25).toFixed(2);
        } else {
          valEl.textContent = formatNumber(days * factor);
        }
      });
    }

    updateCounters();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateCounters, 1000);
    window._milestoneStatsInterval = timerInterval;

    window.updateMilestoneCounters = updateCounters;
  };
})();
