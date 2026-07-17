import { prisma } from "../config/prisma.js";

export class DeviceService {
    /**
     * Mencari device berdasarkan deviceCode
     */
    static async getByDeviceCode(deviceCode: string) {
        return prisma.device.findUnique({
            where: {
                deviceCode,
            },
        });
    }

    /**
     * Registrasi device jika belum ada
     */
    static async register(deviceCode: string, name: string) {
        const existingDevice = await prisma.device.findUnique({
            where: {
                deviceCode,
            },
        });

        if (existingDevice) {
            return existingDevice;
        }

        return prisma.device.create({
            data: {
                deviceCode,
                name,
                status: "ONLINE",
                lastSeen: new Date(),
            },
        });
    }

    /**
     * Heartbeat dari ESP32
     * Update waktu terakhir aktif
     */
    static async heartbeat(deviceCode: string) {
        return prisma.device.update({
            where: {
                deviceCode,
            },
            data: {
                status: "ONLINE",
                lastSeen: new Date(),
            },
        });
    }

    /**
     * Mengambil seluruh device
     */
    static async getAll() {
        return prisma.device.findMany({
            orderBy: {
                createdAt: "asc",
            },
        });
    }
}