"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { ImportPreviewDialog } from "./import-preview-dialog";
import type { UserImportRow, ImportValidationError } from "@/lib/validations/user-import";

interface ImportUsersDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function ImportUsersDialog({ open: controlledOpen, onOpenChange: controlledOnOpenChange, children }: ImportUsersDialogProps) {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    validRows: UserImportRow[];
    invalidRows: ImportValidationError[];
  } | null>(null);

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Check if it's an Excel file
      const isExcel =
        droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.type === "application/vnd.ms-excel" ||
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls");

      if (isExcel) {
        setFile(droppedFile);
      } else {
        toast({
          variant: "destructive",
          title: "File tidak valid",
          description: "Harap unggah file Excel (.xlsx atau .xls)",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "File tidak dipilih",
        description: "Harap pilih file Excel untuk diimpor",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal memproses file");
      }

      const data = await response.json();

      setPreviewData({
        validRows: data.validRows,
        invalidRows: data.invalidRows,
      });

      setShowPreview(true);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Gagal memproses file",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setShowPreview(false);
    setPreviewData(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showPreview} onOpenChange={(isOpen) => isOpen ? onOpenChange(true) : handleClose()}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import User dari Excel</DialogTitle>
            <DialogDescription>
              Unggah file Excel (.xlsx atau .xls) dengan kolom: email, password, name, phone
              (opsional), role (opsional), asalSekolah (opsional)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-biru transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-biru" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Drag & drop file Excel di sini, atau klik untuk memilih file
                  </p>
                  <p className="text-xs text-gray-400">
                    Format yang didukung: .xlsx, .xls
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">Kolom Wajib:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>email - Alamat email yang valid</li>
                <li>password - Minimal 6 karakter</li>
                <li>name - Nama lengkap</li>
              </ul>
              <p className="font-semibold text-blue-900 mb-2 mt-3">Kolom Opsional:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>phone - Nomor telepon</li>
                <li>role - SISWA, PENGAJAR, atau ADMIN (default: SISWA)</li>
                <li>asalSekolah - Asal sekolah</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-biru hover:bg-blue-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Lanjutkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPreview && previewData && (
        <ImportPreviewDialog
          open={showPreview}
          onOpenChange={(open) => {
            setShowPreview(open);
            if (!open) {
              setFile(null);
              setPreviewData(null);
            }
          }}
          validRows={previewData.validRows}
          invalidRows={previewData.invalidRows}
          onClose={handleClose}
        />
      )}
    </>
  );
}
