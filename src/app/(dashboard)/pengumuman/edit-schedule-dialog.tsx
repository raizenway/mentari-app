"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { scheduleSchema, type ScheduleInput } from "@/lib/validations/schedule";
import { useToast } from "@/hooks/use-toast";

interface EditScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string | null;
}

export function EditScheduleDialog({
  open,
  onOpenChange,
  scheduleId,
}: EditScheduleDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleInput>({
    resolver: zodResolver(scheduleSchema),
  });

  // Load schedule data when dialog opens
  useEffect(() => {
    if (open && scheduleId) {
      loadSchedule();
    }
  }, [open, scheduleId]);

  const loadSchedule = async () => {
    if (!scheduleId) return;

    setIsLoadingSchedule(true);
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`);
      if (!response.ok) throw new Error("Gagal memuat jadwal");

      const schedule = await response.json();

      // Format date for datetime-local input
      const scheduledAt = new Date(schedule.scheduledAt);
      const formattedDate = new Date(scheduledAt.getTime() - scheduledAt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      reset({
        title: schedule.title,
        description: schedule.description || "",
        scheduledAt: formattedDate,
      });
    } catch (error) {
      console.error("Load schedule error:", error);
      toast({
        variant: "destructive",
        title: "Gagal memuat jadwal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
      onOpenChange(false);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const onSubmit = async (data: ScheduleInput) => {
    if (!scheduleId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengupdate jadwal");
      }

      toast({
        title: "Berhasil",
        description: "Jadwal berhasil diupdate",
      });

      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Update schedule error:", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Jadwal</DialogTitle>
          <DialogDescription>Update informasi jadwal atau pengumuman</DialogDescription>
        </DialogHeader>

        {isLoadingSchedule ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-biru" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Judul *</Label>
              <Input
                id="edit-title"
                placeholder="Contoh: Ujian Tengah Semester"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                placeholder="Deskripsi atau detail tambahan..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-scheduledAt">Tanggal dan Waktu *</Label>
              <Input
                id="edit-scheduledAt"
                type="datetime-local"
                {...register("scheduledAt")}
              />
              {errors.scheduledAt && (
                <p className="text-sm text-red-600">{errors.scheduledAt.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-biru hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
