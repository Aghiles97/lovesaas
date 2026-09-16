const { Pool } = require("pg");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

// Load local .env
const envPath = path.join(__dirname, "..", "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [k, ...v] = trimmed.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
}

const auth = require("../auth");

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://dza@localhost:5432/couple_saas";
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "couple_saas.json");

let isPgConnected = false;

let localStoreCache = null;

function loadLocalStore() {
  if (localStoreCache) return localStoreCache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  let data = { tenants: {}, site_configs: {}, users: {}, user_sessions: {}, orders: {} };
  if (fs.existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch (e) {}
  }
  data.tenants = data.tenants || {};
  data.site_configs = data.site_configs || {};
  data.users = data.users || {};
  data.user_sessions = data.user_sessions || {};
  data.orders = data.orders || {};
  localStoreCache = data;
  return localStoreCache;
}

function saveLocalStore(store) {
  localStoreCache = store;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on("error", (err) => {
  // Silent fallback handled in initDb
});

const { DEFAULT_PRESETS } = require("./defaults/presets");
const { DEFAULT_SECTIONS_DATA } = require("./defaults/sections");
async function initDb() {
  try {
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("PG Connection Timeout")), 1500))
    ]);
    isPgConnected = true;
    client.release();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY,
        slug VARCHAR(64) UNIQUE NOT NULL,
        partner1_name VARCHAR(128),
        partner2_name VARCHAR(128),
        admin_pin VARCHAR(64),
        customer_email VARCHAR(255),
        is_purchased BOOLEAN DEFAULT true,
        plan VARCHAR(32) DEFAULT 'vip',
        auth_token VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_configs (
        tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
        template_preset VARCHAR(32) NOT NULL DEFAULT 'complete',
        theme_id VARCHAR(32) NOT NULL DEFAULT 'romantic-rose',
        layout_order JSONB NOT NULL,
        sections_data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(128),
        password_hash VARCHAR(256) NOT NULL,
        salt VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        token VARCHAR(64) PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        tenant_slug VARCHAR(64) NOT NULL,
        plan VARCHAR(32) DEFAULT 'vip',
        amount NUMERIC(10,2) NOT NULL,
        currency VARCHAR(8) DEFAULT 'USD',
        status VARCHAR(32) DEFAULT 'completed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);

      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'user';
      UPDATE users SET role = 'admin' WHERE LOWER(email) = 'admin@admin.com';
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_purchased BOOLEAN DEFAULT true;
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan VARCHAR(32) DEFAULT 'vip';
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS auth_token VARCHAR(64);
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    `);
  } catch (err) {
    isPgConnected = false;
    console.log("ℹ️ PostgreSQL not active (" + err.message + "). Using persistent local file storage: data/couple_saas.json");
  }

  // Seed default tenant: demo
  const existing = await getTenantBySlug("demo");
  if (!existing) {
    await createTenant({
      slug: "demo",
      partner1: "Alex",
      partner2: "Sam",
      preset: "complete",
      plan: "vip",
      isPurchased: true
    });
    console.log("✓ Seeded default tenant: 'demo'");
  }

  // Seed default admin user: admin@admin.com
  const existingAdmin = await findUserByEmail("admin@admin.com");
  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex");
    await createUser({
      email: "admin@admin.com",
      password: adminPassword,
      name: "Master Admin",
      role: "admin"
    });
    console.log(`✓ Seeded default admin user: 'admin@admin.com' (Password: ${process.env.ADMIN_PASSWORD ? "configured in env" : adminPassword})`);
  }
}

async function createTenant({ slug, partner1, partner2, preset = "blank", customerEmail = null, plan = "vip", isPurchased = true, userId = null, anniversaryDate = null, subtitle = null }) {
  const id = crypto.randomUUID();
  const cleanSlug = slug.toLowerCase().trim();
  let layout = DEFAULT_PRESETS[preset] || DEFAULT_PRESETS.complete;
  const authToken = crypto.randomBytes(24).toString("hex");

  const initialSections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS_DATA));
  if (preset === "blank") {
    layout = [];
    if (initialSections.hero) {
      initialSections.hero.musicTrackUrl = "";
      initialSections.hero.musicTrackTitle = "";
      initialSections.hero.voiceAudio = "";
    }
    if (initialSections.memories) initialSections.memories.items = [];
    if (initialSections.timeline) initialSections.timeline.chapters = [];
    if (initialSections.reasons) initialSections.reasons.items = [];
    if (initialSections.coupons) initialSections.coupons.items = [];
    if (initialSections.audio_capsule) initialSections.audio_capsule.memos = [];
    if (initialSections.milestone_odyssey) initialSections.milestone_odyssey.milestones = [];
    if (initialSections.bucket_list) initialSections.bucket_list.items = [];
    if (initialSections.map) initialSections.map.stops = [];
  }
  initialSections.hero.partner1 = partner1;
  initialSections.hero.partner2 = partner2;
  initialSections.hero.subtitle = subtitle || `${partner1} & ${partner2}'s Infinite Love Story ❤️`;
  initialSections.hero.pageTitle = `${partner1} & ${partner2} | Our Love Story ❤️`;
  if (anniversaryDate) {
    initialSections.hero.anniversaryDate = anniversaryDate;
  }
  initialSections.letter.recipient = partner2;
  initialSections.letter.sender = `${partner1} ❤️`;
  initialSections.letter.envelopeBadge = `👑 For My Love ${partner2}`;
  initialSections.letter.body = `Dearest ${partner2},\n\nFirst of all, I want to say happy anniversary to you, my sweetheart, my love, my everything. I am so happy you entered my life. Meeting you was truly the best thing that ever happened to me, and it completely changed my world.\n\nEvery single memory with you is a treasure, and with you, I want to experience all the beauties of this world.\n\nForever and always,\n${partner1} ❤️`;
  if (initialSections.quiz) {
    initialSections.quiz.certSender = partner1;
    initialSections.quiz.certAwardee = `This prestigious lifelong honor is officially presented to ${partner2}`;
  }
  if (initialSections.intro) {
    if (partner1) {
      initialSections.intro.senderName = partner1;
      initialSections.intro.senderClosing = `From ${partner1} with Infinite Lof & Birthday Kisses 🎂💕`;
    }
    if (partner2) {
      initialSections.intro.recipientName = partner2;
      initialSections.intro.title = `Happy Birthday ${partner2} 🎂❤️`;
    }
  }

  if (isPgConnected) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO tenants (id, slug, partner1_name, partner2_name, customer_email, is_purchased, plan, auth_token, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, cleanSlug, partner1, partner2, customerEmail, isPurchased, plan, authToken, userId]
      );

      await client.query(
        `INSERT INTO site_configs (tenant_id, template_preset, theme_id, layout_order, sections_data)
         VALUES ($1, $2, 'romantic-rose', $3, $4)`,
        [id, preset, JSON.stringify(layout), JSON.stringify(initialSections)]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } else {
    const store = loadLocalStore();
    store.tenants[cleanSlug] = {
      id,
      slug: cleanSlug,
      partner1_name: partner1,
      partner2_name: partner2,
      customer_email: customerEmail,
      is_purchased: isPurchased,
      plan,
      auth_token: authToken,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    store.site_configs[cleanSlug] = {
      tenant_id: id,
      template_preset: preset,
      theme_id: "romantic-rose",
      layout_order: layout,
      sections_data: initialSections,
      updated_at: new Date().toISOString()
    };
    saveLocalStore(store);
  }

  return getTenantBySlug(cleanSlug);
}

