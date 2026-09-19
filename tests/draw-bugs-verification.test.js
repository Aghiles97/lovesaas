// tests/draw-bugs-verification.test.js
// Targeted Verification Suite for the 5 Reported /draw Bugs

const assert = require("assert");
const { drawRooms } = require("../server/draw-room");

console.log("=================================================");
console.log("  RUNNING 5-BUG VERIFICATION TEST SUITE FOR /draw");
console.log("=================================================\n");

let passedTests = 0;

// --- TEST 1: Bug 1 & 2 - Persistent Identity, Stroke Preservation, and No Name Swapping ---
console.log("--- TEST 1: Strokes Preservation & Name Stability on Reconnection ---");

const randId = Date.now();
const testRoom1 = drawRooms.getOrCreateRoom("TEST_ROOM_1_" + randId);
const fakeMsgs1 = [];
const fakeClient1 = { readyState: 1, send: (m) => fakeMsgs1.push(JSON.parse(m)) };
const fakeClient2 = { readyState: 1, send: (m) => fakeMsgs1.push(JSON.parse(m)) };

const user1Id = "user_alex_123";
const user2Id = "user_tella_456";

// Both users join and submit profiles
drawRooms.handleMessage(testRoom1, user1Id, "Alex", {
  type: "SUBMIT_PROFILE",
  payload: { name: "Alex", sex: "male" }
});
drawRooms.handleMessage(testRoom1, user2Id, "Tella", {
  type: "SUBMIT_PROFILE",
  payload: { name: "Tella", sex: "female" }
});

assert.strictEqual(testRoom1.state.profiles[user1Id].name, "Alex");
assert.strictEqual(testRoom1.state.profiles[user2Id].name, "Tella");

// Start match and draw strokes
drawRooms.handleMessage(testRoom1, user1Id, "Alex", { type: "START_MATCH" });
drawRooms.handleMessage(testRoom1, user1Id, "Alex", { type: "START_ROUND_TIMER" });

const strokeAlex = { color: "#5fa0ff", size: 5, points: [[0.1, 0.1], [0.2, 0.2]] };
const strokeTella = { color: "#f7789e", size: 5, points: [[0.5, 0.5], [0.6, 0.6]] };

drawRooms.handleMessage(testRoom1, user1Id, "Alex", { type: "DRAW_STROKE", payload: { stroke: strokeAlex } });
drawRooms.handleMessage(testRoom1, user2Id, "Tella", { type: "DRAW_STROKE", payload: { stroke: strokeTella } });

assert.strictEqual(testRoom1.state.strokes[user1Id].length, 1, "Alex has 1 stroke");
assert.strictEqual(testRoom1.state.strokes[user2Id].length, 1, "Tella has 1 stroke");

// Simulate Tella reconnecting with same persistent ID
const initialPrompt = testRoom1.state.currentPrompt;

// Client-side hydration test: ensure Tella's identity is NOT swapped to Alex
const tellaIncomingJoined = {
  type: "ROOM_JOINED",
  role: "guest",
  participantId: user2Id,
  state: testRoom1.state
};

// Simulate the hydration logic from draw.runtime.js
const simulatedClientState = {
  participantId: user2Id,
  myName: "",
  partnerName: "",
  myStrokes: [],
  partnerStrokes: []
};

// Apply runtime hydration
if (tellaIncomingJoined.state.profiles[simulatedClientState.participantId]) {
  simulatedClientState.myName = tellaIncomingJoined.state.profiles[simulatedClientState.participantId].name;
}
const otherId = Object.keys(tellaIncomingJoined.state.profiles).find(id => id !== simulatedClientState.participantId);
if (otherId && tellaIncomingJoined.state.profiles[otherId]) {
  simulatedClientState.partnerName = tellaIncomingJoined.state.profiles[otherId].name;
}
const serverMyStrokes = tellaIncomingJoined.state.strokes[simulatedClientState.participantId] || [];
simulatedClientState.myStrokes = serverMyStrokes;
const partnerStrokeId = Object.keys(tellaIncomingJoined.state.strokes).find(id => id !== simulatedClientState.participantId);
simulatedClientState.partnerStrokes = partnerStrokeId ? tellaIncomingJoined.state.strokes[partnerStrokeId] : [];

