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
    const earthquake = await EarthquakeService.getPangandaran();
    const tsunami = await BmkgService.getTsunamiStatus();

    // Jalankan Decision Engine
    const result = DecisionEngineService.evaluate({ earthquake, tsunami });

    const latestAlert = await AlertService.getCurrentAlert();
    const isDuplicate =
        latestAlert?.level === result.level &&
        latestAlert?.source === result.source &&
        latestAlert?.description === result.description;

    if (isDuplicate) {
        console.log(`[AlertScheduler] Skipped duplicate alert (${result.level})`);
        return { ...result, saved: false };
    }

    // Simpan ke database
    await AlertService.saveAlert(result.level, result.source, result.description);
    console.log(`[AlertScheduler] Alert saved (${result.level}) - ${result.description}`);

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

    return { ...result, saved: true };
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