function enrichSectionsData(rawSections, partner1, partner2) {
  const merged = JSON.parse(JSON.stringify(DEFAULT_SECTIONS_DATA));
  if (partner1) {
    if (merged.hero) merged.hero.partner1 = partner1;
    if (merged.letter) merged.letter.sender = `${partner1} ❤️`;
    if (merged.quiz) merged.quiz.certSender = partner1;
    if (merged.intro) {
      merged.intro.senderName = partner1;
      merged.intro.senderClosing = `From ${partner1} with Infinite Lof & Birthday Kisses 🎂💕`;
    }
    if (merged.love_crossword) merged.love_crossword.partner1 = partner1;
    if (merged.puzzle_photo) merged.puzzle_photo.partner1 = partner1;
  }
  if (partner2) {
    if (merged.hero) merged.hero.partner2 = partner2;
    if (merged.letter) {
      merged.letter.recipient = partner2;
      merged.letter.envelopeBadge = `👑 For My Love ${partner2}`;
    }
    if (merged.quiz) merged.quiz.certAwardee = `This prestigious lifelong honor is officially presented to ${partner2}`;
    if (merged.intro) {
      merged.intro.recipientName = partner2;
      merged.intro.title = `Happy Birthday ${partner2} 🎂❤️`;
    }
    if (merged.love_crossword) {
      merged.love_crossword.partner2 = partner2;
      merged.love_crossword.certAwardee = `Presented with Infinite Love to ${partner2} & ${partner1 || "Aghiles"}`;
    }
    if (merged.puzzle_photo) {
      merged.puzzle_photo.partner2 = partner2;
      if (merged.puzzle_photo.reward) {
        merged.puzzle_photo.reward.letter = `« Every single moment, laugh, and adventure we share fits into my heart like the final missing piece of an eternal puzzle. I love you endlessly, ${partner2}! »`;
      }
    }
  }
  if (!rawSections || typeof rawSections !== "object") return merged;

  for (const [key, val] of Object.entries(rawSections)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      merged[key] = { ...(merged[key] || {}), ...val };
    } else if (Array.isArray(val) && val.length > 0) {
      merged[key] = val;
    } else if (val !== undefined && val !== null) {
      merged[key] = val;
    }
  }

  const cleanP2 = (partner2 === "ddEllaa" || partner2 === "lllElla" || partner2 === "tetstete") ? "Ella" : partner2;
  const cleanP1 = (partner1 === "tette" || partner1 === "tet") ? "Aghiles" : partner1;

  if (merged.hero) {
    if (cleanP1 && (!merged.hero.partner1 || merged.hero.partner1 === "Alex" || merged.hero.partner1 === "tette" || merged.hero.partner1 === "tet")) {
      merged.hero.partner1 = cleanP1;
    }
    if (cleanP2 && (!merged.hero.partner2 || merged.hero.partner2 === "Sam" || merged.hero.partner2 === "ddEllaa" || merged.hero.partner2 === "lllElla" || merged.hero.partner2 === "tetstete")) {
      merged.hero.partner2 = cleanP2;
    }
  }

  if (merged.letter) {
    if (typeof merged.letter === "string") {
      merged.letter = merged.letter.replaceAll("tetstete", cleanP2 || "Ella").replaceAll("tette ❤️", `${cleanP1 || "Aghiles"} ❤️`).replaceAll("tette", cleanP1 || "Aghiles");
    } else if (merged.letter.body) {
      merged.letter.body = merged.letter.body.replaceAll("tetstete", cleanP2 || "Ella").replaceAll("tette ❤️", `${cleanP1 || "Aghiles"} ❤️`).replaceAll("tette", cleanP1 || "Aghiles");
    }
    if (typeof merged.letter === "object") {
      if (cleanP2) merged.letter.recipient = cleanP2;
      if (cleanP1) merged.letter.sender = `${cleanP1} ❤️`;
    }
  }
  if (typeof merged.gf_letter === "string") {
    merged.gf_letter = merged.gf_letter.replaceAll("tetstete", cleanP2 || "Ella").replaceAll("tette ❤️", `${cleanP1 || "Aghiles"} ❤️`).replaceAll("tette", cleanP1 || "Aghiles");
  }
  if (merged.gf_name === "tetstete" || merged.gf_name === "ddEllaa" || merged.gf_name === "lllElla") {
    merged.gf_name = cleanP2 || "Ella";
  }
  if (merged.partnerName === "tetstete" || merged.partnerName === "ddEllaa" || merged.partnerName === "lllElla") {
    merged.partnerName = cleanP2 || "Ella";
  }
  if (merged.quiz && merged.quiz.certAwardee) {
    merged.quiz.certAwardee = merged.quiz.certAwardee.replaceAll("ddEllaa", "Ella").replaceAll("lllElla", "Ella").replaceAll("tetstete", "Ella");
  }
  if (merged.intro) {
    const defaultClosing = "From Aghiles with Infinite Lof & Birthday Kisses 🎂💕";
    const defaultTitle = "Happy Birthday Ella 🎂❤️";

    if (partner1) {
      if (!rawSections?.intro?.senderName || merged.intro.senderName === "Aghiles" || merged.intro.senderName === "Alex" || merged.intro.senderName === "tette" || merged.intro.senderName === "tet") {
        merged.intro.senderName = cleanP1 || partner1;
      }
      if (!rawSections?.intro?.senderClosing || merged.intro.senderClosing === defaultClosing || merged.intro.senderClosing.includes("Aghiles") || merged.intro.senderClosing.includes("Alex")) {
        merged.intro.senderClosing = `From ${cleanP1 || partner1} with Infinite Lof & Birthday Kisses 🎂💕`;
      }
    }

    if (partner2) {
      if (!rawSections?.intro?.recipientName || merged.intro.recipientName === "Ella" || merged.intro.recipientName === "Sam" || merged.intro.recipientName === "ddEllaa" || merged.intro.recipientName === "lllElla" || merged.intro.recipientName === "tetstete") {
        merged.intro.recipientName = cleanP2 || partner2;
      }
      if (!rawSections?.intro?.title || merged.intro.title === defaultTitle || merged.intro.title.includes("Ella") || merged.intro.title.includes("Sam")) {
        merged.intro.title = `Happy Birthday ${cleanP2 || partner2} 🎂❤️`;
      }
    }
  }

  return merged;
}

