/**
 * Runtime Widget Engine: scratch-coupons.runtime.js
 * Modularized for high maintainability.
 */
function renderScratchCoupons() {
  const grid = document.getElementById("couponsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const couponsList = (typeof window !== "undefined" && Array.isArray(window.COUPONS) && window.COUPONS.length > 0)
    ? window.COUPONS
    : (typeof COUPONS !== "undefined" ? COUPONS : []);

  // Always start fresh — clear any stale redeemed state so all cards are scratchable
  if (typeof _origSetItem === "function") {
    _origSetItem("gf_redeemed_coupons", "[]");
  } else {
    try { localStorage.setItem("gf_redeemed_coupons", "[]"); } catch (e) {}
  }
  const redeemedList = [];

  const restartBtn = document.getElementById("restartCouponsBtn");
  if (restartBtn) {
    restartBtn.innerHTML = redeemedList.length > 0
      ? `🔄 Restart from 0 <span class="coupon-count-badge">(${redeemedList.length}/${couponsList.length} claimed)</span>`
      : "🔄 Restart from 0";
    if (!restartBtn.dataset.bound) {
      restartBtn.dataset.bound = "true";
      restartBtn.addEventListener("click", () => {
        if (!confirm("Restart all coupons from 0? You can scratch and claim them again! 🎟️💕")) return;
        localStorage.setItem("gf_redeemed_coupons", "[]");
        renderScratchCoupons();
        if (typeof audio !== "undefined" && audio.playSparkle) audio.playSparkle();
        if (typeof particles !== "undefined" && particles.burst) {
          particles.burst(window.innerWidth / 2, window.innerHeight / 2, 35);
        }
        if (typeof showComplimentToast === "function") {
          showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "Coupons restarted from 0! 🎟️✨");
        }
      });
    }
  }

  couponsList.forEach((c) => {
    const card = document.createElement("div");
    card.className = "coupon-card";
    const isRedeemed = redeemedList.includes(c.title);

    card.innerHTML = `
      <span class="coupon-badge">${c.badge || "Coupon Pass"}</span>
      <div class="coupon-icon">${c.icon || "🎁"}</div>
      <h3 class="coupon-title">${c.title || "Love Voucher"}</h3>
      <p class="coupon-sub">${c.sub || c.desc || ""}</p>
      ${isRedeemed ? '<div class="coupon-redeemed-stamp">REDEEMED • CLAIMED WITH KISS 💕</div>' : '<canvas class="scratch-canvas"></canvas>'}
    `;

    if (!isRedeemed) {
      const canvas = card.querySelector(".scratch-canvas");
      setupScratchCanvas(canvas, c, card);
    }
    grid.appendChild(card);
  });
}

window.scratchAllCoupons = function() {
  const cards = document.querySelectorAll("#couponsGrid .coupon-card");
  cards.forEach(card => {
    const canvas = card.querySelector(".scratch-canvas");
    if (canvas) {
      canvas.style.transition = "opacity 0.4s ease";
      canvas.style.opacity = "0";
      setTimeout(() => canvas.remove(), 400);
      if (!card.querySelector(".coupon-redeemed-stamp") && !card.querySelector(".coupon-redeem-btn")) {
        const redeemBtn = document.createElement("button");
        redeemBtn.className = "btn btn-primary coupon-redeem-btn";
        redeemBtn.textContent = "🎟️ Redeem & Claim with Kiss";
        redeemBtn.addEventListener("click", () => {
          redeemBtn.remove();
          const stamp = document.createElement("div");
          stamp.className = "coupon-redeemed-stamp";
          stamp.textContent = "REDEEMED • CLAIMED WITH KISS 💕";
          card.appendChild(stamp);
          if (typeof audio !== "undefined" && audio.playFanfare) audio.playFanfare();
        });
        card.appendChild(redeemBtn);
      }
    }
  });
  if (typeof audio !== "undefined" && audio.playChimeCascade) audio.playChimeCascade();
  if (typeof particles !== "undefined" && particles.burst) {
    particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
  }
};

window.resetAllCoupons = function() {
  try { localStorage.setItem("gf_redeemed_coupons", "[]"); } catch (e) {}
  renderScratchCoupons();
  if (typeof audio !== "undefined" && audio.playSparkle) audio.playSparkle();
};

