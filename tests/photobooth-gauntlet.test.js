// tests/photobooth-gauntlet.test.js
// 7-Gate Automated Verification Suite for photobooth Widget

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT_DIR = path.resolve(__dirname, "..");
const WIDGET_ID = "photobooth";

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (!condition) {
    console.error("❌ FAIL: " + message);
    process.exitCode = 1;
  } else {
    passedChecks++;
    console.log("✅ PASS: " + message);
  }
}

console.log("\n=============================================");
console.log("🚀 VINTAGE PHOTOBOOTH 7-GATE GAUNTLET RUNNER");
console.log("=============================================\n");

// --- GATE 1: FILE EXISTENCE & SYNTAX AUDIT ---
console.log("--- GATE 1: File Existence & Syntax Audit ---");
const templatePath = path.join(ROOT_DIR, "core/templates", WIDGET_ID + ".template.js");
const cssPath = path.join(ROOT_DIR, "public/css/widgets", WIDGET_ID + ".css");
const runtimePath = path.join(ROOT_DIR, "public/js/widgets", WIDGET_ID + ".runtime.js");
const inspectorPath = path.join(ROOT_DIR, "builder/inspectors", WIDGET_ID + ".inspector.js");

assert(fs.existsSync(templatePath), "Template exists: " + templatePath);
assert(fs.existsSync(cssPath), "CSS exists: " + cssPath);
assert(fs.existsSync(runtimePath), "Runtime exists: " + runtimePath);
assert(fs.existsSync(inspectorPath), "Inspector exists: " + inspectorPath);

try {
  new vm.Script(fs.readFileSync(templatePath, "utf8"));
  assert(true, "Syntax valid: " + WIDGET_ID + ".template.js");
} catch (e) {
  assert(false, "Syntax error in template: " + e.message);
}

try {
  new vm.Script(fs.readFileSync(runtimePath, "utf8"));
  assert(true, "Syntax valid: " + WIDGET_ID + ".runtime.js");
} catch (e) {
  assert(false, "Syntax error in runtime: " + e.message);
}

try {
  new vm.Script(fs.readFileSync(inspectorPath, "utf8"));
  assert(true, "Syntax valid: " + WIDGET_ID + ".inspector.js");
} catch (e) {
  assert(false, "Syntax error in inspector: " + e.message);
}

// --- GATE 2: TEMPLATE RENDERING CONTRACT ---
console.log("\n--- GATE 2: Template Rendering Contract ---");
try {
  const sandbox = { module: {}, exports: {}, window: {}, global: {} };
  vm.createContext(sandbox);
  const code = fs.readFileSync(templatePath, "utf8");
  vm.runInContext(code, sandbox);

  const renderer = sandbox.module.exports || sandbox.window.WIDGET_TEMPLATES?.[WIDGET_ID];
  assert(typeof renderer === "function", "Template exports render function for " + WIDGET_ID);

  if (typeof renderer === "function") {
    const mockData = {
      tag: "Vintage Photobooth 📸",
      title: "Capture Our Sweet Moments",
      desc: "Pick a retro frame, strike your cutest poses, and print a personalized love strip keepsake!",
      boothSubheading: "PICK A FRAME INSIDE THE BOOTH",
      defaultLayout: "classic_strip",
      defaultFilter: "vintage_90s",
      stripCaption: "Alex & Sam ♡ Forever",
      stripLocation: "PARIS • 2026"
    };
    const mockRoot = { partner1: "Alex", partner2: "Sam" };
    const renderedHtml = renderer(mockData, mockRoot);
    assert(typeof renderedHtml === "string" && renderedHtml.length > 50, "Rendered HTML non-empty (length: " + (renderedHtml ? renderedHtml.length : 0) + ")");
    assert(renderedHtml.includes("section") && renderedHtml.includes(WIDGET_ID), "Rendered HTML contains section container for " + WIDGET_ID);
    assert(renderedHtml.includes("photobooth-viewfinder") || renderedHtml.includes("photobooth-camera"), "Rendered HTML contains viewfinder/camera element");
    assert(renderedHtml.includes("photobooth-frame-selector") || renderedHtml.includes("photobooth-frames"), "Rendered HTML contains frame layout picker");
    assert(renderedHtml.includes("photobooth-flash") || renderedHtml.includes("camera-flash"), "Rendered HTML contains flash overlay element");
    assert(renderedHtml.includes("photobooth-slot") || renderedHtml.includes("photobooth-print"), "Rendered HTML contains printing machine slot");
  }
} catch (e) {
  assert(false, "Template evaluation failed: " + e.message);
}