async function getTenantBySlug(slug) {
  const cleanSlug = slug.toLowerCase().trim();

  if (isPgConnected) {
    const query = `
      SELECT t.id, t.slug, t.partner1_name, t.partner2_name, t.created_at,
             t.customer_email, t.is_purchased, t.plan, t.auth_token, t.user_id,
             c.template_preset, c.theme_id, c.layout_order, c.sections_data, c.updated_at
      FROM tenants t
      JOIN site_configs c ON t.id = c.tenant_id
      WHERE t.slug = $1
    `;
    const res = await pool.query(query, [cleanSlug]);
    if (!res.rows.length) return null;
    const row = res.rows[0];

    const rawSections = typeof row.sections_data === "string" ? JSON.parse(row.sections_data) : row.sections_data;
    return {
      id: row.id,
      slug: row.slug,
      partner1: row.partner1_name,
      partner2: row.partner2_name,
      customerEmail: row.customer_email,
      isPurchased: row.is_purchased !== false,
      plan: row.plan || "vip",
      authToken: row.auth_token,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      templatePreset: row.template_preset,
      themeId: row.theme_id,
      layoutOrder: typeof row.layout_order === "string" ? JSON.parse(row.layout_order) : row.layout_order,
      sectionsData: enrichSectionsData(rawSections, row.partner1_name, row.partner2_name)
    };
  }

  const store = loadLocalStore();
  const t = store.tenants[cleanSlug];
  const c = store.site_configs[cleanSlug];
  if (!t || !c) return null;

  return {
    id: t.id,
    slug: t.slug,
    partner1: t.partner1_name,
    partner2: t.partner2_name,
    customerEmail: t.customer_email,
    isPurchased: t.is_purchased !== false,
    plan: t.plan || "vip",
    authToken: t.auth_token,
    userId: t.user_id,
    createdAt: t.created_at,
    updatedAt: c.updated_at,
    templatePreset: c.template_preset,
    themeId: c.theme_id,
    layoutOrder: c.layout_order,
    sectionsData: enrichSectionsData(c.sections_data, t.partner1_name, t.partner2_name)
  };
}

