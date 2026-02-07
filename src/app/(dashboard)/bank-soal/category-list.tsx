"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, MoreVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description: string | null;
  _count: {
    bankSoals: number;
  };
}

interface CategoryListProps {
  categories: Category[];
  canManage: boolean;
}

export default function CategoryList({
  categories,
  canManage,
}: CategoryListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string, count: number) => {
    if (count > 0) {
      toast({
        title: "Tidak dapat menghapus",
        description: `Kategori "${name}" masih memiliki ${count} file. Hapus semua file terlebih dahulu.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`))
      return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Failed to delete");

      toast({
        title: "Berhasil",
        description: "Kategori telah dihapus",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus kategori",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada kategori</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div
                className="flex items-start gap-3 flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/bank-soal?categoryId=${category.id}&tab=files`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") router.push(`/bank-soal?categoryId=${category.id}&tab=files`);
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Folder className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {category.description}
                    </p>
                  )}
                  <Badge variant="secondary" className="mt-2">
                    {category._count.bankSoals} file
                  </Badge>
                </div>
              </div>

              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        handleDelete(
                          category.id,
                          category.name,
                          category._count.bankSoals
                        )
                      }
                      disabled={deleting === category.id}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
