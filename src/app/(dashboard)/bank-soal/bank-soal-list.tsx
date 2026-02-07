"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Folder,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateShort } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BankSoal {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  };
  uploadedBy: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    bankSoals: number;
  };
}

interface BankSoalListProps {
  bankSoals: BankSoal[];
  categories: Category[];
  canManage: boolean;
  canDownload: boolean;
  initialCategory?: string | null;
}

export default function BankSoalList({
  bankSoals,
  categories,
  canManage,
  canDownload,
  initialCategory = null,
}: BankSoalListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Keep selectedCategory in sync if initialCategory changes (e.g. via query param)
  useEffect(() => {
    setSelectedCategory(initialCategory ?? null);
  }, [initialCategory]);

  const filteredBankSoals = bankSoals.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      !selectedCategory || item.category.id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus file ini?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/bank-soal/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Failed to delete");

      toast({
        title: "Berhasil",
        description: "File bank soal telah dihapus",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus file",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
          <Input
            placeholder="Cari bank soal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-black"
          />
        </div>
        <div className="sm:w-64">
          <Select
            value={selectedCategory ?? "all"}
            onValueChange={(value) =>
              setSelectedCategory(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* File List */}
      {filteredBankSoals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {search
                ? "Tidak ada file yang cocok dengan pencarian"
                : "Belum ada file bank soal"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBankSoals.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        <Link href={`/bank-soal/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs text-gray-600">
                          <Folder className="h-3 w-3 mr-1" />
                          {item.category.name}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {item.uploadedBy.name} • {formatDateShort(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4 text-biru" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white text-black">
                      <DropdownMenuItem asChild>
                        <Link href={`/bank-soal/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4 " />
                          Lihat File
                        </Link>
                      </DropdownMenuItem>
                      {canDownload && (
                        <DropdownMenuItem asChild>
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </DropdownMenuItem>
                      )}
                      {canManage && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
