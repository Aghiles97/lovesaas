let WebSocketServer = null;
try {
  ({ WebSocketServer } = require("ws"));
} catch (e) {
  console.warn("⚠️ [Photobooth] Package 'ws' not installed. WebSocket rooms disabled until npm install.");
}

const ALLOWED_FIELDS = new Set(["format", "style", "filter", "caption", "stage", "setupSubStep", "timerSeconds"]);
const sanitizeStr = (s, len = 80) => String(s || "").replace(/<[^>]*>/g, "").slice(0, len).trim();

class PhotoboothRoomServer {
  constructor() {
    this.rooms = new Map();
    this.cleanupInterval = setInterval(() => this.cleanupExpiredRooms(), 10 * 60 * 1000).unref();
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
        state: {
          stage: "lobby",
          setupSubStep: 1,
          format: "classic_3cut",
          style: "style_cyan_stars",
          filter: "vintage_90s",
          caption: "Together Forever ♡",
          timerSeconds: 3,
          selectedPhotos: [],
          retryCount: 0,
          maxRetries: 1,
          strokes: [],
          stickers: [],
          overlay: "none"
        }
      });
    }
    const room = this.rooms.get(roomCode);
    if (!room.sseClients) room.sseClients = new Set();
    room.lastActivity = Date.now();
    return room;
  }

  cleanupExpiredRooms() {
    const now = Date.now();
    const TTL = 3 * 60 * 60 * 1000;
    for (const [code, room] of this.rooms.entries()) {
      if (room.participants.size === 0 && (!room.sseClients || room.sseClients.size === 0) && now - room.lastActivity > TTL) {
        this.rooms.delete(code);
      }
    }
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

    res.write(`data: ${JSON.stringify({
      type: "ROOM_JOINED",
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

    const pingTimer = setInterval(() => {
      try { res.write(": ping\n\n"); } catch (e) { clearInterval(pingTimer); }
    }, 15000);

    req.on("close", () => {
      clearInterval(pingTimer);
      currentRoom.sseClients.delete(res);
      this.broadcast(currentRoom, {
        type: "PARTNER_LEFT",
        partnerId,
        partnerName: name,
        remainingCount: currentRoom.participants.size + currentRoom.sseClients.size
      });
      if (currentRoom.participants.size === 0 && currentRoom.sseClients.size === 0) {
        currentRoom.lastActivity = Date.now();
      }
    });
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

  handleMessage(currentRoom, participantId, participantName, data, sender = null) {
    if (!currentRoom) return;
    currentRoom.lastActivity = Date.now();
    const { type, payload } = data;

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

    if (type === "RESET_NEW_SESSION") {
      currentRoom.state.stage = "setup";
      currentRoom.state.setupSubStep = 1;
      currentRoom.state.selectedPhotos = [];
      currentRoom.state.strokes = [];
      currentRoom.state.stickers = [];
      currentRoom.state.retryCount = 0;
      this.broadcastAll(currentRoom, {
        type: "NEW_SESSION_SYNC",
        stage: "setup",
        setupSubStep: 1,
        actorId: participantId,
        actorName: participantName
      });
      return;
    }

    if (type === "STAGE_CHANGE" || type === "SET_STAGE") {
      const stage = sanitizeStr(payload?.stage || payload, 20);
      const VALID_STAGES = new Set(["welcome", "lobby", "setup", "capture", "select", "deco", "print"]);
      if (VALID_STAGES.has(stage)) {
        if (stage === "setup" && (currentRoom.state.stage === "print" || payload?.setupSubStep === 1)) {
          currentRoom.state.setupSubStep = 1;
          currentRoom.state.selectedPhotos = [];
          currentRoom.state.strokes = [];
          currentRoom.state.stickers = [];
          currentRoom.state.retryCount = 0;
        }
        currentRoom.state.stage = stage;
        this.broadcastAll(currentRoom, {
          type: "STAGE_CHANGED",
          stage,
          setupSubStep: currentRoom.state.setupSubStep,
          actorId: participantId,
          actorName: participantName
        });
      }
      return;
    }

    if (type === "ACTION_CLICK") {
      const { action, field, value } = payload || {};
      if (field && ALLOWED_FIELDS.has(field) && value !== undefined) {
        if (field === "setupSubStep") {
          currentRoom.state[field] = Math.min(3, Math.max(1, parseInt(value, 10) || 1));
        } else if (field === "timerSeconds") {
          currentRoom.state[field] = Math.max(0, parseInt(value, 10) || 0);
        } else {
          currentRoom.state[field] = (typeof value === "string") ? sanitizeStr(value, field === "caption" ? 80 : 32) : value;
        }
      }
      this.broadcastAll(currentRoom, {
        type: "ACTION_APPLIED",
        action: sanitizeStr(action, 32),
        field: ALLOWED_FIELDS.has(field) ? field : undefined,
        value: currentRoom.state[field],
        winnerId: participantId,
        winnerName: participantName,
        timestamp: Date.now()
      });
      return;
    }

    if (type === "WEBRTC_SIGNAL") {
      this.broadcast(currentRoom, {
        type: "WEBRTC_SIGNAL",
        senderId: participantId,
        signal: payload?.signal || payload || data?.signal
      }, sender);
      return;
    }

    if (type === "BURST_START_REQ") {
      const timerSeconds = (payload?.timerSeconds !== undefined) ? (parseInt(payload.timerSeconds, 10) || 0) : (currentRoom.state.timerSeconds ?? 3);
      currentRoom.state.timerSeconds = timerSeconds;
      this.broadcastAll(currentRoom, {
        type: "BURST_START_SYNC",
        initiatorId: participantId,
        timestamp: Date.now(),
        shotCount: payload?.shotCount || 6,
        timerSeconds
      });
      return;
    }

    if (type === "PHOTO_SNAPSHOT") {
      this.broadcast(currentRoom, {
        type: "REMOTE_PHOTO_SNAPSHOT",
        senderId: participantId,
        photoIndex: payload?.photoIndex,
        imageData: payload?.imageData
      }, sender);
      return;
    }

    if (type === "SYNC_PHOTO_SELECTION") {
      const rawIndices = Array.isArray(payload?.selectedIndices) ? payload.selectedIndices : [];
      currentRoom.state.selectedPhotos = rawIndices
        .filter(n => Number.isInteger(n) && n >= 0 && n <= 12)
        .slice(0, 9);
      this.broadcastAll(currentRoom, {
        type: "PHOTO_SELECTION_UPDATED",
        selectedIndices: currentRoom.state.selectedPhotos,
        actorName: participantName
      });
      return;
    }

    if (type === "REQ_RETRY_BURST") {
      if (currentRoom.state.retryCount < currentRoom.state.maxRetries) {
        currentRoom.state.retryCount += 1;
        this.broadcastAll(currentRoom, {
          type: "RETRY_BURST_APPROVED",
          retryCount: currentRoom.state.retryCount,
          maxRetries: currentRoom.state.maxRetries
        });
      } else {
        if (sender && typeof sender.send === "function") {
          sender.send(JSON.stringify({ type: "RETRY_LIMIT_REACHED" }));
        }
      }
      return;
    }

    if (type === "PAINT_STROKE") {
      const raw = payload?.stroke;
      if (raw && Array.isArray(raw.points) && raw.points.length > 0) {
        const parseCoord = (p) => {
          const x = (typeof p?.x === "number") ? p.x : (Number(p?.[0]) || 0);
          const y = (typeof p?.y === "number") ? p.y : (Number(p?.[1]) || 0);
          return [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))];
        };
        const safeStroke = {
          color: sanitizeStr(raw.color, 16) || "#ff2d55",
          size: Math.min(Math.max(Number(raw.size) || 6, 1), 50),
          points: raw.points.slice(0, 400).map(parseCoord)
        };
        currentRoom.state.strokes.push(safeStroke);
        if (currentRoom.state.strokes.length > 500) currentRoom.state.strokes.shift();
        this.broadcast(currentRoom, {
          type: "REMOTE_PAINT_STROKE",
          stroke: safeStroke,
          senderId: participantId
        }, sender);
      }
      return;
    }

    if (type === "PAINT_CLEAR") {
      currentRoom.state.strokes = [];
      this.broadcastAll(currentRoom, { type: "PAINT_CLEARED" });
      return;
    }

    if (type === "PAINT_UNDO") {
      currentRoom.state.strokes.pop();
      this.broadcastAll(currentRoom, {
        type: "PAINT_STATE_RESET",
        strokes: currentRoom.state.strokes
      });
      return;
    }

    if (type === "SYNC_STICKERS") {
      const raw = Array.isArray(payload?.stickers) ? payload.stickers : [];
      const safeStickers = raw.slice(0, 50).map((s) => ({
        id: sanitizeStr(s.id, 24) || ("stk_" + Math.random().toString(36).slice(2, 8)),
        type: sanitizeStr(s.type, 16) || "emoji",
        val: sanitizeStr(s.val || s.emoji, 32) || "💖",
        itemKey: sanitizeStr(s.itemKey, 32) || "",
        x: Math.max(0, Math.min(100, Number(s.x) || 50)),
        y: Math.max(0, Math.min(100, Number(s.y) || 50)),
        scale: Math.max(0.3, Math.min(3.0, Number(s.scale) || 1)),
        rot: Math.max(-360, Math.min(360, Number(s.rot) || 0))
      }));
      currentRoom.state.stickers = safeStickers;
      this.broadcast(currentRoom, {
        type: "REMOTE_STICKERS_SYNC",
        stickers: safeStickers,
        senderId: participantId
      }, sender);
      return;
    }

    if (type === "SET_OVERLAY") {
      const overlay = sanitizeStr(payload?.overlay, 32) || "none";
      currentRoom.state.overlay = overlay;
      this.broadcast(currentRoom, {
        type: "REMOTE_OVERLAY_SYNC",
        overlay,
        senderId: participantId
      }, sender);
      return;
    }

    this.broadcast(currentRoom, { type, payload, senderId: participantId }, sender);
  }

  attach(server, path = "/photobooth-ws") {
    if (!WebSocketServer) {
      console.warn("⚠️ [Photobooth] WebSocketServer skipped ('ws' module not installed). HTTP SSE fallback active.");
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
          if (++msgCount > 75) return;

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

            ws.send(JSON.stringify({
              type: "ROOM_JOINED",
              roomCode: code,
              role,
              participantId,
              participantCount: currentRoom.participants.size + (currentRoom.sseClients?.size || 0),
              state: currentRoom.state,
              participants: Array.from(currentRoom.participants.values())
            }));

            this.broadcast(currentRoom, {
              type: "PARTNER_JOINED",
              partner: { id: participantId, name: participantName, role },
              participantCount: currentRoom.participants.size + (currentRoom.sseClients?.size || 0)
            }, ws);

            return;
          }

          this.handleMessage(currentRoom, participantId, participantName, data, ws);
        } catch (err) {
          console.warn("Photobooth WS Message Parse Error:", err.message);
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

    console.log(`✓ Photobooth Realtime WebSocket attached on path '${path}'`);
    return wss;
  }
}


const photoboothRooms = new PhotoboothRoomServer();

module.exports = {
  photoboothRooms,
  setupPhotoboothWebSocket: (server, path) => photoboothRooms.attach(server, path)
};
