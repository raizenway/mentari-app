import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { auth } from '@/lib/auth';

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET_NAME;
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const region = process.env.R2_REGION || 'auto';

if (!accountId || !bucket || !accessKey || !secretKey) {
  console.warn('R2 environment variables are missing. /api/r2/stream will fail if called.');
}

const s3 = new S3Client({ region, endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId: accessKey!, secretAccessKey: secretKey! } });

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    if (!key.startsWith('uploads/')) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });

    // Optional: require auth
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const range = req.headers.get('range') || undefined;

    const getCmd = new GetObjectCommand({ Bucket: bucket!, Key: key, Range: range });
    const s3res = await s3.send(getCmd);

    // Build headers
    const headers: Record<string, string> = {};
    if (s3res.ContentType) headers['content-type'] = s3res.ContentType;
    if (s3res.ContentLength !== undefined && range === undefined) headers['content-length'] = String(s3res.ContentLength);
    if (s3res.ContentRange) headers['content-range'] = s3res.ContentRange;
    // Indicate we accept ranges
    headers['accept-ranges'] = 'bytes';

    // For HEAD requests - body is not allowed
    // But route only handles GET. However browser may send HEAD; NextResponse handles it similarly

    // s3res.Body is a stream (Readable)
    const body = s3res.Body as any;

    return new NextResponse(body, { status: (s3res.ContentRange ? 206 : 200), headers });
  } catch (err: any) {
    console.error('/api/r2/stream error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function HEAD(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    if (!key.startsWith('uploads/')) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });

    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const getCmd = new GetObjectCommand({ Bucket: bucket!, Key: key });
    const s3res = await s3.send(getCmd);

    const headers: Record<string, string> = {};
    if (s3res.ContentType) headers['content-type'] = s3res.ContentType;
    if (s3res.ContentLength !== undefined) headers['content-length'] = String(s3res.ContentLength);
    headers['accept-ranges'] = 'bytes';

    return new NextResponse(null, { status: 200, headers });
  } catch (err: any) {
    console.error('/api/r2/stream HEAD error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}