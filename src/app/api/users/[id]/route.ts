import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get single user
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

    // Users can only view their own profile, admin can view all
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        shortName: true,
        phone: true,
        role: true,
        isActive: true,
        profileImage: true,
        createdAt: true,
        class_: true,
        gender: true,
        domicile: true,
        ages: true,
        asalSekolah: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update user
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check if user can update this profile
    const isAdmin = session.user.role === "ADMIN";
    const isOwnProfile = session.user.id === id;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Non-admin can only update shortName, class, gender, domicile, ages, and phone
    const allowedFields = isAdmin
      ? ["fullName", "shortName", "class", "gender", "domicile", "ages", "phone", "role", "asalSekolah"]
      : ["shortName", "class", "gender", "domicile", "ages", "phone"];

    console.log("Received body:", body);

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      // Include field if it's defined (can be null to clear the value)
      if (field in body && body[field] !== undefined) {
        // Map field names for Prisma
        if (field === "fullName") {
          updateData.name = body[field]; // Update name for backwards compatibility
          updateData.fullName = body[field];
        } else if (field === "class") {
          updateData.class_ = body[field];
        } else {
          updateData[field] = body[field];
        }
      }
    }

    console.log("Update data:", updateData);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data untuk diupdate" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        shortName: true,
        phone: true,
        role: true,
        profileImage: true,
        class_: true,
        gender: true,
        domicile: true,
        ages: true,
        asalSekolah: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
