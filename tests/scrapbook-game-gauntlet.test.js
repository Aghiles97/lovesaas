// tests/scrapbook-game-gauntlet.test.js
// 7-Gate Automated Verification Suite for scrapbook_game Widget

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT_DIR = path.resolve(__dirname, "..");
const WIDGET_ID = "scrapbook_game";

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
console.log("🚀 SCRAPBOOK GAME 7-GATE GAUNTLET RUNNER");
console.log("=============================================\n");

// --- GATE 1: FILE EXISTENCE & SYNTAX AUDIT ---
console.log("--- GATE 1: File Existence & Syntax Audit ---");
const templatePath = path.join(ROOT_DIR, "core/templates", WIDGET_ID + ".template.js");
const cssPath = path.join(ROOT_DIR, "public/css/widgets", WIDGET_ID + ".css");
const runtimePath = path.join(ROOT_DIR, "public/js/widgets", WIDGET_ID.replace(/_/g, "-") + ".runtime.js");
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
  assert(true, "Syntax valid: " + WIDGET_ID.replace(/_/g, "-") + ".runtime.js");
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
    const mockData = { items: [{ q: "Test Prompt?", options: ["A", "B"], correct: 0 }] };
    const mockRoot = { partner1: "Aghiles", partner2: "Ella" };
    const renderedHtml = renderer(mockData, mockRoot);
    assert(typeof renderedHtml === "string" && renderedHtml.length > 50, "Rendered HTML non-empty (length: " + (renderedHtml ? renderedHtml.length : 0) + ")");
    assert(renderedHtml.includes("section") && renderedHtml.includes(WIDGET_ID), "Rendered HTML contains valid elements for " + WIDGET_ID);
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
assert(viewerHtml.includes(WIDGET_ID.replace(/_/g, "-") + ".runtime.js"), "viewer.html includes runtime");
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
assert(widgetTemplatesCode.includes(WIDGET_ID + ":"), "widget-templates.js exports " + WIDGET_ID);

// --- GATE 5: BUILDER PREVIEWS & LABELS ---
console.log("\n--- GATE 5: Builder Previews & Labels ---");
const previewsCode = fs.readFileSync(path.join(ROOT_DIR, "builder/widget-previews.js"), "utf8");
const builderCode = fs.readFileSync(path.join(ROOT_DIR, "builder/builder.js"), "utf8");

assert(previewsCode.includes("PREVIEWS." + WIDGET_ID) || previewsCode.includes("PREVIEWS['" + WIDGET_ID + "']"), "widget-previews.js has preview SVG for " + WIDGET_ID);
assert(builderCode.includes(WIDGET_ID + ":"), "builder.js maps label for " + WIDGET_ID);

// --- GATE 6: DATABASE DEFAULTS & SCHEMA ---
console.log("\n--- GATE 6: Database Defaults & Schema ---");
const dbCode = fs.readFileSync(path.join(ROOT_DIR, "server/db/defaults/sections.js"), "utf8");
assert(dbCode.includes(WIDGET_ID + ":"), "sections.js contains default config for " + WIDGET_ID);

// --- GATE 7: LANDING PAGE DIRECTORY & SHOWCASE ---
console.log("\n--- GATE 7: Landing Page Directory & Showcase ---");
const landingCode = fs.readFileSync(path.join(ROOT_DIR, "public/js/landing.js"), "utf8");
assert(landingCode.includes(WIDGET_ID + ":"), "landing.js showcases " + WIDGET_ID);

console.log("\n=============================================");
console.log("GAUNTLET SUMMARY: " + passedChecks + "/" + totalChecks + " PASSED");
console.log("=============================================\n");

if (passedChecks === totalChecks) {
  console.log("🎉 ALL GAUNTLET VERIFICATION GATES PASSED PERFECTLY!");
  process.exit(0);
} else {
  console.error("⚠️ GAUNTLET FAILED (" + (totalChecks - passedChecks) + " checks failing)");
  process.exit(1);
}
