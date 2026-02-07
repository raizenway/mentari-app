"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassSessionList } from "./class-session-list";
import { AddSessionDialog } from "./add-session-dialog";
import type { ClassSessionFormData } from "@/lib/validations/class-session";

export default function SesiKelasPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingInitialValues, setEditingInitialValues] = useState<ClassSessionFormData | null>(null);

  const canManage = session?.user?.role === "ADMIN" || session?.user?.role === "PENGAJAR";

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/class-sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/class-sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEditingInitialValues({
          title: data.title,
          description: data.description ?? "",
          scheduledAt: data.scheduledAt,
          zoomLink: data.zoomLink ?? "",
          zoomMeetingId: data.zoomMeetingId ?? "",
          zoomPasscode: data.zoomPasscode ?? "",
        });
        setEditingSessionId(id);
        setDialogOpen(true);
      }
    } catch (err) {
      console.error("Error fetching session for edit:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-black">
        <div>
          <h1 className="text-2xl font-bold text-hitam">Sesi Kelas</h1>
          <p className="text-muted-foreground">
            Kelola jadwal sesi kelas dan link Zoom meeting
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)} className="bg-amber-300 hover:bg-amber-400">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sesi
          </Button>
        )}
      </div>

      <ClassSessionList 
        sessions={sessions} 
        loading={loading} 
        onRefresh={fetchSessions}
        canManage={canManage}
        currentUserId={session?.user?.id}
        onEdit={handleEdit}
      />

      <AddSessionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingSessionId(null);
            setEditingInitialValues(null);
          }
        }}
        onSuccess={() => {
          setDialogOpen(false);
          setEditingSessionId(null);
          setEditingInitialValues(null);
          fetchSessions();
        }}
        mode={editingSessionId ? "edit" : "create"}
        sessionId={editingSessionId ?? undefined}
        initialValues={editingInitialValues}
      />
    </div>
  );
}
