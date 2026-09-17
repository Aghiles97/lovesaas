// public/js/heart-cursor.js
// Lightweight Floating Romantic Heart Cursor Trail (Zero Idle Overhead)

(() => {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'v2HeartCursorCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  const particles = [];
  const colors = ['#fb7185', '#f43f5e', '#fda4af', '#f59e0b', '#e11d48'];
  let lastX = 0;
  let lastY = 0;
  let animId = null;

  function drawHeart(x, y, size, color, alpha, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size / 16;
    ctx.moveTo(0, s * -4);
    ctx.bezierCurveTo(s * 5, s * -10, s * 11, s * -3, s * 11, s * 3);
    ctx.bezierCurveTo(s * 11, s * 8, s * 6, s * 13, 0, s * 17);
    ctx.bezierCurveTo(s * -6, s * 13, s * -11, s * 8, s * -11, s * 3);
    ctx.bezierCurveTo(s * -11, s * -3, s * -5, s * -10, 0, s * -4);
    ctx.closePath();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.024;
      p.rot += p.vRot;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      drawHeart(p.x, p.y, p.size, p.color, p.life, p.rot);
    }
    if (particles.length > 0) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = null;
    }
  }

  window.addEventListener('pointermove', (e) => {
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (dist < 14) return;
    lastX = e.clientX;
    lastY = e.clientY;

    particles.push({
      x: e.clientX + (Math.random() - 0.5) * 6,
      y: e.clientY + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 0.9,
      vy: -0.9 - Math.random() * 1.1,
      size: 9 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0.85,
      rot: (Math.random() - 0.5) * 0.4,
      vRot: (Math.random() - 0.5) * 0.04
    });

    if (!animId) animId = requestAnimationFrame(loop);
  }, { passive: true });
})();
