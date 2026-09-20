import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

const PERMISSIONS = [
  { code: "content.manage", description: "Mengelola pengumuman, kontak darurat, titik & jalur evakuasi" },
  { code: "alert.validate", description: "Validasi alert yang masuk" },
  { code: "device.view", description: "Melihat data lengkap perangkat IoT" },
  { code: "device.manage", description: "Mengelola perangkat IoT" },
  { code: "siren.view", description: "Melihat riwayat aksi sirine" },
  { code: "siren.trigger", description: "Memicu sirine remote (reserved, belum ada route aktif)" },
  { code: "user.manage", description: "Mengelola akun & role pengguna" },
];

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  admin: ["content.manage", "alert.validate", "device.view", "device.manage", "siren.view", "user.manage"],
  operator: ["alert.validate", "device.view", "siren.view", "siren.trigger"],
};

async function main() {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    });
  }

  for (const [roleName, permissionCodes] of Object.entries(ROLE_PERMISSION_MAP)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    for (const code of permissionCodes) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { code } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const placeholderEmail = "admin@cibenda.desa.id";
  const placeholderPassword = "ChangeMe123!";
  const hashedPassword = await bcrypt.hash(placeholderPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: placeholderEmail },
    update: {},
    create: {
      name: "Admin Placeholder",
      email: placeholderEmail,
      password: hashedPassword,
    },
  });

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "admin" } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  // Alert (baseline demo)
  const existingAlertCount = await prisma.alert.count();
  if (existingAlertCount === 0) {
    await prisma.alert.create({
      data: {
        level: "GREEN",
        source: "system",
        description: "Kondisi lingkungan normal, tidak ada potensi bahaya terdeteksi.",
      },
    });
    console.log("Baseline alert (GREEN) ditambahkan.");
  } else {
    console.log(`Alert sudah ada (${existingAlertCount} entri), skip seeding baseline.`);
  }

  // kontak darurat inti desa cibenda
  const coreContacts = [
    { institution: "Ambulans / PSC 119 Pangandaran", phoneNumber: "119" },
    { institution: "Pemadam Kebakaran (Damkar) Pangandaran", phoneNumber: "0265-639113" },
    { institution: "Kepolisian (Polsek Parigi)", phoneNumber: "0265-639110" },
    { institution: "Puskesmas Parigi", phoneNumber: "0265-639345" },
    { institution: "BPBD Kabupaten Pangandaran", phoneNumber: "0265-639733" },
    { institution: "Kantor Pemerintah Desa Cibenda", phoneNumber: "0812-2345-6789" },
  ];

  for (const contact of coreContacts) {
    const existing = await prisma.emergencyContact.findFirst({
      where: { institution: contact.institution },
    });

    if (!existing) {
      await prisma.emergencyContact.create({
        data: {
          institution: contact.institution,
          phoneNumber: contact.phoneNumber,
          isCore: true,
        },
      });
    }
  }

  // panduan kesiapsiagaan awal desa cibenda
  const baselineGuides = [
    {
      title: "Panduan Mitigasi Gempa Bumi Megathrust",
      content: "Tetap tenang saat guncangan terjadi. Lindungi kepala dengan berlindung di bawah meja yang kokoh. Jauhi jendela kaca dan tiang listrik. Segera evakuasi ke titik kumpul aman di Balai Desa Cibenda setelah gempa reda.",
      externalUrl: null,
      sourceType: "RESMI" as const,
    },
    {
      title: "Buku Saku Tanggap Bencana BNPB",
      content: null,
      externalUrl: "https://bnpb.go.id/buku-saku-tanggap-bencana",
      sourceType: "MITRA" as const,
    },
  ];

  for (const guide of baselineGuides) {
    const existing = await prisma.preparednessGuide.findFirst({
      where: { title: guide.title },
    });

    if (!existing) {
      await prisma.preparednessGuide.create({
        data: guide,
      });
    }
  }

  // 6. Seeding record gempa Pangandaran dengan Shakemap BMKG
  await prisma.earthquakeRecord.upsert({
    where: { eventTime: "2026-08-20T14:31:33.000Z" },
    update: {
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    create: {
      eventTime: "2026-08-20T14:31:33.000Z",
      magnitude: 4.2,
      depth: "17 km",
      location: "Pusat gempa berada di laut 80 km Barat Daya Kab. Pangandaran",
      latitude: -8.09,
      longitude: 107.88,
      distanceToVillage: 88,
      felt: "III Pangandaran, III Kalapanunggal, III Ciamis, III Pameungpeuk",
      potential: "",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
  });

  console.log("EarthquakeRecord baseline Pangandaran berhasil diinisialisasi.");

  // 7. Seeding 3 Titik Evakuasi Strategis Desa Cibenda & Sekitarnya
  const strategicEvacuationPoints = [
    {
      name: "Kantor Pemerintahan Desa Cibenda",
      address: "Jl. Raya Cijulang, Desa Cibenda, Kec. Parigi, Kab. Pangandaran",
      latitude: -7.6789572,
      longitude: 108.549459,
      elevation: 12,
      capacity: 500,
      description: "Titik kumpul evakuasi gempa bumi dengan area terbuka (lapangan desa). Cocok untuk evakuasi darurat non-tsunami karena dekat dengan posko aparat desa.",
      facilities: ["Air Bersih", "Listrik/Genset", "Akses Ambulans", "Posko Informasi"],
      isCore: true,
    },
    {
      name: "Titik Evakuasi Dataran Tinggi Citumang",
      address: "Kompleks Wisata Citumang, Desa Bojong, Kec. Parigi (Akses via Jl. Cintaratu)",
      latitude: -7.659273,
      longitude: 108.5496681,
      elevation: 38,
      capacity: 1200,
      description: "Titik Evakuasi Vertikal Mandiri Alami. Berada di area pelataran parkir atas dan perbukitan Citumang dengan elevasi aman (> 35 mdpl) bebas dari jangkauan gelombang tsunami (inundasi). Rute evakuasi dari Parigi/Cibenda melalui Jl. Raya Cijulang lalu ke utara via Jl. Cintaratu.",
      facilities: ["Air Bersih", "Dataran Tinggi Anti-Tsunami", "Tenda Darurat", "Dapur Umum"],
      isCore: true,
    },
    {
      name: "Gedung Evakuasi Vertikal (TES) PUPR & BNPB",
      address: "Kawasan Pesisir Pangandaran, Kab. Pangandaran",
      latitude: -7.6913299,
      longitude: 108.6453014,
      elevation: 22,
      capacity: 3000,
      description: "Gedung shelter vertikal Tempat Evakuasi Sementara (TES) bertingkat konstruksi tahan gempa megathrust dan gelombang tsunami yang dibangun resmi oleh Kementerian PUPR dan BNPB Pangandaran.",
      facilities: ["Konstruksi Tahan Gempa", "Rooftop Anti-Tsunami", "Tenaga Medis", "Genset Darurat", "Air Bersih", "Sistem Sirine Tsunami"],
      isCore: true,
    },
  ];

  for (const point of strategicEvacuationPoints) {
    const existing = await prisma.evacuationPoint.findFirst({
      where: { name: point.name },
    });

    if (!existing) {
      await prisma.evacuationPoint.create({
        data: point,
      });
      console.log(`Titik evakuasi "${point.name}" berhasil di-seed.`);
    } else {
      await prisma.evacuationPoint.update({
        where: { id: existing.id },
        data: point,
      });
      console.log(`Titik evakuasi "${point.name}" diperbarui.`);
    }
  }

  console.log("Seed selesai.");


  console.log(`Placeholder admin -> email: ${placeholderEmail} | password: ${placeholderPassword}`);
  console.log("WAJIB diganti sebelum deployment.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });