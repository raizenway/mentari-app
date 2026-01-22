import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch (err) {
    // if auth throws (e.g., misconfig), redirect to login
    console.error('Auth error:', err);
    redirect('/login');
  }

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={session.user} />
      <div className="lg:pl-64">
        <Header user={session.user} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
