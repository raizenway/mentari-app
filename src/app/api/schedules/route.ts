import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scheduleSchema } from "@/lib/validations/schedule";

// GET /api/schedules - List all schedules (for all authenticated users)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) {
        where.scheduledAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledAt.lte = new Date(endDate);
      }
    }

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
    });

    // Separate upcoming and past schedules
    const now = new Date();
    const upcoming = schedules.filter((s) => new Date(s.scheduledAt) >= now);
    const past = schedules.filter((s) => new Date(s.scheduledAt) < now);

    return NextResponse.json({
      schedules,
      upcoming,
      past,
    });
  } catch (error) {
    console.error("Get schedules error:", error);
    return NextResponse.json({ error: "Gagal mengambil jadwal" }, { status: 500 });
  }
}

// POST /api/schedules - Create new schedule (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { title, description, scheduledAt } = validation.data;

    const schedule = await prisma.schedule.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Create schedule error:", error);
    return NextResponse.json({ error: "Gagal membuat jadwal" }, { status: 500 });
  }
}
