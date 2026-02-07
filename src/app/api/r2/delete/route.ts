import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET_NAME;
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const region = process.env.R2_REGION || "auto";

const s3Client = new S3Client({
  region,
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKey!,
    secretAccessKey: secretKey!,
  },
});

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { key } = (await req.json()) as { key?: string };
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting object:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
