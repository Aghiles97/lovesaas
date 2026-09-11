(function() {
  let internalAudio = null;
  let isPlaying = false;
  let currentIdx = 0;
  let playbackSpeed = 1.0;
  let animFrameId = null;
  let waveData = [];
  let simTimer = null;
  let simCurrentTime = 0;
  let simDuration = 60;

  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function parseDuration(durStr) {
    if (!durStr) return 60;
    const parts = String(durStr).split(":");
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10) || 0;
      const s = parseInt(parts[1], 10) || 0;
      return m * 60 + s;
    }
    return 60;
  }

  function generateWaveData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
      const base = 0.25 + 0.65 * Math.sin((i / count) * Math.PI);
      const jitter = (Math.random() - 0.5) * 0.35;
      data.push(Math.max(0.12, Math.min(1.0, base + jitter)));
    }
    return data;
  }

  window.setupAudioCapsule = function(data) {
    const section = document.getElementById("audioCapsuleSection");
    if (!section) return;

    const defaultMemos = [
      { id: "m1", title: "First Birthday Message", speaker: "Alex", year: "2021", date: "Jun 18, 2021", duration: "0:45", audioUrl: "audio/taylor-swift-fate-of-ophelia.m4r" },
      { id: "m2", title: "Midnight Flight Voice Note", speaker: "Ella", year: "2022", date: "Nov 03, 2022", duration: "1:12", audioUrl: "audio/lady-gaga-always-remember-us-this-way.m4r" },
      { id: "m3", title: "Saying Yes in Tuscany", speaker: "Alex & Ella", year: "2023", date: "Sep 14, 2023", duration: "0:58", audioUrl: "audio/imagine-dragons-i-follow-you.m4r" },
      { id: "m4", title: "Our 3-Year Anniversary Promise", speaker: "Ella", year: "2024", date: "Jun 18, 2024", duration: "1:35", audioUrl: "audio/taylor-swift-fate-of-ophelia.m4r" }
    ];

    const memos = (data && Array.isArray(data.memos) && data.memos.length) ? data.memos : defaultMemos;
    currentIdx = Math.min(currentIdx, memos.length - 1);

    const canvas = document.getElementById("capsuleWaveformCanvas");
    const playBtn = document.getElementById("btnCapsulePlay");
    const playIcon = document.getElementById("capsulePlayIcon");
    const prevBtn = document.getElementById("btnCapsulePrev");
    const nextBtn = document.getElementById("btnCapsuleNext");
    const speedBtn = document.getElementById("btnCapsuleSpeed");
    const volSlider = document.getElementById("capsuleVolume");
    const timeCurEl = document.getElementById("capsuleTimeCur");
    const timeDurEl = document.getElementById("capsuleTimeDur");
    const nowTitleEl = document.getElementById("capsuleNowTitle");
    const nowSpeakerEl = document.getElementById("capsuleNowSpeaker");
    const nowDateEl = document.getElementById("capsuleNowDate");
    const reelLeft = document.getElementById("capsuleReelLeft");
    const reelRight = document.getElementById("capsuleReelRight");
    const filterPills = section.querySelectorAll(".capsule-filter-pill");
    const memoCards = section.querySelectorAll(".capsule-memo-card");

    if (waveData.length === 0) waveData = generateWaveData(70);

    if (!internalAudio) {
      internalAudio = new Audio();
      internalAudio.addEventListener("ended", () => {
        playTrack((currentIdx + 1) % memos.length);
      });
      internalAudio.addEventListener("timeupdate", () => {
        if (!internalAudio.duration) return;
        if (timeCurEl) timeCurEl.textContent = formatTime(internalAudio.currentTime);
        if (timeDurEl && !isNaN(internalAudio.duration)) timeDurEl.textContent = formatTime(internalAudio.duration);
      });
    }

    function getProgress() {
      if (internalAudio && internalAudio.src && !isNaN(internalAudio.duration) && internalAudio.duration > 0) {
        return internalAudio.currentTime / internalAudio.duration;
      }
      return simDuration > 0 ? (simCurrentTime / simDuration) : 0;
    }

    function drawWaveform() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (rect.width > 0 && Math.round(rect.width * dpr) !== canvas.width) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round((rect.height || 52) * dpr);
      }
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const count = waveData.length;
      const gap = Math.max(2, Math.round(2 * dpr));
      const barWidth = (width - (count - 1) * gap) / count;
      const progress = getProgress();
      const activeIdx = Math.floor(progress * count);

      for (let i = 0; i < count; i++) {
        let hRatio = waveData[i];
        if (isPlaying) {
          const mod = Math.sin((Date.now() / 200) + (i * 0.4)) * 0.2;
          hRatio = Math.max(0.12, Math.min(1.0, hRatio + mod));
        }
        const barHeight = Math.max(4, hRatio * (height - 10));
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        if (i <= activeIdx) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, "#ff4365");
          grad.addColorStop(1, "#fbbf24");
          ctx.fillStyle = grad;
          ctx.shadowColor = "rgba(255, 67, 101, 0.4)";
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      if (isPlaying) {
        animFrameId = requestAnimationFrame(drawWaveform);
      }
    }

    function updateTrackMeta() {
      const memo = memos[currentIdx] || memos[0];
      if (!memo) return;

      if (nowTitleEl) nowTitleEl.textContent = memo.title || "Voice Memo";
      if (nowSpeakerEl) nowSpeakerEl.textContent = memo.speaker ? `From ${memo.speaker}` : "Voice Memo";
      if (nowDateEl) nowDateEl.textContent = memo.date || memo.year || "";
      if (timeDurEl) timeDurEl.textContent = memo.duration || "1:00";
      if (timeCurEl && !isPlaying) timeCurEl.textContent = "0:00";

      memoCards.forEach((c) => {
        const idx = parseInt(c.dataset.idx, 10);
        const isCur = idx === currentIdx;
        c.classList.toggle("active", isCur);
        const icon = c.querySelector(".play-icon");
        if (icon) icon.textContent = isCur && isPlaying ? "⏸" : "▶";
      });
    }

    function setPlayingState(playing) {
      isPlaying = playing;
      if (playIcon) playIcon.textContent = playing ? "⏸" : "▶";
      if (reelLeft) reelLeft.classList.toggle("spinning", playing);
      if (reelRight) reelRight.classList.toggle("spinning", playing);

      const bgAudio = document.getElementById("bgAudioPlayer");
      if (playing && bgAudio && !bgAudio.paused) {
        try { bgAudio.pause(); } catch (e) {}
      }

      if (playing) {
        cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(drawWaveform);

        clearInterval(simTimer);
        simTimer = setInterval(() => {
          if (!internalAudio.src || isNaN(internalAudio.duration)) {
            simCurrentTime += 0.25 * playbackSpeed;
            if (simCurrentTime >= simDuration) {
              playTrack((currentIdx + 1) % memos.length);
              return;
            }
            if (timeCurEl) timeCurEl.textContent = formatTime(simCurrentTime);
          }
        }, 250);
      } else {
        cancelAnimationFrame(animFrameId);
        clearInterval(simTimer);
        drawWaveform();
      }

      updateTrackMeta();
    }

    function playTrack(idx) {
      currentIdx = (idx + memos.length) % memos.length;
      const memo = memos[currentIdx];
      simCurrentTime = 0;
      simDuration = parseDuration(memo.duration);

      waveData = generateWaveData(70);
      updateTrackMeta();

      if (internalAudio && memo && memo.audioUrl) {
        internalAudio.src = memo.audioUrl;
        internalAudio.playbackRate = playbackSpeed;
        if (volSlider) internalAudio.volume = volSlider.value / 100;
        internalAudio.play().then(() => {
          setPlayingState(true);
        }).catch(() => {
          setPlayingState(true);
        });
      } else {
        setPlayingState(true);
      }
    }

    function togglePlay() {
      if (isPlaying) {
        if (internalAudio && !internalAudio.paused) internalAudio.pause();
        setPlayingState(false);
      } else {
        const memo = memos[currentIdx];
        if (internalAudio && internalAudio.src) {
          internalAudio.play().then(() => setPlayingState(true)).catch(() => setPlayingState(true));
        } else {
          playTrack(currentIdx);
        }
      }
    }

    if (playBtn) playBtn.onclick = togglePlay;
    if (prevBtn) prevBtn.onclick = () => playTrack(currentIdx - 1);
    if (nextBtn) nextBtn.onclick = () => playTrack(currentIdx + 1);

    const speeds = [1.0, 1.25, 1.5, 2.0];
    if (speedBtn) {
      speedBtn.onclick = () => {
        const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
        playbackSpeed = speeds[nextIdx];
        speedBtn.textContent = `${playbackSpeed}x`;
        if (internalAudio) internalAudio.playbackRate = playbackSpeed;
      };
    }

    if (volSlider) {
      volSlider.oninput = () => {
        if (internalAudio) internalAudio.volume = volSlider.value / 100;
      };
    }

    if (canvas) {
      const handleScrub = (clientX) => {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        if (internalAudio && !isNaN(internalAudio.duration) && internalAudio.duration > 0) {
          internalAudio.currentTime = ratio * internalAudio.duration;
          if (timeCurEl) timeCurEl.textContent = formatTime(internalAudio.currentTime);
        } else {
          simCurrentTime = ratio * simDuration;
          if (timeCurEl) timeCurEl.textContent = formatTime(simCurrentTime);
        }
        drawWaveform();
      };
      canvas.onclick = (e) => handleScrub(e.clientX);
      canvas.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches[0]) handleScrub(e.touches[0].clientX);
      }, { passive: true });
      canvas.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) handleScrub(e.touches[0].clientX);
      }, { passive: true });
    }

    // Filter pills
    filterPills.forEach(pill => {
      pill.onclick = () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        const yr = String(pill.dataset.year || "all").toLowerCase();
        memoCards.forEach(card => {
          const cardYr = String(card.dataset.year || "").toLowerCase();
          const match = yr === "all" || cardYr === yr;
          card.style.display = match ? "flex" : "none";
        });
      };
    });

    // Memo card play buttons
    section.querySelectorAll("[data-play-memo]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.playMemo, 10);
        if (idx === currentIdx && isPlaying) {
          togglePlay();
        } else {
          playTrack(idx);
        }
      };
    });

    memoCards.forEach(card => {
      card.onclick = () => {
        const idx = parseInt(card.dataset.idx, 10);
        if (idx === currentIdx && isPlaying) {
          togglePlay();
        } else {
          playTrack(idx);
        }
      };
    });

    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CAPSULE_TOGGLE") togglePlay();
    });
    window.addEventListener("resize", () => {
      drawWaveform();
    }, { passive: true });

    updateTrackMeta();
    drawWaveform();

    window.capsuleToggle = togglePlay;
    window.capsulePlayTrack = playTrack;
  };
})();
