import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import PDFViewer from "./pdf-viewer";

// R2 signed GET helper
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BankSoalDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  const bankSoal = await prisma.bankSoal.findUnique({
    where: { id },
    include: {
      category: true,
      uploadedBy: { select: { name: true } },
    },
  });

  if (!bankSoal) {
    notFound();
  }

  const canDownload = session?.user.role === "ADMIN";

  // If the file is stored in R2 (we saved the object key in filePublicId),
  // generate a presigned GET URL server-side to allow the PDF viewer to fetch with Range support.
  let fileUrlForViewer = bankSoal.fileUrl;

  const r2Account = process.env.R2_ACCOUNT_ID;
  const r2Bucket = process.env.R2_BUCKET_NAME;
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2Secret = process.env.R2_SECRET_ACCESS_KEY;

  if (bankSoal.filePublicId && r2Account && r2Bucket && r2AccessKey && r2Secret) {
    try {
      const s3 = new S3Client({
        region: process.env.R2_REGION || "auto",
        endpoint: `https://${r2Account}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: r2AccessKey, secretAccessKey: r2Secret },
      });

      const cmd = new GetObjectCommand({ Bucket: r2Bucket, Key: bankSoal.filePublicId });
      const signedGet = await getSignedUrl(s3, cmd, { expiresIn: 60 * 60 }); // 1 hour
      // Use our streaming proxy endpoint to avoid HEAD=403 and ensure proper Accept-Ranges
      fileUrlForViewer = `/api/r2/stream?key=${encodeURIComponent(bankSoal.filePublicId)}`;
    } catch (err) {
      console.error("Error creating signed GET for R2:", err);
      // fallback to stored fileUrl (may or may not be public)
      fileUrlForViewer = bankSoal.fileUrl;
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bank-soal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{bankSoal.title}</h1>
            <p className="text-sm text-gray-500">
              Kategori: {bankSoal.category.name} • Diupload oleh:{" "}
              {bankSoal.uploadedBy.name}
            </p>
          </div>
        </div>
        {canDownload && (
          <a
            href={fileUrlForViewer}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button variant="outline" className="text-black">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </a>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <PDFViewer fileUrl={fileUrlForViewer} />
      </div>
    </div>
  );
}