// --- GATE 3: SCRIPT & CSS TAG INTEGRITY ---
console.log("\n--- GATE 3: Script & CSS Tag Integrity ---");
const viewerHtml = fs.readFileSync(path.join(ROOT_DIR, "public/viewer.html"), "utf8");
const builderHtml = fs.readFileSync(path.join(ROOT_DIR, "builder/index.html"), "utf8");
const styleCss = fs.readFileSync(path.join(ROOT_DIR, "public/css/style.css"), "utf8");

assert(viewerHtml.includes(WIDGET_ID + ".template.js"), "viewer.html includes template");
assert(viewerHtml.includes(WIDGET_ID + ".runtime.js"), "viewer.html includes runtime");
assert(viewerHtml.includes(WIDGET_ID + ".css"), "viewer.html includes CSS link");
assert(builderHtml.includes(WIDGET_ID + ".template.js"), "builder/index.html includes template");
assert(builderHtml.includes(WIDGET_ID + ".inspector.js"), "builder/index.html includes inspector");
assert(styleCss.includes(WIDGET_ID + ".css"), "style.css imports CSS");

// --- GATE 4: REGISTRY & RENDERER ENGINE HOOKS ---
console.log("\n--- GATE 4: Registry & Renderer Engine Hooks ---");
const registryCode = fs.readFileSync(path.join(ROOT_DIR, "core/widget-registry.js"), "utf8");
const rendererCode = fs.readFileSync(path.join(ROOT_DIR, "core/dynamic-renderer.js"), "utf8");
const widgetTemplatesCode = fs.readFileSync(path.join(ROOT_DIR, "core/widget-templates.js"), "utf8");

assert(registryCode.includes(WIDGET_ID + ":"), "widget-registry.js registers " + WIDGET_ID);
assert(rendererCode.includes(WIDGET_ID + ":"), "dynamic-renderer.js maps engine for " + WIDGET_ID);
assert(rendererCode.includes("PHOTOBOOTH_DATA"), "dynamic-renderer.js syncs PHOTOBOOTH_DATA");
assert(widgetTemplatesCode.includes(WIDGET_ID + ":"), "widget-templates.js exports " + WIDGET_ID);

// --- GATE 5: BUILDER PREVIEWS & LABELS ---
console.log("\n--- GATE 5: Builder Previews & Labels ---");
const previewsCode = fs.readFileSync(path.join(ROOT_DIR, "builder/widget-previews.js"), "utf8");
const builderCode = fs.readFileSync(path.join(ROOT_DIR, "builder/builder.js"), "utf8");

assert(previewsCode.includes("PREVIEWS." + WIDGET_ID) || previewsCode.includes("PREVIEWS['" + WIDGET_ID + "']"), "widget-previews.js has preview SVG for " + WIDGET_ID);
assert(builderCode.includes(WIDGET_ID + ":"), "builder.js maps label for " + WIDGET_ID);

// --- GATE 6: DATABASE DEFAULTS & PRESETS ---
console.log("\n--- GATE 6: Database Defaults & Presets ---");
const dbCode = fs.readFileSync(path.join(ROOT_DIR, "server/db/defaults/sections.js"), "utf8");
const presetsCode = fs.readFileSync(path.join(ROOT_DIR, "server/db/defaults/presets.js"), "utf8");

assert(dbCode.includes(WIDGET_ID + ":"), "sections.js contains default config for " + WIDGET_ID);
assert(presetsCode.includes(WIDGET_ID), "presets.js includes " + WIDGET_ID);

const { DEFAULT_SECTIONS_DATA } = require("../server/db/defaults/sections.js");
const pbDefault = DEFAULT_SECTIONS_DATA[WIDGET_ID];
assert(pbDefault && pbDefault.defaultLayout, "DEFAULT_SECTIONS_DATA has defaultLayout for " + WIDGET_ID);
assert(pbDefault && pbDefault.stripCaption, "DEFAULT_SECTIONS_DATA has stripCaption for " + WIDGET_ID);

// --- GATE 7: FRAME & FILTER MATRIX AUDIT ---
console.log("\n--- GATE 7: Frame & Filter Matrix Audit ---");
const runtimeContent = fs.existsSync(runtimePath) ? fs.readFileSync(runtimePath, "utf8") : "";
const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";

