"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface ClassSession {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  createdBy: { name: string };
  _count: { attendances: number };
}

interface AttendanceRecord {
  classSessionId: string;
  attendedAt: string;
}

export default function PresensiPage() {
  const { data: session } = useSession();
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [myAttendances, setMyAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all class sessions
        const sessionsRes = await fetch("/api/class-sessions");
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setClassSessions(sessionsData);
        }

        // Fetch my attendances
        const attendancesRes = await fetch("/api/my-attendances");
        if (attendancesRes.ok) {
          const attendancesData = await attendancesRes.json();
          setMyAttendances(attendancesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAttendanceForSession = (sessionId: string) => {
    return myAttendances.find((a) => a.classSessionId === sessionId);
  };

  const attendedCount = myAttendances.length;
  const totalSessions = classSessions.length;
  const attendanceRate = totalSessions > 0 
    ? Math.round((attendedCount / totalSessions) * 100) 
    : 0;

  if (session?.user?.role !== "SISWA") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Halaman ini hanya dapat diakses oleh Siswa
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hitam">Presensi Saya</h1>
        <p className="text-muted-foreground">
          Riwayat kehadiran Anda di sesi kelas
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-hitam">{totalSessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kehadiran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{attendedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Persentase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              <span className={attendanceRate >= 80 ? "text-green-600" : attendanceRate >= 60 ? "text-amber-600" : "text-red-600"}>
                {attendanceRate}%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Presensi</CardTitle>
        </CardHeader>
        <CardContent>
          {classSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada sesi kelas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sesi Kelas</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu Presensi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classSessions.map((classSession) => {
                  const attendance = getAttendanceForSession(classSession.id);
                  const isPast = new Date(classSession.scheduledAt) < new Date();
                  
                  return (
                    <TableRow key={classSession.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-hitam">{classSession.title}</p>
                          <p className="text-sm text-muted-foreground">
                            oleh {classSession.createdBy.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-hitam">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(classSession.scheduledAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-hitam">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(classSession.scheduledAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {attendance ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Hadir
                          </Badge>
                        ) : isPast ? (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Tidak Hadir
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-hitam">Belum</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {attendance ? (
                          new Date(attendance.attendedAt).toLocaleString("id-ID")
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
