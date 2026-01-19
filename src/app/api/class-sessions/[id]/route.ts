import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classSessionSchema } from "@/lib/validations/class-session";

// GET: Get single class session with attendances
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

    const classSession = await prisma.classSession.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        attendances: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { attendedAt: "desc" },
        },
      },
    });

    if (!classSession) {
      return NextResponse.json(
        { error: "Sesi kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(classSession);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update class session (Pengajar & Admin)
export async function PUT(
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

    const body = await req.json();
    const validation = classSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const existingSession = await prisma.classSession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Sesi kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    const { title, description, scheduledAt, zoomLink, zoomMeetingId, zoomPasscode } =
      validation.data;

    const classSession = await prisma.classSession.update({
      where: { id },
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        zoomLink: zoomLink || null,
        zoomMeetingId,
        zoomPasscode,
      },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { attendances: true } },
      },
    });

    return NextResponse.json(classSession);
  } catch (error) {
    console.error("Error updating class session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete class session (Pengajar & Admin)
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

    const classSession = await prisma.classSession.findUnique({
      where: { id },
    });

    if (!classSession) {
      return NextResponse.json(
        { error: "Sesi kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete all attendances first
    await prisma.attendance.deleteMany({
      where: { classSessionId: id },
    });

    await prisma.classSession.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Sesi kelas berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting class session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
