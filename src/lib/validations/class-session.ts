import { z } from "zod";

export const classSessionSchema = z.object({
  title: z
    .string()
    .min(1, "Judul sesi wajib diisi")
    .max(100, "Judul maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
  scheduledAt: z.string().min(1, "Jadwal wajib diisi"),
  zoomLink: z
    .string()
    .url("Format link tidak valid")
    .optional()
    .or(z.literal("")),
  zoomMeetingId: z.string().optional(),
  zoomPasscode: z.string().optional(),
});

export type ClassSessionFormData = z.infer<typeof classSessionSchema>;

export const attendanceSchema = z.object({
  classSessionId: z.string().min(1, "Class session ID wajib diisi"),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;
