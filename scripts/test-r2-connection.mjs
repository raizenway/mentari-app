#!/usr/bin/env node
import fs from "fs";
import path from "path";
// Simple loader for .env.local (no external deps)
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
  console.warn('.env.local not found in project root; relying on existing process.env');
}

function mask(s) {
  if (!s) return "MISSING";
  return s.length > 8 ? `${s.slice(0, 4)}...${s.slice(-4)}` : s;
}

console.log("Cloudflare R2 quick check script\n");
console.log("R2_ENDPOINT:", process.env.R2_ENDPOINT || "(missing)");
console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME || "(missing)");
console.log("R2_ACCESS_KEY_ID:", mask(process.env.R2_ACCESS_KEY_ID));
console.log("R2_SECRET_ACCESS_KEY:", process.env.R2_SECRET_ACCESS_KEY ? "(present)" : "(missing)");
console.log("");

import { S3Client, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.R2_REGION ?? "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

(async () => {
  try {
    if (!process.env.R2_ENDPOINT || !process.env.R2_BUCKET_NAME || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.error("Missing one or more required R2 environment variables. Check your .env.local.");
      process.exit(1);
    }

    console.log("Checking HEAD bucket...");
    await client.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME }));
    console.log("HEAD bucket: OK — bucket exists and is accessible with provided credentials.");

    console.log("Listing up to 5 objects (if permitted)...");
    const listRes = await client.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, MaxKeys: 5 }));
    console.log("ListObjectsV2 result KeyCount:", listRes.KeyCount ?? 0);
    if (listRes.Contents && listRes.Contents.length > 0) {
      console.log("Sample object:", listRes.Contents[0].Key);
    } else {
      console.log("No objects returned (bucket may be empty or listing permission limited).");
    }

    console.log("\nR2 connectivity check succeeded.");
  } catch (err) {
    console.error("Error during R2 connectivity check:", err?.name || "Error", err?.message || err);
    if (err && err.$metadata) console.error("HTTP status:", err.$metadata.httpStatusCode);
    process.exit(1);
  }
})();