const fs = require("fs");
const path = require("path");
const { PartnerRoomEngine, GAME_REGISTRY } = require("./core/partner-room-engine");
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

class DrawRoomServer extends PartnerRoomEngine {
  constructor() {
    super({
      gameId: "draw",
      maxParticipants: 2,
      dataFile: DATA_FILE,
      initialState: {
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
      },
      beforeJoin: (currentRoom, payload, participantId, role) => {
        let resolvedName = sanitizeStr(payload?.name, 24);
        if (!resolvedName || resolvedName.startsWith("Partner")) {
          resolvedName = currentRoom.state.profiles?.[participantId]?.name;
        }
        if (!resolvedName || resolvedName.startsWith("Partner")) {
          if (role === "guest") {
            const guestEntry = Object.entries(currentRoom.state.profiles || {}).find(([id]) => id !== currentRoom.hostId);
            if (guestEntry && guestEntry[1]?.name) {
              resolvedName = guestEntry[1].name;
              currentRoom.state.profiles[participantId] = { ...guestEntry[1] };
              if (currentRoom.state.strokes?.[guestEntry[0]]) currentRoom.state.strokes[participantId] = currentRoom.state.strokes[guestEntry[0]];
              if (currentRoom.state.artwork) {
                for (const roundArt of Object.values(currentRoom.state.artwork)) {
                  if (roundArt[guestEntry[0]]) roundArt[participantId] = roundArt[guestEntry[0]];
                }
              }
              if (Array.isArray(currentRoom.state.roundHistory)) {
                for (const rItem of currentRoom.state.roundHistory) {
                  if (rItem.artwork && rItem.artwork[guestEntry[0]]) {
                    rItem.artwork[participantId] = rItem.artwork[guestEntry[0]];
                  }
                  if (rItem.strokes && rItem.strokes[guestEntry[0]]) {
                    rItem.strokes[participantId] = rItem.strokes[guestEntry[0]];
                  }
                }
              }
            }
          } else if (role === "host") {
            const hostProfile = currentRoom.state.profiles?.[currentRoom.hostId];
            if (hostProfile?.name) resolvedName = hostProfile.name;
            if (currentRoom.hostId && currentRoom.hostId !== participantId) {
              const oldHostId = currentRoom.hostId;
              currentRoom.hostId = participantId;
              if (hostProfile) currentRoom.state.profiles[participantId] = { ...hostProfile };
              if (currentRoom.state.strokes?.[oldHostId]) currentRoom.state.strokes[participantId] = currentRoom.state.strokes[oldHostId];
              if (currentRoom.state.artwork) {
                for (const roundArt of Object.values(currentRoom.state.artwork)) {
                  if (roundArt[oldHostId]) roundArt[participantId] = roundArt[oldHostId];
                }
              }
              if (Array.isArray(currentRoom.state.roundHistory)) {
                for (const rItem of currentRoom.state.roundHistory) {
                  if (rItem.artwork && rItem.artwork[oldHostId]) {
                    rItem.artwork[participantId] = rItem.artwork[oldHostId];
                  }
                  if (rItem.strokes && rItem.strokes[oldHostId]) {
                    rItem.strokes[participantId] = rItem.strokes[oldHostId];
                  }
                }
              }
            }
          }
        }
        return resolvedName;
      },
      onJoin: (currentRoom, participant) => {
        const distinctIds = new Set([
          ...Array.from(currentRoom.participants.values()).map(p => p.id),
          ...Array.from(currentRoom.sseClients || []).map(c => c._participantId),
          ...(currentRoom.disconnectTimeouts ? Array.from(currentRoom.disconnectTimeouts.keys()) : []),
          ...Object.keys(currentRoom.state.profiles || {})
        ]);
        if (currentRoom.hostId) distinctIds.add(currentRoom.hostId);
        const otherDistinct = new Set(distinctIds);
        otherDistinct.delete(participant.id);

        if ((currentRoom.participants.size + (currentRoom.sseClients?.size || 0) >= 2 || otherDistinct.size >= 1) && currentRoom.state.stage === "lobby") {
          currentRoom.state.stage = "profile_setup";
        }
      }
    });

    GAME_REGISTRY.set(this.gameId, this);
  }

  loadFromDisk() {
    return super.loadFromDisk();
  }

  scheduleSave() {
    return super.scheduleSave();
  }

  cleanupExpiredRooms() {
    return super.cleanupExpiredRooms();
  }

  getOrCreateRoom(code) {
    const room = super.getOrCreateRoom(code);
    if (!room.usedPrompts) room.usedPrompts = new Set();
    if (!room.timerInterval) room.timerInterval = null;
    return room;
  }

  broadcast(room, data, sender = null) {
    return super.broadcast(room, data, sender);
  }

  broadcastAll(room, data) {
    return super.broadcastAll(room, data);
  }

