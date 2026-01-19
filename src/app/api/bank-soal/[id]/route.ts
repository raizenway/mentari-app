import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get single bank soal
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bankSoal = await prisma.bankSoal.findUnique({
      where: { id },
      include: {
        category: true,
        uploadedBy: { select: { name: true } },
      },
    });

    if (!bankSoal) {
      return NextResponse.json(
        { error: "Bank soal tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(bankSoal);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete bank soal (Pengajar & Admin)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "SISWA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bankSoal = await prisma.bankSoal.findUnique({
      where: { id },
    });

    if (!bankSoal) {
      return NextResponse.json(
        { error: "Bank soal tidak ditemukan" },
        { status: 404 }
      );
    }

    // TODO: Delete file from Cloudinary if needed
    // Can be implemented using cloudinary.uploader.destroy(bankSoal.filePublicId)

    await prisma.bankSoal.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Bank soal berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting bank soal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
