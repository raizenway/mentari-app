"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, UserX, UserCheck } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import EditUserDialog from "./edit-user-dialog";
import type { UserRole } from "@prisma/client";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  profileImage: string | null;
}

interface UsersTableProps {
  users: User[];
}

const roleColors: Record<UserRole, string> = {
  SISWA: "bg-blue-100 text-blue-700",
  PENGAJAR: "bg-purple-100 text-purple-700",
  ADMIN: "bg-amber-100 text-amber-700",
};

export default function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setLoading(userId);
    try {
      const res = await fetch(`/api/users/${userId}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user status");
      }

      toast({
        title: "Berhasil",
        description: `Pengguna telah ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}`,
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah status pengguna",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-white ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3 text-black">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || undefined} />
                      <AvatarFallback className="bg-amber-100 text-amber-700">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.phone && (
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <Badge className={roleColors[user.role]}>
                    {user.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge variant="success">Aktif</Badge>
                  ) : (
                    <Badge variant="danger">Nonaktif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-gray-500">
                  {formatDateShort(user.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4 text-black" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => setEditUser(user)} className="text-black">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profil
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        disabled={loading === user.id}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="mr-2 h-4 w-4 text-red-500" />
                            <p className="text-red-500">Nonaktifkan</p>
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                            <p className="text-green-500">Aktifkan</p>
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onClose={() => setEditUser(null)}
        />
      )}
    </>
  );
}
