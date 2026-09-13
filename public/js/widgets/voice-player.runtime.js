/**
 * Runtime Widget Engine: voice-player.runtime.js
 * Modularized for high maintainability.
 */
function setupVoiceNotePlayer() {
  const playBtn = document.getElementById("playVoiceBtn");
  const player = document.getElementById("voiceAudioPlayer");
  const status = document.getElementById("voiceNoteStatus");
  const playIcon = document.getElementById("voicePlayIcon");
  const playText = document.getElementById("voicePlayText");
  const bgAudio = document.getElementById("bgAudioPlayer");
  if (!playBtn || !player) return;

  const rawSrc = state.voiceAudio || "audio/myrecording-volume-adjusted.m4r";
  let audioSrc = rawSrc;
  if (rawSrc.includes("myrecording") && !rawSrc.includes("myrecording-volume-adjusted")) {
    audioSrc = "audio/myrecording-volume-adjusted.m4r";
  }
  if (!player.src || !player.src.endsWith(audioSrc)) {
    player.src = audioSrc;
    player.load();
  }

  let voiceGainNode = null;
  let voiceCompressorNode = null;

  const initVoiceAmplifier = () => {
    if (voiceGainNode) return voiceGainNode;
    try {
      if (typeof audio !== "undefined") audio.init();
      const ctx = (typeof audio !== "undefined" && audio.ctx) ? audio.ctx : new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      if (!player._webAudioSource) {
        player._webAudioSource = ctx.createMediaElementSource(player);
        voiceGainNode = ctx.createGain();
        voiceCompressorNode = ctx.createDynamicsCompressor();
        voiceCompressorNode.threshold.setValueAtTime(-1.0, ctx.currentTime);
        voiceCompressorNode.knee.setValueAtTime(12, ctx.currentTime);
        voiceCompressorNode.ratio.setValueAtTime(3.0, ctx.currentTime);
        voiceCompressorNode.attack.setValueAtTime(0.005, ctx.currentTime);
        voiceCompressorNode.release.setValueAtTime(0.1, ctx.currentTime);
        player._webAudioSource.connect(voiceGainNode);
        voiceGainNode.connect(voiceCompressorNode);
        voiceCompressorNode.connect(ctx.destination);
      }
      return voiceGainNode;
    } catch (e) {
      return null;
    }
  };

  const applyVoiceVolGain = (volPercent) => {
    const gainVal = volPercent / 100;
    if (gainVal <= 1.0 && !player._webAudioSource) {
      player.volume = Math.min(Math.max(gainVal, 0), 1.0);
      return;
    }
    const gainNode = initVoiceAmplifier();
    if (gainNode) {
      try {
        const ctx = (typeof audio !== "undefined" && audio.ctx) ? audio.ctx : null;
        if (ctx && ctx.state === "suspended") ctx.resume();
        gainNode.gain.setValueAtTime(gainVal, ctx ? ctx.currentTime : 0);
        player.volume = 1.0;
        return;
      } catch (e) {}
    }
    player.volume = Math.min(gainVal, 1.0);
  };

  const getVoiceVol = () => {
    let v = localStorage.getItem("gf_voice_volume");
    if (!v || v === "100" || v === "175") {
      v = "300";
      localStorage.setItem("gf_voice_volume", "300");
    }
    const num = parseInt(v || "300", 10);
    return Math.min(Math.max(isNaN(num) ? 300 : num, 0), 300);
  };

  const getVoiceBgVol = () => {
    let v = localStorage.getItem("gf_voice_bg_volume");
    if (!v || v === "20") {
      v = "7";
      localStorage.setItem("gf_voice_bg_volume", "7");
    }
    const num = parseInt(v || "7", 10);
    return Math.min(Math.max(isNaN(num) ? 7 : num, 0), 100) / 100;
  };

  applyVoiceVolGain(getVoiceVol());

  let _wasBgPlaying = false;

  const restoreVolume = () => {
    if (!_wasBgPlaying) return;
    _wasBgPlaying = false;
    if (typeof fadeInBgMusic === "function") {
      fadeInBgMusic();
    } else if (bgAudio) {
      const savedVol = parseInt(localStorage.getItem("gf_volume") || "80", 10) / 100;
      bgAudio.volume = Math.min(Math.max(savedVol, 0), 1);
    }
  };

  player.addEventListener("play", () => {
    if (typeof audio !== "undefined" && typeof audio.cancelFade === "function") {
      audio.cancelFade();
    }
    const letterPlayer = document.getElementById("letterAudioPlayer");
    if (letterPlayer && !letterPlayer.paused) {
      letterPlayer.pause();
      const letterPlayIcon = document.getElementById("letterPlayIcon");
      const letterPlayText = document.getElementById("letterPlayText");
      if (letterPlayIcon) letterPlayIcon.textContent = "▶️";
      if (letterPlayText) letterPlayText.textContent = "Play";
    }
    applyVoiceVolGain(getVoiceVol());
    _wasBgPlaying = Boolean(bgAudio && !bgAudio.paused && !bgAudio.ended);
    if (bgAudio && _wasBgPlaying) {
      const bgVol = getVoiceBgVol();
      bgAudio.volume = bgVol;
    }
  });

  player.addEventListener("pause", () => {
    if (player.currentTime < player.duration) restoreVolume();
  });

  player.addEventListener("ended", () => {
    restoreVolume();
    if (playIcon) playIcon.textContent = "▶️";
    if (playText) playText.textContent = "Replay";
    if (status) status.textContent = "Tap to replay my voice note ❤️";
  });

  const volBtn = document.getElementById("voiceBgVolBtn");
  const volWrap = document.getElementById("voiceBgVolWrap");
  const volPopover = document.getElementById("voiceBgVolPopover");
  const volSlider = document.getElementById("voiceBgVolumeSlider");
  const volVal = document.getElementById("voiceBgVolVal");
  const voiceVolSlider = document.getElementById("voiceNoteVolumeSlider");
  const voiceVolVal = document.getElementById("voiceNoteVolVal");
  const voiceMuteBtn = document.getElementById("voiceNoteMuteBtn");
  const bgMuteBtn = document.getElementById("voiceBgMuteBtn");

  const syncVoiceSpeechVolUI = (val) => {
    const num = Math.min(Math.max(parseInt(val, 10) || 0, 0), 300);
    if (voiceVolSlider) voiceVolSlider.value = num;
    if (voiceVolVal) {
      voiceVolVal.textContent = num > 100 ? `${num}% ⚡` : `${num}%`;
      voiceVolVal.classList.toggle("voice-vol-boosted", num > 100);
    }
    if (voiceMuteBtn) voiceMuteBtn.textContent = num === 0 ? "🔇" : (num < 50 ? "🔉" : (num > 100 ? "🔊⚡" : "🔊"));
    const settingsSlider = document.getElementById("inputVoiceVolume");
    const settingsVal = document.getElementById("inputVoiceVolumeVal");
    if (settingsSlider) settingsSlider.value = num;
    if (settingsVal) settingsVal.textContent = num > 100 ? `${num}% ⚡` : `${num}%`;
    applyVoiceVolGain(num);
    if (typeof state !== "undefined") state.voiceVolume = num;
  };

  const syncVoiceBgVolUI = (val) => {
    const num = Math.min(Math.max(parseInt(val, 10) || 0, 0), 100);
    if (volSlider) volSlider.value = num;
    if (volVal) volVal.textContent = `${num}%`;
    if (bgMuteBtn) bgMuteBtn.textContent = num === 0 ? "🔇" : (num < 50 ? "🔉" : "🔊");
    const settingsSlider = document.getElementById("inputVoiceBgVolume");
    const settingsVal = document.getElementById("inputVoiceBgVolumeVal");
    if (settingsSlider) settingsSlider.value = num;
    if (settingsVal) settingsVal.textContent = `${num}%`;
    if (typeof state !== "undefined") state.voiceBgVolume = num;
  };

  const initialVoiceVol = getVoiceVol();
  const initialBgVol = parseInt(localStorage.getItem("gf_voice_bg_volume") || "7", 10);
  syncVoiceSpeechVolUI(initialVoiceVol);
  syncVoiceBgVolUI(initialBgVol);

  if (volBtn && volPopover) {
    volBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      volPopover.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (volWrap && !volWrap.contains(e.target)) {
        volPopover.classList.remove("open");
      }
    });
  }

  if (voiceVolSlider) {
    voiceVolSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      syncVoiceSpeechVolUI(val);
      localStorage.setItem("gf_voice_volume", val);
    });
  }

  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      syncVoiceBgVolUI(val);
      localStorage.setItem("gf_voice_bg_volume", val);
      if (player && !player.paused && bgAudio) {
        bgAudio.volume = val / 100;
      }
    });
  }

  let prevVoiceVol = 100;
  if (voiceMuteBtn) {
    voiceMuteBtn.addEventListener("click", () => {
      const cur = parseInt(localStorage.getItem("gf_voice_volume") || "100", 10);
      if (cur > 0) {
        prevVoiceVol = cur;
        syncVoiceSpeechVolUI(0);
        localStorage.setItem("gf_voice_volume", 0);
      } else {
        const target = prevVoiceVol || 100;
        syncVoiceSpeechVolUI(target);
        localStorage.setItem("gf_voice_volume", target);
      }
    });
  }

  let prevBgVol = 7;
  if (bgMuteBtn) {
    bgMuteBtn.addEventListener("click", () => {
      const cur = parseInt(localStorage.getItem("gf_voice_bg_volume") || "7", 10);
      if (cur > 0) {
        prevBgVol = cur;
        syncVoiceBgVolUI(0);
        localStorage.setItem("gf_voice_bg_volume", 0);
        if (player && !player.paused && bgAudio) bgAudio.volume = 0;
      } else {
        const target = prevBgVol || 7;
        syncVoiceBgVolUI(target);
        localStorage.setItem("gf_voice_bg_volume", target);
        if (player && !player.paused && bgAudio) bgAudio.volume = target / 100;
      }
    });
  }

  document.querySelectorAll(".vol-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const vVol = parseInt(btn.dataset.voice || "100", 10);
      const bgVol = parseInt(btn.dataset.bg || "7", 10);
      syncVoiceSpeechVolUI(vVol);
      syncVoiceBgVolUI(bgVol);
      localStorage.setItem("gf_voice_volume", vVol);
      localStorage.setItem("gf_voice_bg_volume", bgVol);
      if (player && !player.paused && bgAudio) {
        bgAudio.volume = bgVol / 100;
      }
      if (typeof audio !== "undefined") audio.playPop();
    });
  });

  playBtn.addEventListener("click", () => {
    if (typeof audio !== "undefined" && typeof audio.init === "function") {
      audio.init();
    }
    const ctx = (typeof audio !== "undefined" && audio.ctx) ? audio.ctx : null;
    if (ctx && ctx.state === "suspended") ctx.resume();

    if (player.paused) {
      applyVoiceVolGain(getVoiceVol());
      const p = player.play();
      if (p !== undefined) {
        p.then(() => {
          if (playIcon) playIcon.textContent = "⏸️";
          if (playText) playText.textContent = "Pause";
          if (status) status.textContent = "Playing my voice note for you... 🎙️❤️";
        }).catch(() => {
          player.src = "audio/myrecording-volume-adjusted.m4r";
          player.load();
          player.play().then(() => {
            if (playIcon) playIcon.textContent = "⏸️";
            if (playText) playText.textContent = "Pause";
            if (status) status.textContent = "Playing my voice note for you... 🎙️❤️";
          }).catch(() => {
            player.src = "myrecording-volume-adjusted.m4r";
            player.load();
            player.play().catch(() => {});
          });
        });
      }
    } else {
      player.pause();
      if (playIcon) playIcon.textContent = "▶️";
      if (playText) playText.textContent = "Listen";
      if (status) status.textContent = "Paused. Tap to continue listening ❤️";
    }
  });

  // Upload/Set Taylor Swift - The Fate of Ophelia Background Music
  const uploadMusicBtn = document.getElementById("uploadMusicBtn");
  const inputMusicFile = document.getElementById("inputMusicFile");
  const inputMusicUrl = document.getElementById("inputMusicUrl");
  if (uploadMusicBtn) {
    uploadMusicBtn.addEventListener("click", () => {
      const file = inputMusicFile && inputMusicFile.files[0];
      const url = inputMusicUrl && inputMusicUrl.value.trim();

      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target.result;
          const ext = file.name.split('.').pop() || 'mp3';
          const fname = `custom-music.${ext}`;
          const saved = typeof saveAudioToDisk === "function" ? await saveAudioToDisk(dataUrl, fname) : false;
          const audioPath = (typeof saved === "string" && !saved.startsWith("data:")) ? saved : dataUrl;
          state.customMusicAudio = audioPath;
          try { localStorage.setItem("gf_music_audio", audioPath); } catch (err) {}
          if (typeof saveToComputer === "function") await saveToComputer({ gf_music_audio: audioPath });
          alert("Audio track saved to server successfully! 🎵");
          document.getElementById("settingsDrawer").classList.add("hidden");
          const bgAudio = document.getElementById("bgAudioPlayer");
          if (bgAudio) {
            bgAudio.src = state.customMusicAudio;
            if (state.musicPlaying) bgAudio.play();
          }
        };
        reader.readAsDataURL(file);
      } else if (url) {
        state.customMusicAudio = url;
        try { localStorage.setItem("gf_music_audio", url); } catch (err) {}
        if (typeof saveToComputer === "function") saveToComputer({ gf_music_audio: url });
        alert("Audio URL saved to server successfully! 🎵");
        document.getElementById("settingsDrawer").classList.add("hidden");
        const bgAudio = document.getElementById("bgAudioPlayer");
        if (bgAudio) {
          bgAudio.src = url;
          if (state.musicPlaying) bgAudio.play();
        }
      } else {
        alert("Please choose an audio file or paste an audio URL!");
      }
    });
  }
}
window.setupVoiceNotePlayer = setupVoiceNotePlayer;

// Evasive No Button Logic (Enhanced Teleporting Physics)
