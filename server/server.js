const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const url = require("node:url");

const db = require("./db");
const r2 = require("./r2");
const { WIDGET_REGISTRY, PRESETS } = require("../core/widget-registry");

const PORT = process.env.SAAS_PORT || 4000;
const ROOT_DIR = path.join(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".m4r": "audio/mp4",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav"
};

// Initialize PostgreSQL Database Schema
(async () => {
  try {
    await db.initDb();
    console.log("✓ PostgreSQL Database 'couple_saas' connected & verified");
  } catch (err) {
    console.error("PostgreSQL Connection Error:", err.message);
  }
})();

function parseMultipart(buffer, boundary) {
  const parts = {};
  const delim = Buffer.from(`--${boundary}`);
  let start = buffer.indexOf(delim);
  while (start !== -1) {
    start += delim.length;
    if (buffer.slice(start, start + 2).toString() === "--") break;
    if (buffer.slice(start, start + 2).toString() === "\r\n") start += 2;
    const headerEnd = buffer.indexOf("\r\n\r\n", start);
    if (headerEnd === -1) break;
    const headerStr = buffer.slice(start, headerEnd).toString("utf8");
    const nextDelim = buffer.indexOf(delim, headerEnd + 4);
    if (nextDelim === -1) break;
    const bodyEnd = nextDelim - 2;
    const body = buffer.slice(headerEnd + 4, bodyEnd);
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
    if (nameMatch) {
      const fieldName = nameMatch[1];
      if (filenameMatch) {
        parts[fieldName] = {
          filename: filenameMatch[1],
          contentType: ctMatch ? ctMatch[1].trim() : "application/octet-stream",
          data: body
        };
      } else {
        parts[fieldName] = body.toString("utf8");
      }
    }
    start = nextDelim;
  }
  return parts;
}