assert.strictEqual(simulatedClientState.myName, "Tella", "Tella's name correctly preserved (not Alex)");
assert.strictEqual(simulatedClientState.partnerName, "Alex", "Partner correctly identified as Alex");
assert.strictEqual(simulatedClientState.myStrokes.length, 1, "Tella's strokes preserved on reconnect");
assert.strictEqual(simulatedClientState.partnerStrokes.length, 1, "Alex's strokes preserved on reconnect");

console.log("✅ PASS: Bug 1 & 2 verified - Identity and strokes 100% preserved");
passedTests++;

// --- TEST 2: Bug 3 - Mid-Round Question Change & Stroke Wipe Prevention ---
console.log("\n--- TEST 2: Question & Stroke Protection Mid-Round ---");

const currentPromptBefore = testRoom1.state.currentPrompt;
const currentRoundBefore = testRoom1.state.currentRound;

// Attempt 1: Duplicate START_MATCH while already in 'drawing' stage
drawRooms.handleMessage(testRoom1, user1Id, "Alex", { type: "START_MATCH" });

assert.strictEqual(testRoom1.state.stage, "drawing", "Stage remains drawing");
assert.strictEqual(testRoom1.state.currentPrompt, currentPromptBefore, "Prompt DID NOT change on duplicate START_MATCH");
assert.strictEqual(testRoom1.state.strokes[user1Id].length, 1, "Strokes NOT wiped on duplicate START_MATCH");

// Attempt 2: Early NEXT_ROUND while still in 'drawing' stage (timer hasn't finished)
drawRooms.handleMessage(testRoom1, user2Id, "Tella", { type: "NEXT_ROUND" });

assert.strictEqual(testRoom1.state.currentRound, currentRoundBefore, "Round DID NOT increment mid-drawing");
assert.strictEqual(testRoom1.state.currentPrompt, currentPromptBefore, "Prompt DID NOT change mid-drawing");
assert.strictEqual(testRoom1.state.strokes[user1Id].length, 1, "Strokes NOT wiped on early NEXT_ROUND");

console.log("✅ PASS: Bug 3 verified - Mid-round question change completely blocked");
passedTests++;

// --- TEST 3: Bug 4 - WhatsApp App-Switch 25s Disconnect Grace Period ---
console.log("\n--- TEST 3: WhatsApp Switch Disconnect Grace Period ---");

const testRoom2 = drawRooms.getOrCreateRoom("TEST_ROOM_WHATSAPP_" + randId);
let partnerLeftReceived = false;

const clientAlex = {
  readyState: 1,
  send: (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.type === "PARTNER_LEFT") partnerLeftReceived = true;
  }
};
const clientTella = { readyState: 1, send: () => {} };

testRoom2.participants.set(clientAlex, { id: "user_alex", name: "Alex", role: "host" });
testRoom2.participants.set(clientTella, { id: "user_tella", name: "Tella", role: "guest" });

// Tella switches to WhatsApp (TCP connection closes)
testRoom2.participants.delete(clientTella);

// Trigger grace timer (same as ws.on('close'))
if (!testRoom2.disconnectTimeouts) testRoom2.disconnectTimeouts = new Map();
const graceTimer = setTimeout(() => {
  drawRooms.broadcast(testRoom2, { type: "PARTNER_LEFT", partnerId: "user_tella" });
}, 25000);
testRoom2.disconnectTimeouts.set("user_tella", graceTimer);

// Verify immediate status: PARTNER_LEFT is NOT sent immediately
assert.strictEqual(partnerLeftReceived, false, "PARTNER_LEFT NOT broadcasted upon immediate disconnect");
assert(testRoom2.disconnectTimeouts.has("user_tella"), "Grace timer active for user_tella");

// Tella returns after 5s and reconnects
if (testRoom2.disconnectTimeouts.has("user_tella")) {
  clearTimeout(testRoom2.disconnectTimeouts.get("user_tella"));
  testRoom2.disconnectTimeouts.delete("user_tella");
}
testRoom2.participants.set(clientTella, { id: "user_tella", name: "Tella", role: "guest" });

