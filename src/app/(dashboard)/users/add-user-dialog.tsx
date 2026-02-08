"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { registerUserSchema, type RegisterUserInput } from "@/lib/validations/auth";
import { useToast } from "@/hooks/use-toast";

export default function AddUserDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      role: "SISWA",
    },
  });

  const onSubmit = async (data: RegisterUserInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal menambahkan pengguna");
      }

      toast({
        title: "Berhasil",
        description: "Pengguna baru telah ditambahkan",
        variant: "success",
      });

      reset();
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-300 hover:bg-yellow-500 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white text-black max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="nama@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Minimal 6 karakter"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
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
                  onValueChange={(value) => setValue("gender", value as "LAKI_LAKI" | "PEREMPUAN")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                    <SelectItem value="LAKI_LAKI" className="hover:bg-gray-200">Laki-Laki</SelectItem>
                    <SelectItem value="PEREMPUAN" className="hover:bg-gray-200">Perempuan</SelectItem>
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
              <Label htmlFor="role">Role *</Label>
              <Select
                defaultValue="SISWA"
                onValueChange={(value) =>
                  setValue("role", value as "SISWA" | "PENGAJAR" | "ADMIN")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectItem value="SISWA" className="hover:bg-gray-200">Siswa</SelectItem>
                  <SelectItem value="PENGAJAR" className="hover:bg-gray-200">Pengajar</SelectItem>
                  <SelectItem value="ADMIN" className="hover:bg-gray-200">Admin</SelectItem>
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
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-amber-300 hover:bg-yellow-500"
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
