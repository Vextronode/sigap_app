import { prisma } from "../config/prisma.js";
import { NotFoundError, ValidationError } from "../errors/AppError.js";
import { AlertLevel } from "../../generated/prisma/enums.js";
import { ALERT_ACTIVE_MAX_AGE_MS } from "../config/alertRules.js";
import {
  AlertRepository,
  LABEL_TO_REVIEW_STATUS,
  LABEL_TO_SEVERITY,
  mapAlertToRecord,
} from "../repositories/alert.repository.js";
import type {
  AlertFilterQuery,
  AlertListPagination,
  AlertRecord,
  ReviewAlertPayload,
} from "../types/alert.types.js";

const PUBLIC_HISTORY_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari
const ALERT_CACHE_TTL_MS = 60_000; // 60 detik TTL in-memory cache (menghemat compute DB)

let cachedAlertState: { data: AlertRecord | null; expiresAt: number } | null = null;

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
   * Menyimpan alert baru ke database
   */
  static async saveAlert(
    level: AlertLevel,
    source: string,
    description?: string
  ) {
    cachedAlertState = null; // Invalidate cache saat ada alert baru
    return prisma.alert.create({
      data: {
        level,
        source,
        description,
      },
    });
  }

  /**
   * Mengambil alert terbaru. Menggunakan in-memory cache (TTL 30 detik)
   * untuk meminimalisasi beban kuota compute basis data.
   */
  static async getCurrentAlert(): Promise<AlertRecord | null> {
    const nowMs = Date.now();
    if (cachedAlertState && cachedAlertState.expiresAt > nowMs) {
      return cachedAlertState.data;
    }

    let alertResult: AlertRecord | null = null;

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
        const mapped = mapAlertToRecord(latest);

        // Cek umur alert dari waktu bencana (createdAt), BUKAN kapan admin klik verifikasi (updatedAt).
        // Jika > 24 jam (1 hari), status alert otomatis kembali ke GREEN (Aman).
        // Status review adalah catatan pasca-kejadian dan tidak memengaruhi level (ADR-041).
        const ageMs = Date.now() - new Date(latest.createdAt).getTime();
        const isExpired = ageMs > ALERT_ACTIVE_MAX_AGE_MS && latest.level !== AlertLevel.GREEN;
        const isActive = !isExpired && latest.level !== AlertLevel.GREEN;

        // Tanpa alert aktif, GREEN hanya berlaku bila data BMKG terbaca (ADR-043).
        const { EarthquakeService } = await import("./earthquake.service.js");
        if (!isActive && !(await EarthquakeService.isLiveDataAvailable())) {
          alertResult = buildUnavailableAlert("data-unavailable");
        } else if (isExpired) {
          alertResult = {
            ...mapped,
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
      const { EarthquakeService } = await import("./earthquake.service.js");
      const { BmkgService } = await import("./bmkg.service.js");
      const { DecisionEngineService } = await import("./decisionEngine.service.js");

      if (!(await EarthquakeService.isLiveDataAvailable())) {
        throw new Error("Data gempa BMKG tidak tersedia.");
      }

      const earthquake = await EarthquakeService.getPangandaran();
      const tsunami = await BmkgService.getTsunamiStatus();
      const liveEval = DecisionEngineService.evaluate({ earthquake, tsunami });

      const now = new Date();
      alertResult = {
        id: LIVE_FALLBACK_ALERT_ID,
        level: liveEval.level as AlertLevel,
        source: liveEval.source || "BMKG",
        description:
          liveEval.description ||
          "Tidak terdapat indikasi ancaman gempa atau tsunami dari data terkini BMKG.",
        reviewStatus: "Belum Diverifikasi",
        reviewedBy: null,
        reviewedAt: null,
        createdAt: now,
        updatedAt: now,
      };
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