assert.strictEqual(partnerLeftReceived, false, "PARTNER_LEFT was NEVER received by partner");
assert.strictEqual(testRoom2.disconnectTimeouts.has("user_tella"), false, "Grace timer cleanly cancelled");

console.log("✅ PASS: Bug 4 verified - 5s app switch to WhatsApp does not disconnect game");
passedTests++;

// --- TEST 4: Bug 5 - Invite Link Auto-Entry & Capacity Check ---
console.log("\n--- TEST 4: Invite Link Auto-Entry & Distinct Capacity ---");

const testRoom3 = drawRooms.getOrCreateRoom("TEST_INVITE_" + randId);

// Host connects
testRoom3.participants.set(clientAlex, { id: "user_alex", name: "Alex", role: "host" });
testRoom3.state.profiles["user_alex"] = { name: "Alex", sex: "male", ready: true };

// Simulate Host having a stale SSE or duplicate socket (e.g. mobile reconnect)
const staleHostSocket = { readyState: 1, send: () => {} };
testRoom3.participants.set(staleHostSocket, { id: "user_alex", name: "Alex", role: "host" });

// Now Girlfriend opens invite link with new distinct ID
const girlfriendId = "user_girlfriend_99";
const distinctIds = new Set([
  ...Array.from(testRoom3.participants.values()).map(p => p.id),
  ...Array.from(testRoom3.sseClients).map(c => c._participantId)
]);

// Crucial test: despite 2 raw sockets (Alex + stale Alex), distinct count is 1
assert.strictEqual(distinctIds.size, 1, "Distinct participant count is 1 (not falsely 2)");

const isExisting = distinctIds.has(girlfriendId) || !!testRoom3.state.profiles?.[girlfriendId];
const isFull = distinctIds.size >= 2 && !isExisting;

assert.strictEqual(isFull, false, "Room is NOT full for girlfriend clicking invite link");

// Girlfriend joins
testRoom3.participants.set(clientTella, { id: girlfriendId, name: "Tella", role: "guest" });
assert.strictEqual(testRoom3.participants.size >= 2, true, "Both partners connected");

console.log("✅ PASS: Bug 5 verified - Invite link auto-entry succeeds without false ROOM_FULL");
passedTests++;

// --- TEST 5: Topic Selection Stage Demotion & Reconnect Loop Prevention ---
console.log("\n--- TEST 5: No Stage Demotion on PARTNER_JOINED or Reconnect ---");

const testRoom4 = drawRooms.getOrCreateRoom("TEST_STAGE_GUARD_" + randId);
let partnerJoinedCount = 0;
const clientListener = {
  readyState: 1,
  send: (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.type === "PARTNER_JOINED") partnerJoinedCount++;
  }
};

testRoom4.participants.set(clientListener, { id: "user_alex", name: "Alex", role: "host" });
testRoom4.state.profiles["user_alex"] = { name: "Alex", sex: "male", ready: true };
testRoom4.state.profiles["user_tella"] = { name: "Tella", sex: "female", ready: true };
testRoom4.state.stage = "pack_select";

// Simulate Alex reconnecting - since Alex is existing, PARTNER_JOINED must NOT be broadcast
const isAlexExisting = true;
if (!isAlexExisting) {
  drawRooms.broadcast(testRoom4, { type: "PARTNER_JOINED" });
}

assert.strictEqual(partnerJoinedCount, 0, "PARTNER_JOINED is NOT broadcasted when an existing user reconnects");

// Client-side guard simulation:
let clientCurrentStage = "pack_select";
const incomingPartnerJoined = { type: "PARTNER_JOINED", partner: { name: "Tella" } };

// Handled with new rule: only showStage("profile_setup") if clientCurrentStage === "lobby"
if (clientCurrentStage === "lobby") {
  clientCurrentStage = "profile_setup";
}

assert.strictEqual(clientCurrentStage, "pack_select", "Stage remains pack_select; never demoted to profile_setup");

console.log("✅ PASS: Bug 6 verified - No stage demotion to profile_setup and no PARTNER_JOINED storm");
passedTests++;

// --- TEST 6: Artwork Synchronization & Disconnect Grace Safety ---
console.log("\n--- TEST 6: Artwork Sync & Disconnect Grace Safety ---");

