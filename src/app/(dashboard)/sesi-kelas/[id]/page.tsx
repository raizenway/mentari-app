"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Video, 
  ExternalLink,
  Users,
  CheckCircle,
  Copy,
  Check,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddSessionDialog } from "../add-session-dialog";
import type { ClassSessionFormData } from "@/lib/validations/class-session";
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
  zoomLink: string | null;
  zoomMeetingId: string | null;
  zoomPasscode: string | null;
  createdBy: { name: string };
  attendances: Array<{
    id: string;
    attendedAt: string;
    student: { id: string; name: string; email: string };
  }>;
}

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [classSession, setClassSession] = useState<ClassSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const isStudent = session?.user?.role === "SISWA";
  const canManage = session?.user?.role === "ADMIN" || session?.user?.role === "PENGAJAR";
  const hasAttended = classSession?.attendances.some(
    (a) => a.student.id === session?.user?.id
  );

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/class-sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClassSession(data);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const handleAttendance = async () => {
    setAttending(true);
    try {
      const res = await fetch(`/api/class-sessions/${id}/attendance`, {
        method: "POST",
      });
      if (res.ok) {
        fetchSession();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengisi presensi");
      }
    } catch (error) {
      console.error("Error recording attendance:", error);
    } finally {
      setAttending(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!classSession) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sesi kelas tidak ditemukan</p>
        <Button asChild className="mt-4">
          <Link href="/sesi-kelas">Kembali</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="bg-biru" asChild>
            <Link href="/sesi-kelas">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{classSession.title}</h1>
              <p className="inline-flex text-black bg-kuning px-2 rounded-lg mt-1">
                oleh {classSession.createdBy.name}
              </p>
          </div>
        </div>
        {canManage && (
          <Button onClick={() => setEditOpen(true)} className="bg-amber-300 hover:bg-amber-400">
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 text-black">
        {/* Session Info */}
        <Card>
          <CardHeader className="inline-flex">
            <CardTitle className="flex gap-2 items-center text-lg">
              <Info className="h-5 w-5" />
              Informasi Sesi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classSession.description && (
              <p className="text-muted-foreground">
                {classSession.description}
              </p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{formatDate(classSession.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>
                  {new Date(classSession.scheduledAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB
                </span>
              </div>
              {/* <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{classSession.attendances.length} peserta hadir</span>
              </div> */}
            </div>

            {/* Student Attendance Button */}
            {/* {isStudent && (
              <div className="pt-4 border-t">
                {hasAttended ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Anda sudah mengisi presensi</span>
                  </div>
                ) : (
                  <Button onClick={handleAttendance} disabled={attending} className="w-full">
                    {attending ? "Memproses..." : "Isi Presensi"}
                  </Button>
                )}
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* Zoom Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-lg">
              <Video className="h-5 w-5" />
              Zoom Meeting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classSession.zoomLink ? (
              <>
                {classSession.zoomMeetingId && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Meeting ID</p>
                      <p className="font-mono">{classSession.zoomMeetingId}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(classSession.zoomMeetingId!, "meetingId")}
                    >
                      {copied === "meetingId" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}

                {classSession.zoomPasscode && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Passcode</p>
                      <p className="font-mono">{classSession.zoomPasscode}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(classSession.zoomPasscode!, "passcode")}
                    >
                      {copied === "passcode" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
                <Button 
                  className="w-full bg-kuning" 
                  onClick={() => window.open(classSession.zoomLink!, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join Meeting
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Link Zoom belum tersedia
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance List (Admin & Pengajar) */}
      {/* {!isStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Presensi</CardTitle>
          </CardHeader>
          <CardContent>
            {classSession.attendances.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Belum ada peserta yang mengisi presensi
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Waktu Presensi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classSession.attendances.map((attendance, index) => (
                    <TableRow key={attendance.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {attendance.student.name}
                      </TableCell>
                      <TableCell>{attendance.student.email}</TableCell>
                      <TableCell>
                        {new Date(attendance.attendedAt).toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )} */}

      <AddSessionDialog
        open={editOpen}
        onOpenChange={(open) => setEditOpen(open)}
        onSuccess={() => {
          setEditOpen(false);
          fetchSession();
        }}
        mode="edit"
        sessionId={classSession.id}
        initialValues={{
          title: classSession.title,
          description: classSession.description ?? "",
          scheduledAt: classSession.scheduledAt,
          zoomLink: classSession.zoomLink ?? "",
          zoomMeetingId: classSession.zoomMeetingId ?? "",
          zoomPasscode: classSession.zoomPasscode ?? "",
        }}
      />
    </div>
  );
}
