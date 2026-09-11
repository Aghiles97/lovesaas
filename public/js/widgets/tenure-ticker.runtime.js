(function() {
  let timerInterval = null;

  window.setupTenureTicker = function(data, heroData) {
    if (window._tenureTickerInterval) {
      clearInterval(window._tenureTickerInterval);
      window._tenureTickerInterval = null;
    }

    const section = document.getElementById("tenureTickerSection");
    if (!section) return;

    const rawStart = (data && (data.startDate || data.anniversaryDate)) || section.dataset.startdate || (heroData && heroData.anniversaryDate) || "2023-01-01T00:00";
    const rawMilestone = (data && (data.milestoneDate || data.nextMilestoneDate)) || section.dataset.milestonedate || "2025-09-27T00:00";

    const startTime = new Date(rawStart).getTime();
    const milestoneTime = new Date(rawMilestone).getTime();

    const dom = {
      y: document.getElementById("tickerYears"),
      m: document.getElementById("tickerMonths"),
      d: document.getElementById("tickerDays"),
      h: document.getElementById("tickerHours"),
      mi: document.getElementById("tickerMinutes"),
      s: document.getElementById("tickerSeconds"),
      rd: document.getElementById("milestoneRemainDays"),
      rh: document.getElementById("milestoneRemainHours"),
      rmi: document.getElementById("milestoneRemainMinutes"),
      rs: document.getElementById("milestoneRemainSeconds"),
      bar: document.getElementById("milestoneProgressFill"),
      pct: document.getElementById("milestoneProgressPct")
    };

    const updateTicker = () => {
      const now = new Date();
      const nowMs = now.getTime();
      const start = new Date(rawStart);

      let y = 0, m = 0, d = 0, h = 0, mi = 0, s = 0;
      if (!isNaN(startTime) && nowMs >= startTime) {
        y = now.getFullYear() - start.getFullYear();
        m = now.getMonth() - start.getMonth();
        d = now.getDate() - start.getDate();
        h = now.getHours() - start.getHours();
        mi = now.getMinutes() - start.getMinutes();
        s = now.getSeconds() - start.getSeconds();

        if (s < 0) { s += 60; mi--; }
        if (mi < 0) { mi += 60; h--; }
        if (h < 0) { h += 24; d--; }
        if (d < 0) {
          d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
          m--;
        }
        if (m < 0) { m += 12; y--; }
      }

      if (dom.y) dom.y.textContent = Math.max(0, y);
      if (dom.m) dom.m.textContent = Math.max(0, m);
      if (dom.d) dom.d.textContent = Math.max(0, d);
      if (dom.h) dom.h.textContent = String(Math.max(0, h)).padStart(2, "0");
      if (dom.mi) dom.mi.textContent = String(Math.max(0, mi)).padStart(2, "0");
      if (dom.s) dom.s.textContent = String(Math.max(0, s)).padStart(2, "0");

      if (!isNaN(milestoneTime)) {
        const remainMs = Math.max(0, milestoneTime - nowMs);
        const rd = Math.floor(remainMs / 86400000);
        const rh = Math.floor((remainMs % 86400000) / 3600000);
        const rmi = Math.floor((remainMs % 3600000) / 60000);
        const rs = Math.floor((remainMs % 60000) / 1000);

        if (dom.rd) dom.rd.textContent = rd;
        if (dom.rh) dom.rh.textContent = String(rh).padStart(2, "0");
        if (dom.rmi) dom.rmi.textContent = String(rmi).padStart(2, "0");
        if (dom.rs) dom.rs.textContent = String(rs).padStart(2, "0");

        const totalSpan = milestoneTime - startTime;
        const elapsedSpan = nowMs - startTime;
        const progress = totalSpan > 0 ? Math.min(100, Math.max(0, (elapsedSpan / totalSpan) * 100)) : 100;
        const formattedPct = progress.toFixed(1) + "%";

        if (dom.bar) dom.bar.style.width = formattedPct;
        if (dom.pct) dom.pct.textContent = formattedPct;
      }
    };

    updateTicker();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTicker, 1000);
    window._tenureTickerInterval = timerInterval;
  };
})();
