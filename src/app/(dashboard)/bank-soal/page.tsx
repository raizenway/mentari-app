import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BankSoalList from "./bank-soal-list";
import CategoryList from "./category-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddCategoryDialog from "./add-category-dialog";

export default async function BankSoalPage({ searchParams }: { searchParams?: Promise<{ categoryId?: string; tab?: string }> }) {
  const session = await auth();
  const user = session!.user;
  const canManage = user.role === "PENGAJAR" || user.role === "ADMIN";
  
  // Await searchParams in Next.js 15
  const params = await searchParams;
  const selectedCategoryId = params?.categoryId ?? null;
  const selectedTab = params?.tab ?? null;

  const [categories, bankSoals] = await Promise.all([
    prisma.bankSoalCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { bankSoals: true } },
      },
    }),
    prisma.bankSoal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        uploadedBy: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hitam">Bank Soal</h1>
          <p className="text-gray-600">
            {canManage
              ? "Kelola dan upload file bank soal"
              : "Akses materi pembelajaran"}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <AddCategoryDialog />
            <Link href="/bank-soal/add" className=""> 
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Plus className="mr-2 h-4 w-4" />
                Upload Bank Soal
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Tabs defaultValue={selectedTab ?? "files"} className="w-full">
        <TabsList>
          <TabsTrigger value="files">Semua File</TabsTrigger>
          {/* <TabsTrigger value="categories">Kategori</TabsTrigger> */}
        </TabsList>

        <TabsContent value="files" className="mt-6">
          <BankSoalList
            bankSoals={bankSoals}
            categories={categories}
            canManage={canManage}
            canDownload={user.role === "ADMIN"}
            initialCategory={selectedCategoryId}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryList categories={categories} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
