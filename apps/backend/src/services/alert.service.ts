import { prisma } from "../config/prisma.js";
import { isSchedulerHealthy } from "../scheduler/schedulerStatus.js";
import { NotFoundError, ValidationError } from "../errors/AppError.js";
import { AlertLevel } from "../../generated/prisma/enums.js";
import {
  ALERT_ACTIVE_MAX_AGE_MS,
  ALERT_RULES,
  OFFICIAL_TSUNAMI_SOURCE,
} from "../config/alertRules.js";
import {
  AlertRepository,
  LABEL_TO_REVIEW_STATUS,
  LABEL_TO_SEVERITY,
  mapAlertToRecord,
  type AlertSequenceColumns,
} from "../repositories/alert.repository.js";
import type {
  AlertFilterQuery,
  AlertListPagination,
  AlertRecord,
  EarthquakeSequence,
  ReviewAlertPayload,
} from "../types/alert.types.js";

const PUBLIC_HISTORY_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari
const ALERT_CACHE_TTL_MS = 60_000; // 60 detik TTL in-memory cache (menghemat compute DB)

let cachedAlertState: { data: AlertRecord | null; expiresAt: number } | null = null;

/** Alert status tsunami resmi berlaku selama BMKG_TSUNAMI_STATUS sama dengan levelnya (ADR-045). */
const isOfficialStatusActive = (level: AlertLevel | string): boolean => {
  const configured = process.env.BMKG_TSUNAMI_STATUS?.toUpperCase();
  const tsunamiLevels: Record<string, string> = ALERT_RULES.tsunami;
  return configured !== undefined && tsunamiLevels[configured] === level;
};

/** Awal masa aktif: waktu kejadian gempa, atau waktu simpan untuk alert tanpa rentetan (ADR-046). */
export const alertActiveFrom = (alert: { eventTime?: Date | null; createdAt: Date }): Date =>
  new Date(alert.eventTime ?? alert.createdAt);

/**
 * Alert selain GREEN yang masih berlaku: status tsunami resmi mengikuti
 * BMKG_TSUNAMI_STATUS (ADR-045), alert lain berlaku 24 jam sejak awal masa aktif.
 */
export const isAlertRecordActive = (alert: {
  level: AlertLevel | string;
  source: string;
  eventTime?: Date | null;
  createdAt: Date;
}): boolean => {
  if (alert.level === AlertLevel.GREEN || alert.level === "UNKNOWN") return false;
  if (alert.source === OFFICIAL_TSUNAMI_SOURCE) return isOfficialStatusActive(alert.level);
  return Date.now() - alertActiveFrom(alert).getTime() <= ALERT_ACTIVE_MAX_AGE_MS;
};

const toSequenceColumns = (
  details: EarthquakeSequence,
  referenceMagnitude: number | null
): AlertSequenceColumns => ({
  eventTime: new Date(details.eventTime),
  referenceMagnitude,
  episodeStartedAt: new Date(details.startedAt),
  episodeEventCount: details.eventCount,
  episodeMaxMagnitude: details.maxMagnitude,
});

/** Alert tanpa rentetan gempa yang berlaku, mis. setelah alert berakhir. */
const WITHOUT_SEQUENCE = {
  eventTime: null,
  referenceMagnitude: null,
  episodeStartedAt: null,
  episodeEventCount: null,
  episodeMaxMagnitude: null,
  activeUntil: null,
} as const;

/** Id hasil evaluasi langsung dari BMKG yang tidak berasal dari tabel alerts. */
export const LIVE_FALLBACK_ALERT_ID = "live-fallback";

/** Alert saat database dan BMKG tidak dapat memberikan data (ADR-037). */
export const buildUnavailableAlert = (id: string): AlertRecord => {
  const now = new Date();
  return {
    id,
    level: "UNKNOWN",
    source: "SIGAP",
    description:
      "Data peringatan sedang tidak tersedia. Pantau informasi resmi BMKG di bmkg.go.id.",
    reviewStatus: "Belum Diverifikasi",
    reviewedBy: null,
    reviewedAt: null,
    createdAt: now,
    updatedAt: now,
  };
};

export class AlertService {
  /**
   * Menyimpan alert baru ke database, beserta rentetan gempa bila level berasal dari gempa,
   * atau waktu gempa asal bila level berasal dari estimasi tsunami.
   */
  static async saveAlert(
    level: AlertLevel,
    source: string,
    description?: string,
    sequence?: { details: EarthquakeSequence; referenceMagnitude: number | null },
    sourceEventTime?: string
  ) {
    const saved = await AlertRepository.create({
      level,
      source,
      description,
      sequence: sequence && toSequenceColumns(sequence.details, sequence.referenceMagnitude),
      eventTime: sourceEventTime ? new Date(sourceEventTime) : undefined,
    });
    cachedAlertState = null; // Invalidate cache setelah alert baru tersimpan
    return saved;
  }

