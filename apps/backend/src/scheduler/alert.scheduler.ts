import { EarthquakeService } from "../services/earthquake.service.js";
import { DecisionEngineService } from "../services/decisionEngine.service.js";
import { AlertService } from "../services/alert.service.js";
import { decideAlertAction } from "../services/alertSequence.service.js";
import { BmkgService } from "../services/bmkg.service.js";
import {
    NotificationService,
    findDeterminingEarthquake,
    toNotifiableAlert,
} from "../services/notification.service.js";
import type { AlertRecord, DecisionResult, TsunamiStatusInfo } from "../types/alert.types.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";
import { markCycleFinished, markCycleStarted } from "./schedulerStatus.js";

/** Id alert yang notifikasinya sudah diproses tetapi belum tersimpan ke database. */
const UNSAVED_ALERT_ID = "unsaved";

/**
 * Alert terakhir yang gagal disimpan. Dipakai sebagai pembanding aturan rentetan
 * selama lebih baru dari alert di database, agar notifikasinya tidak terkirim
 * ulang setiap siklus, lalu disimpan ulang tanpa notifikasi pada siklus berikutnya
 * (ADR-047). Dikosongkan setelah alert berhasil disimpan.
 */
let unsavedAlert: AlertRecord | null = null;

/** Mengosongkan alert yang belum tersimpan di memori (dipakai tes). */
export function resetUnsavedAlert(): void {
    unsavedAlert = null;
}

const toUnsavedAlert = (
    result: DecisionResult,
    referenceMagnitude: number | null,
    createdAt: Date = new Date()
): AlertRecord => {
    const sequence = result.sequence;
    const eventTime = sequence?.eventTime ?? result.sourceEventTime;
    return {
        id: UNSAVED_ALERT_ID,
        level: result.level,
        source: result.source,
        description: result.description,
        reviewStatus: "Belum Diverifikasi",
        reviewedBy: null,
        reviewedAt: null,
        eventTime: eventTime ? new Date(eventTime) : null,
        referenceMagnitude: sequence ? referenceMagnitude : null,
        episodeStartedAt: sequence ? new Date(sequence.startedAt) : null,
        episodeEventCount: sequence?.eventCount ?? null,
        episodeMaxMagnitude: sequence?.maxMagnitude ?? null,
        createdAt,
        updatedAt: new Date(),
    };
};

/**
 * Notifikasi kembali aman: dikirim sekali saat tidak ada ancaman aktif, data BMKG
 * terbaca, dan notifikasi terakhir berlevel SIAGA atau AWAS (ADR-047).
 */
async function sendAllClearIfDue(tsunami: TsunamiStatusInfo): Promise<void> {
    try {
        if (tsunami.status === "UNKNOWN") return;
        if (!(await EarthquakeService.isLiveDataAvailable())) return;
        if (!(await NotificationService.isAllClearDue())) return;
        const dispatchResult = await NotificationService.dispatch(
            NotificationService.buildAllClearNotification()
        );
        console.log(
            `[AlertScheduler] Notifikasi kembali aman terkirim ke ${dispatchResult.sent}/${dispatchResult.total} subscriber, gagal: ${dispatchResult.failed}`
        );
    } catch (error) {
        console.error("[AlertScheduler] Notifikasi kembali aman gagal:", error);
    }
}

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
export interface AlertCheckResult {
    level: string;
    source: string;
    description: string | undefined;
    saved: boolean;
    extended?: boolean;
    /** false bila alert gagal disimpan atau diperpanjang. */
    ok: boolean;
}

export async function runAlertCheck(): Promise<AlertCheckResult> {
    markCycleStarted();
    try {
        const result = await runCycle();
        markCycleFinished(result.ok, {
            level: result.level,
            saved: result.saved,
            extended: result.extended,
        });
        return result;
    } catch (error) {
        markCycleFinished(false);
        throw error;
    }
}

