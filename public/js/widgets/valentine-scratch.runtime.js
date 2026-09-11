/**
 * Runtime: valentine_scratch
 * Canvas scratch-to-reveal with confetti
 */
(function() {
  window.setupValentineScratch = function() {
    const canvas = document.getElementById("vsScratchCanvas");
    const container = document.getElementById("vsScratchContainer");
    const progressFill = document.getElementById("vsProgressFill");
    const progressText = document.getElementById("vsProgressText");
    const resetBtn = document.getElementById("vsResetBtn");
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let revealed = false;
    const overlayColor = canvas.dataset.overlayColor || "#e84393";

    function initCanvas() {
      revealed = false;
      const wrap = container.closest(".vs-card-wrap");
      if (wrap) wrap.classList.remove("vs-revealed");
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      canvas.style.opacity = "1";
      canvas.style.pointerEvents = "auto";

      // Gradient overlay
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, overlayColor);
      grad.addColorStop(1, adjustColor(overlayColor, -30));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Heart pattern
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px serif";
      for (let x = 20; x < canvas.width; x += 60) {
        for (let y = 30; y < canvas.height; y += 60) {
          ctx.fillText("♥", x + (y % 120 === 0 ? 15 : 0), y);
        }
      }
      ctx.globalAlpha = 1.0;

      // Instruction text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨ Scratch Here! ✨", canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = "14px -apple-system, sans-serif";
      ctx.fillText("Reveal your secret date itinerary", canvas.width / 2, canvas.height / 2 + 20);

      ctx.globalCompositeOperation = "destination-out";
      updateProgress();
    }

    function adjustColor(hex, amount) {
      const num = parseInt(hex.replace("#", ""), 16);
      const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
      const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
    }

    function scratch(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }

    function calcProgress() {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparent = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) transparent++;
      }
      return transparent / (imageData.data.length / 4);
    }

    function updateProgress() {
      const pct = Math.round(calcProgress() * 100);
      progressFill.style.width = pct + "%";
      progressText.textContent = pct + "% scratched";
      if (pct >= 60 && !revealed) revealCard();
    }

    function revealCard() {
      revealed = true;
      const wrap = container.closest(".vs-card-wrap");
      if (wrap) wrap.classList.add("vs-revealed");
      progressFill.style.width = "100%";
      progressText.textContent = "🎉 Revealed!";
      spawnConfetti();
    }

    function spawnConfetti() {
      const colors = ["#e84393", "#fd79a8", "#ff6b6b", "#feca57", "#ff9ff3", "#48dbfb"];
      for (let i = 0; i < 40; i++) {
        const el = document.createElement("div");
        el.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:${colors[i % colors.length]};top:50%;left:50%;z-index:20;pointer-events:none;`;
        const angle = (Math.PI * 2 * i) / 40;
        const dist = 60 + Math.random() * 120;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        container.appendChild(el);
        el.animate([
          { transform: "translate(-50%,-50%) scale(0)", opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`, opacity: 0 }
        ], { duration: 800 + Math.random() * 400, easing: "cubic-bezier(.25,.46,.45,.94)" })
        .onfinish = () => el.remove();
      }
    }

    canvas.addEventListener("mousedown", (e) => { isDrawing = true; const p = getPos(e); scratch(p.x, p.y); });
    canvas.addEventListener("mousemove", (e) => { if (!isDrawing) return; const p = getPos(e); scratch(p.x, p.y); updateProgress(); });
    canvas.addEventListener("mouseup", () => { isDrawing = false; updateProgress(); });
    canvas.addEventListener("mouseleave", () => { isDrawing = false; });

    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); isDrawing = true; const p = getPos(e); scratch(p.x, p.y); }, { passive: false });
    canvas.addEventListener("touchmove", (e) => { e.preventDefault(); if (!isDrawing) return; const p = getPos(e); scratch(p.x, p.y); updateProgress(); }, { passive: false });
    canvas.addEventListener("touchend", () => { isDrawing = false; updateProgress(); });

    if (resetBtn) resetBtn.onclick = () => { ctx.globalCompositeOperation = "source-over"; initCanvas(); };

    initCanvas();
    window.addEventListener("resize", () => { if (!revealed) initCanvas(); });
  };
})();
