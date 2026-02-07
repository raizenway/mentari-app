"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { scheduleSchema, type ScheduleInput } from "@/lib/validations/schedule";
import { useToast } from "@/hooks/use-toast";

export function AddScheduleDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleInput>({
    resolver: zodResolver(scheduleSchema),
  });

  const onSubmit = async (data: ScheduleInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal membuat jadwal");
      }

      toast({
        title: "Berhasil",
        description: "Jadwal berhasil dibuat",
      });

      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      console.error("Create schedule error:", error);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-biru hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jadwal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Baru</DialogTitle>
          <DialogDescription>
            Buat jadwal atau pengumuman baru untuk semua pengguna
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              placeholder="Contoh: Ujian Tengah Semester"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi atau detail tambahan..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Tanggal dan Waktu *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              {...register("scheduledAt")}
            />
            {errors.scheduledAt && (
              <p className="text-sm text-red-600">{errors.scheduledAt.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-biru hover:bg-blue-600">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