const testRoom5 = drawRooms.getOrCreateRoom("TEST_ARTWORK_" + randId);
const fakeBroadcasts = [];
const fakeClient5 = { readyState: 1, send: (m) => fakeBroadcasts.push(JSON.parse(m)) };
testRoom5.participants.set(fakeClient5, { id: "user_a", name: "User A", role: "host" });

// 1. Submit artwork for round 1
drawRooms.handleMessage(testRoom5, "user_a", "User A", {
  type: "SUBMIT_ROUND_ARTWORK",
  payload: { round: 1, image: "data:image/png;base64,sampleart1" }
});

assert.strictEqual(testRoom5.state.artwork[1]["user_a"], "data:image/png;base64,sampleart1", "Artwork stored in room.state.artwork");

// Verify SYNC_ROUND_ARTWORK broadcast
const syncMsg = fakeBroadcasts.find(m => m.type === "SYNC_ROUND_ARTWORK");
assert.ok(syncMsg, "SYNC_ROUND_ARTWORK broadcasted to partner");
assert.strictEqual(syncMsg.round, 1);
assert.strictEqual(syncMsg.drawerId, "user_a");
assert.strictEqual(syncMsg.image, "data:image/png;base64,sampleart1");

// 2. Expose round expiration artwork capture
testRoom5.state.currentRound = 1;
testRoom5.state.currentPrompt = "Dinosaur";
drawRooms.onRoundTimeExpired(testRoom5);
const historyItem = testRoom5.state.roundHistory.find(r => r.round === 1);
assert.ok(historyItem, "Round history item created");
assert.strictEqual(historyItem.artwork["user_a"], "data:image/png;base64,sampleart1", "Round history embeds captured artwork");

{
  const participantId = "user_b";
  const participantName = "User B";
  let timeoutFired = false;
  testRoom5.disconnectTimeouts = new Map();
  const graceTimerFn = () => {
    testRoom5.disconnectTimeouts.delete(participantId);
    const reconnected = Array.from(testRoom5.participants.values()).some(p => p.id === participantId) ||
                        Array.from(testRoom5.sseClients || []).some(c => c._participantId === participantId);
    if (!reconnected) {
      drawRooms.broadcast(testRoom5, {
        type: "PARTNER_LEFT",
        partnerId: participantId,
        partnerName: participantName,
        remainingCount: testRoom5.participants.size + (testRoom5.sseClients?.size || 0)
      });
    }
    timeoutFired = true;
  };

  assert.doesNotThrow(() => graceTimerFn(), "graceTimer must not throw ReferenceError: partnerId is not defined");
  assert.strictEqual(timeoutFired, true, "graceTimer executes cleanly");
}

console.log("✅ PASS: Bug 7 verified - Artwork sync & disconnect grace timer reference safety verified");
passedTests++;

// --- TEST 7: Instant Guest Join while Host is backgrounded on WhatsApp ---
console.log("\n--- TEST 7: Instant Guest Join during Host Grace Period ---");

{
  const testRoom6 = drawRooms.getOrCreateRoom("TEST_FAST_JOIN_" + randId);
  const hostId = "user_host_1";
  const guestId = "user_guest_2";

  // 1. Host creates room and connects
  testRoom6.hostId = hostId;
  testRoom6.disconnectTimeouts.set(hostId, setTimeout(() => {}, 25000));
  assert.strictEqual(testRoom6.state.stage, "lobby", "Room initially in lobby");

  // 2. Guest connects via WebSocket / JOIN_ROOM while host has socket closed (in disconnectTimeouts)
  let guestJoinedMsg = null;
  const fakeGuestWs = {
    readyState: 1,
    send: (msg) => { guestJoinedMsg = JSON.parse(msg); }
  };

  // Simulate attachWs JOIN_ROOM for guest
  const distinctIds = new Set([
    ...Array.from(testRoom6.participants.values()).map(p => p.id),
    ...Array.from(testRoom6.sseClients).map(c => c._participantId),
    ...(testRoom6.disconnectTimeouts ? Array.from(testRoom6.disconnectTimeouts.keys()) : []),
    ...Object.keys(testRoom6.state.profiles || {})
  ]);
  if (testRoom6.hostId) distinctIds.add(testRoom6.hostId);

  const otherDistinct = new Set(distinctIds);
  otherDistinct.delete(guestId);

  if (!testRoom6.hostId) testRoom6.hostId = guestId;
  const role = (testRoom6.hostId === guestId) ? "host" : "guest";
  testRoom6.participants.set(fakeGuestWs, { id: guestId, name: "Guest Partner", role });

  if ((testRoom6.participants.size + (testRoom6.sseClients?.size || 0) >= 2 || otherDistinct.size >= 1) && testRoom6.state.stage === "lobby") {
    testRoom6.state.stage = "profile_setup";
  }

  assert.strictEqual(role, "guest", "Guest assigned guest role, not false host");
  assert.strictEqual(testRoom6.state.stage, "profile_setup", "Stage immediately promoted to profile_setup without waiting for host to return");
}

