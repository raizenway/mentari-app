import * as xlsx from "xlsx";
import { userImportSchema, type UserImportRow, type ImportValidationError, type ImportResult } from "@/lib/validations/user-import";

export async function parseXlsxFile(buffer: ArrayBuffer): Promise<ImportResult> {
  try {
    // Parse the workbook
    const workbook = xlsx.read(buffer, { type: "array" });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("File Excel tidak memiliki sheet");
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    }) as (string | number)[][];

    // Extract headers from first row
    if (rawData.length === 0) {
      throw new Error("File Excel kosong");
    }

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    // Find column indices (case-insensitive)
    const findColumnIndex = (columnName: string) => {
      return headers.findIndex(
        (h) => h && h.toLowerCase().trim() === columnName.toLowerCase().trim()
      );
    };

    const emailIdx = findColumnIndex("email");
    const passwordIdx = findColumnIndex("password");
    const nameIdx = findColumnIndex("name");
    const phoneIdx = findColumnIndex("phone");
    const roleIdx = findColumnIndex("role");
    const asalSekolahIdx = findColumnIndex("asalSekolah");

    // Validate required columns exist
    if (emailIdx === -1 || passwordIdx === -1 || nameIdx === -1) {
      throw new Error("Kolom wajib (email, password, name) tidak ditemukan");
    }

    // Process each row
    const validRows: UserImportRow[] = [];
    const invalidRows: ImportValidationError[] = [];
    const emailSet = new Set<string>();
    const duplicateEmails: string[] = [];

    dataRows.forEach((row, idx) => {
      const rowIndex = idx + 2; // +2 because: +1 for 0-based index, +1 for header row

      // Skip empty rows
      if (row.length === 0 || (row.length === 1 && row[0] === "")) {
        return;
      }

      // Extract values
      const rawRow: any = {
        email: row[emailIdx] || "",
        password: row[passwordIdx] || "",
        name: row[nameIdx] || "",
        phone: phoneIdx !== -1 ? (row[phoneIdx] || "") : undefined,
        role: roleIdx !== -1 ? (row[roleIdx] || undefined) : undefined,
        asalSekolah: asalSekolahIdx !== -1 ? (row[asalSekolahIdx] || undefined) : undefined,
      };

      // Convert empty strings to undefined for optional fields
      if (!rawRow.phone) rawRow.phone = undefined;
      if (!rawRow.role) rawRow.role = undefined;
      if (!rawRow.asalSekolah) rawRow.asalSekolah = undefined;

      // Check for duplicate emails within the file
      if (emailSet.has(rawRow.email)) {
        duplicateEmails.push(rawRow.email);
        invalidRows.push({
          rowIndex,
          row: rawRow,
          errors: ["Email duplikat dalam file"],
        });
        return;
      }

      emailSet.add(rawRow.email);

      // Validate row
      const validationResult = userImportSchema.safeParse(rawRow);

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((issue) => {
          const field = issue.path[0] as string;
          return `${field}: ${issue.message}`;
        });

        invalidRows.push({
          rowIndex,
          row: rawRow,
          errors,
        });
      } else {
        validRows.push(validationResult.data);
      }
    });

    return {
      validRows,
      invalidRows,
      duplicateEmails,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Gagal memproses file: ${error.message}`);
    }
    throw new Error("Gagal memproses file Excel");
  }
}
