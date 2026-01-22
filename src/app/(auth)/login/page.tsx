import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "./login-form";
import Image from "next/image";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-yellow-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo dan Judul */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg">
            <Image src="/logo-mentari.png" alt="Mentari" width={200} height={200} className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MENTARI</h1>
          <p className="text-gray-600 mt-1">Mentor Anak Negeri</p>
        </div>

        {/* Form Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Masuk ke Akun Anda
          </h2>
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 Mentari. All rights reserved.
        </p>
      </div>
    </div>
  );
}