async function runCycle(): Promise<AlertCheckResult> {
    // Seluruh gempa relevan untuk Desa Cibenda yang masih aktif (24 jam),
    // BUKAN gempa nasional terbaru — lihat catatan di decisionEngine.service.ts.
    let earthquakes: EarthquakeInfo[] = [];
    let tsunami: TsunamiStatusInfo;

    try {
        earthquakes = await EarthquakeService.getActiveEvents();
    } catch (eqError) {
        console.warn(
            "[AlertScheduler] Gagal mengambil data gempa aktif:",
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
        // Status tidak dapat ditentukan, bukan dinyatakan normal (ADR-043).
        tsunami = {
            status: "UNKNOWN" as const,
            source: "SIGAP",
            description: "Status tsunami sedang tidak dapat ditentukan.",
            updatedAt: null,
        };
    }

    // Jalankan Decision Engine
    const result = DecisionEngineService.evaluate({ earthquakes, tsunami });

    // Jika hasil evaluasi adalah GREEN (Aman / tidak ada ancaman aktif),
    // jangan simpan ke riwayat alert verifikasi. Alert verifikasi khusus mencatat
    // kejadian darurat nyata (WASPADA, SIAGA, AWAS) untuk ditinjau admin.
    if (result.level === "GREEN") {
        await sendAllClearIfDue(tsunami);
        return { ...result, saved: false, ok: true };
    }

    // Simpan, perpanjang, atau lewati sesuai aturan rentetan gempa (ADR-046).
    // Hasil tanpa rentetan (status tsunami) memakai aturan duplikat sebelumnya,
    // termasuk pengingat harian status tsunami resmi (ADR-045).
    let latestAlert = null;
    try {
        latestAlert = await AlertService.getLatestRecord();
    } catch (dbError) {
        console.warn(
            "[AlertScheduler] Gagal membaca alert terakhir:",
            dbError instanceof Error ? dbError.message : dbError
        );
    }
    // Alert yang gagal disimpan menjadi pembanding selama lebih baru dari alert di database.
    const reference =
        unsavedAlert && (!latestAlert || unsavedAlert.createdAt > latestAlert.createdAt)
            ? unsavedAlert
            : latestAlert;
    const pending = reference !== null && reference === unsavedAlert ? unsavedAlert : null;
    const action = decideAlertAction(result, reference);

    if (action.type === "skip" && !pending) {
        console.log(`[AlertScheduler] Skipped duplicate alert (${result.level})`);
        return { ...result, saved: false, ok: true };
    }

    if (action.type === "extend" && !pending && latestAlert && result.sequence) {
        let extendedOk = true;
        try {
            await AlertService.extendSequence(
                latestAlert.id,
                result.description,
                result.sequence,
                action.referenceMagnitude
            );
            console.log(`[AlertScheduler] Alert diperpanjang (${result.level}) - ${result.description}`);
        } catch (dbError) {
            extendedOk = false;
            console.warn(
                "[AlertScheduler] Gagal memperpanjang alert:",
                dbError instanceof Error ? dbError.message : dbError
            );
        }
        return { ...result, saved: false, extended: extendedOk, ok: extendedOk };
    }

    // Simpan ke database jika DB tersedia. Alert yang belum tersimpan dari siklus
    // sebelumnya disimpan ulang di sini tanpa notifikasi.
    const notify = action.type === "save" && action.notify;
    const referenceMagnitude =
        action.type === "skip" ? (pending?.referenceMagnitude ?? null) : action.referenceMagnitude;
    let saved: Awaited<ReturnType<typeof AlertService.saveAlert>> | null = null;
    try {
        saved = await AlertService.saveAlert(
            result.level,
            result.source,
            result.description,
            result.sequence ? { details: result.sequence, referenceMagnitude } : undefined,
            result.sourceEventTime
        );
        unsavedAlert = null;
        console.log(`[AlertScheduler] Alert saved (${result.level}) - ${result.description}`);
    } catch (dbError) {
        // Alert baru menggantikan pembanding; perpanjangan mempertahankan waktu awalnya;
        // alert yang tidak berubah dibiarkan.
        if (action.type === "save") {
            unsavedAlert = toUnsavedAlert(result, referenceMagnitude);
        } else if (action.type === "extend" && pending) {
            unsavedAlert = toUnsavedAlert(result, referenceMagnitude, pending.createdAt);
        }
        console.warn(
            `[AlertScheduler] Gagal menyimpan alert ke database (kuota/koneksi). Pemrosesan notifikasi tetap dilanjutkan:`,
            dbError instanceof Error ? dbError.message : dbError
        );
    }

    // Kirim push notification otomatis bila aturan rentetan mengizinkan.
    // Penurunan level gempa tidak dikirim (ADR-046). shouldNotify() menjamin GREEN
    // tidak dikirim, hanya YELLOW/ORANGE/RED (Waspada/Siaga/Awas). Isi notifikasi
    // dibangun dari alert yang baru disimpan, atau dari hasil evaluasi bila gagal
    // disimpan (alertId kosong).
    if (notify && NotificationService.shouldNotify(result.level)) {
        try {
            const alert = toNotifiableAlert(
                saved ?? { ...toUnsavedAlert(result, referenceMagnitude), id: null, level: result.level }
            );
            const notification = NotificationService.buildNotification(
                alert,
                findDeterminingEarthquake(alert, earthquakes)
            );
            const dispatchResult = await NotificationService.dispatch(notification);
            console.log(
                `[AlertScheduler] Push notification sent — ${dispatchResult.sent}/${dispatchResult.total} subscribers, failed: ${dispatchResult.failed}`
            );
        } catch (notifError) {
            // Gagal kirim notifikasi tidak boleh membatalkan penyimpanan alert.
            // Log saja, scheduler tetap jalan normal di siklus berikutnya.
            console.error("[AlertScheduler] Push notification dispatch failed:", notifError);
        }
    }

    return { ...result, saved: saved !== null, ok: saved !== null };
}

const HEARTBEAT_TIMEOUT_MS = 5_000;
const STOP_WAIT_MS = 3_000;

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
                `[AlertScheduler] Siklus selesai: level=${result.level} saved=${result.saved} ok=${result.ok} durasi=${Date.now() - startedAt}ms`
            );
            // Heartbeat hanya untuk siklus sukses, agar kegagalan terlihat dari luar server.
            if (!result.ok) return;
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
    // (maks STOP_WAIT_MS) supaya koneksi DB tidak ditutup di tengah penyimpanan
    // alert/notifikasi, tanpa menahan shutdown bila BMKG sedang lambat.
    return async () => {
        clearInterval(timer);
        if (currentCycle) {
            console.log(`[AlertScheduler] Menunggu siklus yang sedang berjalan (maks ${STOP_WAIT_MS} ms)...`);
            let waitTimer: NodeJS.Timeout | undefined;
            const finished = await Promise.race([
                currentCycle.then(() => true),
                new Promise<boolean>((resolve) => {
                    waitTimer = setTimeout(() => resolve(false), STOP_WAIT_MS);
                }),
            ]);
            clearTimeout(waitTimer);
            if (!finished) {
                console.warn(`[AlertScheduler] Siklus belum selesai setelah ${STOP_WAIT_MS} ms; shutdown dilanjutkan.`);
            }
        }
        console.log("[AlertScheduler] Stopped.");
    };
}