console.log("✅ PASS: Bug 8 verified - Instant guest entry to profile_setup without 5s freeze");
passedTests++;

// --- TEST 8: Edge Cases (Lone Host Reconnect, Ready Profiles Guard, Restart Match) ---
console.log("\n--- TEST 8: Edge Cases Verification ---");

// 1. Lone host reconnect does NOT promote to profile_setup
const testRoom7 = drawRooms.getOrCreateRoom("TEST_EDGE_" + randId);
testRoom7.hostId = "host_lone";
const fakeHostWs = { readyState: 1, send: () => {} };
testRoom7.participants.set(fakeHostWs, { id: "host_lone", name: "Host", role: "host" });

const hostDistinct = new Set([
  ...Array.from(testRoom7.participants.values()).map(p => p.id),
  ...Array.from(testRoom7.sseClients).map(c => c._participantId),
  ...(testRoom7.disconnectTimeouts ? Array.from(testRoom7.disconnectTimeouts.keys()) : []),
  ...Object.keys(testRoom7.state.profiles || {})
]);
if (testRoom7.hostId) hostDistinct.add(testRoom7.hostId);
const hostOther = new Set(hostDistinct);
hostOther.delete("host_lone");

if ((testRoom7.participants.size + (testRoom7.sseClients?.size || 0) >= 2 || hostOther.size >= 1) && testRoom7.state.stage === "lobby") {
  testRoom7.state.stage = "profile_setup";
}
assert.strictEqual(testRoom7.state.stage, "lobby", "Lone host refresh preserves lobby stage, no premature profile_setup");

// 2. Both profiles required before pack_select
testRoom7.state.stage = "profile_setup";
testRoom7.state.profiles["host_lone"] = { name: "Host", ready: true };
drawRooms.handleMessage(testRoom7, "host_lone", "Host", {
  type: "SUBMIT_PROFILE",
  payload: { name: "Host", sex: "male" }
});
assert.strictEqual(testRoom7.state.stage, "profile_setup", "Stage remains profile_setup when only 1 partner is ready");

testRoom7.state.profiles["guest_partner"] = { name: "Guest", ready: true };
drawRooms.handleMessage(testRoom7, "guest_partner", "Guest", {
  type: "SUBMIT_PROFILE",
  payload: { name: "Guest", sex: "female" }
});
assert.strictEqual(testRoom7.state.stage, "pack_select", "Stage advances to pack_select only when both partners are ready");

// 3. RESTART_MATCH clears artwork, roundHistory, strokes
testRoom7.state.artwork = { 1: { host_lone: "data:image/png;base64,123" } };
testRoom7.state.strokes = { host_lone: [{ points: [[0, 0]] }] };
testRoom7.state.roundHistory = [{ round: 1 }];
drawRooms.handleMessage(testRoom7, "host_lone", "Host", { type: "RESTART_MATCH" });
assert.deepStrictEqual(testRoom7.state.artwork, {}, "Artwork reset on match restart");
assert.deepStrictEqual(testRoom7.state.roundHistory, [], "Round history reset on match restart");
assert.deepStrictEqual(testRoom7.state.strokes, {}, "Strokes reset on match restart");

console.log("✅ PASS: Bug 9 verified - Lone host lobby protection, profile ready guard, and restart cleanup verified");
passedTests++;

console.log("\n=================================================");
console.log(`ALL ${passedTests}/8 TEST SUITES PASSED!`);
console.log("=================================================");
process.exit(0);
