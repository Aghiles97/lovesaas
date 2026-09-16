/**
 * Runtime Widget Engine: love-crossword.runtime.js
 * Interactive Couple's Crossword Puzzle Engine
 * With Procedural Web Audio, Keyboard & Touch State Machine, Particle Physics & Keepsake Diploma PNG Exporter.
 */
(function() {
  const DEFAULT_WORDS = [
    { id: "A1", dir: "across", num: 3, word: "CANTON", clue: "The iconic Guangzhou tower where we talked for 7 hours until sunrise 🗼", r: 1, c: 6 },
    { id: "A2", dir: "across", num: 5, word: "ALGERIA", clue: "My home country waiting with Mediterranean beaches to welcome you 🇩🇿", r: 3, c: 2 },
    { id: "A3", dir: "across", num: 8, word: "BEBEK", clue: "The Balinese duck dinner that means \"your father\" in Algerian Arabic 🦆", r: 6, c: 0 },
    { id: "A4", dir: "across", num: 9, word: "VIETNAM", clue: "The transit airport where we wore 4 pairs of pants each in 30°C heat 🇻🇳", r: 8, c: 4 },
    { id: "A5", dir: "across", num: 10, word: "SEEDS", clue: "Two special sunflower items given on April 23 to ask you to be mine 🌻", r: 11, c: 0 },
    { id: "D1", dir: "down", num: 1, word: "BALI", clue: "Our dream island escape with sunset beaches, private villa & ATV trails 🌴", r: 0, c: 7 },
    { id: "D2", dir: "down", num: 2, word: "DAGU", clue: "Freezing 5,000m summit glacier where we warmed up together in the chalet 🏔️", r: 1, c: 4 },
    { id: "D3", dir: "down", num: 4, word: "NANJING", clue: "The rainy mountain where we climbed together to the Buddha temple 🛕", r: 1, c: 11 },
    { id: "D4", dir: "down", num: 6, word: "PERFUME", clue: "The sweet surprise gift you handed me at your apartment on Dec 10 🎁", r: 5, c: 1 },
    { id: "D5", dir: "down", num: 7, word: "JAKARTA", clue: "The city where we met Lili & Ayung, played games, and ordered snacks 🇮🇩", r: 5, c: 9 }
  ];

  const CrosswordAudio = {
    ctx: null,
    getCtx() {
      if (!this.ctx && typeof window !== "undefined") {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    },
    playKeystroke() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.04);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.055);
    },
    playBackspace() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.085);
    },
    playDirToggle() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime;
      [1050, 1480].forEach((freq, i) => {
        const t = now + (i * 0.018), osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.03);
      });
    },
    playWordSolve() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime;
      [739.99, 932.33, 1108.73, 1479.98].forEach((freq, idx) => {
        const t = now + (idx * 0.035), osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.65);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.7);
      });
    },
    playHintSparkle() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime;
      [1318.5, 1661.2, 1975.5, 2637.0].forEach((f, i) => {
        const t = now + (i * 0.045), osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.2);
      });
    },
    playVictory() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime;
      const chords = [
        { t: 0.00, notes: [523.25, 659.25, 783.99], dur: 0.25 },
        { t: 0.28, notes: [587.33, 739.99, 880.00], dur: 0.25 },
        { t: 0.58, notes: [659.25, 830.61, 987.77], dur: 0.35 },
        { t: 0.98, notes: [1046.50, 1318.51, 1567.98, 2093.00], dur: 1.10 }
      ];
      chords.forEach(({ t, notes, dur }) => {
        notes.forEach(f => {
          const osc = ctx.createOscillator(), gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + t);
          gain.gain.setValueAtTime(0.001, now + t);
          gain.gain.linearRampToValueAtTime(0.14, now + t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0005, now + t + dur);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(now + t); osc.stop(now + t + dur + 0.05);
        });
      });
    }
  };

  const ConfettiFX = {
    canvas: null,
    ctx: null,
    particles: [],
    animId: null,
    init() {
      if (this.canvas) return;
      this.canvas = document.createElement("canvas");
      this.canvas.style.position = "fixed";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.width = "100vw";
      this.canvas.style.height = "100vh";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.zIndex = "10000";
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      window.addEventListener("resize", () => this.resize());
      this.resize();
    },
    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    burst(count = 90) {
      this.init();
      const colors = ["#e0a96d", "#ff4365", "#f7d794", "#ffffff", "#ff8da1"];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: window.innerWidth * 0.5 + (Math.random() * 200 - 100),
          y: window.innerHeight * 0.45,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() * -18) - 4,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.2,
          alpha: 1,
          isHeart: Math.random() > 0.5
        });
      }
      if (!this.animId) this.loop();
    },
    loop() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles = this.particles.filter(p => p.alpha > 0.02);
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.42;
        p.rotation += p.rotSpeed;
        p.alpha -= 0.012;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;

        if (p.isHeart) {
          const s = p.size * 0.6;
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          this.ctx.bezierCurveTo(-s, -s, -s * 2, s * 0.5, 0, s * 2);
          this.ctx.bezierCurveTo(s * 2, s * 0.5, s, -s, 0, 0);
          this.ctx.fill();
        } else {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        this.ctx.restore();
      });

      if (this.particles.length > 0) {
        this.animId = requestAnimationFrame(() => this.loop());
      } else {
        this.animId = null;
        if (this.canvas) {
          this.canvas.remove();
          this.canvas = null;
        }
      }
    }
  };

  function generateCrosswordKeepsakePNG({
    partner1 = "Partner 1",
    partner2 = "Partner 2",
    puzzleTitle = "The Love Crossword",
    solvedWords = 10,
    totalWords = 10,
    hintsUsed = 0,
    timeText = "02:15"
  }) {
    const canvas = document.createElement("canvas");
    canvas.width = 2400; canvas.height = 1600;
    const ctx = canvas.getContext("2d");

    const bgGrad = ctx.createRadialGradient(1200, 800, 100, 1200, 800, 1400);
    bgGrad.addColorStop(0, "#2a1523");
    bgGrad.addColorStop(0.6, "#1a0c16");
    bgGrad.addColorStop(1, "#0f070e");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2400, 1600);

    const goldGrad = ctx.createLinearGradient(100, 100, 2300, 1500);
    goldGrad.addColorStop(0, "#d4af37");
    goldGrad.addColorStop(0.25, "#f7d794");
    goldGrad.addColorStop(0.5, "#e0a96d");
    goldGrad.addColorStop(0.75, "#fbe3d2");
    goldGrad.addColorStop(1, "#aa7a3e");

    ctx.lineWidth = 14;
    ctx.strokeStyle = goldGrad;
    ctx.strokeRect(80, 80, 2240, 1440);
    ctx.lineWidth = 3;
    ctx.strokeRect(110, 110, 2180, 1380);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ff758c";
    ctx.font = "bold 32px -apple-system, sans-serif";
    ctx.fillText("★ OFFICIAL SOULMATE KEEPSAKE DIPLOMA ★", 1200, 230);

    ctx.fillStyle = goldGrad;
    ctx.font = "bold 86px Georgia, serif";
    ctx.fillText("Certificate of Telepathic Devotion", 1200, 360);

    ctx.fillStyle = "#fbe3d2";
    ctx.font = "italic 44px Georgia, serif";
    ctx.fillText(`Conferred with Endless Adoration to ${partner2} & ${partner1}`, 1200, 470);

    ctx.fillStyle = "rgba(255, 67, 101, 0.15)";
    ctx.strokeStyle = "rgba(224, 169, 109, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(500, 560, 1400, 210, 24);
    ctx.fill(); ctx.stroke();

    const scoreRatio = Math.round((solvedWords / Math.max(1, totalWords)) * 100);
    const affinity = (scoreRatio === 100 && hintsUsed === 0) ? "100% Quintillion Telepathy" : `${scoreRatio}% Soulmate Affinity`;

    ctx.fillStyle = "#ff4365";
    ctx.font = "bold 60px -apple-system, sans-serif";
    ctx.fillText(`🧩 ${affinity} 🧩`, 1200, 650);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "30px -apple-system, sans-serif";
    ctx.fillText(`Puzzle: "${puzzleTitle}" • Solved: ${solvedWords}/${totalWords} • Hints: ${hintsUsed} • Time: ${timeText}`, 1200, 720);

    ctx.fillStyle = "#e2d9dc";
    ctx.font = "italic 36px Georgia, cursive";
    ctx.fillText("« Every intersecting letter solved today binds another chapter of our forever story. »", 1200, 880);
    ctx.fillText("Valid across all airports, timezones, and universes with unlimited hugs and morning kisses.", 1200, 940);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#e0a96d";
    ctx.beginPath();
    ctx.moveTo(400, 1220); ctx.lineTo(880, 1220);
    ctx.moveTo(1520, 1220); ctx.lineTo(2000, 1220);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "italic bold 48px Georgia, cursive";
    ctx.fillText(partner1, 640, 1195);
    ctx.fillText(partner2, 1760, 1195);

    ctx.fillStyle = "#9b6b78";
    ctx.font = "26px -apple-system, sans-serif";
    ctx.fillText("Signed: Partner 1", 640, 1270);
    ctx.fillText("Signed: Partner 2", 1760, 1270);

    const sealGrad = ctx.createRadialGradient(1200, 1120, 10, 1200, 1120, 85);
    sealGrad.addColorStop(0, "#ff6b8b");
    sealGrad.addColorStop(0.8, "#c01e38");
    sealGrad.addColorStop(1, "#7d0e20");
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(1200, 1120, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = goldGrad;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("❤️", 1200, 1125);
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("INFINITE LOF", 1200, 1155);

    const a = document.createElement("a");
    a.download = `love-crossword-keepsake-${partner1}-${partner2}.png`.toLowerCase().replace(/\s+/g, "-");
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  function setupLoveCrossword(widgetData = {}, heroData = {}) {
    const section = document.getElementById("section-love_crossword");
    if (!section) return;

    const cwData = widgetData || {};
    const words = Array.isArray(cwData.words) && cwData.words.length ? cwData.words : DEFAULT_WORDS;
    const partner1 = cwData.partner1 || heroData.partner1 || "Partner 1";
    const partner2 = cwData.partner2 || heroData.partner2 || "Partner 2";
    const puzzleTitle = cwData.title || "The Love Crossword";

    const gridEl = section.querySelector("#crosswordGrid");
    const hiddenInput = section.querySelector("#cwHiddenInput");
    const bannerEl = section.querySelector("#cwActiveClueBanner");
    const dirToggleBtn = section.querySelector("#btnCwDirToggle");
    const dirLabel = section.querySelector("#cwDirLabel");
    const dirIcon = section.querySelector("#cwDirIcon");
    const clueNumEl = section.querySelector("#cwActiveClueNum");
    const clueTextEl = section.querySelector("#cwActiveClueText");
    const prevClueBtn = section.querySelector("#btnCwPrevClue");
    const nextClueBtn = section.querySelector("#btnCwNextClue");
    const solvedCountEl = section.querySelector("#cwSolvedCount");
    const timerTextEl = section.querySelector("#cwTimerText");
    const scoreTextEl = section.querySelector("#cwScoreText");
    const hintBtn = section.querySelector("#btnCwHint");
    const checkBtn = section.querySelector("#btnCwCheck");
    const solveBtn = section.querySelector("#btnCwSolveWord");
    const resetBtn = section.querySelector("#btnCwReset");
    const modalEl = section.querySelector("#crosswordSolveModal");
    const downloadCertBtn = section.querySelector("#btnCwDownloadCert");
    const replayBtn = section.querySelector("#btnCwReplay");
    const closeModalBtn = section.querySelector("#btnCwCloseModal");
    const mobileKeypad = section.querySelector("#cwMobileKeypad");

    if (!gridEl) return;

    const gridMap = {};
    const wordMap = {};

    words.forEach(w => {
      wordMap[w.id] = w;
      const len = w.word.length;
      for (let i = 0; i < len; i++) {
        const r = w.dir === "across" ? w.r : w.r + i;
        const c = w.dir === "across" ? w.c + i : w.c;
        const key = `${r},${c}`;
        if (!gridMap[key]) {
          gridMap[key] = {
            r, c,
            sol: w.word[i].toUpperCase(),
            val: "",
            acrossWordId: null,
            downWordId: null,
            cellNum: null,
            isRevealed: false
          };
        }
        if (w.dir === "across") gridMap[key].acrossWordId = w.id;
        if (w.dir === "down") gridMap[key].downWordId = w.id;
        if (i === 0) gridMap[key].cellNum = w.num;
      }
    });

    let cursor = { r: words[0] ? words[0].r : 1, c: words[0] ? words[0].c : 6 };
    let currentDir = words[0] ? words[0].dir : "across";
    let selectedWordId = words[0] ? words[0].id : "A1";
    let completedWordIds = new Set();
    let penalties = { hints: 0, checks: 0, wordSolves: 0 };
    let secondsElapsed = 0;
    let timerInterval = null;
    let isGameOver = false;

    function formatTime(s) {
      const mins = String(Math.floor(s / 60)).padStart(2, "0");
      const secs = String(s % 60).padStart(2, "0");
      return `${mins}:${secs}`;
    }

    function calculateScore() {
      const base = 1000;
      const deduction = (penalties.hints * 20) + (penalties.checks * 5) + (penalties.wordSolves * 60);
      return Math.max(0, base - deduction);
    }

    function updateHud() {
      if (solvedCountEl) solvedCountEl.textContent = completedWordIds.size;
      if (scoreTextEl) scoreTextEl.textContent = calculateScore();
      if (timerTextEl) timerTextEl.textContent = formatTime(secondsElapsed);
    }

    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (!isGameOver) {
          secondsElapsed++;
          if (timerTextEl) timerTextEl.textContent = formatTime(secondsElapsed);
        }
      }, 1000);
    }

    function buildGridDOM() {
      gridEl.innerHTML = "";
      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const key = `${r},${c}`;
          const cellData = gridMap[key];
          const cell = document.createElement("div");
          cell.className = "cw-cell";
          cell.dataset.r = r;
          cell.dataset.c = c;

          if (!cellData) {
            cell.classList.add("is-blocked");
            cell.setAttribute("aria-hidden", "true");
          } else {
            cell.classList.add("is-letter");
            cell.setAttribute("tabindex", "0");
            cell.setAttribute("role", "gridcell");

            if (cellData.cellNum) {
              const numSpan = document.createElement("span");
              numSpan.className = "cw-cell-num";
              numSpan.textContent = cellData.cellNum;
              cell.appendChild(numSpan);
            }

            const valSpan = document.createElement("span");
            valSpan.className = "cw-cell-val";
            valSpan.textContent = cellData.val;
            cell.appendChild(valSpan);

            cell.addEventListener("click", () => handleCellClick(r, c));
          }
          gridEl.appendChild(cell);
        }
      }
    }

    function handleCellClick(r, c) {
      const key = `${r},${c}`;
      const data = gridMap[key];
      if (!data) return;

      if (cursor.r === r && cursor.c === c) {
        if (data.acrossWordId && data.downWordId) {
          toggleDirection();
          return;
        }
      }

      cursor = { r, c };
      if (currentDir === "across" && !data.acrossWordId && data.downWordId) {
        currentDir = "down";
      } else if (currentDir === "down" && !data.downWordId && data.acrossWordId) {
        currentDir = "across";
      }

      const activeWordId = currentDir === "across" ? data.acrossWordId : data.downWordId;
      if (activeWordId) selectedWordId = activeWordId;

      focusHiddenInput();
      updateUI();
    }

    function toggleDirection() {
      const key = `${cursor.r},${cursor.c}`;
      const data = gridMap[key];
      if (!data) return;

      if (data.acrossWordId && data.downWordId) {
        currentDir = currentDir === "across" ? "down" : "across";
        selectedWordId = currentDir === "across" ? data.acrossWordId : data.downWordId;
        CrosswordAudio.playDirToggle();
        updateUI();
      }
    }

    function selectWord(wordId) {
      const w = wordMap[wordId];
      if (!w) return;
      selectedWordId = w.id;
      currentDir = w.dir;
      cursor = { r: w.r, c: w.c };
      focusHiddenInput();
      updateUI();
    }

    function focusHiddenInput() {
      if (hiddenInput) {
        hiddenInput.focus({ preventScroll: true });
      }
    }

    function getActiveWordCells(word) {
      const cells = [];
      for (let i = 0; i < word.word.length; i++) {
        const r = word.dir === "across" ? word.r : word.r + i;
        const c = word.dir === "across" ? word.c + i : word.c;
        cells.push({ r, c, key: `${r},${c}` });
      }
      return cells;
    }

    function updateUI() {
      const activeWord = wordMap[selectedWordId];

      if (dirLabel) dirLabel.textContent = currentDir.toUpperCase();
      if (dirIcon) dirIcon.textContent = currentDir === "across" ? "↔️" : "↕️";

      if (activeWord) {
        if (clueNumEl) clueNumEl.textContent = activeWord.num;
        if (clueTextEl) clueTextEl.textContent = activeWord.clue;
      }

      const activeCells = activeWord ? getActiveWordCells(activeWord) : [];
      const beamKeys = new Set(activeCells.map(c => c.key));

      const allCells = gridEl.querySelectorAll(".cw-cell.is-letter");
      allCells.forEach(cell => {
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        const key = `${r},${c}`;
        const data = gridMap[key];

        cell.classList.toggle("is-active", r === cursor.r && c === cursor.c);
        cell.classList.toggle("is-beam", beamKeys.has(key));

        const valSpan = cell.querySelector(".cw-cell-val");
        if (valSpan && data) {
          valSpan.textContent = data.val;
        }

        cell.classList.toggle("is-revealed", !!(data && data.isRevealed));
      });

      section.querySelectorAll(".clue-item").forEach(item => {
        const id = item.dataset.wordId;
        item.classList.toggle("is-selected", id === selectedWordId);
        item.classList.toggle("is-completed", completedWordIds.has(id));
      });

      words.forEach(w => {
        if (completedWordIds.has(w.id)) {
          const cells = getActiveWordCells(w);
          cells.forEach(({ r, c }) => {
            const cell = gridEl.querySelector(`.cw-cell[data-r="${r}"][data-c="${c}"]`);
            if (cell) cell.classList.add("is-solved");
          });
        }
      });

      updateHud();
    }

    function checkWordCompletion(word) {
      const cells = getActiveWordCells(word);
      const isComplete = cells.every(pos => gridMap[pos.key].val === gridMap[pos.key].sol);
      if (isComplete && !completedWordIds.has(word.id)) {
        completedWordIds.add(word.id);
        CrosswordAudio.playWordSolve();
        ConfettiFX.burst(40);
        updateUI();

        if (completedWordIds.size === words.length) {
          triggerGameWin();
        }
      }
    }

    function handleCharInput(char) {
      const key = `${cursor.r},${cursor.c}`;
      const data = gridMap[key];
      if (!data) return;

      data.val = char.toUpperCase();
      CrosswordAudio.playKeystroke();

      const activeWord = wordMap[selectedWordId];
      if (activeWord) {
        checkWordCompletion(activeWord);

        const cells = getActiveWordCells(activeWord);
        const currentIndex = cells.findIndex(c => c.r === cursor.r && c.c === cursor.c);
        if (currentIndex !== -1 && currentIndex < cells.length - 1) {
          const nextCell = cells[currentIndex + 1];
          cursor = { r: nextCell.r, c: nextCell.c };
        }
      }

      updateUI();
    }

    function handleBackspace() {
      const key = `${cursor.r},${cursor.c}`;
      const data = gridMap[key];
      if (!data) return;

      CrosswordAudio.playBackspace();

      if (data.val !== "") {
        data.val = "";
      } else {
        const activeWord = wordMap[selectedWordId];
        if (activeWord) {
          const cells = getActiveWordCells(activeWord);
          const currentIndex = cells.findIndex(c => c.r === cursor.r && c.c === cursor.c);
          if (currentIndex > 0) {
            const prevCell = cells[currentIndex - 1];
            cursor = { r: prevCell.r, c: prevCell.c };
            const prevKey = `${cursor.r},${cursor.c}`;
            if (gridMap[prevKey]) gridMap[prevKey].val = "";
          }
        }
      }
      updateUI();
    }

    function triggerGameWin() {
      isGameOver = true;
      if (timerInterval) clearInterval(timerInterval);
      CrosswordAudio.playVictory();
      ConfettiFX.burst(120);

      setTimeout(() => {
        if (!modalEl) return;
        const affinityEl = modalEl.querySelector("#cwModalAffinity");
        const timeStatEl = modalEl.querySelector("#cwModalTimeStat");
        const hintsStatEl = modalEl.querySelector("#cwModalHintsStat");
        const pointsStatEl = modalEl.querySelector("#cwModalPointsStat");

        const scoreRatio = Math.round((completedWordIds.size / words.length) * 100);
        const affinity = (scoreRatio === 100 && penalties.hints === 0) ? "100% Quintillion Telepathy" : `${scoreRatio}% Soulmate Affinity`;

        if (affinityEl) affinityEl.textContent = `🧩 ${affinity} 🧩`;
        if (timeStatEl) timeStatEl.textContent = `Time: ${formatTime(secondsElapsed)}`;
        if (hintsStatEl) hintsStatEl.textContent = `Hints: ${penalties.hints}`;
        if (pointsStatEl) pointsStatEl.textContent = `Score: ${calculateScore()} pts`;

        modalEl.classList.add("is-open");
        modalEl.setAttribute("aria-hidden", "false");
      }, 700);
    }

    // Event Listeners
    if (dirToggleBtn) {
      dirToggleBtn.addEventListener("click", () => toggleDirection());
    }

    if (prevClueBtn) {
      prevClueBtn.addEventListener("click", () => {
        const currentIndex = words.findIndex(w => w.id === selectedWordId);
        const prevIndex = (currentIndex - 1 + words.length) % words.length;
        selectWord(words[prevIndex].id);
      });
    }

    if (nextClueBtn) {
      nextClueBtn.addEventListener("click", () => {
        const currentIndex = words.findIndex(w => w.id === selectedWordId);
        const nextIndex = (currentIndex + 1) % words.length;
        selectWord(words[nextIndex].id);
      });
    }

    section.querySelectorAll(".clue-item").forEach(item => {
      item.addEventListener("click", () => {
        selectWord(item.dataset.wordId);
      });
    });

    section.querySelectorAll(".clue-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        section.querySelectorAll(".clue-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.dataset.clueTab;
        const acrossCol = section.querySelector("#cwAcrossColumn");
        const downCol = section.querySelector("#cwDownColumn");
        if (acrossCol && downCol) {
          acrossCol.classList.toggle("active", tab === "across");
          downCol.classList.toggle("active", tab === "down");
        }
      });
    });

    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        const key = `${cursor.r},${cursor.c}`;
        const data = gridMap[key];
        if (!data || data.val === data.sol) return;
        data.val = data.sol;
        data.isRevealed = true;
        penalties.hints++;
        CrosswordAudio.playHintSparkle();
        const activeWord = wordMap[selectedWordId];
        if (activeWord) checkWordCompletion(activeWord);
        updateUI();
      });
    }

    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        const activeWord = wordMap[selectedWordId];
        if (!activeWord) return;
        penalties.checks++;
        const cells = getActiveWordCells(activeWord);
        let hasError = false;
        cells.forEach(({ r, c, key }) => {
          const data = gridMap[key];
          const cellEl = gridEl.querySelector(`.cw-cell[data-r="${r}"][data-c="${c}"]`);
          if (data && cellEl) {
            if (data.val && data.val !== data.sol) {
              cellEl.classList.add("is-error");
              setTimeout(() => cellEl.classList.remove("is-error"), 900);
              hasError = true;
            }
          }
        });
        if (!hasError) checkWordCompletion(activeWord);
        updateUI();
      });
    }

    if (solveBtn) {
      solveBtn.addEventListener("click", () => {
        const activeWord = wordMap[selectedWordId];
        if (!activeWord || completedWordIds.has(activeWord.id)) return;
        penalties.wordSolves++;
        const cells = getActiveWordCells(activeWord);
        cells.forEach(({ key }) => {
          const data = gridMap[key];
          if (data) {
            data.val = data.sol;
            data.isRevealed = true;
          }
        });
        checkWordCompletion(activeWord);
        updateUI();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset the crossword puzzle?")) {
          Object.values(gridMap).forEach(d => {
            d.val = "";
            d.isRevealed = false;
          });
          completedWordIds.clear();
          penalties = { hints: 0, checks: 0, wordSolves: 0 };
          secondsElapsed = 0;
          isGameOver = false;
          cursor = { r: words[0] ? words[0].r : 1, c: words[0] ? words[0].c : 6 };
          currentDir = words[0] ? words[0].dir : "across";
          selectedWordId = words[0] ? words[0].id : "A1";
          startTimer();
          updateUI();
        }
      });
    }

    if (mobileKeypad) {
      mobileKeypad.querySelectorAll(".cw-key").forEach(keyBtn => {
        keyBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const key = keyBtn.dataset.key;
          if (key === "DIR") {
            toggleDirection();
          } else if (key === "BACK") {
            handleBackspace();
          } else if (key && /^[A-Z]$/.test(key)) {
            handleCharInput(key);
          }
        });
      });
    }

    if (downloadCertBtn) {
      downloadCertBtn.addEventListener("click", () => {
        generateCrosswordKeepsakePNG({
          partner1,
          partner2,
          puzzleTitle,
          solvedWords: completedWordIds.size,
          totalWords: words.length,
          hintsUsed: penalties.hints,
          timeText: formatTime(secondsElapsed)
        });
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        if (modalEl) {
          modalEl.classList.remove("is-open");
          modalEl.setAttribute("aria-hidden", "true");
        }
        Object.values(gridMap).forEach(d => {
          d.val = "";
          d.isRevealed = false;
        });
        completedWordIds.clear();
        penalties = { hints: 0, checks: 0, wordSolves: 0 };
        secondsElapsed = 0;
        isGameOver = false;
        cursor = { r: words[0] ? words[0].r : 1, c: words[0] ? words[0].c : 6 };
        currentDir = words[0] ? words[0].dir : "across";
        selectedWordId = words[0] ? words[0].id : "A1";
        startTimer();
        updateUI();
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        if (modalEl) {
          modalEl.classList.remove("is-open");
          modalEl.setAttribute("aria-hidden", "true");
        }
      });
    }

    // Keyboard navigation
    section.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" && e.target !== hiddenInput) return;
      if (e.target.tagName === "TEXTAREA") return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        toggleDirection();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        cursor.c = Math.max(0, cursor.c - 1);
        updateUI();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        cursor.c = Math.min(11, cursor.c + 1);
        updateUI();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        cursor.r = Math.max(0, cursor.r - 1);
        updateUI();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        cursor.r = Math.min(11, cursor.r + 1);
        updateUI();
      } else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleCharInput(e.key);
      }
    });

    buildGridDOM();
    startTimer();
    updateUI();

    window.loveCrosswordJumpToWord = function(wordId) {
      selectWord(wordId);
    };
    window.loveCrosswordReset = function() {
      Object.values(gridMap).forEach(d => { d.val = ""; d.isRevealed = false; });
      completedWordIds.clear();
      penalties = { hints: 0, checks: 0, wordSolves: 0 };
      secondsElapsed = 0;
      isGameOver = false;
      updateUI();
    };
    window.loveCrosswordOpenKeepsake = function() {
      triggerGameWin();
    };
  }

  if (typeof window !== "undefined") {
    window.setupLoveCrossword = setupLoveCrossword;
    window.addEventListener("message", function(e) {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "CROSSWORD_JUMP_WORD" && typeof window.loveCrosswordJumpToWord === "function") {
        window.loveCrosswordJumpToWord(e.data.wordId);
      }
      if (e.data.type === "CROSSWORD_RESET" && typeof window.loveCrosswordReset === "function") {
        window.loveCrosswordReset();
      }
      if (e.data.type === "CROSSWORD_OPEN_KEEPSAKE" && typeof window.loveCrosswordOpenKeepsake === "function") {
        window.loveCrosswordOpenKeepsake();
      }
    });
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { setupLoveCrossword, DEFAULT_WORDS };
  }
})();
