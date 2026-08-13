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
} as const;