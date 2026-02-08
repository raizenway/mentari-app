"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Shield, Key, Loader2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfileSchema } from "@/lib/validations/auth";
import type { UpdateProfileInput } from "@/lib/validations/auth";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf kapital")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      shortName: session?.user?.shortName || "",
      class: session?.user?.class_ || "",
      gender: session?.user?.gender || undefined,
      domicile: session?.user?.domicile || "",
      ages: session?.user?.ages || undefined,
      phone: session?.user?.phone || "",
    },
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal mengubah password");
      }

      setMessage({ type: "success", text: "Password berhasil diubah" });
      resetPassword();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onProfileSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Only send fields that have been changed (not undefined)
      const cleanedData: Record<string, any> = {};

      if (data.shortName !== undefined && data.shortName !== "") {
        cleanedData.shortName = data.shortName;
      }
      if (data.class !== undefined && data.class !== "") {
        cleanedData.class = data.class;
      }
      if (data.gender !== undefined) {
        cleanedData.gender = data.gender;
      }
      if (data.domicile !== undefined && data.domicile !== "") {
        cleanedData.domicile = data.domicile;
      }
      if (data.ages !== undefined) {
        cleanedData.ages = data.ages;
      }
      if (data.phone !== undefined && data.phone !== "") {
        cleanedData.phone = data.phone;
      }

      console.log("Submitting profile update:", cleanedData);

      if (Object.keys(cleanedData).length === 0) {
        setMessage({ type: "error", text: "Tidak ada data yang diubah" });
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("API Error:", result);
        throw new Error(result.error || "Gagal mengupdate profil");
      }

      console.log("API Success:", result);

      setMessage({ type: "success", text: "Profil berhasil diperbarui" });
      setIsEditing(false);

      // Refresh page to show updated data
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditField(null);
    // Reset form to original session values
    resetProfile({
      shortName: session?.user?.shortName || "",
      class: session?.user?.class_ || "",
      gender: session?.user?.gender || undefined,
      domicile: session?.user?.domicile || "",
      ages: session?.user?.ages || undefined,
      phone: session?.user?.phone || "",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-500">Admin</Badge>;
      case "PENGAJAR":
        return <Badge className="bg-blue-500">Pengajar</Badge>;
      default:
        return <Badge className="bg-green-500">Siswa</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  };

  const ProfileField = ({
    label,
    icon: Icon,
    value,
    editing,
    onEdit,
    name,
    placeholder,
    error,
    type = "text",
    selectOptions,
  }: {
    label: string;
    icon: any;
    value: string | number | null | undefined;
    editing: boolean;
    onEdit: () => void;
    name: string;
    placeholder: string;
    error?: string;
    type?: string;
    selectOptions?: { value: string; label: string }[];
  }) => (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg relative group">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        {editing ? (
          <>
            {type === "select" ? (
              <Select
                defaultValue={value?.toString() || undefined}
                onValueChange={(val) => setProfileValue(name as any, val as any)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={type}
                {...registerProfile(name as any)}
                placeholder={placeholder}
                className="bg-white"
              />
            )}
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </>
        ) : (
          <p className="font-medium text-hitam truncate">
            {value || "-"}
            {value === "" || value === undefined || value === null ? (
              <span className="text-gray-400">Belum diisi</span>
            ) : (
              value?.toString()
            )}
          </p>
        )}
      </div>
      {editing && (
        <button
          type="button"
          onClick={onEdit}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
          title="Edit"
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hitam">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi profil dan keamanan akun Anda
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Informasi Profil</CardTitle>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                    Batal
                  </Button>
                  <Button
                    onClick={handleSubmitProfile(onProfileSubmit)}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Simpan
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4 pb-6 border-b">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  {getInitials(session?.user?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-hitam">
                  {session?.user?.fullName || session?.user?.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  {session?.user?.shortName && (
                    <p className="text-sm text-gray-500">Panggilan: {session.user.shortName}</p>
                  )}
                  {session?.user?.role && getRoleBadge(session.user.role)}
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <form onSubmit={handleSubmitProfile(onProfileSubmit)}>
              <div className="grid gap-3 md:grid-cols-2">
                <ProfileField
                  label="Email"
                  icon={Mail}
                  value={session?.user?.email}
                  editing={false}
                  onEdit={() => {}}
                  name="email"
                  placeholder="Email"
                />

                <ProfileField
                  label="Nama Lengkap"
                  icon={User}
                  value={session?.user?.fullName || session?.user?.name}
                  editing={false}
                  onEdit={() => {}}
                  name="fullName"
                  placeholder="Nama lengkap"
                />

                <ProfileField
                  label="Nama Panggilan"
                  icon={User}
                  value={session?.user?.shortName}
                  editing={isEditing}
                  onEdit={() => setEditField("shortName")}
                  name="shortName"
                  placeholder="Nama panggilan (opsional)"
                  error={profileErrors.shortName?.message}
                />

                <ProfileField
                  label="Kelas"
                  icon={Shield}
                  value={session?.user?.class_}
                  editing={isEditing}
                  onEdit={() => setEditField("class")}
                  name="class"
                  placeholder="Contoh: 12 MIPA 7"
                  error={profileErrors.class?.message}
                />

                <ProfileField
                  label="Umur"
                  icon={Shield}
                  value={session?.user?.ages}
                  editing={isEditing}
                  onEdit={() => setEditField("ages")}
                  name="ages"
                  placeholder="Contoh: 17"
                  type="number"
                  error={profileErrors.ages?.message}
                />

                <ProfileField
                  label="Gender"
                  icon={Shield}
                  value={session?.user?.gender?.toLowerCase().replace("_", " ")}
                  editing={isEditing}
                  onEdit={() => setEditField("gender")}
                  name="gender"
                  placeholder="Pilih gender"
                  type="select"
                  selectOptions={[
                    { value: "LAKI_LAKI", label: "Laki-Laki" },
                    { value: "PEREMPUAN", label: "Perempuan" },
                  ]}
                  error={profileErrors.gender?.message}
                />

                <ProfileField
                  label="Domisili"
                  icon={Shield}
                  value={session?.user?.domicile}
                  editing={isEditing}
                  onEdit={() => setEditField("domicile")}
                  name="domicile"
                  placeholder="Contoh: Jakarta Selatan"
                  error={profileErrors.domicile?.message}
                />

                <ProfileField
                  label="No. Telepon"
                  icon={Shield}
                  value={session?.user?.phone}
                  editing={isEditing}
                  onEdit={() => setEditField("phone")}
                  name="phone"
                  placeholder="628xxxxxxxx"
                  error={profileErrors.phone?.message}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              Ubah Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2 text-hitam">
                <Label htmlFor="currentPassword">Password Lama</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Masukkan password lama"
                  {...registerPassword("currentPassword")}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-hitam">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Masukkan password baru"
                  {...registerPassword("newPassword")}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-hitam">
                  Minimal 8 karakter dengan huruf kapital, huruf kecil, dan angka
                </p>
              </div>

              <div className="space-y-2 text-hitam">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password baru"
                  {...registerPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-biru" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
