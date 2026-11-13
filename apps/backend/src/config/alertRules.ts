import type { TsunamiPotential } from "../types/earthquake.types.js";

/** Masa aktif alert dan gempa terhadap level: 24 jam. */
export const ALERT_ACTIVE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Sumber alert yang berasal dari status tsunami resmi (BMKG_TSUNAMI_STATUS). */
export const OFFICIAL_TSUNAMI_SOURCE = "BMKG InaTEWS";

/** Sumber alert yang berasal dari estimasi tsunami dari field Potensi gempa. */
export const ESTIMATED_TSUNAMI_SOURCE = "BMKG (estimasi dari data gempa)";

export const ALERT_RULES = {
  tsunami: {
    AWAS: "RED",
    SIAGA: "ORANGE",
    WASPADA: "YELLOW",
    NORMAL: "GREEN",
  },

  /**
   * Kata kunci wilayah yang dicek pada field `Dirasakan` (laporan MMI —
   * Modified Mercalli Intensity) dari BMKG, untuk menentukan apakah sebuah
   * gempa benar-benar dirasakan warga di sekitar Desa Cibenda.
   *
   * Ini menggantikan pendekatan lama (ambang batas magnitudo/radius buatan
   * sendiri) dengan sumber resmi BMKG sendiri — MMI adalah skala guncangan
   * standar yang sudah dilaporkan BMKG per lokasi, bukan angka tebakan tim.
   */
  earthquake: {
    feltAreaKeywords: ["Cibenda", "Parigi", "Pangandaran"],
  },

  /**
   * Dalam satu rentetan gempa dengan level sama, alert baru dan notifikasi terbit
   * bila magnitudo terbesar pada level tersebut paling sedikit sebesar ini di atas
   * magnitudo yang terakhir dikirim notifikasi (ditetapkan Tech Lead, ADR-046).
   */
  sequence: {
    magnitudeStepForNotification: 1.0,
  },
} as const;

/**
 * Teks `Potensi` BMKG yang sudah terverifikasi dari feed. Teks lain bernilai
 * `TIDAK_DIKENAL` dan dicatat ke log; teks gempa berpotensi tsunami ditambahkan
 * setelah terverifikasi dari BMKG (ADR-046).
 */
export const TSUNAMI_POTENTIAL_TEXTS: Readonly<Record<string, TsunamiPotential>> = {
  "tidak berpotensi tsunami": "TIDAK_BERPOTENSI",
  "gempa ini dirasakan untuk diteruskan pada masyarakat": "INFORMASI_DIRASAKAN",
};