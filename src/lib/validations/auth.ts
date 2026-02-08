import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password harus diisi")
    .min(6, "Password minimal 6 karakter"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini harus diisi"),
    newPassword: z
      .string()
      .min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password harus diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const registerUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
  fullName: z
    .string()
    .min(1, "Nama lengkap harus diisi")
    .min(2, "Nama minimal 2 karakter"),
  shortName: z.string().optional(),
  class: z.string().max(30, "Kelas maksimal 30 karakter").optional(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional(),
  domicile: z.string().max(50, "Domisili maksimal 50 karakter").optional(),
  ages: z.number().int().positive("Umur harus berupa angka positif").optional(),
  phone: z.string().optional(),
  role: z.enum(["SISWA", "PENGAJAR", "ADMIN"]),
  asalSekolah: z.string().optional(),
});

export const updateProfileSchema = z.object({
  shortName: z.string().optional(),
  class: z.string().max(30, "Kelas maksimal 30 karakter").optional(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional(),
  domicile: z.string().max(50, "Domisili maksimal 50 karakter").optional(),
  ages: z.number().int().positive("Umur harus berupa angka positif").optional(),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