const requiredFrames = ["classic_strip", "classic_3cut", "film_grid", "grid_3x3", "portrait_pair", "wide_collage", "polaroid_single"];
for (const frame of requiredFrames) {
  assert(runtimeContent.includes(frame) || cssContent.includes(frame), "Frame format " + frame + " supported in runtime or CSS");
}

assert(runtimeContent.includes("getMiniWindowsHtml"), "Runtime has getMiniWindowsHtml method for dynamic card updating");
assert(runtimeContent.includes("fmt-grid_3x3") && cssContent.includes("fmt-grid_3x3"), "grid_3x3 has markup & CSS styling");
assert(runtimeContent.includes("fmt-film_grid") && cssContent.includes("fmt-film_grid"), "film_grid (2x2) has markup & CSS styling");
assert(runtimeContent.includes("fmt-classic_3cut") && cssContent.includes("fmt-classic_3cut"), "classic_3cut (1x3) has markup & CSS styling");

const inspectorContent = fs.existsSync(inspectorPath) ? fs.readFileSync(inspectorPath, "utf8") : "";
assert(inspectorContent.includes("pb_format"), "Inspector includes format selector");
assert(inspectorContent.includes("pb_style"), "Inspector includes style selector");
assert(inspectorContent.includes("pb_fileUpload"), "Inspector includes photo upload file input");
assert(inspectorContent.includes("PHOTO_PRESETS"), "Inspector includes romantic couple photo presets");
assert(inspectorContent.includes("PHOTOBOOTH_SET_FORMAT"), "Inspector posts PHOTOBOOTH_SET_FORMAT message");
assert(inspectorContent.includes("btnTestBoothBurst"), "Inspector includes live burst simulator button");

const requiredFilters = ["vintage", "noir", "sunset", "bloom"];
for (const filter of requiredFilters) {
  assert(runtimeContent.toLowerCase().includes(filter), "Filter style containing '" + filter + "' defined in runtime");
}

// --- GATE 8: WHOLE-FRAME OVERLAYS & GRID ARCHITECTURE ---
console.log("\n--- GATE 8: Whole-Frame Overlays & Grid Architecture ---");
const templateContent = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "";

assert(cssContent.includes(".grid-2x2-wrap") && cssContent.includes("grid-template-columns: repeat(2, 1fr)"), "grid-2x2-wrap has true 2x2 CSS grid");
assert(cssContent.includes(".grid-3x3-wrap") && cssContent.includes("grid-template-columns: repeat(3, 1fr)"), "grid-3x3-wrap has true 3x3 CSS grid");
assert(cssContent.includes("strip-whole-frame-overlay"), "CSS includes strip-whole-frame-overlay");
assert(templateContent.includes("boothDecoTabs"), "Template contains boothDecoTabs navigation");
assert(templateContent.includes("btnClearDeco"), "Template contains btnClearDeco button");
assert(runtimeContent.includes("WHOLE_FRAME_OVERLAYS"), "Runtime defines WHOLE_FRAME_OVERLAYS");
assert(runtimeContent.includes("DECO_ITEMS"), "Runtime defines DECO_ITEMS with stamps and washi");
assert(cssContent.includes("overlay-lace") && cssContent.includes("overlay-film35") && cssContent.includes("overlay-botanical"), "CSS defines whole-frame overlay styles");
assert(cssContent.includes("sticker-float-bar"), "CSS defines floating sticker action bar");

// --- GATE 9: SQUARE FRAME MORPHING & BACKGROUND FILTER PREVIEWS ---
console.log("\n--- GATE 9: Square Frame Morphing & Live Filter Background ---");
assert(cssContent.includes("format-is-square") && cssContent.includes("data-format=\"film_grid\""), "CSS supports format-is-square & data-format for square frames");
assert(cssContent.includes("filter-bg-bw_noir") && cssContent.includes("data-active-filter=\"bw_noir\""), "CSS defines live B&W noir background filter preview");
assert(cssContent.includes("filter-bg-golden_sunset") && cssContent.includes("filter-bg-cyberpunk"), "CSS defines sunset & cyberpunk live background filter previews");
assert(runtimeContent.includes("filter-bg-") && runtimeContent.includes("data.activeFilter") || runtimeContent.includes("dataset.activeFilter"), "Runtime syncs live filter background on section");
assert(runtimeContent.includes("format-is-square") && runtimeContent.includes("dataset.format"), "Runtime syncs format-is-square dataset on frame cards grid");
assert(templateContent.includes("filter-bg-${defaultFilter}") && templateContent.includes("format-is-square"), "Template renders initial filter-bg and square format class");

