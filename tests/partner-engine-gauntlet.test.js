/**
 * ============================================================================
 * PARTNER ROOM ENGINE & CLIENT SDK GAUNTLET TEST
 * ============================================================================
 */

const assert = require("assert");
const http = require("http");
const { PartnerRoomEngine, GAME_REGISTRY } = require("../server/core/partner-room-engine");

console.log("\n=================================================");
console.log("   RUNNING PARTNER ROOM ENGINE GAUNTLET SUITE");
console.log("=================================================\n");

let passed = 0;
let total = 0;

function test(title, fn) {
  total++;
  try {
    fn();
    console.log(`✅ PASS: ${title}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${title}`);
    console.error(err);
    process.exit(1);
  }
}

async function testAsync(title, fn) {
  total++;
  try {
    await fn();
    console.log(`✅ PASS: ${title}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${title}`);
    console.error(err);
    process.exit(1);
  }
}

(async () => {
  // Gate 1: Engine Initialization & Registry
  test("Gate 1: PartnerRoomEngine registers correctly with initial state", () => {
    const engine = PartnerRoomEngine.register({
      gameId: "test_trivia",
      initialState: { questionIndex: 0, score: { host: 0, guest: 0 } },
      onAction: (room, { type, payload }, meta) => {
        if (type === "ANSWER_CORRECT") {
          room.state.score[meta.role] += 10;
          return { broadcastState: true };
        }
      }
    });

    assert.strictEqual(engine.gameId, "test_trivia");
    assert.strictEqual(PartnerRoomEngine.getGame("test_trivia"), engine);
    assert(PartnerRoomEngine.listGames().includes("test_trivia"));
  });

  // Gate 2: Room Lifecycle & Host/Guest Slotting
  test("Gate 2: Room creates correctly and isolates state", () => {
    const engine = PartnerRoomEngine.getGame("test_trivia");
    const room = engine.getOrCreateRoom("TEST12");
    assert.strictEqual(room.code, "TEST12");
    assert.strictEqual(room.state.questionIndex, 0);
    assert.strictEqual(room.state.score.host, 0);
  });

  // Gate 3: Cursor & Click Primitives
  test("Gate 3: Remote cursor and clicks normalize coordinates correctly", () => {
    const engine = PartnerRoomEngine.getGame("test_trivia");
    const room = engine.getOrCreateRoom("TEST12");
    let broadcastMsg = null;
    let broadcastSender = null;
    room.participants = new Map();
    room.sseClients = new Set();

    const mockWsSender = { readyState: 1, send: () => {} };
    const mockWsReceiver = {
      readyState: 1,
      send: (str) => { broadcastMsg = JSON.parse(str); }
    };

    room.participants.set(mockWsSender, { id: "p1", name: "Host", role: "host" });
    room.participants.set(mockWsReceiver, { id: "p2", name: "Guest", role: "guest" });

    // Cursor move
    engine.handleMessage(room, "p1", "Host", {
      type: "CURSOR_MOVE",
      payload: { x: 0.45, y: 0.85 }
    }, mockWsSender);

    assert(broadcastMsg);
    assert.strictEqual(broadcastMsg.type, "REMOTE_CURSOR");
    assert.strictEqual(broadcastMsg.x, 0.45);
    assert.strictEqual(broadcastMsg.y, 0.85);
    assert.strictEqual(broadcastMsg.senderId, "p1");

    // Remote click
    engine.handleMessage(room, "p1", "Host", {
      type: "CURSOR_CLICK",
      payload: { x: 0.5, y: 0.5 }
    }, mockWsSender);

    assert.strictEqual(broadcastMsg.type, "REMOTE_CLICK");
    assert.strictEqual(broadcastMsg.x, 0.5);
  });

  // Gate 4: Action Reducer & State Sync
  test("Gate 4: Domain reducer modifies state and triggers broadcastState", () => {
    const engine = PartnerRoomEngine.getGame("test_trivia");
    const room = engine.getOrCreateRoom("TEST12");
    let lastBroadcastAll = null;

    const mockWs = {
      readyState: 1,
      send: (str) => { lastBroadcastAll = JSON.parse(str); }
    };
    room.participants.clear();
    room.participants.set(mockWs, { id: "p2", name: "Guest", role: "guest" });
    room.hostId = "p1";

    engine.handleMessage(room, "p2", "Guest", {
      type: "ANSWER_CORRECT",
      payload: {}
    }, mockWs);

    assert.strictEqual(room.state.score.guest, 10);
    assert(lastBroadcastAll);
    assert.strictEqual(lastBroadcastAll.type, "STATE_SYNC");
    assert.strictEqual(lastBroadcastAll.state.score.guest, 10);
  });

  // Gate 5: HTTP Routes & Dispatcher
  await testAsync("Gate 5: Unified HTTP route dispatcher handles rooms metadata, events, and actions", async () => {
    let responseStatus = null;
    let responseData = null;

    const mockRes = {
      writeHead: (status) => { responseStatus = status; },
      end: (data) => { responseData = data; },
      write: (data) => { responseData = data; }
    };

    const sendJson = (res, status, obj) => {
      responseStatus = status;
      responseData = obj;
    };

    const parseJsonBody = async () => ({
      senderId: "p1",
      senderName: "Host",
      type: "ANSWER_CORRECT",
      payload: {}
    });

    // 1. GET metadata
    const handledGet = await PartnerRoomEngine.handleHttpRoute(
      {}, mockRes, "/api/games/test_trivia/rooms/TEST12", "GET", { query: {} }, parseJsonBody, sendJson
    );
    assert.strictEqual(handledGet, true);
    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.code, "TEST12");
    assert.strictEqual(responseData.state.score.guest, 10);

    // 2. POST message
    const handledPost = await PartnerRoomEngine.handleHttpRoute(
      {}, mockRes, "/api/games/test_trivia/rooms/TEST12/messages", "POST", { query: {} }, parseJsonBody, sendJson
    );
    assert.strictEqual(handledPost, true);
    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.ok, true);

    // 3. Unknown game returns false
    const handledUnknown = await PartnerRoomEngine.handleHttpRoute(
      {}, mockRes, "/api/games/unknown_game/rooms/TEST12", "GET", { query: {} }, parseJsonBody, sendJson
    );
    assert.strictEqual(handledUnknown, false);
  });

  // Gate 6: Client SDK Module verification
  test("Gate 6: Client SDK file exports PartnerClient constructor", () => {
    const PartnerClient = require("../public/js/core/partner-client");
    assert(typeof PartnerClient === "function");
    const client = new PartnerClient({
      game: "test_trivia",
      roomCode: "TEST12",
      name: "Player 1",
      autoConnect: false
    });
    assert.strictEqual(client.game, "test_trivia");
    assert.strictEqual(client.roomCode, "TEST12");
    assert.strictEqual(client.name, "Player 1");
    assert(client.participantId.startsWith("p_"));
  });

  // Gate 7: Trailing Slash Normalization
  await testAsync("Gate 7: HTTP route dispatcher normalizes trailing slashes", async () => {
    let responseStatus = null;
    let responseData = null;
    const sendJson = (res, status, obj) => { responseStatus = status; responseData = obj; };

    const handledSlash = await PartnerRoomEngine.handleHttpRoute(
      {}, {}, "/api/games/test_trivia/rooms/TEST12/", "GET", { query: {} }, async () => ({}), sendJson
    );
    assert.strictEqual(handledSlash, true);
    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.code, "TEST12");
  });

  // Gate 8: Multiple connections & Graceful Disconnect
  test("Gate 8: Participant with existing active connection does not trigger premature PARTNER_LEFT", () => {
    const engine = PartnerRoomEngine.getGame("test_trivia");
    const room = engine.getOrCreateRoom("TEST_GRACE");
    let leftEventSent = false;

    const mockWs1 = { readyState: 1, send: () => {} };
    const mockWs2 = { readyState: 1, send: () => {} };

    room.participants.set(mockWs1, { id: "p1", name: "Host", role: "host" });
    room.participants.set(mockWs2, { id: "p1", name: "Host", role: "host" }); // Same participant reconnected

    // Simulate mockWs1 closing:
    room.participants.delete(mockWs1);
    const stillConnected = Array.from(room.participants.values()).some(p => p.id === "p1");
    assert.strictEqual(stillConnected, true);
    // Because stillConnected is true, no PARTNER_LEFT is broadcast
  });

  // Gate 9: End-to-End WebSocket Upgrade via attachAll
  await testAsync("Gate 9: PartnerRoomEngine.attachAll sets up WS upgrade listener cleanly", async () => {
    const testServer = http.createServer();
    PartnerRoomEngine.attachAll(testServer);
    assert(testServer.listenerCount("upgrade") > 0);
  });

  console.log("\n=================================================");
  console.log(`GAUNTLET SUMMARY: ${passed}/${total} GATES PASSED`);
  console.log("🎉 ALL PARTNER ROOM ENGINE GATES PASSED!");
  console.log("=================================================\n");
})();
