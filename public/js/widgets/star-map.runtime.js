(function() {
  const THEMES = {
    midnight: {
      bg1: "#060919",
      bg2: "#0d1b2a",
      grid: "rgba(147, 197, 253, 0.12)",
      line: "rgba(186, 230, 253, 0.45)",
      star: "#ffffff",
      glow: "rgba(147, 197, 253, 0.6)",
      text: "#93c5fd",
      milky: "rgba(125, 211, 252, 0.06)"
    },
    obsidian: {
      bg1: "#050505",
      bg2: "#141419",
      grid: "rgba(251, 191, 36, 0.1)",
      line: "rgba(253, 230, 138, 0.4)",
      star: "#fffbeb",
      glow: "rgba(251, 191, 36, 0.6)",
      text: "#fde68a",
      milky: "rgba(251, 191, 36, 0.04)"
    },
    indigo: {
      bg1: "#090418",
      bg2: "#1a0f37",
      grid: "rgba(216, 180, 254, 0.12)",
      line: "rgba(233, 213, 255, 0.45)",
      star: "#ffffff",
      glow: "rgba(192, 132, 252, 0.6)",
      text: "#d8b4fe",
      milky: "rgba(192, 132, 252, 0.06)"
    }
  };

  const CONSTELLATIONS_DATA = [
    {
      name: "Ursa Major",
      stars: [
        { id: "uma_dubhe", name: "Dubhe", ra: 11.06, dec: 61.75, mag: 1.8 },
        { id: "uma_merak", name: "Merak", ra: 11.03, dec: 56.38, mag: 2.3 },
        { id: "uma_phecda", name: "Phecda", ra: 11.90, dec: 53.69, mag: 2.4 },
        { id: "uma_megrez", name: "Megrez", ra: 12.25, dec: 57.03, mag: 3.3 },
        { id: "uma_alioth", name: "Alioth", ra: 12.90, dec: 55.96, mag: 1.8 },
        { id: "uma_mizar", name: "Mizar", ra: 13.40, dec: 54.92, mag: 2.2 },
        { id: "uma_alkaid", name: "Alkaid", ra: 13.79, dec: 49.31, mag: 1.9 }
      ],
      lines: [
        ["uma_merak", "uma_dubhe"], ["uma_merak", "uma_phecda"],
        ["uma_phecda", "uma_megrez"], ["uma_megrez", "uma_dubhe"],
        ["uma_megrez", "uma_alioth"], ["uma_alioth", "uma_mizar"],
        ["uma_mizar", "uma_alkaid"]
      ]
    },
    {
      name: "Orion",
      stars: [
        { id: "ori_betelgeuse", name: "Betelgeuse", ra: 5.92, dec: 7.41, mag: 0.5, color: "#ffad7a" },
        { id: "ori_rigel", name: "Rigel", ra: 5.24, dec: -8.20, mag: 0.1, color: "#b0d4ff" },
        { id: "ori_bellatrix", name: "Bellatrix", ra: 5.42, dec: 6.35, mag: 1.6 },
        { id: "ori_saiph", name: "Saiph", ra: 5.79, dec: -9.67, mag: 2.1 },
        { id: "ori_alnitak", name: "Alnitak", ra: 5.68, dec: -1.94, mag: 1.7 },
        { id: "ori_alnilam", name: "Alnilam", ra: 5.60, dec: -1.20, mag: 1.7 },
        { id: "ori_mintaka", name: "Mintaka", ra: 5.53, dec: -0.30, mag: 2.2 }
      ],
      lines: [
        ["ori_betelgeuse", "ori_bellatrix"], ["ori_betelgeuse", "ori_alnitak"],
        ["ori_bellatrix", "ori_mintaka"], ["ori_mintaka", "ori_alnilam"],
        ["ori_alnilam", "ori_alnitak"], ["ori_alnitak", "ori_saiph"],
        ["ori_mintaka", "ori_rigel"], ["ori_saiph", "ori_rigel"]
      ]
    },
    {
      name: "Cassiopeia",
      stars: [
        { id: "cas_caph", name: "Caph", ra: 0.15, dec: 59.15, mag: 2.3 },
        { id: "cas_schedar", name: "Schedar", ra: 0.68, dec: 56.54, mag: 2.2 },
        { id: "cas_gamma", name: "Navi", ra: 0.94, dec: 60.72, mag: 2.1 },
        { id: "cas_ruchbah", name: "Ruchbah", ra: 1.43, dec: 60.23, mag: 2.7 },
        { id: "cas_segin", name: "Segin", ra: 1.90, dec: 63.67, mag: 3.3 }
      ],
      lines: [
        ["cas_caph", "cas_schedar"], ["cas_schedar", "cas_gamma"],
        ["cas_gamma", "cas_ruchbah"], ["cas_ruchbah", "cas_segin"]
      ]
    },
    {
      name: "Cygnus",
      stars: [
        { id: "cyg_deneb", name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25, color: "#dbeafe" },
        { id: "cyg_albireo", name: "Albireo", ra: 19.51, dec: 27.96, mag: 3.0, color: "#fef08a" },
        { id: "cyg_sadr", name: "Sadr", ra: 20.37, dec: 40.26, mag: 2.2 },
        { id: "cyg_gienah", name: "Gienah", ra: 20.77, dec: 33.97, mag: 2.5 },
        { id: "cyg_fawaris", name: "Fawaris", ra: 19.75, dec: 45.13, mag: 2.9 }
      ],
      lines: [
        ["cyg_deneb", "cyg_sadr"], ["cyg_sadr", "cyg_albireo"],
        ["cyg_gienah", "cyg_sadr"], ["cyg_sadr", "cyg_fawaris"]
      ]
    },
    {
      name: "Taurus",
      stars: [
        { id: "tau_aldebaran", name: "Aldebaran", ra: 4.60, dec: 16.51, mag: 0.85, color: "#f97316" },
        { id: "tau_elnath", name: "Elnath", ra: 5.44, dec: 28.61, mag: 1.65 },
        { id: "tau_tianguan", name: "Tianguan", ra: 5.63, dec: 21.14, mag: 3.0 },
        { id: "tau_alcyone", name: "Alcyone", ra: 3.79, dec: 24.11, mag: 2.85 }
      ],
      lines: [
        ["tau_aldebaran", "tau_elnath"], ["tau_aldebaran", "tau_tianguan"],
        ["tau_aldebaran", "tau_alcyone"]
      ]
    },
    {
      name: "Canis Major",
      stars: [
        { id: "cma_sirius", name: "Sirius", ra: 6.75, dec: -16.72, mag: -1.46, color: "#bae6fd" },
        { id: "cma_adhara", name: "Adhara", ra: 6.98, dec: -28.97, mag: 1.5 },
        { id: "cma_wezen", name: "Wezen", ra: 7.14, dec: -26.39, mag: 1.8 },
        { id: "cma_mirzam", name: "Mirzam", ra: 6.38, dec: -17.96, mag: 2.0 },
        { id: "cma_aludra", name: "Aludra", ra: 7.40, dec: -29.30, mag: 2.4 }
      ],
      lines: [
        ["cma_mirzam", "cma_sirius"], ["cma_sirius", "cma_wezen"],
        ["cma_wezen", "cma_adhara"], ["cma_wezen", "cma_aludra"]
      ]
    },
    {
      name: "Scorpius",
      stars: [
        { id: "sco_antares", name: "Antares", ra: 16.49, dec: -26.43, mag: 0.96, color: "#ef4444" },
        { id: "sco_graffias", name: "Acrab", ra: 16.09, dec: -19.80, mag: 2.6 },
        { id: "sco_dschubba", name: "Dschubba", ra: 16.00, dec: -22.62, mag: 2.3 },
        { id: "sco_shaula", name: "Shaula", ra: 17.56, dec: -37.10, mag: 1.6 },
        { id: "sco_sargas", name: "Sargas", ra: 17.62, dec: -43.00, mag: 1.8 }
      ],
      lines: [
        ["sco_graffias", "sco_dschubba"], ["sco_dschubba", "sco_antares"],
        ["sco_antares", "sco_shaula"], ["sco_shaula", "sco_sargas"]
      ]
    }
  ];

  const BG_STARS = Array.from({ length: 180 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const seed2 = (seed * 9301 + 49297) % 233280;
    const seed3 = (seed2 * 9301 + 49297) % 233280;
    return {
      ra: (seed / 233280) * 24,
      dec: (seed2 / 233280) * 160 - 75,
      mag: 3.2 + (seed3 / 233280) * 2.8,
      phase: (seed % 1000) / 1000 * Math.PI * 2
    };
  });

  window.setupStarMap = function(data, heroData) {
    if (window._starMapAnimId) {
      cancelAnimationFrame(window._starMapAnimId);
      window._starMapAnimId = null;
    }

    const section = document.getElementById("starMapSection");
    if (!section) return;

    const canvas = document.getElementById("starMapCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const tooltip = document.getElementById("starMapTooltip");

    const sm = data || {};
    let lat = Number(sm.latitude != null ? sm.latitude : (section.dataset.lat || 48.8566));
    let lng = Number(sm.longitude != null ? sm.longitude : (section.dataset.lng || 2.3522));
    let rawDate = sm.observationDate || section.dataset.date || (heroData && heroData.anniversaryDate) || "2024-06-15T22:00";
    let themeKey = sm.mapTheme || section.dataset.theme || "midnight";
    let showConstellations = sm.showConstellations !== undefined ? Boolean(sm.showConstellations) : section.dataset.constellations !== "false";
    let showStarNames = sm.showStarNames !== undefined ? Boolean(sm.showStarNames) : section.dataset.starnames !== "false";

    let obsDate = new Date(rawDate);
    if (isNaN(obsDate.getTime())) obsDate = new Date();

    const dDays = (Date.UTC(obsDate.getFullYear(), obsDate.getMonth(), obsDate.getDate(), obsDate.getHours(), obsDate.getMinutes()) - Date.UTC(2000, 0, 1, 12, 0)) / 86400000;
    const gmst = (18.697374558 + 24.06570982441908 * dDays) % 24;
    let lst = (gmst + lng / 15) % 24;
    if (lst < 0) lst += 24;

    const phi = (lat * Math.PI) / 180;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    const project = (ra, dec) => {
      const ha = (lst - ra) * 15 * (Math.PI / 180);
      const delta = (dec * Math.PI) / 180;
      const sinDelta = Math.sin(delta);
      const cosDelta = Math.cos(delta);

      const sinAlt = sinPhi * sinDelta + cosPhi * cosDelta * Math.cos(ha);
      const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
      const cosAlt = Math.cos(alt);

      let az = 0;
      if (cosAlt > 1e-6) {
        const cosAz = (sinDelta - sinPhi * sinAlt) / (cosPhi * cosAlt);
        az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
        if (Math.sin(ha) > 0) az = 2 * Math.PI - az;
      }

      const z = (Math.PI / 2 - alt) / Math.PI;
      const r = z * 240;
      return {
        x: 300 + Math.sin(az) * r,
        y: 300 - Math.cos(az) * r,
        alt,
        visible: alt > -0.2
      };
    };

    let hoveredStar = null;
    let mousePos = { x: -999, y: -999 };

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scale = canvas.width / rect.width;
      mousePos = {
        x: (e.clientX - rect.left) * scale,
        y: (e.clientY - rect.top) * scale
      };
    };

    canvas.onmouseleave = () => {
      mousePos = { x: -999, y: -999 };
      hoveredStar = null;
      if (tooltip) tooltip.style.opacity = "0";
    };

    const render = (time) => {
      const th = THEMES[themeKey] || THEMES.midnight;
      const cx = 300, cy = 300, radius = 245;

      ctx.clearRect(0, 0, 600, 600);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
      bgGrad.addColorStop(0, th.bg2);
      bgGrad.addColorStop(1, th.bg1);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 600);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((lst * 15 * Math.PI) / 180);
      const milkyGrad = ctx.createLinearGradient(-radius, -120, radius, 120);
      milkyGrad.addColorStop(0, "transparent");
      milkyGrad.addColorStop(0.3, th.milky);
      milkyGrad.addColorStop(0.7, th.milky);
      milkyGrad.addColorStop(1, "transparent");
      ctx.fillStyle = milkyGrad;
      ctx.fillRect(-radius, -140, radius * 2, 280);
      ctx.restore();

      ctx.strokeStyle = th.grid;
      ctx.lineWidth = 1;
      [80, 160, 240].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      BG_STARS.forEach(s => {
        const p = project(s.ra, s.dec);
        if (!p.visible) return;
        const twinkle = 1 + 0.15 * Math.sin(time * 0.003 + s.phase);
        const r = Math.max(0.6, (4.5 - s.mag * 0.5) * twinkle);
        ctx.fillStyle = th.star;
        ctx.globalAlpha = Math.max(0.2, Math.min(0.85, (6 - s.mag) / 3));
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const starCoordsMap = {};
      let nearestStar = null;
      let minDistance = 14;

      CONSTELLATIONS_DATA.forEach(group => {
        group.stars.forEach(s => {
          const pt = project(s.ra, s.dec);
          starCoordsMap[s.id] = { ...s, pt, constellation: group.name };

          if (pt.visible) {
            const dist = Math.hypot(pt.x - mousePos.x, pt.y - mousePos.y);
            if (dist < minDistance) {
              minDistance = dist;
              nearestStar = starCoordsMap[s.id];
            }
          }
        });

        if (showConstellations) {
          ctx.strokeStyle = th.line;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
          group.lines.forEach(([id1, id2]) => {
            const p1 = starCoordsMap[id1]?.pt;
            const p2 = starCoordsMap[id2]?.pt;
            if (p1 && p2 && p1.visible && p2.visible) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
          ctx.setLineDash([]);
        }
      });

      Object.values(starCoordsMap).forEach(s => {
        if (!s.pt.visible) return;
        const twinkle = 1 + 0.12 * Math.sin(time * 0.004 + s.ra);
        const baseR = Math.max(1.8, (4 - s.mag * 0.8) * 1.5);
        const r = baseR * twinkle;

        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color || th.glow;
        ctx.fillStyle = s.color || th.star;
        ctx.beginPath();
        ctx.arc(s.pt.x, s.pt.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (showStarNames) {
          ctx.font = "600 10px -apple-system, sans-serif";
          ctx.fillStyle = th.text;
          ctx.fillText(s.name, s.pt.x + r + 4, s.pt.y + 3);
        }
      });

      hoveredStar = nearestStar;
      if (hoveredStar && hoveredStar.pt.visible) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hoveredStar.pt.x, hoveredStar.pt.y, 10 + 2 * Math.sin(time * 0.008), 0, Math.PI * 2);
        ctx.stroke();

        if (tooltip) {
          tooltip.innerHTML = `
            <strong>${hoveredStar.name}</strong>
            <span>${hoveredStar.constellation}</span>
            <small>Mag: ${hoveredStar.mag} • Alt: ${(hoveredStar.pt.alt * 180 / Math.PI).toFixed(1)}°</small>
          `;
          const rect = canvas.getBoundingClientRect();
          const tipX = (hoveredStar.pt.x / 600) * rect.width;
          const tipY = (hoveredStar.pt.y / 600) * rect.height;
          tooltip.style.left = `${tipX}px`;
          tooltip.style.top = `${tipY - 14}px`;
          tooltip.style.opacity = "1";
        }
      } else if (tooltip) {
        tooltip.style.opacity = "0";
      }

      ctx.restore();

      ctx.save();
      const goldGrad = ctx.createLinearGradient(0, 0, 600, 600);
      goldGrad.addColorStop(0, "#d4af37");
      goldGrad.addColorStop(0.5, "#fef08a");
      goldGrad.addColorStop(1, "#b45309");

      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 7, 0, Math.PI * 2);
      ctx.stroke();

      for (let deg = 0; deg < 360; deg += 5) {
        const rad = (deg * Math.PI) / 180;
        const tickLen = deg % 30 === 0 ? 8 : (deg % 10 === 0 ? 5 : 3);
        const x1 = cx + Math.sin(rad) * (radius - 2);
        const y1 = cy - Math.cos(rad) * (radius - 2);
        const x2 = cx + Math.sin(rad) * (radius - 2 - tickLen);
        const y2 = cy - Math.cos(rad) * (radius - 2 - tickLen);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      window._starMapAnimId = requestAnimationFrame(render);
    };

    window._starMapAnimId = requestAnimationFrame(render);

    const btnConst = document.getElementById("btnToggleConstellations");
    if (btnConst) {
      btnConst.onclick = (e) => {
        e.preventDefault();
        showConstellations = !showConstellations;
        btnConst.classList.toggle("active", showConstellations);
        const stateEl = btnConst.querySelector(".toggle-state");
        if (stateEl) stateEl.textContent = showConstellations ? "ON" : "OFF";
      };
    }

    const btnStars = document.getElementById("btnToggleStarNames");
    if (btnStars) {
      btnStars.onclick = (e) => {
        e.preventDefault();
        showStarNames = !showStarNames;
        btnStars.classList.toggle("active", showStarNames);
        const stateEl = btnStars.querySelector(".toggle-state");
        if (stateEl) stateEl.textContent = showStarNames ? "ON" : "OFF";
      };
    }

    section.querySelectorAll(".celestial-theme-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const t = btn.dataset.theme;
        if (t && THEMES[t]) {
          themeKey = t;
          section.querySelectorAll(".celestial-theme-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        }
      };
    });
  };
})();
