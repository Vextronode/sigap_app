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
  [AlertReviewStatus.BELUM_DITINJAU]: "Belum Diverifikasi",
  [AlertReviewStatus.DIKONFIRMASI]: "Dikonfirmasi",
  [AlertReviewStatus.DITOLAK]: "Ditolak",
  [AlertReviewStatus.DITINDAKLANJUTI]: "Ditindaklanjuti",
};

export const LABEL_TO_REVIEW_STATUS: Record<string, AlertReviewStatus> = {
  "Belum Diverifikasi": AlertReviewStatus.BELUM_DITINJAU,
  "Belum Ditinjau": AlertReviewStatus.BELUM_DITINJAU,
  "Dikonfirmasi": AlertReviewStatus.DIKONFIRMASI,
  "Ditolak": AlertReviewStatus.DITOLAK,
  "Ditindaklanjuti": AlertReviewStatus.DITINDAKLANJUTI,
  BELUM_DITINJAU: AlertReviewStatus.BELUM_DITINJAU,
  DIKONFIRMASI: AlertReviewStatus.DIKONFIRMASI,
  DITOLAK: AlertReviewStatus.DITOLAK,
  DITINDAKLANJUTI: AlertReviewStatus.DITINDAKLANJUTI,
};

export const SEVERITY_TO_LABEL: Record<AlertLevel, string> = {
  [AlertLevel.GREEN]: "Aman",
  [AlertLevel.YELLOW]: "Waspada",
  [AlertLevel.ORANGE]: "Siaga",
  [AlertLevel.RED]: "Awas",
};

export const LABEL_TO_SEVERITY: Record<string, AlertLevel> = {
  Aman: AlertLevel.GREEN,
  Waspada: AlertLevel.YELLOW,
  Siaga: AlertLevel.ORANGE,
  Awas: AlertLevel.RED,
  AMAN: AlertLevel.GREEN,
  GREEN: AlertLevel.GREEN,
  WASPADA: AlertLevel.YELLOW,
  YELLOW: AlertLevel.YELLOW,
  SIAGA: AlertLevel.ORANGE,
  ORANGE: AlertLevel.ORANGE,
  AWAS: AlertLevel.RED,
  RED: AlertLevel.RED,
};

export interface AlertFilterParams {
  severity?: AlertLevel;
  reviewStatus?: AlertReviewStatus;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

export function matchAlertToEarthquake(
  alert: { description: string | null; createdAt: Date },
  eqRecords: Array<{ magnitude: number; location: string; shakemap: string | null; eventTime: string; createdAt: Date }>
): { location: string; shakemap: string | null } {
  const magMatch = alert.description?.match(/M(\d+(?:\.\d+)?)/);
  const mag = magMatch ? parseFloat(magMatch[1]) : null;
  const aTime = new Date(alert.createdAt).getTime();

  let bestEq: (typeof eqRecords)[number] | null = null;
  let minDiff = Infinity;

  for (const eq of eqRecords) {
    if (mag !== null && Math.abs(eq.magnitude - mag) < 0.05) {
      const eqTime = new Date(eq.eventTime || eq.createdAt).getTime();
      const diff = Math.abs(aTime - eqTime);
      if (diff < minDiff) {
        minDiff = diff;
        bestEq = eq;
      }
    }
  }

  const descParen = alert.description?.match(/\(([^)]+)\)/);
  const fallbackLoc = descParen ? descParen[1] : "Sekitar Pangandaran";

  return {
    location: bestEq?.location || fallbackLoc,
    shakemap: bestEq?.shakemap || null,
  };
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
  }>,
  eqMeta?: { location?: string | null; shakemap?: string | null } | null
): AlertRecord {
  return {
    id: alert.id,
    level: alert.level,
    source: alert.source,
    description: alert.description,
    location: eqMeta?.location ?? null,
    shakemap: eqMeta?.shakemap ?? null,
    reviewStatus:
      REVIEW_STATUS_TO_LABEL[alert.reviewStatus] ?? "Belum Diverifikasi",
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
      NOT: [
        {
          description: {
            contains: "Tidak terdapat peringatan resmi",
          },
        },
        {
          description: {
            contains: "Kondisi lingkungan normal",
          },
        },
        {
          source: {
            contains: "simulasi",
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: "simulasi",
            mode: "insensitive",
          },
        },
      ],
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

    const [alerts, eqRecords] = await Promise.all([
      prisma.alert.findMany({
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
      }),
      prisma.earthquakeRecord.findMany(),
    ]);

    return alerts.map((a) =>
      mapAlertToRecord(a, matchAlertToEarthquake(a, eqRecords))
    );
  }

  // hitung total data alert yang cocok dengan filter untuk metadata pagination
  static async countFiltered(
    params: Omit<AlertFilterParams, "skip" | "take">
  ): Promise<number> {
    const where: Prisma.AlertWhereInput = {
      NOT: [
        {
          description: {
            contains: "Tidak terdapat peringatan resmi",
          },
        },
        {
          description: {
            contains: "Kondisi lingkungan normal",
          },
        },
        {
          source: {
            contains: "simulasi",
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: "simulasi",
            mode: "insensitive",
          },
        },
      ],
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
    const [alert, eqRecords] = await Promise.all([
      prisma.alert.findUnique({
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
      }),
      prisma.earthquakeRecord.findMany(),
    ]);

    if (!alert) return null;
    return mapAlertToRecord(alert, matchAlertToEarthquake(alert, eqRecords));
  }

  // perbarui status tinjauan alert dan catatan audit (reviewedBy, reviewedAt)
  static async updateReview(
    id: string,
    reviewStatus: AlertReviewStatus,
    reviewedBy: string,
    reviewedAt: Date
  ): Promise<AlertRecord> {
    const [updated, eqRecords] = await Promise.all([
      prisma.alert.update({
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
      }),
      prisma.earthquakeRecord.findMany(),
    ]);

    return mapAlertToRecord(updated, matchAlertToEarthquake(updated, eqRecords));
  }
}