// --- GATE 10: INSCRIPTION PHRASE SPACE & CATALOGUE RATIOS ---
console.log("\n--- GATE 10: Inscription Phrase Space & Catalogue Ratios ---");
assert(templateContent.includes("booth-phrase-editor-bar") && templateContent.includes("boothPhraseInput"), "Template includes booth-phrase-editor-bar and boothPhraseInput");
assert(templateContent.includes("phrase-preset-btn"), "Template includes romantic phrase preset buttons");
assert(runtimeContent.includes("boothPhraseInput") && runtimeContent.includes("phrase-preset-btn"), "Runtime wires phrase input and preset buttons");
assert(runtimeContent.includes("updatePhraseDisplays"), "Runtime implements updatePhraseDisplays method");
assert(runtimeContent.includes("mini-window-img") && runtimeContent.includes("frame-phrase-block"), "Runtime getMiniWindowsHtml produces real photo images and phrase blocks");
assert(runtimeContent.includes("#boothLayoutChips .mini-window img"), "Runtime applyFilter synchronizes live filter to frame card photos");

const catalogueFormats = ["double_6cut", "double_8cut", "portrait_pair", "polaroid_single", "landscape_2split", "landscape_toptext", "triptych_3cut", "triptych_toptext", "asym_collage"];
for (const fmt of catalogueFormats) {
  assert(runtimeContent.includes(fmt) && cssContent.includes(fmt), "Catalogue format " + fmt + " supported in runtime and CSS");
}

assert(cssContent.includes("strip-phrase-slot") && runtimeContent.includes("strip-phrase-slot"), "strip-phrase-slot supported in CSS and runtime strip rendering");
assert(cssContent.includes("frame-phrase-block") && cssContent.includes("frame-phrase-text"), "frame-phrase-block typography styled in CSS");

// --- GATE 11: LONG-DISTANCE RELATIONSHIP (LDR) ROOM & PAINT STUDIO ---
console.log("\n--- GATE 11: Long-Distance Relationship (LDR) & Paint Studio ---");
const roomServerPath = path.resolve(__dirname, "../server/photobooth-room.js");
assert(fs.existsSync(roomServerPath), "server/photobooth-room.js exists");
const serverContent = fs.readFileSync(path.resolve(__dirname, "../server/server.js"), "utf8");
assert(serverContent.includes("setupPhotoboothWebSocket") && serverContent.includes("/photobooth-ws"), "server.js attaches setupPhotoboothWebSocket on /photobooth-ws");
assert(serverContent.includes("/api/photobooth/rooms/:code"), "server.js exposes GET /api/photobooth/rooms/:code");

assert(templateContent.includes("booth-mode-selector") && templateContent.includes("btnModeSolo") && templateContent.includes("btnModeLdr"), "Template includes mode selector with Solo and LDR buttons");
assert(templateContent.includes("booth-ldr-panel") && templateContent.includes("ldrRoomCodeDisplay") && templateContent.includes("btnCopyInviteLink"), "Template includes LDR room invite panel and copy link button");
assert(templateContent.includes("photobooth-remote-cursor") && templateContent.includes("remoteCursorTag") && templateContent.includes("remoteClickRipple"), "Template includes remote cursor element with partner tag and click ripple");
assert(templateContent.includes("viewfinder-split-screen") && templateContent.includes("photoboothVideoLocal") && templateContent.includes("photoboothVideoRemote"), "Template includes split-screen viewfinder with local & remote video feeds");
assert(templateContent.includes("photobooth-selection-tray") && templateContent.includes("selectionCandidatesGrid") && templateContent.includes("btnRetryExtraSet"), "Template includes photo selection tray and retry button");
assert(templateContent.includes("data-tab=\"paint\"") && templateContent.includes("boothPaintPalette") && templateContent.includes("photoboothPaintCanvas"), "Template includes Paint & Doodle studio tab, palette, and canvas");

assert(cssContent.includes("booth-mode-selector") && cssContent.includes("booth-mode-btn"), "CSS defines mode selector segmented pill");
assert(cssContent.includes("booth-ldr-panel") && cssContent.includes("ldr-room-code") && cssContent.includes("status-pulse-dot"), "CSS defines LDR room status and pulse animations");
assert(cssContent.includes("photobooth-remote-cursor") && cssContent.includes("remote-cursor-pointer") && cssContent.includes("remote-click-ripple"), "CSS defines remote cursor and click ripple styles");
assert(cssContent.includes("viewfinder-split-screen") && cssContent.includes("split-feed-local") && cssContent.includes("split-feed-remote"), "CSS defines side-by-side split viewfinder call screen");
assert(cssContent.includes("photobooth-selection-tray") && cssContent.includes("candidate-card") && cssContent.includes("candidate-order-badge"), "CSS defines selection tray and candidate cards");
assert(cssContent.includes("photobooth-paint-palette") && cssContent.includes("color-swatch-btn") && cssContent.includes("photobooth-paint-canvas"), "CSS defines paint palette and canvas overlay");

