import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseXlsxFile } from "@/lib/xlsx-parser";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only ADMIN can import users
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan file .xlsx atau .xls" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse XLSX file
    const result = await parseXlsxFile(arrayBuffer);

    // Check for duplicate emails in database
    const existingEmails = await prisma.user.findMany({
      where: {
        email: {
          in: result.validRows.map((row) => row.email),
        },
      },
      select: {
        email: true,
      },
    });

    const duplicateEmailsInDb = existingEmails.map((u) => u.email);

    // Mark valid rows with duplicate emails as invalid
    const finalValidRows = result.validRows.filter(
      (row) => !duplicateEmailsInDb.includes(row.email)
    );

    const finalInvalidRows = [
      ...result.invalidRows,
      ...result.validRows
        .filter((row) => duplicateEmailsInDb.includes(row.email))
        .map((row) => ({
          rowIndex: 0, // We don't have the original index here
          row,
          errors: ["Email sudah terdaftar di database"],
        })),
    ];

    return NextResponse.json({
      validRows: finalValidRows,
      invalidRows: finalInvalidRows,
      duplicateEmails: result.duplicateEmails,
      duplicateEmailsInDb,
      totalRows: result.validRows.length + result.invalidRows.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    const message = error instanceof Error ? error.message : "Gagal memproses file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
