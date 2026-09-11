/**
 * Runtime Widget Engine: ambient-effects.runtime.js
 * Modularized for high maintainability.
 */
// Love Bubbles Engine
let _bubbleInterval = null;
function initLoveBubbles() {
  if (typeof window !== "undefined" && window.parent && window.parent !== window) return;
  const container = document.getElementById("bubbleContainer");
  if (!container) return;
  if (_bubbleInterval) clearInterval(_bubbleInterval);

  const spawnBubble = () => {
    if (document.hidden) return;
    const maxBubbles = 2;
    if (container.childElementCount >= maxBubbles) return;
    const bubble = document.createElement("div");
    bubble.className = "love-bubble";
    const size = Math.floor(Math.random() * 16) + 32;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 85 + 5}%`;
    bubble.style.animationDuration = `${Math.random() * 4 + 12}s`;

    const icon = document.createElement("span");
    icon.className = "love-bubble-icon";
    icon.textContent = ["💖", "✨", "🌸", "🥰"][Math.floor(Math.random() * 4)];
    bubble.appendChild(icon);

    bubble.addEventListener("click", () => {
      if (typeof audio !== "undefined" && audio.playKiss) audio.playKiss();
      const rect = bubble.getBoundingClientRect();
      if (typeof particles !== "undefined" && particles.burst) {
        particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 4);
      }

      const compliments = typeof BUBBLE_COMPLIMENTS !== "undefined" ? BUBBLE_COMPLIMENTS : ["You are my whole world 💕"];
      const compliment = compliments[Math.floor(Math.random() * compliments.length)];
      if (typeof showComplimentToast === "function") showComplimentToast(rect.left, rect.top, compliment);
      bubble.remove();
    });

    container.appendChild(bubble);
    setTimeout(() => bubble.remove(), 16000);
  };

  _bubbleInterval = setInterval(spawnBubble, 6000);
}

function showComplimentToast(x, y, text) {
  const toast = document.createElement("div");
  toast.className = "floating-compliment-toast";
  toast.textContent = text;
  if (window.innerWidth <= 640) {
    toast.style.left = "16px";
    toast.style.right = "16px";
    toast.style.margin = "0 auto";
    const safeTop = typeof y === "number" && !isNaN(y)
      ? Math.max(70, Math.min(y - 75, window.innerHeight - 130))
      : 80;
    toast.style.top = `${safeTop}px`;
  } else {
    toast.style.left = `${Math.min(Math.max(x - 50, 10), window.innerWidth - 260)}px`;
    toast.style.top = `${Math.max(70, y - 45)}px`;
  }
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Scratch Coupons Engine
let _magicCursorInit = false;
function initMagicCursor() {
  if (_magicCursorInit) return;
  if (typeof window !== "undefined" && window.parent && window.parent !== window) return;
  _magicCursorInit = true;
  const symbols = ["✨", "💖", "🌸"];
  let lastX = 0, lastY = 0;
  
  const spawnSparkle = (x, y) => {
    const dist = Math.hypot(x - lastX, y - lastY);
    if (dist < 60) return;
    lastX = x;
    lastY = y;

    const dot = document.createElement("span");
    dot.className = "magic-sparkle-dot";
    dot.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.fontSize = `${Math.floor(Math.random() * 4 + 10)}px`;
    document.body.appendChild(dot);

    setTimeout(() => dot.remove(), 600);
  };

  if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => spawnSparkle(e.clientX, e.clientY), { passive: true });
  }
}

  // Ambient Thematic Backdrop Illustrations Engine
  const THEME_BACKDROP_SVGS = {
    birthday: [
      {
        className: "art-float-slow",
        style: "top: 4%; left: 3%; width: 160px; height: 160px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M40 180 Q100 195 160 180" stroke-width="3"/><path d="M70 187 L80 196 L120 196 L130 187" stroke-width="2.5"/><rect x="42" y="130" width="116" height="50" rx="6" stroke-width="3"/><path d="M42 142 Q52 152 61 142 Q71 152 80 142 Q90 152 100 142 Q110 152 119 142 Q129 152 138 142 Q148 152 158 142" stroke-width="2.5"/><circle cx="60" cy="162" r="3" fill="currentColor"/><circle cx="80" cy="162" r="3" fill="currentColor"/><circle cx="100" cy="162" r="3" fill="currentColor"/><circle cx="120" cy="162" r="3" fill="currentColor"/><circle cx="140" cy="162" r="3" fill="currentColor"/><rect x="62" y="86" width="76" height="44" rx="5" stroke-width="3"/><path d="M62 96 Q72 104 81 96 Q91 104 100 96 Q110 104 119 96 Q129 104 138 96" stroke-width="2.5"/><path d="M75 114 Q85 120 95 114 Q105 120 115 114 Q125 120 130 114" stroke-width="2"/><rect x="78" y="52" width="44" height="34" rx="4" stroke-width="3"/><path d="M78 60 Q89 66 100 60 Q111 66 122 60" stroke-width="2.5"/><line x1="89" y1="52" x2="89" y2="34" stroke-width="2.5"/><path d="M89 34 C85 28 85 20 89 16 C93 20 93 28 89 34 Z" fill="currentColor"/><line x1="100" y1="52" x2="100" y2="28" stroke-width="3"/><path d="M100 28 C96 21 96 12 100 8 C104 12 104 21 100 28 Z" fill="currentColor"/><line x1="111" y1="52" x2="111" y2="34" stroke-width="2.5"/><path d="M111 34 C107 28 107 20 111 16 C115 20 115 28 111 34 Z" fill="currentColor"/><path d="M28 75 Q32 75 32 71 Q32 75 36 75 Q32 75 32 79 Q32 75 28 75 Z" fill="currentColor"/><path d="M165 95 Q169 95 169 91 Q169 95 173 95 Q169 95 169 99 Q169 95 165 95 Z" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 135px; height: 165px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 150 180" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="75" cy="50" rx="30" ry="38" stroke-width="3"/><path d="M75 88 L71 94 L79 94 Z" fill="currentColor"/><path d="M75 94 Q65 125 75 160" stroke-width="2"/><ellipse cx="45" cy="70" rx="25" ry="32" stroke-width="2.5"/><path d="M45 102 L41 107 L49 107 Z" fill="currentColor"/><path d="M45 107 Q55 130 75 160" stroke-width="2"/><ellipse cx="105" cy="70" rx="25" ry="32" stroke-width="2.5"/><path d="M105 102 L101 107 L109 107 Z" fill="currentColor"/><path d="M105 107 Q95 130 75 160" stroke-width="2"/><ellipse cx="75" cy="162" rx="6" ry="4" stroke-width="2"/></svg>`
      },
      {
        className: "art-float-mid",
        style: "top: 42%; left: 2.5%; width: 125px; height: 125px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 150 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M38 78 L48 135 L102 135 L112 78 Z" stroke-width="3"/><line x1="53" y1="79" x2="60" y2="135" stroke-width="1.8"/><line x1="68" y1="79" x2="72" y2="135" stroke-width="1.8"/><line x1="82" y1="79" x2="82" y2="135" stroke-width="1.8"/><line x1="97" y1="79" x2="92" y2="135" stroke-width="1.8"/><path d="M34 78 C25 68 35 55 48 60 C45 46 62 38 75 48 C85 35 106 42 105 58 C118 56 125 70 116 78 C110 84 40 84 34 78 Z" stroke-width="3"/><line x1="75" y1="46" x2="75" y2="22" stroke-width="2.5"/><path d="M75 22 C72 17 72 10 75 7 C78 10 78 17 75 22 Z" fill="currentColor"/><circle cx="58" cy="62" r="2" fill="currentColor"/><circle cx="75" cy="60" r="2" fill="currentColor"/><circle cx="92" cy="63" r="2" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-slow",
        style: "top: 38%; right: 3%; width: 160px; height: 160px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="80" cy="115" rx="60" ry="22" stroke-width="3"/><path d="M20 70 L20 115 C20 130 140 130 140 115 L140 70" stroke-width="3"/><ellipse cx="80" cy="70" rx="60" ry="22" stroke-width="3"/><path d="M20 75 Q30 90 40 76 Q50 92 60 77 Q70 94 80 78 Q90 92 100 77 Q110 93 120 76 Q130 90 140 75" stroke-width="2.5"/><line x1="45" y1="65" x2="45" y2="45" stroke-width="2.5"/><path d="M45 45 C43 40 43 33 45 30 C47 33 47 40 45 45 Z" fill="currentColor"/><line x1="62" y1="68" x2="62" y2="40" stroke-width="2.5"/><path d="M62 40 C60 35 60 28 62 25 C64 28 64 35 62 40 Z" fill="currentColor"/><line x1="80" y1="70" x2="80" y2="36" stroke-width="3"/><path d="M80 36 C77 30 77 21 80 17 C83 21 83 30 80 36 Z" fill="currentColor"/><line x1="98" y1="68" x2="98" y2="40" stroke-width="2.5"/><path d="M98 40 C96 35 96 28 98 25 C100 28 100 35 98 40 Z" fill="currentColor"/><line x1="115" y1="65" x2="115" y2="45" stroke-width="2.5"/><path d="M115 45 C113 40 113 33 115 30 C117 33 117 40 115 45 Z" fill="currentColor"/></svg>`
      },
      {
        className: "art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 140px; height: 140px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 150 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="35" y="65" width="80" height="65" rx="4" stroke-width="3"/><rect x="28" y="50" width="94" height="18" rx="4" stroke-width="3"/><line x1="75" y1="50" x2="75" y2="130" stroke-width="3"/><line x1="35" y1="95" x2="115" y2="95" stroke-width="3"/><path d="M75 50 C60 30 45 42 75 48 C105 42 90 30 75 50 Z" stroke-width="2.5"/><circle cx="75" cy="49" r="3" fill="currentColor"/><path d="M73 50 Q60 62 55 70" stroke-width="2"/><path d="M77 50 Q90 62 95 70" stroke-width="2"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 130px; height: 150px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 140 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="70,30 20,135 120,135" stroke-width="3"/><path d="M20 135 Q70 148 120 135" stroke-width="3"/><circle cx="70" cy="24" r="8" stroke-width="2.5" fill="none"/><path d="M42 90 Q70 102 98 90" stroke-width="2.5"/><path d="M54 62 Q70 70 86 62" stroke-width="2.5"/><circle cx="70" cy="116" r="3" fill="currentColor"/><circle cx="48" cy="118" r="2.5" fill="currentColor"/><circle cx="92" cy="118" r="2.5" fill="currentColor"/></svg>`
      }
    ],
    "birthday-cake": [
      {
        className: "art-float-slow",
        style: "top: 4%; left: 3%; width: 160px; height: 160px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M40 180 Q100 195 160 180" stroke-width="3"/><path d="M70 187 L80 196 L120 196 L130 187" stroke-width="2.5"/><rect x="42" y="130" width="116" height="50" rx="6" stroke-width="3"/><path d="M42 142 Q52 152 61 142 Q71 152 80 142 Q90 152 100 142 Q110 152 119 142 Q129 152 138 142 Q148 152 158 142" stroke-width="2.5"/><circle cx="60" cy="162" r="3" fill="currentColor"/><circle cx="80" cy="162" r="3" fill="currentColor"/><circle cx="100" cy="162" r="3" fill="currentColor"/><circle cx="120" cy="162" r="3" fill="currentColor"/><circle cx="140" cy="162" r="3" fill="currentColor"/><rect x="62" y="86" width="76" height="44" rx="5" stroke-width="3"/><path d="M62 96 Q72 104 81 96 Q91 104 100 96 Q110 104 119 96 Q129 104 138 96" stroke-width="2.5"/><path d="M75 114 Q85 120 95 114 Q105 120 115 114 Q125 120 130 114" stroke-width="2"/><rect x="78" y="52" width="44" height="34" rx="4" stroke-width="3"/><path d="M78 60 Q89 66 100 60 Q111 66 122 60" stroke-width="2.5"/><line x1="89" y1="52" x2="89" y2="34" stroke-width="2.5"/><path d="M89 34 C85 28 85 20 89 16 C93 20 93 28 89 34 Z" fill="currentColor"/><line x1="100" y1="52" x2="100" y2="28" stroke-width="3"/><path d="M100 28 C96 21 96 12 100 8 C104 12 104 21 100 28 Z" fill="currentColor"/><line x1="111" y1="52" x2="111" y2="34" stroke-width="2.5"/><path d="M111 34 C107 28 107 20 111 16 C115 20 115 28 111 34 Z" fill="currentColor"/><path d="M28 75 Q32 75 32 71 Q32 75 36 75 Q32 75 32 79 Q32 75 28 75 Z" fill="currentColor"/><path d="M165 95 Q169 95 169 91 Q169 95 173 95 Q169 95 169 99 Q169 95 165 95 Z" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 135px; height: 165px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 150 180" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="75" cy="50" rx="30" ry="38" stroke-width="3"/><path d="M75 88 L71 94 L79 94 Z" fill="currentColor"/><path d="M75 94 Q65 125 75 160" stroke-width="2"/><ellipse cx="45" cy="70" rx="25" ry="32" stroke-width="2.5"/><path d="M45 102 L41 107 L49 107 Z" fill="currentColor"/><path d="M45 107 Q55 130 75 160" stroke-width="2"/><ellipse cx="105" cy="70" rx="25" ry="32" stroke-width="2.5"/><path d="M105 102 L101 107 L109 107 Z" fill="currentColor"/><path d="M105 107 Q95 130 75 160" stroke-width="2"/><ellipse cx="75" cy="162" rx="6" ry="4" stroke-width="2"/></svg>`
      },
      {
        className: "art-float-mid",
        style: "top: 42%; left: 2.5%; width: 125px; height: 125px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 150 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M38 78 L48 135 L102 135 L112 78 Z" stroke-width="3"/><line x1="53" y1="79" x2="60" y2="135" stroke-width="1.8"/><line x1="68" y1="79" x2="72" y2="135" stroke-width="1.8"/><line x1="82" y1="79" x2="82" y2="135" stroke-width="1.8"/><line x1="97" y1="79" x2="92" y2="135" stroke-width="1.8"/><path d="M34 78 C25 68 35 55 48 60 C45 46 62 38 75 48 C85 35 106 42 105 58 C118 56 125 70 116 78 C110 84 40 84 34 78 Z" stroke-width="3"/><line x1="75" y1="46" x2="75" y2="22" stroke-width="2.5"/><path d="M75 22 C72 17 72 10 75 7 C78 10 78 17 75 22 Z" fill="currentColor"/><circle cx="58" cy="62" r="2" fill="currentColor"/><circle cx="75" cy="60" r="2" fill="currentColor"/><circle cx="92" cy="63" r="2" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-slow",
        style: "top: 38%; right: 3%; width: 160px; height: 160px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="80" cy="115" rx="60" ry="22" stroke-width="3"/><path d="M20 70 L20 115 C20 130 140 130 140 115 L140 70" stroke-width="3"/><ellipse cx="80" cy="70" rx="60" ry="22" stroke-width="3"/><path d="M20 75 Q30 90 40 76 Q50 92 60 77 Q70 94 80 78 Q90 92 100 77 Q110 93 120 76 Q130 90 140 75" stroke-width="2.5"/><line x1="45" y1="65" x2="45" y2="45" stroke-width="2.5"/><path d="M45 45 C43 40 43 33 45 30 C47 33 47 40 45 45 Z" fill="currentColor"/><line x1="62" y1="68" x2="62" y2="40" stroke-width="2.5"/><path d="M62 40 C60 35 60 28 62 25 C64 28 64 35 62 40 Z" fill="currentColor"/><line x1="80" y1="70" x2="80" y2="36" stroke-width="3"/><path d="M80 36 C77 30 77 21 80 17 C83 21 83 30 80 36 Z" fill="currentColor"/><line x1="98" y1="68" x2="98" y2="40" stroke-width="2.5"/><path d="M98 40 C96 35 96 28 98 25 C100 28 100 35 98 40 Z" fill="currentColor"/><line x1="115" y1="65" x2="115" y2="45" stroke-width="2.5"/><path d="M115 45 C113 40 113 33 115 30 C117 33 117 40 115 45 Z" fill="currentColor"/></svg>`
      },
      {
        className: "art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 140px; height: 140px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 150 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="35" y="65" width="80" height="65" rx="4" stroke-width="3"/><rect x="28" y="50" width="94" height="18" rx="4" stroke-width="3"/><line x1="75" y1="50" x2="75" y2="130" stroke-width="3"/><line x1="35" y1="95" x2="115" y2="95" stroke-width="3"/><path d="M75 50 C60 30 45 42 75 48 C105 42 90 30 75 50 Z" stroke-width="2.5"/><circle cx="75" cy="49" r="3" fill="currentColor"/><path d="M73 50 Q60 62 55 70" stroke-width="2"/><path d="M77 50 Q90 62 95 70" stroke-width="2"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 130px; height: 150px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 140 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="70,30 20,135 120,135" stroke-width="3"/><path d="M20 135 Q70 148 120 135" stroke-width="3"/><circle cx="70" cy="24" r="8" stroke-width="2.5" fill="none"/><path d="M42 90 Q70 102 98 90" stroke-width="2.5"/><path d="M54 62 Q70 70 86 62" stroke-width="2.5"/><circle cx="70" cy="116" r="3" fill="currentColor"/><circle cx="48" cy="118" r="2.5" fill="currentColor"/><circle cx="92" cy="118" r="2.5" fill="currentColor"/></svg>`
      }
    ],
    "birthday-midnight": [
      {
        className: "art-float-slow",
        style: "top: 4%; left: 3%; width: 160px; height: 160px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="100" cy="180" rx="75" ry="12" stroke-width="2.5"/><rect x="42" y="130" width="116" height="50" rx="4" stroke-width="3"/><line x1="42" y1="150" x2="158" y2="150" stroke-width="1.5" stroke-dasharray="6 3"/><rect x="62" y="85" width="76" height="45" rx="4" stroke-width="3"/><line x1="62" y1="105" x2="138" y2="105" stroke-width="1.5" stroke-dasharray="6 3"/><rect x="78" y="50" width="44" height="35" rx="3" stroke-width="3"/><line x1="88" y1="50" x2="88" y2="26" stroke-width="2.5"/><polygon points="88,18 90,23 95,25 90,27 88,32 86,27 81,25 86,23" fill="currentColor"/><line x1="100" y1="50" x2="100" y2="20" stroke-width="2.8"/><polygon points="100,10 103,16 109,18 103,20 100,26 97,20 91,18 97,16" fill="currentColor"/><line x1="112" y1="50" x2="112" y2="26" stroke-width="2.5"/><polygon points="112,18 114,23 119,25 114,27 112,32 110,27 105,25 110,23" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 140px; height: 165px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 150 180" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="75,20 82,42 105,42 86,56 93,78 75,64 57,78 64,56 45,42 68,42" stroke-width="2.8"/><ellipse cx="45" cy="85" rx="26" ry="34" stroke-width="2.5"/><ellipse cx="105" cy="85" rx="26" ry="34" stroke-width="2.5"/><path d="M75 78 Q75 125 75 160" stroke-width="2"/><path d="M45 119 Q55 135 75 160" stroke-width="1.8"/><path d="M105 119 Q95 135 75 160" stroke-width="1.8"/><polygon points="75,160 71,167 79,167" fill="currentColor"/></svg>`
      },
      {
        className: "art-float-mid",
        style: "top: 42%; left: 2.5%; width: 135px; height: 140px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M45 80 L52 140 L108 140 L115 80 Z" stroke-width="3"/><path d="M38 90 L45 85 M122 90 L115 85" stroke-width="2.5"/><path d="M72 80 L72 50 L88 50 L88 80" stroke-width="2.5"/><line x1="70" y1="58" x2="90" y2="58" stroke-width="2"/><path d="M25 55 L32 85 L32 105 M27 105 L37 105" stroke-width="2"/><path d="M135 55 L128 85 L128 105 M123 105 L133 105" stroke-width="2"/><circle cx="80" cy="38" r="2.5" fill="currentColor"/><circle cx="75" cy="28" r="2" fill="currentColor"/><circle cx="85" cy="24" r="2.5" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-slow",
        style: "top: 38%; right: 3%; width: 160px; height: 150px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 170 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="35" width="130" height="80" rx="10" stroke-width="2.5" stroke-dasharray="4 3"/><text x="85" y="70" font-size="16" text-anchor="middle" fill="currentColor" font-weight="bold" stroke="none" letter-spacing="1">HAPPY</text><text x="85" y="94" font-size="16" text-anchor="middle" fill="currentColor" font-weight="bold" stroke="none" letter-spacing="1">BIRTHDAY</text><circle cx="35" cy="48" r="3" fill="currentColor"/><circle cx="135" cy="48" r="3" fill="currentColor"/><circle cx="35" cy="102" r="3" fill="currentColor"/><circle cx="135" cy="102" r="3" fill="currentColor"/></svg>`
      },
      {
        className: "art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 140px; height: 140px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 150 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="60" width="90" height="70" rx="4" stroke-width="3"/><rect x="24" y="45" width="102" height="18" rx="3" stroke-width="3"/><line x1="75" y1="45" x2="75" y2="130" stroke-width="3.5"/><line x1="30" y1="95" x2="120" y2="95" stroke-width="3"/><path d="M75 45 C55 20 40 38 75 42 C110 38 95 20 75 45 Z" stroke-width="2.8"/><circle cx="75" cy="44" r="4" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 140px; height: 140px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 150 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="75" cy="75" r="5" fill="currentColor"/><line x1="75" y1="20" x2="75" y2="55" stroke-width="2.5"/><line x1="75" y1="95" x2="75" y2="130" stroke-width="2.5"/><line x1="20" y1="75" x2="55" y2="75" stroke-width="2.5"/><line x1="95" y1="75" x2="130" y2="75" stroke-width="2.5"/><line x1="36" y1="36" x2="60" y2="60" stroke-width="2"/><line x1="90" y1="90" x2="114" y2="114" stroke-width="2"/><line x1="114" y1="36" x2="90" y2="60" stroke-width="2"/><line x1="60" y1="90" x2="36" y2="114" stroke-width="2"/></svg>`
      }
    ],
    "birthday-pastel": [
      {
        className: "art-float-slow",
        style: "top: 4%; left: 3%; width: 160px; height: 160px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 180 180" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="90" cy="145" rx="70" ry="18" stroke-width="2.8"/><path d="M28 95 L28 145 C28 160 152 160 152 145 L152 95" stroke-width="3"/><ellipse cx="90" cy="95" rx="62" ry="18" stroke-width="3"/><circle cx="50" cy="92" r="8" stroke-width="2"/><circle cx="75" cy="94" r="8" stroke-width="2"/><circle cx="105" cy="94" r="8" stroke-width="2"/><circle cx="130" cy="92" r="8" stroke-width="2"/><polygon points="90,45 80,72 100,72" stroke-width="2.5"/><line x1="90" y1="45" x2="90" y2="20" stroke-width="2.5"/><path d="M90 20 C87 14 87 8 90 5 C93 8 93 14 90 20 Z" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 135px; height: 160px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 150 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M35 75 L45 135 L105 135 L115 75 Z" stroke-width="3"/><line x1="52" y1="75" x2="58" y2="135" stroke-width="1.8"/><line x1="75" y1="75" x2="75" y2="135" stroke-width="1.8"/><line x1="98" y1="75" x2="92" y2="135" stroke-width="1.8"/><path d="M30 75 C20 62 32 48 48 55 C45 38 65 30 75 40 C88 28 108 36 105 52 C120 50 128 65 118 75 Z" stroke-width="3"/><circle cx="75" cy="28" r="10" stroke-width="2.5"/><path d="M78 20 Q90 10 95 12" stroke-width="2"/></svg>`
      },
      {
        className: "art-float-mid",
        style: "top: 42%; left: 2.5%; width: 130px; height: 150px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 150 170" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="75" cy="140" rx="42" ry="12" stroke-width="2.8"/><ellipse cx="75" cy="115" rx="36" ry="11" stroke-width="2.8"/><ellipse cx="75" cy="90" rx="30" ry="10" stroke-width="2.8"/><ellipse cx="75" cy="65" rx="24" ry="9" stroke-width="2.8"/><ellipse cx="75" cy="42" rx="18" ry="8" stroke-width="2.8"/><circle cx="75" cy="22" r="6" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-slow",
        style: "top: 38%; right: 3%; width: 150px; height: 150px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="65" cy="55" r="26" stroke-width="3"/><path d="M65 35 C76 35 85 44 85 55 C85 64 78 71 70 71 C62 71 57 65 57 59 C57 53 62 49 67 49 C71 49 74 52 74 55" stroke-width="2"/><line x1="65" y1="81" x2="65" y2="135" stroke-width="3"/><circle cx="115" cy="95" r="18" stroke-width="2.5"/><line x1="115" y1="113" x2="115" y2="145" stroke-width="2.5"/></svg>`
      },
      {
        className: "art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 140px; height: 140px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 150 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="20" y1="130" x2="130" y2="130" stroke-width="3"/><path d="M35 130 C35 60 115 60 115 130" stroke-width="3"/><circle cx="75" cy="52" r="8" stroke-width="2.5"/><rect x="58" y="98" width="34" height="24" rx="3" stroke-width="2"/><line x1="75" y1="98" x2="75" y2="82" stroke-width="2"/><circle cx="75" cy="78" r="2" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 130px; height: 150px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 140 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="70,145 40,75 100,75" stroke-width="3"/><line x1="48" y1="95" x2="88" y2="95" stroke-width="1.8"/><line x1="56" y1="115" x2="82" y2="115" stroke-width="1.8"/><circle cx="70" cy="58" r="25" stroke-width="3"/><line x1="70" y1="33" x2="70" y2="15" stroke-width="2.5"/><path d="M70 15 C67 10 67 5 70 2 C73 5 73 10 70 15 Z" fill="currentColor"/></svg>`
      }
    ],
    "birthday-carnival": [
      {
        className: "art-float-slow",
        style: "top: 4%; left: 3%; width: 160px; height: 160px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 180 180" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="90" cy="150" rx="70" ry="16" stroke-width="2.8"/><rect x="35" y="95" width="110" height="55" rx="5" stroke-width="3"/><polygon points="90,45 25,95 155,95" stroke-width="3"/><line x1="90" y1="45" x2="55" y2="95" stroke-width="2"/><line x1="90" y1="45" x2="90" y2="95" stroke-width="2"/><line x1="90" y1="45" x2="125" y2="95" stroke-width="2"/><line x1="90" y1="45" x2="90" y2="22" stroke-width="2.5"/><polygon points="90,22 105,28 90,34" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 145px; height: 165px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 160 180" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="80" cy="45" rx="28" ry="36" stroke-width="2.8"/><ellipse cx="50" cy="72" rx="24" ry="32" stroke-width="2.8"/><ellipse cx="110" cy="72" rx="24" ry="32" stroke-width="2.8"/><ellipse cx="80" cy="90" rx="24" ry="32" stroke-width="2.8"/><path d="M80 122 L80 165" stroke-width="2.2"/><path d="M50 104 Q65 135 80 165" stroke-width="2"/><path d="M110 104 Q95 135 80 165" stroke-width="2"/><path d="M80 165 Q65 175 60 178 M80 165 Q95 175 100 178" stroke-width="2"/></svg>`
      },
      {
        className: "art-float-mid",
        style: "top: 42%; left: 2.5%; width: 140px; height: 140px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="40,135 70,145 95,95 65,85" stroke-width="3"/><ellipse cx="80" cy="90" rx="18" ry="8" transform="rotate(-20 80 90)" stroke-width="2.8"/><path d="M95 75 Q115 50 140 45" stroke-width="2.5"/><path d="M85 65 Q95 30 115 20" stroke-width="2.5"/><circle cx="125" cy="65" r="3" fill="currentColor"/><circle cx="140" cy="85" r="2.5" fill="currentColor"/><circle cx="105" cy="45" r="3" fill="currentColor"/><polygon points="120,28 123,35 130,36 125,41 126,48 120,44 114,48 115,41 110,36 117,35" fill="currentColor"/></svg>`
      },
      {
        className: "art-sway-slow",
        style: "top: 38%; right: 3%; width: 150px; height: 150px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M45 50 L65 50 L65 80 L105 80 L105 50 L115 50 L115 95 L105 95 L105 130 L90 130 L90 95 L60 95 L60 130 L45 130 Z" stroke-width="2.8"/><line x1="55" y1="65" x2="110" y2="65" stroke-width="1.8"/><line x1="60" y1="80" x2="105" y2="80" stroke-width="1.8"/><circle cx="52" cy="58" r="2" fill="currentColor"/><path d="M25 105 Q35 110 50 112" stroke-width="2.5"/><circle cx="20" cy="103" r="6" stroke-width="2"/></svg>`
      },
      {
        className: "art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 140px; height: 140px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 150 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="35" y="75" width="80" height="55" rx="4" stroke-width="3"/><rect x="25" y="55" width="96" height="15" rx="3" transform="rotate(-15 73 62)" stroke-width="2.8"/><ellipse cx="60" cy="35" rx="14" ry="18" stroke-width="2.2"/><ellipse cx="90" cy="30" rx="14" ry="18" stroke-width="2.2"/><line x1="60" y1="53" x2="68" y2="75" stroke-width="1.8"/><line x1="90" y1="48" x2="82" y2="75" stroke-width="1.8"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 150px; height: 140px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 160 140" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M15 35 Q80 65 145 35" stroke-width="2.5"/><polygon points="35,45 50,49 42,65" fill="currentColor"/><polygon points="70,53 85,54 78,72" fill="currentColor"/><polygon points="105,50 120,46 112,65" fill="currentColor"/><path d="M15 75 Q80 105 145 75" stroke-width="2.5"/><polygon points="40,86 55,90 47,106" fill="currentColor"/><polygon points="75,94 90,95 82,112" fill="currentColor"/><polygon points="110,90 125,86 117,105" fill="currentColor"/></svg>`
      }
    ],
    "birthday-emoji": [
      {
        className: "backdrop-art-emoji art-float-slow",
        style: "top: 4%; left: 3%; width: 140px; height: 140px; animation-delay: 0s;",
        svg: `<div class="emoji-sticker-badge">🎂</div>`
      },
      {
        className: "backdrop-art-emoji art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 130px; height: 130px; animation-delay: 1.5s;",
        svg: `<div class="emoji-sticker-badge">🎈</div>`
      },
      {
        className: "backdrop-art-emoji art-float-mid",
        style: "top: 42%; left: 2.5%; width: 130px; height: 130px; animation-delay: 3s;",
        svg: `<div class="emoji-sticker-badge">🎁</div>`
      },
      {
        className: "backdrop-art-emoji art-sway-slow",
        style: "top: 38%; right: 3%; width: 130px; height: 130px; animation-delay: 2s;",
        svg: `<div class="emoji-sticker-badge">🥳</div>`
      },
      {
        className: "backdrop-art-emoji art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 130px; height: 130px; animation-delay: 4.5s;",
        svg: `<div class="emoji-sticker-badge">🍰</div>`
      },
      {
        className: "backdrop-art-emoji art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 130px; height: 130px; animation-delay: 2.5s;",
        svg: `<div class="emoji-sticker-badge">🍾</div>`
      }
    ],
    "birthday-pixel": [
      {
        className: "backdrop-art-pixel art-float-slow",
        style: "top: 4%; left: 3%; width: 130px; height: 130px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="11" y="2" width="2" height="3" fill="#facc15"/><rect x="11" y="3" width="2" height="1" fill="#ea580c"/><rect x="11" y="5" width="2" height="4" fill="#38bdf8"/><rect x="11" y="6" width="1" height="1" fill="#ffffff"/><rect x="7" y="9" width="10" height="2" fill="#f43f5e"/><rect x="8" y="10" width="8" height="3" fill="#fde047"/><rect x="4" y="13" width="16" height="3" fill="#f43f5e"/><rect x="5" y="15" width="14" height="4" fill="#a855f7"/><rect x="6" y="17" width="12" height="2" fill="#fb923c"/><rect x="2" y="20" width="20" height="2" fill="#e2e8f0"/></svg>`
      },
      {
        className: "backdrop-art-pixel art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 120px; height: 130px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="6" height="3" fill="#ec4899"/><rect x="13" y="3" width="6" height="3" fill="#ec4899"/><rect x="4" y="6" width="16" height="5" fill="#ec4899"/><rect x="6" y="5" width="2" height="3" fill="#fbcfe8"/><rect x="6" y="11" width="12" height="3" fill="#db2777"/><rect x="8" y="14" width="8" height="2" fill="#be185d"/><rect x="10" y="16" width="4" height="2" fill="#be185d"/><rect x="11" y="18" width="2" height="1" fill="#9d174d"/><rect x="11" y="19" width="1" height="2" fill="#94a3b8"/><rect x="12" y="21" width="1" height="2" fill="#94a3b8"/><rect x="11" y="23" width="1" height="1" fill="#94a3b8"/></svg>`
      },
      {
        className: "backdrop-art-pixel art-float-mid",
        style: "top: 42%; left: 2.5%; width: 125px; height: 125px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="4" height="3" fill="#facc15"/><rect x="13" y="3" width="4" height="3" fill="#facc15"/><rect x="10" y="5" width="4" height="2" fill="#eab308"/><rect x="4" y="7" width="16" height="4" fill="#06b6d4"/><rect x="11" y="7" width="2" height="4" fill="#facc15"/><rect x="5" y="11" width="14" height="9" fill="#0891b2"/><rect x="11" y="11" width="2" height="9" fill="#facc15"/><rect x="5" y="14" width="14" height="2" fill="#facc15"/></svg>`
      },
      {
        className: "backdrop-art-pixel art-sway-slow",
        style: "top: 38%; right: 3%; width: 125px; height: 125px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="11" y="2" width="2" height="3" fill="#facc15"/><rect x="9" y="5" width="6" height="3" fill="#facc15"/><rect x="2" y="8" width="20" height="4" fill="#facc15"/><rect x="4" y="12" width="16" height="3" fill="#facc15"/><rect x="5" y="15" width="14" height="3" fill="#facc15"/><rect x="3" y="18" width="6" height="4" fill="#facc15"/><rect x="15" y="18" width="6" height="4" fill="#facc15"/><rect x="8" y="9" width="2" height="4" fill="#0f172a"/><rect x="14" y="9" width="2" height="4" fill="#0f172a"/></svg>`
      },
      {
        className: "backdrop-art-pixel art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 120px; height: 130px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="3" fill="#f43f5e"/><rect x="11" y="5" width="2" height="2" fill="#a855f7"/><rect x="10" y="7" width="4" height="2" fill="#38bdf8"/><rect x="9" y="9" width="6" height="2" fill="#a855f7"/><rect x="8" y="11" width="8" height="2" fill="#38bdf8"/><rect x="7" y="13" width="10" height="2" fill="#a855f7"/><rect x="6" y="15" width="12" height="2" fill="#38bdf8"/><rect x="5" y="17" width="14" height="3" fill="#a855f7"/><rect x="4" y="20" width="16" height="2" fill="#facc15"/></svg>`
      },
      {
        className: "backdrop-art-pixel art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 120px; height: 130px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="10" y="3" width="4" height="2" fill="#b45309"/><rect x="9" y="5" width="6" height="3" fill="#94a3b8"/><rect x="6" y="8" width="12" height="12" fill="#06b6d4"/><rect x="8" y="10" width="8" height="8" fill="#ec4899"/><rect x="9" y="12" width="2" height="2" fill="#ffffff"/><rect x="13" y="15" width="2" height="2" fill="#ffffff"/><rect x="7" y="20" width="10" height="2" fill="#0891b2"/></svg>`
      }
    ],
    "birthday-neon": [
      {
        className: "backdrop-art-neon art-float-slow",
        style: "top: 4%; left: 3%; width: 155px; height: 155px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M30 110 L30 135 C30 145 130 145 130 135 L130 110" stroke="#00f0ff" stroke-width="4"/><ellipse cx="80" cy="110" rx="50" ry="16" stroke="#ff007f" stroke-width="4"/><path d="M50 75 L50 95 C50 102 110 102 110 95 L110 75" stroke="#00f0ff" stroke-width="3.5"/><ellipse cx="80" cy="75" rx="30" ry="11" stroke="#ff007f" stroke-width="3.5"/><line x1="80" y1="70" x2="80" y2="45" stroke="#00f0ff" stroke-width="3.5"/><path d="M80 42 C76 35 76 25 80 18 C84 25 84 35 80 42 Z" stroke="#ffe600" stroke-width="3" fill="#ffe600" fill-opacity="0.3"/><circle cx="35" cy="55" r="2" fill="#00f0ff"/><circle cx="125" cy="55" r="2" fill="#ff007f"/></svg>`
      },
      {
        className: "backdrop-art-neon art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 145px; height: 160px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M55 40 L65 95 C67 105 55 110 50 110 L50 140 M35 140 L65 140" stroke="#ffe600" stroke-width="3.5"/><path d="M105 40 L95 95 C93 105 105 110 110 110 L110 140 M95 140 L125 140" stroke="#00f0ff" stroke-width="3.5"/><ellipse cx="60" cy="50" rx="8" ry="3" stroke="#ffe600" stroke-width="2"/><ellipse cx="100" cy="50" rx="8" ry="3" stroke="#00f0ff" stroke-width="2"/><circle cx="80" cy="25" r="3" fill="#ff007f"/><circle cx="72" cy="15" r="2" fill="#ffe600"/><circle cx="88" cy="18" r="2" fill="#00f0ff"/></svg>`
      },
      {
        className: "backdrop-art-neon art-float-mid",
        style: "top: 42%; left: 2.5%; width: 140px; height: 140px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="15" y="45" width="130" height="70" rx="14" stroke="#ff007f" stroke-width="3.5"/><text x="80" y="90" font-family="sans-serif" font-size="24" font-weight="900" fill="none" stroke="#00f0ff" stroke-width="2.5" text-anchor="middle" letter-spacing="3">PARTY</text><path d="M25 55 L35 55 M25 55 L25 65" stroke="#ffe600" stroke-width="2.5"/><path d="M135 55 L125 55 M135 55 L135 65" stroke="#ffe600" stroke-width="2.5"/></svg>`
      },
      {
        className: "backdrop-art-neon art-sway-slow",
        style: "top: 38%; right: 3%; width: 140px; height: 160px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="60" cy="55" rx="26" ry="34" stroke="#ff007f" stroke-width="3.5"/><ellipse cx="100" cy="50" rx="26" ry="34" stroke="#00f0ff" stroke-width="3.5"/><path d="M60 89 Q70 120 80 150" stroke="#ff007f" stroke-width="2"/><path d="M100 84 Q90 120 80 150" stroke="#00f0ff" stroke-width="2"/><polygon points="80,150 76,156 84,156" stroke="#ffe600" stroke-width="2" fill="#ffe600"/></svg>`
      },
      {
        className: "backdrop-art-neon art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 145px; height: 145px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M30 110 L40 50 L65 80 L80 40 L95 80 L120 50 L130 110 Z" stroke="#ffe600" stroke-width="3.5"/><line x1="30" y1="110" x2="130" y2="110" stroke="#ff007f" stroke-width="3.5"/><circle cx="40" cy="45" r="4" stroke="#00f0ff" stroke-width="2.5" fill="#00f0ff"/><circle cx="80" cy="35" r="5" stroke="#ff007f" stroke-width="2.5" fill="#ff007f"/><circle cx="120" cy="45" r="4" stroke="#00f0ff" stroke-width="2.5" fill="#00f0ff"/></svg>`
      },
      {
        className: "backdrop-art-neon art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 140px; height: 140px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="35" y="65" width="90" height="70" rx="6" stroke="#00f0ff" stroke-width="3.5"/><line x1="80" y1="65" x2="80" y2="135" stroke="#ff007f" stroke-width="3.5"/><line x1="35" y1="100" x2="125" y2="100" stroke="#ff007f" stroke-width="3.5"/><path d="M80 65 C60 40 45 50 80 62 C115 50 100 40 80 65 Z" stroke="#ffe600" stroke-width="3.5"/></svg>`
      }
    ],
    "birthday-papercraft": [
      {
        className: "backdrop-art-papercraft art-float-slow",
        style: "top: 4%; left: 3%; width: 150px; height: 150px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 160 160"><rect x="30" y="95" width="100" height="45" rx="4" fill="#f59e0b"/><path d="M30 95 Q40 105 50 95 Q60 105 70 95 Q80 105 90 95 Q100 105 110 95 Q120 105 130 95" fill="#fffbeb"/><rect x="50" y="55" width="60" height="40" rx="3" fill="#ea580c"/><path d="M50 55 Q60 65 70 55 Q80 65 90 55 Q100 65 110 55" fill="#fffbeb"/><rect x="75" y="30" width="10" height="25" fill="#38bdf8"/><polygon points="80,12 85,25 75,25" fill="#ef4444"/><polygon points="80,16 83,25 77,25" fill="#fbbf24"/></svg>`
      },
      {
        className: "backdrop-art-papercraft art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 140px; height: 140px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 160 160"><rect x="35" y="65" width="90" height="70" rx="3" fill="#fb923c"/><polygon points="35,65 80,100 35,135" fill="#f97316"/><rect x="72" y="65" width="16" height="70" fill="#facc15"/><polygon points="80,65 50,40 60,35 80,55" fill="#fde047"/><polygon points="80,65 110,40 100,35 80,55" fill="#f59e0b"/><circle cx="80" cy="62" r="7" fill="#ea580c"/></svg>`
      },
      {
        className: "backdrop-art-papercraft art-float-mid",
        style: "top: 42%; left: 2.5%; width: 140px; height: 160px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 160 170"><path d="M80 20 C50 20 40 55 55 95 C62 110 75 125 80 128 C85 125 98 110 105 95 C120 55 110 20 80 20 Z" fill="#f43f5e"/><path d="M80 20 Q70 75 80 128 M80 20 Q60 75 80 128 M80 20 Q90 75 80 128 M80 20 Q100 75 80 128" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.6" fill="none"/><path d="M80 128 L80 160" stroke="#78350f" stroke-width="2" stroke-dasharray="3 3"/></svg>`
      },
      {
        className: "backdrop-art-papercraft art-sway-slow",
        style: "top: 38%; right: 3%; width: 140px; height: 140px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="48" fill="#fde047"/><polygon points="80,80 80,32 92,34" fill="#f59e0b"/><polygon points="80,80 104,40 114,48" fill="#ea580c"/><polygon points="80,80 124,62 128,74" fill="#f59e0b"/><polygon points="80,80 128,86 124,98" fill="#ea580c"/><polygon points="80,80 114,112 104,120" fill="#f59e0b"/><polygon points="80,80 92,126 80,128" fill="#ea580c"/><polygon points="80,80 68,126 56,120" fill="#f59e0b"/><polygon points="80,80 46,112 36,98" fill="#ea580c"/><polygon points="80,80 32,86 32,74" fill="#f59e0b"/><polygon points="80,80 36,62 46,48" fill="#ea580c"/><polygon points="80,80 56,40 68,34" fill="#f59e0b"/><circle cx="80" cy="80" r="18" fill="#ffffff"/><circle cx="80" cy="80" r="14" fill="#f43f5e"/><polygon points="80,72 82,77 87,77 83,80 85,85 80,82 75,85 77,80 73,77 78,77" fill="#ffffff"/></svg>`
      },
      {
        className: "backdrop-art-papercraft art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 135px; height: 145px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 160 160"><polygon points="80,30 35,130 125,130" fill="#38bdf8"/><polygon points="80,30 80,130 125,130" fill="#0284c7"/><polygon points="55,100 80,80 105,100 80,110" fill="#facc15"/><circle cx="80" cy="24" r="8" fill="#ea580c"/><polygon points="35,130 45,122 55,130 65,122 75,130 85,122 95,130 105,122 115,130 125,122 125,130" fill="#ffffff"/></svg>`
      },
      {
        className: "backdrop-art-papercraft art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 150px; height: 140px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 160 160"><path d="M15 45 Q80 85 145 45" stroke="#78350f" stroke-width="2.5" fill="none"/><polygon points="25,50 55,57 40,95" fill="#f43f5e"/><polygon points="32,52 40,95 40,54" fill="#e11d48"/><polygon points="65,60 95,60 80,105" fill="#facc15"/><polygon points="72,60 80,105 80,60" fill="#eab308"/><polygon points="105,57 135,50 120,95" fill="#38bdf8"/><polygon points="112,55 120,95 120,53" fill="#0284c7"/></svg>`
      }
    ],
    "birthday-watercolor": [
      {
        className: "backdrop-art-watercolor art-float-slow",
        style: "top: 4%; left: 3%; width: 155px; height: 155px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 160 160"><path d="M35 85 C35 75 55 70 80 70 C105 70 125 75 125 85 L125 120 C125 135 35 135 35 120 Z" fill="#f472b6" fill-opacity="0.6"/><path d="M40 95 C55 110 105 110 120 95 L120 120 C120 130 40 130 40 120 Z" fill="#ec4899" fill-opacity="0.4"/><path d="M30 85 C30 75 50 68 80 68 C110 68 130 75 130 85 C130 95 110 102 80 102 C50 102 30 95 30 85 Z" fill="#fdf2f8" fill-opacity="0.9"/><circle cx="65" cy="75" r="9" fill="#e11d48" fill-opacity="0.8"/><circle cx="95" cy="75" r="9" fill="#e11d48" fill-opacity="0.8"/><circle cx="80" cy="62" r="3" fill="#eab308"/><circle cx="50" cy="80" r="2.5" fill="#eab308"/><circle cx="110" cy="80" r="2.5" fill="#eab308"/><polygon points="80,50 82,54 86,55 83,57 84,61 80,59 76,61 77,57 74,55 78,54" fill="#eab308"/></svg>`
      },
      {
        className: "backdrop-art-watercolor art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 140px; height: 155px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 160 160"><polygon points="50,90 60,135 100,135 110,90" fill="#fbcfe8" fill-opacity="0.7"/><path d="M45 92 C35 75 50 60 70 65 C68 45 92 40 100 55 C115 50 125 70 115 92 Z" fill="#c026d3" fill-opacity="0.5"/><circle cx="80" cy="40" r="8" fill="#eab308"/><path d="M82 34 Q92 20 98 22" stroke="#ca8a04" stroke-width="2" fill="none"/></svg>`
      },
      {
        className: "backdrop-art-watercolor art-float-mid",
        style: "top: 42%; left: 2.5%; width: 145px; height: 150px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 160 160"><ellipse cx="80" cy="55" rx="35" ry="14" fill="#f472b6" fill-opacity="0.7"/><rect x="46" y="55" width="68" height="6" rx="3" fill="#ffffff" fill-opacity="0.8"/><ellipse cx="80" cy="82" rx="38" ry="15" fill="#c026d3" fill-opacity="0.6"/><rect x="43" y="82" width="74" height="6" rx="3" fill="#ffffff" fill-opacity="0.8"/><ellipse cx="80" cy="110" rx="42" ry="16" fill="#eab308" fill-opacity="0.6"/><rect x="39" y="110" width="82" height="7" rx="3" fill="#ffffff" fill-opacity="0.8"/><circle cx="118" cy="65" r="3" fill="#eab308"/><circle cx="45" cy="95" r="2.5" fill="#eab308"/></svg>`
      },
      {
        className: "backdrop-art-watercolor art-sway-slow",
        style: "top: 38%; right: 3%; width: 145px; height: 150px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160"><path d="M40 130 Q70 90 120 40" stroke="#a21caf" stroke-width="2.5" stroke-opacity="0.5" fill="none"/><ellipse cx="65" cy="100" rx="14" ry="7" transform="rotate(-30 65 100)" fill="#d946ef" fill-opacity="0.5"/><ellipse cx="85" cy="80" rx="14" ry="7" transform="rotate(40 85 80)" fill="#d946ef" fill-opacity="0.5"/><ellipse cx="105" cy="55" rx="12" ry="6" transform="rotate(-25 105 55)" fill="#f43f5e" fill-opacity="0.5"/><circle cx="60" cy="110" r="4" fill="#eab308"/><circle cx="80" cy="92" r="4" fill="#eab308"/><circle cx="100" cy="68" r="4" fill="#eab308"/><circle cx="122" cy="38" r="5" fill="#eab308"/></svg>`
      },
      {
        className: "backdrop-art-watercolor art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 140px; height: 150px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 160 160"><path d="M40 60 C40 90 75 95 78 96 L78 135 M82 96 L82 135 M55 135 L105 135 M120 60 C120 90 85 95 82 96" stroke="#c026d3" stroke-width="2.5" fill="none"/><path d="M44 65 C50 85 75 90 80 90 C85 90 110 85 116 65 Z" fill="#fb7185" fill-opacity="0.6"/><circle cx="80" cy="50" r="3" fill="#eab308"/><circle cx="72" cy="35" r="2" fill="#eab308"/><circle cx="88" cy="38" r="2.5" fill="#eab308"/><circle cx="80" cy="22" r="3.5" fill="#eab308"/></svg>`
      },
      {
        className: "backdrop-art-watercolor art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 145px; height: 145px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="45" fill="#fae8ff" fill-opacity="0.7"/><path d="M70 45 C85 45 95 55 95 75 C95 95 85 105 70 105 C60 105 55 100 50 95 C62 95 78 85 78 75 C78 65 62 55 50 55 C55 50 60 45 70 45 Z" fill="#eab308"/><polygon points="105,45 107,49 111,50 108,52 109,56 105,54 101,56 102,52 99,50 103,49" fill="#eab308"/><polygon points="112,85 113.5,88 116.5,89 114,91 115,94 112,92.5 109,94 110,91 107.5,89 110.5,88" fill="#eab308"/><circle cx="50" cy="115" r="2.5" fill="#eab308"/><circle cx="115" cy="110" r="2" fill="#eab308"/></svg>`
      }
    ],
    "watercolor-frame": [
      {
        className: "backdrop-art-wc-frame art-float-slow",
        style: "top: 3%; left: 2.5%; width: 155px; height: 145px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 160 140" fill="none"><path d="M20 70 Q50 40 85 45 Q120 50 145 25" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/><path d="M120 70 C125 55 140 55 142 65 C144 75 130 85 125 90 C120 85 106 75 108 65 C110 55 125 55 120 70 Z" fill="#ef4444" fill-opacity="0.85"/><path d="M15 100 L65 100 M60 95 L68 100 L60 105" stroke="#d97706" stroke-width="2.2" stroke-linecap="round"/><path d="M10 100 C15 97 18 97 22 100 M12 103 C17 100 20 100 24 103" stroke="#d97706" stroke-width="1.8"/><path d="M80 110 C75 110 70 115 70 120 C70 125 75 130 80 130 C85 130 90 125 90 120 C90 115 85 110 80 110 Z" stroke="#f472b6" stroke-width="2" fill="none"/></svg>`
      },
      {
        className: "backdrop-art-wc-frame art-sway-mid",
        style: "top: 4%; right: 2.5%; width: 155px; height: 175px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 160 180"><path d="M80 135 C35 95 20 60 40 30 C55 10 90 15 105 40 C120 15 155 10 170 30 C190 60 175 95 130 135 L105 150 Z" transform="scale(0.7) translate(15, 10)" fill="#ef4444"/><circle cx="58" cy="42" r="3.5" fill="#ffffff"/><circle cx="75" cy="35" r="4" fill="#ffffff"/><circle cx="92" cy="40" r="3.5" fill="#ffffff"/><circle cx="50" cy="58" r="4" fill="#ffffff"/><circle cx="68" cy="55" r="4.5" fill="#ffffff"/><circle cx="86" cy="55" r="4" fill="#ffffff"/><circle cx="102" cy="58" r="3.5" fill="#ffffff"/><circle cx="60" cy="74" r="3.8" fill="#ffffff"/><circle cx="78" cy="72" r="4" fill="#ffffff"/><circle cx="95" cy="74" r="3.5" fill="#ffffff"/><circle cx="70" cy="89" r="3.5" fill="#ffffff"/><circle cx="85" cy="89" r="3.5" fill="#ffffff"/><circle cx="78" cy="103" r="3" fill="#ffffff"/><path d="M78 116 Q80 145 74 175" stroke="#ef4444" stroke-width="2" fill="none"/><polygon points="128,30 131,37 138,38 133,43 134,50 128,46 122,50 123,43 118,38 125,37" fill="#d97706"/></svg>`
      },
      {
        className: "backdrop-art-wc-frame art-float-mid",
        style: "top: 42%; left: 2%; width: 140px; height: 140px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 150 150" fill="none"><line x1="75" y1="20" x2="75" y2="120" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/><polygon points="75,130 68,115 82,115" fill="#d97706"/><line x1="65" y1="30" x2="75" y2="22" stroke="#d97706" stroke-width="2"/><line x1="85" y1="30" x2="75" y2="22" stroke="#d97706" stroke-width="2"/><line x1="65" y1="40" x2="75" y2="32" stroke="#d97706" stroke-width="2"/><line x1="85" y1="40" x2="75" y2="32" stroke="#d97706" stroke-width="2"/><path d="M40 75 C35 68 25 72 28 80 L40 92 L52 80 C55 72 45 68 40 75 Z" fill="#ef4444" fill-opacity="0.85"/><path d="M110 65 C105 58 95 62 98 70 L110 82 L122 70 C125 62 115 58 110 65 Z" fill="#d97706"/></svg>`
      },
      {
        className: "backdrop-art-wc-frame art-sway-slow",
        style: "top: 38%; right: 2.5%; width: 145px; height: 165px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 180"><defs><clipPath id="stripesClip1"><path d="M80 135 C35 95 20 60 40 30 C55 10 90 15 105 40 C120 15 155 10 170 30 C190 60 175 95 130 135 L105 150 Z" transform="scale(0.7) translate(15, 10)"/></clipPath></defs><g clip-path="url(#stripesClip1)"><rect x="20" y="10" width="120" height="120" fill="#ef4444"/><line x1="20" y1="20" x2="140" y2="140" stroke="#ffffff" stroke-width="12"/><line x1="40" y1="10" x2="160" y2="130" stroke="#ffffff" stroke-width="12"/><line x1="0" y1="40" x2="120" y2="160" stroke="#ffffff" stroke-width="12"/><line x1="0" y1="80" x2="100" y2="180" stroke="#ffffff" stroke-width="12"/><line x1="60" y1="0" x2="180" y2="120" stroke="#ffffff" stroke-width="12"/></g><path d="M78 116 Q75 145 82 175" stroke="#ef4444" stroke-width="2" fill="none"/></svg>`
      },
      {
        className: "backdrop-art-wc-frame art-float-slow",
        style: "bottom: 6%; left: 2.5%; width: 150px; height: 170px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 160 180"><path d="M80 135 C35 95 20 60 40 30 C55 10 90 15 105 40 C120 15 155 10 170 30 C190 60 175 95 130 135 L105 150 Z" transform="scale(0.7) translate(15, 10)" fill="#ef4444"/><circle cx="58" cy="42" r="3.5" fill="#ffffff"/><circle cx="75" cy="35" r="4" fill="#ffffff"/><circle cx="92" cy="40" r="3.5" fill="#ffffff"/><circle cx="50" cy="58" r="4" fill="#ffffff"/><circle cx="68" cy="55" r="4.5" fill="#ffffff"/><circle cx="86" cy="55" r="4" fill="#ffffff"/><circle cx="102" cy="58" r="3.5" fill="#ffffff"/><circle cx="60" cy="74" r="3.8" fill="#ffffff"/><circle cx="78" cy="72" r="4" fill="#ffffff"/><circle cx="95" cy="74" r="3.5" fill="#ffffff"/><circle cx="70" cy="89" r="3.5" fill="#ffffff"/><circle cx="85" cy="89" r="3.5" fill="#ffffff"/><circle cx="78" cy="103" r="3" fill="#ffffff"/><path d="M78 116 Q82 145 76 175" stroke="#ef4444" stroke-width="2" fill="none"/><path d="M100 145 C95 142 90 144 88 148 C85 146 80 148 80 152 C80 158 95 158 102 158 C106 158 110 154 108 150 C106 146 102 144 100 145 Z" stroke="#f472b6" stroke-width="1.8" fill="none"/></svg>`
      },
      {
        className: "backdrop-art-wc-frame art-sway-mid",
        style: "bottom: 5%; right: 3%; width: 150px; height: 170px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 160 180"><defs><clipPath id="stripesClip2"><path d="M80 135 C35 95 20 60 40 30 C55 10 90 15 105 40 C120 15 155 10 170 30 C190 60 175 95 130 135 L105 150 Z" transform="scale(0.7) translate(15, 10)"/></clipPath></defs><g clip-path="url(#stripesClip2)"><rect x="20" y="10" width="120" height="120" fill="#ef4444"/><line x1="20" y1="20" x2="140" y2="140" stroke="#ffffff" stroke-width="12"/><line x1="40" y1="10" x2="160" y2="130" stroke="#ffffff" stroke-width="12"/><line x1="0" y1="40" x2="120" y2="160" stroke="#ffffff" stroke-width="12"/><line x1="0" y1="80" x2="100" y2="180" stroke="#ffffff" stroke-width="12"/><line x1="60" y1="0" x2="180" y2="120" stroke="#ffffff" stroke-width="12"/></g><path d="M78 116 Q73 145 80 175" stroke="#ef4444" stroke-width="2" fill="none"/><path d="M40 160 L100 160 M92 154 L102 160 L92 166" stroke="#d97706" stroke-width="2.2" stroke-linecap="round"/></svg>`
      }
    ],
    "pop-stickers": [
      {
        className: "backdrop-art-pop art-float-slow",
        style: "top: 4%; left: 3%; width: 145px; height: 155px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 160 170" fill="none"><path d="M68 45 L68 70 L40 120 C35 130 42 145 58 145 L102 145 C118 145 125 130 120 120 L92 70 L92 45 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/><rect x="62" y="36" width="36" height="10" rx="3" fill="#ffffff" stroke="#0f172a" stroke-width="3"/><path d="M48 108 L112 108 L118 120 C122 128 116 142 102 142 L58 142 C44 142 38 128 42 120 Z" fill="#ff007f"/><circle cx="58" cy="125" r="4" fill="#ffffff" fill-opacity="0.8"/><circle cx="85" cy="132" r="3" fill="#ffffff" fill-opacity="0.8"/><circle cx="100" cy="122" r="5" fill="#ffffff" fill-opacity="0.8"/><path d="M80 32 C76 26 68 28 70 34 L80 42 L90 34 C92 28 84 26 80 32 Z" fill="#ff007f" stroke="#0f172a" stroke-width="2"/><path d="M72 16 C69 11 63 13 65 18 L72 24 L79 18 C81 13 75 11 72 16 Z" fill="#fb7185" stroke="#0f172a" stroke-width="1.8"/><path d="M92 22 C89 17 83 19 85 24 L92 30 L99 24 C101 19 95 17 92 22 Z" fill="#fb7185" stroke="#0f172a" stroke-width="1.8"/></svg>`
      },
      {
        className: "backdrop-art-pop art-sway-mid",
        style: "top: 5%; right: 3.5%; width: 150px; height: 140px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 160 140"><path d="M20 70 C35 35 65 42 80 55 C95 42 125 35 140 70 C128 88 102 86 80 72 C58 86 32 88 20 70 Z" fill="#ff007f" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/><path d="M20 70 C35 105 60 115 80 115 C100 115 125 105 140 70 C118 78 95 82 80 75 C65 82 42 78 20 70 Z" fill="#f43f5e" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="50" cy="92" rx="14" ry="5" transform="rotate(-15 50 92)" fill="#ffffff" fill-opacity="0.7"/><ellipse cx="110" cy="92" rx="14" ry="5" transform="rotate(15 110 92)" fill="#ffffff" fill-opacity="0.7"/></svg>`
      },
      {
        className: "backdrop-art-pop art-float-mid",
        style: "top: 42%; left: 2.5%; width: 160px; height: 135px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 170 140" fill="none"><path d="M55 60 C35 35 15 50 20 70 C22 78 30 84 45 78 C35 88 42 98 52 92 C48 98 55 106 65 100" fill="#ffffff" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/><path d="M115 60 C135 35 155 50 150 70 C148 78 140 84 125 78 C135 88 128 98 118 92 C122 98 115 106 105 100" fill="#ffffff" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/><path d="M85 55 C70 35 45 42 50 65 C55 90 85 110 85 110 C85 110 115 90 120 65 C125 42 100 35 85 55 Z" fill="#ff007f" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="70" cy="58" rx="8" ry="4" transform="rotate(-30 70 58)" fill="#ffffff" fill-opacity="0.6"/></svg>`
      },
      {
        className: "backdrop-art-pop art-sway-slow",
        style: "top: 38%; right: 3%; width: 140px; height: 145px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 150 150"><path d="M52 65 L52 45 C52 28 98 28 98 45 L98 65" stroke="#0f172a" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M75 62 C55 45 30 52 35 75 C40 100 75 130 75 130 C75 130 110 100 115 75 C120 52 95 45 75 62 Z" fill="#fb7185" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/><circle cx="75" cy="85" r="7" fill="#0f172a"/><polygon points="72,88 78,88 77,102 73,102" fill="#0f172a"/><ellipse cx="56" cy="72" rx="7" ry="3.5" transform="rotate(-25 56 72)" fill="#ffffff" fill-opacity="0.7"/></svg>`
      },
      {
        className: "backdrop-art-pop art-float-slow",
        style: "bottom: 7%; left: 3%; width: 150px; height: 145px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 160 150"><rect x="42" y="32" width="76" height="65" rx="3" fill="#ffffff" stroke="#0f172a" stroke-width="3"/><line x1="52" y1="46" x2="88" y2="46" stroke="#0f172a" stroke-width="2"/><line x1="52" y1="56" x2="98" y2="56" stroke="#0f172a" stroke-width="2"/><line x1="52" y1="66" x2="78" y2="66" stroke="#0f172a" stroke-width="2"/><path d="M96 46 C93 42 88 44 90 48 L96 54 L102 48 C104 44 99 42 96 46 Z" fill="#ff007f"/><rect x="25" y="65" width="110" height="70" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="3.5"/><path d="M25 65 L80 110 L135 65" stroke="#0f172a" stroke-width="3" fill="none"/><path d="M80 100 C75 92 65 95 68 102 L80 114 L92 102 C95 95 85 92 80 100 Z" fill="#ff007f" stroke="#0f172a" stroke-width="2"/></svg>`
      },
      {
        className: "backdrop-art-pop art-sway-mid",
        style: "bottom: 6%; right: 3.5%; width: 150px; height: 150px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 160 160"><circle cx="65" cy="100" r="28" stroke="#0f172a" stroke-width="4.5" fill="none"/><polygon points="65,60 52,72 78,72" fill="#38bdf8" stroke="#0f172a" stroke-width="2.5"/><polygon points="65,60 58,72 72,72" fill="#e0f2fe"/><path d="M115 50 C105 38 90 44 95 56 L115 76 L135 56 C140 44 125 38 115 50 Z" fill="#ff007f" stroke="#0f172a" stroke-width="3"/><line x1="115" y1="76" x2="128" y2="120" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/></svg>`
      }
    ],
    "doodle-tapestry": [
      {
        className: "backdrop-art-tapestry art-float-slow",
        style: "top: 4%; left: 3%; width: 150px; height: 150px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="40" r="14"/><circle cx="100" cy="40" r="14"/><ellipse cx="80" cy="62" rx="26" ry="22"/><circle cx="72" cy="58" r="3" fill="#e11d48"/><circle cx="88" cy="58" r="3" fill="#e11d48"/><ellipse cx="80" cy="68" rx="8" ry="5"/><path d="M77 67 Q80 70 83 67"/><path d="M58 80 C50 88 45 110 55 125 C62 135 98 135 105 125 C115 110 110 88 102 80"/><path d="M80 85 C70 72 52 78 58 92 L80 114 L102 92 C108 78 90 72 80 85 Z"/><path d="M52 95 Q42 105 50 115"/><path d="M108 95 Q118 105 110 115"/></svg>`
      },
      {
        className: "backdrop-art-tapestry art-sway-mid",
        style: "top: 6%; right: 3.5%; width: 145px; height: 155px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M55 45 L68 95 C70 105 60 112 52 112 L52 140 M38 140 L66 140"/><path d="M78 45 L68 95"/><path d="M105 45 L92 95 C90 105 100 112 108 112 L108 140 M94 140 L122 140"/><path d="M82 45 L92 95"/><circle cx="80" cy="30" r="3" fill="#e11d48"/><circle cx="72" cy="22" r="2" fill="#e11d48"/><circle cx="88" cy="24" r="2" fill="#e11d48"/><line x1="75" y1="12" x2="85" y2="12"/><line x1="80" y1="7" x2="80" y2="17"/></svg>`
      },
      {
        className: "backdrop-art-tapestry art-float-mid",
        style: "top: 42%; left: 2.5%; width: 145px; height: 145px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M80 60 C65 42 40 50 45 70 L80 105 L115 70 C120 50 95 42 80 60 Z"/><path d="M40 75 L80 40 L120 75"/><ellipse cx="80" cy="80" rx="16" ry="7"/><polygon points="80,62 72,72 88,72"/><circle cx="35" cy="115" r="14"/><path d="M35 107 C32 104 27 106 28 110 L35 117 L42 110 C43 106 38 104 35 107 Z"/><line x1="49" y1="115" x2="90" y2="115"/><line x1="80" y1="115" x2="80" y2="124"/><line x1="88" y1="115" x2="88" y2="124"/></svg>`
      },
      {
        className: "backdrop-art-tapestry art-sway-slow",
        style: "top: 38%; right: 3%; width: 145px; height: 155px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="80" cy="50" r="10"/><path d="M80 40 C70 40 65 50 72 60 C80 70 92 68 92 58 C92 48 85 40 80 40 Z"/><path d="M64 45 C52 55 58 75 75 78 C95 80 105 65 100 50"/><path d="M78 78 L78 140"/><path d="M78 95 C65 90 52 94 50 102 C60 106 72 104 78 102"/><path d="M78 112 C90 108 102 110 105 118 C95 122 84 120 78 118"/></svg>`
      },
      {
        className: "backdrop-art-tapestry art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 140px; height: 145px; animation-delay: 4.5s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="45,85 55,135 105,135 115,85"/><line x1="60" y1="85" x2="68" y2="135"/><line x1="75" y1="85" x2="77" y2="135"/><line x1="90" y1="85" x2="86" y2="135"/><line x1="100" y1="85" x2="95" y2="135"/><path d="M40 85 C30 70 45 55 65 60 C65 42 88 38 98 52 C112 48 122 68 115 85 Z"/><path d="M68 38 C65 32 58 34 60 38 L68 46 L76 38 C78 34 71 32 68 38 Z"/><path d="M92 38 C89 32 82 34 84 38 L92 46 L100 38 C102 34 95 32 92 38 Z"/></svg>`
      },
      {
        className: "backdrop-art-tapestry art-sway-mid",
        style: "bottom: 6%; right: 4%; width: 145px; height: 145px; animation-delay: 2.5s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M35 35 C65 65 65 95 35 125"/><line x1="35" y1="35" x2="35" y2="125" stroke-dasharray="3 3"/><line x1="25" y1="80" x2="125" y2="80"/><polygon points="135,80 120,74 120,86" fill="#e11d48"/><path d="M125 75 C122 70 115 72 117 76 L125 84 L133 76 C135 72 128 70 125 75 Z" fill="#e11d48"/><line x1="30" y1="75" x2="20" y2="80"/><line x1="30" y1="85" x2="20" y2="80"/><line x1="38" y1="75" x2="28" y2="80"/><line x1="38" y1="85" x2="28" y2="80"/></svg>`
      }
    ],
    apology: [
      {
        className: "art-float-slow",
        style: "top: 5%; left: 3%; width: 170px; height: 150px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 180 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M40 95 C45 80 65 75 80 82 C90 60 115 35 140 40 C130 60 115 80 105 92 C125 96 148 94 160 88 C150 105 130 115 110 114 C95 125 75 130 50 125 C62 115 65 105 58 100 C50 102 42 100 40 95 Z" stroke-width="3"/><path d="M98 72 C112 55 128 50 132 52" stroke-width="2"/><path d="M90 85 C102 70 118 68 122 72" stroke-width="2"/><circle cx="48" cy="88" r="2" fill="currentColor"/><path d="M40 95 Q25 90 15 95" stroke-width="2.5"/><ellipse cx="20" cy="88" rx="6" ry="3" transform="rotate(-30 20 88)" stroke-width="2"/><ellipse cx="28" cy="98" rx="6" ry="3" transform="rotate(30 28 98)" stroke-width="2"/><ellipse cx="12" cy="95" rx="5" ry="2.5" stroke-width="2"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "top: 8%; right: 4%; width: 150px; height: 150px; animation-delay: 2s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M80 135 C30 100 15 70 30 42 C42 20 70 25 80 48 C90 25 118 20 130 42 C145 70 130 100 80 135 Z" stroke-width="3"/><rect x="52" y="66" width="56" height="24" rx="4" transform="rotate(-20 80 78)" stroke-width="2.5"/><line x1="72" y1="67" x2="88" y2="89" stroke-width="1.8"/><line x1="72" y1="89" x2="88" y2="67" stroke-width="1.8"/><path d="M125 35 Q128 35 128 32 Q128 35 131 35 Q128 35 128 38 Q128 35 125 35 Z" fill="currentColor"/></svg>`
      },
      {
        className: "art-float-mid",
        style: "top: 44%; left: 2.5%; width: 140px; height: 140px; animation-delay: 3.5s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="25" y="60" width="110" height="70" rx="5" stroke-width="3"/><path d="M25 60 L80 105 L135 60" stroke-width="2.5"/><path d="M40 60 L40 35 Q40 30 45 30 L115 30 Q120 30 120 35 L120 60" stroke-width="2.5"/><line x1="50" y1="42" x2="90" y2="42" stroke-width="2"/><line x1="50" y1="50" x2="105" y2="50" stroke-width="2"/><circle cx="80" cy="105" r="8" stroke-width="2"/><path d="M80 97 C75 97 74 102 78 105 C82 108 86 103 84 99" stroke-width="1.8"/></svg>`
      },
      {
        className: "art-sway-slow",
        style: "bottom: 8%; right: 3.5%; width: 160px; height: 140px; animation-delay: 1.5s;",
        svg: `<svg viewBox="0 0 180 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M140 95 C135 80 115 75 100 82 C90 60 65 35 40 40 C50 60 65 80 75 92 C55 96 32 94 20 88 C30 105 50 115 70 114 C85 125 105 130 130 125 C118 115 115 105 122 100 C130 102 138 100 140 95 Z" stroke-width="3"/><path d="M82 72 C68 55 52 50 48 52" stroke-width="2"/><circle cx="132" cy="88" r="2" fill="currentColor"/><path d="M140 95 Q155 90 165 95" stroke-width="2.5"/><ellipse cx="160" cy="88" rx="6" ry="3" transform="rotate(30 160 88)" stroke-width="2"/></svg>`
      },
      {
        className: "art-float-slow",
        style: "bottom: 6%; left: 4%; width: 140px; height: 140px; animation-delay: 4s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 90 C35 85 50 82 68 85 C62 78 50 75 42 75" stroke-width="2.5"/><path d="M140 90 C125 85 110 82 92 85 C98 78 110 75 118 75" stroke-width="2.5"/><path d="M80 68 C72 56 60 62 68 74 L80 86 L92 74 C100 62 88 56 80 68 Z" fill="currentColor"/></svg>`
      }
    ],
    anniversary: [
      {
        className: "art-float-slow",
        style: "top: 5%; left: 3%; width: 160px; height: 150px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 170 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="65" cy="90" rx="36" ry="46" transform="rotate(-20 65 90)" stroke-width="3.5"/><ellipse cx="105" cy="90" rx="36" ry="46" transform="rotate(20 105 90)" stroke-width="3.5"/><polygon points="50,42 62,30 74,42 62,54" stroke-width="2.5"/><line x1="50" y1="42" x2="74" y2="42" stroke-width="2"/><line x1="62" y1="30" x2="62" y2="54" stroke-width="2"/><line x1="62" y1="24" x2="62" y2="16" stroke-width="2.5"/><line x1="44" y1="32" x2="38" y2="28" stroke-width="2"/><line x1="80" y1="32" x2="86" y2="28" stroke-width="2"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "top: 7%; right: 4%; width: 145px; height: 165px; animation-delay: 1.8s;",
        svg: `<svg viewBox="0 0 160 180" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M52 40 L64 100 C66 112 56 120 48 120" stroke-width="2.8"/><path d="M76 40 L64 100" stroke-width="2.8"/><ellipse cx="64" cy="40" rx="12" ry="5" stroke-width="2.5"/><line x1="56" y1="120" x2="42" y2="155" stroke-width="2.8"/><ellipse cx="40" cy="158" rx="18" ry="6" stroke-width="2.5"/><path d="M108 40 L96 100 C94 112 104 120 112 120" stroke-width="2.8"/><path d="M84 40 L96 100" stroke-width="2.8"/><ellipse cx="96" cy="40" rx="12" ry="5" stroke-width="2.5"/><line x1="104" y1="120" x2="118" y2="155" stroke-width="2.8"/><ellipse cx="120" cy="158" rx="18" ry="6" stroke-width="2.5"/><path d="M80 32 Q82 32 82 28 Q82 32 86 32 Q82 32 82 36 Q82 32 80 32 Z" fill="currentColor"/><circle cx="72" cy="18" r="2.5" fill="currentColor"/><circle cx="86" cy="14" r="2" fill="currentColor"/></svg>`
      },
      {
        className: "art-float-mid",
        style: "top: 42%; left: 3%; width: 140px; height: 140px; animation-delay: 3s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M60 70 C48 55 30 62 38 78 L60 98 L82 78 C90 62 72 55 60 70 Z" stroke-width="3"/><path d="M46 62 L46 45 C46 32 74 32 74 45 L74 62" stroke-width="2.8"/><circle cx="60" cy="80" r="3" fill="currentColor"/><line x1="60" y1="83" x2="60" y2="90" stroke-width="2"/><circle cx="115" cy="50" r="12" stroke-width="2.5"/><line x1="115" y1="62" x2="115" y2="115" stroke-width="3"/><line x1="115" y1="105" x2="126" y2="105" stroke-width="2.5"/><line x1="115" y1="113" x2="123" y2="113" stroke-width="2.5"/></svg>`
      },
      {
        className: "art-sway-slow",
        style: "bottom: 8%; right: 4%; width: 145px; height: 145px; animation-delay: 2.2s;",
        svg: `<svg viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="80" cy="65" r="10" stroke-width="2.5"/><path d="M80 55 C70 55 65 65 72 75 C80 85 92 82 92 72 C92 62 85 55 80 55 Z" stroke-width="2.5"/><path d="M64 60 C52 70 58 90 75 92 C95 95 105 80 100 65" stroke-width="2.5"/><path d="M78 92 L78 140" stroke-width="3"/><path d="M78 108 C65 102 52 106 50 114 C60 118 72 116 78 114" stroke-width="2"/><path d="M78 120 C90 115 102 118 105 126 C95 130 84 128 78 126" stroke-width="2"/></svg>`
      },
      {
        className: "art-float-slow",
        style: "bottom: 7%; left: 3.5%; width: 155px; height: 140px; animation-delay: 4.2s;",
        svg: `<svg viewBox="0 0 170 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M85 80 C60 55 30 65 35 95 C40 120 70 115 85 95 C100 115 130 120 135 95 C140 65 110 55 85 80 Z" stroke-width="3.5"/><circle cx="85" cy="50" r="4" fill="currentColor"/><circle cx="60" cy="40" r="3" fill="currentColor"/><circle cx="110" cy="40" r="3" fill="currentColor"/></svg>`
      }
    ],
    scrapbook: [
      {
        className: "art-float-slow",
        style: "top: 5%; left: 3%; width: 150px; height: 160px; animation-delay: 0s;",
        svg: `<svg viewBox="0 0 160 170" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="25" y="25" width="105" height="125" rx="5" transform="rotate(-6 77 87)" stroke-width="3"/><rect x="36" y="36" width="83" height="78" rx="2" transform="rotate(-6 77 75)" stroke-width="2.5"/><path d="M75 75 C70 68 62 70 66 78 L75 86 L84 78 C88 70 80 68 75 75 Z" fill="currentColor" transform="rotate(-6 75 78)"/><rect x="55" y="14" width="40" height="15" rx="2" fill="none" stroke="currentColor" stroke-dasharray="4 2" stroke-width="2"/></svg>`
      },
      {
        className: "art-sway-mid",
        style: "top: 7%; right: 4%; width: 140px; height: 150px; animation-delay: 1.7s;",
        svg: `<svg viewBox="0 0 150 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="30" width="90" height="105" rx="4" stroke-width="3"/><rect x="38" y="38" width="74" height="89" rx="2" stroke-width="1.8"/><path d="M20 75 Q40 65 60 75 Q80 85 100 75 Q120 65 140 75" stroke-width="2"/><circle cx="75" cy="80" r="24" stroke-width="2"/><text x="75" y="85" font-size="12" text-anchor="middle" fill="currentColor" font-weight="bold" stroke="none">LOVE</text></svg>`
      },
      {
        className: "art-float-mid",
        style: "top: 42%; left: 3%; width: 140px; height: 150px; animation-delay: 3.2s;",
        svg: `<svg viewBox="0 0 150 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="50,40 100,40 115,70 115,135 35,135 35,70" stroke-width="2.8"/><circle cx="75" cy="55" r="5" stroke-width="2"/><path d="M72 25 L72 65 C72 70 80 70 80 65 L80 35 C80 28 66 28 66 35 L66 65" stroke-width="2.5"/><line x1="50" y1="90" x2="100" y2="90" stroke-width="2"/><line x1="50" y1="105" x2="85" y2="105" stroke-width="2"/></svg>`
      },
      {
        className: "art-sway-slow",
        style: "bottom: 7%; right: 3.5%; width: 140px; height: 160px; animation-delay: 2.3s;",
        svg: `<svg viewBox="0 0 150 170" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M75 25 Q73 95 65 155" stroke-width="2.5"/><ellipse cx="60" cy="45" rx="14" ry="4" transform="rotate(-30 60 45)" stroke-width="2"/><ellipse cx="90" cy="52" rx="14" ry="4" transform="rotate(25 90 52)" stroke-width="2"/><ellipse cx="56" cy="68" rx="16" ry="5" transform="rotate(-30 56 68)" stroke-width="2"/><ellipse cx="92" cy="76" rx="16" ry="5" transform="rotate(25 92 76)" stroke-width="2"/><ellipse cx="54" cy="94" rx="18" ry="5" transform="rotate(-30 54 94)" stroke-width="2"/><ellipse cx="94" cy="102" rx="18" ry="5" transform="rotate(25 94 102)" stroke-width="2"/></svg>`
      },
      {
        className: "art-float-slow",
        style: "bottom: 6%; left: 3.5%; width: 150px; height: 150px; animation-delay: 4s;",
        svg: `<svg viewBox="0 0 160 170" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="25" y="25" width="105" height="125" rx="5" transform="rotate(8 77 87)" stroke-width="3"/><rect x="36" y="36" width="83" height="78" rx="2" transform="rotate(8 77 75)" stroke-width="2.5"/><text x="77" y="80" font-size="22" text-anchor="middle" fill="currentColor" stroke="none">❤️</text></svg>`
      }
    ]
  };

  THEME_BACKDROP_SVGS["img-watercolor-frame"] = [];
  THEME_BACKDROP_SVGS["img-pop-stickers"] = [];
  THEME_BACKDROP_SVGS["img-doodle-tapestry"] = [];

  function updateThemeBackdropDecorations(themeId) {
    let container = document.getElementById("themeBackdropDecorations");
    if (!container) {
      container = document.createElement("div");
      container.id = "themeBackdropDecorations";
      container.className = "theme-backdrop-decorations";
      container.setAttribute("aria-hidden", "true");
      document.body.insertBefore(container, document.body.firstChild);
    }

    const cleanTheme = (themeId || document.documentElement.getAttribute("data-theme") || document.body.getAttribute("data-theme") || "theme-pink").replace(/^theme-/, "");
    if (cleanTheme.includes("img-")) {
      container.innerHTML = "";
      return;
    }
    const targetTheme = (cleanTheme === "birthday" || cleanTheme === "birthday-cake") ? "birthday-cake" : cleanTheme;
    const items = THEME_BACKDROP_SVGS[targetTheme] || THEME_BACKDROP_SVGS[cleanTheme] || [];

    container.innerHTML = items.map(item => `
      <div class="backdrop-art-item ${item.className}" style="${item.style}">
        ${item.svg}
      </div>
    `).join("");
  }

  // Automatically mount when DOM is ready
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => updateThemeBackdropDecorations());
    } else {
      updateThemeBackdropDecorations();
    }
  }
