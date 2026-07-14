/**
 * Service untuk fetch & parsing data cuaca dari BMKG Public API,
 * lalu mengubahnya jadi bentuk `EnvironmentalDataInput[]` sesuai
 * kontrak resmi OpenAPI SIGAP (source: "BMKG").
 *
 * Task: BE - Service fetch & parsing API BMKG
 */

import { requestWithFallback, requestWithRetry } from "../utils/httpRetryWrapper.js";
import type { BmkgApiResponse, BmkgCuacaItem } from "../types/bmkg.types.js";
import {
  EnvironmentalDataInputListSchema,
  type EnvironmentalDataInput,
} from "../types/environmentalData.types.js";

const BMKG_BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";

/** Kalau BMKG down dan belum ada cache tersimpan, kembalikan array kosong */
const EMPTY_FALLBACK: EnvironmentalDataInput[] = [];

export class BmkgService {
  /**
   * Ambil forecast BMKG berdasarkan kode wilayah adm4 (kode desa/kelurahan),
   * lalu parsing jadi array EnvironmentalDataInput siap-insert ke DB.
   * Throw error kalau gagal setelah semua retry.
   */
  static async fetchAndParseByAdm4(adm4Code: string): Promise<EnvironmentalDataInput[]> {
    const raw = await requestWithRetry<BmkgApiResponse>(
      BMKG_BASE_URL,
      { params: { adm4: adm4Code } },
      { retries: 3, retryDelayMs: 1000, backoffFactor: 2, timeoutMs: 8000 }
    );

    return this.parse(raw);
  }

  /**
   * Versi "safe": kalau BMKG down, kembalikan fallback (mis. array kosong,
   * atau nanti bisa diganti cache terakhir dari DB) alih-alih throw.
   */
  static async fetchAndParseByAdm4Safe(
    adm4Code: string,
    fallback: EnvironmentalDataInput[] = EMPTY_FALLBACK
  ): Promise<{ data: EnvironmentalDataInput[]; fromFallback: boolean }> {
    const { data: raw, fromFallback } = await requestWithFallback<BmkgApiResponse | null>(
      BMKG_BASE_URL,
      null,
      { params: { adm4: adm4Code } },
      { retries: 3, retryDelayMs: 1000, backoffFactor: 2, timeoutMs: 8000 }
    );

    if (fromFallback || !raw) {
      return { data: fallback, fromFallback: true };
    }

    return { data: this.parse(raw), fromFallback: false };
  }

  /**
   * Pecah satu response BMKG (yang isinya banyak parameter per slot waktu)
   * jadi banyak record EnvironmentalDataInput, satu record per parameter.
   * Divalidasi pakai zod sebelum dikembalikan, biar data yang salah bentuk
   * ketahuan di sini, bukan pas gagal insert ke DB.
   */
  private static parse(raw: BmkgApiResponse): EnvironmentalDataInput[] {
    const firstEntry = raw.data?.[0];
    const flatCuaca: BmkgCuacaItem[] = (firstEntry?.cuaca ?? []).flat();

    const records: EnvironmentalDataInput[] = [];

    for (const item of flatCuaca) {
      const recordedAt = this.toIsoString(item.local_datetime ?? item.datetime);
      if (!recordedAt) continue; // skip data tanpa timestamp valid

      if (typeof item.tp === "number") {
        records.push({
          source: "BMKG",
          type: "curah_hujan",
          value: item.tp,
          unit: "mm",
          recorded_at: recordedAt,
        });
      }
      if (typeof item.t === "number") {
        records.push({
          source: "BMKG",
          type: "suhu",
          value: item.t,
          unit: "°C",
          recorded_at: recordedAt,
        });
      }
      if (typeof item.hu === "number") {
        records.push({
          source: "BMKG",
          type: "kelembapan",
          value: item.hu,
          unit: "%",
          recorded_at: recordedAt,
        });
      }
      if (typeof item.ws === "number") {
        records.push({
          source: "BMKG",
          type: "kecepatan_angin",
          value: item.ws,
          unit: "km/h",
          recorded_at: recordedAt,
        });
      }
    }

    // Validasi akhir sebelum dikembalikan ke caller (mis. sebelum di-insert Prisma)
    return EnvironmentalDataInputListSchema.parse(records);
  }

  /** BMKG kadang kasih format "2026-07-14 07:00:00", perlu dinormalisasi ke ISO 8601 */
  private static toIsoString(rawDatetime: string | undefined): string | null {
    if (!rawDatetime) return null;
    const normalized = rawDatetime.includes("T") ? rawDatetime : rawDatetime.replace(" ", "T");
    const date = new Date(normalized.endsWith("Z") ? normalized : `${normalized}Z`);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }
}
