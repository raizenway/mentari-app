"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Use Google Docs Viewer or Cloudinary PDF viewer as alternative
  // This is a simple implementation that works cross-browser
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Memuat dokumen...</p>
          </div>
        </div>
      )}
      <iframe
        src={viewerUrl}
        className="w-full h-[calc(100vh-200px)] min-h-[600px] border-0"
        onLoad={() => setIsLoading(false)}
        title="PDF Viewer"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
