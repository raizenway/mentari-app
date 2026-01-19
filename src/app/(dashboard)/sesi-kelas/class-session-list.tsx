"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  ExternalLink,
  Trash2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  _count: { attendances: number };
}

interface ClassSessionListProps {
  sessions: ClassSession[];
  loading: boolean;
  onRefresh: () => void;
  canManage: boolean;
  currentUserId?: string;
}

export function ClassSessionList({
  sessions,
  loading,
  onRefresh,
  canManage,
  currentUserId,
}: ClassSessionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sesi ini?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/class-sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Belum ada sesi kelas</h3>
          <p className="text-muted-foreground">
            Sesi kelas yang dijadwalkan akan muncul di sini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((classSession) => (
        <Card key={classSession.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-1">{classSession.title}</h3>
                <p className="text-sm text-muted-foreground">
                  oleh {classSession.createdBy.name}
                </p>
              </div>
              {isToday(classSession.scheduledAt) ? (
                <Badge className="bg-green-500">Hari Ini</Badge>
              ) : isUpcoming(classSession.scheduledAt) ? (
                <Badge variant="outline">Mendatang</Badge>
              ) : (
                <Badge variant="secondary">Selesai</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {classSession.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {classSession.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(classSession.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(classSession.scheduledAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{classSession._count.attendances} peserta hadir</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/sesi-kelas/${classSession.id}`}>
                  <Eye className="mr-1 h-3 w-3" />
                  Detail
                </Link>
              </Button>
              {classSession.zoomLink && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(classSession.zoomLink!, "_blank")}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Join Zoom
                </Button>
              )}
            </div>

            {canManage && (
              <div className="flex gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(classSession.id)}
                  disabled={deletingId === classSession.id}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  {deletingId === classSession.id ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
