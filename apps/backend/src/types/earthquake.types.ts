/**
 * Type untuk data gempa BMKG (https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json)
 * dan bentuk hasil parsing sesuai API_SPEC.md §8.3.
 */

/** Bentuk response mentah dari BMKG autogempa.json */
export interface BmkgAutogempaResponse {
  Infogempa: {
    gempa: {
      Tanggal: string;
      Jam: string;
      DateTime: string; // ISO 8601
      Coordinates: string; // "-7.68,108.42"
      Lintang: string;
      Bujur: string;
      Magnitude: string; // "5.6"
      Kedalaman: string; // "18 km"
      Wilayah: string;
      Potensi: string;
      Dirasakan: string;
      Shakemap: string; // nama file, mis. "20260709081500.mmi.jpg"
    };
  };
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
  potential: string;
  shakemap: string; // full URL
  updatedAt: string; // ISO 8601
}
