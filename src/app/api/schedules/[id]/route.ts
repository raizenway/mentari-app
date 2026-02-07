import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scheduleUpdateSchema } from "@/lib/validations/schedule";

// GET /api/schedules/[id] - Get single schedule (for all authenticated users)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Get schedule error:", error);
    return NextResponse.json({ error: "Gagal mengambil jadwal" }, { status: 500 });
  }
}

// PATCH /api/schedules/[id] - Update schedule (ADMIN only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = scheduleUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    // Update schedule
    const updateData: any = {};
    if (validation.data.title !== undefined) updateData.title = validation.data.title;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;
    if (validation.data.scheduledAt !== undefined) updateData.scheduledAt = new Date(validation.data.scheduledAt);

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Update schedule error:", error);
    return NextResponse.json({ error: "Gagal mengupdate jadwal" }, { status: 500 });
  }
}

// DELETE /api/schedules/[id] - Delete schedule (ADMIN only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    // Delete schedule
    await prisma.schedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    console.error("Delete schedule error:", error);
    return NextResponse.json({ error: "Gagal menghapus jadwal" }, { status: 500 });
  }
}
