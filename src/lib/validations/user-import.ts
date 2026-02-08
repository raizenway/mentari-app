import { z } from "zod";

export const userImportSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  shortName: z.string().optional(),
  class: z.string().max(30, "Kelas maksimal 30 karakter").optional(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional(),
  domicile: z.string().max(50, "Domisili maksimal 50 karakter").optional(),
  ages: z.number().int().positive("Umur harus berupa angka positif").optional(),
  phone: z.string().optional(),
  role: z.enum(["SISWA", "PENGAJAR", "ADMIN"]).optional(),
  asalSekolah: z.string().optional(),
});

export type UserImportRow = z.infer<typeof userImportSchema>;

export interface ImportValidationError {
  rowIndex: number;
  row: Partial<UserImportRow>;
  errors: string[];
}

export interface ImportResult {
  validRows: UserImportRow[];
  invalidRows: ImportValidationError[];
  duplicateEmails: string[];
}
