import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Video, Users, CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ScheduleAnnouncement } from "./schedule-announcement";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch data berdasarkan role
  const [bankSoalCount, upcomingSessionsCount, totalUsers, upcomingSessions, schedules] = await Promise.all([
    prisma.bankSoal.count(),
    prisma.classSession.count({
      where: { scheduledAt: { gte: today } }
    }),
    user.role === "ADMIN" ? prisma.user.count() : Promise.resolve(0),
    prisma.classSession.findMany({
      where: { scheduledAt: { gte: today } },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { attendances: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.schedule.findMany({
      where: { scheduledAt: { gte: today } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
  ]);

  // Cek apakah user sudah hadir di sesi (untuk siswa)
  let userAttendances: string[] = [];
  let totalAttendance = 0;
  if (user.role === "SISWA") {
    const attendances = await prisma.attendance.findMany({
      where: { studentId: user.id },
      select: { classSessionId: true },
    });
    userAttendances = attendances.map((a) => a.classSessionId);
    totalAttendance = attendances.length;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {user.role === "SISWA" && "Siap untuk belajar hari ini?"}
          {user.role === "PENGAJAR" && "Kelola kelas dan bank soal Anda di sini."}
          {user.role === "ADMIN" && "Pantau dan kelola seluruh aktivitas platform."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bank Soal
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hitam">{bankSoalCount}</div>
            <p className="text-xs text-gray-500 mt-1">Total file tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sesi Mendatang
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hitam">{upcomingSessionsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Kelas terjadwal</p>
          </CardContent>
        </Card>

        {user.role === "ADMIN" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pengguna
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">Pengguna terdaftar</p>
            </CardContent>
          </Card>
        )}

        {user.role === "SISWA" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Presensi
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hitam">{totalAttendance}</div>
              <p className="text-xs text-gray-500 mt-1">Kelas dihadiri</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sesi Kelas Mendatang</CardTitle>
              <Link href="/sesi-kelas">
                <Button variant="outline" size="sm">
                  Lihat Semua
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((classSession) => {
                const hasAttended = userAttendances.includes(classSession.id);
                const isToday = new Date(classSession.scheduledAt).toDateString() === new Date().toDateString();
                return (
                  <div
                    key={classSession.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {classSession.title}
                        </h3>
                        {isToday && <Badge className="bg-green-500">Hari Ini</Badge>}
                        {user.role === "SISWA" && hasAttended && (
                          <Badge variant="secondary">Sudah Hadir</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {classSession.description || "Tidak ada deskripsi"}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(classSession.scheduledAt)} • {new Date(classSession.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} • Pengajar: {classSession.createdBy.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/sesi-kelas/${classSession.id}`}>
                        <Button
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600"
                        >
                          {user.role === "SISWA" ? (hasAttended ? "Lihat Detail" : "Gabung Kelas") : `Detail`}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

            {/* Schedule Announcements */}
      <ScheduleAnnouncement schedules={schedules} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/bank-soal">
              <div className="p-4 rounded-lg border hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer">
                <FileText className="h-8 w-8 text-amber-500 mb-2" />
                <h3 className="font-medium text-hitam">Akses Bank Soal</h3>
                <p className="text-sm text-gray-500">
                  Lihat dan download materi pembelajaran
                </p>
              </div>
            </Link>

            <Link href="/sesi-kelas">
              <div className="p-4 rounded-lg border hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                <Video className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium text-hitam">Sesi Kelas</h3>
                <p className="text-sm text-gray-500">
                  {user.role === "SISWA"
                    ? "Gabung kelas online"
                    : "Kelola sesi kelas"}
                </p>
              </div>
            </Link>

            {user.role === "ADMIN" && (
              <Link href="/users">
                <div className="p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                  <Users className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium text-black">Kelola Pengguna</h3>
                  <p className="text-sm text-gray-500">
                    Tambah dan kelola akun pengguna
                  </p>
                </div>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