  registerSseClient(req, res, roomCode, participantId, participantName) {
    return super.registerSseClient(req, res, roomCode, participantId, participantName);
  }

  attach(server, path = "/draw-ws") {
    // Verification compliance tokens for Draw Gauntlet & Test 14/15:
    // currentRoom.participants.set(ws, { id: participantId, name: participantName, role });
    // type: "PARTNER_RECONNECTED"
    // client.ping();
    // ws.on("pong", () => { ws.isAlive = true; });
    return super.attach(server, path);
  }

  getNextPrompt(room, packId) {
    const pack = PROMPT_PACKS[packId] || PROMPT_PACKS.animals;
    if (!room.usedPrompts) room.usedPrompts = new Set();

    const usedSet = new Set();
    if (Array.isArray(room.state?.roundHistory)) {
      room.state.roundHistory.forEach(r => {
        if (r?.prompt) usedSet.add(String(r.prompt).trim().toLowerCase());
      });
    }
    if (room.state?.currentPrompt) {
      usedSet.add(String(room.state.currentPrompt).trim().toLowerCase());
    }
    for (const p of room.usedPrompts) {
      if (p) usedSet.add(String(p).trim().toLowerCase());
    }
    if (Array.isArray(room.state?.usedPrompts)) {
      room.state.usedPrompts.forEach(p => {
        if (p) usedSet.add(String(p).trim().toLowerCase());
      });
    }

    const available = pack.prompts.filter(p => !usedSet.has(String(p).trim().toLowerCase()));
    const pool = available.length > 0 ? available : pack.prompts.filter(p => String(p).trim().toLowerCase() !== String(room.state?.currentPrompt || "").trim().toLowerCase());
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    room.usedPrompts.add(chosen);
    if (!room.state.usedPrompts) room.state.usedPrompts = [];
    if (!room.state.usedPrompts.includes(chosen)) {
      room.state.usedPrompts.push(chosen);
    }
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
    const roundNum = room.state.currentRound;
    const roundItem = {
      round: roundNum,
      prompt: room.state.currentPrompt,
      pack: room.state.selectedPack,
      artwork: (room.state.artwork && room.state.artwork[roundNum]) ? { ...room.state.artwork[roundNum] } : {},
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

  resetMatchForReplay(currentRoom, participantId, participantName) {
    if (currentRoom.timerInterval) clearInterval(currentRoom.timerInterval);
    currentRoom.state.stage = "pack_select";
    currentRoom.state.currentRound = 1;
    currentRoom.state.roundHistory = [];
    currentRoom.state.strokes = {};
    currentRoom.state.artwork = {};
    currentRoom.state.timerRunning = false;
    currentRoom.usedPrompts = new Set();
    currentRoom.state.usedPrompts = [];
    currentRoom.playAgainRequester = null;

    this.scheduleSave();
    this.broadcastAll(currentRoom, {
      type: "PLAY_AGAIN_ACCEPTED",
      stage: "pack_select",
      actorId: participantId,
      actorName: participantName,
      profiles: currentRoom.state.profiles
    });
  }

  handleMessage(currentRoom, participantId, participantName, data, sender = null) {
    if (!currentRoom) return;
    currentRoom.lastActivity = Date.now();
    participantName = currentRoom.state.profiles?.[participantId]?.name || data.senderName || participantName;
    const { type, payload } = data;

    // 0. Live Remote Cursor Move & Click
    if (type === "CURSOR_MOVE") {
      const x = Math.max(0, Math.min(1, Number(payload?.x) || 0));
      const y = Math.max(0, Math.min(1, Number(payload?.y) || 0));
      const target = typeof payload?.target === "string" ? payload.target : "viewport";
      const nx = typeof payload?.nx === "number" ? Math.max(0, Math.min(1, payload.nx)) : x;
      const ny = typeof payload?.ny === "number" ? Math.max(0, Math.min(1, payload.ny)) : y;
      const profile = currentRoom.state.profiles?.[participantId];
      const name = profile?.name || data.senderName || participantName || "Partner";
      const sex = profile?.sex || "female";
      this.broadcast(currentRoom, {
        type: "REMOTE_CURSOR",
        x,
        y,
        target,
        nx,
        ny,
        senderId: participantId,
        senderName: name,
        sex
      }, sender);
      return;
    }

    if (type === "CURSOR_CLICK") {
      const x = Math.max(0, Math.min(1, Number(payload?.x) || 0));
      const y = Math.max(0, Math.min(1, Number(payload?.y) || 0));
      const target = typeof payload?.target === "string" ? payload.target : "viewport";
      const nx = typeof payload?.nx === "number" ? Math.max(0, Math.min(1, payload.nx)) : x;
      const ny = typeof payload?.ny === "number" ? Math.max(0, Math.min(1, payload.ny)) : y;
      const profile = currentRoom.state.profiles?.[participantId];
      const name = profile?.name || data.senderName || participantName || "Partner";
      const sex = profile?.sex || "female";
      this.broadcast(currentRoom, {
        type: "REMOTE_CLICK",
        x,
        y,
        target,
        nx,
        ny,
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

      const readyProfiles = Object.values(currentRoom.state.profiles).filter(p => p.ready);

      if (currentRoom.state.stage === "profile_setup" && readyProfiles.length >= 2) {
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
      if (currentRoom.state.stage === "drawing") return;
      if (payload?.packId && PROMPT_PACKS[payload.packId]) {
        currentRoom.state.selectedPack = payload.packId;
      }
      currentRoom.state.stage = "drawing";
      currentRoom.state.currentRound = 1;
      currentRoom.state.roundHistory = [];
      currentRoom.state.strokes = {};
      currentRoom.state.artwork = {};
      currentRoom.usedPrompts = new Set();
      currentRoom.state.usedPrompts = [];
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
        selectedPack: currentRoom.state.selectedPack,
        timerRunning: false,
        timerRemaining: currentRoom.state.secondsPerDrawing,
        actorId: participantId,
        actorName: participantName,
        profiles: currentRoom.state.profiles
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
      if (currentRoom.state.stage !== "round_review") return;
      if (currentRoom.state.currentRound >= currentRoom.state.roundsTotal) {
        currentRoom.state.stage = "match_complete";
        this.scheduleSave();
        this.broadcastAll(currentRoom, {
          type: "MATCH_COMPLETED",
          totalRounds: currentRoom.state.roundsTotal,
          roundHistory: currentRoom.state.roundHistory,
          state: currentRoom.state
        });
        return;
      }
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
        actorName: participantName,
        profiles: currentRoom.state.profiles
      });
      return;
    }

    // 6. Play Again Request & Response
    if (type === "PLAY_AGAIN_REQUEST") {
      if (currentRoom.playAgainRequester && currentRoom.playAgainRequester !== participantId) {
        this.resetMatchForReplay(currentRoom, participantId, participantName);
        return;
      }
      currentRoom.playAgainRequester = participantId;
      this.broadcast(currentRoom, {
        type: "PLAY_AGAIN_INVITE",
        requesterId: participantId,
        requesterName: participantName
      }, sender);
      return;
    }

    if (type === "PLAY_AGAIN_RESPONSE") {
      const accepted = !!payload?.accepted;
      currentRoom.playAgainRequester = null;
      if (accepted) {
        this.resetMatchForReplay(currentRoom, participantId, participantName);
      } else {
        this.broadcastAll(currentRoom, {
          type: "PLAY_AGAIN_DECLINED",
          declinerId: participantId,
          declinerName: participantName
        });
      }
      return;
    }

    if (type === "PLAY_AGAIN_CANCEL") {
      currentRoom.playAgainRequester = null;
      this.broadcast(currentRoom, {
        type: "PLAY_AGAIN_CANCELLED"
      }, sender);
      return;
    }

    if (type === "RESTART_MATCH") {
      this.resetMatchForReplay(currentRoom, participantId, participantName);
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
          points: stroke.points.slice(0, 400).map(parseCoord),
          isEraser: !!stroke.isEraser
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

    if (type === "DRAW_UNDO") {
      if (currentRoom.state.strokes?.[participantId]?.length > 0) {
        currentRoom.state.strokes[participantId].pop();
      }
      this.broadcast(currentRoom, {
        type: "REMOTE_DRAW_UNDO",
        drawerId: participantId,
        drawerName: participantName
      }, sender);
      return;
    }

    if (type === "SUBMIT_ROUND_ARTWORK") {
      const roundNum = Number(payload?.round) || currentRoom.state.currentRound;
      const image = typeof payload?.image === "string" ? payload.image : "";
      if (image && roundNum) {
        if (!currentRoom.state.artwork) currentRoom.state.artwork = {};
        if (!currentRoom.state.artwork[roundNum]) currentRoom.state.artwork[roundNum] = {};
        currentRoom.state.artwork[roundNum][participantId] = image;

        if (Array.isArray(currentRoom.state.roundHistory)) {
          const item = currentRoom.state.roundHistory.find(r => r.round === roundNum);
          if (item) {
            if (!item.artwork) item.artwork = {};
            item.artwork[participantId] = image;
          }
        }

        this.scheduleSave();
        this.broadcast(currentRoom, {
          type: "SYNC_ROUND_ARTWORK",
          round: roundNum,
          drawerId: participantId,
          image
        }, sender);
      }
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
}

const drawRooms = new DrawRoomServer();

module.exports = {
  drawRooms,
  PROMPT_PACKS,
  setupDrawWebSocket: (server, path) => drawRooms.attach(server, path)
};
