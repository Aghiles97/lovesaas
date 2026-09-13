const assert = require("assert");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;
const LOCAL_UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function httpRequest(endpoint, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const reqOpts = {
      method: options.method || "GET",
      headers: options.headers || {},
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search
    };
    const req = http.request(reqOpts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks);
        let data = null;
        try { data = JSON.parse(raw.toString("utf8")); } catch (e) { data = raw.toString("utf8"); }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          raw
        });
      });
    });
    req.on("error", reject);
    if (body) {
      if (Buffer.isBuffer(body) || typeof body === "string") {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function runUploadGauntlet() {
  console.log("\n=============================================");
  console.log("🚀 COMPREHENSIVE UPLOAD SYSTEMS GAUNTLET LOOP");
  console.log("=============================================\n");

  let passes = 0;
  let total = 0;

  function pass(desc) {
    total++;
    passes++;
    console.log(`✅ PASS: ${desc}`);
  }

  function fail(desc, err) {
    total++;
    console.error(`❌ FAIL: ${desc} -> ${err ? (err.message || err) : "unknown error"}`);
  }

  // GATE 1: Upload Destination Generation (/api/tenants/:slug/upload-url)
  console.log("--- GATE 1: Presigned Destination & Key Sanitization ---");
  try {
    const res = await httpRequest("/api/tenants/demo/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, { filename: "romantic couple song (HQ)!.mp3", contentType: "audio/mpeg" });

    assert.strictEqual(res.statusCode, 200, "upload-url must return 200");
    assert.ok(res.data.key, "Must return key");
    assert.ok(res.data.key.includes("demo/"), "Key must be scoped to tenant slug");
    assert.ok(res.data.key.includes("romantic_couple_song"), "Filename must be sanitized preserving base name");
    assert.ok(res.data.uploadUrl, "Must return uploadUrl");
    assert.ok(res.data.publicUrl, "Must return publicUrl");
    pass("POST /api/tenants/demo/upload-url produces clean scoped R2 key & URL");
  } catch (e) {
    fail("POST /api/tenants/demo/upload-url", e);
  }

  // GATE 2: Direct Binary Stream to R2 (/api/upload)
  console.log("\n--- GATE 2: Direct Buffer Stream to R2 ---");
  const testKey = "demo/gauntlet_audio_test.mp3";
  const dummyAudioBuf = Buffer.from([0xFF, 0xFB, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x55, 0x55, 0x55, 0x55]);
  try {
    const res = await httpRequest(`/api/upload?slug=demo&key=${encodeURIComponent(testKey)}`, {
      method: "POST",
      headers: { "Content-Type": "audio/mpeg", "Content-Length": dummyAudioBuf.length }
    }, dummyAudioBuf);

    assert.strictEqual(res.statusCode, 200, "Direct upload must return 200");
    assert.strictEqual(res.data.status, "ok", "Status must be ok");
    assert.strictEqual(res.data.publicUrl, `/uploads/${testKey}`, "publicUrl must match /uploads/:key");
    pass("POST /api/upload directly streams buffer to R2");
  } catch (e) {
    fail("POST /api/upload direct buffer stream", e);
  }

  // GATE 3: R2 Media Streaming & Byte-Range Support
  console.log("\n--- GATE 3: R2 Media Streaming & HTTP 206 Range Seeking ---");
  try {
    const resFull = await httpRequest(`/uploads/${testKey}`);
    assert.strictEqual(resFull.statusCode, 200, "Full request must return 200");
    assert.strictEqual(resFull.headers["accept-ranges"], "bytes", "Must advertise Accept-Ranges: bytes");
    assert.strictEqual(resFull.headers["content-type"], "audio/mpeg", "Content-Type must be audio/mpeg");
    pass("GET /uploads/:key serves from R2 with Accept-Ranges: bytes");

    const resRange = await httpRequest(`/uploads/${testKey}`, {
      headers: { Range: "bytes=0-3" }
    });
    assert.strictEqual(resRange.statusCode, 206, "Range request must return 206 Partial Content");
    assert.ok(resRange.headers["content-range"], "Must include Content-Range header");
    assert.strictEqual(resRange.headers["content-range"], `bytes 0-3/${dummyAudioBuf.length}`, "Content-Range must match byte span");
    assert.strictEqual(resRange.raw.length, 4, "Partial payload length must match range");
    pass("GET /uploads/:key supports HTTP 206 Range seeking");
  } catch (e) {
    fail("R2 media streaming & byte-range seeking", e);
  }

  // GATE 4: Image Upload API (/api/save-image)
  console.log("\n--- GATE 4: Image Upload Endpoints (Base64 & R2 Direct) ---");
  const testImgName = "gauntlet_polaroid.jpg";
  const dummy1x1Jpg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  try {
    const res = await httpRequest("/api/save-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, {
      slug: "demo",
      filename: testImgName,
      dataUrl: dummy1x1Jpg
    });

    assert.strictEqual(res.statusCode, 200, "save-image must return 200");
    assert.ok(res.data.status === "ok" || res.data.success, "Must return ok status");
    assert.ok(res.data.path.startsWith("/uploads/demo/"), "Path must be under /uploads/demo/");
    pass("POST /api/save-image uploads image to R2");
  } catch (e) {
    fail("POST /api/save-image", e);
  }

  // GATE 5: Audio Upload API (/api/save-audio)
  console.log("\n--- GATE 5: Spoken Voice Note Audio API (/api/save-audio) ---");
  const dummyAudioBase64 = "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJ8";
  try {
    const res = await httpRequest("/api/save-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, {
      slug: "demo",
      filename: "voice_note_gauntlet.webm",
      dataUrl: dummyAudioBase64
    });

    assert.strictEqual(res.statusCode, 200, "save-audio must return 200");
    assert.strictEqual(res.data.status, "ok", "Status must be ok");
    assert.ok(res.data.path.startsWith("/uploads/demo/"), "Path must be under /uploads/demo/");
    pass("POST /api/save-audio uploads audio to R2");
  } catch (e) {
    fail("POST /api/save-audio", e);
  }

  // GATE 6: Media Library Listing (/api/tenants/:slug/media)
  console.log("\n--- GATE 6: Media Library File Listing ---");
  try {
    const res = await httpRequest("/api/tenants/demo/media");
    assert.strictEqual(res.statusCode, 200, "Media listing must return 200");
    assert.ok(Array.isArray(res.data.media), "Must return media array");
    const foundAudio = res.data.media.find(m => m.key && m.key.includes("gauntlet_audio_test"));
    assert.ok(foundAudio, "Uploaded test audio must appear in tenant media library");
    assert.strictEqual(foundAudio.isAudio, true, "Uploaded audio must have isAudio=true");
    pass("GET /api/tenants/:slug/media lists uploaded assets with isAudio metadata");
  } catch (e) {
    fail("GET /api/tenants/:slug/media", e);
  }

  // GATE 7: Zero Local Disk Writes Verification
  console.log("\n--- GATE 7: Zero Local Disk Writes Audit ---");
  try {
    if (fs.existsSync(LOCAL_UPLOADS_DIR)) {
      const demoLocalDir = path.join(LOCAL_UPLOADS_DIR, "demo");
      if (fs.existsSync(demoLocalDir)) {
        const localFiles = fs.readdirSync(demoLocalDir);
        assert.ok(!localFiles.includes("gauntlet_audio_test.mp3"), "Test audio must NOT be saved locally on disk");
        assert.ok(!localFiles.includes(testImgName), "Test image must NOT be saved locally on disk");
      }
    }
    pass("Local uploads/ directory has ZERO disk writes (strictly stored in R2)");
  } catch (e) {
    fail("Zero local disk audit", e);
  }

  // GATE 8: Asset Deletion API (/api/delete-image)
  console.log("\n--- GATE 8: Asset Cleanup & Deletion (/api/delete-image) ---");
  try {
    const resDel = await httpRequest("/api/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, {
      slug: "demo",
      filename: testKey
    });
    assert.strictEqual(resDel.statusCode, 200, "delete-image must return 200");
    assert.strictEqual(resDel.data.status, "ok", "delete status must be ok");
    pass("POST /api/delete-image deletes uploaded key from R2");
  } catch (e) {
    fail("POST /api/delete-image", e);
  }

  // GATE 9: Client Codebase File Input Contract Audit
  console.log("\n--- GATE 9: Client Upload Handlers Contract Audit ---");
  try {
    const builderJs = fs.readFileSync(path.join(__dirname, "..", "builder", "builder.js"), "utf8");
    assert.ok(builderJs.includes("uploadFileToR2(file)"), "builder.js must export/use uploadFileToR2");
    assert.ok(builderJs.includes("/api/upload?slug="), "builder fallback must call /api/upload");
    assert.ok(!builderJs.includes("/api/upload/local"), "builder must not call /api/upload/local");

    const heroInsp = fs.readFileSync(path.join(__dirname, "..", "builder", "inspectors", "hero.inspector.js"), "utf8");
    assert.ok(heroInsp.includes("uploadFileToR2(file)"), "hero.inspector.js must use uploadFileToR2");

    const letterInsp = fs.readFileSync(path.join(__dirname, "..", "builder", "inspectors", "letter.inspector.js"), "utf8");
    assert.ok(letterInsp.includes("uploadFileToR2(file)"), "letter.inspector.js must use uploadFileToR2");

    const memoriesInsp = fs.readFileSync(path.join(__dirname, "..", "builder", "inspectors", "memories.inspector.js"), "utf8");
    assert.ok(memoriesInsp.includes("uploadFileToR2(file)"), "memories.inspector.js must use uploadFileToR2");

    const timelineInsp = fs.readFileSync(path.join(__dirname, "..", "builder", "inspectors", "timeline.inspector.js"), "utf8");
    assert.ok(timelineInsp.includes("uploadFileToR2(file)"), "timeline.inspector.js must use uploadFileToR2");

    const thenNowInsp = fs.readFileSync(path.join(__dirname, "..", "builder", "inspectors", "then_now_slider.inspector.js"), "utf8");
    assert.ok(thenNowInsp.includes("uploadFileToR2(file)"), "then_now_slider.inspector.js must use uploadFileToR2");

    const storageJs = fs.readFileSync(path.join(__dirname, "..", "public", "js", "storage.js"), "utf8");
    assert.ok(storageJs.includes("/save-image"), "storage.js must route images to /save-image");
    assert.ok(storageJs.includes("/save-audio"), "storage.js must route audio to /save-audio");

    pass("All builder inspectors and runtime components map correctly to R2 upload pipeline");
  } catch (e) {
    fail("Client codebase contract audit", e);
  }

  console.log("\n=============================================");
  console.log(`GAUNTLET SUMMARY: ${passes}/${total} PASSED`);
  console.log("=============================================\n");

  if (passes === total) {
    console.log("🎉 ALL UPLOAD SYSTEMS GAUNTLET GATES PASSED PERFECTLY!\n");
    process.exit(0);
  } else {
    console.error("❌ GAUNTLET VERIFICATION DETECTED FAILURES!\n");
    process.exit(1);
  }
}

runUploadGauntlet().catch(err => {
  console.error("FATAL GAUNTLET ERROR:", err);
  process.exit(1);
});
