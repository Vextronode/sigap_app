import { prisma } from "../config/prisma.js";
import { AlertLevel } from "../../generated/prisma/enums.js";

const ALERT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 jam (1 hari)

export class AlertService {
    /**
     * Menyimpan alert baru ke database
     */
    static async saveAlert(
        level: AlertLevel,
        source: string,
        description?: string
    ) {
        return prisma.alert.create({
            data: {
                level,
                source,
                description,
            },
        });
    }

    /**
     * Mengambil alert terbaru. Jika alert di DB berusia > 24 jam (1 hari),
     * status dianggap expired dan kembali ke status AMAN (GREEN).
     */
    static async getCurrentAlert() {
        const latest = await prisma.alert.findFirst({
            orderBy: {
                updatedAt: "desc",
            },
        });

        if (!latest) return null;

        // Cek umur alert. Jika > 24 jam (1 hari), status alert otomatis kadaluarsa & kembali ke GREEN
        const ageMs = Date.now() - new Date(latest.updatedAt).getTime();
        if (ageMs > ALERT_MAX_AGE_MS && latest.level !== AlertLevel.GREEN) {
            return {
                ...latest,
                level: AlertLevel.GREEN,
                source: "BMKG",
                description: "Tidak terdapat peringatan resmi BMKG.",
            };
        }

        return latest;
    }

    /**
     * Mengambil seluruh riwayat alert
     */
    static async getAllAlerts() {
        return prisma.alert.findMany({
            orderBy: {
                updatedAt: "desc",
            },
        });
    }
}