function resolveTenantSlug(req, parsedUrl) {
  if (req.headers["x-tenant-slug"]) return req.headers["x-tenant-slug"].trim();
  if (parsedUrl.query.slug) return String(parsedUrl.query.slug).trim();
  const referer = req.headers["referer"] || "";
  const siteMatch = referer.match(/\/sites\/([a-zA-Z0-9_-]+)/);
  if (siteMatch) return siteMatch[1];
  const builderMatch = referer.match(/slug=([a-zA-Z0-9_-]+)/) || referer.match(/site=([a-zA-Z0-9_-]+)/);
  if (builderMatch) return builderMatch[1];
  return "demo";
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error("Malformed JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Pin, X-Tenant-Slug"
  });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("404 Not Found");
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  const cacheControl = (ext === ".html" || ext === ".js" || ext === ".css") ? "no-cache, must-revalidate" : "public, max-age=86400";
  res.writeHead(200, { "Content-Type": mime, "Access-Control-Allow-Origin": "*", "Cache-Control": cacheControl });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Pin"
    });
    return res.end();
  }

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // GET /api/presets
  if (pathname === "/api/presets" && method === "GET") {
    return sendJson(res, 200, { presets: PRESETS, registry: WIDGET_REGISTRY });
  }

  // GET /api/default-sections
  if (pathname === "/api/default-sections" && method === "GET") {
    return sendJson(res, 200, { defaults: db.DEFAULT_SECTIONS_DATA });
  }

  // GET /api/tenants
  if (pathname === "/api/tenants" && method === "GET") {
    const list = await db.listTenants();
    return sendJson(res, 200, { tenants: list });
  }

  // POST /api/tenants (create tenant)
  if (pathname === "/api/tenants" && method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      if (!payload.slug || !payload.partner1 || !payload.partner2 || !payload.adminPin) {
        return sendJson(res, 400, { error: "Missing required fields: slug, partner1, partner2, adminPin" });
      }
      const created = await db.createTenant(payload);
      return sendJson(res, 201, created);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // GET /api/check-slug?slug=...
  if (pathname === "/api/check-slug" && method === "GET") {
    const checkSlug = String(parsedUrl.query.slug || "").toLowerCase().trim();
    if (!checkSlug || !/^[a-z0-9_-]{2,40}$/.test(checkSlug)) {
      return sendJson(res, 200, { available: false, error: "Slug must be 2-40 letters, numbers, or dashes" });
    }
    const reserved = ["builder", "api", "sites", "public", "admin", "static", "images", "audio", "uploads", "demo"];
    if (reserved.includes(checkSlug)) {
      return sendJson(res, 200, { available: false, error: "This couple slug is reserved" });
    }
    const tenant = await db.getTenantBySlug(checkSlug);
    return sendJson(res, 200, { available: !tenant, slug: checkSlug });
  }

  // POST /api/checkout (instant purchase & site creation)
  if (pathname === "/api/checkout" && method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const { partner1, partner2, slug, adminPin, customerEmail, plan = "vip", preset = "complete" } = payload;
      if (!slug || !partner1 || !partner2 || !adminPin) {
        return sendJson(res, 400, { error: "Missing required fields: slug, partner1, partner2, adminPin" });
      }
      const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
      const existing = await db.getTenantBySlug(cleanSlug);
      if (existing) {
        return sendJson(res, 409, { error: `Site '${cleanSlug}' already exists. Please choose a different URL slug.` });
      }
      const created = await db.createTenant({
        slug: cleanSlug,
        partner1: String(partner1).trim(),
        partner2: String(partner2).trim(),
        adminPin: String(adminPin).trim(),
        customerEmail: customerEmail ? String(customerEmail).trim() : null,
        plan,
        preset: preset || (plan === "starter" ? "storyteller" : "complete"),
        isPurchased: true
      });
      return sendJson(res, 201, {
        success: true,
        message: "Couple site provisioned successfully!",
        tenant: {
          slug: created.slug,
          partner1: created.partner1,
          partner2: created.partner2,
          plan: created.plan,
          authToken: created.authToken
        },
        builderUrl: `/builder?slug=${encodeURIComponent(created.slug)}&token=${encodeURIComponent(created.authToken)}`,
        siteUrl: `/sites/${encodeURIComponent(created.slug)}`
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // POST /api/auth/verify-access
  if (pathname === "/api/auth/verify-access" && method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const result = await db.verifyTenantAccess(body);
      if (!result.authorized) {
        return sendJson(res, 401, { authorized: false, error: result.error });
      }
      return sendJson(res, 200, {
        authorized: true,
        slug: result.tenant.slug,
        partner1: result.tenant.partner1,
        partner2: result.tenant.partner2,
        plan: result.tenant.plan,
        authToken: result.tenant.authToken,
        isDemo: result.isDemo || false
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // Tenant-scoped routes: /api/tenants/:slug
  const tenantMatch = pathname.match(/^\/api\/tenants\/([a-zA-Z0-9_-]+)(.*)/);
  if (tenantMatch) {
    const slug = tenantMatch[1];
    const subRoute = tenantMatch[2];

    // GET /api/tenants/:slug
    if (subRoute === "" && method === "GET") {
      const tenant = await db.getTenantBySlug(slug);
      if (!tenant) return sendJson(res, 404, { error: "Tenant not found" });
      return sendJson(res, 200, tenant);
    }

    // PUT /api/tenants/:slug/config
    if (subRoute === "/config" && method === "PUT") {
      try {
        const body = await parseJsonBody(req);
        const adminPin = req.headers["x-admin-pin"] || body.adminPin;
        const updated = await db.updateSiteConfig(slug, {
          templatePreset: body.templatePreset,
          themeId: body.themeId,
          layoutOrder: body.layoutOrder,
          sectionsData: body.sectionsData,
          adminPin,
          newAdminPin: body.newAdminPin
        });
        return sendJson(res, 200, updated);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // POST /api/tenants/:slug/upload-url (Cloudflare R2 or local fallback destination)
    if (subRoute === "/upload-url" && method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const dest = await r2.getUploadDestination(slug, body.filename || "upload.jpg", body.contentType);
        return sendJson(res, 200, dest);
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // GET /api/tenants/:slug/media
    if (subRoute === "/media" && method === "GET") {
      try {
        const list = await r2.listTenantUploads(slug);
        return sendJson(res, 200, { media: list });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // DELETE /api/tenants/:slug/media/:filename
    const delMediaMatch = subRoute.match(/^\/media\/(.+)$/);
    if (delMediaMatch && method === "DELETE") {
      try {
        const deleted = await r2.deleteTenantUpload(slug, decodeURIComponent(delMediaMatch[1]));
        return sendJson(res, 200, { ok: true, deleted });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }
  }

  // GET /api/images, /images - list images from Cloudflare R2
  if (method === "GET" && (pathname === "/api/images" || pathname === "/images")) {
    try {
      const files = await r2.listR2Images("images/");
      return sendJson(res, 200, files);
    } catch (e) {
      return sendJson(res, 500, { error: "Failed to read images from R2" });
    }
  }

  // GET /api/data, /data, /api.php?endpoint=data
  const isGetData = method === "GET" && (
    pathname === "/api/data" ||
    pathname === "/data" ||
    (pathname === "/api.php" && parsedUrl.query.endpoint === "data")
  );
  if (isGetData) {
    const slug = resolveTenantSlug(req, parsedUrl);
    const tenant = await db.getTenantBySlug(slug);
    if (!tenant) return sendJson(res, 404, { error: "Tenant not found" });
    const fullData = {
      slug: tenant.slug,
      partner1: tenant.partner1,
      partner2: tenant.partner2,
      partnerName: tenant.partner2,
      senderName: tenant.partner1,
      ...(tenant.sectionsData || {})
    };
    return sendJson(res, 200, fullData);
  }

  // POST /api/save, /save, /api.php?endpoint=save
  const isSaveData = method === "POST" && (
    pathname === "/api/save" ||
    pathname === "/save" ||
    (pathname === "/api.php" && parsedUrl.query.endpoint === "save")
  );
  if (isSaveData) {
    try {
      const slug = resolveTenantSlug(req, parsedUrl);
      const body = await parseJsonBody(req);
      const tenant = await db.getTenantBySlug(slug);
      if (!tenant) return sendJson(res, 404, { error: "Tenant not found" });
      await db.updateSiteConfig(slug, {
        templatePreset: tenant.templatePreset,
        themeId: tenant.themeId,
        layoutOrder: tenant.layoutOrder,
        sectionsData: { ...tenant.sectionsData, ...body }
      });
      return sendJson(res, 200, { status: "ok", success: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/save-image, /save-image, /api.php?endpoint=save-image
  const isSaveImage = method === "POST" && (
    pathname === "/api/save-image" ||
    pathname === "/save-image" ||
    pathname.endsWith("/save-image") ||
    pathname.endsWith("/api/save-image") ||
    (pathname === "/api.php" && parsedUrl.query.endpoint === "save-image")
  );

  if (isSaveImage) {
    const slug = resolveTenantSlug(req, parsedUrl);
    const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
    let size = 0;
    let destroyed = false;
    const chunks = [];

    req.on("data", c => {
      if (destroyed) return;
      size += c.length;
      if (size > MAX_UPLOAD_SIZE) {
        destroyed = true;
        req.destroy();
        return sendJson(res, 413, { error: "File exceeds 10MB limit (10 Mo)" });
      }
      chunks.push(c);
    });

    req.on("end", async () => {
      if (destroyed) return;
      try {
        const fullBuf = Buffer.concat(chunks);
        const ctHeader = req.headers["content-type"] || "";
        let filename = "upload.jpg";
        let imageBuf = null;
        let mime = "image/jpeg";

        if (ctHeader.includes("multipart/form-data")) {
          const boundaryMatch = ctHeader.match(/boundary=([^;]+)/i);
          if (boundaryMatch) {
            const parts = parseMultipart(fullBuf, boundaryMatch[1].trim());
            if (parts.filename && typeof parts.filename === "string") {
              filename = parts.filename;
            }
            if (parts.image && parts.image.data) {
              imageBuf = parts.image.data;
              mime = parts.image.contentType || "image/jpeg";
              if (parts.image.filename) filename = parts.image.filename;
            }
          }
        } else {
          const bodyStr = fullBuf.toString("utf8");
          let body = {};
          try { body = JSON.parse(bodyStr); } catch (e) {}
          if (body.filename) filename = body.filename;
          const dataUrl = body.dataUrl || body.image || "";
          if (dataUrl && dataUrl.startsWith("data:")) {
            const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              mime = match[1];
              imageBuf = Buffer.from(match[2], "base64");
            }
          } else if (fullBuf.length > 0 && !bodyStr.startsWith("{")) {
            imageBuf = fullBuf;
            mime = ctHeader || "image/jpeg";
          }
        }

        if (!imageBuf || imageBuf.length === 0) {
          return sendJson(res, 400, { error: "No valid image data provided" });
        }

        if (imageBuf.length > MAX_UPLOAD_SIZE) {
          return sendJson(res, 413, { error: "Image exceeds 10MB limit (10 Mo)" });
        }

        const cleanFilename = path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, "_");

        // Upload buffer directly and exclusively to Cloudflare R2
        await r2.uploadBufferToR2(`images/${cleanFilename}`, imageBuf, mime);

        // Mirror legacy aliases in R2
        const aliases = {
          "chap-guangzhou-start.jpg": "guangzhou.jpg",
          "guangzhou.jpg": "chap-guangzhou-start.jpg",
          "chap-bali.jpg": "bali.jpg",
          "bali.jpg": "chap-bali.jpg",
          "chap-jakarta.jpg": "jakarta.jpg",
          "jakarta.jpg": "chap-jakarta.jpg",
          "chap-vietnam.jpg": "vietnam.jpg",
          "vietnam.jpg": "chap-vietnam.jpg",
          "chap-ldr.jpg": "algeria.jpg",
          "algeria.jpg": "chap-ldr.jpg",
          "chap-shenzhen.jpg": "shenzhen.jpg",
          "shenzhen.jpg": "chap-shenzhen.jpg",
          "chap-chongqing.jpg": "chongqing.jpg",
          "chongqing.jpg": "chap-chongqing.jpg",
          "chap-chengdu.jpg": "chengdu.jpg",
          "chengdu.jpg": "chap-chengdu.jpg",
          "chap-dagu.jpg": "dagu.jpg",
          "dagu.jpg": "chap-dagu.jpg",
          "chap-bipenggou.jpg": "bipenggou.jpg",
          "bipenggou.jpg": "chap-bipenggou.jpg",
          "chap-jiuzhaigou.jpg": "jiuzhaigou.jpg",
          "jiuzhaigou.jpg": "chap-jiuzhaigou.jpg",
          "chap-huanglong.jpg": "huanglong.jpg",
          "huanglong.jpg": "chap-huanglong.jpg",
          "chap-nansha.jpg": "nansha.jpg",
          "nansha.jpg": "chap-nansha.jpg",
          "chap-wuhan.jpg": "wuhan.jpg",
          "wuhan.jpg": "chap-wuhan.jpg",
          "chap-nanjing.jpg": "nanjing.jpg",
          "nanjing.jpg": "chap-nanjing.jpg",
          "chap-shanghai.jpg": "shanghai.jpg",
          "shanghai.jpg": "chap-shanghai.jpg"
        };
        if (aliases[cleanFilename]) {
          r2.uploadBufferToR2(`images/${aliases[cleanFilename]}`, imageBuf, mime).catch(() => {});
        }

        const publicPath = `images/${cleanFilename}`;
        return sendJson(res, 200, {
          status: "ok",
          success: true,
          path: publicPath,
          url: publicPath,
          key: cleanFilename
        });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    });
    return;
  }

  // POST /api/delete-image, /delete-image, /api.php?endpoint=delete-image
  const isDeleteImage = method === "POST" && (
    pathname === "/api/delete-image" ||
    pathname === "/delete-image" ||
    pathname.endsWith("/delete-image") ||
    pathname.endsWith("/api/delete-image") ||
    (pathname === "/api.php" && parsedUrl.query.endpoint === "delete-image")
  );

  if (isDeleteImage) {
    try {
      const body = await parseJsonBody(req);
      const filename = body.filename || body.key || "";
      if (!filename) return sendJson(res, 400, { error: "Missing filename" });
      const slug = body.slug || resolveTenantSlug(req, parsedUrl);
      const safeFilename = path.basename(filename);

      const deleted = await r2.deleteR2Object(`images/${safeFilename}`) || await r2.deleteTenantUpload(slug, safeFilename);
      return sendJson(res, 200, { status: "ok", success: true, ok: true, deleted });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/save-audio, /save-audio
  const isSaveAudio = method === "POST" && (
    pathname === "/api/save-audio" ||
    pathname === "/save-audio" ||
    pathname.endsWith("/save-audio")
  );

  if (isSaveAudio) {
    try {
      const body = await parseJsonBody(req);
      const filename = path.basename(body.filename || "audio.webm");
      const dataUrl = body.dataUrl || "";
      if (!dataUrl) return sendJson(res, 400, { error: "Missing audio data" });
      const base64Data = dataUrl.replace(/^data:audio\/\w+;base64,/, "");
      const buf = Buffer.from(base64Data, "base64");
      const ext = path.extname(filename).toLowerCase();
      const mime = MIME_TYPES[ext] || "audio/webm";
      await r2.uploadBufferToR2(`audio/${filename}`, buf, mime);
      return sendJson(res, 200, { status: "ok", path: `audio/${filename}` });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/upload/local (Local upload helper fallback with 10MB limit)
  if (pathname === "/api/upload/local" && method === "POST") {
    const key = parsedUrl.query.key;
    if (!key) return sendJson(res, 400, { error: "Missing key param" });

    const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
    let size = 0;
    let destroyed = false;
    const chunks = [];

    req.on("data", c => {
      if (destroyed) return;
      size += c.length;
      if (size > MAX_UPLOAD_SIZE) {
        destroyed = true;
        req.destroy();
        return sendJson(res, 413, { error: "File exceeds 10MB limit (10 Mo)" });
      }
      chunks.push(c);
    });
    req.on("end", async () => {
      if (destroyed) return;
      try {
        const buffer = Buffer.concat(chunks);
        const ext = path.extname(key).toLowerCase();
        const ct = MIME_TYPES[ext] || "application/octet-stream";
        if (r2.isR2Configured) {
          await r2.uploadBufferToR2(key, buffer, ct);
        } else {
          r2.saveLocalFile(key, buffer);
        }
        return sendJson(res, 200, { status: "ok", publicUrl: `/uploads/${key}` });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    });
    return;
  }

  // ----------------------------------------------------
  // STATIC & PAGE ROUTES
  // ----------------------------------------------------

  // /builder or /builder/
  if (pathname === "/builder" || pathname === "/builder/") {
    return serveFile(res, path.join(ROOT_DIR, "builder", "index.html"));
  }

  // /sites/:slug
  const siteMatch = pathname.match(/^\/sites\/([a-zA-Z0-9_-]+)\/?$/);
  if (siteMatch) {
    return serveFile(res, path.join(ROOT_DIR, "public", "viewer.html"));
  }

  // Stream media (images, audio, uploads) directly from Cloudflare R2
  const isR2Media = pathname.startsWith("/images/") || pathname.startsWith("/audio/") || pathname.startsWith("/uploads/");
  if (isR2Media && r2.isR2Configured) {
    const key = pathname.replace(/^\//, "");
    try {
      const r2Obj = await r2.getObjectFromR2(key);
      if (r2Obj && r2Obj.Body) {
        const ext = path.extname(pathname).toLowerCase();
        const mime = r2Obj.ContentType || MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": mime,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400"
        });
        r2Obj.Body.pipe(res);
        return;
      }
    } catch (err) {
      console.warn("R2 stream error:", err.message);
    }
  }

  // Static assets from builder, core, public
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  const staticTarget = path.join(ROOT_DIR, safePath);

  if (fs.existsSync(staticTarget) && fs.statSync(staticTarget).isFile()) {
    return serveFile(res, staticTarget);
  }

  const publicTarget = path.join(ROOT_DIR, "public", safePath);
  if (fs.existsSync(publicTarget) && fs.statSync(publicTarget).isFile()) {
    return serveFile(res, publicTarget);
  }

  // Dynamic fallback placeholder for missing images
  if (pathname.startsWith("/images/") || pathname.startsWith("/uploads/")) {
    const filename = path.basename(pathname).replace(/\.[^.]+$/, "");
    const cleanTitle = filename.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff758c"/><stop offset="100%" stop-color="#ff7eb3"/></linearGradient></defs><rect width="600" height="450" fill="url(#g)" rx="16"/><circle cx="300" cy="190" r="55" fill="rgba(255,255,255,0.2)"/><text x="300" y="206" font-size="48" text-anchor="middle">📸</text><text x="300" y="280" font-size="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle">${cleanTitle}</text><text x="300" y="310" font-size="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" fill="rgba(255,255,255,0.85)" text-anchor="middle">A Treasured Couple Memory ❤️</text></svg>`;
    res.writeHead(200, {
      "Content-Type": "image/svg+xml",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400"
    });
    return res.end(svg);
  }

  // Root path, /welcome & /landing -> serve SaaS Landing Page
  if (pathname === "/welcome" || pathname === "/welcome/" || pathname === "/" || pathname === "" || pathname === "/landing") {
    return serveFile(res, path.join(ROOT_DIR, "public", "index.html"));
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Couples SaaS Platform Engine running on Port ${PORT}`);
  console.log(` Landing Page:   http://localhost:${PORT}/`);
  console.log(` Builder Studio: http://localhost:${PORT}/builder`);
  console.log(` Demo Couple Site: http://localhost:${PORT}/sites/demo`);
  console.log(` Storage Mode: ${r2.isR2Configured ? "Cloudflare R2" : "Local Storage (R2 ready)"}`);
  console.log(`====================================================`);
});
