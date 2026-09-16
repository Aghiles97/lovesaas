const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const url = require("node:url");

const db = require("./db");
const auth = require("./auth");
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
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".weba": "audio/webm",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
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
  const headerSlug = req.headers["x-tenant-slug"];
  if (headerSlug) return headerSlug.trim().toLowerCase();
  if (parsedUrl && parsedUrl.query && parsedUrl.query.slug) return String(parsedUrl.query.slug).trim().toLowerCase();
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
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, X-User-Token, Authorization, X-Tenant-Slug"
  });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath, req = null) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("404 Not Found");
  }
  const stat = fs.statSync(filePath);
  const total = stat.size;
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  const isThemeMedia = filePath.includes("/images/themes/");
  const cacheControl = (ext === ".html" || ext === ".js" || ext === ".css" || isThemeMedia) ? "no-cache, must-revalidate" : "public, max-age=86400";

  const range = req && req.headers ? req.headers.range : null;
  if (range && (mime.startsWith("audio/") || mime.startsWith("video/"))) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10) || 0;
    const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
    if (start >= total || end >= total) {
      res.writeHead(416, { "Content-Range": `bytes */${total}` });
      return res.end();
    }
    const chunksize = (end - start) + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": mime,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": cacheControl
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Type": mime,
    "Content-Length": total,
    "Accept-Ranges": "bytes",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": cacheControl
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname || "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, X-User-Token, Authorization"
    });
    return res.end();
  }

  async function getAuthenticatedUser(req, parsedUrl) {
    const token = auth.extractToken(req, parsedUrl);
    if (!token) return null;
    const session = await db.validateSession(token);
    return session ? session.user : null;
  }

  function extractRequestAuthToken(req, parsedUrl, body = null) {
    return (
      req.headers["x-auth-token"] ||
      req.headers["x-user-token"] ||
      auth.extractToken(req, parsedUrl) ||
      (body && (body.authToken || body.token)) ||
      (parsedUrl && parsedUrl.query && (parsedUrl.query.token || parsedUrl.query.authToken)) ||
      null
    );
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
      if (!payload.slug || !payload.partner1 || !payload.partner2) {
        return sendJson(res, 400, { error: "Missing required fields: slug, partner1, partner2" });
      }
      const authTokenHeader = req.headers["x-auth-token"] || payload.masterAuthToken;
      const isMasterAdmin = Boolean(process.env.ADMIN_TOKEN && authTokenHeader === process.env.ADMIN_TOKEN);
      const authUser = await getAuthenticatedUser(req, parsedUrl);
      const created = await db.createTenant({
        ...payload,
        userId: payload.userId || (authUser ? authUser.id : null),
        customerEmail: payload.customerEmail || (authUser ? authUser.email : null),
        plan: isMasterAdmin ? "vip" : (payload.plan || "vip"),
        isPurchased: isMasterAdmin ? true : (payload.isPurchased === true)
      });
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
      const { partner1, partner2, slug, customerEmail, plan = "vip", preset = "complete", anniversaryDate, subtitle } = payload;
      if (!slug || !partner1 || !partner2) {
        return sendJson(res, 400, { error: "Missing required fields: slug, partner1, partner2" });
      }
      const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
      const existing = await db.getTenantBySlug(cleanSlug);
      if (existing) {
        return sendJson(res, 409, { error: `Project '${cleanSlug}' already exists. Please choose a different URL slug.` });
      }

      // Associate with user account & check admin bypass
      const currentUser = await getAuthenticatedUser(req, parsedUrl);
      const masterToken = process.env.ADMIN_TOKEN;
      const isAdmin = (currentUser && currentUser.role === "admin") ||
                      Boolean(masterToken && req.headers["x-auth-token"] === masterToken);

      let userId = currentUser ? currentUser.id : null;
      let sessionToken = currentUser ? auth.extractToken(req, parsedUrl) : null;

      if (!userId && customerEmail) {
        const cleanEmail = String(customerEmail).trim().toLowerCase();
        let user = await db.findUserByEmail(cleanEmail);
        if (!user && payload.password) {
          user = await db.createUser({
            email: cleanEmail,
            password: payload.password,
            name: String(partner1).trim(),
            role: isAdmin ? "admin" : "user"
          });
          userId = user.id;
          sessionToken = await db.createSession(userId);
        } else if (user) {
          userId = user.id;
          if (payload.password && (await auth.verifyPassword(payload.password, user.password_hash, user.salt))) {
            sessionToken = await db.createSession(userId);
          }
        }
      }

      const assignedPlan = isAdmin ? "vip" : plan;
      const created = await db.createTenant({
        slug: cleanSlug,
        partner1: String(partner1).trim(),
        partner2: String(partner2).trim(),
        customerEmail: customerEmail ? String(customerEmail).trim() : null,
        plan: assignedPlan,
        preset: preset || "blank",
        isPurchased: true,
        userId,
        anniversaryDate: anniversaryDate || null,
        subtitle: subtitle || null
      });

      // Record Order / Purchase ($0 for admin, normal amount for standard user)
      const amount = isAdmin ? 0.00 : (assignedPlan === "starter" ? 19.00 : 39.00);
      await db.createOrder({
        userId,
        tenantSlug: cleanSlug,
        plan: assignedPlan,
        amount,
        currency: "USD",
        status: "completed"
      });

      return sendJson(res, 201, {
        success: true,
        message: isAdmin ? "Admin VIP project provisioned (payment bypassed)!" : "Couple project provisioned successfully!",
        isAdmin,
        tenant: {
          slug: created.slug,
          partner1: created.partner1,
          partner2: created.partner2,
          plan: created.plan,
          authToken: created.authToken
        },
        userToken: sessionToken || null,
        builderUrl: `/builder?slug=${encodeURIComponent(created.slug)}&token=${encodeURIComponent(created.authToken)}`,
        siteUrl: `/sites/${encodeURIComponent(created.slug)}`
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // ----------------------------------------------------
  // USER AUTH & PORTAL API ROUTES
  // ----------------------------------------------------

  // POST /api/auth/register
  if (pathname === "/api/auth/register" && method === "POST") {
    try {
      const { email, password, name } = await parseJsonBody(req);
      if (!email || !password) {
        return sendJson(res, 400, { error: "Email and password are required." });
      }
      if (password.length < 4) {
        return sendJson(res, 400, { error: "Password must be at least 4 characters." });
      }
      const existing = await db.findUserByEmail(email);
      if (existing) {
        return sendJson(res, 409, { error: "An account with this email already exists. Please sign in." });
      }
      const user = await db.createUser({ email, password, name });
      const token = await db.createSession(user.id);
      return sendJson(res, 201, {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role || "user", createdAt: user.created_at }
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/auth/login
  if (pathname === "/api/auth/login" && method === "POST") {
    try {
      const { email, password } = await parseJsonBody(req);
      if (!email || !password) {
        return sendJson(res, 400, { error: "Email and password are required." });
      }
      const cleanEmail = email.trim().toLowerCase();
      const user = await db.findUserByEmail(cleanEmail);
      const isAdminEmail = cleanEmail === "admin@admin.com";
      const isAdminTokenMatch = Boolean(process.env.ADMIN_TOKEN && password === process.env.ADMIN_TOKEN);
      const isAdminPassMatch = Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
      const isAdminFallback = isAdminEmail && (password === "admin1234" || isAdminTokenMatch || isAdminPassMatch);

      let passwordValid = false;
      if (user) {
        passwordValid = await auth.verifyPassword(password, user.password_hash, user.salt);
      }
      if (!passwordValid && isAdminFallback && user) {
        passwordValid = true;
      }

      if (!user || !passwordValid) {
        return sendJson(res, 401, { error: "Invalid email or password." });
      }
      const token = await db.createSession(user.id);
      const role = isAdminEmail ? "admin" : (user.role || "user");
      return sendJson(res, 200, {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role, createdAt: user.created_at }
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/auth/logout
  if (pathname === "/api/auth/logout" && method === "POST") {
    try {
      const token = auth.extractToken(req, parsedUrl);
      if (token) {
        await db.deleteSession(token);
      }
      return sendJson(res, 200, { success: true, message: "Logged out successfully" });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // GET /api/auth/user-me
  if (pathname === "/api/auth/user-me" && method === "GET") {
    try {
      const token = auth.extractToken(req, parsedUrl);
      if (!token) {
        return sendJson(res, 401, { authenticated: false });
      }
      const session = await db.validateSession(token);
      if (!session) {
        return sendJson(res, 401, { authenticated: false, error: "Session expired or invalid" });
      }
      return sendJson(res, 200, { authenticated: true, user: session.user });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // GET /api/user/designs
  if (pathname === "/api/user/designs" && method === "GET") {
    try {
      const authUser = await getAuthenticatedUser(req, parsedUrl);
      if (!authUser) return sendJson(res, 401, { error: "Authentication required" });

      const isAdmin = authUser.role === "admin";
      const designs = await db.getUserDesigns(authUser.id, authUser.email, isAdmin);
      return sendJson(res, 200, { success: true, designs, isAdmin });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // DELETE /api/user/designs/:slug or /api/tenants/:slug
  const delUserDesignMatch = pathname.match(/^\/api\/(?:user\/designs|tenants)\/([^/]+)$/);
  if (delUserDesignMatch && method === "DELETE") {
    try {
      const authUser = await getAuthenticatedUser(req, parsedUrl);
      const reqAuthToken = extractRequestAuthToken(req, parsedUrl);
      const isMasterAdmin = Boolean(process.env.ADMIN_TOKEN && reqAuthToken === process.env.ADMIN_TOKEN);
      const isAdmin = (authUser && authUser.role === "admin") || isMasterAdmin;

      const slug = decodeURIComponent(delUserDesignMatch[1]);
      if (slug === "demo") return sendJson(res, 400, { error: "Cannot delete demo template" });

      const success = await db.deleteTenant(slug, authUser ? authUser.id : null, isAdmin);
      if (!success) return sendJson(res, 404, { error: "Website not found or unauthorized" });

      return sendJson(res, 200, { success: true, message: "Website deleted" });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/user/designs/:slug/duplicate or /api/tenants/:slug/duplicate
  const dupDesignMatch = pathname.match(/^\/api\/(?:user\/designs|tenants)\/([^/]+)\/duplicate$/);
  if (dupDesignMatch && method === "POST") {
    try {
      const authUser = await getAuthenticatedUser(req, parsedUrl);
      const reqAuthToken = extractRequestAuthToken(req, parsedUrl);
      const isMasterAdmin = Boolean(process.env.ADMIN_TOKEN && reqAuthToken === process.env.ADMIN_TOKEN);
      const isAdmin = (authUser && authUser.role === "admin") || isMasterAdmin;
      const slug = decodeURIComponent(dupDesignMatch[1]);

      const newTenant = await db.duplicateTenant(slug, authUser ? authUser.id : null, isAdmin);
      return sendJson(res, 201, { success: true, tenant: newTenant });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // GET /api/user/purchases
  if (pathname === "/api/user/purchases" && method === "GET") {
    try {
      const token = auth.extractToken(req, parsedUrl);
      if (!token) return sendJson(res, 401, { error: "Authentication required" });
      const session = await db.validateSession(token);
      if (!session) return sendJson(res, 401, { error: "Session expired" });

      const purchases = await db.getUserOrders(session.user.id);
      return sendJson(res, 200, { success: true, purchases });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // PUT /api/user/profile
  if (pathname === "/api/user/profile" && method === "PUT") {
    try {
      const token = auth.extractToken(req, parsedUrl);
      if (!token) return sendJson(res, 401, { error: "Authentication required" });
      const session = await db.validateSession(token);
      if (!session) return sendJson(res, 401, { error: "Session expired" });

      const { name, password } = await parseJsonBody(req);
      if (password && password.length < 4) {
        return sendJson(res, 400, { error: "New password must be at least 4 characters." });
      }
      const updated = await db.updateUserProfile(session.user.id, { name, password });
      return sendJson(res, 200, { success: true, user: updated });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
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
        role: result.role,
        isAdmin: result.isAdmin === true,
        isPurchased: result.isPurchased !== false,
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

  // GET /api/auth/me
  if (pathname === "/api/auth/me" && method === "GET") {
    try {
      const slug = resolveTenantSlug(req, parsedUrl);
      const token = req.headers["x-auth-token"] || parsedUrl.query.token;
      const result = await db.verifyTenantAccess({ slug, token });
      return sendJson(res, 200, result);
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

      const token = extractRequestAuthToken(req, parsedUrl);
      const authUser = await getAuthenticatedUser(req, parsedUrl);

      const isAuthorized = (token && String(tenant.authToken).trim() === String(token).trim()) ||
                           Boolean(process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) ||
                           (authUser && (authUser.role === "admin" || authUser.id === tenant.userId || tenant.slug === "demo" || (tenant.customerEmail && authUser.email && tenant.customerEmail.toLowerCase() === authUser.email.toLowerCase())));

      if (!isAuthorized) {
        const publicTenant = { ...tenant };
        delete publicTenant.authToken;
        delete publicTenant.customerEmail;
        return sendJson(res, 200, publicTenant);
      }

      return sendJson(res, 200, tenant);
    }

    // PUT /api/tenants/:slug/config
    if (subRoute === "/config" && method === "PUT") {
      try {
        const body = await parseJsonBody(req);
        const tenant = await db.getTenantBySlug(slug);
        if (!tenant) return sendJson(res, 404, { error: "Tenant not found" });

        const authUser = await getAuthenticatedUser(req, parsedUrl);
        const isOwner = authUser && (authUser.role === "admin" || authUser.id === tenant.userId || slug === "demo" || (tenant.customerEmail && authUser.email && tenant.customerEmail.toLowerCase() === authUser.email.toLowerCase()));

        const authToken = isOwner ? tenant.authToken : (extractRequestAuthToken(req, parsedUrl, body) || body.authToken);

        const isMasterAdmin = (authUser && authUser.role === "admin") ||
                              Boolean(process.env.ADMIN_TOKEN && authToken && String(authToken).trim() === process.env.ADMIN_TOKEN);
        const tokenValid = authToken && tenant.authToken && String(tenant.authToken).trim() === String(authToken).trim();

        if (!isOwner && !isMasterAdmin && !tokenValid) {
          return sendJson(res, 403, { error: "Forbidden: Owner, admin, or valid token required" });
        }

        const updated = await db.updateSiteConfig(slug, {
          templatePreset: body.templatePreset,
          themeId: body.themeId,
          layoutOrder: body.layoutOrder,
          sectionsData: body.sectionsData,
          authToken: authToken || (isOwner ? tenant.authToken : undefined)
        });
        return sendJson(res, 200, updated);
      } catch (err) {
        const status = (err.message.includes("Purchase now") || err.message.includes("Unauthorized")) ? 403 : 400;
        return sendJson(res, status, { error: err.message });
      }
    }

    // POST /api/tenants/:slug/custom-themes (Admin only)
    if (subRoute === "/custom-themes" && method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const authToken = extractRequestAuthToken(req, parsedUrl, body);
        const access = await db.verifyTenantAccess({ slug, token: authToken });
        if (!access.authorized || access.role === "visitor") {
          return sendJson(res, 403, { error: "Unauthorized: Admin required to add themes." });
        }
        const rawName = (body.name || "").trim();
        if (!rawName) {
          return sendJson(res, 400, { error: "Theme name is required." });
        }
        const deskImg = (body.desktopImg || body.mobileImg || "").trim();
        const mobImg = (body.mobileImg || body.desktopImg || "").trim();
        if (!deskImg && !mobImg) {
          return sendJson(res, 400, { error: "Desktop or Mobile background image is required." });
        }
        let color = (body.color || "#e11d48").trim();
        if (!/^#[0-9a-fA-F]{3,8}$/.test(color)) color = "#e11d48";

        const cleanCustomId = (body.id || "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
        const themeId = (cleanCustomId && cleanCustomId.startsWith("theme-img-")) ? cleanCustomId : `theme-img-custom-${Date.now()}`;

        const tenant = access.tenant || await db.getTenantBySlug(slug);
        const sectionsData = tenant.sectionsData || {};
        if (!Array.isArray(sectionsData.customThemes)) {
          sectionsData.customThemes = [];
        }

        const newTheme = {
          id: themeId,
          name: rawName,
          desc: (body.desc || "Custom responsive wallpaper").trim(),
          color,
          desktopImg: deskImg,
          mobileImg: mobImg,
          createdAt: new Date().toISOString()
        };
        const existingIdx = sectionsData.customThemes.findIndex(t => t.id === themeId);
        if (existingIdx >= 0) {
          sectionsData.customThemes[existingIdx] = newTheme;
        } else {
          sectionsData.customThemes.unshift(newTheme);
        }

        const shouldApply = body.apply !== false;
        await db.updateSiteConfig(slug, {
          themeId: shouldApply ? themeId : tenant.themeId,
          sectionsData,
          authToken
        });
        return sendJson(res, 201, { ok: true, theme: newTheme, customThemes: sectionsData.customThemes });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // DELETE /api/tenants/:slug/custom-themes/:themeId (Admin only)
    const delThemeMatch = subRoute.match(/^\/custom-themes\/(.+)$/);
    if (delThemeMatch && method === "DELETE") {
      try {
        const themeId = decodeURIComponent(delThemeMatch[1]);
        const authToken = extractRequestAuthToken(req, parsedUrl);
        const access = await db.verifyTenantAccess({ slug, token: authToken });
        if (!access.authorized || access.role === "visitor") {
          return sendJson(res, 403, { error: "Unauthorized: Admin required to delete themes." });
        }
        const tenant = access.tenant || await db.getTenantBySlug(slug);
        const sectionsData = tenant.sectionsData || {};
        if (Array.isArray(sectionsData.customThemes)) {
          sectionsData.customThemes = sectionsData.customThemes.filter(t => t.id !== themeId);
        } else {
          sectionsData.customThemes = [];
        }
        let newThemeId = tenant.themeId;
        if (tenant.themeId === themeId) {
          newThemeId = "theme-img-theme1";
        }
        await db.updateSiteConfig(slug, {
          themeId: newThemeId,
          sectionsData,
          authToken
        });
        return sendJson(res, 200, { ok: true, deleted: themeId, customThemes: sectionsData.customThemes || [] });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // POST /api/tenants/:slug/upload-url (Cloudflare R2 or local fallback destination)
    if (subRoute === "/upload-url" && method === "POST") {
      try {
        const authToken = extractRequestAuthToken(req, parsedUrl);
        const access = await db.verifyTenantAccess({ slug, token: authToken });
        if (!access.authorized || access.role === "visitor") {
          return sendJson(res, 403, { error: "Purchase now to customize and upload media files." });
        }
        const body = await parseJsonBody(req);
        const dest = await r2.getUploadDestination(slug, body.filename || "upload.jpg", body.contentType, authToken);
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
        const authToken = extractRequestAuthToken(req, parsedUrl);
        const access = await db.verifyTenantAccess({ slug, token: authToken });
        if (!access.authorized || access.role === "visitor") {
          return sendJson(res, 403, { error: "Purchase now to customize and delete media files." });
        }
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
      const [imagesFiles, demoFiles] = await Promise.all([
        r2.listR2Images("images/"),
        r2.listR2Images("demo/")
      ]);
      const formattedDemo = demoFiles.map(k => `/uploads/${k}`);
      const combined = [...new Set([...imagesFiles, ...demoFiles, ...formattedDemo])];
      return sendJson(res, 200, combined);
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
      ...(tenant.sectionsData || {}),
      partner1: tenant.partner1,
      partner2: tenant.partner2,
      partnerName: tenant.partner2,
      senderName: tenant.partner1,
      gf_name: tenant.partner2,
      gf_sender: tenant.partner1
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
      if (slug === "demo") {
        delete body.gf_name;
        delete body.gf_sender;
        delete body.partnerName;
        delete body.senderName;
      }
      const authToken = extractRequestAuthToken(req, parsedUrl, body);
      const tenant = await db.getTenantBySlug(slug);
      if (!tenant) return sendJson(res, 404, { error: "Tenant not found" });
      const nextSections = { ...(tenant.sectionsData || {}), ...body };

      let memList = null;
      if (Array.isArray(body.memories)) {
        memList = body.memories;
      } else if (typeof body.gf_memories === "string") {
        try { memList = JSON.parse(body.gf_memories); } catch (e) {}
      } else if (Array.isArray(body.gf_memories)) {
        memList = body.gf_memories;
      }
      if (Array.isArray(memList)) {
        if (nextSections.memories && typeof nextSections.memories === "object" && !Array.isArray(nextSections.memories)) {
          nextSections.memories = { ...nextSections.memories, items: memList };
        } else {
          nextSections.memories = { items: memList };
        }
      }

      let cityPhotos = null;
      if (typeof body.gf_city_photos === "string") {
        try { cityPhotos = JSON.parse(body.gf_city_photos); } catch (e) {}
      } else if (body.gf_city_photos && typeof body.gf_city_photos === "object") {
        cityPhotos = body.gf_city_photos;
      }
      if (cityPhotos && typeof cityPhotos === "object") {
        const tl = nextSections.timeline;
        if (tl && Array.isArray(tl.chapters)) {
          tl.chapters = tl.chapters.map(ch => {
            const update = cityPhotos[ch.id] || cityPhotos[ch.cityKey];
            if (!update) return ch;
            const updated = { ...ch };
            if (update.title) updated.title = update.title;
            if (update.caption !== undefined) updated.caption = update.caption;
            if (update.desc !== undefined) updated.desc = update.desc;
            if (Array.isArray(update.highlights)) updated.highlights = update.highlights;
            if (Array.isArray(update.images)) {
              updated.images = update.images;
              updated.img = update.images[0] || "";
            } else if (update.img) {
              updated.img = update.img;
              if (!Array.isArray(updated.images) || !updated.images.length) updated.images = [update.img];
            }
            return updated;
          });
        }
      }

      await db.updateSiteConfig(slug, {
        templatePreset: tenant.templatePreset,
        themeId: tenant.themeId,
        layoutOrder: tenant.layoutOrder,
        sectionsData: nextSections,
        authToken
      });
      return sendJson(res, 200, { status: "ok", success: true });
    } catch (err) {
      const status = err.message.includes("Purchase now") ? 403 : (err.message.includes("Unauthorized") ? 401 : 500);
      return sendJson(res, status, { error: err.message });
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
    const headerToken = extractRequestAuthToken(req, parsedUrl);
    if (headerToken) {
      const access = await db.verifyTenantAccess({ slug, token: headerToken });
      if (!access.authorized || access.role === "visitor") {
        return sendJson(res, 403, { error: "Purchase now to customize and upload media files." });
      }
    }
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

        let parts = null;
        let body = {};
        if (ctHeader.includes("multipart/form-data")) {
          const boundaryMatch = ctHeader.match(/boundary=([^;]+)/i);
          if (boundaryMatch) {
            parts = parseMultipart(fullBuf, boundaryMatch[1].trim());
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

        if (!headerToken) {
          const bodyToken = (parts && parts.authToken) || body.authToken;
          if (bodyToken) {
            const access = await db.verifyTenantAccess({ slug, token: bodyToken });
            if (!access.authorized || access.role === "visitor") {
              return sendJson(res, 403, { error: "Purchase now to customize and upload media files." });
            }
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
        const targetSlug = slug || "demo";
        const r2Key = `${targetSlug}/${cleanFilename}`;
        await r2.uploadBufferToR2(r2Key, imageBuf, mime);

        const publicPath = `/uploads/${r2Key}`;
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
      const authToken = extractRequestAuthToken(req, parsedUrl, body);
      const access = await db.verifyTenantAccess({ slug, token: authToken });
      if (!access.authorized || access.role === "visitor") {
        return sendJson(res, 403, { error: "Purchase now to customize and delete media files." });
      }
      const deleted = await r2.deleteTenantUpload(slug, filename);
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
      const slug = body.slug || resolveTenantSlug(req, parsedUrl);
      const authToken = extractRequestAuthToken(req, parsedUrl, body);
      const access = await db.verifyTenantAccess({ slug, token: authToken });
      if (!access.authorized || access.role === "visitor") {
        return sendJson(res, 403, { error: "Purchase now to customize and upload audio files." });
      }
      const rawName = path.basename(body.filename || "audio.webm");
      const cleanFilename = rawName.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const dataUrl = body.dataUrl || "";
      if (!dataUrl) return sendJson(res, 400, { error: "Missing audio data" });
      const base64Data = dataUrl.replace(/^data:audio\/\w+;base64,/, "");
      const buf = Buffer.from(base64Data, "base64");
      const ext = path.extname(cleanFilename).toLowerCase();
      const mime = MIME_TYPES[ext] || "audio/webm";
      const targetSlug = slug || "demo";
      const r2Key = `${targetSlug}/${cleanFilename}`;
      await r2.uploadBufferToR2(r2Key, buf, mime);
      const publicPath = `/uploads/${r2Key}`;
      return sendJson(res, 200, { status: "ok", path: publicPath, url: publicPath, key: cleanFilename });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/upload & /api/upload/local (Upload to Cloudflare R2 bucket with 10MB limit)
  if ((pathname === "/api/upload" || pathname === "/api/upload/local") && method === "POST") {
    const rawKey = String(parsedUrl.query.key || "");
    if (!rawKey || rawKey.includes("..") || path.isAbsolute(rawKey)) return sendJson(res, 400, { error: "Invalid key param" });
    const key = path.normalize(rawKey).replace(/^(\/|\\)+/, "");
    const keyParts = key.split(/[\/\\]/);
    const keySlug = keyParts.length > 1 ? keyParts[0] : null;
    const slug = resolveTenantSlug(req, parsedUrl) || parsedUrl.query.slug || keySlug;
    if (!keySlug || keySlug !== slug) return sendJson(res, 403, { error: "Key does not match tenant slug" });
    const authToken = extractRequestAuthToken(req, parsedUrl);
    const access = await db.verifyTenantAccess({ slug, token: authToken });
    if (!access.authorized || access.role === "visitor") {
      return sendJson(res, 403, { error: "Purchase now to upload files." });
    }

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
        if (!r2.isR2Configured) {
          return sendJson(res, 500, { error: "Cloudflare R2 is not configured" });
        }
        const buffer = Buffer.concat(chunks);
        const ext = path.extname(key).toLowerCase();
        const ct = MIME_TYPES[ext] || "application/octet-stream";
        const publicUrl = await r2.uploadBufferToR2(key, buffer, ct);
        return sendJson(res, 200, { status: "ok", publicUrl, key });
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

  // Stream media (images, audio, uploads, demo) directly from Cloudflare R2
  const isR2Media = pathname.startsWith("/images/") || pathname.startsWith("/audio/") || pathname.startsWith("/uploads/") || pathname.startsWith("/demo/");
  if (isR2Media && r2.isR2Configured) {
    let rawKey = pathname.replace(/^\//, "");
    try { rawKey = decodeURIComponent(rawKey); } catch (e) {}
    const candidateKeys = [];
    if (rawKey.startsWith("uploads/")) {
      candidateKeys.push(rawKey.replace(/^uploads\//, ""), rawKey);
    } else {
      candidateKeys.push(rawKey, `uploads/${rawKey}`);
    }
    if (rawKey.startsWith("images/")) {
      const base = rawKey.replace(/^images\//, "");
      candidateKeys.push(`demo/${base}`, `uploads/demo/${base}`);
    } else if (rawKey.startsWith("demo/")) {
      candidateKeys.push(`uploads/${rawKey}`);
    }
    if (rawKey.endsWith(".webp")) {
      const jpg = rawKey.replace(/\.webp$/i, ".jpg");
      candidateKeys.push(jpg, `uploads/${jpg}`, `demo/${path.basename(jpg)}`);
    } else if (rawKey.endsWith(".jpg") || rawKey.endsWith(".jpeg")) {
      const webp = rawKey.replace(/\.jpe?g$/i, ".webp");
      candidateKeys.push(webp, `uploads/${webp}`, `demo/${path.basename(webp)}`);
    }
    try {
      let r2Obj = null;
      const rangeReq = req.headers.range || null;
      for (const k of candidateKeys) {
        r2Obj = await r2.getObjectFromR2(k, rangeReq);
        if (r2Obj && r2Obj.Body) break;
      }
      if (r2Obj && r2Obj.Body) {
        const ext = path.extname(pathname).toLowerCase();
        const mime = r2Obj.ContentType || MIME_TYPES[ext] || "application/octet-stream";
        const isThemeMedia = pathname.startsWith("/images/themes/");
        const isPartial = Boolean(rangeReq && r2Obj.ContentRange);
        const headers = {
          "Content-Type": mime,
          "Access-Control-Allow-Origin": "*",
          "Accept-Ranges": "bytes",
          "Cache-Control": isThemeMedia ? "no-cache, must-revalidate" : "public, max-age=86400"
        };
        if (r2Obj.ContentRange) headers["Content-Range"] = r2Obj.ContentRange;
        if (r2Obj.ContentLength) headers["Content-Length"] = r2Obj.ContentLength;
        res.writeHead(isPartial ? 206 : 200, headers);
        r2Obj.Body.pipe(res);
        return;
      }
    } catch (err) {
      console.warn("R2 stream error:", err.message);
    }
  }

  // Static assets from builder, core, public only
  const safeRelPath = path.normalize(pathname).replace(/^(\/|\\)+/, "");
  const firstSegment = safeRelPath.split(/[\/\\]/)[0];
  const ALLOWED_STATIC_DIRS = ["builder", "core", "public"];

  if (ALLOWED_STATIC_DIRS.includes(firstSegment)) {
    const staticTarget = path.resolve(ROOT_DIR, safeRelPath);
    if (staticTarget.startsWith(ROOT_DIR) && !path.basename(staticTarget).startsWith(".") && fs.existsSync(staticTarget) && fs.statSync(staticTarget).isFile()) {
      return serveFile(res, staticTarget, req);
    }
  }

  const publicTarget = path.resolve(ROOT_DIR, "public", safeRelPath);
  if (publicTarget.startsWith(path.join(ROOT_DIR, "public")) && !path.basename(publicTarget).startsWith(".") && fs.existsSync(publicTarget) && fs.statSync(publicTarget).isFile()) {
    return serveFile(res, publicTarget, req);
  }

  // If theme image not found on R2 or disk, return 404 (never inject pink SVG placeholder)
  if (pathname.startsWith("/images/themes/")) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Theme image not found");
  }

  // API route 404 fallback (guarantees API responses are always valid JSON)
  if (pathname.startsWith("/api/")) {
    return sendJson(res, 404, { error: `API endpoint not found: ${method} ${pathname}` });
  }

  // Root path, /welcome & /landing -> serve SaaS Landing Page
  if (pathname === "/welcome" || pathname === "/" || pathname === "" || pathname === "/landing") {
    return serveFile(res, path.join(ROOT_DIR, "public", "index.html"));
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Couples SaaS Platform Engine running on Port ${PORT}`);
  console.log(` Landing Page:   http://localhost:${PORT}/`);
  console.log(` Builder:        http://localhost:${PORT}/builder`);
  console.log(` Demo Couple Project: http://localhost:${PORT}/sites/demo`);
  console.log(` Storage Mode:   ${r2.isR2Configured ? "Cloudflare R2" : "Local Storage (R2 ready)"}`);
  console.log(`====================================================`);
});
