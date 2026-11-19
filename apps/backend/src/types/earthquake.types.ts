/**
 * Type untuk data gempa BMKG (https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json)
 * dan bentuk hasil parsing sesuai API_SPEC.md §8.3.
 */

/** Bentuk satu item response mentah dari BMKG gempabumi JSON */
export interface BmkgEarthquakeItem {
  Tanggal: string;
  Jam: string;
  DateTime: string; // ISO 8601
  Coordinates: string; // "-7.68,108.42"
  Lintang: string;
  Bujur: string;
  Magnitude: string; // "5.6"
  Kedalaman: string; // "18 km"
  Wilayah: string;
  Potensi?: string; // tidak ada di gempadirasakan.json
  Dirasakan?: string; // tidak ada di gempaterkini.json
  Shakemap?: string; // nama file, mis. "20260709081500.mmi.jpg"
}

/** Bentuk response mentah dari BMKG autogempa.json */
export interface BmkgAutogempaResponse {
  Infogempa: {
    gempa: BmkgEarthquakeItem;
  };
}

/** Bentuk response mentah dari BMKG gempaterkini.json / gempadirasakan.json */
export interface BmkgEarthquakeListResponse {
  Infogempa: {
    gempa: BmkgEarthquakeItem[];
  };
}

/** Klasifikasi teks `Potensi` BMKG. `TIDAK_DIKENAL` untuk teks yang belum terverifikasi. */
export type TsunamiPotential =
  | "TIDAK_BERPOTENSI"
  | "INFORMASI_DIRASAKAN"
  | "BERPOTENSI"
  | "TIDAK_DIKENAL";

/** Satu wilayah pada teks `Dirasakan`, mis. "III Pangandaran" atau "II-III Ciamis". */
export interface FeltArea {
  area: string;
  mmi: string | null;
}

/** Bentuk hasil parsing, sesuai API_SPEC.md §8.3 `GET /earthquakes/latest` */
export interface EarthquakeInfo {
  magnitude: number;
  depth: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distanceToVillage: number; // km, dihitung dari koordinat Desa Cibenda
  felt: string;
  feltAreas: FeltArea[];
  potential: string;
  tsunamiPotential: TsunamiPotential | null; // null bila teks Potensi kosong
  shakemap: string; // full URL
  updatedAt: string; // ISO 8601
}
