import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get all attendances for current user (Siswa)
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SISWA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const attendances = await prisma.attendance.findMany({
      where: { studentId: session.user.id },
      select: {
        classSessionId: true,
        attendedAt: true,
      },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
