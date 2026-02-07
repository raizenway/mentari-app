"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CldUploadWidget } from "next-cloudinary";
import { Plus, Loader2, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadToR2 } from "@/components/upload/UploadToR2";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bankSoalSchema, type BankSoalInput } from "@/lib/validations/bank-soal";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  r2Enabled?: boolean;
}

export default function AddBankSoalForm({ categories, r2Enabled = true }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    publicId: string;
    name: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BankSoalInput>({
    resolver: zodResolver(bankSoalSchema),
  });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "bank_soal_unsigned";

  const onSubmit = async (data: BankSoalInput) => {
    if (!uploadedFile) {
      toast({ title: "Error", description: "Silakan upload file terlebih dahulu", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/bank-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, fileUrl: uploadedFile.url, filePublicId: uploadedFile.publicId }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal menambahkan bank soal");

      toast({ title: "Berhasil", description: "File bank soal telah ditambahkan", variant: "success" });
      reset();
      setUploadedFile(null);
      router.push("/bank-soal");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (result: any) => {
    const info = result.info;
    setUploadedFile({ url: info.secure_url, publicId: info.public_id, name: info.original_filename + "." + info.format });
    setValue("fileUrl", info.secure_url);
    setValue("filePublicId", info.public_id);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setValue("fileUrl", "");
    setValue("filePublicId", "");
  };

  const [widgetError, setWidgetError] = useState<string | null>(null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input id="title" {...register("title")} placeholder="Judul bank soal" disabled={isLoading} />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Kategori</Label>
        <Select onValueChange={(value) => setValue("categoryId", value)} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black">
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className="hover:bg-gray-100">{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi (Opsional)</Label>
        <Textarea id="description" {...register("description")} placeholder="Deskripsi file" disabled={isLoading} />
      </div>

      <div className="space-y-2">
        <Label>File PDF</Label>
        {uploadedFile ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
              <p className="text-xs text-green-600">File berhasil diupload</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={removeFile} disabled={isLoading}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {cloudName && (
              <CldUploadWidget uploadPreset={uploadPreset} options={{ maxFiles: 1, resourceType: "raw", clientAllowedFormats: ["pdf"] }} onSuccess={handleUploadSuccess}>
                {({ open }) => (
                  <div>
                    <button type="button" onClick={() => { if (typeof open === "function") { setWidgetError(null); open(); } else { setWidgetError("Upload widget belum siap. Periksa console (network/script errors), matikan ekstensi adblock, dan pastikan preset unsigned."); } }} disabled={isLoading} className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Klik untuk upload file PDF (Cloudinary)</p>
                    </button>
                    {widgetError && <p className="mt-2 text-sm text-destructive">{widgetError}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">Preset upload: <code className="font-mono">{uploadPreset}</code>. Pastikan preset unsigned & resource type raw (pdf).</p>
                  </div>
                )}
              </CldUploadWidget>
            )}

            {r2Enabled ? (
              <div>
                <UploadToR2
                  accept="application/pdf"
                  onUploaded={(publicUrl, key, filename) => {
                    // Save R2 info into uploadedFile and form fields
                    setUploadedFile({ url: publicUrl, publicId: key, name: filename || key });
                    setValue("fileUrl", publicUrl);
                    setValue("filePublicId", key);
                  }}
                />
                <p className="mt-2 text-xs text-muted-foreground">Uploading to Cloudflare R2 (server-side signed uploads). Files may not be publicly accessible — viewer will use presigned GET.</p>
              </div>
            ) : null}

            {!cloudName && !process.env.R2_BUCKET_NAME && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-700">Tidak ada provider file dikonfigurasi. Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> atau R2 vars di <code>.env.local</code>.</div>
            )}
          </div>
        )}
        {errors.fileUrl && <p className="text-sm text-red-500">{errors.fileUrl.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/bank-soal")} disabled={isLoading}>Batal</Button>
        <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isLoading || !uploadedFile}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>) : ("Simpan")}</Button>
      </div>
    </form>
  );
}
