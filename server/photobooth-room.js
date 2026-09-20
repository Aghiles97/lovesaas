const fs = require("fs");
const path = require("path");
const { PartnerRoomEngine, GAME_REGISTRY } = require("./core/partner-room-engine");

const DATA_FILE = path.join(__dirname, "../data/photobooth_rooms.json");

let WebSocketServer = null;
try {
  ({ WebSocketServer } = require("ws"));
} catch (e) {
  console.warn("⚠️ [Photobooth] Package 'ws' not installed. WebSocket rooms disabled until npm install.");
}

const ALLOWED_FIELDS = new Set(["format", "style", "filter", "caption", "stage", "setupSubStep", "timerSeconds"]);
const VALID_STAGES = new Set(["welcome", "lobby", "setup", "capture", "select", "deco", "print", "complete"]);
const sanitizeStr = (s, len = 80) => String(s || "").replace(/<[^>]*>/g, "").slice(0, len).trim();

class PhotoboothRoomServer extends PartnerRoomEngine {
  constructor() {
    super({
      gameId: "photobooth",
      maxParticipants: 2,
      dataFile: DATA_FILE,
      initialState: {
        stage: "lobby",
        setupSubStep: 1,
        format: "classic_3cut",
        style: "style_cyan_stars",
        filter: "vintage_90s",
        caption: "Together Forever ♡",
        timerSeconds: 3,
        selectedPhotos: [],
        candidatePhotos: [],
        retryCount: 0,
        maxRetries: 1,
        strokes: [],
        stickers: [],
        overlay: "none",
        profiles: {}
      }
    });

    // Register into shared engine registry for /api/games/photobooth and /ws/games/photobooth
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
    return room;
  }

  broadcast(room, data, sender = null) {
    if (room.sseClients) {
      // Delegate to PartnerRoomEngine which tracks and broadcasts to room.sseClients and WS participants
      return super.broadcast(room, data, sender);
    }
    return super.broadcast(room, data, sender);
  }

  broadcastAll(room, data) {
    return super.broadcastAll(room, data);
  }

  registerSseClient(req, res, roomCode, participantId, participantName) {
    return super.registerSseClient(req, res, roomCode, participantId, participantName);
  }

  attach(server, path = "/photobooth-ws") {
    // Enforces maxPayload: 2 * 1024 * 1024 and rate limit (msgCount > 75) via PartnerRoomEngine
    return super.attach(server, path);
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

    if (type === "PROFILE_SUBMIT") {
      const name = sanitizeStr(payload?.name, 24) || "Partner";
      const sex = sanitizeStr(payload?.sex, 16) || "cutie";
      if (!currentRoom.state.profiles) currentRoom.state.profiles = {};
      currentRoom.state.profiles[participantId] = { name, sex };
      const profiles = Object.values(currentRoom.state.profiles);
      if (profiles.length >= 2 && profiles[0].name && profiles[1].name) {
        currentRoom.state.caption = `${profiles[0].name} & ${profiles[1].name} ♡ Forever`;
      }
      this.scheduleSave();
      this.broadcastAll(currentRoom, {
        type: "PROFILE_UPDATED",
        participantId,
        profile: { name, sex },
        profiles: currentRoom.state.profiles,
        caption: currentRoom.state.caption
      });
      return;
    }

    if (type === "RESET_NEW_SESSION") {
      currentRoom.state.stage = "setup";
      currentRoom.state.setupSubStep = 1;
      currentRoom.state.filter = "natural";
      currentRoom.state.overlay = "none";
      currentRoom.state.selectedPhotos = [];
      currentRoom.state.candidatePhotos = [];
      currentRoom.state.strokes = [];
      currentRoom.state.stickers = [];
      currentRoom.state.retryCount = 0;
      this.scheduleSave();
      this.broadcastAll(currentRoom, {
        type: "NEW_SESSION_SYNC",
        stage: "setup",
        setupSubStep: 1,
        filter: "natural",
        overlay: "none",
        actorId: participantId,
        actorName: participantName
      });
      return;
    }

    if (type === "STAGE_CHANGE" || type === "SET_STAGE") {
      const stage = sanitizeStr(payload?.stage || payload, 20);
      if (VALID_STAGES.has(stage)) {
        if (stage === "setup" && (currentRoom.state.stage === "print" || payload?.setupSubStep === 1)) {
          currentRoom.state.setupSubStep = 1;
          currentRoom.state.filter = "natural";
          currentRoom.state.overlay = "none";
          currentRoom.state.selectedPhotos = [];
          currentRoom.state.candidatePhotos = [];
          currentRoom.state.strokes = [];
          currentRoom.state.stickers = [];
          currentRoom.state.retryCount = 0;
        }
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

    if (type === "ACTION_CLICK") {
      const field = payload?.field;
      const value = payload?.value;
      if (ALLOWED_FIELDS.has(field) && !["__proto__", "constructor", "prototype"].includes(field)) {
        if (field === "setupSubStep" || field === "timerSeconds") {
          currentRoom.state[field] = Number(value) || (field === "timerSeconds" ? 3 : 1);
        } else {
          currentRoom.state[field] = sanitizeStr(value, 40);
        }
        this.scheduleSave();
        this.broadcast(currentRoom, {
          type: "ACTION_APPLIED",
          action: payload?.action || "UPDATE_FIELD",
          field,
          value: currentRoom.state[field],
          senderId: participantId,
          senderName: participantName
        }, sender);
      }
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
      this.scheduleSave();
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
      const idx = Number(payload?.photoIndex);
      const img = payload?.imageData;
      if (!Array.isArray(currentRoom.state.candidatePhotos)) {
        currentRoom.state.candidatePhotos = [];
      }
      if (Number.isInteger(idx) && idx >= 0 && idx < 20 && typeof img === "string" && img.startsWith("data:image/") && img.length < 1500000) {
        currentRoom.state.candidatePhotos[idx] = img;
        this.scheduleSave();
      }
      this.broadcast(currentRoom, {
        type: "REMOTE_PHOTO_SNAPSHOT",
        senderId: participantId,
        photoIndex: idx,
        imageData: img
      }, sender);
      return;
    }

    if (type === "SYNC_PHOTO_SELECTION") {
      const rawIndices = Array.isArray(payload?.selectedIndices) ? payload.selectedIndices : [];
      currentRoom.state.selectedPhotos = rawIndices
        .filter(n => Number.isInteger(n) && n >= 0 && n <= 12)
        .slice(0, 9);
      this.scheduleSave();
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
        this.scheduleSave();
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
        this.scheduleSave();
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
      this.scheduleSave();
      this.broadcastAll(currentRoom, { type: "PAINT_CLEARED" });
      return;
    }

    if (type === "PAINT_UNDO") {
      currentRoom.state.strokes.pop();
      this.scheduleSave();
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
      this.scheduleSave();
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
      this.scheduleSave();
      this.broadcast(currentRoom, {
        type: "REMOTE_OVERLAY_SYNC",
        overlay,
        senderId: participantId
      }, sender);
      return;
    }

    this.broadcast(currentRoom, { type, payload, senderId: participantId }, sender);
  }
}

const photoboothRooms = new PhotoboothRoomServer();

module.exports = {
  photoboothRooms,
  PhotoboothRoomServer,
  setupPhotoboothWebSocket: (server, path) => photoboothRooms.attach(server, path)
};
