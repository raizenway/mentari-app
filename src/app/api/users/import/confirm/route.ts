import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type UserImportRow } from "@/lib/validations/user-import";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only ADMIN can import users
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rows } = body as { rows: UserImportRow[] };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk diimport" }, { status: 400 });
    }

    const created = [];
    const failed = [];
    const errors: string[] = [];

    // Hash passwords and create users
    for (const row of rows) {
      try {
        const hashedPassword = await bcrypt.hash(row.password, 12);

        await prisma.user.create({
          data: {
            email: row.email,
            password: hashedPassword,
            name: row.fullName, // Store fullName in name for backwards compatibility
            fullName: row.fullName,
            shortName: row.shortName,
            class_: row.class,
            gender: row.gender,
            domicile: row.domicile,
            ages: row.ages,
            phone: row.phone,
            role: row.role || "SISWA",
            asalSekolah: row.asalSekolah,
          },
        });

        created.push(row.email);
      } catch (error) {
        failed.push(row.email);
        const message = error instanceof Error ? error.message : "Gagal membuat user";
        errors.push(`${row.email}: ${message}`);
      }
    }

    return NextResponse.json({
      created: created.length,
      failed: failed.length,
      errors,
      createdEmails: created,
      failedEmails: failed,
    });
  } catch (error) {
    console.error("Import confirm error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengimpor user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
