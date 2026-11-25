import { prisma } from "../config/prisma.js";

// cari perangkat berdasarkan deviceCode
export async function findByDeviceCode(deviceCode: string) {
  return prisma.device.findUnique({
    where: { deviceCode },
  });
}

// ambil seluruh perangkat berurutan dari yang terdaftar paling awal
export async function findAll() {
  return prisma.device.findMany({
    orderBy: { createdAt: "asc" },
  });
}

// buat perangkat baru dalam keadaan ONLINE
export async function create(data: { deviceCode: string; name: string; lastSeen: Date }) {
  return prisma.device.create({
    data: {
      deviceCode: data.deviceCode,
      name: data.name,
      status: "ONLINE",
      lastSeen: data.lastSeen,
    },
  });
}

// tandai perangkat ONLINE dengan waktu terakhir melapor
export async function markSeen(deviceCode: string, lastSeen: Date) {
  return prisma.device.update({
    where: { deviceCode },
    data: { status: "ONLINE", lastSeen },
  });
}