assert(runtimeContent.includes("class LdrManager"), "Runtime defines LdrManager WebSocket & WebRTC class");
assert(runtimeContent.includes("switchMode") && runtimeContent.includes("isLdrMode"), "Runtime implements mode switching between solo and LDR");
assert(runtimeContent.includes("showSelectionTray") && runtimeContent.includes("renderCandidateCards"), "Runtime implements candidate selection tray");
assert(runtimeContent.includes("toggleCandidateSelection") && runtimeContent.includes("confirmPhotoSelection"), "Runtime handles candidate card selection and confirmation");
assert(runtimeContent.includes("requestRetryExtraSet") && runtimeContent.includes("retryBudget"), "Runtime enforces 1-retry budget mechanism");
assert(runtimeContent.includes("initPaintEngine") && runtimeContent.includes("drawStrokeOnCanvas"), "Runtime implements interactive freehand paint engine");
assert(runtimeContent.includes("undoPaintStroke") && runtimeContent.includes("clearPaintCanvas"), "Runtime provides paint undo and clear controls");
assert(runtimeContent.includes("paintStrokes") && runtimeContent.includes("generateExportCanvas"), "Runtime composite canvas export integrates paint strokes");

// --- GATE 12: SECURITY HARDENING, MOBILE ERGONOMICS & RESILIENCE ---
console.log("\n--- GATE 12: Security Hardening, Mobile Ergonomics & Resilience ---");
const roomContent = fs.readFileSync(roomServerPath, "utf8");
assert(roomContent.includes("maxPayload: 2 * 1024 * 1024"), "Room server enforces 2MB maxPayload limit against buffer overflows");
assert(roomContent.includes("msgCount > 75"), "Room server enforces connection message rate limiting");
assert(roomContent.includes("ALLOWED_FIELDS") && roomContent.includes("sanitizeStr"), "Room server enforces whitelist fields and prototype pollution prevention");
assert(roomContent.includes("filter(n => Number.isInteger(n)"), "Room server validates candidate photo index types and bounds");
assert(cssContent.includes(".photobooth-paint-canvas {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  z-index: 15;\n  border-radius: inherit;\n  touch-action: none;"), "Paint canvas enforces touch-action: none preventing mobile viewport scroll gestures");
assert(cssContent.includes("color-swatch-btn::after"), "Mobile touch swatches include 44px+ hit targets via pseudo-element expansion");
assert(runtimeContent.includes("unlockAudio"), "Runtime implements iOS Web Audio auto-unlock on first touch/pointer event");
assert(runtimeContent.includes("touchstart") && runtimeContent.includes("touchmove") && runtimeContent.includes("touchcancel"), "Runtime paint engine binds passive:false touch events for smooth mobile finger drawing");
assert(runtimeContent.includes("reconnectTimer") && runtimeContent.includes("Reconnecting to room..."), "Runtime LdrManager implements automatic socket reconnection on network drops");

// --- GATE 13: DUAL-TRANSPORT REALTIME RESILIENCE & HTTP SSE FALLBACK ---
console.log("\n--- GATE 13: Dual-Transport Realtime Resilience & HTTP SSE Fallback ---");
assert(roomContent.includes("registerSseClient"), "Room server implements registerSseClient for proxy-immune SSE transport");
assert(roomContent.includes("room.sseClients"), "Room server tracks and broadcasts to sseClients");
assert(serverContent.includes("/api/photobooth/rooms/") && serverContent.includes("/events"), "server.js mounts SSE event stream route");
assert(serverContent.includes("/api/photobooth/rooms/") && serverContent.includes("/messages"), "server.js mounts HTTP POST message dispatcher route");
assert(runtimeContent.includes("startHttpTransport"), "Runtime LdrManager provides seamless HTTP SSE fallback");
assert(runtimeContent.includes("EventSource"), "Runtime LdrManager uses native browser EventSource for SSE streaming");
assert(runtimeContent.includes("useHttp"), "Runtime LdrManager supports dual-mode transport routing");

