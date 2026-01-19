-- Supabase / PostgreSQL initialization SQL for Mentari
-- Includes: extension, enum, table definitions, and seed data

-- 1) Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Enum for user roles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE "UserRole" AS ENUM ('SISWA','PENGAJAR','ADMIN');
    END IF;
END$$;

-- 3) Users table
CREATE TABLE IF NOT EXISTS "users" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  "profileImage" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'SISWA',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Bank Soal Categories
CREATE TABLE IF NOT EXISTS "bank_soal_categories" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Bank Soals
CREATE TABLE IF NOT EXISTS "bank_soals" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  "fileUrl" TEXT NOT NULL,
  "filePublicId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  "categoryId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,

  CONSTRAINT fk_banksoal_category FOREIGN KEY ("categoryId") REFERENCES "bank_soal_categories"(id) ON DELETE CASCADE,
  CONSTRAINT fk_banksoal_uploadedby FOREIGN KEY ("uploadedById") REFERENCES "users"(id) ON DELETE CASCADE
);

-- 6) Class sessions
CREATE TABLE IF NOT EXISTS "class_sessions" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  "scheduledAt" TIMESTAMPTZ NOT NULL,
  "zoomLink" TEXT,
  "zoomMeetingId" TEXT,
  "zoomPasscode" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  "createdById" TEXT NOT NULL,
  CONSTRAINT fk_classsession_createdby FOREIGN KEY ("createdById") REFERENCES "users"(id) ON DELETE CASCADE
);

-- 7) Attendances
CREATE TABLE IF NOT EXISTS "attendances" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "attendedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  "classSessionId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,

  CONSTRAINT fk_attendance_session FOREIGN KEY ("classSessionId") REFERENCES "class_sessions"(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_student FOREIGN KEY ("studentId") REFERENCES "users"(id) ON DELETE CASCADE,
  CONSTRAINT unique_student_session UNIQUE ("studentId", "classSessionId")
);

-- =========================
-- Seed data
-- =========================

-- Users (passwords hashed with bcrypt)
-- Generated hashes (bcrypt, cost 10):
-- Admin:  $2b$10$vmlUtLDrtPw6oQrmV9aoPuKdKJ5MXoWNp733StdkuxW50X18aDopq
-- Pengajar: $2b$10$ll.0uLA0jkoY6iZG5veXDO9FUxdSN9sdrTQ3.s9uRP9tmzc/XCkaq
-- Siswa: $2b$10$BHwkrVfVi1TC0xJencZms.2YIX1TsmsvG4.AkkCVfmrCzrng.hxla

INSERT INTO "users" (id, email, password, name, "role", "isActive", "createdAt", "updatedAt") VALUES
  ('admin-1','admin@mentari.id','$2b$10$vmlUtLDrtPw6oQrmV9aoPuKdKJ5MXoWNp733StdkuxW50X18aDopq','Administrator','ADMIN', true, now(), now())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "users" (id, email, password, name, "role", "isActive", "createdAt", "updatedAt") VALUES
  ('pengajar-1','pengajar@mentari.id','$2b$10$ll.0uLA0jkoY6iZG5veXDO9FUxdSN9sdrTQ3.s9uRP9tmzc/XCkaq','Budi Santoso','PENGAJAR', true, now(), now())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "users" (id, email, password, name, "role", "isActive", "createdAt", "updatedAt") VALUES
  ('siswa-1','siswa@mentari.id','$2b$10$BHwkrVfVi1TC0xJencZms.2YIX1TsmsvG4.AkkCVfmrCzrng.hxla','Andi Pratama','SISWA', true, now(), now())
ON CONFLICT (email) DO NOTHING;

-- Categories
INSERT INTO "bank_soal_categories" (id, name, description, "createdAt", "updatedAt") VALUES
  ('cat-mtk','Matematika','Soal-soal matematika untuk berbagai tingkat', now(), now()),
  ('cat-bindo','Bahasa Indonesia','Latihan bahasa Indonesia', now(), now()),
  ('cat-bing','Bahasa Inggris','Latihan bahasa Inggris', now(), now()),
  ('cat-ipa','IPA','Ilmu Pengetahuan Alam', now(), now()),
  ('cat-ips','IPS','Ilmu Pengetahuan Sosial', now(), now())
ON CONFLICT (name) DO NOTHING;

-- Sample Bank Soal (demo)
INSERT INTO "bank_soals" (id, title, description, "fileUrl", "filePublicId", "categoryId", "uploadedById", "createdAt", "updatedAt") VALUES
  ('banksoal-1', 'Contoh Soal Matematika', 'Contoh file PDF latihan matematika', 'https://example.com/sample-mtk.pdf', NULL, 'cat-mtk', 'pengajar-1', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Sample Class Session
INSERT INTO "class_sessions" (id, title, description, "scheduledAt", "zoomLink", "zoomMeetingId", "zoomPasscode", "createdById", "createdAt", "updatedAt") VALUES
  ('sample-session-1', 'Pembahasan Soal Matematika Dasar', 'Sesi pembahasan soal-soal matematika dasar untuk persiapan ujian', '2026-01-20T19:00:00Z', 'https://zoom.us/j/1234567890', '1234567890', 'mentari', 'pengajar-1', now(), now())
ON CONFLICT (id) DO NOTHING;

-- (Optional) sample attendance: siswa hadir pada sample-session-1
INSERT INTO "attendances" (id, "classSessionId", "studentId", "attendedAt") VALUES
  ('attendance-1', 'sample-session-1', 'siswa-1', now())
ON CONFLICT ("studentId", "classSessionId") DO NOTHING;

-- Done

-- Helpful queries to verify:
-- SELECT count(*) FROM "users";
-- SELECT * FROM "bank_soal_categories";
-- SELECT * FROM "class_sessions";
-- SELECT * FROM "attendances";