function setupScratchCanvas(canvas, coupon, card) {
  const width = canvas.parentElement.clientWidth || 300;
  const height = canvas.parentElement.clientHeight || 200;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Metallic Rose Gold Foil Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#d4af37");
  grad.addColorStop(0.3, "#f9d29d");
  grad.addColorStop(0.6, "#ff9a9e");
  grad.addColorStop(1, "#fecfef");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Sparkle Foil Dust Pattern
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  for (let i = 0; i < 20; i++) {
    const sx = Math.random() * width;
    const sy = Math.random() * height;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.random() * 2 + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 4;
  ctx.font = "bold 15px 'Outfit', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✨ Scratch Metallic Foil ✨", width / 2, height / 2 - 8);
  ctx.font = "12px 'Outfit', sans-serif";
  ctx.fillText("Scratch to Reveal Lof Pass", width / 2, height / 2 + 12);
  ctx.shadowBlur = 0;

  let isDrawing = false;
  let cleared = false;

  const scratch = (x, y) => {
    if (cleared) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    audio.playScratch();

    checkScratchProgress();
  };

  const checkScratchProgress = () => {
    if (cleared) return;
    const imgData = ctx.getImageData(0, 0, width, height).data;
    let transparent = 0;
    for (let i = 3; i < imgData.length; i += 4 * 8) {
      if (imgData[i] === 0) transparent++;
    }
    const totalSampled = imgData.length / (4 * 8);
    if (transparent / totalSampled > 0.42) {
      cleared = true;
      canvas.style.transition = "opacity 0.5s ease";
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.remove();
        if (!card.querySelector(".coupon-redeemed-stamp") && !card.querySelector(".coupon-redeem-btn")) {
          const redeemBtn = document.createElement("button");
          redeemBtn.className = "btn btn-primary coupon-redeem-btn";
          redeemBtn.textContent = "🎟️ Redeem & Claim with Kiss";
          redeemBtn.addEventListener("click", () => {
            const list = JSON.parse(localStorage.getItem("gf_redeemed_coupons") || "[]");
            if (!list.includes(coupon.title)) {
              list.push(coupon.title);
              localStorage.setItem("gf_redeemed_coupons", JSON.stringify(list));
            }
            redeemBtn.remove();
            const stamp = document.createElement("div");
            stamp.className = "coupon-redeemed-stamp";
            stamp.textContent = "REDEEMED • CLAIMED WITH KISS 💕";
            card.appendChild(stamp);
            const rBtn = document.getElementById("restartCouponsBtn");
            if (rBtn) {
              const totalC = (typeof window !== "undefined" && Array.isArray(window.COUPONS) && window.COUPONS.length > 0) ? window.COUPONS.length : COUPONS.length;
              rBtn.innerHTML = `🔄 Restart from 0 <span class="coupon-count-badge">(${list.length}/${totalC} claimed)</span>`;
            }
            audio.playFanfare();
            particles.burst(window.innerWidth / 2, window.innerHeight / 2, 45);
            state.bonusLof += 1000000000000;
            showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, `🎉 '${coupon.title}' Officially Claimed & Stamped!`);
          });
          card.appendChild(redeemBtn);
        }
      }, 500);
      audio.playChimeCascade();
      const b = canvas.getBoundingClientRect();
      particles.burst(b.left + b.width / 2, b.top + b.height / 2, 30);
    }
  };

  const getPos = (e) => {
    const r = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    const scaleX = r.width ? (canvas.width / r.width) : 1;
    const scaleY = r.height ? (canvas.height / r.height) : 1;
    return { x: (clientX - r.left) * scaleX, y: (clientY - r.top) * scaleY };
  };

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const { x, y } = getPos(e);
    scratch(x, y);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    scratch(x, y);
  });

  window.addEventListener("mouseup", () => (isDrawing = false));

  canvas.addEventListener("touchstart", (e) => {
    isDrawing = true;
    const { x, y } = getPos(e);
    scratch(x, y);
  }, { passive: true });

  canvas.addEventListener("touchmove", (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    scratch(x, y);
  }, { passive: true });

  canvas.addEventListener("touchend", () => (isDrawing = false));
}

// Kiss Stamp & Kiss Flurry System
