#!/usr/bin/env node
import fs from "fs";
import path from "path";
// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  });
} else {
  console.warn('.env.local not found; relying on process.env');
}

import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { fileURLToPath } from 'url';

const client = new S3Client({
  region: process.env.R2_REGION ?? "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: node upload-file-to-r2.mjs <path-to-file>");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), arg);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    console.error("R2_BUCKET_NAME not set in .env.local");
    process.exit(1);
  }

  const filename = path.basename(filePath).replace(/\s+/g, "_");
  const key = `uploads/${Date.now()}-${filename}`;

  const body = fs.readFileSync(filePath);

  console.log(`Uploading ${filePath} -> ${bucket}/${key} ...`);
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
  console.log("Upload successful.");

  console.log("Verifying with HEAD...");
  await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  console.log("HEAD OK: object exists.");

  console.log("Fetching with SDK GetObject to verify content length...");
  const getRes = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  // read stream
  const chunks = [];
  for await (const chunk of getRes.Body) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  const fetched = Buffer.concat(chunks);
  console.log(`Fetched ${fetched.length} bytes from SDK.`);

  const publicUrl = `${process.env.R2_ENDPOINT.replace(/\/+$/, '')}/${bucket}/${key}`;
  console.log("Attempting HTTP GET to:", publicUrl);
  try {
    const resp = await fetch(publicUrl);
    console.log("HTTP status:", resp.status);
    if (resp.ok) {
      console.log("HTTP GET successful — object is publicly accessible.");
    } else {
      console.log("HTTP GET not successful (may require auth), but object exists in R2.");
    }
  } catch (err) {
    console.log("HTTP GET failed (network/CORS or not public):", err.message || err);
  }

  console.log(`Uploaded object key: ${key}`);
  console.log(`Accessible SDK GetObject size: ${fetched.length}`);
  console.log(`Public URL (may require public ACL): ${publicUrl}`);
}

main().catch((err) => { console.error(err); process.exit(1); });