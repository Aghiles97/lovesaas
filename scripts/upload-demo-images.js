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
  ".svg": "image/svg+xml"
};

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Images directory not found:", IMAGES_DIR);
    process.exit(1);
  }

  const allFiles = fs.readdirSync(IMAGES_DIR)
    .filter(f => !f.startsWith(".") && !f.startsWith("Thumbs.db"))
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return MIME_MAP[ext] != null;
    });

  console.log(`Found ${allFiles.length} images to upload from ${IMAGES_DIR} to bucket '${R2_BUCKET_NAME}' under prefix 'demo/'`);

  let completed = 0;
  let failed = 0;
  let totalBytes = 0;

  async function uploadFile(filename) {
    const filePath = path.join(IMAGES_DIR, filename);
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
        if (completed % 25 === 0 || completed === allFiles.length) {
          console.log(`[${completed}/${allFiles.length}] Uploaded: ${key} (${(buffer.length / 1024).toFixed(1)} KB) - Total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
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

  const queue = [...allFiles];
  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) break;
      await uploadFile(file);
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
