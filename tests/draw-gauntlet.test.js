// tests/draw-gauntlet.test.js
// Automated Verification Suite for /draw Multiplayer Real-Time Drawing Game

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("=================================================");
console.log("   RUNNING /draw MULTIPLAYER GAUNTLET SUITE");
console.log("=================================================\n");

let passedGates = 0;

// --- GATE 1: Core Files & Template Markup Existence ---
console.log("--- GATE 1: Files & Markup Structure ---");

const htmlPath = path.resolve(__dirname, "../public/draw.html");
const cssPath = path.resolve(__dirname, "../public/css/widgets/draw.css");
const runtimePath = path.resolve(__dirname, "../public/js/widgets/draw.runtime.js");
const roomServerPath = path.resolve(__dirname, "../server/draw-room.js");
const mainServerPath = path.resolve(__dirname, "../server/server.js");

assert(fs.existsSync(htmlPath), "public/draw.html must exist");
assert(fs.existsSync(cssPath), "public/css/widgets/draw.css must exist");
assert(fs.existsSync(runtimePath), "public/js/widgets/draw.runtime.js must exist");
assert(fs.existsSync(roomServerPath), "server/draw-room.js must exist");

const htmlContent = fs.readFileSync(htmlPath, "utf8");

// Verify all stages in HTML
assert(htmlContent.includes('id="stageLobby"'), "draw.html contains stageLobby");
assert(htmlContent.includes('id="stageProfile"'), "draw.html contains stageProfile");
assert(htmlContent.includes('id="stagePackSelect"'), "draw.html contains stagePackSelect");
assert(htmlContent.includes('id="stageMatchSetup"'), "draw.html contains stageMatchSetup");
assert(htmlContent.includes('id="stageDrawing"'), "draw.html contains stageDrawing");
assert(htmlContent.includes('id="stageRoundReview"'), "draw.html contains stageRoundReview");
assert(htmlContent.includes('id="stageMatchComplete"'), "draw.html contains stageMatchComplete");

// Verify Post-Join Profile Setup (Name & Sex required)
assert(htmlContent.includes('id="profileNameInput"'), "draw.html contains profileNameInput");
assert(htmlContent.includes('id="profileSexSelector"'), "draw.html contains profileSexSelector");
assert(htmlContent.includes('data-sex="female"'), "draw.html contains sex female button");
assert(htmlContent.includes('data-sex="male"'), "draw.html contains sex male button");
assert(!htmlContent.includes('data-sex="other"'), "draw.html does not contain sex other button");
assert(htmlContent.includes('cute-female'), "draw.html contains cute-female");
assert(htmlContent.includes('cute-male'), "draw.html contains cute-male");
assert(htmlContent.includes('id="btnStartRoundTimer"'), "draw.html contains btnStartRoundTimer");
assert(!htmlContent.includes('id="drawWaitingStartBanner"'), "draw.html does not contain drawWaitingStartBanner");
assert(htmlContent.includes('id="bottomStartWrap"'), "draw.html contains bottomStartWrap");
assert(htmlContent.includes('draw-round-ratio'), "draw.html contains draw-round-ratio");
assert(htmlContent.includes('id="btnProfileReady"'), "draw.html contains btnProfileReady");
assert(htmlContent.includes('id="profileWaitingWrap"'), "draw.html contains profileWaitingWrap");

// Verify Prompt Pack cards from Screenshot 1
assert(htmlContent.includes('data-pack="animals"'), "Pack card Animals present");
assert(htmlContent.includes('data-pack="food"'), "Pack card Food & Snacks present");
assert(htmlContent.includes('data-pack="random"'), "Pack card Random Doodles present");
assert(htmlContent.includes('data-pack="memories"'), "Pack card Our Memories present");
assert(htmlContent.includes('data-pack="draw_me"'), "Pack card Draw Me present");
assert(htmlContent.includes('data-pack="silly"'), "Pack card Silly & Weird present");
assert(htmlContent.includes('id="btnPackNext"'), "next ▷ button present");

