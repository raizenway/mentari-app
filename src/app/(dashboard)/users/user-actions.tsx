"use client";

import AddUserDialog from "./add-user-dialog";
import { ImportUsersDialog } from "./import-users-dialog";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserActions() {
  return (
    <div className="flex gap-2 text-black">
      <ImportUsersDialog>
        <Button variant="outline" className="gap-2 hover:bg-gray-200">
          <FileSpreadsheet className="h-4 w-4" />
          Import dari Excel
        </Button>
      </ImportUsersDialog>
      <AddUserDialog />
    </div>
  );
}