const MASTER_ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

async function verifyTenantAccess({ slug, token }) {
  const cleanToken = token ? String(token).trim() : "";

  if (MASTER_ADMIN_TOKEN && cleanToken === MASTER_ADMIN_TOKEN) {
    const targetSlug = (slug && slug !== "admin") ? slug : "demo";
    const targetTenant = await getTenantBySlug(targetSlug);
    return {
      authorized: true,
      role: "admin",
      isAdmin: true,
      isPurchased: true,
      isDemo: false,
      tenant: targetTenant || { slug: targetSlug, partner1: "Admin", partner2: "Master", isPurchased: true, plan: "vip", authToken: MASTER_ADMIN_TOKEN },
      authToken: MASTER_ADMIN_TOKEN
    };
  }

  if (!slug) return { authorized: false, error: "Missing slug" };
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return { authorized: false, error: "Site not found" };

  if (slug === "demo") {
    return { authorized: true, role: "user", isPurchased: true, tenant, isDemo: true };
  }

  const tokenMatches = cleanToken && tenant.authToken && String(tenant.authToken).trim() === cleanToken;
  if (tokenMatches) {
    const isPurchased = tenant.isPurchased !== false;
    return {
      authorized: true,
      role: isPurchased ? "user" : "visitor",
      isPurchased,
      isDemo: false,
      tenant
    };
  }

  if (cleanToken) {
    const session = await validateSession(cleanToken);
    if (session && session.user) {
      const isOwner = session.user.role === "admin" ||
                      session.user.id === tenant.userId ||
                      (tenant.customerEmail && session.user.email && tenant.customerEmail.toLowerCase() === session.user.email.toLowerCase());
      if (isOwner) {
        return {
          authorized: true,
          role: session.user.role === "admin" ? "admin" : "user",
          isAdmin: session.user.role === "admin",
          isPurchased: true,
          isDemo: false,
          tenant
        };
      }
    }
  }

  return { authorized: false, error: "Invalid credentials" };
}

