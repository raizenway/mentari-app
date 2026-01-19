# MENTARI - Mentor Anak Negeri

Platform pembelajaran online untuk mentoring dan bimbingan belajar.

## 🌟 Fitur

### Untuk Siswa
- 📚 Akses Bank Soal (PDF)
- 📹 Join Sesi Kelas via Zoom
- ✅ Isi Presensi Online
- 👤 Kelola Profil & Ubah Password

### Untuk Pengajar
- 📤 Upload & Kelola Bank Soal
- 📅 Buat & Kelola Sesi Kelas
- 📊 Lihat Daftar Presensi Siswa

### Untuk Admin
- 👥 Kelola Semua Pengguna
- 📂 Kelola Kategori Bank Soal
- 🔐 Reset Password Pengguna

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui style
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **File Storage**: Cloudinary
- **Forms**: React Hook Form + Zod

## 📦 Instalasi

### Prerequisites
- Node.js 18+
- PostgreSQL database (atau akun Supabase)
- Akun Cloudinary

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` dengan kredensial Anda:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret"
   AUTH_SECRET="your-auth-secret"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"
   ```

3. **Setup database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

5. **Buka browser**: http://localhost:3000

## 🔐 Akun Test

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mentari.id | Admin123! |
| Pengajar | pengajar@mentari.id | Pengajar123! |
| Siswa | siswa@mentari.id | Siswa123! |

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Build for production
npm run db:push      # Push schema to database
npm run db:seed      # Seed initial data
npm run db:studio    # Open Prisma Studio
```

## 📄 License

MIT License

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
