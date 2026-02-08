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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { UserImportRow, ImportValidationError } from "@/lib/validations/user-import";

interface ImportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validRows: UserImportRow[];
  invalidRows: ImportValidationError[];
  onClose: () => void;
}

export function ImportPreviewDialog({
  open,
  onOpenChange,
  validRows,
  invalidRows,
  onClose,
}: ImportPreviewDialogProps) {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const handleConfirm = async () => {
    if (validRows.length === 0) {
      toast({
        variant: "destructive",
        title: "Tidak ada data valid",
        description: "Tidak ada user yang dapat diimpor",
      });
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch("/api/users/import/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows: validRows }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengimpor user");
      }

      const data = await response.json();

      toast({
        title: "Import Berhasil",
        description: `${data.created} user berhasil diimpor${data.failed > 0 ? `, ${data.failed} gagal` : ""}`,
      });

      // Close dialog and refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Gagal mengimpor user",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const totalRows = validRows.length + invalidRows.length;
  const hasInvalidRows = invalidRows.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview Import User</DialogTitle>
          <DialogDescription>
            Review data sebelum mengimpor. {validRows.length} valid, {invalidRows.length} invalid dari{" "}
            {totalRows} total baris.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="flex gap-4 py-4">
          <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900">{validRows.length}</p>
                <p className="text-sm text-green-700">Data Valid</p>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-900">{invalidRows.length}</p>
                <p className="text-sm text-red-700">Data Invalid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Table */}
        <ScrollArea className="flex-1 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Baris</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Valid Rows */}
              {validRows.map((row, idx) => (
                <TableRow key={`valid-${idx}`}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{row.fullName}</div>
                      {row.shortName && (
                        <div className="text-xs text-muted-foreground">Panggilan: {row.shortName}</div>
                      )}
                      {(row.class || row.gender || row.domicile || row.ages) && (
                        <div className="text-xs text-muted-foreground">
                          {[
                            row.class && `Kelas: ${row.class}`,
                            row.gender && row.gender.toLowerCase().replace("_", " "),
                            row.domicile && `${row.domicile}`,
                            row.ages && `${row.ages} thn`
                          ].filter(Boolean).join(" • ")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.role || "SISWA"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-500">
                      Valid
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {/* Invalid Rows */}
              {invalidRows.map((row, idx) => (
                <TableRow key={`invalid-${idx}`} className="bg-red-50">
                  <TableCell className="text-muted-foreground">{row.rowIndex}</TableCell>
                  <TableCell>{row.row.email || "-"}</TableCell>
                  <TableCell>
                    {row.row.fullName || "-"}
                    {row.row.shortName && (
                      <div className="text-xs text-muted-foreground">Panggilan: {row.row.shortName}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.row.role ? <Badge variant="outline">{row.row.role}</Badge> : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="destructive">Invalid</Badge>
                      {row.errors.map((error, errorIdx) => (
                        <p key={errorIdx} className="text-xs text-red-600">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {hasInvalidRows && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Perhatian</p>
              <p>
                {invalidRows.length} baris memiliki error dan tidak akan diimpor. Silakan perbaiki
                data dan coba lagi.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={validRows.length === 0 || isImporting}
            className="bg-biru hover:bg-blue-600"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengimpor...
              </>
            ) : (
              `Import ${validRows.length} User`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