async function updateSiteConfig(slug, { templatePreset, themeId, layoutOrder, sectionsData, authToken }) {
  const cleanSlug = slug.toLowerCase().trim();
  const tenant = await getTenantBySlug(cleanSlug);
  if (!tenant) throw new Error("Tenant not found");

  const cleanToken = authToken ? String(authToken).trim() : "";
  const isMasterAdmin = Boolean(MASTER_ADMIN_TOKEN && cleanToken === MASTER_ADMIN_TOKEN);

  if (!isMasterAdmin && cleanSlug !== "demo") {
    const tokenValid = cleanToken && tenant.authToken && String(tenant.authToken).trim() === cleanToken;
    if (!tokenValid) {
      throw new Error("Unauthorized token");
    }
    if (tenant.isPurchased === false) {
      throw new Error("Purchase now to customize and publish changes");
    }
  }

  const nextPreset = templatePreset || tenant.templatePreset;
  const nextTheme = themeId || tenant.themeId;
  const nextLayout = layoutOrder || tenant.layoutOrder;
  let nextSections = sectionsData || tenant.sectionsData;

  if (cleanSlug === "demo" && nextSections) {
    if (typeof nextSections.letter === "string" && nextSections.letter.includes("tetstete")) {
      nextSections.letter = nextSections.letter.replaceAll("tetstete", "Ella").replaceAll("tette ❤️", "Aghiles ❤️").replaceAll("tette", "Aghiles");
    } else if (nextSections.letter && typeof nextSections.letter === "object" && nextSections.letter.body && nextSections.letter.body.includes("tetstete")) {
      nextSections.letter.body = nextSections.letter.body.replaceAll("tetstete", "Ella").replaceAll("tette ❤️", "Aghiles ❤️").replaceAll("tette", "Aghiles");
    }
    if (typeof nextSections.gf_letter === "string" && nextSections.gf_letter.includes("tetstete")) {
      nextSections.gf_letter = nextSections.gf_letter.replaceAll("tetstete", "Ella").replaceAll("tette ❤️", "Aghiles ❤️").replaceAll("tette", "Aghiles");
    }
    if (nextSections.hero) {
      if (nextSections.hero.partner2 === "ddEllaa" || nextSections.hero.partner2 === "lllElla" || nextSections.hero.partner2 === "tetstete") {
        nextSections.hero.partner2 = "Ella";
      }
    }
    if (nextSections.gf_name === "tetstete" || nextSections.gf_name === "ddEllaa" || nextSections.gf_name === "lllElla") nextSections.gf_name = "Ella";
    if (nextSections.partnerName === "tetstete" || nextSections.partnerName === "ddEllaa" || nextSections.partnerName === "lllElla") nextSections.partnerName = "Ella";
  }

  if (isPgConnected) {
    await pool.query(
      `UPDATE site_configs
       SET template_preset = $1, theme_id = $2, layout_order = $3, sections_data = $4, updated_at = NOW()
       WHERE tenant_id = $5`,
      [nextPreset, nextTheme, JSON.stringify(nextLayout), JSON.stringify(nextSections), tenant.id]
    );

    if (sectionsData && sectionsData.hero) {
      let p1 = sectionsData.hero.partner1;
      let p2 = sectionsData.hero.partner2;
      if (cleanSlug === "demo" && (p2 === "ddEllaa" || p2 === "lllElla" || p2 === "tetstete")) p2 = "Ella";
      if (cleanSlug === "demo" && (p1 === "tette" || p1 === "tet")) p1 = "Aghiles";
      if (p1 || p2) {
        await pool.query(
          `UPDATE tenants SET partner1_name = COALESCE($1, partner1_name), partner2_name = COALESCE($2, partner2_name) WHERE id = $3`,
          [p1 || null, p2 || null, tenant.id]
        );
      }
    }
  }

  const store = loadLocalStore();
  if (store.site_configs) {
    store.site_configs[cleanSlug] = {
      tenant_id: tenant.id,
      template_preset: nextPreset,
      theme_id: nextTheme,
      layout_order: nextLayout,
      sections_data: nextSections,
      updated_at: new Date().toISOString()
    };
    if (sectionsData && sectionsData.hero && store.tenants && store.tenants[cleanSlug]) {
      if (sectionsData.hero.partner1) store.tenants[cleanSlug].partner1_name = (cleanSlug === "demo" && (sectionsData.hero.partner1 === "tette" || sectionsData.hero.partner1 === "tet")) ? "Aghiles" : sectionsData.hero.partner1;
      if (sectionsData.hero.partner2) store.tenants[cleanSlug].partner2_name = (cleanSlug === "demo" && (sectionsData.hero.partner2 === "ddEllaa" || sectionsData.hero.partner2 === "lllElla" || sectionsData.hero.partner2 === "tetstete")) ? "Ella" : sectionsData.hero.partner2;
    }
    saveLocalStore(store);
  }

  return getTenantBySlug(cleanSlug);
}

async function listTenants() {
  if (isPgConnected) {
    const res = await pool.query(
      `SELECT slug, partner1_name, partner2_name, created_at FROM tenants ORDER BY created_at DESC`
    );
    return res.rows;
  }
  const store = loadLocalStore();
  return Object.values(store.tenants).map(t => ({
    slug: t.slug,
    partner1_name: t.partner1_name,
    partner2_name: t.partner2_name,
    created_at: t.created_at
  }));
}

// ----------------------------------------------------
// USER AUTHENTICATION & MANAGEMENT
// ----------------------------------------------------

async function createUser({ email, password, name = "", role = "user" }) {
  const cleanEmail = String(email).toLowerCase().trim();
  const id = crypto.randomUUID();
  const { hash, salt } = await auth.hashPassword(password);
  const now = new Date().toISOString();
  const userRole = role === "admin" ? "admin" : "user";

  if (isPgConnected) {
    const res = await pool.query(
      `INSERT INTO users (id, email, name, password_hash, salt, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, role, created_at`,
      [id, cleanEmail, name || cleanEmail.split("@")[0], hash, salt, userRole, now]
    );
    // Link existing couple sites with this customer_email
    await pool.query(
      `UPDATE tenants SET user_id = $1 WHERE LOWER(customer_email) = $2 AND user_id IS NULL`,
      [id, cleanEmail]
    );
    // Link existing unlinked orders for these sites
    await pool.query(
      `UPDATE orders SET user_id = $1 WHERE tenant_slug IN (SELECT slug FROM tenants WHERE user_id = $1) AND user_id IS NULL`,
      [id]
    );
    return res.rows[0];
  }

  const store = loadLocalStore();
  const user = {
    id,
    email: cleanEmail,
    name: name || cleanEmail.split("@")[0],
    password_hash: hash,
    salt,
    role: userRole,
    created_at: now
  };
  store.users[id] = user;

  // Link existing local tenants & orders
  for (const t of Object.values(store.tenants)) {
    if (t.customer_email && t.customer_email.toLowerCase() === cleanEmail && !t.user_id) {
      t.user_id = id;
    }
  }
  for (const ord of Object.values(store.orders)) {
    if (!ord.user_id && store.tenants[ord.tenant_slug] && store.tenants[ord.tenant_slug].user_id === id) {
      ord.user_id = id;
    }
  }
  saveLocalStore(store);

  return { id: user.id, email: user.email, name: user.name, role: user.role, created_at: user.created_at };
}

