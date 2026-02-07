#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
  const content = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('='); if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq+1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1,-1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1,-1);
    if (!(key in process.env)) process.env[key] = val;
  });
}

import { S3Client, ListObjectsV2Command, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const account = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET_NAME;
if (!account || !bucket) {
  console.error('R2_ACCOUNT_ID or R2_BUCKET_NAME missing'); process.exit(1);
}

const s3 = new S3Client({ region: process.env.R2_REGION||'auto', endpoint: `https://${account}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });

(async ()=>{
  try {
    const list = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'uploads/', MaxKeys: 10 }));
    if (!list.Contents || list.Contents.length === 0) { console.error('No uploads found'); process.exit(1); }
    const obj = list.Contents[0];
    const key = obj.Key;
    console.log('Testing object:', key);

    // HEAD via signed GET? Use getSignedUrl with GetObject and then do HEAD request via fetch is same as GET with zero range.
    const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const signedUrl = await getSignedUrl(s3, getCmd, { expiresIn: 60*60 });
    console.log('Signed URL:', signedUrl.split('?')[0] + '...');

    // Try HTTP GET headers and Range get
    const headRes = await fetch(signedUrl, { method: 'HEAD' });
    console.log('HEAD status:', headRes.status);
    console.log('HEAD headers sample:');
    console.log('  content-type:', headRes.headers.get('content-type'));
    console.log('  content-length:', headRes.headers.get('content-length'));
    console.log('  accept-ranges:', headRes.headers.get('accept-ranges'));

    const rangeRes = await fetch(signedUrl, { method: 'GET', headers: { Range: 'bytes=0-1023' } });
    console.log('Range GET status:', rangeRes.status);
    console.log('Range headers:  content-range:', rangeRes.headers.get('content-range'));
    console.log('Range headers:  content-length:', rangeRes.headers.get('content-length'));

    const chunk = await rangeRes.arrayBuffer();
    console.log('Range GET returned bytes:', chunk.byteLength);

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();