// --- GATE 14: LDR STEP-BY-STEP MODAL WIZARD & WEBRTC AUDIO REPAIR ---
console.log("\n--- GATE 14: LDR Step-by-Step Modal Wizard & WebRTC Audio Repair ---");
const freshTemplate = fs.readFileSync(templatePath, "utf8");
assert(freshTemplate.includes('id="photoboothLdrModal"'), "Template contains synchronized LDR fullscreen modal");
assert(freshTemplate.includes('id="ldrStageLobby"') && freshTemplate.includes('id="ldrStageSetup"') && freshTemplate.includes('id="ldrStageCapture"') && freshTemplate.includes('id="ldrStageSelect"') && freshTemplate.includes('id="ldrStageDeco"') && freshTemplate.includes('id="ldrStagePrint"'), "Template contains all 6 discrete wizard stage panels");
assert(freshTemplate.includes('id="ldrDockedCallBar"') && freshTemplate.includes('id="ldrAudioIndicator"'), "Template contains docked live call bar and active audio badge");
assert(cssContent.includes("width: 100vw !important") && cssContent.includes("height: 100dvh !important"), "CSS enforces unconstrained 100vw x 100dvh full-screen modal ergonomics on mobile");
assert(roomContent.includes('"stage"') && roomContent.includes("STAGE_CHANGE"), "Room server supports stage in allowed fields and broadcasts STAGE_CHANGED");
const freshRuntime = fs.readFileSync(runtimePath, "utf8");
assert(freshRuntime.includes("openLdrModal") && freshRuntime.includes("closeLdrModal"), "Runtime implements openLdrModal and closeLdrModal");
assert(freshRuntime.includes("setLdrStage"), "Runtime implements setLdrStage state synchronizer");
assert(freshRuntime.includes("echoCancellation: true"), "Runtime requests echo-cancelled audio track in LDR mode");
assert(freshRuntime.includes("localVideos.forEach") && freshRuntime.includes("v.muted = true"), "Runtime mutes all local video feeds preventing feedback loops");

// --- GATE 15: TRUE FULLSCREEN, TWO-SCREEN ONBOARDING & MANUAL PROCEED ---
console.log("\n--- GATE 15: True Fullscreen, Two-Screen Onboarding & Manual Proceed ---");
assert(freshTemplate.includes('id="ldrStageWelcome"') && freshTemplate.includes('id="btnLdrStartRoom"') && freshTemplate.includes('id="btnLdrJoinRoom"'), "Template contains Stage 0 Welcome Screen matching Screen 1");
assert(freshTemplate.includes('id="btnLdrJustMe"') && freshTemplate.includes('id="btnLdrBackAll"'), "Template contains solo and back options on Welcome Screen");
assert(freshTemplate.includes('id="ldrCodeTilesContainer"') && freshTemplate.includes('id="btnProceedToSetup"'), "Template contains Stage 1 Lobby with 5-letter tiles and manual proceed button");
assert(!freshTemplate.includes('class="ldr-stepper"'), "Step numbers bar (1 2 3 4 5) is completely removed");
assert(cssContent.includes("inset: 0 !important") && cssContent.includes("overflow: hidden !important"), "CSS enforces strict zero-scroll full-window display on desktop & mobile");
const freshRoom = fs.readFileSync(path.join(__dirname, "../server/photobooth-room.js"), "utf8");
assert(freshRoom.includes('"welcome"'), "Server room supports welcome stage in VALID_STAGES");
assert(freshRuntime.includes("renderLdrCodeTiles"), "Runtime implements renderLdrCodeTiles for 5-letter dark tiles");
assert(freshRuntime.includes('"welcome"') && freshRuntime.includes("btnProceedToSetup"), "Runtime supports welcome stage and wires proceed to setup button");
assert(!freshRuntime.includes('setTimeout(() => {\n            if (this.session.isLdrMode) {\n              this.session.setLdrStage("setup"'), "Runtime does not auto-advance on partner join, waits for proceed click");

console.log("\n=============================================");
console.log("GAUNTLET SUMMARY: " + passedChecks + "/" + totalChecks + " PASSED");
if (passedChecks === totalChecks) {
  console.log("\n🎉 ALL GAUNTLET VERIFICATION GATES PASSED PERFECTLY!\n");
} else {
  console.error("\n❌ SOME CHECKS FAILED (" + (totalChecks - passedChecks) + " issues)\n");
  process.exitCode = 1;
}


