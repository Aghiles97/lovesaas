/**
 * Runtime Widget Engine: puzzle-photo.runtime.js
 * Interactive Memory Photo Puzzle Engine
 * Supports Tap-to-Slide (15-Puzzle w/ guaranteed solvable parity) & Tap-to-Swap (casual play),
 * Procedural Web Audio API, Haptic Feedback, Particle Confetti & Keepsake PNG Canvas Exporter.
 */
(function() {
  const PuzzleAudio = {
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
    playMove(type = "slide") {
      this.playPhysicalKnock();
    },
    playPhysicalKnock() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime;
      // Damped resonant body knock (wood / acrylic)
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.05);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.06);

      // Attack transient click
      const clickOsc = ctx.createOscillator(), clickGain = ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(920, now);
      clickOsc.frequency.exponentialRampToValueAtTime(240, now + 0.015);
      clickGain.gain.setValueAtTime(0.18, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
      clickOsc.connect(clickGain); clickGain.connect(ctx.destination);
      clickOsc.start(now); clickOsc.stop(now + 0.02);
    },
    playPieceCorrect() {
      this.playSnapLock();
    },
    playSnapLock() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime;
      [1318.5, 1975.5, 2637.0].forEach((freq, i) => {
        const t = now + (i * 0.018), osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.32);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.35);
      });
    },
    playShuffle() {
      const ctx = this.getCtx(); if (!ctx) return;
      const freqs = [220, 280, 340, 420, 520, 640, 780, 920];
      const now = ctx.currentTime;
      freqs.forEach((f, idx) => {
        const t = now + (idx * 0.025), osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.025);
      });
    },
    playVictory() {
      const ctx = this.getCtx(); if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [
        { f: 349.2, t: 0.00 }, // F4
        { f: 440.0, t: 0.09 }, // A4
        { f: 523.2, t: 0.18 }, // C5
        { f: 659.2, t: 0.27 }, // E5
        { f: 783.9, t: 0.38 }, // G5
        { f: 1046.5, t: 0.50 }, // C6
        { f: 1318.5, t: 0.65 }  // E6
      ];
      notes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.linearRampToValueAtTime(0.18, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.8);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + t); osc.stop(now + t + 0.85);
      });
      // Warm Sub-Bass Pad
      const bass = ctx.createOscillator(), bassGain = ctx.createGain();
      bass.type = "sine";
      bass.frequency.setValueAtTime(130.8, now + 0.5);
      bassGain.gain.setValueAtTime(0.001, now + 0.5);
      bassGain.gain.linearRampToValueAtTime(0.15, now + 0.55);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      bass.connect(bassGain); bassGain.connect(ctx.destination);
      bass.start(now + 0.5); bass.stop(now + 2.3);
    }
  };

  const DEFAULT_CONFIG = {
    tag: "Memory Puzzle 🧩",
    title: "Piece Our Love Together",
    desc: "Solve the puzzle to reveal our special memory & secret note.",
    photoUrl: "/public/images/puzzle-couple.jpg",
    mode: "slide",
    gridSize: 3,
    allowModeSwitch: true,
    allowHints: true,
    showNumbers: false,
    sfxEnabled: true,
    hapticsEnabled: true,
    reward: {
      badge: "💌 Secret Keepsake Unlocked",
      title: "You Complete My World 💕",
      letter: "« Every single moment, laugh, and adventure we share fits into my heart like the final missing piece of an eternal puzzle. I love you endlessly! »",
      actionText: "Claim Romantic Date 🥂",
      actionUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent("I solved our photo puzzle! Time to claim my romantic date! ❤️🥂")}`
    }
  };

  let activeGame = null;

  class PuzzleGame {
    constructor(config = {}, heroData = {}) {
      this.config = { ...DEFAULT_CONFIG, ...(config || {}) };
      this.hero = heroData || {};
      this.gridSize = [3, 4, 5].includes(Number(this.config.gridSize)) ? Number(this.config.gridSize) : 3;
      this.mode = this.config.mode === "swap" ? "swap" : "slide";
      this.photoUrl = this.config.photoUrl || DEFAULT_CONFIG.photoUrl;
      this.sfxEnabled = this.config.sfxEnabled !== false;
      this.hapticsEnabled = this.config.hapticsEnabled !== false;
      this.showNumbers = Boolean(this.config.showNumbers);

      this.tiles = [];
      this.emptySlot = { r: this.gridSize - 1, c: this.gridSize - 1 };
      this.selectedTile = null;

      this.moves = 0;
      this.timerSeconds = 0;
      this.timerInterval = null;
      this.isTimerRunning = false;
      this.isSolved = false;

      this.sectionEl = document.getElementById("section-puzzle_photo");
      this.boardEl = document.getElementById("puzzleBoard");
      this.containerEl = this.sectionEl?.querySelector(".puzzle-board-container");
      this.ghostEl = document.getElementById("puzzleGhost");
      this.completedOverlayEl = document.getElementById("puzzleCompletedOverlay");
      this.modalEl = document.getElementById("puzzleKeepsakeModal");

      this.init();
    }

    vibrate(pattern) {
      if (this.hapticsEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(pattern); } catch (e) {}
      }
    }

    playSound(fnName, ...args) {
      if (!this.sfxEnabled) return;
      if (typeof window !== "undefined" && window.state && window.state.romanticSfx === false) return;
      try { PuzzleAudio[fnName](...args); } catch (e) {}
    }

    init() {
      if (!this.boardEl) return;
      this.bindHUD();
      this.bindKeyboard();
      this.buildBoard();
      this.updateBestDisplay();
      this.scramble();
    }

    getBestKey() {
      return `lovesaas_pz_best_${this.gridSize}_${this.mode}`;
    }

    updateBestDisplay() {
      const bestPill = document.getElementById("puzzleBestPill");
      const bestText = document.getElementById("puzzleBestText");
      if (!bestPill || !bestText) return;
      try {
        const raw = localStorage.getItem(this.getBestKey());
        if (raw) {
          const data = JSON.parse(raw);
          const m = String(Math.floor(data.seconds / 60)).padStart(2, "0");
          const s = String(data.seconds % 60).padStart(2, "0");
          bestText.textContent = `Best: ${m}:${s} (${data.moves}m)`;
          bestPill.style.display = "inline-flex";
        } else {
          bestPill.style.display = "none";
        }
      } catch (e) {}
    }

    saveBestScore() {
      try {
        const raw = localStorage.getItem(this.getBestKey());
        const prev = raw ? JSON.parse(raw) : null;
        if (!prev || this.timerSeconds < prev.seconds || (this.timerSeconds === prev.seconds && this.moves < prev.moves)) {
          localStorage.setItem(this.getBestKey(), JSON.stringify({
            seconds: this.timerSeconds,
            moves: this.moves,
            date: new Date().toISOString()
          }));
          this.updateBestDisplay();
          return true;
        }
      } catch (e) {}
      return false;
    }

    bindHUD() {
      const modeButtons = this.sectionEl?.querySelectorAll(".hud-mode-switch .switch-pill-btn");
      modeButtons?.forEach(btn => {
        btn.addEventListener("click", () => {
          const nextMode = btn.dataset.mode;
          if (nextMode && nextMode !== this.mode) {
            this.setMode(nextMode);
          }
        });
      });

      const sizeButtons = this.sectionEl?.querySelectorAll(".hud-diff-switch .switch-pill-btn");
      sizeButtons?.forEach(btn => {
        btn.addEventListener("click", () => {
          const nextSize = Number(btn.dataset.size);
          if (nextSize && nextSize !== this.gridSize) {
            this.setGridSize(nextSize);
          }
        });
      });

      const btnPeek = document.getElementById("btnPuzzlePeek");
      if (btnPeek) {
        const showGhost = (e) => {
          e?.preventDefault();
          if (this.ghostEl) this.ghostEl.classList.add("is-active");
          btnPeek.classList.add("active");
        };
        const hideGhost = (e) => {
          e?.preventDefault();
          if (this.ghostEl) this.ghostEl.classList.remove("is-active");
          btnPeek.classList.remove("active");
        };
        btnPeek.addEventListener("pointerdown", showGhost);
        btnPeek.addEventListener("pointerup", hideGhost);
        btnPeek.addEventListener("pointerleave", hideGhost);
        btnPeek.addEventListener("touchstart", showGhost, { passive: false });
        btnPeek.addEventListener("touchend", hideGhost, { passive: false });
      }

      const btnNumbers = document.getElementById("btnPuzzleNumbers");
      if (btnNumbers) {
        btnNumbers.addEventListener("click", () => {
          this.showNumbers = !this.showNumbers;
          this.boardEl?.classList.toggle("show-numbers", this.showNumbers);
          btnNumbers.classList.toggle("active", this.showNumbers);
        });
      }

      const btnSound = document.getElementById("btnPuzzleSound");
      if (btnSound) {
        btnSound.addEventListener("click", () => {
          this.sfxEnabled = !this.sfxEnabled;
          btnSound.classList.toggle("muted", !this.sfxEnabled);
          const icon = document.getElementById("puzzleSoundIcon");
          if (icon) icon.textContent = this.sfxEnabled ? "🔊" : "🔇";
        });
      }

      const btnScramble = document.getElementById("btnPuzzleScramble");
      if (btnScramble) {
        btnScramble.addEventListener("click", () => {
          this.scramble();
          this.playSound("playShuffle");
        });
      }

      const btnCloseModal = document.getElementById("btnPuzzleCloseModal");
      if (btnCloseModal) {
        btnCloseModal.addEventListener("click", () => this.closeKeepsakeModal());
      }

      const btnReplay = document.getElementById("btnPuzzleReplay");
      if (btnReplay) {
        btnReplay.addEventListener("click", () => {
          this.closeKeepsakeModal();
          this.scramble();
        });
      }

      const btnDownloadPNG = document.getElementById("btnPuzzleDownloadPNG");
      if (btnDownloadPNG) {
        btnDownloadPNG.addEventListener("click", () => this.downloadKeepsakePNG());
      }
    }

    bindKeyboard() {
      window.addEventListener("keydown", (e) => {
        if (this.isSolved || this.mode !== "slide") return;
        const keyMap = {
          ArrowUp: { dr: 1, dc: 0 },
          ArrowDown: { dr: -1, dc: 0 },
          ArrowLeft: { dr: 0, dc: 1 },
          ArrowRight: { dr: 0, dc: -1 }
        };
        const delta = keyMap[e.key];
        if (!delta) return;
        const targetR = this.emptySlot.r + delta.dr;
        const targetC = this.emptySlot.c + delta.dc;
        if (targetR >= 0 && targetR < this.gridSize && targetC >= 0 && targetC < this.gridSize) {
          const tile = this.tiles.find(t => t.curRow === targetR && t.curCol === targetC);
          if (tile) {
            e.preventDefault();
            this.handleTileClick(tile);
          }
        }
      });
    }

    setMode(newMode) {
      this.mode = newMode === "swap" ? "swap" : "slide";
      const modeButtons = this.sectionEl?.querySelectorAll(".hud-mode-switch .switch-pill-btn");
      modeButtons?.forEach(btn => btn.classList.toggle("active", btn.dataset.mode === this.mode));
      const hint = document.getElementById("puzzleMobileInstructions");
      if (hint) {
        hint.textContent = this.mode === "slide"
          ? "👉 Tap tiles adjacent to the open slot to slide them"
          : "👉 Tap one piece, then tap another to swap them";
      }
      this.updateBestDisplay();
      this.buildBoard();
      this.scramble();
    }

    setGridSize(newSize) {
      this.gridSize = [3, 4, 5].includes(newSize) ? newSize : 3;
      const sizeButtons = this.sectionEl?.querySelectorAll(".hud-diff-switch .switch-pill-btn");
      sizeButtons?.forEach(btn => btn.classList.toggle("active", Number(btn.dataset.size) === this.gridSize));
      const totalCount = document.getElementById("puzzleTotalCount");
      if (totalCount) totalCount.textContent = this.gridSize * this.gridSize;
      this.updateBestDisplay();
      this.buildBoard();
      this.scramble();
    }

    buildBoard() {
      if (!this.boardEl) return;
      this.boardEl.innerHTML = "";
      this.boardEl.style.setProperty("--n", this.gridSize);
      this.boardEl.style.setProperty("--img", `url('${this.photoUrl}')`);

      // Preload image to auto-detect natural photographic aspect ratio (prevents squishing)
      const aspectImg = new Image();
      aspectImg.onload = () => {
        if (aspectImg.naturalWidth && aspectImg.naturalHeight) {
          const ratio = `${aspectImg.naturalWidth} / ${aspectImg.naturalHeight}`;
          this.containerEl?.style.setProperty("--aspect", ratio);
          this.boardEl?.style.setProperty("--aspect", ratio);
        }
      };
      aspectImg.src = this.photoUrl;

      this.tiles = [];
      this.selectedTile = null;
      this.isSolved = false;

      if (this.completedOverlayEl) {
        this.completedOverlayEl.classList.remove("is-active");
      }

      const totalTiles = this.gridSize * this.gridSize;
      for (let i = 0; i < totalTiles; i++) {
        const origRow = Math.floor(i / this.gridSize);
        const origCol = i % this.gridSize;
        const isEmpty = (this.mode === "slide" && i === totalTiles - 1);

        const tileEl = document.createElement("div");
        tileEl.className = `puzzle-tile ${isEmpty ? "is-empty" : ""}`;
        tileEl.dataset.id = i;
        tileEl.style.setProperty("--r", origRow);
        tileEl.style.setProperty("--c", origCol);
        tileEl.style.setProperty("--or", origRow);
        tileEl.style.setProperty("--oc", origCol);

        const inner = document.createElement("div");
        inner.className = "puzzle-tile-inner";
        inner.setAttribute("role", "button");
        inner.setAttribute("aria-label", `Puzzle tile ${i + 1}`);

        const numBadge = document.createElement("span");
        numBadge.className = "tile-num-badge";
        numBadge.textContent = i + 1;
        inner.appendChild(numBadge);

        tileEl.appendChild(inner);

        const tileObj = {
          id: i,
          origRow,
          origCol,
          curRow: origRow,
          curCol: origCol,
          isEmpty,
          element: tileEl
        };

        if (!isEmpty) {
          let touchStartX = 0, touchStartY = 0, swiped = false;
          tileEl.addEventListener("touchstart", (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            swiped = false;
          }, { passive: true });

          tileEl.addEventListener("touchmove", (e) => {
            if (this.isSolved || this.mode !== "slide" || swiped) return;
            const touch = e.touches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            if (Math.max(absDx, absDy) > 22) {
              swiped = true;
              const { curRow: r, curCol: c } = tileObj;
              const { r: er, c: ec } = this.emptySlot;
              const isHoriz = absDx > absDy;
              const isValidSwipe =
                (isHoriz && dx > 0 && er === r && ec === c + 1) ||
                (isHoriz && dx < 0 && er === r && ec === c - 1) ||
                (!isHoriz && dy > 0 && ec === c && er === r + 1) ||
                (!isHoriz && dy < 0 && ec === c && er === r - 1);

              if (isValidSwipe) {
                e.preventDefault();
                this.handleTileClick(tileObj);
              }
            }
          }, { passive: false });

          tileEl.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            this.handleTileClick(tileObj);
          });
        }

        this.boardEl.appendChild(tileEl);
        this.tiles.push(tileObj);
      }

      this.emptySlot = { r: this.gridSize - 1, c: this.gridSize - 1 };
      this.updateSolvedDisplay();
    }

    scramble() {
      this.resetTimer();
      this.moves = 0;
      this.updateMovesDisplay(0);
      this.isSolved = false;
      this.selectedTile = null;

      if (this.completedOverlayEl) {
        this.completedOverlayEl.classList.remove("is-active");
      }

      const totalTiles = this.gridSize * this.gridSize;

      if (this.mode === "slide") {
        // Solvable permutation generator for 15-puzzle
        const nonBlankCount = totalTiles - 1;
        let p = Array.from({ length: nonBlankCount }, (_, i) => i);
        // Fisher-Yates shuffle
        for (let i = p.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [p[i], p[j]] = [p[j], p[i]];
        }
        // Inversion count
        let inversions = 0;
        for (let i = 0; i < p.length; i++) {
          for (let j = i + 1; j < p.length; j++) {
            if (p[i] > p[j]) inversions++;
          }
        }
        // Blank slot is at bottom row (index N-1)
        // If parity is odd, swap first two items to ensure 100% solvability
        if (inversions % 2 !== 0) {
          [p[0], p[1]] = [p[1], p[0]];
        }

        p.forEach((tileId, slotIndex) => {
          const r = Math.floor(slotIndex / this.gridSize);
          const c = slotIndex % this.gridSize;
          const tile = this.tiles.find(t => t.id === tileId);
          if (tile) {
            tile.curRow = r;
            tile.curCol = c;
            tile.element.style.setProperty("--r", r);
            tile.element.style.setProperty("--c", c);
          }
        });

        // Empty tile at end
        const emptyTile = this.tiles.find(t => t.isEmpty);
        if (emptyTile) {
          emptyTile.curRow = this.gridSize - 1;
          emptyTile.curCol = this.gridSize - 1;
          emptyTile.element.style.setProperty("--r", this.gridSize - 1);
          emptyTile.element.style.setProperty("--c", this.gridSize - 1);
        }
        this.emptySlot = { r: this.gridSize - 1, c: this.gridSize - 1 };
      } else {
        // Swap mode: shuffle all N^2 tiles
        let p = Array.from({ length: totalTiles }, (_, i) => i);
        for (let i = p.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [p[i], p[j]] = [p[j], p[i]];
        }
        p.forEach((tileId, slotIndex) => {
          const r = Math.floor(slotIndex / this.gridSize);
          const c = slotIndex % this.gridSize;
          const tile = this.tiles.find(t => t.id === tileId);
          if (tile) {
            tile.curRow = r;
            tile.curCol = c;
            tile.element.style.setProperty("--r", r);
            tile.element.style.setProperty("--c", c);
          }
        });
      }

      this.updateCorrectClasses();
      this.updateSolvedDisplay();
    }

    handleTileClick(tile) {
      if (this.isSolved || tile.isEmpty) return;
      this.startTimer();

      if (this.mode === "slide") {
        this.handleSlideMove(tile);
      } else {
        this.handleSwapMove(tile);
      }
    }

    handleSlideMove(tile) {
      const { curRow: r, curCol: c } = tile;
      const { r: er, c: ec } = this.emptySlot;

      // Adjacency check
      const isAdjacent = (Math.abs(r - er) + Math.abs(c - ec)) === 1;
      const isSameRow = (r === er);
      const isSameCol = (c === ec);

      if (isAdjacent) {
        // Simple 1-tile slide
        tile.curRow = er;
        tile.curCol = ec;
        tile.element.style.setProperty("--r", er);
        tile.element.style.setProperty("--c", ec);

        this.emptySlot = { r, c };
        const emptyTile = this.tiles.find(t => t.isEmpty);
        if (emptyTile) {
          emptyTile.curRow = r;
          emptyTile.curCol = c;
          emptyTile.element.style.setProperty("--r", r);
          emptyTile.element.style.setProperty("--c", c);
        }

        this.onMoveExecuted(tile);
      } else if (isSameRow || isSameCol) {
        // Multi-tile line push for fluid mobile touch
        const tilesToPush = [];
        if (isSameRow) {
          const step = c < ec ? 1 : -1;
          for (let currC = ec - step; currC !== c - step; currC -= step) {
            const t = this.tiles.find(item => item.curRow === r && item.curCol === currC);
            if (t) tilesToPush.push({ tile: t, targetR: r, targetC: currC + step });
          }
        } else {
          const step = r < er ? 1 : -1;
          for (let currR = er - step; currR !== r - step; currR -= step) {
            const t = this.tiles.find(item => item.curRow === currR && item.curCol === c);
            if (t) tilesToPush.push({ tile: t, targetR: currR + step, targetC: c });
          }
        }

        tilesToPush.forEach(({ tile: t, targetR, targetC }) => {
          t.curRow = targetR;
          t.curCol = targetC;
          t.element.style.setProperty("--r", targetR);
          t.element.style.setProperty("--c", targetC);
        });

        this.emptySlot = { r, c };
        const emptyTile = this.tiles.find(t => t.isEmpty);
        if (emptyTile) {
          emptyTile.curRow = r;
          emptyTile.curCol = c;
          emptyTile.element.style.setProperty("--r", r);
          emptyTile.element.style.setProperty("--c", c);
        }

        this.onMoveExecuted(tile);
      }
    }

    handleSwapMove(tile) {
      if (!this.selectedTile) {
        // Select piece
        this.selectedTile = tile;
        tile.element.classList.add("is-selected");
        this.playSound("playSelect");
        this.vibrate(8);
      } else if (this.selectedTile === tile) {
        // Deselect
        tile.element.classList.remove("is-selected");
        this.selectedTile = null;
        this.playSound("playSelect");
      } else {
        // Swap pieces
        const prev = this.selectedTile;
        prev.element.classList.remove("is-selected");
        this.selectedTile = null;

        const { curRow: r1, curCol: c1 } = prev;
        const { curRow: r2, curCol: c2 } = tile;

        prev.curRow = r2;
        prev.curCol = c2;
        prev.element.style.setProperty("--r", r2);
        prev.element.style.setProperty("--c", c2);

        tile.curRow = r1;
        tile.curCol = c1;
        tile.element.style.setProperty("--r", r1);
        tile.element.style.setProperty("--c", c1);

        this.onMoveExecuted(tile, "swap");
      }
    }

    onMoveExecuted(movedTile, moveType = "slide") {
      this.moves++;
      this.updateMovesDisplay(this.moves);
      this.playSound("playMove", moveType);
      this.vibrate(12);

      if (movedTile?.element) {
        movedTile.element.classList.add("is-moving");
        setTimeout(() => movedTile.element?.classList.remove("is-moving"), 220);
      }

      const isNowCorrect = (movedTile.curRow === movedTile.origRow && movedTile.curCol === movedTile.origCol);
      if (isNowCorrect) {
        this.playSound("playPieceCorrect");
        this.vibrate([8, 15, 8]);
      }

      this.updateCorrectClasses();
      this.updateSolvedDisplay();
      this.checkVictory();
    }

    updateCorrectClasses() {
      this.tiles.forEach(t => {
        const correct = (t.curRow === t.origRow && t.curCol === t.origCol);
        t.element.classList.toggle("is-correct", correct);
      });
    }

    updateSolvedDisplay() {
      const correctCount = this.tiles.filter(t => !t.isEmpty && t.curRow === t.origRow && t.curCol === t.origCol).length;
      const solvedEl = document.getElementById("puzzleSolvedCount");
      if (solvedEl) solvedEl.textContent = correctCount;
    }

    updateMovesDisplay(moves) {
      const el = document.getElementById("puzzleMovesCount");
      if (el) el.textContent = moves;
    }

    startTimer() {
      if (this.isTimerRunning) return;
      this.isTimerRunning = true;
      this.timerInterval = setInterval(() => {
        this.timerSeconds++;
        const timerEl = document.getElementById("puzzleTimerText");
        if (timerEl) {
          const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, "0");
          const s = String(this.timerSeconds % 60).padStart(2, "0");
          timerEl.textContent = `${m}:${s}`;
        }
      }, 1000);
    }

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.isTimerRunning = false;
    }

    resetTimer() {
      this.stopTimer();
      this.timerSeconds = 0;
      const timerEl = document.getElementById("puzzleTimerText");
      if (timerEl) timerEl.textContent = "00:00";
    }

    checkVictory() {
      const allCorrect = this.tiles.every(t => t.curRow === t.origRow && t.curCol === t.origCol);
      if (allCorrect) {
        this.triggerVictory();
      }
    }

    triggerVictory() {
      if (this.isSolved) return;
      this.isSolved = true;
      this.stopTimer();
      const isNewBest = this.saveBestScore();

      // Show missing piece in slide mode
      const emptyTile = this.tiles.find(t => t.isEmpty);
      if (emptyTile) {
        emptyTile.element.classList.remove("is-empty");
      }

      // Completed photo aura
      if (this.completedOverlayEl) {
        this.completedOverlayEl.classList.add("is-active");
      }

      this.playSound("playVictory");
      this.vibrate([40, 50, 40, 50, 100]);

      // Confetti burst
      if (typeof window !== "undefined") {
        if (typeof window.confetti === "function") {
          try {
            window.confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#ff5470", "#ffd700", "#ff758c", "#ffffff", "#c56cf0"]
            });
          } catch (e) {}
        } else if (window.particles && typeof window.particles.burst === "function") {
          try { window.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 80); } catch (e) {}
        }
      }

      // Slide up Keepsake Modal after brief delay
      setTimeout(() => {
        this.openKeepsakeModal(isNewBest);
      }, 650);
    }

    openKeepsakeModal(isNewBest = false) {
      if (!this.modalEl) return;
      const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, "0");
      const s = String(this.timerSeconds % 60).padStart(2, "0");
      const timeStr = `${m}:${s}`;

      const statTime = document.getElementById("modalStatTime");
      const statMoves = document.getElementById("modalStatMoves");
      const statMode = document.getElementById("modalStatMode");

      if (statTime) statTime.textContent = timeStr;
      if (statMoves) statMoves.textContent = this.moves;
      if (statMode) {
        statMode.innerHTML = `${this.gridSize}×${this.gridSize} ${this.mode === 'slide' ? 'Slide' : 'Swap'}${isNewBest ? ' <span style="color:#f7d794; font-weight:800;">🏆 New Record!</span>' : ''}`;
      }

      // Interactive 3D Perspective Tilt on Polaroid
      const card = document.getElementById("polaroidTiltCard");
      if (card) {
        const onMove = (e) => {
          const rect = card.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const x = clientX - rect.left - rect.width / 2;
          const y = clientY - rect.top - rect.height / 2;
          const rotX = (-y / (rect.height / 2)) * 12;
          const rotY = (x / (rect.width / 2)) * 12;
          card.style.transform = `perspective(700px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale(1.03)`;
        };
        const onLeave = () => {
          card.style.transform = "rotate(-2deg) scale(1)";
        };
        card.onmousemove = onMove;
        card.ontouchmove = onMove;
        card.onmouseleave = onLeave;
        card.ontouchend = onLeave;
      }

      this.modalEl.style.display = "flex";
    }

    closeKeepsakeModal() {
      if (this.modalEl) this.modalEl.style.display = "none";
    }

    solveInstant() {
      this.tiles.forEach(t => {
        t.curRow = t.origRow;
        t.curCol = t.origCol;
        t.element.style.setProperty("--r", t.origRow);
        t.element.style.setProperty("--c", t.origCol);
      });
      this.updateCorrectClasses();
      this.updateSolvedDisplay();
      this.triggerVictory();
    }

    downloadKeepsakePNG() {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const p1 = this.config.partner1 || this.hero.partner1 || "Alex";
      const p2 = this.config.partner2 || this.hero.partner2 || "Sam";
      const reward = this.config.reward || {};

      // Background Parchment / Dark Velvet
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
      bgGrad.addColorStop(0, "#24101e");
      bgGrad.addColorStop(0.5, "#150912");
      bgGrad.addColorStop(1, "#0a0408");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 800);

      // Gold Foil Double Border
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1140, 740);
      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 40, 1120, 720);

      // Title & Subtitle
      ctx.textAlign = "center";
      ctx.fillStyle = "#ff758c";
      ctx.font = "bold 20px -apple-system, sans-serif";
      ctx.fillText((this.config.tag || "MEMORY PHOTO PUZZLE 🧩").toUpperCase(), 600, 90);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px Georgia, serif";
      ctx.fillText(reward.title || "You Complete My World 💕", 600, 140);

      // Dedicated Awardee
      ctx.fillStyle = "#d4af37";
      ctx.font = "italic 24px -apple-system, sans-serif";
      ctx.fillText(`Presented to ${p2} with all my love from ${p1}`, 600, 185);

      // Completed Photo Drawing (Polaroid on Left)
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Polaroid Backing
        ctx.save();
        ctx.translate(320, 460);
        ctx.rotate(-0.04);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 12;
        ctx.fillRect(-170, -200, 340, 380);

        // Photo Inside Polaroid
        ctx.shadowColor = "transparent";
        ctx.drawImage(img, -150, -180, 300, 300);

        // Polaroid Text
        ctx.fillStyle = "#333333";
        ctx.font = "bold 18px cursive, sans-serif";
        ctx.fillText("Our Forever Memory ❤️", 0, 150);
        ctx.restore();

        // Right Column: Stats & Letter
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 20px -apple-system, sans-serif";
        ctx.fillText("PUZZLE ACHIEVEMENTS", 540, 270);

        // Achievement Pills
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(540, 290, 580, 70);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.strokeRect(540, 290, 580, 70);

        ctx.fillStyle = "#ffffff";
        ctx.font = "16px -apple-system, sans-serif";
        const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, "0");
        const s = String(this.timerSeconds % 60).padStart(2, "0");
        ctx.fillText(`⏱️ Time: ${m}:${s}   •   🔄 Moves: ${this.moves}   •   🧩 ${this.gridSize}×${this.gridSize} ${this.mode === 'slide' ? 'Slide' : 'Swap'}`, 560, 332);

        // Romantic Letter Text
        ctx.fillStyle = "#ffe4e8";
        ctx.font = "italic 20px Georgia, serif";
        const letter = reward.letter || "Every moment fits into place perfectly.";
        const words = letter.split(" ");
        let line = "", y = 410;
        words.forEach(w => {
          const testLine = line + w + " ";
          if (ctx.measureText(testLine).width > 560) {
            ctx.fillText(line, 540, y);
            line = w + " ";
            y += 32;
          } else {
            line = testLine;
          }
        });
        if (line) ctx.fillText(line, 540, y);

        // Wax Seal Stamp
        ctx.beginPath();
        ctx.arc(1040, 680, 45, 0, Math.PI * 2);
        ctx.fillStyle = "#b03a60";
        ctx.fill();
        ctx.strokeStyle = "#d4af37";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 16px -apple-system, sans-serif";
        ctx.fillText("OFFICIAL", 1040, 675);
        ctx.fillText("SEAL ❤️", 1040, 695);

        // Trigger download
        const link = document.createElement("a");
        link.download = "our-love-puzzle-keepsake.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = this.photoUrl;
    }
  }

  // Exposed initialization function
  window.setupPuzzlePhoto = function(data = {}, hero = {}) {
    const config = (data && typeof data === "object") ? data : (window.PUZZLE_PHOTO_DATA || {});
    activeGame = new PuzzleGame(config, hero);
    return activeGame;
  };

  // Iframe cross-window message listeners for Live Builder
  window.addEventListener("message", (e) => {
    if (!e.data || typeof e.data !== "object" || !activeGame) return;
    const { type, mode, size } = e.data;
    if (type === "PUZZLE_RESET" || type === "PUZZLE_SCRAMBLE") {
      activeGame.scramble();
    } else if (type === "PUZZLE_SOLVE") {
      activeGame.solveInstant();
    } else if (type === "PUZZLE_OPEN_KEEPSAKE") {
      activeGame.openKeepsakeModal();
    } else if (type === "PUZZLE_SET_MODE" && mode) {
      activeGame.setMode(mode);
    } else if (type === "PUZZLE_SET_SIZE" && size) {
      activeGame.setGridSize(Number(size));
    }
  });

  // Auto-init on DOMContentLoaded if element exists
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("section-puzzle_photo")) {
          window.setupPuzzlePhoto();
        }
      });
    } else {
      if (document.getElementById("section-puzzle_photo")) {
        window.setupPuzzlePhoto();
      }
    }
  }
})();