async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = String(email).toLowerCase().trim();

  if (isPgConnected) {
    const res = await pool.query(`SELECT id, email, name, role, password_hash, salt, created_at FROM users WHERE LOWER(email) = $1 LIMIT 1`, [cleanEmail]);
    if (!res.rows.length) return null;
    const row = res.rows[0];
    const role = row.role || "user";
    return { ...row, role };
  }

  const store = loadLocalStore();
  const u = Object.values(store.users).find(u => u.email.toLowerCase() === cleanEmail);
  if (!u) return null;
  const role = u.role || "user";
  return { ...u, role };
}

async function findUserById(userId) {
  if (!userId) return null;

  if (isPgConnected) {
    const res = await pool.query(
      `SELECT id, email, name, role, created_at FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    if (!res.rows.length) return null;
    const row = res.rows[0];
    const role = row.role || "user";
    return { id: row.id, email: row.email, name: row.name, role, createdAt: row.created_at };
  }

  const store = loadLocalStore();
  const u = store.users[userId];
  if (!u) return null;
  const role = u.role || "user";
  return { id: u.id, email: u.email, name: u.name, role, createdAt: u.created_at };
}

async function updateUserProfile(userId, { name, password }) {
  if (!userId) throw new Error("User ID required");

  if (isPgConnected) {
    if (password) {
      const { hash, salt } = await auth.hashPassword(password);
      const res = await pool.query(
        `UPDATE users SET name = COALESCE($1, name), password_hash = $2, salt = $3 WHERE id = $4 RETURNING id, email, name, role, created_at`,
        [name || null, hash, salt, userId]
      );
      const row = res.rows[0];
      const role = row.role || "user";
      return { ...row, role };
    } else {
      const res = await pool.query(
        `UPDATE users SET name = COALESCE($1, name) WHERE id = $2 RETURNING id, email, name, role, created_at`,
        [name || null, userId]
      );
      const row = res.rows[0];
      const role = row.role || "user";
      return { ...row, role };
    }
  }

  const store = loadLocalStore();
  const u = store.users[userId];
  if (!u) throw new Error("User not found");
  if (name) u.name = name;
  if (password) {
    const { hash, salt } = await auth.hashPassword(password);
    u.password_hash = hash;
    u.salt = salt;
  }
  saveLocalStore(store);
  const role = u.role || "user";
  return { id: u.id, email: u.email, name: u.name, role, created_at: u.created_at };
}

// ----------------------------------------------------
// SESSION MANAGEMENT
// ----------------------------------------------------

async function createSession(userId) {
  const token = auth.generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (isPgConnected) {
    await pool.query(
      `INSERT INTO user_sessions (token, user_id, created_at, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [token, userId, now.toISOString(), expiresAt.toISOString()]
    );
    return token;
  }

  const store = loadLocalStore();
  store.user_sessions[token] = {
    token,
    user_id: userId,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  };
  saveLocalStore(store);
  return token;
}

async function validateSession(token) {
  if (!token) return null;

  if (isPgConnected) {
    const res = await pool.query(
      `SELECT s.token, u.id, u.email, u.name, u.role, u.created_at
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND (s.expires_at IS NULL OR s.expires_at > NOW())
       LIMIT 1`,
      [token]
    );
    if (!res.rows.length) return null;
    const row = res.rows[0];
    const role = row.role || "user";
    return {
      token: row.token,
      user: { id: row.id, email: row.email, name: row.name, role, createdAt: row.created_at }
    };
  }

  const store = loadLocalStore();
  const session = store.user_sessions[token];
  if (!session) return null;
  if (session.expires_at && new Date(session.expires_at) < new Date()) {
    delete store.user_sessions[token];
    saveLocalStore(store);
    return null;
  }
  const user = store.users[session.user_id];
  if (!user) return null;
  const role = user.role || "user";
  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role, createdAt: user.created_at }
  };
}

async function deleteSession(token) {
  if (!token) return;
  if (isPgConnected) {
    await pool.query(`DELETE FROM user_sessions WHERE token = $1`, [token]);
    return;
  }
  const store = loadLocalStore();
  delete store.user_sessions[token];
  saveLocalStore(store);
}

