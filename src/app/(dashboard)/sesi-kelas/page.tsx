"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassSessionList } from "./class-session-list";
import { AddSessionDialog } from "./add-session-dialog";

export default function SesiKelasPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesi Kelas</h1>
          <p className="text-muted-foreground">
            Kelola jadwal sesi kelas dan link Zoom meeting
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
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
      />

      <AddSessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          fetchSessions();
        }}
      />
    </div>
  );
}
