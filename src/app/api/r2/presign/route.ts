import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET_NAME;
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const region = process.env.R2_REGION || "auto";

if (!accountId || !bucket || !accessKey || !secretKey) {
  console.warn("R2 environment variables are missing. Upload endpoints will fail if called.");
}

const s3Client = new S3Client({
  region,
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKey!,
    secretAccessKey: secretKey!,
  },
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { filename, contentType } = body as { filename: string; contentType: string };

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes

    const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;

    return NextResponse.json({ url, key, publicUrl });
  } catch (error) {
    console.error("Error creating presigned url:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