  /**
   * Memperpanjang alert yang berlaku dengan kejadian terbaru pada rentetan yang sama,
   * tanpa alert baru dan tanpa notifikasi (ADR-046).
   */
  static async extendSequence(
    id: string,
    description: string,
    details: EarthquakeSequence,
    referenceMagnitude: number
  ): Promise<void> {
    await AlertRepository.extendSequence(
      id,
      description,
      toSequenceColumns(details, referenceMagnitude)
    );
    cachedAlertState = null;
  }

  /**
   * Level yang dihitung langsung dari data BMKG terkini, tanpa tabel alerts.
   * Melempar error bila data gempa BMKG tidak tersedia.
   */
  private static async evaluateLive(): Promise<AlertRecord> {
    const { EarthquakeService } = await import("./earthquake.service.js");
    const { BmkgService } = await import("./bmkg.service.js");
    const { DecisionEngineService } = await import("./decisionEngine.service.js");

    if (!(await EarthquakeService.isLiveDataAvailable())) {
      throw new Error("Data gempa BMKG tidak tersedia.");
    }

    const earthquakes = await EarthquakeService.getActiveEvents();
    const tsunami = await BmkgService.getTsunamiStatus();
    const liveEval = DecisionEngineService.evaluate({ earthquakes, tsunami });

    const now = new Date();
    const sequence = liveEval.sequence;
    return {
      id: LIVE_FALLBACK_ALERT_ID,
      level: liveEval.level as AlertLevel,
      source: liveEval.source || "BMKG",
      description:
        liveEval.description ||
        "Tidak terdapat indikasi ancaman gempa atau tsunami dari data terkini BMKG.",
      reviewStatus: "Belum Diverifikasi",
      reviewedBy: null,
      reviewedAt: null,
      ...(sequence
        ? {
            ...toSequenceColumns(sequence, null),
            activeUntil: new Date(new Date(sequence.eventTime).getTime() + ALERT_ACTIVE_MAX_AGE_MS),
          }
        : WITHOUT_SEQUENCE),
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Mengambil alert terbaru. Menggunakan in-memory cache (TTL 60 detik)
   * untuk meminimalisasi beban kuota compute basis data.
   */
  static async getCurrentAlert(): Promise<AlertRecord | null> {
    const nowMs = Date.now();
    if (cachedAlertState && cachedAlertState.expiresAt > nowMs) {
      return cachedAlertState.data;
    }

    let alertResult: AlertRecord;

    // Scheduler tidak sehat: level dihitung langsung dari BMKG agar banner tidak beku.
    // Bila BMKG juga gagal, tetap memakai tabel alerts di bawah (TK-04).
    if (!isSchedulerHealthy()) {
      try {
        alertResult = await this.evaluateLive();
        cachedAlertState = { data: alertResult, expiresAt: nowMs + ALERT_CACHE_TTL_MS };
        return alertResult;
      } catch (liveError) {
        console.warn(
          "[AlertService] Scheduler tidak sehat dan evaluasi langsung BMKG gagal, memakai tabel alerts:",
          liveError instanceof Error ? liveError.message : liveError
        );
      }
    }

    try {
      const latest = await prisma.alert.findFirst({
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (latest) {
        // Masa aktif dihitung dari waktu kejadian gempa (event_time), atau dari createdAt
        // untuk alert tanpa rentetan, BUKAN kapan admin klik verifikasi (updatedAt).
        // Alert gempa berakhir setelah > 24 jam (ADR-046). Alert status tsunami resmi
        // berakhir saat BMKG_TSUNAMI_STATUS berubah (ADR-045).
        // Status review adalah catatan pasca-kejadian dan tidak memengaruhi level (ADR-041).
        const isOfficial = latest.source === OFFICIAL_TSUNAMI_SOURCE;
        const mapped: AlertRecord = {
          ...mapAlertToRecord(latest),
          activeUntil: isOfficial
            ? null
            : new Date(alertActiveFrom(latest).getTime() + ALERT_ACTIVE_MAX_AGE_MS),
        };
        const isActive = isAlertRecordActive(latest);
        const isExpired = !isActive && latest.level !== AlertLevel.GREEN;

        // Tanpa alert aktif, GREEN hanya berlaku bila data BMKG terbaca (ADR-043).
        const { EarthquakeService } = await import("./earthquake.service.js");
        if (!isActive && !(await EarthquakeService.isLiveDataAvailable())) {
          alertResult = buildUnavailableAlert("data-unavailable");
        } else if (isExpired) {
          alertResult = {
            ...mapped,
            ...WITHOUT_SEQUENCE,
            level: AlertLevel.GREEN,
            source: "BMKG",
            description: "Tidak terdapat peringatan resmi BMKG.",
          };
        } else {
          alertResult = mapped;
        }

        cachedAlertState = {
          data: alertResult,
          expiresAt: nowMs + ALERT_CACHE_TTL_MS,
        };
        return alertResult;
      }
    } catch (dbError) {
      console.warn(
        "[AlertService] Gagal membaca alert dari DB (kuota/koneksi). Mengaktifkan fallback live BMKG in-memory:",
        dbError
      );
    }

    // Fallback cerdas: Jika DB gagal atau belum ada record, hitung live in-memory dari data BMKG terkini
    try {
      alertResult = await this.evaluateLive();
    } catch (fallbackError) {
      console.error("[AlertService] Evaluasi live BMKG fallback juga gagal:", fallbackError);
      alertResult = buildUnavailableAlert("data-unavailable");
    }

    cachedAlertState = {
      data: alertResult,
      expiresAt: nowMs + ALERT_CACHE_TTL_MS,
    };
    return alertResult;
  }

  /**
   * Rekaman alert terakhir apa adanya, tanpa penyesuaian masa aktif. Dipakai
   * scheduler untuk membandingkan rentetan gempa (ADR-046).
   */
  static async getLatestRecord(): Promise<AlertRecord | null> {
    return AlertRepository.findLatest();
  }

  /**
   * Mengambil riwayat alert 30 hari terakhir untuk portal warga
   */
  static async getAllAlerts(): Promise<AlertRecord[]> {
    try {
      const alerts = await prisma.alert.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - PUBLIC_HISTORY_MAX_AGE_MS) },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return alerts.map((a) => mapAlertToRecord({ ...a, reviewer: null }));
    } catch (dbError) {
      console.warn("[AlertService] Gagal mengambil seluruh riwayat alert dari DB:", dbError);
      return [];
    }
  }

  /**
   * Mengambil daftar riwayat alert dengan filter (severity, reviewStatus, rentang tanggal) & pagination
   */
  static async getFilteredAlerts(query: AlertFilterQuery): Promise<{
    data: AlertRecord[];
    pagination: AlertListPagination;
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const reviewStatusEnum = query.reviewStatus
      ? LABEL_TO_REVIEW_STATUS[query.reviewStatus]
      : undefined;

    const severityEnum = query.severity
      ? LABEL_TO_SEVERITY[query.severity] ??
        LABEL_TO_SEVERITY[String(query.severity).toUpperCase()]
      : undefined;

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const filterParams = {
      severity: severityEnum,
      reviewStatus: reviewStatusEnum,
      startDate,
      endDate,
    };

    try {
      const [data, total] = await Promise.all([
        AlertRepository.findFiltered({
          ...filterParams,
          skip,
          take: limit,
        }),
        AlertRepository.countFiltered(filterParams),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (dbError) {
      console.warn("[AlertService] Gagal mengambil riwayat alert terfilter dari DB:", dbError);
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit,
          totalPages: 1,
        },
      };
    }
  }

  /**
   * Mengambil detail satu entri alert berdasarkan ID
   */
  static async getAlertById(id: string): Promise<AlertRecord> {
    const alert = await AlertRepository.findById(id);
    if (!alert) {
      throw new NotFoundError("Alert tidak ditemukan.");
    }
    return alert;
  }

  /**
   * Klasifikasi/review alert oleh admin atau operator (FS-02)
   */
  static async reviewAlert(
    id: string,
    payload: ReviewAlertPayload,
    reviewerId: string
  ): Promise<AlertRecord> {
    // pastikan alert ada di database
    await this.getAlertById(id);

    const reviewStatusEnum = LABEL_TO_REVIEW_STATUS[payload.reviewStatus];
    if (!reviewStatusEnum) {
      throw new ValidationError(
        `Status review '${payload.reviewStatus}' tidak valid.`
      );
    }

    cachedAlertState = null;
    return AlertRepository.updateReview(
      id,
      reviewStatusEnum,
      reviewerId,
      new Date()
    );
  }
}

