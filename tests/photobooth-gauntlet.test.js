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

console.log("\n=============================================");
console.log("GAUNTLET SUMMARY: " + passedChecks + "/" + totalChecks + " PASSED");
if (passedChecks === totalChecks) {
  console.log("\n🎉 ALL GAUNTLET VERIFICATION GATES PASSED PERFECTLY!\n");
} else {
  console.error("\n❌ SOME CHECKS FAILED (" + (totalChecks - passedChecks) + " issues)\n");
  process.exitCode = 1;
}
