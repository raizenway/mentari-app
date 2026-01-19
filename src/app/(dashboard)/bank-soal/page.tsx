import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BankSoalList from "./bank-soal-list";
import CategoryList from "./category-list";
import AddBankSoalDialog from "./add-bank-soal-dialog";
import AddCategoryDialog from "./add-category-dialog";

export default async function BankSoalPage() {
  const session = await auth();
  const user = session!.user;
  const canManage = user.role === "PENGAJAR" || user.role === "ADMIN";

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
          <h1 className="text-2xl font-bold text-gray-900">Bank Soal</h1>
          <p className="text-gray-600">
            {canManage
              ? "Kelola dan upload file bank soal"
              : "Akses materi pembelajaran"}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <AddCategoryDialog />
            <AddBankSoalDialog categories={categories} />
          </div>
        )}
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files">Semua File</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-6">
          <BankSoalList
            bankSoals={bankSoals}
            canManage={canManage}
            canDownload={user.role === "ADMIN"}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryList categories={categories} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
