"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classSessionSchema, type ClassSessionFormData } from "@/lib/validations/class-session";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode?: "create" | "edit";
  initialValues?: ClassSessionFormData | null;
  sessionId?: string;
}

export function AddSessionDialog({
  open,
  onOpenChange,
  onSuccess,
  mode = "create",
  initialValues = null,
  sessionId,
}: AddSessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassSessionFormData>({
    resolver: zodResolver(classSessionSchema),
  });

  const formatToDatetimeLocal = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!open) {
      reset();
      setError("");
      return;
    }

    if (initialValues) {
      reset({
        ...initialValues,
        scheduledAt: formatToDatetimeLocal(initialValues.scheduledAt),
        zoomLink: initialValues.zoomLink ?? "",
        zoomMeetingId: initialValues.zoomMeetingId ?? "",
        zoomPasscode: initialValues.zoomPasscode ?? "",
        description: initialValues.description ?? "",
      });
    }
  }, [open, reset, initialValues]);

  const onSubmit = async (data: ClassSessionFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const url =
        mode === "edit" && sessionId
          ? `/api/class-sessions/${sessionId}`
          : "/api/class-sessions";
      const method = mode === "edit" && sessionId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          scheduledAt: new Date(data.scheduledAt).toISOString(),
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal menyimpan sesi");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Sesi Kelas" : "Tambah Sesi Kelas"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Judul Sesi *</Label>
            <Input
              id="title"
              placeholder="Contoh: Sesi Pembahasan Soal Matematika"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang sesi ini..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Jadwal *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              {...register("scheduledAt")}
            />
            {errors.scheduledAt && (
              <p className="text-sm text-destructive">
                {errors.scheduledAt.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoomLink">Link Zoom</Label>
            <Input
              id="zoomLink"
              placeholder="https://zoom.us/j/..."
              {...register("zoomLink")}
            />
            {errors.zoomLink && (
              <p className="text-sm text-destructive">
                {errors.zoomLink.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zoomMeetingId">Meeting ID</Label>
              <Input
                id="zoomMeetingId"
                placeholder="123 456 7890"
                {...register("zoomMeetingId")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoomPasscode">Passcode</Label>
              <Input
                id="zoomPasscode"
                placeholder="abc123"
                {...register("zoomPasscode")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (mode === "edit" ? "Menyimpan..." : "Menyimpan...") : (mode === "edit" ? "Perbarui" : "Simpan")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
