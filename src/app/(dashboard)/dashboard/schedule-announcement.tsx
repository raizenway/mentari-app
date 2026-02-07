"use client";

import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
}

interface ScheduleAnnouncementProps {
  schedules: Schedule[];
}

export function ScheduleAnnouncement({ schedules }: ScheduleAnnouncementProps) {
  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-biru p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-hitam">Jadwal Mendatang</h3>
          <Calendar className="h-5 w-5 text-biru" />
        </div>
        <div className="text-center py-6">
          <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">Tidak ada jadwal mendatang</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-biru p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-hitam">Jadwal Mendatang</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {schedules.length}
          </Badge>
          <Calendar className="h-5 w-5 text-biru" />
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {schedules.map((schedule) => (
          <Link
            key={schedule.id}
            href="/pengumuman"
            className="block group hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 border border-gray-200 rounded-lg group-hover:border-biru transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-hitam line-clamp-1 group-hover:text-biru transition-colors">
                    {schedule.title}
                  </h4>
                  {schedule.description && (
                    <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                      {schedule.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(schedule.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(schedule.scheduledAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {schedules.length > 0 && (
        <Link href="/pengumuman">
          <button className="w-full mt-3 text-sm text-biru hover:text-blue-600 font-medium">
            Lihat Semua Jadwal →
          </button>
        </Link>
      )}
    </div>
  );
}
