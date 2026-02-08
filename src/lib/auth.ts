import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
    isActive: boolean;
    fullName?: string | null;
    shortName?: string | null;
    class_?: string | null;
    gender?: "LAKI_LAKI" | "PEREMPUAN" | null;
    domicile?: string | null;
    ages?: number | null;
    asalSekolah?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      fullName?: string | null;
      shortName?: string | null;
      class_?: string | null;
      gender?: "LAKI_LAKI" | "PEREMPUAN" | null;
      domicile?: string | null;
      ages?: number | null;
      asalSekolah?: string | null;
      role: UserRole;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    fullName?: string | null;
    shortName?: string | null;
    class_?: string | null;
    gender?: "LAKI_LAKI" | "PEREMPUAN" | null;
    domicile?: string | null;
    ages?: number | null;
    asalSekolah?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Email tidak ditemukan");
        }

        if (!user.isActive) {
          throw new Error("Akun Anda telah dinonaktifkan");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          fullName: user.fullName,
          shortName: user.shortName,
          class_: user.class_,
          gender: user.gender,
          domicile: user.domicile,
          ages: user.ages,
          asalSekolah: user.asalSekolah,
          role: user.role,
          image: user.profileImage,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        // Store additional user fields in token
        token.fullName = user.fullName;
        token.shortName = user.shortName;
        token.class_ = user.class_;
        token.gender = user.gender;
        token.domicile = user.domicile;
        token.ages = user.ages;
        token.asalSekolah = user.asalSekolah;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        // Add additional user fields to session
        session.user.fullName = token.fullName;
        session.user.shortName = token.shortName;
        session.user.class_ = token.class_;
        session.user.gender = token.gender;
        session.user.domicile = token.domicile;
        session.user.ages = token.ages;
        session.user.asalSekolah = token.asalSekolah;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
