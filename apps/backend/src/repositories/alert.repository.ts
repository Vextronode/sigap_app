import { prisma } from "../config/prisma.js";
import {
  AlertLevel,
  AlertReviewStatus,
} from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type {
  AlertRecord,
  AlertReviewStatusLabel,
} from "../types/alert.types.js";

export const REVIEW_STATUS_TO_LABEL: Record<
  AlertReviewStatus,
  AlertReviewStatusLabel
> = {
  [AlertReviewStatus.BELUM_DITINJAU]: "Belum Ditinjau",
  [AlertReviewStatus.DIKONFIRMASI]: "Dikonfirmasi",
  [AlertReviewStatus.DITOLAK]: "Ditolak",
  [AlertReviewStatus.DITINDAKLANJUTI]: "Ditindaklanjuti",
};

export const LABEL_TO_REVIEW_STATUS: Record<string, AlertReviewStatus> = {
  "Belum Ditinjau": AlertReviewStatus.BELUM_DITINJAU,
  "Dikonfirmasi": AlertReviewStatus.DIKONFIRMASI,
  "Ditolak": AlertReviewStatus.DITOLAK,
  "Ditindaklanjuti": AlertReviewStatus.DITINDAKLANJUTI,
  BELUM_DITINJAU: AlertReviewStatus.BELUM_DITINJAU,
  DIKONFIRMASI: AlertReviewStatus.DIKONFIRMASI,
  DITOLAK: AlertReviewStatus.DITOLAK,
  DITINDAKLANJUTI: AlertReviewStatus.DITINDAKLANJUTI,
};

export interface AlertFilterParams {
  severity?: AlertLevel;
  reviewStatus?: AlertReviewStatus;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

// transform hasil entri prisma alert ke tipe AlertRecord dengan label bahasa indonesia
export function mapAlertToRecord(
  alert: Prisma.AlertGetPayload<{
    include: {
      reviewer: {
        select: {
          id: true;
          name: true;
          email: true;
        };
      };
    };
  }>
): AlertRecord {
  return {
    id: alert.id,
    level: alert.level,
    source: alert.source,
    description: alert.description,
    reviewStatus:
      REVIEW_STATUS_TO_LABEL[alert.reviewStatus] ?? "Belum Ditinjau",
    reviewedBy: alert.reviewedBy,
    reviewedAt: alert.reviewedAt,
    reviewer: alert.reviewer ?? null,
    createdAt: alert.createdAt,
    updatedAt: alert.updatedAt,
  };
}

export class AlertRepository {
  // ambil daftar alert terfilter dengan pagination dan data reviewer (hanya alert kejadian nyata yang butuh verifikasi)
  static async findFiltered(params: AlertFilterParams): Promise<AlertRecord[]> {
    const where: Prisma.AlertWhereInput = {
      NOT: {
        description: {
          contains: "Tidak terdapat peringatan resmi",
        },
      },
    };

    if (params.severity) {
      where.level = params.severity;
    }

    if (params.reviewStatus) {
      where.reviewStatus = params.reviewStatus;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = params.startDate;
      }
      if (params.endDate) {
        where.createdAt.lte = params.endDate;
      }
    }

    const alerts = await prisma.alert.findMany({
      where,
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
      skip: params.skip,
      take: params.take,
    });

    return alerts.map(mapAlertToRecord);
  }

  // hitung total data alert yang cocok dengan filter untuk metadata pagination
  static async countFiltered(
    params: Omit<AlertFilterParams, "skip" | "take">
  ): Promise<number> {
    const where: Prisma.AlertWhereInput = {
      NOT: {
        description: {
          contains: "Tidak terdapat peringatan resmi",
        },
      },
    };

    if (params.severity) {
      where.level = params.severity;
    }

    if (params.reviewStatus) {
      where.reviewStatus = params.reviewStatus;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = params.startDate;
      }
      if (params.endDate) {
        where.createdAt.lte = params.endDate;
      }
    }

    return prisma.alert.count({ where });
  }

  // cari alert berdasarkan id beserta data reviewer
  static async findById(id: string): Promise<AlertRecord | null> {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!alert) return null;
    return mapAlertToRecord(alert);
  }

  // perbarui status tinjauan alert dan catatan audit (reviewedBy, reviewedAt)
  static async updateReview(
    id: string,
    reviewStatus: AlertReviewStatus,
    reviewedBy: string,
    reviewedAt: Date
  ): Promise<AlertRecord> {
    const updated = await prisma.alert.update({
      where: { id },
      data: {
        reviewStatus,
        reviewedBy,
        reviewedAt,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return mapAlertToRecord(updated);
  }
}
