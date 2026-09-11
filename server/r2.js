const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Load local .env if present
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [k, ...v] = trimmed.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
}

// Cloudflare R2 Credentials
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "98c9ce7255c81f9cbc450159796eb5d4";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "couple";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || ""; // e.g. https://pub-xxx.r2.dev or cdn.couple.app

const isR2Configured = Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);

let s3Client = null;
if (isR2Configured) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY
    }
  });
}

// Local fallback directory
const LOCAL_UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

/**
 * Generate S3 Presigned Upload URL for Cloudflare R2 or local fallback
 */
async function getUploadDestination(tenantSlug, filename, contentType = "image/jpeg", authToken = "") {
  const ext = path.extname(filename) || ".jpg";
  const uniqueKey = `${tenantSlug}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;

  if (isR2Configured && s3Client) {
    const uploadUrl = await getSignedUrl(s3Client, new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType
    }), { expiresIn: 900 });

    const publicUrl = R2_PUBLIC_DOMAIN ? `${R2_PUBLIC_DOMAIN}/${uniqueKey}` : `/uploads/${uniqueKey}`;
    return {
      mode: "r2",
      uploadUrl,
      publicUrl,
      key: uniqueKey
    };
  }

  const tokenParam = authToken ? `&token=${encodeURIComponent(authToken)}` : "";
  return {
    mode: "local",
    uploadUrl: `/api/upload/local?slug=${encodeURIComponent(tenantSlug)}&key=${encodeURIComponent(uniqueKey)}${tokenParam}`,
    publicUrl: `/uploads/${uniqueKey}`,
    key: uniqueKey
  };
}

/**
 * Upload directly to R2 via server buffer
 */
async function uploadBufferToR2(key, buffer, contentType = "image/jpeg") {
  if (!isR2Configured || !s3Client) {
    return saveLocalFile(key, buffer);
  }
  await s3Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }));
  return R2_PUBLIC_DOMAIN ? `${R2_PUBLIC_DOMAIN}/${key}` : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;
}

function saveLocalFile(key, buffer) {
  const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, "");
  const fullPath = path.resolve(LOCAL_UPLOADS_DIR, safeKey);
  if (!fullPath.startsWith(LOCAL_UPLOADS_DIR + path.sep)) throw new Error("Path traversal detected");
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, buffer);
  return `/uploads/${safeKey}`;
}

async function listTenantUploads(tenantSlug) {
  if (!isR2Configured || !s3Client) return [];
  const list = [];
  let isTruncated = true;
  let continuationToken = undefined;
  try {
    while (isTruncated) {
      const resp = await s3Client.send(new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: `${tenantSlug}/`,
        ContinuationToken: continuationToken
      }));
      if (resp.Contents) {
        for (const item of resp.Contents) {
          const filename = path.basename(item.Key);
          if (!filename || filename.startsWith(".") || (item.Size || 0) < 200) continue;
          const isAudio = /\.(mp3|m4a|m4r|wav|ogg|aac)$/i.test(filename);
          list.push({
            key: item.Key,
            filename,
            size: item.Size || 0,
            mtime: item.LastModified || new Date(),
            isAudio,
            url: `/uploads/${item.Key}`
          });
        }
      }
      isTruncated = Boolean(resp.IsTruncated);
      continuationToken = resp.NextContinuationToken;
    }
  } catch (err) {
    console.warn("R2 list error:", err.message);
  }
  return list.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
}

async function deleteTenantUpload(tenantSlug, filename) {
  if (!filename) return false;
  const clean = String(filename)
    .replace(/^https?:\/\/[^\/]+/, "")
    .replace(/^\/+/, "")
    .replace(/^uploads\//, "")
    .replace(/^\/+/, "");
  const safeFilename = path.basename(clean);
  const candidates = new Set([
    clean,
    `${tenantSlug}/${safeFilename}`,
    `demo/${safeFilename}`,
    `images/${safeFilename}`,
    `audio/${safeFilename}`,
    safeFilename,
    `uploads/${clean}`,
    `uploads/${tenantSlug}/${safeFilename}`,
    `uploads/demo/${safeFilename}`
  ]);
  for (const k of Array.from(candidates)) {
    if (/\.(jpg|jpeg|png)$/i.test(k)) {
      candidates.add(k.replace(/\.(jpg|jpeg|png)$/i, ".webp"));
    } else if (/\.webp$/i.test(k)) {
      candidates.add(k.replace(/\.webp$/i, ".jpg"));
      candidates.add(k.replace(/\.webp$/i, ".png"));
    }
  }
  const keys = Array.from(candidates).filter(Boolean);
  await deleteR2ObjectsBatch(keys);
  return true;
}

async function deleteR2Object(key) {
  if (!isR2Configured || !s3Client) return false;
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key
    }));
    return true;
  } catch (err) {
    console.warn("deleteR2Object error:", err.message);
    return false;
  }
}

async function deleteR2ObjectsBatch(keys = []) {
  if (!isR2Configured || !s3Client || !keys.length) return 0;
  let deleted = 0;
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000).map(k => ({ Key: k }));
    await s3Client.send(new DeleteObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      Delete: { Objects: batch }
    }));
    deleted += batch.length;
  }
  return deleted;
}

async function listR2Images(prefix = "images/") {
  if (!isR2Configured || !s3Client) return [];
  const results = [];
  let isTruncated = true;
  let continuationToken = undefined;

  try {
    while (isTruncated) {
      const resp = await s3Client.send(new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken
      }));
      if (resp.Contents) {
        for (const item of resp.Contents) {
          if (item.Key && !item.Key.endsWith("/")) {
            results.push(item.Key);
          }
        }
      }
      isTruncated = resp.IsTruncated;
      continuationToken = resp.NextContinuationToken;
    }
  } catch (err) {
    console.warn("listR2Images error:", err.message);
  }
  return results.sort();
}

async function getObjectFromR2(key) {
  if (!isR2Configured || !s3Client) return null;
  try {
    const res = await s3Client.send(new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key
    }));
    return res;
  } catch (err) {
    return null;
  }
}

module.exports = {
  R2_ACCOUNT_ID,
  R2_BUCKET_NAME,
  isR2Configured,
  getUploadDestination,
  uploadBufferToR2,
  saveLocalFile,
  listTenantUploads,
  deleteTenantUpload,
  deleteR2Object,
  deleteR2ObjectsBatch,
  listR2Images,
  getObjectFromR2,
  s3Client,
  LOCAL_UPLOADS_DIR
};

