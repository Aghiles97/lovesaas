// scripts/sync-templates.js
// Synchronizes static standalone HTML files from core template SSoT generators

const fs = require("fs");
const path = require("path");

const drawTemplate = require("../core/templates/draw.template.js");
const drawTarget = path.resolve(__dirname, "../public/draw.html");

if (typeof drawTemplate.renderStandalonePage === "function") {
  fs.writeFileSync(drawTarget, drawTemplate.renderStandalonePage(), "utf8");
  console.log("✅ Synced public/draw.html from core/templates/draw.template.js (SSoT)");
} else {
  console.error("❌ draw.template.js does not export renderStandalonePage");
  process.exit(1);
}
