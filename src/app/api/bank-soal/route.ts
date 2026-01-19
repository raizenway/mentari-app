import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bankSoalSchema } from "@/lib/validations/bank-soal";

// GET: List all bank soals
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bankSoals = await prisma.bankSoal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        uploadedBy: { select: { name: true } },
      },
    });

    return NextResponse.json(bankSoals);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new bank soal (Pengajar & Admin)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "SISWA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = bankSoalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, categoryId, fileUrl, filePublicId } =
      validation.data;

    // Verify category exists
    const category = await prisma.bankSoalCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    const bankSoal = await prisma.bankSoal.create({
      data: {
        title,
        description,
        categoryId,
        fileUrl,
        filePublicId,
        uploadedById: session.user.id,
      },
      include: {
        category: true,
        uploadedBy: { select: { name: true } },
      },
    });

    return NextResponse.json(bankSoal, { status: 201 });
  } catch (error) {
    console.error("Error creating bank soal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