// Verify Match Setup Controls from Screenshot 2
assert(htmlContent.includes('id="roundsSelector"'), "Rounds selector present");
assert(htmlContent.includes('data-rounds="3"'), "Rounds 3 option present");
assert(htmlContent.includes('data-rounds="4"'), "Rounds 4 option present");
assert(htmlContent.includes('data-rounds="5"'), "Rounds 5 option present");
assert(htmlContent.includes('data-rounds="7"'), "Rounds 7 option present");
assert(htmlContent.includes('id="secondsSelector"'), "Seconds selector present");
assert(htmlContent.includes('data-seconds="20"'), "Seconds 20s option present");
assert(htmlContent.includes('data-seconds="60"'), "Seconds 60s option present");
assert(htmlContent.includes('data-seconds="90"'), "Seconds 90s option present");
assert(htmlContent.includes('data-seconds="120"'), "Seconds 120s option present");
assert(htmlContent.includes('data-seconds="180"'), "Seconds 180s option present");
assert(htmlContent.includes('id="btnStartDrawing"'), "start drawing ▷ button present");

// Verify Drawing Arena Canvases & Controls from Screenshot 3 & 4
assert(htmlContent.includes('id="myCanvas"'), "myCanvas element present");
assert(htmlContent.includes('id="partnerCanvas"'), "partnerCanvas element present");
assert(htmlContent.includes('id="displayTimer"'), "displayTimer element present");
assert(htmlContent.includes('id="displayPrompt"'), "displayPrompt element present");
assert(htmlContent.includes('id="displayRoundNum"'), "displayRoundNum element present");
assert(htmlContent.includes('id="displayRoundTotal"'), "displayRoundTotal element present");
assert(htmlContent.includes('id="colorPalette"'), "colorPalette element present");
assert(htmlContent.includes('id="brushSizes"'), "brushSizes element present");
assert(htmlContent.includes('id="btnClearCanvas"'), "btnClearCanvas button present");
assert(htmlContent.includes('id="pokeButtons"'), "pokeButtons element present");
assert(htmlContent.includes("tap their pad to poke"), "Subtitle 'tap their pad to poke' present");

// Verify Photobooth-Style Lobby Buttons
assert(htmlContent.includes('ldr-menu-card ldr-card-dark'), "Start a room button uses photobooth ldr-card-dark");
assert(htmlContent.includes('ldr-menu-card ldr-card-light'), "Join a room button uses photobooth ldr-card-light");
assert(htmlContent.includes('ldr-inline-join-form'), "Inline join form present");
assert(htmlContent.includes('ldr-join-input'), "Join code input uses ldr-join-input");
assert(htmlContent.includes('ldr-pill-btn'), "Solo button uses ldr-pill-btn");

// Verify View Defaults to Side-by-Side & Solo Practice & Remote Cursor
assert(!htmlContent.includes('id="padViewTabs"'), "padViewTabs removed in favor of default side-by-side");
assert(htmlContent.includes('id="btnPracticeSolo"'), "btnPracticeSolo present");
assert(htmlContent.includes('id="drawRemoteCursor"'), "drawRemoteCursor element present");
assert(htmlContent.includes('id="remoteCursorTag"'), "remoteCursorTag element present");

// --- Template Parity Guard: public/draw.html <-> core/templates/draw.template.js ---
const templatePath = path.resolve(__dirname, "../core/templates/draw.template.js");
assert(fs.existsSync(templatePath), "core/templates/draw.template.js must exist");
const templateContent = fs.readFileSync(templatePath, "utf8");

const PARITY_MARKERS = [
  "stageLobby", "stageProfile", "stagePackSelect", "stageMatchSetup",
  "stageDrawing", "stageRoundReview", "stageMatchComplete",
  "lobby-split-layout", "draw-lobby-split-row", "draw-lobby-col-actions", "draw-lobby-col-showcase",
  "draw-how-it-works-showcase", "dhiw-prompt-pill", "dhiw-boards-row", "dhiw-board-pink", "dhiw-board-blue",
  "same prompt · two pens, live", "btnStartRoom", "btnShowJoinForm", "inputJoinCode", "btnJoinRoomSubmit",
  "btnPracticeSolo", "displayRoomCode", "btnCopyInvite", "waitingStatusText",
  "profileNameInput", "profileSexSelector", 'data-sex="female"', 'data-sex="male"',
  "btnProfileReady", "profileWaitingWrap", 'data-pack="animals"', 'data-pack="food"',
  'data-pack="random"', 'data-pack="memories"', 'data-pack="draw_me"', 'data-pack="silly"',
  "btnPackNext", "roundsSelector", "secondsSelector", "btnStartDrawing",
  "myCanvas", "partnerCanvas", "displayTimer", "displayPrompt", "displayRoundNum", "displayRoundTotal",
  "colorPalette", "brushSizes", "btnClearCanvas", "pokeButtons", "drawRemoteCursor", "remoteCursorTag"
];

