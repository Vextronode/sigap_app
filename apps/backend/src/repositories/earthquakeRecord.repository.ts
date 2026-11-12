import { prisma } from "../config/prisma.js";
import type { EarthquakeRecord } from "../../generated/prisma/client.js";

/** Kolom `earthquake_records` yang diisi dari data gempa BMKG. */
export type EarthquakeRecordData = Omit<EarthquakeRecord, "id" | "createdAt" | "updatedAt">;

/** Kriteria rekaman terbaru: lokasi atau `felt` memuat kata tertentu, atau jarak dalam batas. */
export interface EarthquakeRecordMatch {
  locationContains?: string[];
  feltContains?: string[];
  maxDistanceKm?: number;
}

export class EarthquakeRecordRepository {
  // rekaman terbaru menurut waktu kejadian
  static findLatest() {
    return prisma.earthquakeRecord.findFirst({ orderBy: { eventTime: "desc" } });
  }

  // sejumlah rekaman terbaru menurut waktu kejadian
  static findRecent(take: number) {
    return prisma.earthquakeRecord.findMany({ orderBy: { eventTime: "desc" }, take });
  }

  // rekaman dengan waktu kejadian sejak `eventTimeFrom` (ISO UTC)
  static findSince(eventTimeFrom: string) {
    return prisma.earthquakeRecord.findMany({ where: { eventTime: { gte: eventTimeFrom } } });
  }

  // rekaman terbaru yang memenuhi salah satu kriteria
  static findLatestMatching({ locationContains = [], feltContains = [], maxDistanceKm }: EarthquakeRecordMatch) {
    return prisma.earthquakeRecord.findFirst({
      where: {
        OR: [
          ...locationContains.map((text) => ({ location: { contains: text, mode: "insensitive" as const } })),
          ...feltContains.map((text) => ({ felt: { contains: text, mode: "insensitive" as const } })),
          ...(maxDistanceKm !== undefined ? [{ distanceToVillage: { lte: maxDistanceKm } }] : []),
        ],
      },
      orderBy: { eventTime: "desc" },
    });
  }

  static findByEventTime(eventTime: string) {
    return prisma.earthquakeRecord.findUnique({ where: { eventTime } });
  }

  // simpan atau perbarui rekaman berdasarkan waktu kejadian
  static upsert(data: EarthquakeRecordData) {
    const { eventTime, ...fields } = data;
    return prisma.earthquakeRecord.upsert({
      where: { eventTime },
      update: fields,
      create: data,
    });
  }
}
