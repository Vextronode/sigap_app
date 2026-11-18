import { EarthquakeService } from "../services/earthquake.service.js";
import { DecisionEngineService } from "../services/decisionEngine.service.js";
import { AlertService, alertActiveUntil } from "../services/alert.service.js";
import { decideAlertAction } from "../services/alertSequence.service.js";
import { BmkgService } from "../services/bmkg.service.js";
import {
    NotificationService,
    findDeterminingEarthquake,
    toNotifiableAlert,
} from "../services/notification.service.js";
import { SidIntegrationService } from "../services/sidIntegration.service.js";
import { buildSidExternalId, mapToSidAlertInput, sidTypeOf } from "../services/sidPayloadMapper.js";
import type { AlertRecord, DecisionResult, TsunamiStatusInfo } from "../types/alert.types.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";
import type { NotifiableAlert, OutgoingNotification } from "../types/notification.types.js";
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
 * Kondisi aman terkonfirmasi: status tsunami terbaca dan data gempa BMKG tersedia.
 * Hasil GREEN karena data gagal diambil tidak dianggap aman (ADR-043).
 */
async function isSafeConditionConfirmed(tsunami: TsunamiStatusInfo): Promise<boolean> {
    if (tsunami.status === "UNKNOWN") return false;
    try {
        return await EarthquakeService.isLiveDataAvailable();
    } catch {
        return false;
    }
}

/**
 * Notifikasi kembali aman: dikirim sekali saat kondisi aman terkonfirmasi dan
 * notifikasi terakhir berlevel SIAGA atau AWAS (ADR-047).
 */
async function sendAllClearIfDue(): Promise<void> {
    try {
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
 * Mengirim atau memperbarui peringatan di SIDUTama secara aman dan terisolasi.
 * Mengikuti spesifikasi integrasi:
 * - external_id stabil berbasis kejadian (gempa-<episodeStartedAt> / tsunami-<eventTime>).
 * - Judul dan pesan sama persis dengan notifikasi push SIGAP.
 * - Kegagalan pengiriman tidak menghentikan scheduler atau push notification SIGAP.
 */
function publishToSid(
    alert: NotifiableAlert,
    notification: OutgoingNotification,
    determiningEarthquake: EarthquakeInfo | null,
    options?: {
        episodeStartedAt?: Date | string | null;
        eventTime?: Date | string | null;
    }
): void {
    if (!SidIntegrationService.isConfigured()) {
        return;
    }

    try {
        const sidType = sidTypeOf(alert.source);

        const timeValue =
            sidType === "gempa"
                ? (options?.episodeStartedAt ?? alert.updatedAt)
                : (options?.eventTime ?? alert.updatedAt);

        const externalId = buildSidExternalId(sidType, timeValue);

        const sidPayload = mapToSidAlertInput({
            alert: {
                ...alert,
                episodeStartedAt: options?.episodeStartedAt ? new Date(options.episodeStartedAt) : null,
                eventTime: options?.eventTime ? new Date(options.eventTime) : null,
            },
            notification,
            determiningEarthquake,
            externalId,
            publicBaseUrl: process.env.SIGAP_PUBLIC_BASE_URL,
        });

        if (!sidPayload) {
            console.warn(
                `[AlertScheduler] Peringatan SID (${externalId}) tidak dikirim karena masa aktif telah lewat.`
            );
            return;
        }

        SidIntegrationService.enqueueAlert(externalId, sidPayload);
    } catch (sidError) {
        console.error(
            "[AlertScheduler] Gagal mengirim peringatan ke SID:",
            sidError instanceof Error ? sidError.message : sidError
        );
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

/** Ditolak karena siklus lain (scheduler internal atau pemicu manual) masih berjalan. */
export class CycleInProgressError extends Error {
    constructor() {
        super("Siklus scheduler lain sedang berjalan.");
        this.name = "CycleInProgressError";
    }
}

/**
 * Kunci siklus di memori proses: hanya satu siklus berjalan dalam satu waktu, agar
 * pemicu manual dan scheduler internal tidak menyimpan alert atau mengirim push ganda.
 * Cukup di memori karena backend berjalan satu replika.
 */
let cycleInProgress = false;

export async function runAlertCheck(): Promise<AlertCheckResult> {
    if (cycleInProgress) throw new CycleInProgressError();
    cycleInProgress = true;
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
    } finally {
        cycleInProgress = false;
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
        if (await isSafeConditionConfirmed(tsunami)) {
            await sendAllClearIfDue();
            // /end bersifat final di SID, jadi hanya dikirim saat aman terkonfirmasi.
            // Setiap external_id keluar dari daftar aktif setelah diantrekan, sehingga
            // siklus GREEN berikutnya tidak mengirim /end ulang.
            SidIntegrationService.endAllActiveAlerts();
        }
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

        // Perbarui masa aktif dan data peringatan di SID (PUT /alerts/{external_id})
        const alertForSid: NotifiableAlert = {
            id: latestAlert.id,
            level: result.level,
            source: result.source,
            description: result.description,
            // Masa aktif bergeser mengikuti gempa terbaru pada rentetan (ADR-046).
            activeUntil: alertActiveUntil({
                source: result.source,
                eventTime: new Date(result.sequence.eventTime),
                createdAt: latestAlert.createdAt,
            }),
            updatedAt: new Date(),
        };
        const determiningEq = findDeterminingEarthquake(alertForSid, earthquakes);
        const notification = NotificationService.buildNotification(alertForSid, determiningEq);
        publishToSid(alertForSid, notification, determiningEq, {
            episodeStartedAt: latestAlert.episodeStartedAt ?? result.sequence.startedAt,
            eventTime: result.sequence.eventTime,
        });

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

    const alertRecord = saved ?? toUnsavedAlert(result, referenceMagnitude);
    const alert = toNotifiableAlert(
        saved ?? { ...alertRecord, id: null, level: result.level }
    );
    const determiningEq = findDeterminingEarthquake(alert, earthquakes);
    const notification = NotificationService.buildNotification(alert, determiningEq);

    // Kirim push notification otomatis bila aturan rentetan mengizinkan.
    // Penurunan level gempa tidak dikirim ke warga via push (ADR-046).
    if (notify && NotificationService.shouldNotify(result.level)) {
        try {
            const dispatchResult = await NotificationService.dispatch(notification);
            console.log(
                `[AlertScheduler] Push notification sent — ${dispatchResult.sent}/${dispatchResult.total} subscribers, failed: ${dispatchResult.failed}`
            );
        } catch (notifError) {
            console.error("[AlertScheduler] Push notification dispatch failed:", notifError);
        }
    }

    // Kirim atau perbarui peringatan ke SID (PUT /alerts/{external_id}):
    // Dipanggil untuk semua aksi save (level naik, alert baru, maupun level turun).
    // Memakai helper mandiri terpisah dari try push notification.
    if (action.type === "save") {
        publishToSid(alert, notification, determiningEq, {
            episodeStartedAt:
                alertRecord.episodeStartedAt ??
                (result.sequence ? new Date(result.sequence.startedAt) : null),
            eventTime: alertRecord.eventTime,
        });
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
            if (error instanceof CycleInProgressError) {
                console.log("[AlertScheduler] Siklus dari pemicu manual masih berjalan, dilewati");
                return;
            }
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
