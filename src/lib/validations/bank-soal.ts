import { z } from "zod";

export const bankSoalCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Nama kategori harus diisi")
    .min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional(),
});

export const bankSoalSchema = z.object({
  title: z
    .string()
    .min(1, "Judul harus diisi")
    .min(2, "Judul minimal 2 karakter"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  fileUrl: z.string().min(1, "File harus diupload"),
  filePublicId: z.string().optional(),
});

export type BankSoalCategoryInput = z.infer<typeof bankSoalCategorySchema>;
export type BankSoalInput = z.infer<typeof bankSoalSchema>;