// ----------------------------------------------------
// ORDERS & PURCHASES
// ----------------------------------------------------

async function createOrder({ userId, tenantSlug, plan = "vip", amount, currency = "USD", status = "completed" }) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const numericAmount = parseFloat(amount) || (plan === "starter" ? 19.00 : 39.00);

  if (isPgConnected) {
    const res = await pool.query(
      `INSERT INTO orders (id, user_id, tenant_slug, plan, amount, currency, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, userId || null, tenantSlug, plan, numericAmount, currency, status, now]
    );
    return res.rows[0];
  }

  const store = loadLocalStore();
  const order = {
    id,
    user_id: userId || null,
    tenant_slug: tenantSlug,
    plan,
    amount: numericAmount,
    currency,
    status,
    created_at: now
  };
  store.orders[id] = order;
  saveLocalStore(store);
  return order;
}

async function getUserOrders(userId) {
  if (!userId) return [];

  if (isPgConnected) {
    const res = await pool.query(
      `SELECT o.*, t.partner1_name, t.partner2_name
       FROM orders o
       LEFT JOIN tenants t ON o.tenant_slug = t.slug
       WHERE o.user_id = $1 OR o.tenant_slug IN (SELECT slug FROM tenants WHERE user_id = $1)
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return res.rows.map(r => ({
      id: r.id,
      plan: r.plan,
      amount: parseFloat(r.amount),
      currency: r.currency,
      status: r.status,
      tenantSlug: r.tenant_slug,
      partner1: r.partner1_name || "Partner 1",
      partner2: r.partner2_name || "Partner 2",
      createdAt: r.created_at
    }));
  }

  const store = loadLocalStore();
  const userSiteSlugs = Object.values(store.tenants)
    .filter(t => t.user_id === userId)
    .map(t => t.slug);

  return Object.values(store.orders)
    .filter(o => o.user_id === userId || userSiteSlugs.includes(o.tenant_slug))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(o => {
      const t = store.tenants[o.tenant_slug] || {};
      return {
        id: o.id,
        plan: o.plan,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        tenantSlug: o.tenant_slug,
        partner1: t.partner1_name || "Partner 1",
        partner2: t.partner2_name || "Partner 2",
        createdAt: o.created_at
      };
    });
}

// ----------------------------------------------------
// USER DESIGNS (COUPLE SITES)
// ----------------------------------------------------

async function getUserDesigns(userId, customerEmail = null, isAdmin = false) {
  if (!userId && !customerEmail && !isAdmin) return [];
  const cleanEmail = customerEmail ? String(customerEmail).toLowerCase().trim() : "";

  if (isPgConnected) {
    const query = isAdmin ? `
      SELECT t.id, t.slug, t.partner1_name, t.partner2_name, t.plan,
             t.auth_token, t.is_purchased, t.created_at,
             c.theme_id, c.template_preset, c.updated_at
      FROM tenants t
      LEFT JOIN site_configs c ON t.id = c.tenant_id
      ORDER BY t.created_at DESC
    ` : `
      SELECT t.id, t.slug, t.partner1_name, t.partner2_name, t.plan,
             t.auth_token, t.is_purchased, t.created_at,
             c.theme_id, c.template_preset, c.updated_at
      FROM tenants t
      LEFT JOIN site_configs c ON t.id = c.tenant_id
      WHERE t.user_id = $1 OR t.slug = 'demo' ${cleanEmail ? "OR (t.customer_email IS NOT NULL AND LOWER(t.customer_email) = $2)" : ""}
      ORDER BY t.created_at DESC
    `;
    const params = isAdmin ? [] : (cleanEmail ? [userId, cleanEmail] : [userId]);
    const res = await pool.query(query, params);
    return res.rows.map(r => ({
      id: r.id,
      slug: r.slug,
      partner1: r.partner1_name,
      partner2: r.partner2_name,
      plan: r.plan,
      themeId: r.theme_id || "romantic-rose",
      preset: r.template_preset || "complete",
      authToken: r.auth_token,
      isPurchased: r.is_purchased !== false,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      siteUrl: `/sites/${encodeURIComponent(r.slug)}`,
      builderUrl: `/builder?slug=${encodeURIComponent(r.slug)}&token=${encodeURIComponent(r.auth_token || "")}`
    }));
  }

  const store = loadLocalStore();
  const allTenants = Object.values(store.tenants);
  const filtered = isAdmin ? allTenants : allTenants.filter(t => t.slug === 'demo' || (userId && (t.user_id === userId || t.userId === userId)) || (cleanEmail && ((t.customer_email && t.customer_email.toLowerCase() === cleanEmail) || (t.customerEmail && t.customerEmail.toLowerCase() === cleanEmail))));
  return filtered
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(t => {
      const cfg = store.site_configs[t.slug] || {};
      return {
        id: t.id,
        slug: t.slug,
        partner1: t.partner1_name,
        partner2: t.partner2_name,
        plan: t.plan,
        themeId: cfg.theme_id || "romantic-rose",
        preset: cfg.template_preset || "complete",
        authToken: t.auth_token,
        isPurchased: t.is_purchased !== false,
        createdAt: t.created_at,
        updatedAt: cfg.updated_at,
        siteUrl: `/sites/${encodeURIComponent(t.slug)}`,
        builderUrl: `/builder?slug=${encodeURIComponent(t.slug)}&token=${encodeURIComponent(t.auth_token || "")}`
      };
    });
}

