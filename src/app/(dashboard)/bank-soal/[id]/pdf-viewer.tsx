"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure pdf.js worker from CDN matching react-pdf's bundled version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use Uint8Array instead of ArrayBuffer to avoid detachment issues
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  // Fetch PDF data on mount or when fileUrl changes
  useEffect(() => {
    setPageNumber(1);
    setScale(1.0);
    setError(null);
    setPdfData(null);
    setIsLoading(true);

    const controller = new AbortController();

    async function fetchPdf() {
      try {
        const response = await fetch(fileUrl, {
          signal: controller.signal,
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        // Create a Uint8Array copy to prevent detached ArrayBuffer issues
        setPdfData(new Uint8Array(buffer));
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("PDF fetch error:", err);
          setError(err.message || "Failed to load PDF");
          setIsLoading(false);
        }
      }
    }

    fetchPdf();

    return () => {
      controller.abort();
    };
  }, [fileUrl]);

  // Memoize the file object to prevent unnecessary reloads
  const fileObject = useMemo(() => {
    if (!pdfData) return null;
    return { data: pdfData };
  }, [pdfData]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error("PDF document load error:", err);
    setError(err.message || "Failed to parse PDF");
    setIsLoading(false);
  }, []);

  const goToPrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25));

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4 text-black" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Halaman {pageNumber}{numPages ? ` / ${numPages}` : ""}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={numPages !== null && pageNumber >= numPages}>
            <ChevronRight className="h-4 w-4 text-black" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4 text-black" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4 text-black2" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative min-h-[600px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Memuat dokumen...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center p-6">
              <p className="text-red-600 mb-2">Gagal memuat dokumen</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        <div className="w-full flex justify-center p-2 sm:p-4 md:p-6 bg-white overflow-auto">
          <div className="w-full max-w-4xl">
            {fileObject && (
              <Document
                file={fileObject}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  className="w-full"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
