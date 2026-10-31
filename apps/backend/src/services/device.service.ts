import { prisma } from "../config/prisma.js";

let cachedDeviceStatus: { data: any; expiresAt: number } | null = null;
const DEVICE_STATUS_CACHE_TTL_MS = 30_000;

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
        cachedDeviceStatus = null; // Invalidate cache
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
        cachedDeviceStatus = null; // Invalidate cache
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
     * Ringkasan status koneksi sistem / perangkat IoT dengan in-memory cache 30 detik
     */
    static async getSystemStatus() {
        const nowMs = Date.now();
        if (cachedDeviceStatus && cachedDeviceStatus.expiresAt > nowMs) {
            return cachedDeviceStatus.data;
        }

        const devices = await prisma.device.findMany();

        if (devices.length === 0) {
            const result = {
                status: "OFFLINE",
                tone: "danger",
                label: "Koneksi Alat Terputus",
                description: "Tidak ada perangkat terhubung",
                totalDevices: 0,
                activeDevices: 0,
                lastSeen: null,
            };
            cachedDeviceStatus = { data: result, expiresAt: nowMs + DEVICE_STATUS_CACHE_TTL_MS };
            return result;
        }

        // Threshold: jika lastSeen > 20 detik, device dianggap offline.
        // ESP32 mengirim heartbeat setiap 10 detik, jadi 20 detik = 2 heartbeat
        // berturut-turut gagal masuk → langsung ditandai tidak terhubung.
        const OFFLINE_THRESHOLD_MS = 20 * 1000;
        const now = Date.now();

        const activeDevices = devices.filter((device) => {
            if (device.status !== "ONLINE" || !device.lastSeen) return false;
            const diff = now - new Date(device.lastSeen).getTime();
            return diff <= OFFLINE_THRESHOLD_MS;
        });

        const isOnline = activeDevices.length > 0;
        const latestSeenDate = devices.reduce<Date | null>((latest, device) => {
            if (!device.lastSeen) return latest;
            const d = new Date(device.lastSeen);
            return !latest || d > latest ? d : latest;
        }, null);

        const result = {
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

        cachedDeviceStatus = { data: result, expiresAt: nowMs + DEVICE_STATUS_CACHE_TTL_MS };
        return result;
    }
}