import { z } from "zod";

export const scheduleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, "Tanggal dan waktu wajib diisi"),
});

export const scheduleUpdateSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").optional(),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, "Tanggal dan waktu wajib diisi").optional(),
}).refine((data) => data.title !== undefined || data.description !== undefined || data.scheduledAt !== undefined, {
  message: "Minimal satu field harus diisi",
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type ScheduleUpdateInput = z.infer<typeof scheduleUpdateSchema>;
