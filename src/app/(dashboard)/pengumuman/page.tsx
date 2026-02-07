import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScheduleList } from "./schedule-list";

export default async function PengumumanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const tab = params?.tab ?? "all";

  const schedules = await prisma.schedule.findMany({
    orderBy: { scheduledAt: "asc" },
  });

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hitam">Jadwal & Pengumuman</h1>
          <p className="text-gray-600">
            {isAdmin
              ? "Kelola jadwal dan pengumuman untuk semua pengguna"
              : "Lihat jadwal dan pengumuman terbaru"}
          </p>
        </div>
      </div>

      <ScheduleList schedules={schedules} isAdmin={isAdmin} initialTab={tab} />
    </div>
  );
}
