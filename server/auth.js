const crypto = require("node:crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString("hex"),
    salt
  };
}

function verifyPassword(password, hash, salt) {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedKey);
  } catch {
    return false;
  }
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function extractToken(req, parsedUrl) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const customHeader = req.headers["x-user-token"];
  if (customHeader) return customHeader.trim();
  if (parsedUrl && parsedUrl.query && (parsedUrl.query.user_token || parsedUrl.query.session_token)) {
    return (parsedUrl.query.user_token || parsedUrl.query.session_token).trim();
  }
  return null;
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  extractToken
};
