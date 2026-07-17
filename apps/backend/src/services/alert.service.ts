import { prisma } from "../config/prisma.js";
import { AlertLevel } from "../../generated/prisma/enums.js";

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
     * Mengambil alert terbaru
     */
    static async getCurrentAlert() {
        return prisma.alert.findFirst({
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * Mengambil seluruh riwayat alert
     */
    static async getAllAlerts() {
        return prisma.alert.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    }
}