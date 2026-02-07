"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddScheduleDialog } from "./add-schedule-dialog";
import { EditScheduleDialog } from "./edit-schedule-dialog";
import { ScheduleCard } from "./schedule-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
}

interface ScheduleListProps {
  schedules: Schedule[];
  isAdmin: boolean;
  initialTab?: string;
}

export function ScheduleList({ schedules, isAdmin, initialTab }: ScheduleListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState(initialTab || "all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Separate upcoming and past schedules
  const now = new Date();
  const upcoming = schedules.filter((s) => new Date(s.scheduledAt) >= now);
  const past = schedules.filter((s) => new Date(s.scheduledAt) < now);

  // Filter by search
  const filterSchedules = (list: Schedule[]) => {
    return list.filter((s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
    );
  };

  // Get schedules to display based on tab
  const getDisplaySchedules = () => {
    switch (tab) {
      case "upcoming":
        return filterSchedules(upcoming);
      case "past":
        return filterSchedules(past);
      default:
        return filterSchedules(schedules);
    }
  };

  const displaySchedules = getDisplaySchedules();

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/schedules/${deletingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menghapus jadwal");
      }

      toast({
        title: "Berhasil",
        description: "Jadwal berhasil dihapus",
      });

      setDeletingId(null);
      router.refresh();
    } catch (error) {
      console.error("Delete schedule error:", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header with search and add button */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari jadwal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {isAdmin && <AddScheduleDialog />}
        </div>

        {/* Tabs and grid */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              Semua Jadwal ({schedules.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Mendatang ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Berlalu ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            {displaySchedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {search ? "Tidak ada jadwal yang cocok dengan pencarian" : "Belum ada jadwal"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displaySchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    {...schedule}
                    isAdmin={isAdmin}
                    onEdit={(id) => setEditingId(id)}
                    onDelete={(id) => setDeletingId(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      {editingId && (
        <EditScheduleDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          scheduleId={editingId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jadwal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
