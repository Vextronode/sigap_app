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

  // 6. Seeding 10 record gempa Pangandaran dengan Shakemap BMKG
  const pangandaranEarthquakes = [
    {
      eventTime: "2026-08-20T14:31:33.000Z",
      magnitude: 4.2,
      depth: "17 km",
      location: "Pusat gempa berada di laut 80 km Barat Daya Kab. Pangandaran",
      latitude: -8.09,
      longitude: 107.88,
      distanceToVillage: 88,
      felt: "III Pangandaran, III Kalapanunggal, III Ciamis, III Pameungpeuk",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-03T08:14:10.000Z",
      magnitude: 3.8,
      depth: "21 km",
      location: "Pusat gempa berada di laut 64 km Barat Daya Kab. Pangandaran",
      latitude: -7.95,
      longitude: 108.35,
      distanceToVillage: 68,
      felt: "II Pangandaran, II Parigi",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-06T04:22:05.000Z",
      magnitude: 3.5,
      depth: "19 km",
      location: "Pusat gempa berada di laut 42 km Tenggara Kab. Pangandaran",
      latitude: -7.88,
      longitude: 108.72,
      distanceToVillage: 45,
      felt: "II-III Cijulang, II Parigi",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-08T21:18:44.000Z",
      magnitude: 4.0,
      depth: "25 km",
      location: "Pusat gempa berada di laut 55 km Selatan Kab. Pangandaran",
      latitude: -8.15,
      longitude: 108.52,
      distanceToVillage: 58,
      felt: "III Pangandaran, II Kalipucang",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-11T12:05:12.000Z",
      magnitude: 3.1,
      depth: "10 km",
      location: "Pusat gempa berada di darat 12 km Timur Laut Kab. Pangandaran",
      latitude: -7.62,
      longitude: 108.68,
      distanceToVillage: 22,
      felt: "II Kalipucang, II Padaherang",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-13T19:40:15.000Z",
      magnitude: 2.9,
      depth: "8 km",
      location: "Pusat gempa berada di darat 8 km Barat Daya Parigi Pangandaran",
      latitude: -7.72,
      longitude: 108.48,
      distanceToVillage: 14,
      felt: "I-II Cibenda",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-16T07:55:02.000Z",
      magnitude: 4.5,
      depth: "30 km",
      location: "Pusat gempa berada di laut 92 km Barat Daya Kab. Pangandaran",
      latitude: -8.18,
      longitude: 107.82,
      distanceToVillage: 95,
      felt: "III Pangandaran, III Parigi, II Ciamis",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-17T15:11:38.000Z",
      magnitude: 3.3,
      depth: "16 km",
      location: "Pusat gempa berada di laut 32 km Selatan Parigi Pangandaran",
      latitude: -7.98,
      longitude: 108.52,
      distanceToVillage: 36,
      felt: "II Parigi, II Cijulang",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-18T09:30:19.000Z",
      magnitude: 3.7,
      depth: "22 km",
      location: "Pusat gempa berada di laut 58 km Barat Daya Kab. Pangandaran",
      latitude: -8.02,
      longitude: 108.28,
      distanceToVillage: 62,
      felt: "II-III Pangandaran, II Cipatujah",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260820213133.mmi.jpg",
    },
    {
      eventTime: "2026-09-19T00:40:22.000Z",
      magnitude: 2.6,
      depth: "7 km",
      location: "Pusat gempa berada di darat 6 km Tenggara Kota Tasikmalaya",
      latitude: -7.33,
      longitude: 108.25,
      distanceToVillage: 52,
      felt: "III Tasikmalaya, III Ciamis",
      potential: "Tidak berpotensi tsunami",
      shakemap: "https://data.bmkg.go.id/DataMKG/TEWS/20260919074022.mmi.jpg",
    },
  ];

  for (const eq of pangandaranEarthquakes) {
    await prisma.earthquakeRecord.upsert({
      where: { eventTime: eq.eventTime },
      update: {
        shakemap: eq.shakemap,
        location: eq.location,
        magnitude: eq.magnitude,
      },
      create: eq,
    });
  }

  console.log("10 EarthquakeRecord Pangandaran berhasil diinisialisasi.");

  // Seeding 10 baseline alert kejadian gempa Pangandaran untuk verifikasi admin
  const baselineEarthquakeAlerts = [
    {
      level: "ORANGE" as const,
      source: "BMKG",
      description: "Gempa M4.2 dirasakan di wilayah Pangandaran (intensitas III MMI). Harap waspada potensi gempa susulan dan pantau jalur evakuasi.",
      reviewStatus: "DIKONFIRMASI" as const,
      reviewedBy: adminUser.id,
      reviewedAt: new Date("2026-08-20T15:00:00.000Z"),
      createdAt: new Date("2026-08-20T14:31:33.000Z"),
      updatedAt: new Date("2026-08-20T15:00:00.000Z"),
    },
    {
      level: "YELLOW" as const,
      source: "BMKG",
      description: "Gempa M3.8 terdeteksi di laut 64 km Barat Daya Kab. Pangandaran. Getaran dirasakan warga di wilayah pesisir Parigi.",
      reviewStatus: "DITINDAKLANJUTI" as const,
      reviewedBy: adminUser.id,
      reviewedAt: new Date("2026-09-03T08:30:00.000Z"),
      createdAt: new Date("2026-09-03T08:14:10.000Z"),
      updatedAt: new Date("2026-09-03T08:30:00.000Z"),
    },
    {
      level: "YELLOW" as const,
      source: "BMKG",
      description: "Gempa M3.5 terdeteksi di laut 42 km Tenggara Kab. Pangandaran, kedalaman 19 km.",
      reviewStatus: "DIKONFIRMASI" as const,
      reviewedBy: adminUser.id,
      reviewedAt: new Date("2026-09-06T05:00:00.000Z"),
      createdAt: new Date("2026-09-06T04:22:05.000Z"),
      updatedAt: new Date("2026-09-06T05:00:00.000Z"),
    },
    {
      level: "ORANGE" as const,
      source: "BMKG",
      description: "Gempa M4.0 dirasakan di wilayah pesisir selatan Kab. Pangandaran skala III MMI.",
      reviewStatus: "DITINDAKLANJUTI" as const,
      reviewedBy: adminUser.id,
      reviewedAt: new Date("2026-09-08T22:00:00.000Z"),
      createdAt: new Date("2026-09-08T21:18:44.000Z"),
      updatedAt: new Date("2026-09-08T22:00:00.000Z"),
    },
    {
      level: "YELLOW" as const,
      source: "BMKG",
      description: "Gempa M3.1 terdeteksi di darat 12 km Timur Laut Kab. Pangandaran, getaran dangkal 10 km.",
      reviewStatus: "BELUM_DITINJAU" as const,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date("2026-09-11T12:05:12.000Z"),
      updatedAt: new Date("2026-09-11T12:05:12.000Z"),
    },
    {
      level: "YELLOW" as const,
      source: "BMKG",
      description: "Gempa M2.9 terdeteksi di darat 8 km Barat Daya Parigi Pangandaran. Belum terverifikasi warga (False Alarm / Getaran Mikro).",
      reviewStatus: "DITOLAK" as const,
      reviewedBy: adminUser.id,
      reviewedAt: new Date("2026-09-13T20:15:00.000Z"),
      createdAt: new Date("2026-09-13T19:40:15.000Z"),
      updatedAt: new Date("2026-09-13T20:15:00.000Z"),
    },
    {
      level: "ORANGE" as const,
      source: "BMKG",
      description: "Gempa M4.5 dirasakan di Pangandaran dan Parigi skala III MMI. Posko siaga telah diaktifkan.",
      reviewStatus: "DIKONFIRMASI" as const,
      reviewedBy: adminUser.id,
      reviewedAt: new Date("2026-09-16T08:30:00.000Z"),
      createdAt: new Date("2026-09-16T07:55:02.000Z"),
      updatedAt: new Date("2026-09-16T08:30:00.000Z"),
    },
    {
      level: "YELLOW" as const,
      source: "BMKG",
      description: "Gempa M3.3 terdeteksi di laut 32 km Selatan Parigi Pangandaran dalam radius pantau.",
      reviewStatus: "BELUM_DITINJAU" as const,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date("2026-09-17T15:11:38.000Z"),
      updatedAt: new Date("2026-09-17T15:11:38.000Z"),
    },
    {
      level: "YELLOW" as const,
      source: "BMKG",
      description: "Gempa M3.7 terdeteksi di laut 58 km Barat Daya Kab. Pangandaran, getaran dirasakan di pesisir.",
      reviewStatus: "DIKONFIRMASI" as const,
      reviewedBy: adminUser.id,
      reviewedAt: new Date("2026-09-18T10:00:00.000Z"),
      createdAt: new Date("2026-09-18T09:30:19.000Z"),
      updatedAt: new Date("2026-09-18T10:00:00.000Z"),
    },
    {
      level: "YELLOW" as const,
      source: "BMKG",
      description: "Gempa M2.6 terdeteksi dalam radius pemantauan Desa Cibenda, namun belum ada laporan dirasakan warga. Tetap pantau informasi resmi BMKG.",
      reviewStatus: "BELUM_DITINJAU" as const,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date("2026-09-19T04:07:19.803Z"),
      updatedAt: new Date("2026-09-19T04:07:19.803Z"),
    },
  ];

  for (const alertData of baselineEarthquakeAlerts) {
    const existing = await prisma.alert.findFirst({
      where: {
        description: alertData.description,
      },
    });

    if (!existing) {
      await prisma.alert.create({
        data: alertData,
      });
      console.log(`Alert baseline (${alertData.level} - ${alertData.description.slice(0, 25)}...) berhasil ditambahkan.`);
    }
  }

  // 7. Seeding Titik Evakuasi Strategis Desa Cibenda & Sekitarnya (Sesuai Peta Resmi)
  const strategicEvacuationPoints = [
    {
      name: "SDN 1 Cibenda (Titik Kumpul Utama)",
      address: "Jl. Raya Parigi - Cijulang (Lintas Selatan), Desa Cibenda, Kec. Parigi, Kab. Pangandaran",
      latitude: -7.67812,
      longitude: 108.54483,
      elevation: 14,
      capacity: 800,
      description:
        "Sekolah ini terletak tepat di pinggir jalan raya utama akses Lintas Selatan Jawa Barat wilayah Parigi. Menjadi titik kumpul dan pusat edukasi/simulasi penyelamatan mandiri warga di sekitar zona pemukiman awal sebelum diarahkan lebih lanjut.",
      facilities: ["Area Terbuka", "Air Bersih", "Akses Jalan Utama", "Posko Darurat"],
      isCore: true,
    },
    {
      name: "Kantor Desa Cibenda / Pusat Informasi Posyandu",
      address: "Jl. Raya Cijulang, Desa Cibenda, Kec. Parigi, Kab. Pangandaran",
      latitude: -7.6747,
      longitude: 108.5544,
      elevation: 16,
      capacity: 500,
      description:
        "Area pusat administrasi tempat peta kerentanan dipasang, posisinya berada sedikit masuk ke utara (daratan tinggi). Lokasi ini menjadi titik pusat penyebaran informasi di mana Peta Kerentanan Tsunami Desa Cibenda resmi dipasang dan diresmikan bagi warga. Warga diimbau berkumpul atau merujuk ke pos ini untuk melihat peta visual zonasi bahaya terdekat.",
      facilities: ["Air Bersih", "Listrik/Genset", "Akses Ambulans", "Posko Informasi"],
      isCore: true,
    },
    {
      name: "Dusun Parapat (Zona Dataran Tinggi)",
      address: "Area Perbukitan Utara, Jalur Evakuasi Paralel Desa Cibenda - Bojong, Kec. Parigi",
      latitude: -7.6495,
      longitude: 108.5482,
      elevation: 36,
      capacity: 1200,
      description:
        "Warga yang berada di kawasan pesisir (seperti RT/RW 04/07 Dusun Parapat) diarahkan melalui jalur evakuasi paralel ke arah utara menjauhi Samudra Hindia, menuju titik kumpul darurat di perbatasan Desa Bojong atau Desa Cintaratu yang memiliki topografi lebih tinggi dan aman dari jangkauan gelombang tsunami.",
      facilities: ["Dataran Tinggi Anti-Tsunami", "Air Bersih", "Tenda Darurat", "Posko Darurat"],
      isCore: true,
    },
    {
      name: "Gedung Evakuasi Vertikal (TES) PUPR & BNPB",
      address: "Kawasan Pesisir Pangandaran, Kab. Pangandaran",
      latitude: -7.6913299,
      longitude: 108.6453014,
      elevation: 22,
      capacity: 3000,
      description:
        "Gedung shelter vertikal Tempat Evakuasi Sementara (TES) bertingkat konstruksi tahan gempa megathrust dan gelombang tsunami yang dibangun resmi oleh Kementerian PUPR dan BNPB Pangandaran.",
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