PARITY_MARKERS.forEach(marker => {
  assert(htmlContent.includes(marker), `[Parity Guard] Missing in public/draw.html: "${marker}"`);
  assert(templateContent.includes(marker), `[Parity Guard] Missing in core/templates/draw.template.js: "${marker}"`);
});

// --- SSoT Architecture Guard ---
const drawTemplateModule = require(templatePath);
assert(typeof drawTemplateModule.renderStandalonePage === "function", "draw.template.js exports renderStandalonePage()");
assert(typeof drawTemplateModule.renderDrawApp === "function", "draw.template.js exports renderDrawApp()");
assert(typeof drawTemplateModule.renderShowcaseCard === "function", "draw.template.js exports renderShowcaseCard()");
assert.strictEqual(htmlContent.trim(), drawTemplateModule.renderStandalonePage().trim(), "public/draw.html is byte-identical to renderStandalonePage() SSoT output");

console.log("✅ PASS: Gate 1 verified (including Standalone ⟷ Template SSoT Byte-Identity Guard)");
passedGates++;

// --- GATE 2: Server Routing & API Endpoints ---
console.log("\n--- GATE 2: Server.js Routing & API Attachments ---");

const serverContent = fs.readFileSync(mainServerPath, "utf8");

assert(serverContent.includes('setupDrawWebSocket'), "server.js imports setupDrawWebSocket");
assert(serverContent.includes('pathname === "/draw"'), "server.js routes /draw");
assert(serverContent.includes('pathname.startsWith("/draw/")'), "server.js routes /draw/:code");
assert(serverContent.includes('/api/draw/rooms/'), "server.js mounts /api/draw/rooms/ routes");
assert(serverContent.includes('/draw-ws'), "server.js mounts WebSocket on /draw-ws");

console.log("✅ PASS: Gate 2 verified");
passedGates++;

// --- GATE 3: Room Server Data Logic & Prompt Packs ---
console.log("\n--- GATE 3: DrawRoomServer Logic & Prompt Data ---");

const { drawRooms, PROMPT_PACKS } = require("../server/draw-room");

assert(PROMPT_PACKS.animals && PROMPT_PACKS.animals.prompts.length === 16, "Animals pack has 16 prompts");
assert(PROMPT_PACKS.food && PROMPT_PACKS.food.prompts.length === 12, "Food pack has 12 prompts");
assert(PROMPT_PACKS.random && PROMPT_PACKS.random.prompts.length === 12, "Random pack has 12 prompts");
assert(PROMPT_PACKS.memories && PROMPT_PACKS.memories.prompts.length === 11, "Memories pack has 11 prompts");
assert(PROMPT_PACKS.draw_me && PROMPT_PACKS.draw_me.prompts.length === 10, "Draw Me pack has 10 prompts");
assert(PROMPT_PACKS.silly && PROMPT_PACKS.silly.prompts.length === 10, "Silly pack has 10 prompts");

assert(
  PROMPT_PACKS.memories.prompts.includes("The last time we laughed really hard"),
  "Memories pack includes 'The last time we laughed really hard' from screenshot"
);

const testRoomCode = "TEST_" + Date.now();
const testRoom = drawRooms.getOrCreateRoom(testRoomCode);

assert.strictEqual(testRoom.code, testRoomCode, "Room code matches");
assert.strictEqual(testRoom.state.stage, "lobby", "Initial stage is lobby");
assert.strictEqual(testRoom.state.roundsTotal, 3, "Initial rounds total is 3");
assert.strictEqual(testRoom.state.secondsPerDrawing, 120, "Initial seconds is 120");

console.log("✅ PASS: Gate 3 verified");
passedGates++;

// --- GATE 4: Message Handling, Stroke Sync, and Pokes ---
console.log("\n--- GATE 4: Stroke Transmission, Pokes, and Match Flow ---");

const fakeMessages = [];
const fakeClient1 = {
  readyState: 1,
  send: (msg) => fakeMessages.push(JSON.parse(msg))
};
const fakeClient2 = {
  readyState: 1,
  send: (msg) => fakeMessages.push(JSON.parse(msg))
};

// Simulate both users joined room -> profile_setup stage
testRoom.participants.set(fakeClient1, { id: "user_1", name: "Partner 1", role: "host" });
testRoom.participants.set(fakeClient2, { id: "user_2", name: "Partner 2", role: "guest" });
testRoom.state.stage = "profile_setup";

