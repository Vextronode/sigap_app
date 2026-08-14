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

    /**
     * Ringkasan status koneksi sistem / perangkat IoT
     */
    static async getSystemStatus() {
        const devices = await prisma.device.findMany();

        if (devices.length === 0) {
            return {
                status: "UNAVAILABLE",
                tone: "neutral",
                label: "Koneksi Alat Tidak Tersedia",
                description: "Belum ada perangkat terdaftar",
                totalDevices: 0,
                activeDevices: 0,
                lastSeen: null,
            };
        }

        const THREE_MINUTES_MS = 3 * 60 * 1000;
        const now = Date.now();

        const activeDevices = devices.filter((device) => {
            if (device.status !== "ONLINE" || !device.lastSeen) return false;
            const diff = now - new Date(device.lastSeen).getTime();
            return diff <= THREE_MINUTES_MS;
        });

        const isOnline = activeDevices.length > 0;
        const latestSeenDate = devices.reduce<Date | null>((latest, device) => {
            if (!device.lastSeen) return latest;
            const d = new Date(device.lastSeen);
            return !latest || d > latest ? d : latest;
        }, null);

        return {
            status: isOnline ? "ONLINE" : "OFFLINE",
            tone: isOnline ? "safe" : "danger",
            label: isOnline ? "Alat Terhubung" : "Koneksi Alat Terputus",
            description: isOnline
                ? `${activeDevices.length}/${devices.length} perangkat aktif`
                : "Tidak ada perangkat terhubung",
            totalDevices: devices.length,
            activeDevices: activeDevices.length,
            lastSeen: latestSeenDate ? latestSeenDate.toISOString() : null,
        };
    }
}