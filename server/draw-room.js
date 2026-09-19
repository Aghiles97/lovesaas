const fs = require("fs");
const path = require("path");
const DATA_FILE = path.join(__dirname, "../data/draw_rooms.json");

let WebSocketServer = null;
try {
  ({ WebSocketServer } = require("ws"));
} catch (e) {
  console.warn("⚠️ [Draw] Package 'ws' not installed. WebSocket rooms disabled until npm install.");
}

const sanitizeStr = (s, len = 80) => String(s || "").replace(/<[^>]*>/g, "").slice(0, len).trim();

const PROMPT_PACKS = {
  animals: {
    id: "animals",
    name: "Animals",
    tagline: "Cute critters, big and small.",
    countLabel: "16 prompts",
    icon: "🐾",
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
    name: "Food & Snacks",
    tagline: "Everything you two crave.",
    countLabel: "12 prompts",
    icon: "🍜",
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
    name: "Random Doodles",
    tagline: "Anything goes — go wild.",
    countLabel: "12 prompts",
    icon: "🎲",
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
    name: "Our Memories",
    tagline: "Sweet stuff, just about us.",
    countLabel: "11 prompts",
    icon: "💖",
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
    name: "Draw Me",
    tagline: "Each other, lovingly butchered.",
    countLabel: "10 prompts",
    icon: "💌",
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
    name: "Silly & Weird",
    tagline: "Low stakes, maximum chaos.",
    countLabel: "10 prompts",
    icon: "🤪",
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

class DrawRoomServer {
  constructor() {
    this.rooms = new Map();
    this.loadFromDisk();
    this.cleanupInterval = setInterval(() => this.cleanupExpiredRooms(), 10 * 60 * 1000).unref();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        const list = JSON.parse(raw);
        const now = Date.now();
        const TTL = 3 * 60 * 60 * 1000;
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item?.code && (now - Number(item.lastActivity || 0) < TTL)) {
              this.rooms.set(item.code, {
                code: item.code,
                createdAt: Number(item.createdAt) || now,
                lastActivity: Number(item.lastActivity) || now,
                participants: new Map(),
                sseClients: new Set(),
                state: {
                  stage: "lobby",
                  selectedPack: "memories",
                  roundsTotal: 3,
                  secondsPerDrawing: 120,
                  currentRound: 1,
                  currentPrompt: "The last time we laughed really hard",
                  timerRemaining: 120,
                  timerRunning: false,
                  matchStartedAt: null,
                  strokes: {},
                  roundHistory: [],
                  ...item.state
                }
              });
            }
          }
        }
      }
    } catch (e) {}
  }

  scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      try {
        const now = Date.now();
        const TTL = 3 * 60 * 60 * 1000;
        const out = [];
        for (const [code, room] of this.rooms.entries()) {
          if (now - (room.lastActivity || 0) < TTL) {
            out.push({
              code,
              createdAt: room.createdAt,
              lastActivity: room.lastActivity,
              state: {
                ...room.state,
                timerRunning: false
              }
            });
          }
        }
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(out));
      } catch (e) {}
    }, 1000).unref();
  }

  getOrCreateRoom(code) {
    const roomCode = String(code || "").toUpperCase().trim();
    if (!this.rooms.has(roomCode)) {
      this.rooms.set(roomCode, {
        code: roomCode,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        participants: new Map(),
        sseClients: new Set(),
        timerInterval: null,
        usedPrompts: new Set(),
        state: {
          stage: "lobby",
          selectedPack: "animals",
          roundsTotal: 3,
          secondsPerDrawing: 120,
          currentRound: 1,
          currentPrompt: "",
          timerRemaining: 120,
          timerRunning: false,
          matchStartedAt: null,
          profiles: {},
          strokes: {},
          roundHistory: []
        }
      });
      this.scheduleSave();
    }
    const room = this.rooms.get(roomCode);
    if (!room.sseClients) room.sseClients = new Set();
    if (!room.usedPrompts) room.usedPrompts = new Set();
    room.lastActivity = Date.now();
    return room;
  }

  cleanupExpiredRooms() {
    const now = Date.now();
    const TTL = 3 * 60 * 60 * 1000;
    let changed = false;
    for (const [code, room] of this.rooms.entries()) {
      if (room.participants.size === 0 && (!room.sseClients || room.sseClients.size === 0) && now - room.lastActivity > TTL) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        this.rooms.delete(code);
        changed = true;
      }
    }
    if (changed) this.scheduleSave();
  }

  broadcast(room, data, sender = null) {
    const msg = JSON.stringify(data);
    for (const [client, meta] of room.participants.entries()) {
      if (client !== sender && meta?.id !== sender && client.readyState === 1) {
        try { client.send(msg); } catch (e) {}
      }
    }
    if (room.sseClients) {
      for (const sseRes of room.sseClients) {
        if (sseRes !== sender && sseRes._participantId !== sender) {
          try { sseRes.write(`data: ${msg}\n\n`); } catch (e) {}
        }
      }
    }
  }

  broadcastAll(room, data) {
    const msg = JSON.stringify(data);
    for (const client of room.participants.keys()) {
      if (client.readyState === 1) {
        try { client.send(msg); } catch (e) {}
      }
    }
    if (room.sseClients) {
      for (const sseRes of room.sseClients) {
        try { sseRes.write(`data: ${msg}\n\n`); } catch (e) {}
      }
    }
  }

  getNextPrompt(room, packId) {
    const pack = PROMPT_PACKS[packId] || PROMPT_PACKS.animals;
    if (!room.usedPrompts) room.usedPrompts = new Set();
    const available = pack.prompts.filter(p => !room.usedPrompts.has(p));
    const pool = available.length > 0 ? available : pack.prompts;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    room.usedPrompts.add(chosen);
    return chosen;
  }

  startRoundTimer(room) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    room.state.timerRunning = true;
    room.state.timerRemaining = room.state.secondsPerDrawing;

    room.timerInterval = setInterval(() => {
      if (!room.state.timerRunning) {
        clearInterval(room.timerInterval);
        return;
      }
      room.state.timerRemaining -= 1;
      this.broadcastAll(room, {
        type: "TIMER_TICK",
        secondsRemaining: room.state.timerRemaining
      });

      if (room.state.timerRemaining <= 0) {
        clearInterval(room.timerInterval);
        room.state.timerRunning = false;
        this.onRoundTimeExpired(room);
      }
    }, 1000);
  }

  onRoundTimeExpired(room) {
    const roundItem = {
      round: room.state.currentRound,
      prompt: room.state.currentPrompt,
      pack: room.state.selectedPack,
      strokes: JSON.parse(JSON.stringify(room.state.strokes || {}))
    };
    if (!Array.isArray(room.state.roundHistory)) room.state.roundHistory = [];
    room.state.roundHistory.push(roundItem);

    if (room.state.currentRound < room.state.roundsTotal) {
      room.state.stage = "round_review";
      this.scheduleSave();
      this.broadcastAll(room, {
        type: "ROUND_COMPLETED",
        round: room.state.currentRound,
        totalRounds: room.state.roundsTotal,
        historyItem: roundItem,
        state: room.state
      });
    } else {
      room.state.stage = "match_complete";
      this.scheduleSave();
      this.broadcastAll(room, {
        type: "MATCH_COMPLETED",
        totalRounds: room.state.roundsTotal,
        roundHistory: room.state.roundHistory,
        state: room.state
      });
    }
  }

  registerSseClient(req, res, roomCode, participantId, participantName) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*"
    });

    const code = String(roomCode || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 16).trim();
    const currentRoom = this.getOrCreateRoom(code);

    const totalCount = currentRoom.participants.size + currentRoom.sseClients.size;
    let isExisting = false;
    for (const c of currentRoom.sseClients) {
      if (c._participantId === participantId) isExisting = true;
    }

    if (totalCount >= 2 && !isExisting) {
      res.write(`data: ${JSON.stringify({ type: "ROOM_FULL", error: "Room has reached max capacity of 2 partners." })}\n\n`);
      return res.end();
    }

    const role = (currentRoom.participants.size === 0 && currentRoom.sseClients.size === 0) ? "host" : "guest";
    const name = sanitizeStr(participantName, 24) || (role === "host" ? "Partner 1" : "Partner 2");
    res._participantId = participantId;
    res._participantName = name;
    res._role = role;

    currentRoom.sseClients.add(res);

    if (currentRoom.participants.size + currentRoom.sseClients.size >= 2 && currentRoom.state.stage === "lobby") {
      currentRoom.state.stage = "profile_setup";
    }

    res.write(`data: ${JSON.stringify({
      type: "ROOM_JOINED",
      roomCode: code,
      role,
      participantId,
      participantCount: currentRoom.participants.size + currentRoom.sseClients.size,
      state: currentRoom.state,
      promptPacks: PROMPT_PACKS,
      participants: [
        ...Array.from(currentRoom.participants.values()),
        ...Array.from(currentRoom.sseClients).map(c => ({ id: c._participantId, name: c._participantName, role: c._role }))
      ]
    })}\n\n`);

    this.broadcast(currentRoom, {
      type: "PARTNER_JOINED",
      partner: { id: participantId, name, role },
      stage: currentRoom.state.stage,
      participantCount: currentRoom.participants.size + currentRoom.sseClients.size
    }, res);

    const pingTimer = setInterval(() => {
      try { res.write(": ping\n\n"); } catch (e) { clearInterval(pingTimer); }
    }, 15000);

    req.on("close", () => {
      clearInterval(pingTimer);
      currentRoom.sseClients.delete(res);
      this.broadcast(currentRoom, {
        type: "PARTNER_LEFT",
        partnerId: participantId,
        partnerName: name,
        remainingCount: currentRoom.participants.size + currentRoom.sseClients.size
      });
      if (currentRoom.participants.size === 0 && currentRoom.sseClients.size === 0) {
        currentRoom.lastActivity = Date.now();
      }
    });
  }

  handleMessage(currentRoom, participantId, participantName, data, sender = null) {
    if (!currentRoom) return;
    currentRoom.lastActivity = Date.now();
    const { type, payload } = data;

    // 0. Live Remote Cursor Move & Click
    if (type === "CURSOR_MOVE") {
      const x = Math.max(0, Math.min(1, Number(payload?.x) || 0));
      const y = Math.max(0, Math.min(1, Number(payload?.y) || 0));
      const profile = currentRoom.state.profiles?.[participantId];
      const name = profile?.name || data.senderName || participantName || "Partner";
      const sex = profile?.sex || "female";
      this.broadcast(currentRoom, {
        type: "REMOTE_CURSOR",
        x,
        y,
        senderId: participantId,
        senderName: name,
        sex
      }, sender);
      return;
    }

    if (type === "CURSOR_CLICK") {
      const x = Math.max(0, Math.min(1, Number(payload?.x) || 0));
      const y = Math.max(0, Math.min(1, Number(payload?.y) || 0));
      const profile = currentRoom.state.profiles?.[participantId];
      const name = profile?.name || data.senderName || participantName || "Partner";
      const sex = profile?.sex || "female";
      this.broadcast(currentRoom, {
        type: "REMOTE_CLICK",
        x,
        y,
        senderId: participantId,
        senderName: name,
        sex
      }, sender);
      return;
    }

    // 1. Submit Name and Sex Profile (Once both join)
    if (type === "SUBMIT_PROFILE") {
      const name = sanitizeStr(payload?.name, 24) || "Partner";
      const sex = payload?.sex === "male" ? "male" : "female";
      if (!currentRoom.state.profiles) currentRoom.state.profiles = {};
      currentRoom.state.profiles[participantId] = {
        name,
        sex,
        ready: true
      };

      for (const [client, meta] of currentRoom.participants.entries()) {
        if (meta.id === participantId) meta.name = name;
      }
      for (const client of currentRoom.sseClients) {
        if (client._participantId === participantId) client._participantName = name;
      }

      this.scheduleSave();

      this.broadcastAll(currentRoom, {
        type: "PROFILE_UPDATED",
        participantId,
        profile: currentRoom.state.profiles[participantId],
        profiles: currentRoom.state.profiles
      });

      const totalParticipants = currentRoom.participants.size + (currentRoom.sseClients?.size || 0);
      const readyProfiles = Object.values(currentRoom.state.profiles).filter(p => p.ready);

      if (currentRoom.state.stage === "profile_setup" && readyProfiles.length >= Math.max(1, totalParticipants)) {
        currentRoom.state.stage = "pack_select";
        this.scheduleSave();
        this.broadcastAll(currentRoom, {
          type: "PROFILES_COMPLETED",
          stage: "pack_select",
          profiles: currentRoom.state.profiles
        });
      }
      return;
    }

    // 2. Pack Selection
    if (type === "SELECT_PACK") {
      const packId = sanitizeStr(payload?.packId || payload, 32);
      if (PROMPT_PACKS[packId]) {
        currentRoom.state.selectedPack = packId;
        this.scheduleSave();
        this.broadcastAll(currentRoom, {
          type: "PACK_SELECTED",
          packId,
          actorId: participantId,
          actorName: participantName
        });
      }
      return;
    }

    // 3. Navigation between setup stages
    if (type === "SET_STAGE") {
      const stage = sanitizeStr(payload?.stage || payload, 32);
      const VALID_STAGES = new Set(["lobby", "profile_setup", "pack_select", "match_setup", "drawing", "round_review", "match_complete"]);
      if (VALID_STAGES.has(stage)) {
        currentRoom.state.stage = stage;
        this.scheduleSave();
        this.broadcastAll(currentRoom, {
          type: "STAGE_CHANGED",
          stage,
          actorId: participantId,
          actorName: participantName,
          state: currentRoom.state
        });
      }
      return;
    }

    // 3. Match Config: Rounds & Seconds Per Drawing
    if (type === "SET_MATCH_CONFIG") {
      if (payload?.roundsTotal !== undefined) {
        const rounds = Number(payload.roundsTotal);
        if ([3, 4, 5, 7].includes(rounds)) currentRoom.state.roundsTotal = rounds;
      }
      if (payload?.secondsPerDrawing !== undefined) {
        const secs = Number(payload.secondsPerDrawing);
        if ([60, 90, 120, 180].includes(secs)) {
          currentRoom.state.secondsPerDrawing = secs;
          currentRoom.state.timerRemaining = secs;
        }
      }
      this.scheduleSave();
      this.broadcastAll(currentRoom, {
        type: "MATCH_CONFIG_UPDATED",
        roundsTotal: currentRoom.state.roundsTotal,
        secondsPerDrawing: currentRoom.state.secondsPerDrawing,
        actorId: participantId,
        actorName: participantName
      });
      return;
    }

    // 4. Start Match Click (Transitions to drawing stage, timer pauses until user clicks start on draw page)
    if (type === "START_MATCH") {
      currentRoom.state.stage = "drawing";
      currentRoom.state.currentRound = 1;
      currentRoom.state.roundHistory = [];
      currentRoom.state.strokes = {};
      currentRoom.usedPrompts = new Set();
      currentRoom.state.currentPrompt = this.getNextPrompt(currentRoom, currentRoom.state.selectedPack);
      currentRoom.state.matchStartedAt = Date.now();
      currentRoom.state.timerRunning = false;
      currentRoom.state.timerRemaining = currentRoom.state.secondsPerDrawing;
      if (currentRoom.timerInterval) {
        clearInterval(currentRoom.timerInterval);
        currentRoom.timerInterval = null;
      }

      this.scheduleSave();

      this.broadcastAll(currentRoom, {
        type: "MATCH_STARTED",
        stage: "drawing",
        currentRound: currentRoom.state.currentRound,
        roundsTotal: currentRoom.state.roundsTotal,
        secondsPerDrawing: currentRoom.state.secondsPerDrawing,
        currentPrompt: currentRoom.state.currentPrompt,
        timerRunning: false,
        timerRemaining: currentRoom.state.secondsPerDrawing,
        actorId: participantId,
        actorName: participantName
      });
      return;
    }

    // 5. Start Round Timer (Explicit click on draw page by one of the users)
    if (type === "START_ROUND_TIMER") {
      if (!currentRoom.state.timerRunning && currentRoom.state.stage === "drawing") {
        this.startRoundTimer(currentRoom);
        this.scheduleSave();

        this.broadcastAll(currentRoom, {
          type: "ROUND_TIMER_STARTED",
          timerRemaining: currentRoom.state.timerRemaining,
          actorId: participantId,
          actorName: participantName
        });
      }
      return;
    }

    // 6. Next Round (after round review, pauses timer until start clicked on draw page)
    if (type === "NEXT_ROUND") {
      currentRoom.state.currentRound += 1;
      currentRoom.state.stage = "drawing";
      currentRoom.state.strokes = {};
      currentRoom.state.currentPrompt = this.getNextPrompt(currentRoom, currentRoom.state.selectedPack);
      currentRoom.state.timerRunning = false;
      currentRoom.state.timerRemaining = currentRoom.state.secondsPerDrawing;
      if (currentRoom.timerInterval) {
        clearInterval(currentRoom.timerInterval);
        currentRoom.timerInterval = null;
      }

      this.scheduleSave();

      this.broadcastAll(currentRoom, {
        type: "ROUND_STARTED",
        currentRound: currentRoom.state.currentRound,
        roundsTotal: currentRoom.state.roundsTotal,
        secondsPerDrawing: currentRoom.state.secondsPerDrawing,
        currentPrompt: currentRoom.state.currentPrompt,
        timerRunning: false,
        timerRemaining: currentRoom.state.secondsPerDrawing,
        actorId: participantId,
        actorName: participantName
      });
      return;
    }

    // 6. Play Again / Reset Match
    if (type === "RESTART_MATCH") {
      if (currentRoom.timerInterval) clearInterval(currentRoom.timerInterval);
      currentRoom.state.stage = "pack_select";
      currentRoom.state.currentRound = 1;
      currentRoom.state.roundHistory = [];
      currentRoom.state.strokes = {};
      currentRoom.state.timerRunning = false;
      currentRoom.usedPrompts = new Set();

      this.scheduleSave();
      this.broadcastAll(currentRoom, {
        type: "MATCH_RESTARTED",
        stage: "pack_select",
        actorId: participantId,
        actorName: participantName
      });
      return;
    }

    // 7. Drawing Stroke Sync
    if (type === "DRAW_STROKE") {
      const stroke = payload?.stroke;
      if (stroke && Array.isArray(stroke.points) && stroke.points.length > 0) {
        if (!currentRoom.state.strokes) currentRoom.state.strokes = {};
        if (!currentRoom.state.strokes[participantId]) currentRoom.state.strokes[participantId] = [];

        const parseCoord = (p) => {
          const x = (typeof p?.x === "number") ? p.x : (Number(p?.[0]) || 0);
          const y = (typeof p?.y === "number") ? p.y : (Number(p?.[1]) || 0);
          return [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))];
        };

        const safeStroke = {
          color: sanitizeStr(stroke.color, 16) || "#111111",
          size: Math.min(Math.max(Number(stroke.size) || 4, 1), 40),
          points: stroke.points.slice(0, 400).map(parseCoord)
        };

        currentRoom.state.strokes[participantId].push(safeStroke);
        if (currentRoom.state.strokes[participantId].length > 600) {
          currentRoom.state.strokes[participantId].shift();
        }

        this.broadcast(currentRoom, {
          type: "REMOTE_DRAW_STROKE",
          drawerId: participantId,
          drawerName: participantName,
          stroke: safeStroke
        }, sender);
      }
      return;
    }

    // 8. Drawing Clear
    if (type === "DRAW_CLEAR") {
      if (currentRoom.state.strokes && currentRoom.state.strokes[participantId]) {
        currentRoom.state.strokes[participantId] = [];
      }
      this.broadcast(currentRoom, {
        type: "REMOTE_DRAW_CLEAR",
        drawerId: participantId,
        drawerName: participantName
      }, sender);
      return;
    }

    // 9. Poke Action
    if (type === "SEND_POKE") {
      const emoji = sanitizeStr(payload?.emoji, 10) || "👉";
      const x = Math.max(0, Math.min(1, Number(payload?.x ?? 0.5)));
      const y = Math.max(0, Math.min(1, Number(payload?.y ?? 0.5)));

      this.broadcastAll(currentRoom, {
        type: "POKE_EVENT",
        senderId: participantId,
        senderName: participantName,
        emoji,
        x,
        y,
        timestamp: Date.now()
      });
      return;
    }

    // Generic broadcast fallback
    this.broadcast(currentRoom, { type, payload, senderId: participantId }, sender);
  }

  attach(server, path = "/draw-ws") {
    if (!WebSocketServer) {
      console.warn("⚠️ [Draw] WebSocketServer skipped ('ws' module not installed). HTTP SSE fallback active.");
      return null;
    }
    const wss = new WebSocketServer({ noServer: true, maxPayload: 2 * 1024 * 1024 });

    server.on("upgrade", (req, socket, head) => {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      if (url.pathname === path) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit("connection", ws, req);
        });
      }
    });

    wss.on("connection", (ws) => {
      let currentRoom = null;
      let participantId = "user_" + Math.random().toString(36).slice(2, 9);
      let participantName = "Partner";
      let msgCount = 0;
      let windowStart = Date.now();

      ws.on("message", (raw) => {
        try {
          const now = Date.now();
          if (now - windowStart > 1000) { windowStart = now; msgCount = 0; }
          if (++msgCount > 100) return;

          const data = JSON.parse(raw);
          const { type, roomCode, payload } = data;

          if (type === "JOIN_ROOM") {
            const code = (roomCode || payload?.roomCode || "").toString().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 16).trim();
            if (!code) return;

            currentRoom = this.getOrCreateRoom(code);
            if (payload?.participantId) {
              participantId = sanitizeStr(payload.participantId, 32);
              for (const [prevWs, meta] of currentRoom.participants.entries()) {
                if (meta.id === participantId && prevWs !== ws) {
                  try { prevWs.terminate(); } catch (e) {}
                  currentRoom.participants.delete(prevWs);
                }
              }
            }
            const activeCount = currentRoom.participants.size + (currentRoom.sseClients?.size || 0);
            if (activeCount >= 2 && !currentRoom.participants.has(ws)) {
              ws.send(JSON.stringify({ type: "ROOM_FULL", error: "Room has reached max capacity of 2 partners." }));
              return;
            }

            const role = activeCount === 0 ? "host" : "guest";
            participantName = sanitizeStr(payload?.name, 24) || (role === "host" ? "Partner 1" : "Partner 2");
            currentRoom.participants.set(ws, { id: participantId, name: participantName, role });

            if (currentRoom.participants.size + (currentRoom.sseClients?.size || 0) >= 2 && currentRoom.state.stage === "lobby") {
              currentRoom.state.stage = "profile_setup";
            }

            ws.send(JSON.stringify({
              type: "ROOM_JOINED",
              roomCode: code,
              role,
              participantId,
              participantCount: currentRoom.participants.size + (currentRoom.sseClients?.size || 0),
              state: currentRoom.state,
              promptPacks: PROMPT_PACKS,
              participants: Array.from(currentRoom.participants.values())
            }));

            this.broadcast(currentRoom, {
              type: "PARTNER_JOINED",
              partner: { id: participantId, name: participantName, role },
              stage: currentRoom.state.stage,
              participantCount: currentRoom.participants.size + (currentRoom.sseClients?.size || 0)
            }, ws);

            return;
          }

          this.handleMessage(currentRoom, participantId, participantName, data, ws);
        } catch (err) {
          console.warn("Draw WS Message Parse Error:", err.message);
        }
      });

      ws.on("close", () => {
        if (currentRoom) {
          currentRoom.participants.delete(ws);
          this.broadcast(currentRoom, {
            type: "PARTNER_LEFT",
            partnerId: participantId,
            partnerName: participantName,
            remainingCount: currentRoom.participants.size + (currentRoom.sseClients?.size || 0)
          });
          if (currentRoom.participants.size === 0) {
            currentRoom.lastActivity = Date.now();
          }
        }
      });
    });

    console.log(`✓ Draw Realtime WebSocket attached on path '${path}'`);
    return wss;
  }
}

const drawRooms = new DrawRoomServer();

module.exports = {
  drawRooms,
  PROMPT_PACKS,
  setupDrawWebSocket: (server, path) => drawRooms.attach(server, path)
};
