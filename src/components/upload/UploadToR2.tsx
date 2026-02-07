"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface UploadToR2Props {
  onUploaded?: (publicUrl: string, key: string, filename?: string) => void;
  accept?: string;
}

export function UploadToR2({ onUploaded, accept = "*/*" }: UploadToR2Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // 1) Ask server for presigned URL
      const presignRes = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
      });

      if (!presignRes.ok) {
        const txt = await presignRes.text();
        throw new Error(`Gagal meminta URL upload: ${presignRes.status} ${txt}`);
      }

      const { url, key, publicUrl } = await presignRes.json();

      // 2) Upload directly to R2 using PUT
      try {
        const putRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });

        if (!putRes.ok) {
          const txt = await putRes.text();
          throw new Error(`Upload ke R2 gagal: ${putRes.status} ${txt}`);
        }

        onUploaded?.(publicUrl, key, file.name);
        return; // success, done
      } catch (e) {
        // If PUT fails (often due to CORS in browser), fall back to server-side upload
        console.warn("Presigned PUT failed, attempting server-side upload fallback:", e instanceof Error ? e.message : e);
      }

      // Fallback: send file to our server endpoint which uploads to R2 (avoids browser CORS)
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/r2/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        const txt = await uploadRes.text();
        throw new Error(`Server-side upload failed: ${uploadRes.status} ${txt}`);
      }
      const { key: serverKey, publicUrl: serverPublicUrl } = await uploadRes.json();
      onUploaded?.(serverPublicUrl, serverKey, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <Button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Mengunggah..." : "Unggah File ke R2"}
      </Button>
    </div>
  );
}
