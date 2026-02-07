"use client";

import { Calendar, Clock, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatTime } from "@/lib/utils";

interface ScheduleCardProps {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  isAdmin: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScheduleCard({
  id,
  title,
  description,
  scheduledAt,
  isAdmin,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const isPast = new Date(scheduledAt) < new Date();

  return (
    <Card className="border-biru border-2 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-hitam line-clamp-1">{title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={isPast ? "secondary" : "default"} className={isPast ? "" : "bg-biru"}>
              {isPast ? "Berlalu" : "Mendatang"}
            </Badge>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatDate(scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{formatTime(scheduledAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
