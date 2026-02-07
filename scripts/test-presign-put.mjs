#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq+1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1,-1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1,-1);
    if (!(key in process.env)) process.env[key] = value;
  });
}

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const account = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET_NAME;
const region = process.env.R2_REGION || 'auto';

if (!account || !bucket) {
  console.error('R2_ACCOUNT_ID or R2_BUCKET_NAME missing');
  process.exit(1);
}

const s3 = new S3Client({ region, endpoint: `https://${account}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });

(async () => {
  const key = `test-presign-${Date.now()}.txt`;
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: 'text/plain' });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 300 });
  console.log('Signed URL:', url);

  // Try PUT via fetch
  try {
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: 'hello from presign test' });
    console.log('PUT status', res.status);
    if (!res.ok) {
      const txt = await res.text();
      console.log('PUT body:', txt);
    } else {
      console.log('PUT ok');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
})();