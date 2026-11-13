import { prisma } from "../config/prisma.js";

export class NotificationLogRepository {
  // level dan waktu notifikasi yang terakhir tercatat, atau null bila belum pernah ada
  static async findLatest() {
    const latest = await prisma.notificationLog.findFirst({
      orderBy: { createdAt: "desc" },
      select: { level: true, createdAt: true },
    });
    return latest ? { level: latest.level, sentAt: latest.createdAt } : null;
  }
}
