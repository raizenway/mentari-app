import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentari - Mentor Anak Negeri",
  description: "Platform bimbingan belajar untuk membantu siswa dan pengajar dalam mengelola bank soal dan kelas",
};

import Providers from "./providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch server session and pass it down to the client SessionProvider
  let session = null;
  try {
    // `auth` returns the current session on the server
    const { auth } = await import("@/lib/auth");
    session = await auth();
  } catch (err) {
    // ignore and let client revalidate
    console.error("Error loading session on server:", err);
  }

  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers session={session}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
