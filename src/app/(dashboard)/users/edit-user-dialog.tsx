"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@prisma/client";

const editUserSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  shortName: z.string().optional(),
  class: z.string().max(30, "Kelas maksimal 30 karakter").optional(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional(),
  domicile: z.string().max(50, "Domisili maksimal 50 karakter").optional(),
  ages: z.number().int().positive("Umur harus berupa angka positif").optional().nullable(),
  phone: z.string().optional(),
  role: z.enum(["SISWA", "PENGAJAR", "ADMIN"]),
  asalSekolah: z.string().optional(),
});

type EditUserInput = z.infer<typeof editUserSchema>;

interface User {
  id: string;
  email: string;
  name: string;
  fullName: string | null;
  shortName: string | null;
  phone: string | null;
  role: UserRole;
  class_: string | null;
  gender: "LAKI_LAKI" | "PEREMPUAN" | null;
  domicile: string | null;
  ages: number | null;
  asalSekolah: string | null;
}

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export default function EditUserDialog({
  user,
  open,
  onClose,
}: EditUserDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: user.fullName || user.name,
      shortName: user.shortName || "",
      class: user.class_ || "",
      gender: user.gender || undefined,
      domicile: user.domicile || "",
      ages: user.ages,
      phone: user.phone || "",
      role: user.role,
      asalSekolah: user.asalSekolah || "",
    },
  });

  const onSubmit = async (data: EditUserInput) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal mengupdate pengguna");
      }

      toast({
        title: "Berhasil",
        description: "Data pengguna telah diperbarui",
        variant: "success",
      });

      onClose();
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Masukkan nama lengkap"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortName">Nama Panggilan</Label>
              <Input
                id="shortName"
                {...register("shortName")}
                placeholder="Nama panggilan (opsional)"
                disabled={isLoading}
              />
              {errors.shortName && (
                <p className="text-sm text-red-500">{errors.shortName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Kelas</Label>
                <Input
                  id="class"
                  {...register("class")}
                  placeholder="Contoh: XII IPA 1"
                  disabled={isLoading}
                />
                {errors.class && (
                  <p className="text-sm text-red-500">{errors.class.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ages">Umur</Label>
                <Input
                  id="ages"
                  type="number"
                  {...register("ages", { valueAsNumber: true })}
                  placeholder="Contoh: 17"
                  disabled={isLoading}
                />
                {errors.ages && (
                  <p className="text-sm text-red-500">{errors.ages.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  defaultValue={user.gender || undefined}
                  onValueChange={(value) => setValue("gender", value as "LAKI_LAKI" | "PEREMPUAN")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAKI_LAKI">Laki-Laki</SelectItem>
                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="08xxxxxxxxxx"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domicile">Domisili</Label>
              <Input
                id="domicile"
                {...register("domicile")}
                placeholder="Contoh: Jakarta Selatan"
                disabled={isLoading}
              />
              {errors.domicile && (
                <p className="text-sm text-red-500">{errors.domicile.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="asalSekolah">Asal Sekolah</Label>
              <Input
                id="asalSekolah"
                {...register("asalSekolah")}
                placeholder="Nama sekolah"
                disabled={isLoading}
              />
              {errors.asalSekolah && (
                <p className="text-sm text-red-500">{errors.asalSekolah.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                defaultValue={user.role}
                onValueChange={(value) =>
                  setValue("role", value as "SISWA" | "PENGAJAR" | "ADMIN")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SISWA">Siswa</SelectItem>
                  <SelectItem value="PENGAJAR">Pengajar</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