// User 1 submits profile (Name + Sex required post-join)
drawRooms.handleMessage(testRoom, "user_1", "tella", {
  type: "SUBMIT_PROFILE",
  payload: { name: "Tella", sex: "female" }
});
assert(testRoom.state.profiles["user_1"], "Profile recorded for user 1");
assert.strictEqual(testRoom.state.profiles["user_1"].name, "Tella", "User 1 name set to Tella");
assert.strictEqual(testRoom.state.profiles["user_1"].sex, "female", "User 1 sex set to female");
assert.strictEqual(testRoom.state.stage, "profile_setup", "Stage remains profile_setup waiting for partner 2");

// User 2 submits profile (Name + Sex required post-join)
drawRooms.handleMessage(testRoom, "user_2", "alex", {
  type: "SUBMIT_PROFILE",
  payload: { name: "Alex", sex: "male" }
});
assert(testRoom.state.profiles["user_2"], "Profile recorded for user 2");
assert.strictEqual(testRoom.state.profiles["user_2"].name, "Alex", "User 2 name set to Alex");
assert.strictEqual(testRoom.state.profiles["user_2"].sex, "male", "User 2 sex set to male");
assert.strictEqual(testRoom.state.stage, "pack_select", "Stage transitions to pack_select once both profiles completed");

const profilesCompletedMsg = fakeMessages.find(m => m.type === "PROFILES_COMPLETED");
assert(profilesCompletedMsg, "PROFILES_COMPLETED event broadcasted");

// Test Pack Selection
drawRooms.handleMessage(testRoom, "user_1", "Tella", {
  type: "SELECT_PACK",
  payload: { packId: "food" }
});
assert.strictEqual(testRoom.state.selectedPack, "food", "selectedPack updated to food");

// Test Match Config
drawRooms.handleMessage(testRoom, "user_1", "tella", {
  type: "SET_MATCH_CONFIG",
  payload: { roundsTotal: 5, secondsPerDrawing: 90 }
});
assert.strictEqual(testRoom.state.roundsTotal, 5, "roundsTotal updated to 5");
assert.strictEqual(testRoom.state.secondsPerDrawing, 90, "secondsPerDrawing updated to 90");

// Test Start Match ("before they start drawing, one of the users needs to click, start")
drawRooms.handleMessage(testRoom, "user_2", "Alex", {
  type: "START_MATCH"
});
assert.strictEqual(testRoom.state.stage, "drawing", "Stage transitioned to drawing");
assert.strictEqual(testRoom.state.currentRound, 1, "Current round is 1");
assert(testRoom.state.currentPrompt.length > 0, "Prompt assigned from pack");
assert.strictEqual(testRoom.state.timerRunning, false, "Timer is paused until start clicked on draw page");

// Start round timer explicitly on draw page
drawRooms.handleMessage(testRoom, "user_1", "tella", {
  type: "START_ROUND_TIMER"
});
assert.strictEqual(testRoom.state.timerRunning, true, "Timer is running after START_ROUND_TIMER");

// Test Stroke Sync
const sampleStroke = {
  color: "#5fa0ff",
  size: 5,
  points: [[0.1, 0.2], [0.15, 0.25], [0.2, 0.3]]
};

drawRooms.handleMessage(testRoom, "user_1", "tella", {
  type: "DRAW_STROKE",
  payload: { stroke: sampleStroke }
});
assert(testRoom.state.strokes["user_1"], "User 1 strokes initialized");
assert.strictEqual(testRoom.state.strokes["user_1"].length, 1, "Stroke recorded");
assert.deepStrictEqual(testRoom.state.strokes["user_1"][0].points, sampleStroke.points, "Stroke points preserved");

// Test Poke
let pokeReceived = false;
testRoom.participants.set(fakeClient2, { id: "user_2", name: "Alex", role: "guest" });

drawRooms.handleMessage(testRoom, "user_1", "tella", {
  type: "SEND_POKE",
  payload: { emoji: "💖", x: 0.5, y: 0.5 }
});

const pokeMsg = fakeMessages.find(m => m.type === "POKE_EVENT");
assert(pokeMsg, "Poke event broadcasted");
assert.strictEqual(pokeMsg.emoji, "💖", "Poke emoji matches");
assert.strictEqual(pokeMsg.senderId, "user_1", "Poke sender matches");

