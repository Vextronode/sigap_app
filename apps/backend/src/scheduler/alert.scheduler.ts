import { EarthquakeService } from "../services/earthquake.service.js";
import { DecisionEngineService } from "../services/decisionEngine.service.js";
import { AlertService } from "../services/alert.service.js";
import { BmkgService } from "../services/bmkg.service.js";
import { NotificationService } from "../services/notification.service.js";

/**
 * Jalankan satu siklus pengecekan alert BMKG.
 *
 * Fungsi ini bisa dipanggil:
 * - Dari `startAlertScheduler()` via `setInterval` (dev lokal)
 * - Dari endpoint POST /api/v1/public/internal/run-scheduler via cron-job.org (Vercel/production)
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

/**
 * Polling BMKG setiap interval tertentu (untuk dev lokal).
 * Di production (Vercel), scheduler tidak dijalankan otomatis —
 * gunakan cron-job.org untuk hit POST /api/v1/public/internal/run-scheduler.
 */
export function startAlertScheduler(interval = 60_000) {
    console.log(
        `[AlertScheduler] Started. Polling BMKG every ${interval / 1000} seconds.`
    );

    const execute = async () => {
        try {
            await runAlertCheck();
        } catch (error) {
            console.error("[AlertScheduler] Error:", error);
        }
    };

    // Jalankan sekali saat server pertama kali hidup
    execute();

    // Jalankan berkala
    setInterval(execute, interval);
}
