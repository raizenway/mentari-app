"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Video,
  Users,
  User,
  Sun,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    role: UserRole;
  };
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SISWA", "PENGAJAR", "ADMIN"],
  },
  {
    name: "Bank Soal",
    href: "/bank-soal",
    icon: FileText,
    roles: ["SISWA", "PENGAJAR", "ADMIN"],
  },
  {
    name: "Sesi Kelas",
    href: "/sesi-kelas",
    icon: Video,
    roles: ["SISWA", "PENGAJAR", "ADMIN"],
  },
  {
    name: "Presensi Saya",
    href: "/presensi",
    icon: ClipboardCheck,
    roles: ["SISWA"],
  },
  {
    name: "Kelola Pengguna",
    href: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    name: "Profil",
    href: "/profile",
    icon: User,
    roles: ["SISWA", "PENGAJAR", "ADMIN"],
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#489ddd] px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 overflow-hidden">
              <Image src="/logo-mentari.png" alt="Mentari" width={40} height={40} className="object-cover" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">MENTARI</span>
              <p className="text-xs text-white/80">Mentor Anak Negeri</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {filteredNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all",
                        isActive
                          ? "bg-yellow-300 text-blue-950"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info */}
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-white/70 capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
