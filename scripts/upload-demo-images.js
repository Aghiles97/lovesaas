const fs = require("node:fs");
const path = require("node:path");
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

// Load local .env
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

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "98c9ce7255c81f9cbc450159796eb5d4";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "couple";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

const IMAGES_DIR = path.resolve(__dirname, "../../images");
const CONCURRENCY = 15;

const MIME_MAP = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".m4r": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".webm": "audio/webm"
};

async function getExistingR2Keys() {
  const keys = new Set();
  let isTruncated = true;
  let continuationToken = undefined;
  while (isTruncated) {
    const resp = await s3Client.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: "demo/",
      ContinuationToken: continuationToken
    }));
    if (resp.Contents) {
      for (const item of resp.Contents) {
        keys.add(path.basename(item.Key));
      }
    }
    isTruncated = Boolean(resp.IsTruncated);
    continuationToken = resp.NextContinuationToken;
  }
  return keys;
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Images directory not found:", IMAGES_DIR);
    process.exit(1);
  }

  const existingKeys = await getExistingR2Keys();
  console.log(`Already in R2 under demo/: ${existingKeys.size} files`);

  const fileEntries = [];

  // Images
  fs.readdirSync(IMAGES_DIR)
    .filter(f => !f.startsWith(".") && !f.startsWith("Thumbs.db"))
    .forEach(f => {
      const ext = path.extname(f).toLowerCase();
      if (MIME_MAP[ext] && !existingKeys.has(f)) {
        fileEntries.push({ filePath: path.join(IMAGES_DIR, f), filename: f });
      }
    });

  // Audio in ../../audio
  const audioDir = path.resolve(__dirname, "../../audio");
  if (fs.existsSync(audioDir)) {
    fs.readdirSync(audioDir)
      .filter(f => !f.startsWith("."))
      .forEach(f => {
        const ext = path.extname(f).toLowerCase();
        if (MIME_MAP[ext] && !existingKeys.has(f)) {
          fileEntries.push({ filePath: path.join(audioDir, f), filename: f });
        }
      });
  }

  // Root audio files in ../..
  const rootDir = path.resolve(__dirname, "../..");
  fs.readdirSync(rootDir)
    .filter(f => !f.startsWith("."))
    .forEach(f => {
      const ext = path.extname(f).toLowerCase();
      if (MIME_MAP[ext] && !existingKeys.has(f)) {
        fileEntries.push({ filePath: path.join(rootDir, f), filename: f });
      }
    });

  console.log(`Found ${fileEntries.length} new files to upload to '${R2_BUCKET_NAME}' under prefix 'demo/'`);

  let completed = 0;
  let failed = 0;
  let totalBytes = 0;

  async function uploadFile(entry) {
    const { filePath, filename } = entry;
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const key = `demo/${filename}`;
    const buffer = fs.readFileSync(filePath);

    let attempts = 0;
    while (attempts < 3) {
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: contentType
        }));
        completed++;
        totalBytes += buffer.length;
        if (completed % 25 === 0 || completed === fileEntries.length) {
          console.log(`[${completed}/${fileEntries.length}] Uploaded: ${key} (${(buffer.length / 1024).toFixed(1)} KB) - Total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
        }
        return;
      } catch (err) {
        attempts++;
        if (attempts >= 3) {
          console.error(`FAILED to upload ${key} after 3 attempts:`, err.message);
          failed++;
        } else {
          await new Promise(r => setTimeout(r, 500 * attempts));
        }
      }
    }
  }

  const queue = [...fileEntries];
  async function worker() {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) break;
      await uploadFile(entry);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log("\n==========================================");
  console.log(`Upload Complete: ${completed} successful, ${failed} failed`);
  console.log(`Total Uploaded: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log("==========================================");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
