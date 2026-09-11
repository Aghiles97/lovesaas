const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

// 1. All images in demo/
const IMAGES_DIR = path.resolve(__dirname, "../../images");
const availableFiles = new Set(
  fs.readdirSync(IMAGES_DIR).filter(f => !f.startsWith(".") && !f.startsWith("Thumbs.db"))
);

console.log(`Available image files: ${availableFiles.size}`);

// Helper to get all matching images for a chapter
const CHAPTER_PREFIXES = [
  "chap-guangzhou-start",
  "chap-guangzhou-dec",
  "chap-shenzhen",
  "chap-chongqing",
  "chap-chengdu",
  "chap-bipenggou",
  "chap-dagu",
  "chap-jiuzhaigou",
  "chap-huanglong",
  "chap-chengdu-return",
  "chap-guangzhou-cozy",
  "chap-vietnam",
  "chap-bali",
  "chap-jakarta",
  "chap-guangzhou-spring",
  "chap-canton-tower-proposal",
  "chap-nansha",
  "chap-baiyun",
  "chap-wuhan",
  "chap-nanjing",
  "chap-shanghai",
  "chap-guangzhou-farewell",
  "chap-ldr"
];

function getChapterImages(chapId) {
  const matches = [];
  for (const f of availableFiles) {
    if (f.endsWith(".webp")) continue; // prefer jpg for primary list
    if (chapId === "chap-chengdu" && f.includes("chengdu-return")) continue;
    if (f.startsWith(chapId + "_") || f.startsWith(chapId + ".") || f === chapId + ".jpg") {
      matches.push(f);
    }
  }
  // Standalone city name fallbacks if few matches
  if (matches.length === 0) {
    const cityName = chapId.replace(/^chap-/, "").split("-")[0];
    for (const f of availableFiles) {
      if (f.startsWith(cityName + ".") || f.startsWith(cityName + "_")) {
        matches.push(f);
      }
    }
  }
  matches.sort();
  // If exact chapId.jpg or cityName.jpg exists, put it first
  const exact = matches.find(f => f === `${chapId}.jpg`) || matches.find(f => f === `${chapId.replace(/^chap-/, "")}.jpg`);
  if (exact) {
    matches.splice(matches.indexOf(exact), 1);
    matches.unshift(exact);
  }
  return matches.map(f => `/uploads/demo/${f}`);
}

