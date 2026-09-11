// Ambient Background Particle Engine
class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.running = true;
    this.updateSymbols();
    this.resize();
    window.addEventListener("resize", () => this.resize());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.running = false;
      } else if (!this.running) {
        this.running = true;
        this.animate();
      }
    });
    this.lastFrameTime = 0;
    this.targetInterval = 33;
    this.initParticles();
    this.animate();
  }

  updateSymbols() {
    const activeTheme = document.documentElement.getAttribute("data-theme") || document.body.getAttribute("data-theme") || localStorage.getItem("gf_theme") || "";
    const cleanTheme = activeTheme.replace(/^theme-/, "");

    if (cleanTheme.includes("img-")) {
      this.symbols = [];
      this.particles = [];
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      return;
    }

    const style = localStorage.getItem("gf_particle_style");
    const map = {
      hearts: ["❤️", "💖", "💕", "💓", "💗", "🥰"],
      sparkles: ["✨", "⭐", "💫", "🌟", "🎇", "🪄"],
      sakura: ["🌸", "🌺", "🌷", "🌹", "💐", "✨"],
      kisses: ["💋", "😘", "😚", "😙", "❤️", "💖"],
      stars: ["⭐", "🌟", "✨", "💫", "🌠", "🌌"],
      birthday: ["🎂", "🎉", "✨", "🎈", "💖", "🥳"],
      "birthday-cake": ["🎂", "🎉", "✨", "🎈", "💖", "🥳"],
      "birthday-midnight": ["✨", "🍾", "🥂", "⭐", "💫", "👑"],
      "birthday-pastel": ["🧁", "🍓", "🍰", "🍭", "🌸", "🍬"],
      "birthday-carnival": ["🎈", "🎊", "🎉", "🎪", "🥳", "🎁"],
      "birthday-emoji": ["🎂", "🎉", "🎈", "🥳", "🎁", "🍾"],
      "birthday-pixel": ["👾", "🕹️", "⭐", "🎂", "💎", "⚡"],
      "birthday-neon": ["⚡", "✨", "🍸", "💖", "🌟", "🎆"],
      "birthday-papercraft": ["✂️", "💌", "🎈", "🎁", "🍰", "🌻"],
      "birthday-watercolor": ["🌸", "✨", "🎨", "🍰", "🌷", "💫"],
      "watercolor-frame": ["🎈", "❤️", "✨", "☁️", "🏹", "💖"],
      "pop-stickers": ["💋", "🧪", "💖", "💌", "🔒", "💍"],
      "doodle-tapestry": ["🧸", "🥂", "🌹", "🧁", "💌", "🏹"],
      "img-watercolor-frame": [],
      "img-pop-stickers": [],
      "img-doodle-tapestry": [],
      apology: ["🕊️", "🌸", "🤍", "✨", "💫", "🫂"],
      anniversary: ["💍", "🥂", "💖", "✨", "🌹", "👑"],
      scrapbook: ["📷", "💌", "🍂", "✨", "🎞️", "🧸"]
    };
    this.symbols = (style && map[style]) || map[cleanTheme] || map.hearts;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    if (!this.symbols || this.symbols.length === 0) {
      this.particles = [];
      return;
    }
    const isIframe = typeof window !== "undefined" && window.parent && window.parent !== window;
    if (isIframe) {
      this.particles = [];
      return;
    }
    const isMobile = window.innerWidth <= 640;
    const count = isMobile ? 3 : 6;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 8 + 10,
      symbol: this.symbols[Math.floor(Math.random() * this.symbols.length)],
      speedY: Math.random() * 0.4 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01
    }));
  }

  burst(originX, originY, count) {
    const isIframe = typeof window !== "undefined" && window.parent && window.parent !== window;
    if (isIframe) return;
    const finalCount = Math.min(count || 6, 8);
    for (let i = 0; i < finalCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.particles.push({
        x: originX,
        y: originY,
        size: Math.random() * 10 + 10,
        symbol: this.symbols[Math.floor(Math.random() * this.symbols.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 1.5,
        opacity: 0.8,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        isBurst: true,
        life: 0.8
      });
    }
  }

  animate(now = 0) {
    if (!this.running) return;
    requestAnimationFrame((t) => this.animate(t));
    if (now - this.lastFrameTime < this.targetInterval) return;
    this.lastFrameTime = now;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y -= p.speedY;
      p.rotation += p.rotSpeed;

      if (p.isBurst) {
        p.speedY += 0.16;
        p.life -= 0.015;
        p.opacity = Math.max(p.life, 0);
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      } else {
        if (p.y < -20) {
          p.y = this.canvas.height + 20;
          p.x = Math.random() * this.canvas.width;
        }
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.font = `${p.size}px sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(p.symbol, 0, 0);
      this.ctx.restore();
    }
  }
}

let particles;
