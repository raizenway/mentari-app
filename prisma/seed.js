const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mentari.id' },
    update: {},
    create: {
      email: 'admin@mentari.id',
      name: 'Administrator',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  const pengajarPassword = await bcrypt.hash('Pengajar123!', 10);
  const pengajar = await prisma.user.upsert({
    where: { email: 'pengajar@mentari.id' },
    update: {},
    create: {
      email: 'pengajar@mentari.id',
      name: 'Budi Santoso',
      password: pengajarPassword,
      role: UserRole.PENGAJAR,
      isActive: true,
    },
  });
  console.log('✅ Pengajar user created:', pengajar.email);

  const siswaPassword = await bcrypt.hash('Siswa123!', 10);
  const siswa = await prisma.user.upsert({
    where: { email: 'siswa@mentari.id' },
    update: {},
    create: {
      email: 'siswa@mentari.id',
      name: 'Andi Pratama',
      password: siswaPassword,
      role: UserRole.SISWA,
      isActive: true,
    },
  });
  console.log('✅ Siswa user created:', siswa.email);

  const categories = [
    { name: 'Matematika', description: 'Soal-soal matematika untuk berbagai tingkat' },
    { name: 'Bahasa Indonesia', description: 'Latihan bahasa Indonesia' },
    { name: 'Bahasa Inggris', description: 'Latihan bahasa Inggris' },
    { name: 'IPA', description: 'Ilmu Pengetahuan Alam' },
    { name: 'IPS', description: 'Ilmu Pengetahuan Sosial' },
  ];

  for (const cat of categories) {
    await prisma.bankSoalCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  await prisma.classSession.upsert({
    where: { id: 'sample-session-1' },
    update: {},
    create: {
      id: 'sample-session-1',
      title: 'Pembahasan Soal Matematika Dasar',
      description: 'Sesi pembahasan soal-soal matematika dasar untuk persiapan ujian',
      scheduledAt: tomorrow,
      zoomLink: 'https://zoom.us/j/1234567890',
      zoomMeetingId: '123 456 7890',
      zoomPasscode: 'mentari',
      createdById: pengajar.id,
    },
  });
  console.log('✅ Sample class session created');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📝 Test Accounts:');
  console.log('Admin: admin@mentari.id / Admin123!');
  console.log('Pengajar: pengajar@mentari.id / Pengajar123!');
  console.log('Siswa: siswa@mentari.id / Siswa123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });