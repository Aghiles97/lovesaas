/**
 * ============================================================================
 * PARTNER CLIENT SDK (Shared 2-Partner Frontend Realtime Runtime)
 * ============================================================================
 * Purpose:
 *   Universal browser client for 2-partner multiplayer mini-games on the
 *   Couples SaaS platform (e.g. Draw, Photobooth, Puzzle, Tic-Tac-Toe, Trivia).
 *
 * Capabilities:
 *   - Auto Transport Switching: Connects over WebSocket (/ws/games/:game) and
 *     automatically falls back to HTTP SSE + POST if WS fails or times out.
 *   - Identity Persistence: Preserves participantId in sessionStorage to allow
 *     seamless reloads / reconnections without losing host/guest roles.
 *   - Ephemeral Primitives: Throttled cursor streaming (sendCursor), click sync.
 *   - Event Emitter: Clean .on('action', ...) API for all game events.
 *
 * Usage Example:
 *   const client = new PartnerClient({
 *     game: "tictactoe",
 *     roomCode: "LOVE42",
 *     name: "Sarah"
 *   });
 *
 *   client.on("connected", ({ role, state }) => console.log("Connected as", role));
 *   client.on("partner_joined", (partner) => console.log("Partner joined!", partner));
 *   client.on("state", (state) => updateUI(state));
 *   client.on("cursor", ({ x, y }) => renderPartnerCursor(x, y));
 *
 *   // Send a game action:
 *   client.sendAction("MAKE_MOVE", { cellIndex: 4 });
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PartnerClient = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  class PartnerClient {
    /**
     * @param {Object} options
     * @param {string} options.game - The gameId (e.g. 'puzzle', 'tictactoe')
     * @param {string} [options.roomCode] - The room code to connect to
     * @param {string} [options.name] - Player's display name
     * @param {boolean} [options.autoConnect=true] - Whether to connect immediately
     * @param {boolean} [options.syncUrl=true] - Keep ?room= query param updated
     * @param {string} [options.wsPath] - Custom WS path (default: /ws/games/:game)
     */
    constructor(options = {}) {
      if (!options.game) throw new Error("PartnerClient requires options.game");
      this.game = options.game.toLowerCase().trim();
      this.roomCode = (options.roomCode || "").toUpperCase().trim();
      this.name = options.name || "Partner";
      this.syncUrl = options.syncUrl !== false;
      this.customWsPath = options.wsPath || null;

      this.role = null; // 'host' | 'guest'
      this.state = null;
      this.participants = [];
      this.participantId = this._initParticipantId();

      this.ws = null;
      this.eventSource = null;
      this.useHttp = false;
      this.isDestroyed = false;

      this._listeners = new Map();
      this._reconnectTimer = null;
      this._lastCursorSend = 0;
      this._cursorThrottleMs = 40;

      if (typeof window !== "undefined" && typeof document !== "undefined") {
        this._visibilityHandler = () => {
          if (document.visibilityState === "visible" && !this.isDestroyed && this.roomCode) {
            const isWsClosed = !this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING;
            const isSseClosed = this.useHttp && (!this.eventSource || this.eventSource.readyState === 2);
            if (isWsClosed || isSseClosed) {
              this.connect(this.roomCode, this.name);
            }
          }
        };
        this._onlineHandler = () => {
          if (!this.isDestroyed && this.roomCode) {
            this.connect(this.roomCode, this.name);
          }
        };
        document.addEventListener("visibilitychange", this._visibilityHandler);
        window.addEventListener("online", this._onlineHandler);
      }

      if (options.autoConnect && this.roomCode) {
        this.connect(this.roomCode, this.name);
      }
    }

    // --- Identity & Storage ---

    _initParticipantId() {
      const storageKey = `partner_pid_${this.game}_${this.roomCode || "default"}`;
      let id = null;
      try {
        id = sessionStorage.getItem(storageKey);
      } catch (e) {}

      if (!id) {
        id = "p_" + Math.random().toString(36).slice(2, 9);
        try {
          sessionStorage.setItem(storageKey, id);
        } catch (e) {}
      }
      return id;
    }

    _updateUrl(code) {
      if (!this.syncUrl || !code || typeof window === "undefined") return;
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get("room") !== code) {
          url.searchParams.set("room", code);
          window.history.replaceState({ room: code }, "", url.toString());
        }
      } catch (e) {}
    }

    // --- Event Emitter ---

    on(event, handler) {
      if (!this._listeners.has(event)) this._listeners.set(event, new Set());
      this._listeners.get(event).add(handler);
      return this;
    }

    off(event, handler) {
      if (this._listeners.has(event)) {
        this._listeners.get(event).delete(handler);
      }
      return this;
    }

    _emit(event, data) {
      if (this._listeners.has(event)) {
        for (const handler of this._listeners.get(event)) {
          try { handler(data); } catch (err) { console.error(`[PartnerClient] Error in '${event}' handler:`, err); }
        }
      }
    }

    // --- Connection Lifecycle ---

    connect(roomCode, name) {
      this.isDestroyed = false;
      if (roomCode) this.roomCode = roomCode.toUpperCase().trim();
      if (name) this.name = name;
      if (!this.roomCode) throw new Error("Cannot connect: missing roomCode");

      this._updateUrl(this.roomCode);

      // Disconnect any existing transport
      this._cleanupTransports();

      if (this.useHttp) {
        this._startSseTransport();
        return;
      }

      this._startWebSocketTransport();
    }

    _cleanupTransports() {
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        try { this.ws.close(); } catch (e) {}
        this.ws = null;
      }
      if (this.eventSource) {
        try { this.eventSource.close(); } catch (e) {}
        this.eventSource = null;
      }
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = null;
      }
    }

    _startWebSocketTransport() {
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      const wsProto = isHttps ? "wss:" : "ws:";
      const host = typeof window !== "undefined" ? window.location.host : "localhost:4000";
      const wsUrl = `${wsProto}//${host}${this.customWsPath || `/ws/games/${this.game}`}`;

      let connected = false;
      const timeout = setTimeout(() => {
        if (!connected && !this.isDestroyed) {
          console.warn(`⚠️ [PartnerClient:${this.game}] WS timeout. Falling back to HTTP SSE.`);
          this.useHttp = true;
          this._startSseTransport();
        }
      }, 2500);

      try {
        const ws = new WebSocket(wsUrl);
        this.ws = ws;

        ws.onopen = () => {
          if (this.ws !== ws) return;
          connected = true;
          clearTimeout(timeout);

          this._sendWs("JOIN_ROOM", {
            roomCode: this.roomCode,
            payload: {
              roomCode: this.roomCode,
              participantId: this.participantId,
              name: this.name
            }
          });
        };

        ws.onmessage = (evt) => {
          if (this.ws !== ws) return;
          try {
            const data = JSON.parse(evt.data);
            this._handleIncoming(data);
          } catch (e) {}
        };

        ws.onerror = () => {
          if (this.ws !== ws) return;
          clearTimeout(timeout);
          if (!connected && !this.isDestroyed) {
            this.useHttp = true;
            this._startSseTransport();
          }
        };

        ws.onclose = () => {
          if (this.ws !== ws) return;
          clearTimeout(timeout);
          this._emit("disconnected");

          if (!this.isDestroyed && this.roomCode) {
            this._reconnectTimer = setTimeout(() => {
              if (!this.isDestroyed && this.roomCode) {
                this.connect(this.roomCode, this.name);
              }
            }, 3000);
          }
        };
      } catch (err) {
        clearTimeout(timeout);
        this.useHttp = true;
        this._startSseTransport();
      }
    }

    _startSseTransport() {
      this._cleanupTransports();
      this.useHttp = true;

      const sseUrl = `/api/games/${this.game}/rooms/${encodeURIComponent(this.roomCode)}/events?id=${encodeURIComponent(this.participantId)}&name=${encodeURIComponent(this.name)}`;
      try {
        const es = new EventSource(sseUrl);
        this.eventSource = es;

        es.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            this._handleIncoming(data);
          } catch (e) {}
        };

        es.onerror = () => {
          this._emit("error", { message: "SSE stream disconnected" });
        };
      } catch (err) {
        this._emit("error", err);
      }
    }

    // --- Message Ingestion ---

    _handleIncoming(msg) {
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case "ROOM_JOINED":
          this.role = msg.role;
          this.state = msg.state;
          this.participants = msg.participants || [];
          this._emit("connected", {
            role: this.role,
            participantId: this.participantId,
            state: this.state,
            participants: this.participants,
            roomCode: this.roomCode
          });
          break;

        case "PARTNER_JOINED":
          this.participants = this.participants.filter(p => p.id !== msg.partner.id);
          this.participants.push(msg.partner);
          this._emit("partner_joined", msg.partner);
          break;

        case "PARTNER_RECONNECTED":
          const reconnectedPartner = msg.partner || { id: msg.partnerId, name: msg.partnerName, role: msg.role };
          this.participants = this.participants.filter(p => p.id !== reconnectedPartner.id);
          this.participants.push(reconnectedPartner);
          this._emit("partner_reconnected", reconnectedPartner);
          this._emit("partner_joined", reconnectedPartner);
          break;

        case "PARTNER_LEFT":
          this.participants = this.participants.filter(p => p.id !== msg.partnerId);
          this._emit("partner_left", {
            partnerId: msg.partnerId,
            partnerName: msg.partnerName,
            remainingCount: msg.remainingCount
          });
          break;

        case "STATE_SYNC":
          this.state = msg.state;
          this._emit("state", this.state);
          break;

        case "REMOTE_CURSOR":
          if (msg.senderId !== this.participantId) {
            this._emit("cursor", {
              x: msg.x,
              y: msg.y,
              senderId: msg.senderId,
              senderName: msg.senderName
            });
          }
          break;

        case "REMOTE_CLICK":
          if (msg.senderId !== this.participantId) {
            this._emit("click", {
              x: msg.x,
              y: msg.y,
              senderId: msg.senderId,
              senderName: msg.senderName
            });
          }
          break;

        case "PROFILE_UPDATED":
          if (this.state) this.state.profiles = msg.profiles;
          this._emit("profiles", msg.profiles);
          break;

        case "ROOM_FULL":
          this._emit("error", { code: "ROOM_FULL", message: msg.error || "Room is full" });
          break;

        default:
          // Custom domain action relay
          this._emit("action", msg);
          if (msg.type) {
            this._emit(`action:${msg.type}`, msg.payload || msg);
          }
          break;
      }
    }

    // --- Outbound Dispatching ---

    _sendWs(type, rawData) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type, ...rawData }));
          return true;
        } catch (e) {}
      }
      return false;
    }

    /**
     * Send a game-specific action to the partner and server reducer.
     * @param {string} type - Action type (e.g. 'MOVE', 'ROLL_DICE', 'SUBMIT_ANSWER')
     * @param {Object} [payload={}] - Data associated with action
     */
    sendAction(type, payload = {}) {
      if (this.isDestroyed || !this.roomCode) return;

      const message = {
        type,
        roomCode: this.roomCode,
        senderId: this.participantId,
        senderName: this.name,
        payload
      };

      if (!this.useHttp && this._sendWs(type, message)) {
        return;
      }

      // HTTP fallback
      if (typeof fetch !== "undefined") {
        fetch(`/api/games/${this.game}/rooms/${encodeURIComponent(this.roomCode)}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message)
        }).catch(() => {});
      }
    }

    /**
     * Send normalized cursor position (0..1) to partner. Throttled automatically.
     */
    sendCursor(x, y) {
      const now = Date.now();
      if (now - this._lastCursorSend < this._cursorThrottleMs) return;
      this._lastCursorSend = now;
      this.sendAction("CURSOR_MOVE", {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y))
      });
    }

    /**
     * Send click/tap trigger to partner.
     */
    sendClick(x, y) {
      this.sendAction("CURSOR_CLICK", {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y))
      });
    }

    /**
     * Submit cute profile onboarding data (avatar, sex, name).
     */
    submitProfile(profile = {}) {
      this.sendAction("PROFILE_SUBMIT", profile);
    }

    disconnect() {
      this.isDestroyed = true;
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        if (this._visibilityHandler) document.removeEventListener("visibilitychange", this._visibilityHandler);
        if (this._onlineHandler) window.removeEventListener("online", this._onlineHandler);
      }
      this._cleanupTransports();
      this._emit("disconnected");
    }

    // --- State Getters ---

    isHost() {
      return this.role === "host";
    }

    getRole() {
      return this.role;
    }

    getParticipantId() {
      return this.participantId;
    }

    getRoomCode() {
      return this.roomCode;
    }

    getState() {
      return this.state;
    }
  }

  return PartnerClient;
});
