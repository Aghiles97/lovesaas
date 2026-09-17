let WebSocketServer = null;
try {
  ({ WebSocketServer } = require("ws"));
} catch (e) {
  console.warn("⚠️ [Photobooth] Package 'ws' not installed. WebSocket rooms disabled until npm install.");
}

class PhotoboothRoomServer {
  constructor() {
    this.rooms = new Map();
    this.cleanupInterval = setInterval(() => this.cleanupExpiredRooms(), 10 * 60 * 1000);
  }

  getOrCreateRoom(code) {
    const roomCode = String(code || "").toUpperCase().trim();
    if (!this.rooms.has(roomCode)) {
      this.rooms.set(roomCode, {
        code: roomCode,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        participants: new Map(),
        state: {
          format: "classic_3cut",
          style: "style_cyan_stars",
          filter: "vintage_90s",
          caption: "Together Forever ♡",
          selectedPhotos: [],
          retryCount: 0,
          maxRetries: 1,
          strokes: []
        }
      });
    }
    const room = this.rooms.get(roomCode);
    room.lastActivity = Date.now();
    return room;
  }

  cleanupExpiredRooms() {
    const now = Date.now();
    const TTL = 3 * 60 * 60 * 1000;
    for (const [code, room] of this.rooms.entries()) {
      if (room.participants.size === 0 && now - room.lastActivity > TTL) {
        this.rooms.delete(code);
      }
    }
  }

  broadcast(room, data, senderWs = null) {
    const msg = JSON.stringify(data);
    for (const client of room.participants.keys()) {
      if (client !== senderWs && client.readyState === 1) {
        try { client.send(msg); } catch (e) {}
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
  }

  attach(server, path = "/photobooth-ws") {
    if (!WebSocketServer) {
      console.warn("⚠️ [Photobooth] WebSocketServer skipped ('ws' module not installed).");
      return null;
    }
    const wss = new WebSocketServer({ noServer: true, maxPayload: 2 * 1024 * 1024 });
    const ALLOWED_FIELDS = new Set(["format", "style", "filter", "caption"]);
    const sanitizeStr = (s, len = 80) => String(s || "").replace(/<[^>]*>/g, "").slice(0, len).trim();

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
            if (currentRoom.participants.size >= 2 && !currentRoom.participants.has(ws)) {
              ws.send(JSON.stringify({ type: "ROOM_FULL", error: "Room has reached max capacity of 2 partners." }));
              return;
            }

            const role = currentRoom.participants.size === 0 ? "host" : "guest";
            participantName = sanitizeStr(payload?.name, 24) || (role === "host" ? "Partner 1" : "Partner 2");
            currentRoom.participants.set(ws, { id: participantId, name: participantName, role });

            ws.send(JSON.stringify({
              type: "ROOM_JOINED",
              roomCode: code,
              role,
              participantId,
              participantCount: currentRoom.participants.size,
              state: currentRoom.state,
              participants: Array.from(currentRoom.participants.values())
            }));

            this.broadcast(currentRoom, {
              type: "PARTNER_JOINED",
              partner: { id: participantId, name: participantName, role },
              participantCount: currentRoom.participants.size
            }, ws);

            return;
          }

          if (!currentRoom) return;
          currentRoom.lastActivity = Date.now();

          if (type === "CURSOR_MOVE") {
            const x = Math.max(0, Math.min(1, Number(payload?.x) || 0));
            const y = Math.max(0, Math.min(1, Number(payload?.y) || 0));
            this.broadcast(currentRoom, {
              type: "REMOTE_CURSOR",
              x,
              y,
              senderId: participantId,
              senderName: participantName
            }, ws);
            return;
          }

          if (type === "ACTION_CLICK") {
            const { action, field, value } = payload || {};
            if (field && ALLOWED_FIELDS.has(field) && value !== undefined) {
              currentRoom.state[field] = (typeof value === "string") ? sanitizeStr(value, field === "caption" ? 80 : 32) : value;
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
              signal: payload.signal
            }, ws);
            return;
          }

          if (type === "BURST_START_REQ") {
            this.broadcastAll(currentRoom, {
              type: "BURST_START_SYNC",
              initiatorId: participantId,
              timestamp: Date.now(),
              shotCount: payload?.shotCount || 3,
              timerSeconds: payload?.timerSeconds || 3
            });
            return;
          }

          if (type === "PHOTO_SNAPSHOT") {
            this.broadcast(currentRoom, {
              type: "REMOTE_PHOTO_SNAPSHOT",
              senderId: participantId,
              photoIndex: payload.photoIndex,
              imageData: payload.imageData
            }, ws);
            return;
          }

          if (type === "SYNC_PHOTO_SELECTION") {
            const rawIndices = Array.isArray(payload?.selectedIndices) ? payload.selectedIndices : [];
            currentRoom.state.selectedPhotos = rawIndices
              .filter(n => Number.isInteger(n) && n >= 0 && n <= 12)
              .slice(0, 6);
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
              ws.send(JSON.stringify({ type: "RETRY_LIMIT_REACHED" }));
            }
            return;
          }

          if (type === "PAINT_STROKE") {
            const raw = payload?.stroke;
            if (raw && Array.isArray(raw.points) && raw.points.length > 0) {
              const safeStroke = {
                color: sanitizeStr(raw.color, 16) || "#ff2d55",
                size: Math.min(Math.max(Number(raw.size) || 6, 1), 50),
                points: raw.points.slice(0, 400).map(p => [
                  Math.max(0, Math.min(1, Number(p?.[0]) || 0)),
                  Math.max(0, Math.min(1, Number(p?.[1]) || 0))
                ])
              };
              currentRoom.state.strokes.push(safeStroke);
              if (currentRoom.state.strokes.length > 500) currentRoom.state.strokes.shift();
              this.broadcast(currentRoom, {
                type: "REMOTE_PAINT_STROKE",
                stroke: safeStroke,
                senderId: participantId
              }, ws);
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

          this.broadcast(currentRoom, { type, payload, senderId: participantId }, ws);
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
            remainingCount: currentRoom.participants.size
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
