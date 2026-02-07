import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddBankSoalForm from "../add-bank-soal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AddBankSoalPage() {
  const session = await auth();
  const user = session!.user;
  const canManage = user.role === "PENGAJAR" || user.role === "ADMIN";

  if (!canManage) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini</p>
      </div>
    );
  }

  const categories = await prisma.bankSoalCategory.findMany({ orderBy: { name: "asc" } });
  const r2Enabled = Boolean(process.env.R2_BUCKET_NAME);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hitam">Tambah Bank Soal</h1>
          <p className="text-muted-foreground">Upload file PDF untuk bahan latihan</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Upload</CardTitle>
        </CardHeader>
        <CardContent className="text-black">
          <AddBankSoalForm categories={categories} r2Enabled={r2Enabled} />
        </CardContent>
      </Card>
    </div>
  );
}
