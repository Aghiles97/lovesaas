/**
 * /draw - Couples Real-Time Drawing Game Runtime
 * Handles WebSocket/SSE networking, synchronized match stages,
 * responsive dual-pad canvas drawing, smooth Bézier strokes,
 * interactive poke reactions, solo mode, and keepsake generation.
 */

(function () {
  "use strict";

  // --- Web Audio Synthesizer ---
  const audioCtx = (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext))
    ? new (window.AudioContext || window.webkitAudioContext)()
    : null;

  function playPokeSound(emoji) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (emoji === "💖" || emoji === "⭐") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
      } else if (emoji === "💥") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      }

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // --- Toast Notification ---
  function showToast(msg) {
    const toast = document.getElementById("drawToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // --- Persistent Participant Storage (Session-Scoped per Tab) ---
  function getOrCreateParticipantId(code) {
    const key = `draw_pid_${code || "global"}`;
    let id = null;
    try {
      try { localStorage.removeItem(key); } catch (_) {}
      id = sessionStorage.getItem(key);
      if (!id) {
        id = "user_" + Math.random().toString(36).slice(2, 9);
        sessionStorage.setItem(key, id);
      }
    } catch (e) {
      id = "user_" + Math.random().toString(36).slice(2, 9);
    }
    return id;
  }

  let savedName = "";
  let savedSex = null;
  try {
    savedName = sessionStorage.getItem("draw_name") || localStorage.getItem("draw_name") || "";
    savedSex = sessionStorage.getItem("draw_sex") || localStorage.getItem("draw_sex") || null;
  } catch (e) {}

  const PROMPT_PACKS = {
    animals: {
      id: "animals",
      prompts: [
        "A penguin eating an ice cream cone",
        "A chonky cat wearing a detective coat",
        "Two otters holding hands while sleeping",
        "A golden retriever trying to catch a bubble",
        "A baby elephant playing in a mud puddle",
        "A hedgehog wrapped like a warm burrito",
        "A red panda standing up trying to look scary",
        "A duck wearing tiny yellow rain boots",
        "A fluffy llama wearing colorful sunglasses",
        "A frog sitting under a mushroom umbrella",
        "A sleepy sloth drinking iced coffee",
        "A hamster stuffing its cheeks with strawberries",
        "A bear attempting ballet in a tutu",
        "A capybara chilling with tiny birds on its head",
        "A seal doing a happy belly slide",
        "A corgi doing a high-speed zoomie"
      ]
    },
    food: {
      id: "food",
      prompts: [
        "Our ultimate midnight snack combo",
        "A giant steaming bowl of ramen with all toppings",
        "A cheesy pizza slice surfing on a soda wave",
        "A tower of fluffy pancakes dripping with syrup",
        "A boba milk tea with too many pearls",
        "A fancy taco with a happy mustache",
        "A cute sushi roll doing a backflip",
        "An overloaded croissant ice cream sandwich",
        "A warm chocolate chip cookie straight from the oven",
        "A hot pot feast boiling with goodness",
        "Our favorite dessert we always fight over",
        "A donut astronaut drifting in space"
      ]
    },
    random: {
      id: "random",
      prompts: [
        "A toaster launching into outer space",
        "A lonely cactus looking for a hug",
        "A cloud raining flowers and confetti",
        "A teapot that serves dreams instead of tea",
        "A bicycle made entirely of candy canes",
        "A haunted vending machine dispensing hugs",
        "A clock running backwards in slow motion",
        "A lightbulb having a brilliant realization",
        "A backpack with robotic legs walking itself",
        "A pair of sneakers dancing alone at midnight",
        "A cozy campfire roasting marshmallows for stars",
        "A flying skateboard powered by rainbows"
      ]
    },
    memories: {
      id: "memories",
      prompts: [
        "The last time we laughed really hard",
        "Our very first date together",
        "A cozy lazy Sunday morning in bed",
        "Our favorite trip or travel getaway",
        "The meal we made that was an absolute disaster",
        "The song or moment we danced together",
        "The inside joke only the two of us understand",
        "A place we dreamed about visiting together",
        "The sweetest surprise you ever gave me",
        "Watching the sunset or stars together",
        "How we look when we are both sleepy"
      ]
    },
    draw_me: {
      id: "draw_me",
      prompts: [
        "Draw me as a cartoon superhero",
        "My exact face when I'm hangry",
        "Draw me right now at this exact moment",
        "Me wearing a ridiculously fancy royal outfit",
        "My signature dance move when no one is watching",
        "Me waking up before my first sip of coffee",
        "Draw me as an adorable baby animal",
        "My reaction when you give me an unexpected hug",
        "Me trying to assemble flat-pack furniture",
        "The cutest thing about me in your eyes"
      ]
    },
    silly: {
      id: "silly",
      prompts: [
        "A potato with luscious shampoo-commercial hair",
        "An alien trying to understand human romantic comedy",
        "A chicken trying to park a sports car",
        "A drama queen pug having an existential crisis",
        "A fish trying to ride a bicycle underwater",
        "A pineapple wearing leather biker gear",
        "A dinosaur trying to apply eye shadow",
        "A marshmallow in a panic near a campfire",
        "A grumpy cat conducting an orchestra",
        "A pigeon giving a TED talk with supreme confidence"
      ]
    }
  };

  function getRandomPrompt(packId) {
    const basePack = PROMPT_PACKS[packId] || PROMPT_PACKS.animals;
    const customList = Array.isArray(state.customPrompts?.[packId]) ? state.customPrompts[packId] : [];
    const allPrompts = [...customList, ...basePack.prompts];
    if (!state.usedSoloPrompts) state.usedSoloPrompts = new Set();

    const used = new Set();
    if (Array.isArray(state.roundHistory)) {
      state.roundHistory.forEach(r => {
        if (r?.prompt) used.add(String(r.prompt).trim().toLowerCase());
      });
    }
    if (state.currentPrompt) {
      used.add(String(state.currentPrompt).trim().toLowerCase());
    }
    for (const p of state.usedSoloPrompts) {
      if (p) used.add(String(p).trim().toLowerCase());
    }

    const availableCustom = customList.filter(p => !used.has(String(p).trim().toLowerCase()));
    if (availableCustom.length > 0) {
      const chosen = availableCustom[Math.floor(Math.random() * availableCustom.length)];
      state.usedSoloPrompts.add(chosen);
      return chosen;
    }

    const available = allPrompts.filter(p => !used.has(String(p).trim().toLowerCase()));
    const pool = available.length > 0 ? available : allPrompts.filter(p => String(p).trim().toLowerCase() !== String(state.currentPrompt || "").trim().toLowerCase());
    const chosen = pool[Math.floor(Math.random() * pool.length)] || allPrompts[0] || basePack.prompts[0];
    state.usedSoloPrompts.add(chosen);
    return chosen;
  }

  // --- App State ---
  const state = {
    roomCode: null,
    customPrompts: {},
    isSolo: false,
    role: "host",
    participantId: getOrCreateParticipantId("global"),
    myName: savedName,
    partnerName: "Partner",
    mySex: savedSex,
    partnerSex: null,
    myReady: false,
    partnerReady: false,
    partnerConnected: true,
    stage: "lobby",
    selectedPack: "memories",
    roundsTotal: 3,
    secondsPerDrawing: 120,
    currentRound: 1,
    currentPrompt: "the last time we laughed really hard",
    timerRemaining: 120,
    timerRunning: false,
    ws: null,
    sse: null,
    currentColor: "#5fa0ff", // Blue default matching Image 4
    currentSize: 5,
    selectedPokeEmoji: "👉",
    currentStroke: null,
    isEraser: false,
    myRedoStack: [],
    myStrokes: [],
    partnerStrokes: [],
    roundHistory: []
  };

  // --- DOM Elements ---
  const el = {};
  function bindElements() {
    const ids = [
      "stageLobby", "stageProfile", "stagePackSelect", "stageMatchSetup",
      "stageDrawing", "stageRoundReview", "stageMatchComplete",
      "profileNameInput", "profileSexSelector", "btnProfileReady",
      "profileWaitingWrap", "profileWaitingText", "profilePartnerStatus",
      "profilePartnerStatusText", "btnStartRoom", "btnShowJoinForm",
      "btnPracticeSolo", "btnJoinRoomSubmit", "btnBackToInitial",
      "btnWaitingSkipToSolo", "inputJoinCode", "displayRoomCode",
      "btnCopyInvite", "waitingStatusText", "lobbyInitialView",
      "lobbyInlineJoinForm", "lobbyWaitingView", "packsGrid", "btnPackNext",
      "roundsSelector", "secondsSelector", "btnStartDrawing",
      "displayRoundNum", "displayRoundTotal", "displayPrompt", "displayTimer",
      "bottomStartWrap", "btnStartRoundTimer", "tabPartnerLabel",
      "canvasesContainer", "myPadCard", "partnerPadCard", "myPadBadge",
      "partnerPadBadge", "myCanvas", "partnerCanvas", "myPokeLayer",
      "partnerPokeLayer", "colorPalette", "btnToolEraser", "brushSizes",
      "btnToolUndo", "btnToolRedo", "btnClearCanvas", "pokeButtons",
      "reviewPromptText", "reviewMyName", "reviewPartnerName",
      "reviewMyImg", "reviewPartnerImg", "btnNextRound", "btnReviewExit",
      "recapGallery", "btnDownloadKeepsake", "btnPlayAgain",
      "btnExitComplete", "btnExitDrawing", "modalPlayAgain",
      "modalPlayAgainTitle", "modalPlayAgainText", "modalPlayAgainPromptActions",
      "modalPlayAgainWaiting", "btnAcceptPlayAgain", "btnDeclinePlayAgain",
      "btnCancelPlayAgain", "drawRemoteCursor", "remoteCursorTag",
      "remoteClickRipple", "drawToast", "btnBackToWebsite",
      "btnLaunchDrawStartRoom", "btnLaunchDrawJoinRoom", "btnLaunchDrawSolo",
      "btnCloseDrawModal", "drawGameModal"
    ];
    for (const id of ids) {
      el[id] = document.getElementById(id);
    }
  }
  bindElements();

  // --- Stage Switching ---
  function showStage(stageName) {
    state.stage = stageName;
    const isSolo = Boolean(state.isSolo);
    const isDark = (stageName === "lobby" || stageName === "profile_setup");

    document.body.classList.toggle("draw-solo-mode", isSolo);
    document.body.classList.toggle("draw-dark-stage", isDark);

    const modal = document.getElementById("drawGameModal");
    if (modal) {
      modal.classList.toggle("theme-dark-lobby", isDark);
      modal.classList.toggle("theme-light-studio", !isDark);
      modal.classList.toggle("draw-solo-mode", isSolo);
      modal.setAttribute("data-stage", stageName);
    }

    if (stageName === "lobby" || state.isSolo || !state.roomCode || !state.partnerConnected) {
      const cursor = document.getElementById("drawRemoteCursor");
      if (cursor) cursor.style.display = "none";
    }

    if (stageName === "lobby") {
      startLobbyShowcase();
    } else {
      stopLobbyShowcase();
    }

    const stages = [
      el.stageLobby,
      el.stageProfile,
      el.stagePackSelect,
      el.stageMatchSetup,
      el.stageDrawing,
      el.stageRoundReview,
      el.stageMatchComplete
    ];
    stages.forEach(s => s && s.classList.remove("active"));

    const stageMap = {
      lobby: el.stageLobby,
      profile_setup: el.stageProfile,
      pack_select: el.stagePackSelect,
      match_setup: el.stageMatchSetup,
      drawing: el.stageDrawing,
      round_review: el.stageRoundReview,
      match_complete: el.stageMatchComplete
    };

    const target = stageMap[stageName];
    if (target) {
      target.classList.add("active");
      if (stageName === "profile_setup") {
        if (el.profileNameInput && state.myName) {
          el.profileNameInput.value = state.myName;
        }
        if (state.mySex) {
          document.querySelectorAll("#profileSexSelector .draw-sex-btn").forEach(b => {
            b.classList.toggle("selected", b.dataset.sex === state.mySex);
          });
        }
        updateProfileReadyUI();
      } else if (stageName === "drawing") {
        requestAnimationFrame(() => {
          setupCanvasSize();
          redrawAllStrokes();
        });
      } else if (stageName === "match_complete") {
        renderRecapGallery();
      } else if (stageName === "round_review") {
        updateRoundReviewUI();
      }
      updateBadges();
    }
  }

  function updateRoundReviewUI(roundNum = state.currentRound) {
    const existing = state.roundHistory.find(r => r.round === roundNum) || state.roundHistory[state.roundHistory.length - 1];
    if (existing) {
      if (el.reviewPromptText) el.reviewPromptText.textContent = existing.prompt || state.currentPrompt || "";
      if (el.reviewMyName) el.reviewMyName.textContent = state.myName || "You";
      if (el.reviewPartnerName) el.reviewPartnerName.textContent = state.partnerName || "Partner";
      if (el.reviewMyImg && existing.myImg) el.reviewMyImg.src = existing.myImg;
      if (el.reviewPartnerImg) el.reviewPartnerImg.src = existing.partnerImg || (state.isSolo ? existing.myImg : "");
    }
    if (el.btnNextRound) {
      const isFinal = roundNum >= state.roundsTotal;
      const span = el.btnNextRound.querySelector("span");
      if (span) span.textContent = isFinal ? "Finish Match 🏆" : "Next Round ▷";
    }
  }

  // --- Networking: WebSocket + SSE Fallback ---
  function sendMsg(type, payload = {}) {
    if (state.isSolo) return;
    const data = {
      type,
      roomCode: state.roomCode,
      senderId: state.participantId,
      senderName: state.myName,
      payload
    };

    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      try {
        state.ws.send(JSON.stringify(data));
        return;
      } catch (e) {}
    }

    if (state.roomCode) {
      fetch(`/api/draw/rooms/${state.roomCode}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).catch(() => {});
    }
  }

  function syncRoomUrl(code) {
    if (!code) return;
    try {
      sessionStorage.setItem("draw_last_room", code);
      const url = new URL(window.location.href);
      if (url.searchParams.get("room") !== code) {
        url.searchParams.set("room", code);
        window.history.replaceState({ room: code }, "", url.toString());
      }
    } catch (_) {}
  }

  function initNetworking(roomCode) {
    state.roomCode = roomCode.toUpperCase().trim();
    syncRoomUrl(state.roomCode);
    state.participantId = getOrCreateParticipantId(state.roomCode);
    if (!state.myName || state.myName.startsWith("Partner")) {
      try {
        state.myName = sessionStorage.getItem("draw_name") || localStorage.getItem("draw_name") || state.myName;
      } catch (e) {}
    }
    if (!state.mySex) {
      try {
        state.mySex = sessionStorage.getItem("draw_sex") || localStorage.getItem("draw_sex") || null;
      } catch (e) {}
    }
    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProto}//${window.location.host}/draw-ws`;

    try {
      if (state.ws) {
        state.ws.onclose = null;
        state.ws.onerror = null;
        try { state.ws.close(); } catch (e) {}
        state.ws = null;
      }
      let wsConnected = false;
      const wsFallbackTimeout = setTimeout(() => {
        if (!wsConnected && !state.isSolo) {
          setupSseFallback();
        }
      }, 2000);

      const ws = new WebSocket(wsUrl);
      state.ws = ws;

      ws.onopen = () => {
        if (state.ws !== ws) return;
        wsConnected = true;
        clearTimeout(wsFallbackTimeout);
        if (state._reconnectTimer) {
          clearTimeout(state._reconnectTimer);
          state._reconnectTimer = null;
        }
        if (state.sse) {
          try { state.sse.close(); } catch (e) {}
          state.sse = null;
        }
        sendMsg("JOIN_ROOM", {
          roomCode: state.roomCode,
          participantId: state.participantId,
          name: state.myName || ""
        });
      };

      ws.onmessage = (evt) => {
        if (state.ws !== ws) return;
        try {
          const msg = JSON.parse(evt.data);
          handleIncomingMessage(msg);
        } catch (e) {}
      };

      ws.onerror = () => {
        if (state.ws !== ws) return;
        clearTimeout(wsFallbackTimeout);
        setupSseFallback();
      };

      ws.onclose = () => {
        if (state.ws !== ws) return;
        clearTimeout(wsFallbackTimeout);
        setupSseFallback();
        if (state.roomCode && !state.isSolo && !state._reconnectTimer) {
          state._reconnectTimer = setTimeout(() => {
            state._reconnectTimer = null;
            if (state.roomCode && !state.isSolo && (!state.ws || state.ws.readyState === WebSocket.CLOSED)) {
              initNetworking(state.roomCode);
            }
          }, 3000);
        }
      };
    } catch (e) {
      setupSseFallback();
    }
  }

  function setupSseFallback() {
    if (state.sse || state.isSolo) return;
    if (state.ws && state.ws.readyState === WebSocket.OPEN) return;
    if (!state.myName || state.myName.startsWith("Partner")) {
      try {
        state.myName = sessionStorage.getItem("draw_name") || localStorage.getItem("draw_name") || state.myName;
      } catch (e) {}
    }
    const url = `/api/draw/rooms/${state.roomCode}/events?id=${encodeURIComponent(state.participantId)}&name=${encodeURIComponent(state.myName || "")}`;
    const sse = new EventSource(url);
    state.sse = sse;
    sse.onmessage = (evt) => {
      if (state.sse !== sse) return;
      try {
        const msg = JSON.parse(evt.data);
        handleIncomingMessage(msg);
      } catch (e) {}
    };
    sse.onerror = () => {
      if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        try { sse.close(); } catch (e) {}
        if (state.sse === sse) state.sse = null;
      }
    };
  }

  // --- Message Dispatcher & State Hydration ---
  function handleIncomingMessage(msg) {
    const { type } = msg;

    if (type === "ROOM_FULL") {
      showToast(msg.error || "Room is full (2 partners maximum) 🚫");
      state.stage = "lobby";
      exitToMainMenu();
      return;
    }

    if (type === "ROOM_JOINED") {
      state.role = msg.role || state.role;
      if (msg.state?.profiles) {
        for (const [pid, prof] of Object.entries(msg.state.profiles)) {
          if (pid !== state.participantId && prof?.name) {
            if (!prof.name.startsWith("Partner") || !state.partnerName || state.partnerName.startsWith("Partner")) {
              state.partnerName = prof.name;
            }
            if (prof.sex) state.partnerSex = prof.sex;
            state.partnerReady = !!prof.ready;
          } else if (pid === state.participantId && prof?.name) {
            if (!prof.name.startsWith("Partner") || !state.myName || state.myName.startsWith("Partner")) {
              state.myName = prof.name;
            }
            if (prof.sex) state.mySex = prof.sex;
            state.myReady = !!prof.ready;
          }
        }
      } else if (msg.participants) {
        const other = msg.participants.find(p => p.id !== state.participantId);
        if (other && other.name && !other.name.startsWith("Partner")) {
          state.partnerName = other.name;
        }
      }

      if (!state.myName || state.myName.startsWith("Partner")) {
        try {
          const stored = sessionStorage.getItem("draw_name") || localStorage.getItem("draw_name") || "";
          if (stored) state.myName = stored;
        } catch (e) {}
      }

      if (state.myName && !state.myName.startsWith("Partner") && (!msg.state?.profiles?.[state.participantId] || msg.state?.profiles?.[state.participantId]?.name !== state.myName)) {
        sendMsg("SUBMIT_PROFILE", {
          name: state.myName,
          sex: state.mySex || "female"
        });
      }

      // Hydrate state if reconnecting to active session
      if (msg.state) {
        updateBadges();
        updateProfileReadyUI();

        if (msg.state.selectedPack) state.selectedPack = msg.state.selectedPack;
        if (msg.state.roundsTotal) state.roundsTotal = msg.state.roundsTotal;
        if (msg.state.secondsPerDrawing) state.secondsPerDrawing = msg.state.secondsPerDrawing;
        if (msg.state.currentRound) state.currentRound = msg.state.currentRound;
        if (msg.state.currentPrompt) state.currentPrompt = msg.state.currentPrompt;
        if (msg.state.timerRemaining !== undefined) state.timerRemaining = msg.state.timerRemaining;
        if (msg.state.timerRunning !== undefined) state.timerRunning = !!msg.state.timerRunning;

        // Restore strokes
        if (msg.state.strokes) {
          const serverMy = msg.state.strokes[state.participantId] || [];
          if (state.myStrokes.length === 0 || serverMy.length > state.myStrokes.length) {
            state.myStrokes = serverMy;
          }
          const partnerId = Object.keys(msg.state.strokes).find(id => id !== state.participantId);
          if (partnerId && msg.state.strokes[partnerId]) {
            const serverPartner = msg.state.strokes[partnerId];
            if (state.partnerStrokes.length === 0 || serverPartner.length > state.partnerStrokes.length) {
              state.partnerStrokes = serverPartner;
            }
          }
          if (state.stage === "drawing") {
            redrawAllStrokes();
          }
        }

        if (msg.state.roundHistory && Array.isArray(msg.state.roundHistory)) {
          msg.state.roundHistory.forEach(srvRound => {
            let existing = state.roundHistory.find(r => r.round === srvRound.round);
            let srvMy = srvRound.artwork?.[state.participantId] || "";
            let srvPartner = Object.entries(srvRound.artwork || {}).find(([id]) => id !== state.participantId)?.[1] || "";
            if (!srvMy && srvRound.strokes) {
              const mySt = srvRound.strokes[state.participantId] || (state.role === "host" ? srvRound.strokes[Object.keys(srvRound.strokes)[0]] : srvRound.strokes[Object.keys(srvRound.strokes)[1]]);
              if (mySt && mySt.length > 0) srvMy = exportArtworkDataURL(mySt);
            }
            if (!srvPartner && srvRound.strokes) {
              const partSt = Object.entries(srvRound.strokes).find(([id]) => id !== state.participantId)?.[1] || (state.role === "host" ? srvRound.strokes[Object.keys(srvRound.strokes)[1]] : srvRound.strokes[Object.keys(srvRound.strokes)[0]]);
              if (partSt && partSt.length > 0) srvPartner = exportArtworkDataURL(partSt);
            }
            if (!existing) {
              state.roundHistory.push({
                round: srvRound.round,
                prompt: srvRound.prompt,
                myImg: srvMy,
                partnerImg: srvPartner || (state.isSolo ? srvMy : "")
              });
            } else {
              if (srvMy) existing.myImg = srvMy;
              if (srvPartner) existing.partnerImg = srvPartner;
            }
          });
        }

        if (msg.state.stage && msg.state.stage !== "lobby") {
          updateDrawingHeader();
          showStage(msg.state.stage);
          return;
        }
      }

      if (el.waitingStatusText && state.stage === "lobby") {
        el.waitingStatusText.textContent = "Waiting for your partner to join...";
      }

      if (state.stage === "lobby" && (msg.participantCount >= 2 || state.role === "guest")) {
        showStage("profile_setup");
        showToast("Connected! Set up your profile 💕");
      }
      return;
    }

    if (type === "PARTNER_JOINED") {
      state.partnerConnected = true;
      if (msg.partner?.name && (!msg.partner.name.startsWith("Partner") || !state.partnerName || state.partnerName.startsWith("Partner"))) {
        state.partnerName = msg.partner.name;
        updateBadges();
      }
      if (state.stage === "lobby") {
        showToast("Partner connected! Set up your profiles 💕");
        showStage("profile_setup");
      }
      return;
    }

    if (type === "PROFILE_UPDATED") {
      if (msg.participantId !== state.participantId) {
        state.partnerName = msg.profile?.name || "Partner";
        state.partnerSex = msg.profile?.sex || "female";
        state.partnerReady = true;
        state.partnerConnected = true;
        updateBadges();
      }
      updateProfileReadyUI();
      const readyCount = msg.profiles ? Object.values(msg.profiles).filter(p => p.ready).length : (state.myReady && state.partnerReady ? 2 : 0);
      if (state.stage === "profile_setup" && (readyCount >= 2 || (state.myReady && state.partnerReady))) {
        showStage("pack_select");
        showToast("Both ready! Pick a prompt pack 🎨");
      }
      return;
    }

    if (type === "PROFILES_COMPLETED") {
      state.partnerConnected = true;
      if (msg.profiles) {
        for (const [pid, prof] of Object.entries(msg.profiles)) {
          if (pid !== state.participantId) {
            state.partnerName = prof.name || "Partner";
            state.partnerSex = prof.sex || "female";
            state.partnerReady = true;
          } else {
            state.myName = prof.name || state.myName;
            state.mySex = prof.sex || state.mySex;
            state.myReady = true;
          }
        }
      }
      updateBadges();
      showStage("pack_select");
      showToast("Both ready! Pick a prompt pack 🎨");
      return;
    }

    if (type === "PARTNER_RECONNECTED") {
      state.partnerConnected = true;
      if (msg.partnerName && !msg.partnerName.startsWith("Partner")) {
        state.partnerName = msg.partnerName;
      }
      updateBadges();
      showToast(`${state.partnerName || "Partner"} reconnected! 💕`);
      return;
    }

    if (type === "PARTNER_LEFT") {
      state.partnerConnected = false;
      showToast(`${state.partnerName} disconnected`);
      const cursor = document.getElementById("drawRemoteCursor");
      if (cursor) cursor.style.display = "none";
      return;
    }

    if (type === "PACK_SELECTED") {
      state.selectedPack = msg.packId;
      document.querySelectorAll(".draw-pack-card").forEach(c => {
        c.classList.toggle("selected", c.dataset.pack === msg.packId);
      });
      return;
    }

    if (type === "STAGE_CHANGED") {
      showStage(msg.stage);
      return;
    }

    if (type === "MATCH_CONFIG_UPDATED") {
      if (msg.roundsTotal) {
        state.roundsTotal = msg.roundsTotal;
        document.querySelectorAll("#roundsSelector .draw-pill-btn").forEach(b => {
          b.classList.toggle("selected", Number(b.dataset.rounds) === state.roundsTotal);
        });
      }
      if (msg.secondsPerDrawing) {
        state.secondsPerDrawing = msg.secondsPerDrawing;
        state.timerRemaining = msg.secondsPerDrawing;
        document.querySelectorAll("#secondsSelector .draw-pill-btn").forEach(b => {
          b.classList.toggle("selected", Number(b.dataset.seconds) === state.secondsPerDrawing);
        });
      }
      if (msg.customPrompts && typeof msg.customPrompts === "object") {
        state.customPrompts = msg.customPrompts;
      }
      return;
    }

    if (type === "MATCH_STARTED" || type === "ROUND_STARTED") {
      if (msg.profiles) {
        for (const [pid, prof] of Object.entries(msg.profiles)) {
          if (pid !== state.participantId && prof?.name) {
            state.partnerName = prof.name;
            if (prof.sex) state.partnerSex = prof.sex;
          } else if (pid === state.participantId && prof?.name) {
            state.myName = prof.name;
            if (prof.sex) state.mySex = prof.sex;
          }
        }
      }
      updateBadges();
      state.currentRound = msg.currentRound;
      state.roundsTotal = msg.roundsTotal;
      state.secondsPerDrawing = msg.secondsPerDrawing;
      state.timerRemaining = msg.secondsPerDrawing;
      state.currentPrompt = msg.currentPrompt;
      state.timerRunning = !!msg.timerRunning;
      state.myStrokes = [];
      state.partnerStrokes = [];
      state.myRedoStack = [];
      state.isEraser = false;
      el.btnToolEraser?.classList.remove("selected");
      const currentSwatch = document.querySelector(`.draw-color-swatch[data-color="${state.currentColor}"]`);
      if (currentSwatch) currentSwatch.classList.add("selected");

      updateDrawingHeader();
      clearLocalCanvas();
      clearPartnerCanvas();
      showStage("drawing");
      showToast(`Round ${state.currentRound} ready! 🎨`);
      return;
    }

    if (type === "ROUND_TIMER_STARTED") {
      state.timerRunning = true;
      updateDrawingHeader();
      showToast("Timer started! Draw! ⏱️");
      return;
    }

    if (type === "REMOTE_CURSOR") {
      if (state.stage === "lobby" || state.isSolo || !state.roomCode) {
        const cursor = document.getElementById("drawRemoteCursor");
        if (cursor) cursor.style.display = "none";
        return;
      }
      state.partnerConnected = true;
      let cursor = document.getElementById("drawRemoteCursor");
      if (cursor) {
        if (cursor.parentElement !== document.body) {
          document.body.appendChild(cursor);
        }
        cursor.style.display = "flex";

        let posX = `${msg.x * 100}vw`;
        let posY = `${msg.y * 100}vh`;

        if (msg.target === "myPad" && el.partnerPadCard) {
          const rect = el.partnerPadCard.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            posX = `${rect.left + (msg.nx * rect.width)}px`;
            posY = `${rect.top + (msg.ny * rect.height)}px`;
          }
        } else if (msg.target === "partnerPad" && el.myPadCard) {
          const rect = el.myPadCard.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            posX = `${rect.left + (msg.nx * rect.width)}px`;
            posY = `${rect.top + (msg.ny * rect.height)}px`;
          }
        }

        cursor.style.left = posX;
        cursor.style.top = posY;
        if (msg.sex === "male") {
          cursor.classList.remove("pink");
          cursor.classList.add("blue");
        } else {
          cursor.classList.remove("blue");
          cursor.classList.add("pink");
        }
      }
      const tag = document.getElementById("remoteCursorTag");
      if (tag) tag.textContent = (msg.senderName && !msg.senderName.startsWith("Partner")) ? msg.senderName : (state.partnerName || "Partner");
      return;
    }

    if (type === "REMOTE_CLICK") {
      if (state.stage === "lobby" || state.isSolo || !state.roomCode) return;
      state.partnerConnected = true;
      let cursor = document.getElementById("drawRemoteCursor");
      let posX = `${msg.x * 100}vw`;
      let posY = `${msg.y * 100}vh`;
      let pingX = msg.x;
      let pingY = msg.y;
      let isPixel = false;

      if (msg.target === "myPad" && el.partnerPadCard) {
        const rect = el.partnerPadCard.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          pingX = rect.left + (msg.nx * rect.width);
          pingY = rect.top + (msg.ny * rect.height);
          posX = `${pingX}px`;
          posY = `${pingY}px`;
          isPixel = true;
        }
      } else if (msg.target === "partnerPad" && el.myPadCard) {
        const rect = el.myPadCard.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          pingX = rect.left + (msg.nx * rect.width);
          pingY = rect.top + (msg.ny * rect.height);
          posX = `${pingX}px`;
          posY = `${pingY}px`;
          isPixel = true;
        }
      }

      if (cursor) {
        if (cursor.parentElement !== document.body) {
          document.body.appendChild(cursor);
        }
        cursor.style.display = "flex";
        cursor.style.left = posX;
        cursor.style.top = posY;
        if (msg.sex === "male") {
          cursor.classList.remove("pink");
          cursor.classList.add("blue");
        } else {
          cursor.classList.remove("blue");
          cursor.classList.add("pink");
        }
      }
      const ripple = document.getElementById("remoteClickRipple");
      if (ripple) {
        ripple.classList.remove("rippling");
        void ripple.offsetWidth;
        ripple.classList.add("rippling");
      }
      triggerRemoteClickPing(pingX, pingY, msg.sex, isPixel);
      return;
    }

    if (type === "TIMER_TICK") {
      state.timerRemaining = msg.secondsRemaining;
      renderTimer(msg.secondsRemaining);
      return;
    }

    if (type === "REMOTE_DRAW_STROKE") {
      state.partnerConnected = true;
      if (msg.drawerName && !msg.drawerName.startsWith("Partner") && msg.drawerName !== state.partnerName) {
        state.partnerName = msg.drawerName;
        updateBadges();
      }
      state.partnerStrokes.push(msg.stroke);
      drawRemoteStroke(msg.stroke);
      return;
    }

    if (type === "REMOTE_DRAW_UNDO") {
      if (state.partnerStrokes && state.partnerStrokes.length > 0) {
        state.partnerStrokes.pop();
        redrawAllStrokes();
      }
      return;
    }

    if (type === "REMOTE_DRAW_CLEAR") {
      state.partnerStrokes = [];
      clearPartnerCanvas();
      return;
    }

    if (type === "SYNC_ROUND_ARTWORK") {
      const roundNum = Number(msg.round);
      let r = state.roundHistory.find(item => item.round === roundNum);
      if (!r) {
        r = { round: roundNum, prompt: state.currentPrompt, myImg: "", partnerImg: msg.image };
        state.roundHistory.push(r);
      } else {
        r.partnerImg = msg.image;
      }

      if (state.stage === "round_review" && (state.currentRound === roundNum || !state.currentRound)) {
        if (el.reviewPartnerImg) el.reviewPartnerImg.src = msg.image;
      }
      if (state.stage === "match_complete") {
        renderRecapGallery();
      }
      return;
    }

    if (type === "POKE_EVENT") {
      if (msg.senderId !== state.participantId) state.partnerConnected = true;
      handlePokeEvent(msg);
      return;
    }

    if (type === "ROUND_COMPLETED") {
      onRoundCompleted(msg);
      return;
    }

    if (type === "MATCH_COMPLETED") {
      onMatchCompleted(msg);
      return;
    }

    if (type === "PLAY_AGAIN_INVITE") {
      if (el.modalPlayAgain) {
        if (el.modalPlayAgainTitle) el.modalPlayAgainTitle.textContent = "Play Again? 🎨";
        if (el.modalPlayAgainText) el.modalPlayAgainText.textContent = `${msg.requesterName || state.partnerName || "Your partner"} wants to play again! Do you accept?`;
        if (el.modalPlayAgainPromptActions) el.modalPlayAgainPromptActions.style.display = "flex";
        if (el.modalPlayAgainWaiting) el.modalPlayAgainWaiting.style.display = "none";
        el.modalPlayAgain.classList.remove("hidden");
      }
      return;
    }

    if (type === "PLAY_AGAIN_ACCEPTED" || type === "MATCH_RESTARTED") {
      if (el.modalPlayAgain) el.modalPlayAgain.classList.add("hidden");
      if (msg.profiles) {
        for (const [pid, prof] of Object.entries(msg.profiles)) {
          if (pid !== state.participantId && prof?.name) {
            if (!prof.name.startsWith("Partner") || !state.partnerName || state.partnerName.startsWith("Partner")) {
              state.partnerName = prof.name;
            }
            if (prof.sex) state.partnerSex = prof.sex;
          } else if (pid === state.participantId && prof?.name) {
            if (!prof.name.startsWith("Partner") || !state.myName || state.myName.startsWith("Partner")) {
              state.myName = prof.name;
            }
            if (prof.sex) state.mySex = prof.sex;
          }
        }
      }
      updateBadges();
      state.roundHistory = [];
      state.myStrokes = [];
      state.partnerStrokes = [];
      state.myRedoStack = [];
      state.currentRound = 1;
      clearLocalCanvas();
      clearPartnerCanvas();
      showStage("pack_select");
      showToast("Play again accepted! Pick a prompt pack 🎨");
      return;
    }

    if (type === "PLAY_AGAIN_DECLINED") {
      if (el.modalPlayAgain) el.modalPlayAgain.classList.add("hidden");
      showToast(`${msg.declinerName || "Partner"} declined to play again.`);
      exitToMainMenu();
      return;
    }

    if (type === "PLAY_AGAIN_CANCELLED") {
      if (el.modalPlayAgain) el.modalPlayAgain.classList.add("hidden");
      showToast("Play again request was cancelled.");
      return;
    }
  }

  function updateBadges() {
    const myDisplay = state.myName || "tella";
    const partnerDisplay = state.partnerName || "Partner";

    if (el.myPadBadge) {
      el.myPadBadge.textContent = myDisplay;
      el.myPadBadge.classList.remove("pink", "blue", "purple");
      const mySexClass = state.mySex === "male" ? "blue" : (state.mySex === "other" ? "purple" : "pink");
      el.myPadBadge.classList.add(mySexClass);
    }
    if (el.partnerPadBadge) {
      el.partnerPadBadge.textContent = partnerDisplay;
      el.partnerPadBadge.classList.remove("pink", "blue", "purple");
      const partnerSexClass = state.partnerSex === "male" ? "blue" : (state.partnerSex === "other" ? "purple" : "pink");
      el.partnerPadBadge.classList.add(partnerSexClass);
    }
    if (el.tabPartnerLabel) el.tabPartnerLabel.textContent = `${partnerDisplay}'s Pad`;
    if (el.reviewMyName) el.reviewMyName.textContent = myDisplay;
    if (el.reviewPartnerName) el.reviewPartnerName.textContent = partnerDisplay;
    const cursorTag = document.getElementById("remoteCursorTag");
    if (cursorTag) cursorTag.textContent = partnerDisplay;
  }

  function updateProfileReadyUI() {
    if (state.stage !== "profile_setup") return;

    if (el.profilePartnerStatus && el.profilePartnerStatusText) {
      if (state.partnerReady && !state.myReady) {
        el.profilePartnerStatus.style.display = "flex";
        el.profilePartnerStatusText.textContent = `${state.partnerName} is ready and waiting! ✓`;
      } else {
        el.profilePartnerStatus.style.display = "none";
      }
    }

    if (!state.myReady) {
      if (el.btnProfileReady) el.btnProfileReady.style.display = "flex";
      if (el.profileWaitingWrap) el.profileWaitingWrap.style.display = "none";
    } else {
      if (el.btnProfileReady) el.btnProfileReady.style.display = "none";
      if (el.profileWaitingWrap) el.profileWaitingWrap.style.display = "flex";
      if (el.profileWaitingText) {
        el.profileWaitingText.textContent = state.partnerReady
          ? `Both ready! Starting...`
          : `Waiting for ${state.partnerName} to finish profile...`;
      }
    }
  }

  function updateDrawingHeader() {
    if (el.displayRoundNum) el.displayRoundNum.textContent = state.currentRound;
    if (el.displayRoundTotal) el.displayRoundTotal.textContent = state.roundsTotal;
    if (el.displayPrompt) el.displayPrompt.textContent = state.currentPrompt;
    renderTimer(state.timerRemaining);
    const showStart = !state.timerRunning;
    if (el.bottomStartWrap) el.bottomStartWrap.style.display = showStart ? "flex" : "none";
    if (el.btnStartRoundTimer) el.btnStartRoundTimer.style.display = showStart ? "inline-flex" : "none";
    if (el.canvasesContainer) el.canvasesContainer.classList.toggle("timer-active", state.timerRunning);
  }

  function renderTimer(seconds) {
    if (!el.displayTimer) return;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    el.displayTimer.textContent = `${m}:${s < 10 ? "0" : ""}${s}`;
    el.displayTimer.classList.toggle("urgent", seconds <= 15);
  }

  function triggerRemoteClickPing(x, y, sex, isPixel = false) {
    if (typeof x !== "number" || typeof y !== "number") return;
    const ping = document.createElement("div");
    ping.className = `draw-click-ping ${sex === "male" ? "blue" : "pink"}`;
    ping.style.left = isPixel ? `${x}px` : `${x * 100}vw`;
    ping.style.top = isPixel ? `${y}px` : `${y * 100}vh`;
    document.body.appendChild(ping);
    setTimeout(() => {
      if (ping.parentElement) ping.parentElement.removeChild(ping);
    }, 600);
  }

  // --- Smooth Canvas 2D Engine ---
  let myCtx = null;
  let partnerCtx = null;
  let isDrawing = false;
  let canvasRect = null;

  function setupCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    [el.myCanvas, el.partnerCanvas].forEach(c => {
      if (!c) return;
      const rect = c.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        c.width = rect.width * dpr;
        c.height = rect.height * dpr;
        const ctx = c.getContext("2d");
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    });

    myCtx = el.myCanvas ? el.myCanvas.getContext("2d") : null;
    partnerCtx = el.partnerCanvas ? el.partnerCanvas.getContext("2d") : null;
  }

  function redrawAllStrokes() {
    clearLocalCanvas();
    clearPartnerCanvas();
    state.myStrokes.forEach(s => renderStroke(myCtx, el.myCanvas, s));
    state.partnerStrokes.forEach(s => renderStroke(partnerCtx, el.partnerCanvas, s));
  }

  function renderStroke(ctx, canvas, stroke) {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const points = stroke.points || [];
    if (points.length === 0) return;

    ctx.save();
    if (stroke.isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color || "#18181b";
      ctx.fillStyle = stroke.color || "#18181b";
    }
    ctx.lineWidth = stroke.size || 5;

    const p0 = points[0];
    const x0 = p0[0] * rect.width;
    const y0 = p0[1] * rect.height;

    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(x0, y0, (stroke.size || 5) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (let i = 1; i < points.length; i++) {
      const pPrev = points[i - 1];
      const pCur = points[i];
      const xPrev = pPrev[0] * rect.width;
      const yPrev = pPrev[1] * rect.height;
      const xCur = pCur[0] * rect.width;
      const yCur = pCur[1] * rect.height;
      const midX = (xPrev + xCur) / 2;
      const midY = (yPrev + yCur) / 2;
      ctx.quadraticCurveTo(xPrev, yPrev, midX, midY);
    }
    const pLast = points[points.length - 1];
    ctx.lineTo(pLast[0] * rect.width, pLast[1] * rect.height);
    ctx.stroke();
    ctx.restore();
  }

  function getCanvasCoords(evt) {
    if (!canvasRect && el.myCanvas) {
      canvasRect = el.myCanvas.getBoundingClientRect();
    }
    const rect = canvasRect || el.myCanvas.getBoundingClientRect();
    const clientX = evt.clientX || (evt.touches && evt.touches[0]?.clientX) || 0;
    const clientY = evt.clientY || (evt.touches && evt.touches[0]?.clientY) || 0;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return {
      px: x,
      py: y,
      nx: x / rect.width,
      ny: y / rect.height
    };
  }

  function startStroke(evt) {
    if (!state.timerRunning) {
      showToast("Click 'Start Drawing' below to begin! ⏱️");
      return;
    }
    evt.preventDefault();
    canvasRect = el.myCanvas.getBoundingClientRect();
    const coords = getCanvasCoords(evt);
    isDrawing = true;

    const strokeSize = state.isEraser ? Math.max(state.currentSize * 2.5, 12) : state.currentSize;
    state.currentStroke = {
      color: state.isEraser ? "rgba(0,0,0,1)" : state.currentColor,
      size: strokeSize,
      isEraser: !!state.isEraser,
      points: [[coords.nx, coords.ny]]
    };

    if (myCtx) {
      myCtx.save();
      myCtx.globalCompositeOperation = state.isEraser ? "destination-out" : "source-over";
      myCtx.beginPath();
      myCtx.strokeStyle = state.isEraser ? "rgba(0,0,0,1)" : state.currentColor;
      myCtx.lineWidth = strokeSize;
      myCtx.arc(coords.px, coords.py, strokeSize / 2, 0, Math.PI * 2);
      myCtx.fillStyle = state.isEraser ? "rgba(0,0,0,1)" : state.currentColor;
      myCtx.fill();
      myCtx.beginPath();
      myCtx.moveTo(coords.px, coords.py);
      myCtx.restore();
    }
  }

  function moveStroke(evt) {
    if (!isDrawing || !state.currentStroke) return;
    evt.preventDefault();
    const coords = getCanvasCoords(evt);
    state.currentStroke.points.push([coords.nx, coords.ny]);

    if (myCtx) {
      myCtx.save();
      myCtx.globalCompositeOperation = state.currentStroke.isEraser ? "destination-out" : "source-over";
      const len = state.currentStroke.points.length;
      if (len >= 3) {
        const p0 = state.currentStroke.points[len - 3];
        const p1 = state.currentStroke.points[len - 2];
        const p2 = state.currentStroke.points[len - 1];
        const rect = canvasRect || el.myCanvas.getBoundingClientRect();
        const midX1 = ((p0[0] + p1[0]) / 2) * rect.width;
        const midY1 = ((p0[1] + p1[1]) / 2) * rect.height;
        const midX2 = ((p1[0] + p2[0]) / 2) * rect.width;
        const midY2 = ((p1[1] + p2[1]) / 2) * rect.height;

        myCtx.beginPath();
        myCtx.strokeStyle = state.currentStroke.isEraser ? "rgba(0,0,0,1)" : state.currentColor;
        myCtx.lineWidth = state.currentStroke.size;
        myCtx.moveTo(midX1, midY1);
        myCtx.quadraticCurveTo(p1[0] * rect.width, p1[1] * rect.height, midX2, midY2);
        myCtx.stroke();
      } else {
        myCtx.lineTo(coords.px, coords.py);
        myCtx.strokeStyle = state.currentStroke.isEraser ? "rgba(0,0,0,1)" : state.currentColor;
        myCtx.lineWidth = state.currentStroke.size;
        myCtx.stroke();
      }
      myCtx.restore();
    }
  }

  function endStroke() {
    if (!isDrawing) return;
    isDrawing = false;
    canvasRect = null;

    if (state.currentStroke && state.currentStroke.points.length > 0) {
      state.myStrokes.push(state.currentStroke);
      state.myRedoStack = [];
      if (!state.isSolo) {
        sendMsg("DRAW_STROKE", { stroke: state.currentStroke });
      }
      state.currentStroke = null;
    }
  }

  function drawRemoteStroke(stroke) {
    renderStroke(partnerCtx, el.partnerCanvas, stroke);
  }

  function clearLocalCanvas() {
    if (!myCtx || !el.myCanvas) return;
    const rect = el.myCanvas.getBoundingClientRect();
    myCtx.clearRect(0, 0, rect.width, rect.height);
  }

  function clearPartnerCanvas() {
    if (!partnerCtx || !el.partnerCanvas) return;
    const rect = el.partnerCanvas.getBoundingClientRect();
    partnerCtx.clearRect(0, 0, rect.width, rect.height);
  }

  // --- Poke Reaction Handler ---
  function triggerPoke(emoji, nx = 0.5, ny = 0.5) {
    if (state.isSolo) {
      handlePokeEvent({
        emoji,
        x: nx,
        y: ny,
        senderId: "solo"
      });
      return;
    }
    sendMsg("SEND_POKE", { emoji, x: nx, y: ny });
  }

  function handlePokeEvent(data) {
    const { emoji, x, y, senderId } = data;
    playPokeSound(emoji);

    // Screen Shake on Poke
    const shakeTarget = el.canvasesContainer || el.stageDrawing;
    if (shakeTarget) {
      shakeTarget.classList.remove("draw-screen-shaking");
      void shakeTarget.offsetWidth;
      shakeTarget.classList.add("draw-screen-shaking");
      setTimeout(() => shakeTarget.classList.remove("draw-screen-shaking"), 550);
    }

    const targetLayer = (senderId === state.participantId) ? el.partnerPokeLayer : el.myPokeLayer;
    const activeTarget = (targetLayer && targetLayer.offsetParent !== null) ? targetLayer : el.myPokeLayer;
    if (!activeTarget) return;

    const rect = activeTarget.getBoundingClientRect();
    const posX = x * rect.width;
    const posY = y * rect.height;

    // Ripple
    const ripple = document.createElement("div");
    ripple.className = "poke-ripple";
    ripple.style.left = posX + "px";
    ripple.style.top = posY + "px";
    activeTarget.appendChild(ripple);

    // Particle
    const particle = document.createElement("div");
    particle.className = "poke-particle";
    particle.textContent = emoji || "👉";
    particle.style.left = posX + "px";
    particle.style.top = posY + "px";
    activeTarget.appendChild(particle);

    setTimeout(() => {
      ripple.remove();
      particle.remove();
    }, 1300);
  }

  // --- High-Resolution 4:3 Artwork Exporter ---
  function exportArtworkDataURL(strokes, fallbackCanvas) {
    const off = document.createElement("canvas");
    off.width = 1200;
    off.height = 900;
    const ctx = off.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1200, 900);

    if (strokes && strokes.length > 0) {
      const scale = 1200 / 534;
      strokes.forEach(stroke => {
        const points = stroke.points || [];
        if (points.length === 0) return;

        ctx.save();
        if (stroke.isEraser) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0,0,0,1)";
          ctx.fillStyle = "rgba(0,0,0,1)";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = stroke.color || "#18181b";
          ctx.fillStyle = stroke.color || "#18181b";
        }
        ctx.lineWidth = Math.max((stroke.size || 5) * scale, 1);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const p0 = points[0];
        const x0 = (typeof p0.x === "number" ? p0.x : p0[0]) * 1200;
        const y0 = (typeof p0.y === "number" ? p0.y : p0[1]) * 900;

        if (points.length === 1) {
          ctx.beginPath();
          ctx.arc(x0, y0, ctx.lineWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          for (let i = 1; i < points.length - 1; i++) {
            const pPrev = points[i];
            const pCur = points[i + 1];
            const xPrev = (typeof pPrev.x === "number" ? pPrev.x : pPrev[0]) * 1200;
            const yPrev = (typeof pPrev.y === "number" ? pPrev.y : pPrev[1]) * 900;
            const xCur = (typeof pCur.x === "number" ? pCur.x : pCur[0]) * 1200;
            const yCur = (typeof pCur.y === "number" ? pCur.y : pCur[1]) * 900;
            const midX = (xPrev + xCur) / 2;
            const midY = (yPrev + yCur) / 2;
            ctx.quadraticCurveTo(xPrev, yPrev, midX, midY);
          }
          const pLast = points[points.length - 1];
          const xLast = (typeof pLast.x === "number" ? pLast.x : pLast[0]) * 1200;
          const yLast = (typeof pLast.y === "number" ? pLast.y : pLast[1]) * 900;
          ctx.lineTo(xLast, yLast);
          ctx.stroke();
        }
        ctx.restore();
      });
      return off.toDataURL("image/png");
    }

    if (fallbackCanvas && fallbackCanvas.width > 0 && fallbackCanvas.height > 0) {
      try {
        ctx.drawImage(fallbackCanvas, 0, 0, 1200, 900);
        return off.toDataURL("image/png");
      } catch (e) {}
    }
    return "";
  }

  // --- Round & Match Completion ---
  function onRoundCompleted(data) {
    if (isDrawing) endStroke();
    const roundNum = data?.round || state.currentRound;
    const myImg = exportArtworkDataURL(state.myStrokes, el.myCanvas);
    const partnerImg = exportArtworkDataURL(state.partnerStrokes, el.partnerCanvas);

    let existing = state.roundHistory.find(r => r.round === roundNum);
    if (!existing) {
      existing = {
        round: roundNum,
        prompt: data?.historyItem?.prompt || state.currentPrompt,
        myImg,
        partnerImg: partnerImg || (state.isSolo ? myImg : "")
      };
      state.roundHistory.push(existing);
    } else {
      if (myImg) existing.myImg = myImg;
      if (partnerImg) existing.partnerImg = partnerImg;
    }

    if (myImg && !state.isSolo) {
      sendMsg("SUBMIT_ROUND_ARTWORK", { round: roundNum, image: myImg });
    }

    if (el.reviewPromptText) {
      el.reviewPromptText.textContent = existing.prompt;
    }
    if (el.reviewMyName) el.reviewMyName.textContent = state.myName || "You";
    if (el.reviewPartnerName) el.reviewPartnerName.textContent = state.partnerName || "Partner";
    if (el.reviewMyImg) el.reviewMyImg.src = existing.myImg;
    if (el.reviewPartnerImg) el.reviewPartnerImg.src = existing.partnerImg || (state.isSolo ? existing.myImg : "");

    if (el.btnNextRound) {
      const isFinal = roundNum >= state.roundsTotal;
      const span = el.btnNextRound.querySelector("span");
      if (span) span.textContent = isFinal ? "Finish Match 🏆" : "Next Round ▷";
    }

    showStage("round_review");
  }

  function renderRecapGallery() {
    if (!el.recapGallery) return;
    el.recapGallery.innerHTML = "";
    state.roundHistory.sort((a, b) => a.round - b.round).forEach(r => {
      const row = document.createElement("div");
      row.className = "draw-recap-round-row";
      row.innerHTML = `
        <div class="draw-recap-prompt-label">Round ${r.round}: "${r.prompt}"</div>
        <div class="draw-recap-drawings ${state.isSolo ? "solo" : ""}">
          <div class="draw-review-card">
            <div class="draw-review-card-header">
              <span class="draw-review-drawer-name">${state.myName || "You"}</span>
            </div>
            <div class="draw-review-canvas-box">
              <img src="${r.myImg || ""}" alt="Drawing 1" />
            </div>
          </div>
          ${!state.isSolo ? `
          <div class="draw-review-card">
            <div class="draw-review-card-header">
              <span class="draw-review-drawer-name">${state.partnerName || "Partner"}</span>
            </div>
            <div class="draw-review-canvas-box">
              <img src="${r.partnerImg || ""}" alt="Drawing 2" />
            </div>
          </div>` : ""}
        </div>
      `;
      el.recapGallery.appendChild(row);
    });
  }

  function onMatchCompleted(data) {
    if (isDrawing) endStroke();
    const roundNum = state.currentRound;
    const myImg = exportArtworkDataURL(state.myStrokes, el.myCanvas);
    const partnerImg = exportArtworkDataURL(state.partnerStrokes, el.partnerCanvas);

    if (data?.roundHistory && Array.isArray(data.roundHistory)) {
      data.roundHistory.forEach(srvRound => {
        let existing = state.roundHistory.find(r => r.round === srvRound.round);
        let srvMy = srvRound.artwork?.[state.participantId] || "";
        let srvPartner = Object.entries(srvRound.artwork || {}).find(([id]) => id !== state.participantId)?.[1] || "";
        if (!srvMy && srvRound.strokes) {
          const mySt = srvRound.strokes[state.participantId] || (state.role === "host" ? srvRound.strokes[Object.keys(srvRound.strokes)[0]] : srvRound.strokes[Object.keys(srvRound.strokes)[1]]);
          if (mySt && mySt.length > 0) srvMy = exportArtworkDataURL(mySt);
        }
        if (!srvPartner && srvRound.strokes) {
          const partSt = Object.entries(srvRound.strokes).find(([id]) => id !== state.participantId)?.[1] || (state.role === "host" ? srvRound.strokes[Object.keys(srvRound.strokes)[1]] : srvRound.strokes[Object.keys(srvRound.strokes)[0]]);
          if (partSt && partSt.length > 0) srvPartner = exportArtworkDataURL(partSt);
        }
        if (!existing) {
          state.roundHistory.push({
            round: srvRound.round,
            prompt: srvRound.prompt,
            myImg: srvMy,
            partnerImg: srvPartner || (state.isSolo ? srvMy : "")
          });
        } else {
          if (srvMy) existing.myImg = srvMy;
          if (srvPartner) existing.partnerImg = srvPartner;
        }
      });
    }

    let existing = state.roundHistory.find(r => r.round === roundNum);
    if (!existing) {
      existing = {
        round: roundNum,
        prompt: state.currentPrompt,
        myImg,
        partnerImg: partnerImg || (state.isSolo ? myImg : "")
      };
      state.roundHistory.push(existing);
    } else {
      if (myImg) existing.myImg = myImg;
      if (partnerImg && !existing.partnerImg) existing.partnerImg = partnerImg;
    }

    if (myImg && !state.isSolo) {
      sendMsg("SUBMIT_ROUND_ARTWORK", { round: roundNum, image: myImg });
    }

    renderRecapGallery();
    showStage("match_complete");
  }

  // --- Keepsake Artwork Exporter (High-Res 4:3 Ratio) ---
  function downloadKeepsakeImage() {
    showToast("Generating keepsake artwork... 🎨");
    const offCanvas = document.createElement("canvas");
    const isSolo = Boolean(state.isSolo);

    if (!state.roundHistory || state.roundHistory.length === 0) {
      const myImg = exportArtworkDataURL(state.myStrokes, el.myCanvas);
      const partnerImg = exportArtworkDataURL(state.partnerStrokes, el.partnerCanvas);
      state.roundHistory = [{
        round: state.currentRound || 1,
        prompt: state.currentPrompt || "Our Drawing",
        myImg,
        partnerImg: partnerImg || (isSolo ? myImg : "")
      }];
    }

    const count = Math.max(state.roundHistory.length, 1);
    const cardW = isSolo ? 960 : 1400;
    const padW = isSolo ? 800 : 580;
    const padH = Math.round(padW * 0.75);
    const headerH = 160;
    const roundH = padH + 80;
    const footerH = 80;
    offCanvas.width = cardW;
    offCanvas.height = headerH + (count * roundH) + footerH;

    const ctx = offCanvas.getContext("2d");
    ctx.fillStyle = "#f8f9fb";
    ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    ctx.fillStyle = "#18181b";
    ctx.font = "bold 36px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isSolo ? "My Drawings 💕" : "Our Drawings Together 💕", cardW / 2, 68);

    ctx.fillStyle = "#71717a";
    ctx.font = "20px 'Outfit', sans-serif";
    ctx.fillText(isSolo ? `${state.myName || "Artist"} · ${new Date().toLocaleDateString()}` : `${state.myName || "You"} & ${state.partnerName || "Partner"} · ${new Date().toLocaleDateString()}`, cardW / 2, 108);

    let currentY = headerH;
    let pending = 0;
    let finished = false;

    const triggerDownload = () => {
      if (finished) return;
      finished = true;
      try {
        const link = document.createElement("a");
        link.download = `${isSolo ? "my" : "our"}-drawings-${Date.now()}.png`;
        link.href = offCanvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try { link.remove(); } catch (_) {}
        }, 200);
        showToast("Keepsake saved to device! 🎨");
      } catch (err) {
        console.error("Keepsake download error:", err);
        showToast("Download failed, please retry 🚫");
      }
    };

    setTimeout(() => {
      if (!finished) triggerDownload();
    }, 2000);

    const checkDone = () => {
      pending--;
      if (pending <= 0) {
        triggerDownload();
      }
    };

    [...state.roundHistory].sort((a, b) => a.round - b.round).forEach((r) => {
      ctx.fillStyle = "#18181b";
      ctx.font = "bold 22px 'Outfit', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Round ${r.round}: "${r.prompt || ""}"`, 80, currentY + 36);

      const yBox = currentY + 54;
      const drawBox = (src, x, label) => {
        if (!src) {
          checkDone();
          return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, yBox, padW, padH);
            ctx.strokeStyle = "#18181b";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, yBox, padW, padH);
            ctx.drawImage(img, x, yBox, padW, padH);

            if (label) {
              ctx.fillStyle = "rgba(0,0,0,0.65)";
              const textW = ctx.measureText(label).width;
              ctx.fillRect(x + 12, yBox + 12, textW + 24, 28);
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 14px 'Outfit', sans-serif";
              ctx.textAlign = "left";
              ctx.fillText(label, x + 24, yBox + 31);
            }
          } catch (e) {
            console.error("Keepsake box render error:", e);
          } finally {
            checkDone();
          }
        };
        img.onerror = () => {
          checkDone();
        };
        img.src = src;
      };

      if (isSolo) {
        pending += 1;
        drawBox(r.myImg, 80);
      } else {
        const x1 = 80;
        const x2 = cardW - 80 - padW;
        pending += 2;
        drawBox(r.myImg, x1, state.myName || "You");
        drawBox(r.partnerImg || "", x2, state.partnerName || "Partner");
      }

      currentY += roundH;
    });

    if (pending === 0) {
      triggerDownload();
    }
  }

  // --- Solo Mode Simulator ---
  let soloTimer = null;
  function startSoloMatch(roundNum = 1) {
    state.isSolo = true;
    document.body.classList.add("draw-solo-mode");
    state.timerRunning = false;
    state.currentRound = roundNum;
    if (roundNum === 1) {
      state.roundHistory = [];
      state.usedSoloPrompts = new Set();
    }
    state.currentPrompt = getRandomPrompt(state.selectedPack);
    state.usedSoloPrompts.add(state.currentPrompt);
    state.myStrokes = [];
    state.partnerStrokes = [];
    state.myRedoStack = [];
    state.isEraser = false;
    el.btnToolEraser?.classList.remove("selected");
    state.timerRemaining = state.secondsPerDrawing;
    updateBadges();
    updateDrawingHeader();
    clearLocalCanvas();
    showStage("drawing");

    if (soloTimer) { clearInterval(soloTimer); soloTimer = null; }
  }

  function exitToMainMenu(skipConfirm = false, closeActiveModal = Boolean(document.getElementById("drawGameModal"))) {
    if (!skipConfirm && state.stage === "drawing" && !window.confirm("Are you sure you want to exit? Current drawing progress will be lost. 🎨")) {
      return;
    }
    if (soloTimer) {
      clearInterval(soloTimer);
      soloTimer = null;
    }
    if (state.ws) {
      try { state.ws.close(); } catch (e) {}
      state.ws = null;
    }
    if (state.sse) {
      try { state.sse.close(); } catch (e) {}
      state.sse = null;
    }
    localStorage.removeItem("draw_last_room");
    sessionStorage.removeItem("draw_last_room");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      url.searchParams.delete("code");
      url.searchParams.delete("draw_room");
      window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""));
    } catch (e) {}

    const cursor = document.getElementById("drawRemoteCursor");
    if (cursor) cursor.style.display = "none";

    state.isSolo = false;
    document.body.classList.remove("draw-solo-mode");
    state.roomCode = null;
    state.myReady = false;
    state.partnerReady = false;
    state.partnerConnected = false;
    state.currentRound = 1;
    state.roundHistory = [];
    state.myStrokes = [];
    state.partnerStrokes = [];
    state.myRedoStack = [];
    state.isEraser = false;
    clearLocalCanvas();

    if (el.lobbyInitialView) el.lobbyInitialView.style.display = "block";
    if (el.lobbyInlineJoinForm) el.lobbyInlineJoinForm.style.display = "none";
    if (el.lobbyWaitingView) el.lobbyWaitingView.style.display = "none";

    showStage("lobby");

    if (closeActiveModal) {
      const modal = document.getElementById("drawGameModal");
      if (modal) {
        modal.classList.remove("is-active");
        modal.style.display = "none";
        document.body.classList.remove("draw-page", "draw-modal-open", "draw-dark-stage", "draw-solo-mode");
        document.body.style.overflow = "";
        const section = document.getElementById("section-draw");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }

  function closeDrawModal() {
    if (state.stage === "drawing" && !window.confirm("Are you sure you want to close the game? Drawing progress will be lost. 🎨")) {
      return;
    }
    exitToMainMenu(true, true);
  }

  function openDrawModal(mode = "welcome") {
    const modal = document.getElementById("drawGameModal");
    if (modal) {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
      document.body.classList.add("draw-page", "draw-modal-open");
      modal.classList.add("is-active");
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
      const isDark = (state.stage === "lobby" || state.stage === "profile_setup" || !state.stage);
      modal.classList.toggle("theme-dark-lobby", isDark);
      modal.classList.toggle("theme-light-studio", !isDark);
      modal.classList.toggle("draw-solo-mode", Boolean(state.isSolo));
      document.body.classList.toggle("draw-dark-stage", isDark);
    }
    if (mode === "start") {
      el.btnStartRoom?.click();
    } else if (mode === "join") {
      if (el.lobbyInlineJoinForm && (el.lobbyInlineJoinForm.style.display === "none" || !el.lobbyInlineJoinForm.style.display)) {
        el.btnShowJoinForm?.click();
      }
      setTimeout(() => el.inputJoinCode?.focus(), 150);
    } else if (mode === "solo") {
      el.btnPracticeSolo?.click();
    }
  }

  function renderShowcaseDoodles() {
    const c1 = document.getElementById("drawWidgetCanvas1");
    const c2 = document.getElementById("drawWidgetCanvas2");
    if (c1 && c1.getContext) {
      const ctx1 = c1.getContext("2d");
      ctx1.clearRect(0, 0, c1.width, c1.height);
      ctx1.strokeStyle = "#f7789e";
      ctx1.lineWidth = 4;
      ctx1.lineCap = "round";
      ctx1.lineJoin = "round";
      ctx1.beginPath();
      ctx1.moveTo(140, 75);
      ctx1.bezierCurveTo(140, 50, 95, 45, 95, 80);
      ctx1.bezierCurveTo(95, 110, 140, 140, 140, 160);
      ctx1.bezierCurveTo(140, 140, 185, 110, 185, 80);
      ctx1.bezierCurveTo(185, 45, 140, 50, 140, 75);
      ctx1.fillStyle = "rgba(247, 120, 158, 0.15)";
      ctx1.fill();
      ctx1.stroke();
    }
    if (c2 && c2.getContext) {
      const ctx2 = c2.getContext("2d");
      ctx2.clearRect(0, 0, c2.width, c2.height);
      ctx2.strokeStyle = "#5fa0ff";
      ctx2.lineWidth = 4;
      ctx2.lineCap = "round";
      ctx2.lineJoin = "round";
      ctx2.beginPath();
      ctx2.moveTo(140, 50);
      ctx2.lineTo(152, 85);
      ctx2.lineTo(190, 85);
      ctx2.lineTo(160, 107);
      ctx2.lineTo(172, 145);
      ctx2.lineTo(140, 122);
      ctx2.lineTo(108, 145);
      ctx2.lineTo(120, 107);
      ctx2.lineTo(90, 85);
      ctx2.lineTo(128, 85);
      ctx2.closePath();
      ctx2.fillStyle = "rgba(95, 160, 255, 0.15)";
      ctx2.fill();
      ctx2.stroke();
    }
  }

  function triggerStartRoundTimer() {
    if (state.timerRunning) return;
    if (state.isSolo) {
      state.timerRunning = true;
      updateDrawingHeader();
      showToast("Timer started! Draw! ⏱️");
      if (soloTimer) clearInterval(soloTimer);
      soloTimer = setInterval(() => {
        state.timerRemaining -= 1;
        renderTimer(state.timerRemaining);
        if (state.timerRemaining <= 0) {
          clearInterval(soloTimer);
          onRoundCompleted({ round: state.currentRound, historyItem: { prompt: state.currentPrompt } });
        }
      }, 1000);
      return;
    }
    sendMsg("START_ROUND_TIMER");
  }

  // --- Event Bindings ---
  function initEvents() {
    // Live Cursor Tracking & Broadcasting (Figma / Photobooth Parity)
    let lastCursorSend = 0;
    const sendLocalCursor = (e) => {
      if (state.isSolo || !state.roomCode || state.stage === "lobby" || !state.partnerConnected) return;
      const now = Date.now();
      if (now - lastCursorSend < 35) return;
      lastCursorSend = now;
      const w = window.innerWidth || document.documentElement.clientWidth || 1;
      const h = window.innerHeight || document.documentElement.clientHeight || 1;
      const x = Math.max(0, Math.min(1, e.clientX / w));
      const y = Math.max(0, Math.min(1, e.clientY / h));

      let target = "viewport";
      let nx = x;
      let ny = y;

      if (el.myPadCard && el.partnerPadCard) {
        const myRect = el.myPadCard.getBoundingClientRect();
        if (e.clientX >= myRect.left && e.clientX <= myRect.right && e.clientY >= myRect.top && e.clientY <= myRect.bottom) {
          target = "myPad";
          nx = Math.max(0, Math.min(1, (e.clientX - myRect.left) / myRect.width));
          ny = Math.max(0, Math.min(1, (e.clientY - myRect.top) / myRect.height));
        } else {
          const partnerRect = el.partnerPadCard.getBoundingClientRect();
          if (e.clientX >= partnerRect.left && e.clientX <= partnerRect.right && e.clientY >= partnerRect.top && e.clientY <= partnerRect.bottom) {
            target = "partnerPad";
            nx = Math.max(0, Math.min(1, (e.clientX - partnerRect.left) / partnerRect.width));
            ny = Math.max(0, Math.min(1, (e.clientY - partnerRect.top) / partnerRect.height));
          }
        }
      }

      sendMsg("CURSOR_MOVE", { x, y, target, nx, ny });
    };

    const sendLocalClick = (e) => {
      if (state.isSolo || !state.roomCode || state.stage === "lobby" || !state.partnerConnected) return;
      const w = window.innerWidth || document.documentElement.clientWidth || 1;
      const h = window.innerHeight || document.documentElement.clientHeight || 1;
      const x = Math.max(0, Math.min(1, e.clientX / w));
      const y = Math.max(0, Math.min(1, e.clientY / h));

      let target = "viewport";
      let nx = x;
      let ny = y;

      if (el.myPadCard && el.partnerPadCard) {
        const myRect = el.myPadCard.getBoundingClientRect();
        if (e.clientX >= myRect.left && e.clientX <= myRect.right && e.clientY >= myRect.top && e.clientY <= myRect.bottom) {
          target = "myPad";
          nx = Math.max(0, Math.min(1, (e.clientX - myRect.left) / myRect.width));
          ny = Math.max(0, Math.min(1, (e.clientY - myRect.top) / myRect.height));
        } else {
          const partnerRect = el.partnerPadCard.getBoundingClientRect();
          if (e.clientX >= partnerRect.left && e.clientX <= partnerRect.right && e.clientY >= partnerRect.top && e.clientY <= partnerRect.bottom) {
            target = "partnerPad";
            nx = Math.max(0, Math.min(1, (e.clientX - partnerRect.left) / partnerRect.width));
            ny = Math.max(0, Math.min(1, (e.clientY - partnerRect.top) / partnerRect.height));
          }
        }
      }

      sendMsg("CURSOR_CLICK", { x, y, target, nx, ny });
    };

    window.addEventListener("pointermove", sendLocalCursor, { passive: true, capture: true });
    window.addEventListener("pointerdown", sendLocalClick, { passive: true, capture: true });

    // Start Round Timer on Draw Page
    el.btnStartRoundTimer?.addEventListener("click", triggerStartRoundTimer);
    // Start Room
    el.btnStartRoom?.addEventListener("click", () => {
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      state.roomCode = code;
      if (el.displayRoomCode) el.displayRoomCode.textContent = code;

      if (el.lobbyInitialView) el.lobbyInitialView.style.display = "none";
      if (el.lobbyWaitingView) el.lobbyWaitingView.style.display = "block";

      initNetworking(code);
    });

    // Show / Toggle Inline Join Form (Photobooth Parity)
    el.btnShowJoinForm?.addEventListener("click", () => {
      const form = el.lobbyInlineJoinForm;
      if (!form) return;
      const isHidden = form.style.display === "none" || !form.style.display;
      form.style.display = isHidden ? "block" : "none";
      if (isHidden && el.inputJoinCode) {
        el.inputJoinCode.focus();
        el.inputJoinCode.select?.();
      }
    });

    el.inputJoinCode?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        el.btnJoinRoomSubmit?.click();
      }
    });

    // Practice Solo
    el.btnPracticeSolo?.addEventListener("click", () => {
      state.isSolo = true;
      showStage("profile_setup");
    });

    el.btnWaitingSkipToSolo?.addEventListener("click", () => {
      state.isSolo = true;
      showStage("profile_setup");
    });

    // Join Code Submit
    el.btnJoinRoomSubmit?.addEventListener("click", () => {
      const code = el.inputJoinCode?.value?.trim().toUpperCase();
      if (!code || code.length < 3) {
        showToast("Please enter a valid room code");
        return;
      }
      state.roomCode = code;
      if (el.displayRoomCode) el.displayRoomCode.textContent = code;
      if (el.lobbyInitialView) el.lobbyInitialView.style.display = "none";
      if (el.lobbyWaitingView) el.lobbyWaitingView.style.display = "block";
      if (el.waitingStatusText) el.waitingStatusText.textContent = `Connecting to room ${code}...`;
      initNetworking(code);
    });

    // Profile Setup: Sex Selection
    el.profileSexSelector?.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".draw-sex-btn");
      if (!btn) return;
      const sex = btn.dataset.sex;
      if (!sex) return;

      document.querySelectorAll("#profileSexSelector .draw-sex-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.mySex = sex;
      updateBadges();
    });

    // Profile Setup: Enter Key on Name
    el.profileNameInput?.addEventListener("keypress", (evt) => {
      if (evt.key === "Enter") {
        el.btnProfileReady?.click();
      }
    });

    // Profile Setup: Ready Submit
    el.btnProfileReady?.addEventListener("click", () => {
      const name = el.profileNameInput?.value?.trim();
      if (!name) {
        showToast("Please enter your name");
        el.profileNameInput?.focus();
        return;
      }
      if (!state.mySex) {
        showToast("Please select your gender (♀ / ♂)");
        return;
      }

      state.myName = name;
      state.myReady = true;
      try {
        sessionStorage.setItem("draw_name", name);
        sessionStorage.setItem("draw_sex", state.mySex);
        localStorage.setItem("draw_name", name);
        localStorage.setItem("draw_sex", state.mySex);
      } catch (e) {}
      updateBadges();

      if (state.isSolo) {
        state.partnerName = "Partner";
        state.partnerSex = state.mySex === "female" ? "male" : "female";
        updateBadges();
        showStage("pack_select");
        showToast("Profile set! Pick a prompt pack 🎨");
        return;
      }

      updateProfileReadyUI();

      sendMsg("SUBMIT_PROFILE", {
        name: state.myName,
        sex: state.mySex
      });

      if (state.partnerReady) {
        showStage("pack_select");
        showToast("Both ready! Pick a prompt pack 🎨");
      }
    });

    el.profileWaitingWrap?.addEventListener("click", () => {
      showStage("pack_select");
      sendMsg("SET_STAGE", { stage: "pack_select" });
    });

    // Copy Invite
    el.btnCopyInvite?.addEventListener("click", () => {
      const inviteUrl = `${window.location.origin}/draw?room=${state.roomCode}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(inviteUrl).then(() => showToast("Invite link copied! 📋"));
      } else {
        showToast(`Room: ${state.roomCode}`);
      }
    });

    // Pack Select (Screenshot 1)
    el.packsGrid?.addEventListener("click", (evt) => {
      const card = evt.target.closest(".draw-pack-card");
      if (!card) return;
      const packId = card.dataset.pack;
      if (!packId) return;

      document.querySelectorAll(".draw-pack-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.selectedPack = packId;

      sendMsg("SELECT_PACK", { packId });
    });

    // Next to Match Setup (Screenshot 1 -> 2)
    el.btnPackNext?.addEventListener("click", () => {
      sendMsg("SET_STAGE", { stage: "match_setup" });
      showStage("match_setup");
    });

    // Rounds
    el.roundsSelector?.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".draw-pill-btn");
      if (!btn) return;
      const rounds = Number(btn.dataset.rounds);
      state.roundsTotal = rounds;

      document.querySelectorAll("#roundsSelector .draw-pill-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      sendMsg("SET_MATCH_CONFIG", { roundsTotal: rounds, customPrompts: state.customPrompts });
    });

    // Seconds
    el.secondsSelector?.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".draw-pill-btn");
      if (!btn) return;
      const secs = Number(btn.dataset.seconds);
      state.secondsPerDrawing = secs;
      state.timerRemaining = secs;

      document.querySelectorAll("#secondsSelector .draw-pill-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      sendMsg("SET_MATCH_CONFIG", { secondsPerDrawing: secs, customPrompts: state.customPrompts });
    });

    // Start Drawing Click
    el.btnStartDrawing?.addEventListener("click", () => {
      if (el.btnStartDrawing.disabled) return;
      el.btnStartDrawing.disabled = true;
      setTimeout(() => { if (el.btnStartDrawing) el.btnStartDrawing.disabled = false; }, 2000);
      if (state.isSolo) {
        startSoloMatch(1);
      } else {
        sendMsg("START_MATCH", { packId: state.selectedPack, customPrompts: state.customPrompts });
      }
    });


    // Pointer Events on My Canvas
    if (el.myCanvas) {
      el.myCanvas.addEventListener("pointerdown", startStroke, { passive: false });
      el.myCanvas.addEventListener("pointermove", moveStroke, { passive: false });
      window.addEventListener("pointerup", endStroke);
      window.addEventListener("pointercancel", endStroke);
    }

    // Tap Partner's Pad to Poke
    if (el.partnerPadCard) {
      el.partnerPadCard.addEventListener("click", (evt) => {
        const rect = el.partnerPadCard.getBoundingClientRect();
        const nx = (evt.clientX - rect.left) / rect.width;
        const ny = (evt.clientY - rect.top) / rect.height;
        triggerPoke(state.selectedPokeEmoji, nx, ny);
      });
    }

    // Color Swatches
    el.colorPalette?.addEventListener("click", (evt) => {
      const swatch = evt.target.closest(".draw-color-swatch");
      if (!swatch) return;
      document.querySelectorAll(".draw-color-swatch").forEach(s => s.classList.remove("selected"));
      swatch.classList.add("selected");
      state.currentColor = swatch.dataset.color;
      state.isEraser = false;
      el.btnToolEraser?.classList.remove("selected");
    });

    // Eraser Tool
    el.btnToolEraser?.addEventListener("click", () => {
      state.isEraser = !state.isEraser;
      if (state.isEraser) {
        el.btnToolEraser.classList.add("selected");
        document.querySelectorAll(".draw-color-swatch").forEach(s => s.classList.remove("selected"));
      } else {
        el.btnToolEraser.classList.remove("selected");
        const currentSwatch = document.querySelector(`.draw-color-swatch[data-color="${state.currentColor}"]`);
        if (currentSwatch) currentSwatch.classList.add("selected");
      }
    });

    // Brush Sizes
    el.brushSizes?.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".draw-size-btn");
      if (!btn) return;
      document.querySelectorAll(".draw-size-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.currentSize = Number(btn.dataset.size);
    });

    // History: Undo
    el.btnToolUndo?.addEventListener("click", () => {
      if (!state.myStrokes || state.myStrokes.length === 0) return;
      const undone = state.myStrokes.pop();
      if (!state.myRedoStack) state.myRedoStack = [];
      state.myRedoStack.push(undone);
      redrawAllStrokes();
      if (!state.isSolo) {
        sendMsg("DRAW_UNDO");
      }
    });

    // History: Redo
    el.btnToolRedo?.addEventListener("click", () => {
      if (!state.myRedoStack || state.myRedoStack.length === 0) return;
      const redone = state.myRedoStack.pop();
      state.myStrokes.push(redone);
      renderStroke(myCtx, el.myCanvas, redone);
      if (!state.isSolo) {
        sendMsg("DRAW_STROKE", { stroke: redone });
      }
    });

    // Clear Button
    el.btnClearCanvas?.addEventListener("click", () => {
      state.myStrokes = [];
      state.myRedoStack = [];
      clearLocalCanvas();
      if (!state.isSolo) {
        sendMsg("DRAW_CLEAR");
      }
    });

    // Poke Buttons
    el.pokeButtons?.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".draw-poke-btn");
      if (!btn) return;
      document.querySelectorAll(".draw-poke-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      const emoji = btn.dataset.emoji;
      state.selectedPokeEmoji = emoji;
      triggerPoke(emoji, 0.5, 0.5);
    });

    // Next Round
    el.btnNextRound?.addEventListener("click", () => {
      if (el.btnNextRound.disabled) return;
      el.btnNextRound.disabled = true;
      setTimeout(() => { if (el.btnNextRound) el.btnNextRound.disabled = false; }, 2000);
      if (state.isSolo) {
        if (state.currentRound < state.roundsTotal) {
          startSoloMatch(state.currentRound + 1);
        } else {
          onMatchCompleted();
        }
      } else {
        sendMsg("NEXT_ROUND");
      }
    });

    // Download Keepsake
    el.btnDownloadKeepsake?.addEventListener("click", () => {
      downloadKeepsakeImage();
    });

    // Play Again (Multiplayer with prompt confirmation, or Solo)
    el.btnPlayAgain?.addEventListener("click", () => {
      if (!window.confirm("Are you sure you saved your artwork and want to play again? 💕")) {
        return;
      }
      if (state.isSolo) {
        state.roundHistory = [];
        state.myStrokes = [];
        state.partnerStrokes = [];
        state.myRedoStack = [];
        state.currentRound = 1;
        clearLocalCanvas();
        clearPartnerCanvas();
        showStage("pack_select");
        showToast("Starting new solo game! Pick a prompt pack 🎨");
        return;
      }

      if (state.partnerConnected === false) {
        showToast("Partner disconnected. Returning to menu.");
        exitToMainMenu();
        return;
      }

      if (el.modalPlayAgain) {
        if (el.modalPlayAgainTitle) el.modalPlayAgainTitle.textContent = "Waiting for Partner...";
        if (el.modalPlayAgainText) el.modalPlayAgainText.textContent = `Sent invite to ${state.partnerName || "partner"}. Waiting for their response...`;
        if (el.modalPlayAgainPromptActions) el.modalPlayAgainPromptActions.style.display = "none";
        if (el.modalPlayAgainWaiting) el.modalPlayAgainWaiting.style.display = "block";
        el.modalPlayAgain.classList.remove("hidden");
      }
      sendMsg("PLAY_AGAIN_REQUEST");
    });

    el.btnAcceptPlayAgain?.addEventListener("click", () => {
      if (el.modalPlayAgain) el.modalPlayAgain.classList.add("hidden");
      sendMsg("PLAY_AGAIN_RESPONSE", { accepted: true });
    });

    el.btnDeclinePlayAgain?.addEventListener("click", () => {
      if (el.modalPlayAgain) el.modalPlayAgain.classList.add("hidden");
      sendMsg("PLAY_AGAIN_RESPONSE", { accepted: false });
      exitToMainMenu();
    });

    el.btnCancelPlayAgain?.addEventListener("click", () => {
      if (el.modalPlayAgain) el.modalPlayAgain.classList.add("hidden");
      sendMsg("PLAY_AGAIN_CANCEL");
    });

    // Exit to Main Menu Buttons
    el.btnExitDrawing?.addEventListener("click", () => exitToMainMenu());
    el.btnReviewExit?.addEventListener("click", () => exitToMainMenu());
    el.btnExitComplete?.addEventListener("click", () => exitToMainMenu(false, Boolean(document.getElementById("drawGameModal"))));
    const handleBackWebsite = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const modal = document.getElementById("drawGameModal");
      if (modal) {
        closeDrawModal();
        const section = document.getElementById("section-draw");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      window.location.href = "/";
    };
    el.btnBackToWebsite?.addEventListener("click", handleBackWebsite);
    document.addEventListener("click", (e) => {
      if (e.target.closest("#btnBackToWebsite")) {
        handleBackWebsite(e);
      }
      if (e.target.closest(".btn-exit-setup, .draw-btn-bottom-exit")) {
        e.preventDefault();
        exitToMainMenu();
      }
    });
    document.querySelectorAll(".btn-exit-setup").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        exitToMainMenu();
      });
    });

    // In-Page Website Widget Launcher Triggers (Photobooth Parity)
    const handleWidgetStart = () => openDrawModal("start");
    const handleWidgetJoinToggle = () => {
      const form = document.getElementById("widgetInlineJoinForm");
      if (!form) {
        openDrawModal("join");
        return;
      }
      const isHidden = form.style.display === "none" || !form.style.display;
      form.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        const inp = document.getElementById("widgetInputJoinCode");
        inp?.focus();
        inp?.select?.();
      }
    };
    const handleWidgetJoinSubmit = () => {
      const inp = document.getElementById("widgetInputJoinCode");
      const code = inp?.value?.trim().toUpperCase();
      if (!code || code.length < 3) {
        openDrawModal("join");
        return;
      }
      openDrawModal("join");
      if (el.inputJoinCode) el.inputJoinCode.value = code;
      state.roomCode = code;
      el.btnJoinRoomSubmit?.click();
    };
    const handleWidgetSolo = () => openDrawModal("solo");

    document.getElementById("btnLaunchDrawStartRoom")?.addEventListener("click", handleWidgetStart);
    document.getElementById("btnLaunchDrawJoinRoom")?.addEventListener("click", handleWidgetJoinToggle);
    document.getElementById("btnWidgetJoinSubmit")?.addEventListener("click", handleWidgetJoinSubmit);
    document.getElementById("widgetInputJoinCode")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleWidgetJoinSubmit();
    });
    document.getElementById("btnLaunchDrawSolo")?.addEventListener("click", handleWidgetSolo);
    document.getElementById("btnCloseDrawModal")?.addEventListener("click", closeDrawModal);

    // Resize
    window.addEventListener("resize", () => {
      if (state.stage === "drawing") {
        setupCanvasSize();
        redrawAllStrokes();
      }
    });

    // Foreground / App Switch Reconnect
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && state.roomCode && !state.isSolo) {
        const isClosed = !state.ws || state.ws.readyState === WebSocket.CLOSED || state.ws.readyState === WebSocket.CLOSING;
        if (isClosed) {
          initNetworking(state.roomCode);
        }
      }
    });
  }

  // --- Lobby Live Drawing Showcase Engine ---
  const LOBBY_SHOWCASE_SCENES = [
    {
      prompt: '"our first date"',
      left: [
        "M 50 60 L 50 95 Q 50 115 80 115 Q 110 115 110 95 L 110 60 Z",
        "M 110 68 Q 128 68 128 85 Q 128 98 108 100",
        "M 65 48 Q 60 34 68 24",
        "M 95 48 Q 100 34 92 24",
        "M 80 34 C 80 27 72 27 72 34 C 72 41 80 47 80 47 C 80 47 88 41 88 34 C 88 27 80 27 80 34 Z",
        "M 70 85 Q 80 93 90 85"
      ],
      right: [
        "M 45 50 L 66 85 L 66 115 M 54 115 L 78 115 M 40 50 L 76 50",
        "M 115 50 L 94 85 L 94 115 M 82 115 L 106 115 M 84 50 L 120 50",
        "M 80 25 L 80 40 M 72 32 L 88 32",
        "M 75 27 L 85 37 M 85 27 L 75 37"
      ]
    },
    {
      prompt: '"the cutest pet"',
      left: [
        "M 46 62 L 34 32 L 64 46 Q 80 43 96 46 L 126 32 L 114 62 Q 130 92 114 115 Q 80 134 46 115 Q 30 92 46 62 Z",
        "M 53 74 Q 63 67 73 74",
        "M 87 74 Q 97 67 107 74",
        "M 80 83 L 76 89 L 84 89 Z",
        "M 80 89 Q 73 96 68 92",
        "M 80 89 Q 87 96 92 92",
        "M 38 78 L 22 75 M 38 84 L 20 86",
        "M 122 78 L 138 75 M 122 84 L 140 86"
      ],
      right: [
        "M 55 52 Q 80 42 105 52 Q 125 72 120 100 Q 110 125 80 125 Q 50 125 40 100 Q 35 72 55 52 Z",
        "M 55 52 Q 30 57 28 85 Q 26 103 45 95",
        "M 105 52 Q 130 57 132 85 Q 134 103 115 95",
        "M 62 72 A 4 4 0 1 1 62 71.9",
        "M 98 72 A 4 4 0 1 1 98 71.9",
        "M 74 85 Q 80 80 86 85 Q 80 92 74 85 Z",
        "M 80 90 Q 75 106 80 110 Q 85 106 80 90"
      ]
    },
    {
      prompt: '"midnight snack"',
      left: [
        "M 40 45 Q 80 30 120 45",
        "M 40 45 L 80 125 L 120 45",
        "M 66 62 A 5 5 0 1 1 66 61.9",
        "M 94 66 A 5 5 0 1 1 94 65.9",
        "M 78 92 A 5 5 0 1 1 78 91.9",
        "M 65 78 Q 65 92 70 92 Q 75 92 75 80"
      ],
      right: [
        "M 55 85 L 80 135 L 105 85 Z",
        "M 63 100 L 97 100 M 70 115 L 90 115",
        "M 55 85 Q 48 70 64 64 Q 56 48 76 44 Q 76 28 86 24 Q 96 34 90 48 Q 104 52 100 68 Q 112 75 105 85 Z",
        "M 88 22 A 5.5 5.5 0 1 1 88 21.9",
        "M 88 17 Q 98 8 96 2"
      ]
    }
  ];

  let lobbyShowcaseTimer = null;
  let lobbyShowcaseAnimFrame = null;
  let lobbyShowcaseSceneIdx = 0;
  let lobbyShowcaseRunning = false;

  function initLobbyShowcase() {
    const showcases = document.querySelectorAll(".draw-how-it-works-showcase");
    if (!showcases.length) return;

    showcases.forEach(showcase => {
      if (showcase.dataset.initialized) return;
      showcase.dataset.initialized = "true";

      showcase.addEventListener("click", (e) => {
        spawnShowcaseHearts(showcase, e);
        nextLobbyShowcaseScene();
      });
    });

    startLobbyShowcase();
  }

  function startLobbyShowcase() {
    if (lobbyShowcaseRunning) return;
    const showcases = document.querySelectorAll(".draw-how-it-works-showcase");
    if (!showcases.length) return;
    lobbyShowcaseRunning = true;
    playLobbyShowcaseScene(lobbyShowcaseSceneIdx);
  }

  function stopLobbyShowcase() {
    const modal = document.getElementById("drawGameModal");
    const isModalOpen = modal && modal.classList.contains("open");
    const hasInPageWidget = Boolean(document.getElementById("drawWidgetLobbyCard"));
    // Keep in-page website showcase running if modal is closed
    if (!isModalOpen && hasInPageWidget) return;

    lobbyShowcaseRunning = false;
    if (lobbyShowcaseTimer) {
      clearTimeout(lobbyShowcaseTimer);
      lobbyShowcaseTimer = null;
    }
    if (lobbyShowcaseAnimFrame) {
      cancelAnimationFrame(lobbyShowcaseAnimFrame);
      lobbyShowcaseAnimFrame = null;
    }
  }

  function nextLobbyShowcaseScene() {
    if (lobbyShowcaseTimer) clearTimeout(lobbyShowcaseTimer);
    if (lobbyShowcaseAnimFrame) cancelAnimationFrame(lobbyShowcaseAnimFrame);
    lobbyShowcaseSceneIdx = (lobbyShowcaseSceneIdx + 1) % LOBBY_SHOWCASE_SCENES.length;
    playLobbyShowcaseScene(lobbyShowcaseSceneIdx);
  }

  function spawnShowcaseHearts(showcase, e) {
    if (!showcase) return;
    const rect = showcase.getBoundingClientRect();
    const x = (e && e.clientX ? e.clientX : rect.left + rect.width / 2) - rect.left;
    const y = (e && e.clientY ? e.clientY : rect.top + rect.height / 2) - rect.top;
    const emojis = ["💖", "✨", "🎨", "💕", "⭐"];

    for (let i = 0; i < 6; i++) {
      const sp = document.createElement("span");
      sp.className = "dhiw-sparkle";
      sp.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      sp.style.left = `${x}px`;
      sp.style.top = `${y}px`;
      const angle = (Math.PI * 2 * i) / 6 + (Math.random() * 0.4 - 0.2);
      const dist = 28 + Math.random() * 32;
      sp.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      sp.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      showcase.appendChild(sp);
      setTimeout(() => sp.remove(), 800);
    }
  }

  function prepareShowcaseBoard(svg, pathStrings, isPink) {
    svg.innerHTML = "";
    const paths = [];
    let totalLength = 0;

    for (const d of pathStrings) {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", isPink ? "#ff527b" : "#2563eb");
      p.setAttribute("stroke-width", "4.5");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      svg.appendChild(p);

      let len = 0;
      try {
        len = p.getTotalLength();
      } catch (_) {
        len = 100;
      }
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = `${len}`;

      paths.push({ el: p, len, start: totalLength, end: totalLength + len });
      totalLength += len;
    }

    const penG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    penG.setAttribute("class", "dhiw-pen-cursor");
    penG.setAttribute("opacity", "0");
    const tagText = isPink ? "YOU" : "PARTNER";
    const tagWidth = isPink ? 30 : 48;
    const tagX = isPink ? 20 : 29;
    const color = isPink ? "#ff527b" : "#2563eb";

    penG.innerHTML = `
      <polygon points="0,0 4,-10 -4,-10" fill="#1e293b" />
      <rect x="-4" y="-26" width="8" height="16" rx="2" fill="${color}" />
      <rect x="5" y="-23" width="${tagWidth}" height="14" rx="7" fill="${color}" />
      <text x="${tagX}" y="-13" font-size="7.5" font-weight="800" font-family="sans-serif" fill="#ffffff" text-anchor="middle">${tagText}</text>
    `;
    svg.appendChild(penG);

    return { paths, totalLength, penG };
  }

  function updateShowcaseProgress(board, t) {
    if (!board || !board.totalLength) return;
    const currentDist = Math.min(board.totalLength, t * board.totalLength);
    let activePoint = null;

    for (const item of board.paths) {
      if (currentDist <= item.start) {
        item.el.style.strokeDashoffset = `${item.len}`;
      } else if (currentDist >= item.end) {
        item.el.style.strokeDashoffset = "0";
        try {
          activePoint = item.el.getPointAtLength(item.len);
        } catch (_) {}
      } else {
        const drawnInThis = currentDist - item.start;
        item.el.style.strokeDashoffset = `${Math.max(0, item.len - drawnInThis)}`;
        try {
          activePoint = item.el.getPointAtLength(drawnInThis);
        } catch (_) {}
      }
    }

    if (activePoint && t < 1) {
      board.penG.setAttribute("transform", `translate(${activePoint.x}, ${activePoint.y})`);
      board.penG.setAttribute("opacity", "1");
    } else {
      board.penG.setAttribute("opacity", "0");
    }
  }

  function playLobbyShowcaseScene(idx) {
    const showcases = document.querySelectorAll(".draw-how-it-works-showcase");
    if (!showcases.length) return;

    const scene = LOBBY_SHOWCASE_SCENES[idx % LOBBY_SHOWCASE_SCENES.length];
    const activePairs = [];

    showcases.forEach(showcase => {
      const pill = showcase.querySelector(".dhiw-prompt-pill");
      const svgPink = showcase.querySelector(".dhiw-svg-pink") || showcase.querySelector(".dhiw-board-pink svg") || showcase.querySelector("#dhiwSvgPink");
      const svgBlue = showcase.querySelector(".dhiw-svg-blue") || showcase.querySelector(".dhiw-board-blue svg") || showcase.querySelector("#dhiwSvgBlue");

      if (pill) {
        pill.style.opacity = "0";
        pill.style.transform = "scale(0.92)";
        setTimeout(() => {
          pill.textContent = scene.prompt;
          pill.style.opacity = "1";
          pill.style.transform = "scale(1)";
        }, 120);
      }

      if (svgPink && svgBlue) {
        activePairs.push({
          pink: prepareShowcaseBoard(svgPink, scene.left, true),
          blue: prepareShowcaseBoard(svgBlue, scene.right, false)
        });
      }
    });

    if (!activePairs.length) return;

    const duration = 2400;
    const startTime = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();

    function step(now) {
      if (!lobbyShowcaseRunning) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      activePairs.forEach(pair => {
        updateShowcaseProgress(pair.pink, eased);
        updateShowcaseProgress(pair.blue, eased);
      });

      if (progress < 1) {
        lobbyShowcaseAnimFrame = requestAnimationFrame(step);
      } else {
        activePairs.forEach(pair => {
          updateShowcaseProgress(pair.pink, 1);
          updateShowcaseProgress(pair.blue, 1);
        });
        lobbyShowcaseTimer = setTimeout(() => {
          if (lobbyShowcaseRunning) nextLobbyShowcaseScene();
        }, 2200);
      }
    }

    lobbyShowcaseAnimFrame = requestAnimationFrame(step);
  }

  // --- Initialize ---
  function init() {
    bindElements();
    if (el.stageLobby) {
      initEvents();

      if (el.canvasesContainer) {
        el.canvasesContainer.classList.remove("view-mine", "view-partner");
        el.canvasesContainer.classList.add("view-split");
      }

      initLobbyShowcase();

      const urlParams = new URLSearchParams(window.location.search);
      const roomFromQuery = urlParams.get("room") || urlParams.get("code") || urlParams.get("draw_room");
      const pathMatch = window.location.pathname.match(/^\/draw\/([a-zA-Z0-9_-]+)/);
      const initialRoom = roomFromQuery || (pathMatch ? pathMatch[1] : null);

      if (initialRoom) {
        if (document.getElementById("drawGameModal")) {
          openDrawModal();
        }
        state.roomCode = initialRoom.toUpperCase().trim();
        syncRoomUrl(state.roomCode);
        if (el.inputJoinCode) el.inputJoinCode.value = state.roomCode;
        if (el.displayRoomCode) el.displayRoomCode.textContent = state.roomCode;
        if (el.lobbyInitialView) el.lobbyInitialView.style.display = "none";
        if (el.lobbyWaitingView) el.lobbyWaitingView.style.display = "block";
        if (el.waitingStatusText) el.waitingStatusText.textContent = `Connecting to room ${state.roomCode}...`;
        initNetworking(state.roomCode);
      }
    }
  }

  // --- In-Page Website Widget Engine ---
  function setupDrawWidget(data = {}, hero = {}) {
    bindElements();
    initLobbyShowcase();
    if (!el.stageLobby) return;

    if (hero && typeof hero === "object") {
      if (hero.partner1 && !state.myName) {
        state.myName = hero.partner1;
        if (el.profileNameInput) el.profileNameInput.value = state.myName;
        if (el.myPadBadge) el.myPadBadge.textContent = state.myName;
        if (el.reviewMyName) el.reviewMyName.textContent = state.myName;
      }
      if (hero.partner2) {
        state.partnerName = hero.partner2;
        if (el.partnerPadBadge) el.partnerPadBadge.textContent = state.partnerName;
        if (el.remoteCursorTag) el.remoteCursorTag.textContent = state.partnerName;
        if (el.reviewPartnerName) el.reviewPartnerName.textContent = state.partnerName;
      }
    }

    if (data && typeof data === "object") {
      if (data.defaultPack && PROMPT_PACKS[data.defaultPack]) {
        state.selectedPack = data.defaultPack;
        if (el.packsGrid) {
          el.packsGrid.querySelectorAll(".draw-pack-card").forEach(c => {
            c.classList.toggle("selected", c.dataset.pack === data.defaultPack);
          });
        }
      }
      if (data.defaultRounds && el.roundsSelector) {
        const r = parseInt(data.defaultRounds, 10);
        if (!isNaN(r)) {
          state.roundsTotal = r;
          el.roundsSelector.querySelectorAll(".draw-pill-btn").forEach(b => {
            b.classList.toggle("selected", parseInt(b.dataset.rounds, 10) === r);
          });
        }
      }
      if (data.defaultSeconds && el.secondsSelector) {
        const s = parseInt(data.defaultSeconds, 10);
        if (!isNaN(s)) {
          state.secondsPerDrawing = s;
          el.secondsSelector.querySelectorAll(".draw-pill-btn").forEach(b => {
            b.classList.toggle("selected", parseInt(b.dataset.seconds, 10) === s);
          });
        }
      }
      if (data.customPrompts && typeof data.customPrompts === "object") {
        state.customPrompts = data.customPrompts;
      }
      const secEl = document.getElementById("section-draw");
      if (secEl && (!data.customPrompts || Object.keys(data.customPrompts).length === 0)) {
        try {
          const raw = secEl.getAttribute("data-custom-prompts");
          if (raw) state.customPrompts = JSON.parse(raw);
        } catch (_) {}
      }
    }

    renderShowcaseDoodles();
    init();
  }
  window.setupDrawWidget = setupDrawWidget;
  window.openDrawModal = openDrawModal;
  window.closeDrawModal = closeDrawModal;

  // Listen for builder messages
  window.addEventListener("message", (e) => {
    if (!e.data || typeof e.data !== "object") return;
    const { type, config, emoji } = e.data;
    if (type === "DRAW_UPDATE_CONFIG" && config) {
      const sec = document.getElementById("section-draw");
      if (sec) {
        const tagEl = sec.querySelector(".section-tag") || sec.querySelector(".ldr-welcome-pill span");
        const titleEl = sec.querySelector(".section-title") || sec.querySelector(".ldr-welcome-title");
        const descEl = sec.querySelector(".section-desc") || sec.querySelector(".ldr-welcome-sub");
        if (tagEl && config.tag) {
          tagEl.textContent = config.tag.startsWith("💕") ? config.tag : ("💕 " + config.tag);
        }
        if (titleEl && config.title) titleEl.textContent = config.title;
        if (descEl && config.desc) descEl.textContent = config.desc;
      }
      if (config.customPrompts && typeof config.customPrompts === "object") {
        state.customPrompts = config.customPrompts;
      }
      if (config.defaultPack && PROMPT_PACKS[config.defaultPack]) {
        state.selectedPack = config.defaultPack;
        if (el.packsGrid) {
          el.packsGrid.querySelectorAll(".draw-pack-card").forEach(c => {
            c.classList.toggle("selected", c.dataset.pack === config.defaultPack);
          });
        }
      }
      if (config.defaultRounds && el.roundsSelector) {
        const r = parseInt(config.defaultRounds, 10);
        if (!isNaN(r)) {
          state.roundsTotal = r;
          el.roundsSelector.querySelectorAll(".draw-pill-btn").forEach(b => {
            b.classList.toggle("selected", parseInt(b.dataset.rounds, 10) === r);
          });
        }
      }
      if (config.defaultSeconds && el.secondsSelector) {
        const s = parseInt(config.defaultSeconds, 10);
        if (!isNaN(s)) {
          state.secondsPerDrawing = s;
          el.secondsSelector.querySelectorAll(".draw-pill-btn").forEach(b => {
            b.classList.toggle("selected", parseInt(b.dataset.seconds, 10) === s);
          });
        }
      }
    } else if (type === "DRAW_TEST_POKE") {
      const pokeBtn = document.querySelector(".draw-poke-btn");
      if (pokeBtn) pokeBtn.click();
    }
  });

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        init();
        if (document.getElementById("section-draw") || document.querySelector(".draw-section")) {
          setupDrawWidget(window.DRAW_DATA || {});
        }
      });
    } else {
      init();
      if (document.getElementById("section-draw") || document.querySelector(".draw-section")) {
        setupDrawWidget(window.DRAW_DATA || {});
      }
    }
  }
})();

