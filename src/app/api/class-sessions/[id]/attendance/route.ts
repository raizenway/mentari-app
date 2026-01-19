import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Record attendance (Siswa)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SISWA") {
      return NextResponse.json(
        { error: "Hanya siswa yang dapat mengisi presensi" },
        { status: 403 }
      );
    }

    // Check if class session exists
    const classSession = await prisma.classSession.findUnique({
      where: { id },
    });

    if (!classSession) {
      return NextResponse.json(
        { error: "Sesi kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if already attended
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_classSessionId: {
          studentId: session.user.id,
          classSessionId: id,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Anda sudah mengisi presensi untuk sesi ini" },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId: session.user.id,
        classSessionId: id,
      },
      include: {
        student: { select: { name: true } },
        classSession: { select: { title: true } },
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get attendance list for session
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

    const attendances = await prisma.attendance.findMany({
      where: { classSessionId: id },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { attendedAt: "desc" },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
