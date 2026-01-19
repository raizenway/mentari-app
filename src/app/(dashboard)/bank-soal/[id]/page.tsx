import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import PDFViewer from "./pdf-viewer";

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
            href={bankSoal.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </a>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <PDFViewer fileUrl={bankSoal.fileUrl} />
      </div>
    </div>
  );
}
