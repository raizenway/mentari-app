#!/usr/bin/env node
import fs from "fs";
import path from "path";
// Load .env.local (simple loader reused)
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

import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

    const bucket = process.env.R2_BUCKET_NAME;
    const key = `test-upload-${Date.now()}.txt`;
    const body = `test upload from script at ${new Date().toISOString()}`;

    console.log(`Uploading test object to ${bucket}/${key} ...`);
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: Buffer.from(body), ContentType: "text/plain" }));
    console.log("Upload: OK");

    console.log("Checking HEAD object...");
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    console.log("HEAD object: OK — object exists");

    console.log("Fetching object (GetObject) to verify content...");
    const getRes = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    // getRes.Body is a stream — read to string
    const stream = getRes.Body;
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const fetched = Buffer.concat(chunks).toString('utf8');
    console.log("Fetched object content:", fetched.slice(0, 200));

    console.log("Deleting test object...");
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log("Delete: OK");

    console.log("\nR2 PUT/GET/DELETE test succeeded.");
  } catch (err) {
    console.error("Error during R2 PUT/GET/DELETE test:", err?.name || "Error", err?.message || err);
    if (err && err.$metadata) console.error("HTTP status:", err.$metadata.httpStatusCode);
    process.exit(1);
  }
})();