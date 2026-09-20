# 🎮 Partner Games Engine (2-Player Multiplayer Core)

> **Context for Future Conversations & AI Agents:**
> This document explains the architecture of the **Shared 2-Partner Realtime Game Engine** on this SaaS platform, and provides a zero-boilerplate blueprint for adding **Game #3** (and all subsequent couple/multiplayer games).

---

## 1. Architecture Overview

Every 2-partner game on this platform shares identical underlying connection requirements:
* **Max 2 Participants**: Auto-slots Partner 1 as `host` and Partner 2 as `guest`. Rejects 3rd party (`ROOM_FULL`).
* **Dual-Transport Failover**: Primary **WebSocket** (`/ws/games/:game`) with automatic fallback to **HTTP Server-Sent Events (SSE)** + **HTTP POST messages** if WebSockets are blocked.
* **Presence & Heartbeats**: 25s ping-pong keepalive, partner join/leave notifications.
* **Persistent Sessions**: `participantId` cached in `sessionStorage` allowing seamless reloads without losing roles.
* **Disk Persistence & TTL**: Debounced saving to `data/:game_rooms.json` with 3-hour inactivity garbage collection.
* **Built-in Ephemeral Primitives**: Smooth remote mouse/touch cursor streaming (`sendCursor(x, y)`) and tap sync (`sendClick(x, y)`).

---

## 2. Core Modules

| Module | Location | Purpose |
| :--- | :--- | :--- |
| **Server Engine** | `server/core/partner-room-engine.js` | Manages rooms, WS/SSE connections, TTL, rate limiting, and routes actions to game reducers. |
| **Client SDK** | `public/js/core/partner-client.js` | Universal browser client handling connection, fallback, reconnection, cursor sync, and action events. |
| **Disk Storage** | `data/<gameId>_rooms.json` | Automatic room state persistence. |

---

## 3. How to Build Game #3 in 3 Simple Steps

### Step 1: Create the Server Reducer (`server/games/mygame-room.js`)

You only need to define your game's **initial state** and a **reducer** that handles incoming actions:

```javascript
// server/games/mygame-room.js
const { PartnerRoomEngine } = require("../core/partner-room-engine");

const myGameEngine = PartnerRoomEngine.register({
  gameId: "mygame", // Unique lowercase ID: used in /ws/games/mygame and /api/games/mygame
  initialState: {
    stage: "lobby", // 'lobby' | 'playing' | 'gameover'
    score: { host: 0, guest: 0 },
    currentTurn: "host",
    board: []
  },

  /**
   * Action Reducer: called whenever a client executes `client.sendAction(type, payload)`
   * @param {Object} room - The active room instance (room.state, room.code, etc.)
   * @param {Object} action - { type, payload }
   * @param {Object} meta - { id, name, role } ('host' or 'guest')
   */
  onAction: (room, { type, payload }, meta) => {
    switch (type) {
      case "START_GAME":
        if (meta.role !== "host") return; // Only host can start
        room.state.stage = "playing";
        return { broadcastState: true }; // Tells engine to auto-sync state to both partners

      case "MAKE_MOVE":
        if (room.state.currentTurn !== meta.role) return;
        // Apply your game logic to room.state:
        room.state.board.push({ player: meta.role, move: payload.move });
        room.state.currentTurn = meta.role === "host" ? "guest" : "host";
        return { broadcastState: true };

      case "SEND_REACTION":
        // Ephemeral event: broadcast directly without saving to state
        return { broadcast: { type: "REACTION", emoji: payload.emoji, sender: meta.role } };

      default:
        return;
    }
  }
});

module.exports = { myGameEngine };
```

---

### Step 2: Register the Game in `server/server.js`

In `server/server.js`, require your game file so it registers in `GAME_REGISTRY`:

```javascript
// In server/server.js:
require("./games/mygame-room");
```

*(Note: `server.js` already routes all `/api/games/:game/*` and `/ws/games/:game` requests through `PartnerRoomEngine.handleHttpRoute` and `PartnerRoomEngine.attachAll` automatically!)*

---

### Step 3: Connect Frontend Using `PartnerClient`

Include `/js/core/partner-client.js` in your HTML or runtime script:

```html
<script src="/js/core/partner-client.js"></script>
```

```javascript
// In public/js/widgets/mygame.runtime.js:
const client = new PartnerClient({
  game: "mygame",
  roomCode: "LOVE42", // Room code from URL or generator
  name: "Alex"
});

// 1. Connection Lifecycle
client.on("connected", ({ role, state, participants }) => {
  console.log(`Connected as ${role}!`, state);
  updateUI(state);
});

client.on("partner_joined", (partner) => {
  showToast(`${partner.name} joined!`);
});

client.on("partner_left", () => {
  showToast("Partner disconnected, waiting for reconnect...");
});

// 2. Synchronized State Updates
client.on("state", (state) => {
  renderGameBoard(state);
});

// 3. Ephemeral Remote Cursors
client.on("cursor", ({ x, y }) => {
  renderPartnerCursor(x, y);
});

// Track mouse/touch and send cursor:
document.addEventListener("mousemove", (e) => {
  client.sendCursor(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
});

// 4. Custom Ephemeral Actions
client.on("action:REACTION", ({ emoji, sender }) => {
  spawnFloatingHeartOrEmoji(emoji);
});

// 5. Sending Game Moves
function onPlayerMove(moveData) {
  client.sendAction("MAKE_MOVE", { move: moveData });
}
```

---

## 4. Primitives & Helpers Reference

### Client API (`PartnerClient`)

| Method / Event | Description |
| :--- | :--- |
| `client.sendAction(type, payload)` | Send game action to server reducer. Auto routes via WS or HTTP POST. |
| `client.sendCursor(x, y)` | Send normalized (0..1) cursor coordinates. Automatically throttled (40ms). |
| `client.sendClick(x, y)` | Broadcast a tap/click animation at normalized (0..1) position. |
| `client.submitProfile({ name, sex, avatar })` | Set player onboarding profile. |
| `client.isHost()` | Returns `true` if current player is Host. |
| `client.getRole()` | Returns `'host'` or `'guest'`. |
| `client.getState()` | Returns the latest authoritative room state. |
| `client.on('state', cb)` | Fired when room state changes. |
| `client.on('cursor', cb)` | Fired when partner moves their pointer. |
| `client.on('partner_joined', cb)` | Fired when partner enters room. |
| `client.on('partner_left', cb)` | Fired when partner exits or drops connection. |

### Reducer Return Values (`onAction`)

In your server's `onAction(room, action, meta)` hook, return one of these:
* `{ broadcastState: true }` → Authoritatively broadcasts updated `room.state` to **all** players.
* `{ broadcast: { type, payload } }` → Relays payload to the **other** partner only (sender excluded).
* `{ broadcastAll: { type, payload } }` → Relays payload to **both** partners.
* `undefined` or `null` → No action broadcast.

---

## 5. Existing Games (`draw` & `photobooth`)

* `server/draw-room.js` and `server/photobooth-room.js` are currently standalone and tested with 100% pass rates in `tests/draw-gauntlet.test.js` and `tests/photobooth-gauntlet.test.js`.
* They continue running untouched on their existing routes (`/draw-ws`, `/photobooth-ws`, `/api/draw/...`, `/api/photobooth/...`).
* Any new game should be built on `PartnerRoomEngine` using `/ws/games/:game` and `/api/games/:game/...`.