// Test Remote Cursor Move
drawRooms.handleMessage(testRoom, "user_1", "tella", {
  type: "CURSOR_MOVE",
  payload: { x: 0.42, y: 0.78 }
});
const cursorMsg = fakeMessages.find(m => m.type === "REMOTE_CURSOR");
assert(cursorMsg, "Remote cursor event broadcasted");
assert.strictEqual(cursorMsg.x, 0.42, "Cursor x coordinate matches");
assert.strictEqual(cursorMsg.y, 0.78, "Cursor y coordinate matches");
assert.strictEqual(cursorMsg.senderId, "user_1", "Cursor sender matches");

// Clean up timer
if (testRoom.timerInterval) clearInterval(testRoom.timerInterval);

console.log("✅ PASS: Gate 4 verified");
passedGates++;

// --- GATE 5: Navigation Links in Builder & Landing Page ---
console.log("\n--- GATE 5: Navigation Links in Builder & Landing Page ---");

const builderContent = fs.readFileSync(path.resolve(__dirname, "../builder/index.html"), "utf8");
const landingContent = fs.readFileSync(path.resolve(__dirname, "../public/index.html"), "utf8");

assert(builderContent.includes('href="/draw"'), "builder/index.html contains /draw button link");
assert(builderContent.includes('id="btnNavDraw"'), "builder/index.html contains btnNavDraw ID");
assert(landingContent.includes('href="/draw"'), "public/index.html contains /draw link");

console.log("✅ PASS: Gate 5 verified");
passedGates++;

// --- GATE 6: CSS & Runtime Pixel-Fidelity Check ---
console.log("\n--- GATE 6: CSS & Runtime Pixel-Fidelity Check ---");

const cssContent = fs.readFileSync(cssPath, "utf8");
const runtimeContent = fs.readFileSync(runtimePath, "utf8");

assert(cssContent.includes("#f8f9fb"), "CSS uses authentic background #f8f9fb");
assert(cssContent.includes(".draw-round-col"), "CSS styles stacked round column");
assert(cssContent.includes(".poke-particle"), "CSS defines floating poke particle");
assert(cssContent.includes(".poke-ripple"), "CSS defines expanding ripple animation");
assert(cssContent.includes(".draw-sex-selector"), "CSS defines .draw-sex-selector");
assert(cssContent.includes(".draw-sex-btn"), "CSS defines .draw-sex-btn");
assert(cssContent.includes(".draw-pad-badge.pink"), "CSS defines .draw-pad-badge.pink");
assert(cssContent.includes(".draw-pad-badge.blue"), "CSS defines .draw-pad-badge.blue");
assert(cssContent.includes(".draw-pad-badge.purple"), "CSS defines .draw-pad-badge.purple");
assert(cssContent.includes(".ldr-menu-card"), "CSS defines .ldr-menu-card");
assert(cssContent.includes(".ldr-card-dark"), "CSS defines .ldr-card-dark");
assert(cssContent.includes(".ldr-card-light"), "CSS defines .ldr-card-light");
assert(cssContent.includes(".ldr-join-input"), "CSS defines .ldr-join-input");
assert(cssContent.includes(".ldr-pill-btn"), "CSS defines .ldr-pill-btn");
assert(runtimeContent.includes("quadraticCurveTo"), "Runtime employs Bézier curve smoothing");
assert(runtimeContent.includes("startSoloMatch"), "Runtime supports solo testing practice");
assert(runtimeContent.includes("SUBMIT_PROFILE"), "Runtime sends SUBMIT_PROFILE");
assert(runtimeContent.includes("PROFILES_COMPLETED"), "Runtime handles PROFILES_COMPLETED");
assert(runtimeContent.includes("profileSexSelector"), "Runtime handles profileSexSelector");
assert(cssContent.includes(".draw-remote-cursor"), "CSS defines .draw-remote-cursor");
assert(runtimeContent.includes("CURSOR_MOVE"), "Runtime sends CURSOR_MOVE");
assert(runtimeContent.includes("REMOTE_CURSOR"), "Runtime handles REMOTE_CURSOR");

console.log("✅ PASS: Gate 6 verified");
passedGates++;

console.log("\n=================================================");
console.log(`GAUNTLET SUMMARY: ${passedGates}/6 GATES PASSED`);
console.log("🎉 ALL MULTIPLAYER DRAW GAUNTLET GATES PASSED!");
console.log("=================================================");
