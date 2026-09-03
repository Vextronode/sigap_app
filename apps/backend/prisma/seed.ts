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