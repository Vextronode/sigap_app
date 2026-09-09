import { prisma } from "../config/prisma.js";
import { AlertLevel } from "../../generated/prisma/enums.js";
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

const ALERT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 jam (1 hari)

export class AlertService {
  /**
   * Menyimpan alert baru ke database
   */
  static async saveAlert(
    level: AlertLevel,
    source: string,
    description?: string
  ) {
    return prisma.alert.create({
      data: {
        level,
        source,
        description,
      },
    });
  }

  /**
   * Mengambil alert terbaru. Jika alert di DB berusia > 24 jam (1 hari),
   * status dianggap expired dan kembali ke status AMAN (GREEN).
   */
  static async getCurrentAlert(): Promise<AlertRecord | null> {
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
        updatedAt: "desc",
      },
    });

    if (!latest) return null;

    const mapped = mapAlertToRecord(latest);

    // Cek umur alert. Jika > 24 jam (1 hari), status alert otomatis kadaluarsa & kembali ke GREEN
    const ageMs = Date.now() - new Date(latest.updatedAt).getTime();
    if (ageMs > ALERT_MAX_AGE_MS && latest.level !== AlertLevel.GREEN) {
      return {
        ...mapped,
        level: AlertLevel.GREEN,
        source: "BMKG",
        description: "Tidak terdapat peringatan resmi BMKG.",
      };
    }

    return mapped;
  }

  /**
   * Mengambil seluruh riwayat alert (legacy)
   */
  static async getAllAlerts(): Promise<AlertRecord[]> {
    const alerts = await prisma.alert.findMany({
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
        updatedAt: "desc",
      },
    });

    return alerts.map((a) => mapAlertToRecord(a));
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
  }

  /**
   * Mengambil detail satu entri alert berdasarkan ID
   */
  static async getAlertById(id: string): Promise<AlertRecord> {
    const alert = await AlertRepository.findById(id);
    if (!alert) {
      const error = new Error("Alert tidak ditemukan.");
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
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
      const error = new Error(
        `Status review '${payload.reviewStatus}' tidak valid.`
      );
      (error as Error & { statusCode?: number }).statusCode = 422;
      throw error;
    }

    return AlertRepository.updateReview(
      id,
      reviewStatusEnum,
      reviewerId,
      new Date()
    );
  }
}

