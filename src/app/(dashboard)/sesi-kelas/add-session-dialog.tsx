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
}

export function AddSessionDialog({
  open,
  onOpenChange,
  onSuccess,
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

  useEffect(() => {
    if (!open) {
      reset();
      setError("");
    }
  }, [open, reset]);

  const onSubmit = async (data: ClassSessionFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/class-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal menambahkan sesi");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Sesi Kelas</DialogTitle>
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
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
