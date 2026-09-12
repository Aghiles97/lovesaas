const http = require("http");
const assert = require("assert");
const fs = require("fs");
const path = require("path");

function get(pathStr) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:4000${pathStr}`, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", reject);
  });
}

async function runTests() {
  console.log("▶ Running Envelope & Names Verification Test...");

  // 1. Check /api/tenants/demo
  const tenantRes = await get("/api/tenants/demo");
  assert.strictEqual(tenantRes.status, 200, "API /api/tenants/demo must return 200");
  const tenantData = JSON.parse(tenantRes.data);
  assert.strictEqual(tenantData.partner1, "Aghiles", "demo partner1 must be Aghiles");
  assert.strictEqual(tenantData.partner2, "Ella", "demo partner2 must be Ella");
  assert.strictEqual(tenantData.sectionsData.hero.partner2, "Ella", "hero partner2 must be Ella");
  assert.ok(!JSON.stringify(tenantData).includes("tetstete"), "No tetstete in tenant data");
  assert.ok(!JSON.stringify(tenantData).includes("ddEllaa"), "No ddEllaa in tenant data");
  console.log("✓ Tenant API data clean and correct");

  // 2. Check /data endpoint
  const dataRes = await get("/data");
  assert.strictEqual(dataRes.status, 200, "/data must return 200");
  const legacyData = JSON.parse(dataRes.data);
  assert.strictEqual(legacyData.partnerName, "Ella", "/data partnerName must be Ella");
  assert.strictEqual(legacyData.senderName, "Aghiles", "/data senderName must be Aghiles");
  assert.strictEqual(legacyData.gf_name, "Ella", "/data gf_name must be Ella");
  console.log("✓ Legacy /data endpoint clean and correct");

  // 3. Check /sites/demo serves sealed envelope
  const siteRes = await get("/sites/demo");
  assert.strictEqual(siteRes.status, 200, "/sites/demo must return 200");
  assert.ok(siteRes.data.includes('id="envelopeScreen"'), "Must include envelopeScreen");
  assert.ok(!siteRes.data.includes('body class="letter-unsealed"'), "Body must not start unsealed");
  assert.ok(siteRes.data.includes('window.IntroEnvelope'), "Must include IntroEnvelope controller");
  console.log("✓ Standalone site serves sealed envelope");

  // 4. Check /sites/demo?preview=builder
  const previewRes = await get("/sites/demo?preview=builder");
  assert.strictEqual(previewRes.status, 200, "Builder preview must return 200");
  assert.ok(previewRes.data.includes('window.IntroEnvelope'), "Preview must include IntroEnvelope");
  assert.ok(!previewRes.data.includes('urlParams.get("sealed") !== "1"'), "Must not have inverted sealed check");
  assert.ok(previewRes.data.includes('urlParams.get("unsealed") === "1"'), "Must have correct unsealed check");
  console.log("✓ Builder preview correctly preserves sealed envelope");

  // 5. Check couple_saas.json
  const jsonPath = path.join(__dirname, "..", "data", "couple_saas.json");
  if (fs.existsSync(jsonPath)) {
    const rawJson = fs.readFileSync(jsonPath, "utf8");
    assert.ok(!rawJson.includes("tetstete"), "No tetstete in couple_saas.json");
    assert.ok(!rawJson.includes("ddEllaa"), "No ddEllaa in couple_saas.json");
    assert.ok(!rawJson.includes("lllElla"), "No lllElla in couple_saas.json");
    console.log("✓ couple_saas.json is 100% clean");
  }

  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
}

runTests().catch(err => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
