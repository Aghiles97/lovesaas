/**
 * ============================================================================
 * PARTNER ROOM ENGINE (Shared 2-Partner Realtime Game Core)
 * ============================================================================
 * Purpose:
 *   Universal, zero-boilerplate 2-partner realtime connection engine for
 *   couple/multiplayer mini-games on the SaaS platform (e.g. Draw, Photobooth,
 *   Puzzle, Tic-Tac-Toe, Trivia, Crossword, Card Battles, etc.).
 *
 * Capabilities:
 *   1. Hybrid Transport: Primary WebSocket (/ws/games/:game) with seamless
 *      automatic fallback to HTTP SSE (/events) + HTTP POST (/messages).
 *   2. Strict 2-Partner Capacity: Automatic Host (first) vs Guest (second)
 *      assignment. Enforces ROOM_FULL when 2 slots are taken.
 *   3. Session & Reconnect Resilience: Recovers session via `participantId`.
 *      Grace timeout for mobile page backgrounding/refresh without kicking player.
 *   4. Ephemeral Realtime Primitives: Normalized remote cursor (CURSOR_MOVE),
 *      remote clicks (CURSOR_CLICK), heartbeats/pings, presence events.
 *   5. Persistence & Garbage Collection: Atomic debounced disk persistence
 *      to data/<game>_rooms.json with 3-hour TTL auto-cleanup.
 *   6. Pluggable Domain State Reducer: Each game provides `initialState` and
 *      an `onAction(room, action, meta)` hook. 0 networking boilerplate needed.
 *
 * Instructions for Future Agents/Conversations:
 *   See docs/PARTNER_GAMES_ENGINE.md for step-by-step instructions on creating Game 3.
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");

let WebSocketServer = null;
try {
  ({ WebSocketServer } = require("ws"));
} catch (e) {
  console.warn("⚠️ [PartnerEngine] 'ws' package not found. Realtime will use HTTP SSE fallback.");
}

const sanitizeStr = (s, len = 80) => String(s || "").replace(/<[^>]*>/g, "").slice(0, len).trim();

// Global registry of all registered games
const GAME_REGISTRY = new Map();

class PartnerRoomEngine {
  /**
   * @param {Object} options
   * @param {string} options.gameId - Unique game key (e.g. 'puzzle', 'tictactoe', 'trivia')
   * @param {number} [options.maxParticipants=2] - Maximum simultaneous partners per room
   * @param {number} [options.ttlMs=10800000] - Room expiration time in ms (default: 3 hours)
   * @param {string} [options.dataFile] - Path to JSON disk persistence file
   * @param {Object|Function} [options.initialState={}] - Initial game-specific state
   * @param {Function} [options.onAction] - Domain action reducer: (room, { type, payload }, meta) => result
   * @param {Function} [options.onJoin] - Hook called when a partner joins: (room, partnerMeta) => void
   * @param {Function} [options.onLeave] - Hook called when a partner leaves: (room, partnerId) => void
   */
  constructor(options = {}) {
    if (!options.gameId) throw new Error("PartnerRoomEngine requires options.gameId");
    this.gameId = options.gameId.toLowerCase().trim();
    this.maxParticipants = options.maxParticipants || 2;
    this.ttlMs = options.ttlMs || 3 * 60 * 60 * 1000;
    this.dataFile = options.dataFile || path.join(__dirname, `../../data/${this.gameId}_rooms.json`);
    this.getInitialState = typeof options.initialState === "function" 
      ? options.initialState 
      : () => JSON.parse(JSON.stringify(options.initialState || {}));
    this.onAction = options.onAction || null;
    this.onJoin = options.onJoin || null;
    this.onLeave = options.onLeave || null;

    this.rooms = new Map();
    this.saveTimer = null;
    this.wss = null;

    this.loadFromDisk();
    this.cleanupInterval = setInterval(() => this.cleanupExpiredRooms(), 10 * 60 * 1000).unref();
  }

  // --- Static Registry & Dispatchers ---

  /**
   * Register a new game engine instance into the global platform registry.
   */
  static register(options) {
    const engine = new PartnerRoomEngine(options);
    GAME_REGISTRY.set(engine.gameId, engine);
    return engine;
  }

  /**
   * Retrieve a registered game engine by its gameId.
   */
  static getGame(gameId) {
    if (!gameId) return null;
    return GAME_REGISTRY.get(gameId.toLowerCase().trim()) || null;
  }

  /**
   * List all registered game engines.
   */
  static listGames() {
    return Array.from(GAME_REGISTRY.keys());
  }

  /**
   * Generic HTTP route dispatcher for all registered partner games.
   * Handles:
   *   - GET  /api/games/:gameId/rooms/:code/events   (SSE stream)
   *   - POST /api/games/:gameId/rooms/:code/messages (HTTP action dispatch)
   *   - GET  /api/games/:gameId/rooms/:code          (Room metadata status)
   *
   * Returns true if request was handled, false otherwise.
   */
  static async handleHttpRoute(req, res, pathname, method, parsedUrl, parseJsonBody, sendJson) {
    if (!pathname.startsWith("/api/games/")) return false;

    const cleanPath = pathname.replace(/\/+$/, "");
    const segments = cleanPath.replace(/^\/api\/games\//, "").split("/");
    const gameId = (segments[0] || "").toLowerCase();
    const engine = GAME_REGISTRY.get(gameId);
    if (!engine) return false;

    // Pattern: /api/games/:gameId/rooms/:code/events
    if (segments[1] === "rooms" && segments[3] === "events" && method === "GET") {
      const roomCode = (segments[2] || "").toUpperCase().trim();
      const participantId = parsedUrl.query?.id || ("p_" + Math.random().toString(36).slice(2, 9));
      const participantName = parsedUrl.query?.name || "Partner";
      engine.registerSseClient(req, res, roomCode, participantId, participantName);
      return true;
    }

    // Pattern: /api/games/:gameId/rooms/:code/messages
    if (segments[1] === "rooms" && segments[3] === "messages" && method === "POST") {
      const roomCode = (segments[2] || "").toUpperCase().trim();
      try {
        const body = await parseJsonBody(req);
        const room = engine.getOrCreateRoom(roomCode);
        const senderId = body.senderId || "anon";
        const senderName = body.senderName || "Partner";
        engine.handleMessage(room, senderId, senderName, body, senderId);
        sendJson(res, 200, { ok: true });
      } catch (err) {
        sendJson(res, 400, { error: err.message || "Invalid JSON" });
      }
      return true;
    }

    // Pattern: /api/games/:gameId/rooms/:code
    if (segments[1] === "rooms" && segments[2] && !segments[3] && method === "GET") {
      const roomCode = (segments[2] || "").toUpperCase().trim();
      const room = engine.rooms.get(roomCode);
      sendJson(res, 200, {
        exists: !!room,
        gameId,
        code: roomCode,
        participants: room ? (room.participants.size + (room.sseClients?.size || 0)) : 0,
        maxParticipants: engine.maxParticipants,
        state: room ? room.state : null
      });
      return true;
    }

    return false;
  }

  /**
   * Attaches WebSocket upgrade listeners for all registered game engines.
   * Routes /ws/games/:gameId -> specific game engine.
   */
  static attachAll(server) {
    if (!WebSocketServer) return;

    server.on("upgrade", (req, socket, head) => {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const pathname = parsedUrl.pathname;

      if (!pathname.startsWith("/ws/games/")) return;
      const gameId = pathname.replace(/^\/ws\/games\//, "").split("/")[0].toLowerCase();
      const engine = GAME_REGISTRY.get(gameId);

      if (engine) {
        const wss = engine.initWebSocketServer(server);
        if (wss) {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
          });
        }
      }
    });
  }

  // --- Persistence & Lifecycle ---

  loadFromDisk() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, "utf8");
        const list = JSON.parse(raw);
        const now = Date.now();
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item?.code && (now - Number(item.lastActivity || 0) < this.ttlMs)) {
              this.rooms.set(item.code, {
                code: item.code,
                hostId: item.hostId || null,
                createdAt: Number(item.createdAt) || now,
                lastActivity: Number(item.lastActivity) || now,
                participants: new Map(),
                sseClients: new Set(),
                disconnectTimeouts: new Map(),
                state: {
                  ...this.getInitialState(),
                  ...(item.state || {})
                }
              });
            }
          }
        }
      }
    } catch (e) {
      // Non-fatal disk read issue
    }
  }

  scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      try {
        const now = Date.now();
        const out = [];
        for (const [code, room] of this.rooms.entries()) {
          if (now - (room.lastActivity || 0) < this.ttlMs) {
            out.push({
              code,
              hostId: room.hostId || null,
              createdAt: room.createdAt,
              lastActivity: room.lastActivity,
              state: room.state
            });
          }
        }
        const dir = path.dirname(this.dataFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.dataFile, JSON.stringify(out));
      } catch (e) {}
    }, 1000).unref();
  }

  cleanupExpiredRooms() {
    const now = Date.now();
    let changed = false;
    for (const [code, room] of this.rooms.entries()) {
      const activeCount = room.participants.size + (room.sseClients?.size || 0);
      if (activeCount === 0 && (now - room.lastActivity > this.ttlMs)) {
        if (room.disconnectTimeouts) {
          for (const timer of room.disconnectTimeouts.values()) clearTimeout(timer);
        }
        this.rooms.delete(code);
        changed = true;
      }
    }
    if (changed) this.scheduleSave();
  }

  // --- Room Management & Broadcasting ---

  getOrCreateRoom(code) {
    const roomCode = String(code || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 16).trim();
    if (!roomCode) throw new Error("Invalid room code");

    if (!this.rooms.has(roomCode)) {
      this.rooms.set(roomCode, {
        code: roomCode,
        hostId: null,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        participants: new Map(),
        sseClients: new Set(),
        disconnectTimeouts: new Map(),
        state: {
          ...this.getInitialState(),
          profiles: {}
        }
      });
      this.scheduleSave();
    }
    const room = this.rooms.get(roomCode);
    if (!room.sseClients) room.sseClients = new Set();
    if (!room.disconnectTimeouts) room.disconnectTimeouts = new Map();
    room.lastActivity = Date.now();
    return room;
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

  // --- HTTP SSE Registration ---

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

    // Check if re-connecting participant
    let isExisting = false;
    for (const c of currentRoom.sseClients) {
      if (c._participantId === participantId) isExisting = true;
    }
    for (const meta of currentRoom.participants.values()) {
      if (meta.id === participantId) isExisting = true;
    }

    const totalCount = currentRoom.participants.size + currentRoom.sseClients.size;
    if (totalCount >= this.maxParticipants && !isExisting) {
      res.write(`data: ${JSON.stringify({ type: "ROOM_FULL", error: `Room has reached max capacity of ${this.maxParticipants} partners.` })}\n\n`);
      return res.end();
    }

    if (!currentRoom.hostId) currentRoom.hostId = participantId;
    const role = (currentRoom.hostId === participantId) ? "host" : "guest";
    const name = sanitizeStr(participantName, 24) || (role === "host" ? "Partner 1" : "Partner 2");

    res._participantId = participantId;
    res._participantName = name;
    res._role = role;

    currentRoom.sseClients.add(res);

    // Send initial snapshot
    res.write(`data: ${JSON.stringify({
      type: "ROOM_JOINED",
      gameId: this.gameId,
      roomCode: code,
      role,
      participantId,
      participantCount: currentRoom.participants.size + currentRoom.sseClients.size,
      state: currentRoom.state,
      participants: [
        ...Array.from(currentRoom.participants.values()),
        ...Array.from(currentRoom.sseClients).map(c => ({ id: c._participantId, name: c._participantName, role: c._role }))
      ]
    })}\n\n`);

    this.broadcast(currentRoom, {
      type: "PARTNER_JOINED",
      partner: { id: participantId, name, role },
      participantCount: currentRoom.participants.size + currentRoom.sseClients.size
    }, res);

    if (this.onJoin) this.onJoin(currentRoom, { id: participantId, name, role });

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
      if (this.onLeave) this.onLeave(currentRoom, participantId);
      currentRoom.lastActivity = Date.now();
      this.scheduleSave();
    });
  }

  // --- WebSocket Setup ---

  initWebSocketServer(server = null) {
    if (!WebSocketServer) {
      console.warn(`⚠️ [${this.gameId}] WebSocketServer skipped ('ws' not installed). HTTP SSE fallback active.`);
      return null;
    }
    if (this.wss) return this.wss;

    this.wss = new WebSocketServer({ noServer: true, maxPayload: 2 * 1024 * 1024 });

    const pingInterval = setInterval(() => {
      for (const client of this.wss.clients) {
        if (client.isAlive === false) {
          try { client.terminate(); } catch (e) {}
          continue;
        }
        client.isAlive = false;
        try { client.ping(); } catch (e) { client.terminate(); }
      }
    }, 25000).unref();

    if (server) {
      server.on("close", () => clearInterval(pingInterval));
    }
    this.wss.on("close", () => clearInterval(pingInterval));

    this.wss.on("connection", (ws) => {
      ws.isAlive = true;
      ws.on("pong", () => { ws.isAlive = true; });

      let currentRoom = null;
      let participantId = "user_" + Math.random().toString(36).slice(2, 9);
      let participantName = "Partner";
      let msgCount = 0;
      let windowStart = Date.now();

      ws.on("message", (raw) => {
        try {
          // Rate-limit guard: max 100 msgs/second
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
              // Clean up any previous stale socket for same participant
              for (const [prevWs, meta] of currentRoom.participants.entries()) {
                if (meta.id === participantId && prevWs !== ws) {
                  try { prevWs.terminate(); } catch (e) {}
                  currentRoom.participants.delete(prevWs);
                }
              }
              for (const sse of currentRoom.sseClients) {
                if (sse._participantId === participantId) {
                  try { sse.end(); } catch (e) {}
                  currentRoom.sseClients.delete(sse);
                }
              }
            }

            // Clear disconnect timer if participant reconnected within grace window
            if (currentRoom.disconnectTimeouts?.has(participantId)) {
              clearTimeout(currentRoom.disconnectTimeouts.get(participantId));
              currentRoom.disconnectTimeouts.delete(participantId);
            }

            const activeIds = new Set([
              ...Array.from(currentRoom.participants.values()).map(p => p.id),
              ...Array.from(currentRoom.sseClients).map(c => c._participantId)
            ]);
            const isExisting = activeIds.has(participantId) || (currentRoom.hostId === participantId);

            if (activeIds.size >= this.maxParticipants && !isExisting) {
              ws.send(JSON.stringify({ type: "ROOM_FULL", error: `Room has reached max capacity of ${this.maxParticipants} partners.` }));
              return;
            }

            if (!currentRoom.hostId) currentRoom.hostId = participantId;
            const role = (currentRoom.hostId === participantId) ? "host" : "guest";
            participantName = sanitizeStr(payload?.name, 24) || (role === "host" ? "Partner 1" : "Partner 2");

            currentRoom.participants.set(ws, {
              id: participantId,
              name: participantName,
              role,
              joinedAt: Date.now()
            });

            ws.send(JSON.stringify({
              type: "ROOM_JOINED",
              gameId: this.gameId,
              roomCode: code,
              role,
              participantId,
              participantCount: currentRoom.participants.size + currentRoom.sseClients.size,
              state: currentRoom.state,
              participants: [
                ...Array.from(currentRoom.participants.values()),
                ...Array.from(currentRoom.sseClients).map(c => ({ id: c._participantId, name: c._participantName, role: c._role }))
              ]
            }));

            this.broadcast(currentRoom, {
              type: "PARTNER_JOINED",
              partner: { id: participantId, name: participantName, role },
              participantCount: currentRoom.participants.size + currentRoom.sseClients.size
            }, ws);

            if (this.onJoin) this.onJoin(currentRoom, { id: participantId, name: participantName, role });
            this.scheduleSave();
            return;
          }

          // Relay or process custom message
          this.handleMessage(currentRoom, participantId, participantName, data, ws);
        } catch (e) {}
      });

      ws.on("close", () => {
        if (!currentRoom) return;
        currentRoom.participants.delete(ws);

        // Don't broadcast PARTNER_LEFT if player is still connected via another active socket or SSE
        const stillConnected = Array.from(currentRoom.participants.values()).some(p => p.id === participantId) ||
                               Array.from(currentRoom.sseClients).some(c => c._participantId === participantId);
        if (stillConnected) return;

        if (!currentRoom.disconnectTimeouts) currentRoom.disconnectTimeouts = new Map();
        if (currentRoom.disconnectTimeouts.has(participantId)) {
          clearTimeout(currentRoom.disconnectTimeouts.get(participantId));
        }

        const graceTimer = setTimeout(() => {
          if (!currentRoom.disconnectTimeouts) return;
          currentRoom.disconnectTimeouts.delete(participantId);
          const reconnected = Array.from(currentRoom.participants.values()).some(p => p.id === participantId) ||
                              Array.from(currentRoom.sseClients).some(c => c._participantId === participantId);
          if (!reconnected) {
            const activeCount = currentRoom.participants.size + currentRoom.sseClients.size;
            this.broadcast(currentRoom, {
              type: "PARTNER_LEFT",
              partnerId,
              partnerName: participantName,
              remainingCount: activeCount
            });
            if (this.onLeave) this.onLeave(currentRoom, participantId);
            if (activeCount === 0) {
              currentRoom.lastActivity = Date.now();
            }
            this.scheduleSave();
          }
        }, 15000).unref();

        currentRoom.disconnectTimeouts.set(participantId, graceTimer);
      });
    });

    return this.wss;
  }

  attach(server, customPath = null) {
    const wss = this.initWebSocketServer(server);
    if (!wss) return null;
    const wsPath = customPath || `/ws/games/${this.gameId}`;

    server.on("upgrade", (req, socket, head) => {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      if (parsedUrl.pathname === wsPath) {
        wss.handleUpgrade(req, socket, head, (clientWs) => {
          wss.emit("connection", clientWs, req);
        });
      }
    });

    return wss;
  }

  // --- Message Reducer & Dispatcher ---

  handleMessage(currentRoom, participantId, participantName, data, sender = null) {
    if (!currentRoom) return;
    currentRoom.lastActivity = Date.now();
    const { type, payload } = data;
    const participantMeta = Array.from(currentRoom.participants.values()).find(p => p.id === participantId) 
      || { id: participantId, name: participantName, role: currentRoom.hostId === participantId ? "host" : "guest" };

    // Built-in Primitives: Remote Cursor
    if (type === "CURSOR_MOVE") {
      const x = Math.max(0, Math.min(1, Number(payload?.x) || 0));
      const y = Math.max(0, Math.min(1, Number(payload?.y) || 0));
      this.broadcast(currentRoom, {
        type: "REMOTE_CURSOR",
        x,
        y,
        senderId: participantId,
        senderName: participantName
      }, sender);
      return;
    }

    // Built-in Primitives: Remote Click / Tap
    if (type === "CURSOR_CLICK") {
      const x = Math.max(0, Math.min(1, Number(payload?.x) || 0));
      const y = Math.max(0, Math.min(1, Number(payload?.y) || 0));
      this.broadcast(currentRoom, {
        type: "REMOTE_CLICK",
        x,
        y,
        senderId: participantId,
        senderName: participantName
      }, sender);
      return;
    }

    // Built-in Primitives: Profile submission
    if (type === "PROFILE_SUBMIT") {
      if (!currentRoom.state.profiles) currentRoom.state.profiles = {};
      currentRoom.state.profiles[participantId] = {
        name: sanitizeStr(payload?.name, 24) || participantName,
        sex: sanitizeStr(payload?.sex, 16) || "cutie",
        avatar: sanitizeStr(payload?.avatar, 16) || "🐰",
        ready: true
      };
      this.broadcastAll(currentRoom, {
        type: "PROFILE_UPDATED",
        profiles: currentRoom.state.profiles
      });
      this.scheduleSave();
      return;
    }

    // Delegate to Game-Specific Action Handler if defined
    if (this.onAction) {
      try {
        const res = this.onAction(currentRoom, data, participantMeta);
        if (res && res.broadcastState) {
          this.broadcastAll(currentRoom, { type: "STATE_SYNC", state: currentRoom.state });
        }
        if (res && res.broadcast) {
          this.broadcast(currentRoom, res.broadcast, sender);
        }
        if (res && res.broadcastAll) {
          this.broadcastAll(currentRoom, res.broadcastAll);
        }
      } catch (err) {
        console.error(`[${this.gameId}] Error in onAction:`, err);
      }
    } else {
      // Default behavior: broadcast custom action to other partner
      this.broadcast(currentRoom, { type, payload, senderId: participantId }, sender);
    }

    this.scheduleSave();
  }
}

module.exports = {
  PartnerRoomEngine,
  GAME_REGISTRY
};
