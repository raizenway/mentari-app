import { z } from "zod";

export const userImportSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
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
