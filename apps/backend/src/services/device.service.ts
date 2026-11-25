import * as DeviceRepository from "../repositories/device.repository.js";
import { NotFoundError } from "../errors/index.js";
import {
    DEVICE_LAST_SEEN_PERSIST_INTERVAL_MS,
    DEVICE_OFFLINE_THRESHOLD_MS,
} from "../config/deviceRules.js";
import type { Device } from "../../generated/prisma/client.js";

export type DeviceOverviewResult = {
    status: "ONLINE" | "OFFLINE";
    tone: "safe" | "danger";
    label: string;
    description: string;
    totalDevices: number;
    activeDevices: number;
    lastSeen: string | null;
};

/** Daftar perangkat dari database, di-cache 30 detik; status aktif dihitung tiap permintaan. */
let cachedDevices: { data: Device[]; expiresAt: number } | null = null;
const DEVICE_LIST_CACHE_TTL_MS = 30_000;

/**
 * Laporan terakhir tiap perangkat. `persistedAt` adalah waktu lastSeen terakhir ditulis
 * ke database; laporan di antaranya hanya memperbarui memori (ADR-052).
 */
const lastReports = new Map<string, { device: Device; persistedAt: number }>();

const NOT_REGISTERED_MESSAGE = "Perangkat belum terdaftar. Lakukan registrasi terlebih dahulu.";

const effectiveLastSeen = (device: Device): Date | null => {
    const reported = lastReports.get(device.deviceCode)?.device.lastSeen ?? null;
    const stored = device.lastSeen;
    if (!reported) return stored;
    if (!stored) return reported;
    return reported > stored ? reported : stored;
};

export class DeviceService {
    /**
     * Mencari device berdasarkan deviceCode
     */
    static async getByDeviceCode(deviceCode: string) {
        return DeviceRepository.findByDeviceCode(deviceCode);
    }

    /**
     * Registrasi device jika belum ada. Perangkat yang sudah terdaftar langsung
     * ditandai melapor; nama tidak ditimpa.
     */
    static async register(deviceCode: string, name: string) {
        const now = new Date();
        const existingDevice = await DeviceRepository.findByDeviceCode(deviceCode);
        const device = existingDevice
            ? await DeviceRepository.markSeen(deviceCode, now)
            : await DeviceRepository.create({ deviceCode, name, lastSeen: now });

        if (!existingDevice) cachedDevices = null;
        lastReports.set(deviceCode, { device, persistedAt: now.getTime() });
        return device;
    }

    /**
     * Mencatat bahwa perangkat melapor (heartbeat atau poll status). Waktu lapor
     * ditulis ke database paling sering sekali per DEVICE_LAST_SEEN_PERSIST_INTERVAL_MS.
     * NotFoundError bila deviceCode belum terdaftar.
     */
    static async recordSeen(deviceCode: string): Promise<Device> {
        const now = new Date();
        const report = lastReports.get(deviceCode);

        if (report && now.getTime() - report.persistedAt < DEVICE_LAST_SEEN_PERSIST_INTERVAL_MS) {
            report.device = { ...report.device, status: "ONLINE", lastSeen: now };
            return report.device;
        }

        const existingDevice = report?.device ?? (await DeviceRepository.findByDeviceCode(deviceCode));
        if (!existingDevice) throw new NotFoundError(NOT_REGISTERED_MESSAGE);

        const device = await DeviceRepository.markSeen(deviceCode, now);
        lastReports.set(deviceCode, { device, persistedAt: now.getTime() });
        return device;
    }

    /**
     * Heartbeat dari ESP32
     */
    static async heartbeat(deviceCode: string) {
        return this.recordSeen(deviceCode);
    }

    /**
     * Mengambil seluruh device
     */
    static async getAll() {
        return DeviceRepository.findAll();
    }

    /**
     * Ringkasan status koneksi perangkat IoT. Perangkat aktif bila melapor dalam
     * DEVICE_OFFLINE_THRESHOLD_MS terakhir, memakai waktu lapor di memori bila lebih baru.
     */
    static async getSystemStatus(): Promise<DeviceOverviewResult> {
        const nowMs = Date.now();
        if (!cachedDevices || cachedDevices.expiresAt <= nowMs) {
            cachedDevices = {
                data: await DeviceRepository.findAll(),
                expiresAt: nowMs + DEVICE_LIST_CACHE_TTL_MS,
            };
        }
        const devices = cachedDevices.data;

        const lastSeenDates = devices.map(effectiveLastSeen);
        const activeCount = lastSeenDates.filter(
            (lastSeen) => lastSeen !== null && nowMs - lastSeen.getTime() <= DEVICE_OFFLINE_THRESHOLD_MS
        ).length;
        const latestSeen = lastSeenDates.reduce<Date | null>(
            (latest, lastSeen) => (lastSeen && (!latest || lastSeen > latest) ? lastSeen : latest),
            null
        );
        const isOnline = activeCount > 0;

        return {
            status: isOnline ? "ONLINE" : "OFFLINE",
            tone: isOnline ? "safe" : "danger",
            label: isOnline ? "Alat Terhubung" : "Koneksi Alat Terputus",
            description: isOnline
                ? `${activeCount}/${devices.length} perangkat aktif`
                : "Tidak ada perangkat terhubung",
            totalDevices: devices.length,
            activeDevices: activeCount,
            lastSeen: latestSeen ? latestSeen.toISOString() : null,
        };
    }
}
