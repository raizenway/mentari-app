import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classSessionSchema } from "@/lib/validations/class-session";

// GET: List all class sessions
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classSessions = await prisma.classSession.findMany({
      orderBy: { scheduledAt: "desc" },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { attendances: true } },
      },
    });

    return NextResponse.json(classSessions);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new class session (Pengajar & Admin)
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
    const validation = classSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, scheduledAt, zoomLink, zoomMeetingId, zoomPasscode } =
      validation.data;

    const classSession = await prisma.classSession.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        zoomLink: zoomLink || null,
        zoomMeetingId,
        zoomPasscode,
        createdById: session.user.id,
      },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { attendances: true } },
      },
    });

    return NextResponse.json(classSession, { status: 201 });
  } catch (error) {
    console.error("Error creating class session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
