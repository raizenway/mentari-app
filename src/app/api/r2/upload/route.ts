import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET_NAME;
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const region = process.env.R2_REGION || "auto";

if (!accountId || !bucket || !accessKey || !secretKey) {
  console.warn("R2 environment variables are missing. /api/r2/upload will fail if called.");
}

const s3Client = new S3Client({
  region,
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: accessKey!, secretAccessKey: secretKey! },
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name || `upload-${Date.now()}`;
    const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: file.type || "application/octet-stream" }));

    const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;

    return NextResponse.json({ key, publicUrl });
  } catch (error: any) {
    console.error("Error in /api/r2/upload:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}