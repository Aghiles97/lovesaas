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

  // --- Persistent Participant Storage ---
  function getOrCreateParticipantId(code) {
    const key = `draw_pid_${code || "global"}`;
    let id = null;
    try {
      id = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (!id) {
        id = "user_" + Math.random().toString(36).slice(2, 9);
        sessionStorage.setItem(key, id);
        localStorage.setItem(key, id);
      }
    } catch (e) {
      id = "user_" + Math.random().toString(36).slice(2, 9);
    }
    return id;
  }

  let savedName = "";
  let savedSex = null;
  try {
    savedName = sessionStorage.getItem("draw_name") || "";
    savedSex = sessionStorage.getItem("draw_sex") || null;
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
    const pack = PROMPT_PACKS[packId] || PROMPT_PACKS.animals;
    if (!state.usedSoloPrompts) state.usedSoloPrompts = new Set();
    const available = pack.prompts.filter(p => !state.usedSoloPrompts.has(p));
    const pool = available.length > 0 ? available : pack.prompts;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    state.usedSoloPrompts.add(chosen);
    return chosen;
  }

  // --- App State ---
  const state = {
    roomCode: null,
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
  const el = {
    stageLobby: document.getElementById("stageLobby"),
    stageProfile: document.getElementById("stageProfile"),
    stagePackSelect: document.getElementById("stagePackSelect"),
    stageMatchSetup: document.getElementById("stageMatchSetup"),
    stageDrawing: document.getElementById("stageDrawing"),
    stageRoundReview: document.getElementById("stageRoundReview"),
    stageMatchComplete: document.getElementById("stageMatchComplete"),

    profileNameInput: document.getElementById("profileNameInput"),
    profileSexSelector: document.getElementById("profileSexSelector"),
    btnProfileReady: document.getElementById("btnProfileReady"),
    profileWaitingWrap: document.getElementById("profileWaitingWrap"),
    profileWaitingText: document.getElementById("profileWaitingText"),
    profilePartnerStatus: document.getElementById("profilePartnerStatus"),
    profilePartnerStatusText: document.getElementById("profilePartnerStatusText"),

    btnStartRoom: document.getElementById("btnStartRoom"),
    btnShowJoinForm: document.getElementById("btnShowJoinForm"),
    btnPracticeSolo: document.getElementById("btnPracticeSolo"),
    btnJoinRoomSubmit: document.getElementById("btnJoinRoomSubmit"),
    btnBackToInitial: document.getElementById("btnBackToInitial"),
    btnWaitingSkipToSolo: document.getElementById("btnWaitingSkipToSolo"),
    inputJoinCode: document.getElementById("inputJoinCode"),
    displayRoomCode: document.getElementById("displayRoomCode"),
    btnCopyInvite: document.getElementById("btnCopyInvite"),
    waitingStatusText: document.getElementById("waitingStatusText"),
    lobbyInitialView: document.getElementById("lobbyInitialView"),
    lobbyInlineJoinForm: document.getElementById("lobbyInlineJoinForm"),
    lobbyWaitingView: document.getElementById("lobbyWaitingView"),

    packsGrid: document.getElementById("packsGrid"),
    btnPackNext: document.getElementById("btnPackNext"),

    roundsSelector: document.getElementById("roundsSelector"),
    secondsSelector: document.getElementById("secondsSelector"),
    btnStartDrawing: document.getElementById("btnStartDrawing"),

    displayRoundNum: document.getElementById("displayRoundNum"),
    displayRoundTotal: document.getElementById("displayRoundTotal"),
    displayPrompt: document.getElementById("displayPrompt"),
    displayTimer: document.getElementById("displayTimer"),
    bottomStartWrap: document.getElementById("bottomStartWrap"),
    btnStartRoundTimer: document.getElementById("btnStartRoundTimer"),
    tabPartnerLabel: document.getElementById("tabPartnerLabel"),
    canvasesContainer: document.getElementById("canvasesContainer"),
    myPadCard: document.getElementById("myPadCard"),
    partnerPadCard: document.getElementById("partnerPadCard"),
    myPadBadge: document.getElementById("myPadBadge"),
    partnerPadBadge: document.getElementById("partnerPadBadge"),
    myCanvas: document.getElementById("myCanvas"),
    partnerCanvas: document.getElementById("partnerCanvas"),
    myPokeLayer: document.getElementById("myPokeLayer"),
    partnerPokeLayer: document.getElementById("partnerPokeLayer"),
    colorPalette: document.getElementById("colorPalette"),
    btnToolEraser: document.getElementById("btnToolEraser"),
    brushSizes: document.getElementById("brushSizes"),
    btnToolUndo: document.getElementById("btnToolUndo"),
    btnToolRedo: document.getElementById("btnToolRedo"),
    btnClearCanvas: document.getElementById("btnClearCanvas"),
    pokeButtons: document.getElementById("pokeButtons"),

    reviewPromptText: document.getElementById("reviewPromptText"),
    reviewMyName: document.getElementById("reviewMyName"),
    reviewPartnerName: document.getElementById("reviewPartnerName"),
    reviewMyImg: document.getElementById("reviewMyImg"),
    reviewPartnerImg: document.getElementById("reviewPartnerImg"),
    btnNextRound: document.getElementById("btnNextRound"),
    btnReviewExit: document.getElementById("btnReviewExit"),

    recapGallery: document.getElementById("recapGallery"),
    btnDownloadKeepsake: document.getElementById("btnDownloadKeepsake"),
    btnPlayAgain: document.getElementById("btnPlayAgain"),
    btnPlaySoloAgain: document.getElementById("btnPlaySoloAgain"),
    btnExitComplete: document.getElementById("btnExitComplete"),
    btnExitDrawing: document.getElementById("btnExitDrawing")
  };

  // --- Stage Switching ---
  function showStage(stageName) {
    state.stage = stageName;
    document.body.classList.toggle("draw-solo-mode", Boolean(state.isSolo));
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
      }
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
          name: state.myName
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
    const url = `/api/draw/rooms/${state.roomCode}/events?id=${encodeURIComponent(state.participantId)}&name=${encodeURIComponent(state.myName)}`;
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
      showToast("Reconnecting to room... ⏳");
      if (!state._fullRetryTimer) {
        state._fullRetryTimer = setTimeout(() => {
          state._fullRetryTimer = null;
          if (state.roomCode) initNetworking(state.roomCode);
        }, 1500);
      }
      return;
    }

    if (type === "ROOM_JOINED") {
      state.role = msg.role || state.role;
      if (msg.participants) {
        const other = msg.participants.find(p => p.id !== state.participantId);
        if (other && other.name) {
          state.partnerName = other.name;
          updateBadges();
        }
      }

      // Hydrate state if reconnecting to active session
      if (msg.state) {
        if (msg.state.profiles) {
          if (msg.state.profiles[state.participantId]) {
            state.myName = msg.state.profiles[state.participantId].name || state.myName;
            state.mySex = msg.state.profiles[state.participantId].sex || state.mySex;
            state.myReady = !!msg.state.profiles[state.participantId].ready;
          }
          const otherId = Object.keys(msg.state.profiles).find(id => id !== state.participantId);
          if (otherId && msg.state.profiles[otherId]) {
            state.partnerName = msg.state.profiles[otherId].name || state.partnerName;
            state.partnerSex = msg.state.profiles[otherId].sex || state.partnerSex;
            state.partnerReady = !!msg.state.profiles[otherId].ready;
          }
          updateBadges();
          updateProfileReadyUI();
        }

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
            const srvMy = srvRound.artwork?.[state.participantId] || "";
            const srvPartner = Object.entries(srvRound.artwork || {}).find(([id]) => id !== state.participantId)?.[1] || "";
            if (!existing) {
              state.roundHistory.push({
                round: srvRound.round,
                prompt: srvRound.prompt,
                myImg: srvMy,
                partnerImg: srvPartner || srvMy
              });
            } else {
              if (srvMy) existing.myImg = srvMy;
              if (srvPartner) existing.partnerImg = srvPartner;
            }
          });
          if (state.stage === "match_complete") {
            renderRecapGallery();
          }
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
      if (msg.partner) {
        state.partnerName = msg.partner.name || "Partner";
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
      return;
    }

    if (type === "MATCH_STARTED" || type === "ROUND_STARTED") {
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
      if (tag) tag.textContent = msg.senderName || state.partnerName || "Partner";
      return;
    }

    if (type === "REMOTE_CLICK") {
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

    if (type === "MATCH_RESTARTED") {
      state.roundHistory = [];
      state.myStrokes = [];
      state.partnerStrokes = [];
      state.myRedoStack = [];
      state.currentRound = 1;
      clearCanvas(el.myCanvas, ctx.my);
      clearCanvas(el.partnerCanvas, ctx.partner);
      showStage("pack_select");
      showToast("Match restarted!");
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

  // --- Round & Match Completion ---
  function onRoundCompleted(data) {
    if (isDrawing) endStroke();
    const roundNum = data?.round || state.currentRound;
    const myImg = el.myCanvas ? el.myCanvas.toDataURL("image/png") : "";
    const partnerImg = el.partnerCanvas ? el.partnerCanvas.toDataURL("image/png") : "";

    let existing = state.roundHistory.find(r => r.round === roundNum);
    if (!existing) {
      existing = {
        round: roundNum,
        prompt: data?.historyItem?.prompt || state.currentPrompt,
        myImg,
        partnerImg: partnerImg || myImg
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
    if (el.reviewPartnerImg) el.reviewPartnerImg.src = existing.partnerImg || existing.myImg;

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
              <span class="draw-pad-badge pink">${state.isSolo ? "Solo" : "Pad 1"}</span>
            </div>
            <div class="draw-review-canvas-box">
              <img src="${r.myImg || ""}" alt="Drawing 1" />
            </div>
          </div>
          ${!state.isSolo ? `
          <div class="draw-review-card">
            <div class="draw-review-card-header">
              <span class="draw-review-drawer-name">${state.partnerName || "Partner"}</span>
              <span class="draw-pad-badge blue">Pad 2</span>
            </div>
            <div class="draw-review-canvas-box">
              <img src="${r.partnerImg || r.myImg || ""}" alt="Drawing 2" />
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
    const myImg = el.myCanvas ? el.myCanvas.toDataURL("image/png") : "";
    const partnerImg = el.partnerCanvas ? el.partnerCanvas.toDataURL("image/png") : "";

    if (data?.roundHistory && Array.isArray(data.roundHistory)) {
      data.roundHistory.forEach(srvRound => {
        let existing = state.roundHistory.find(r => r.round === srvRound.round);
        const srvMy = srvRound.artwork?.[state.participantId] || "";
        const srvPartner = Object.entries(srvRound.artwork || {}).find(([id]) => id !== state.participantId)?.[1] || "";
        if (!existing) {
          state.roundHistory.push({
            round: srvRound.round,
            prompt: srvRound.prompt,
            myImg: srvMy,
            partnerImg: srvPartner || srvMy
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
        partnerImg: partnerImg || myImg
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

  // --- Keepsake Artwork Exporter ---
  function downloadKeepsakeImage() {
    const offCanvas = document.createElement("canvas");
    const count = state.roundHistory.length || 1;
    const isSolo = Boolean(state.isSolo);
    const cardW = isSolo ? 520 : 800;
    const roundH = 340;
    const headerH = 120;
    const footerH = 60;
    offCanvas.width = cardW;
    offCanvas.height = headerH + (count * roundH) + footerH;

    const ctx = offCanvas.getContext("2d");
    ctx.fillStyle = "#f8f9fb";
    ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    ctx.fillStyle = "#18181b";
    ctx.font = "bold 28px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isSolo ? "My Drawings 💕" : "Our Drawings Together 💕", cardW / 2, 54);

    ctx.fillStyle = "#71717a";
    ctx.font = "16px 'Outfit', sans-serif";
    ctx.fillText(isSolo ? `${state.myName || "Artist"} · ${new Date().toLocaleDateString()}` : `${state.myName} & ${state.partnerName} · ${new Date().toLocaleDateString()}`, cardW / 2, 84);

    let currentY = headerH;
    let pending = 0;

    const checkDone = () => {
      if (--pending === 0) {
        const link = document.createElement("a");
        link.download = `${isSolo ? "my" : "our"}-drawings-${Date.now()}.png`;
        link.href = offCanvas.toDataURL("image/png");
        link.click();
      }
    };

    const padW = isSolo ? 440 : 340;
    const padH = 240;

    [...state.roundHistory].sort((a, b) => a.round - b.round).forEach((r) => {
      ctx.fillStyle = "#18181b";
      ctx.font = "bold 16px 'Outfit', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Round ${r.round}: "${r.prompt}"`, 40, currentY + 24);

      const yBox = currentY + 40;
      const img1 = new Image();
      pending += 1;

      const drawBox = (img, src, x) => {
        if (!src) {
          checkDone();
          return;
        }
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, yBox, padW, padH);
          ctx.strokeStyle = "#18181b";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, yBox, padW, padH);
          ctx.drawImage(img, x, yBox, padW, padH);
          checkDone();
        };
        img.onerror = () => checkDone();
        img.src = src;
      };

      drawBox(img1, r.myImg, 40);

      if (!isSolo) {
        const img2 = new Image();
        pending += 1;
        drawBox(img2, r.partnerImg || r.myImg, 420);
      }

      currentY += roundH;
    });

    if (pending === 0) {
      checkDone();
    }
  }

  // --- Solo Mode Simulator ---
  let soloTimer = null;
  function startSoloMatch(roundNum = 1) {
    state.isSolo = true;
    document.body.classList.add("draw-solo-mode");
    state.timerRunning = false;
    state.currentRound = roundNum;
    state.currentPrompt = getRandomPrompt(state.selectedPack);
    if (roundNum === 1) {
      state.roundHistory = [];
      state.usedSoloPrompts = new Set();
      state.usedSoloPrompts.add(state.currentPrompt);
    }
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

  function exitToMainMenu() {
    if (state.stage === "drawing" && !window.confirm("Are you sure you want to exit? Current drawing progress will be lost. 🎨")) {
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
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      window.history.replaceState({}, "", url.pathname);
    } catch (e) {}

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
      if (state.isSolo || !state.roomCode) return;
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
      if (state.isSolo || !state.roomCode) return;
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

      sendMsg("SET_MATCH_CONFIG", { roundsTotal: rounds });
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

      sendMsg("SET_MATCH_CONFIG", { secondsPerDrawing: secs });
    });

    // Start Drawing Click
    el.btnStartDrawing?.addEventListener("click", () => {
      if (el.btnStartDrawing.disabled) return;
      el.btnStartDrawing.disabled = true;
      setTimeout(() => { if (el.btnStartDrawing) el.btnStartDrawing.disabled = false; }, 2000);
      if (state.isSolo) {
        startSoloMatch(1);
      } else {
        sendMsg("START_MATCH", { packId: state.selectedPack });
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
        if (state.currentRound >= state.roundsTotal) {
          onMatchCompleted();
        } else {
          sendMsg("NEXT_ROUND");
        }
      }
    });

    // Download Keepsake
    el.btnDownloadKeepsake?.addEventListener("click", () => {
      downloadKeepsakeImage();
    });

    // Play Again (Multiplayer or Solo)
    el.btnPlayAgain?.addEventListener("click", () => {
      if (!window.confirm("Are you sure you saved your artwork and want to play again? 💕")) {
        return;
      }
      if (state.isSolo) {
        showStage("pack_select");
      } else {
        if (state.partnerConnected === false) {
          if (window.confirm("Your partner disconnected. Would you like to switch to Solo mode?")) {
            state.isSolo = true;
            document.body.classList.add("draw-solo-mode");
            showStage("pack_select");
            return;
          }
        }
        sendMsg("RESTART_MATCH");
      }
    });

    // Play Solo Again
    el.btnPlaySoloAgain?.addEventListener("click", () => {
      if (!window.confirm("Start a new game in Solo mode? 💕")) return;
      state.isSolo = true;
      document.body.classList.add("draw-solo-mode");
      state.roundHistory = [];
      state.myStrokes = [];
      state.partnerStrokes = [];
      state.myRedoStack = [];
      state.currentRound = 1;
      clearCanvas(el.myCanvas, ctx.my);
      clearCanvas(el.partnerCanvas, ctx.partner);
      showStage("pack_select");
    });

    // Exit to Main Menu Buttons
    el.btnExitDrawing?.addEventListener("click", exitToMainMenu);
    el.btnReviewExit?.addEventListener("click", exitToMainMenu);
    el.btnExitComplete?.addEventListener("click", exitToMainMenu);
    document.querySelectorAll(".btn-exit-setup").forEach(btn => {
      btn.addEventListener("click", exitToMainMenu);
    });

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

  // --- Initialize ---
  function init() {
    initEvents();

    if (el.canvasesContainer) {
      el.canvasesContainer.classList.remove("view-mine", "view-partner");
      el.canvasesContainer.classList.add("view-split");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const roomFromQuery = urlParams.get("room") || urlParams.get("code");
    const pathMatch = window.location.pathname.match(/^\/draw\/([a-zA-Z0-9_-]+)/);
    let initialRoom = roomFromQuery || (pathMatch ? pathMatch[1] : null);

    if (!initialRoom) {
      try {
        const savedRoom = sessionStorage.getItem("draw_last_room");
        if (savedRoom && savedRoom.length >= 3 && savedRoom.length <= 10) {
          initialRoom = savedRoom;
        }
      } catch (_) {}
    }

    if (initialRoom) {
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
