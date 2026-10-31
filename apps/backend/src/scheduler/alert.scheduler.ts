import { EarthquakeService } from "../services/earthquake.service.js";
import { DecisionEngineService } from "../services/decisionEngine.service.js";
import { AlertService } from "../services/alert.service.js";
import { BmkgService } from "../services/bmkg.service.js";
import { NotificationService } from "../services/notification.service.js";

/**
 * Jalankan satu siklus pengecekan alert BMKG.
 *
 * Fungsi ini bisa dipanggil:
 * - Dari `startAlertScheduler()` via `setInterval` (scheduler di dalam proses backend)
 * - Dari endpoint POST /api/public/internal/run-scheduler (pemicu manual/eksternal)
 *
 * Notifikasi push dikirim OTOMATIS saat ada alert baru yang bukan duplikat
 * dan levelnya bukan GREEN (Aman). Tidak ada validasi manual admin lagi.
 */
export async function runAlertCheck(): Promise<{
    level: string;
    source: string;
    description: string | undefined;
    saved: boolean;
}> {
    // Gempa yang relevan untuk Desa Cibenda (sudah difilter radius +
    // umur maksimum oleh EarthquakeService), BUKAN gempa nasional
    // terbaru — lihat catatan di decisionEngine.service.ts.
    let earthquake = null;
    let tsunami = null;

    try {
        earthquake = await EarthquakeService.getPangandaran();
    } catch (eqError) {
        console.warn(
            "[AlertScheduler] Gagal mengambil data gempa Pangandaran terkini:",
            eqError instanceof Error ? eqError.message : eqError
        );
    }

    try {
        tsunami = await BmkgService.getTsunamiStatus();
    } catch (tsunamiError) {
        console.warn(
            "[AlertScheduler] Gagal mengambil status tsunami BMKG:",
            tsunamiError instanceof Error ? tsunamiError.message : tsunamiError
        );
        tsunami = {
            status: "NORMAL" as const,
            source: "BMKG (Degraded Fallback)",
            description: "Tidak terdapat indikasi ancaman tsunami aktif yang terkonfirmasi.",
        };
    }

    // Jalankan Decision Engine
    const result = DecisionEngineService.evaluate({ earthquake, tsunami });

    // Jika hasil evaluasi adalah GREEN (Aman / tidak ada ancaman aktif),
    // jangan simpan ke riwayat alert verifikasi. Alert verifikasi khusus mencatat
    // kejadian darurat nyata (WASPADA, SIAGA, AWAS) untuk ditinjau admin.
    if (result.level === "GREEN") {
        return { ...result, saved: false };
    }

    const latestAlert = await AlertService.getCurrentAlert();
    const isDuplicate =
        latestAlert?.level === result.level &&
        latestAlert?.source === result.source &&
        latestAlert?.description === result.description;

    if (isDuplicate) {
        console.log(`[AlertScheduler] Skipped duplicate alert (${result.level})`);
        return { ...result, saved: false };
    }

    // Simpan ke database jika DB tersedia
    let isSaved = false;
    try {
        await AlertService.saveAlert(result.level, result.source, result.description);
        console.log(`[AlertScheduler] Alert saved (${result.level}) - ${result.description}`);
        isSaved = true;
    } catch (dbError) {
        console.warn(
            `[AlertScheduler] Gagal menyimpan alert ke database (kuota/koneksi). Pemrosesan notifikasi tetap dilanjutkan:`,
            dbError instanceof Error ? dbError.message : dbError
        );
    }

    // Kirim push notification otomatis jika level bukan GREEN.
    // shouldNotify() sudah menjamin GREEN tidak dikirim — warga tidak perlu
    // dinotif untuk kondisi aman, hanya YELLOW/ORANGE/RED (Waspada/Siaga/Awas).
    if (NotificationService.shouldNotify(result.level as never)) {
        try {
            const payload = await NotificationService.getLatestPayload();
            if (payload) {
                const dispatchResult = await NotificationService.dispatch(payload);
                console.log(
                    `[AlertScheduler] Push notification sent — ${dispatchResult.sent}/${dispatchResult.total} subscribers, failed: ${dispatchResult.failed}`
                );
            }
        } catch (notifError) {
            // Gagal kirim notifikasi tidak boleh membatalkan penyimpanan alert.
            // Log saja, scheduler tetap jalan normal di siklus berikutnya.
            console.error("[AlertScheduler] Push notification dispatch failed:", notifError);
        }
    }

    return { ...result, saved: isSaved };
}

const HEARTBEAT_TIMEOUT_MS = 5_000;

/**
 * Ping heartbeat (mis. healthchecks.io / Uptime Kuma push monitor) setelah siklus sukses.
 * URL biasanya memuat token, jadi tidak pernah ditulis ke log. Kegagalan hanya di-log.
 */
async function sendHeartbeat(url: string): Promise<void> {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(HEARTBEAT_TIMEOUT_MS) });
        if (!response.ok) {
            console.warn(`[AlertScheduler] Heartbeat gagal: HTTP ${response.status}`);
        }
    } catch (error) {
        // Hanya kode/nama error (mis. ECONNREFUSED, TimeoutError), tanpa URL.
        const cause = error instanceof Error
            ? (error.cause as { code?: string; errors?: { code?: string }[] } | undefined)
            : undefined;
        const reason =
            cause?.code ??
            cause?.errors?.[0]?.code ??
            (error instanceof Error ? error.name : "unknown error");
        console.warn(`[AlertScheduler] Heartbeat gagal: ${reason}`);
    }
}

export interface AlertSchedulerOptions {
    intervalMs?: number;
    heartbeatUrl?: string;
}

/**
 * Polling BMKG berkala di dalam proses backend (ENABLE_LOCAL_SCHEDULER=true).
 * Siklus juga bisa dipicu manual lewat POST /api/public/internal/run-scheduler.
 * Siklus baru dilewati bila siklus sebelumnya belum selesai (mis. BMKG lambat).
 */
export function startAlertScheduler({
    intervalMs = 60_000,
    heartbeatUrl,
}: AlertSchedulerOptions = {}): () => Promise<void> {
    console.log(
        `[AlertScheduler] Started. Polling BMKG every ${intervalMs / 1000} seconds.`
    );

    let currentCycle: Promise<void> | null = null;

    const execute = async () => {
        const startedAt = Date.now();
        try {
            const result = await runAlertCheck();
            console.log(
                `[AlertScheduler] Siklus selesai: level=${result.level} saved=${result.saved} durasi=${Date.now() - startedAt}ms`
            );
        } catch (error) {
            console.error("[AlertScheduler] Error:", error);
            return;
        }
        if (heartbeatUrl) {
            await sendHeartbeat(heartbeatUrl);
        }
    };

    const tick = () => {
        if (currentCycle) {
            console.log("[AlertScheduler] Siklus sebelumnya masih berjalan, dilewati");
            return;
        }
        currentCycle = execute().finally(() => {
            currentCycle = null;
        });
    };

    // Jalankan sekali saat server pertama kali hidup
    tick();

    // Jalankan berkala
    const timer = setInterval(tick, intervalMs);

    // DEPLOY-01 (FR-A5): hentikan interval, lalu tunggu siklus yang sedang berjalan
    // supaya koneksi DB tidak ditutup di tengah penyimpanan alert/notifikasi.
    return async () => {
        clearInterval(timer);
        if (currentCycle) {
            console.log("[AlertScheduler] Menunggu siklus yang sedang berjalan selesai...");
            await currentCycle;
        }
        console.log("[AlertScheduler] Stopped.");
    };
}