async function linkDemo() {
  // 2. Read saved-data.json
  const savedDataPath = path.resolve(__dirname, "../../saved-data.json");
  let savedData = {};
  if (fs.existsSync(savedDataPath)) {
    savedData = JSON.parse(fs.readFileSync(savedDataPath, "utf8"));
  }

  // Update memories in savedData to /uploads/demo/...
  if (Array.isArray(savedData.memories)) {
    savedData.memories = savedData.memories.map(m => {
      let img = m.img || "";
      if (img.startsWith("images/")) {
        const basename = path.basename(img);
        img = `/uploads/demo/${basename}`;
      }
      return { ...m, img };
    });
  }

  // Also update stringified gf_memories in savedData
  if (savedData.gf_memories) {
    let gfMems = [];
    try {
      gfMems = typeof savedData.gf_memories === "string" ? JSON.parse(savedData.gf_memories) : savedData.gf_memories;
      gfMems = gfMems.map(m => {
        let img = m.img || "";
        if (img.startsWith("images/")) {
          img = `/uploads/demo/${path.basename(img)}`;
        }
        return { ...m, img };
      });
      savedData.gf_memories = JSON.stringify(gfMems);
    } catch (e) {}
  }

  // Update gf_city_photos in savedData
  let cityPhotos = {};
  if (savedData.gf_city_photos) {
    try {
      cityPhotos = typeof savedData.gf_city_photos === "string" ? JSON.parse(savedData.gf_city_photos) : savedData.gf_city_photos;
    } catch (e) {}
  }

  CHAPTER_PREFIXES.forEach(chapId => {
    const imgs = getChapterImages(chapId);
    if (!cityPhotos[chapId]) cityPhotos[chapId] = {};
    cityPhotos[chapId].images = imgs;
    cityPhotos[chapId].img = imgs[0] || "";
  });
  savedData.gf_city_photos = JSON.stringify(cityPhotos);

  // Keep savedData modifications in-memory for SaaS seeding only; do not overwrite ela/saved-data.json!

  // 3. Read & update couple_saas.json
  const saasJsonPath = path.resolve(__dirname, "../data/couple_saas.json");
  let saasData = {};
  if (fs.existsSync(saasJsonPath)) {
    saasData = JSON.parse(fs.readFileSync(saasJsonPath, "utf8"));
  }

  if (saasData.site_configs && saasData.site_configs.demo) {
    const demoConfig = saasData.site_configs.demo;
    if (!demoConfig.sections_data) demoConfig.sections_data = {};
    const sd = demoConfig.sections_data;

    // Memories
    if (Array.isArray(savedData.memories) && savedData.memories.length > 0) {
      if (!sd.memories) sd.memories = {};
      sd.memories.items = savedData.memories;
      sd.memories.title = "Our Favorite Moments 📷";
      sd.memories.tag = "Captured Memories";
    }

    // Timeline chapters
    const { DEFAULT_SECTIONS_DATA } = require("../server/db");
    let chapters = (sd.timeline && Array.isArray(sd.timeline.chapters) && sd.timeline.chapters.length > 0)
      ? sd.timeline.chapters
      : JSON.parse(JSON.stringify(DEFAULT_SECTIONS_DATA.timeline.chapters));

    chapters = chapters.map(ch => {
      const imgs = getChapterImages(ch.id);
      return {
        ...ch,
        img: imgs[0] || "",
        images: imgs
      };
    });

    if (!sd.timeline) sd.timeline = {};
    sd.timeline.chapters = chapters;
    sd.gf_city_photos = cityPhotos;

    fs.writeFileSync(saasJsonPath, JSON.stringify(saasData, null, 2), "utf8");
    console.log("✓ Updated saas-platform/data/couple_saas.json with /uploads/demo/ links");
  }

  // 4. Update PostgreSQL database
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const [k, ...v] = trimmed.split("=");
      if (k && v.length) process.env[k.trim()] = v.join("=").trim();
    });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://dza@localhost:5432/couple_saas"
  });

  try {
    const res = await pool.query("SELECT tenant_id, sections_data FROM site_configs WHERE tenant_id = (SELECT id FROM tenants WHERE slug = $1)", ["demo"]);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      const sections = row.sections_data || {};

      // Set memories
      if (Array.isArray(savedData.memories) && savedData.memories.length > 0) {
        if (!sections.memories) sections.memories = {};
        sections.memories.items = savedData.memories;
        sections.memories.title = "Our Favorite Moments 📷";
        sections.memories.tag = "Captured Memories";
      }

      // Set timeline chapters
      const { DEFAULT_SECTIONS_DATA } = require("../server/db");
      let chapters = (sections.timeline && Array.isArray(sections.timeline.chapters) && sections.timeline.chapters.length > 0)
        ? sections.timeline.chapters
        : JSON.parse(JSON.stringify(DEFAULT_SECTIONS_DATA.timeline.chapters));

      chapters = chapters.map(ch => {
        const imgs = getChapterImages(ch.id);
        return {
          ...ch,
          img: imgs[0] || "",
          images: imgs
        };
      });

      if (!sections.timeline) sections.timeline = {};
      sections.timeline.chapters = chapters;
      sections.gf_city_photos = cityPhotos;

      await pool.query(
        "UPDATE site_configs SET sections_data = $1, updated_at = NOW() WHERE tenant_id = (SELECT id FROM tenants WHERE slug = $2)",
        [JSON.stringify(sections), "demo"]
      );
      console.log("✓ Updated PostgreSQL couple_saas site_configs for tenant 'demo'");
    }
  } catch (err) {
    console.warn("PostgreSQL update warning:", err.message);
  } finally {
    await pool.end();
  }
}

linkDemo().catch(err => {
  console.error("Link error:", err);
  process.exit(1);
});