async function linkTenantToUser(slug, userId) {
  if (!slug || !userId) return;
  const cleanSlug = String(slug).toLowerCase().trim();

  if (isPgConnected) {
    await pool.query(`UPDATE tenants SET user_id = $1 WHERE slug = $2`, [userId, cleanSlug]);
    return;
  }

  const store = loadLocalStore();
  if (store.tenants[cleanSlug]) {
    store.tenants[cleanSlug].user_id = userId;
    saveLocalStore(store);
  }
}

async function deleteTenant(slug, userId = null, isAdmin = false) {
  if (!slug || slug === "demo") {
    throw new Error("Cannot delete demo template");
  }
  const cleanSlug = String(slug).toLowerCase().trim();
  if (isPgConnected) {
    let res;
    if (isAdmin || !userId) {
      res = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [cleanSlug]);
    } else {
      res = await pool.query(`DELETE FROM tenants WHERE slug = $1 AND (user_id = $2 OR user_id IS NULL) RETURNING id`, [cleanSlug, userId]);
    }
    return res.rowCount > 0;
  }
  const store = loadLocalStore();
  const tenant = store.tenants[cleanSlug];
  if (!tenant) return false;
  if (!isAdmin && tenant.user_id && tenant.user_id !== userId && tenant.userId !== userId) {
    return false;
  }
  delete store.tenants[cleanSlug];
  delete store.site_configs[cleanSlug];
  saveLocalStore(store);
  return true;
}

async function duplicateTenant(slug, userId = null, isAdmin = false) {
  const cleanSlug = String(slug).toLowerCase().trim();
  const source = await getTenantBySlug(cleanSlug);
  if (!source) {
    throw new Error("Source website not found");
  }
  if (!isAdmin && userId && source.userId && source.userId !== userId) {
    throw new Error("Unauthorized to duplicate this project");
  }

  let baseSlug = `${cleanSlug}-copy`.replace(/[^a-z0-9_-]/g, "-").slice(0, 32);
  let candidateSlug = baseSlug;
  let counter = 2;
  while (await getTenantBySlug(candidateSlug)) {
    candidateSlug = `${baseSlug}-${counter++}`;
  }

  const id = crypto.randomUUID();
  const authToken = crypto.randomBytes(24).toString("hex");
  const partner1 = source.partner1 || "Partner 1";
  const partner2 = source.partner2 || "Partner 2";
  const customerEmail = source.customerEmail || null;
  const isPurchased = source.isPurchased;
  const plan = source.plan || "vip";
  const targetUserId = userId || source.userId || null;
  const templatePreset = source.templatePreset || "blank";
  const themeId = source.themeId || "romantic-rose";
  const layoutOrder = source.layoutOrder || [];
  const sectionsData = source.sectionsData || {};

  if (isPgConnected) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO tenants (id, slug, partner1_name, partner2_name, customer_email, is_purchased, plan, auth_token, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, candidateSlug, partner1, partner2, customerEmail, isPurchased, plan, authToken, targetUserId]
      );
      await client.query(
        `INSERT INTO site_configs (tenant_id, template_preset, theme_id, layout_order, sections_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, templatePreset, themeId, JSON.stringify(layoutOrder), JSON.stringify(sectionsData)]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } else {
    const store = loadLocalStore();
    store.tenants[candidateSlug] = {
      id,
      slug: candidateSlug,
      partner1_name: partner1,
      partner2_name: partner2,
      customer_email: customerEmail,
      is_purchased: isPurchased,
      plan,
      auth_token: authToken,
      user_id: targetUserId,
      created_at: new Date().toISOString()
    };
    store.site_configs[candidateSlug] = {
      tenant_id: id,
      template_preset: templatePreset,
      theme_id: themeId,
      layout_order: layoutOrder,
      sections_data: sectionsData,
      updated_at: new Date().toISOString()
    };
    saveLocalStore(store);
  }

  return getTenantBySlug(candidateSlug);
}

module.exports = {
  pool,
  initDb,
  DEFAULT_PRESETS,
  DEFAULT_SECTIONS_DATA,
  createTenant,
  getTenantBySlug,
  updateSiteConfig,
  listTenants,
  verifyTenantAccess,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  createSession,
  validateSession,
  deleteSession,
  createOrder,
  getUserOrders,
  getUserDesigns,
  linkTenantToUser,
  deleteTenant,
  duplicateTenant,
  MASTER_ADMIN_TOKEN
};
