/**
 * Type definitions untuk response mentah BMKG Public Weather API
 * (https://api.bmkg.go.id/publik/prakiraan-cuaca).
 *
 * Ini HANYA merepresentasikan bentuk data dari BMKG apa adanya.
 * Untuk bentuk data yang disimpan ke DB, lihat `environmentalData.types.ts`
 * yang mengikuti kontrak resmi OpenAPI SIGAP.
 *
 * Catatan: sesuaikan lagi field-field ini kalau ternyata response asli
 * BMKG berbeda saat dites langsung.
 */

export interface BmkgLokasi {
  adm1: string;
  adm2: string;
  adm3: string;
  adm4: string;
  provinsi: string;
  kotkab: string;
  kecamatan: string;
  desa: string;
  lon: number;
  lat: number;
  timezone: string;
}

export interface BmkgCuacaItem {
  datetime: string;
  local_datetime?: string;
  utc_datetime?: string;
  t: number; // suhu (Celsius)
  tp?: number; // curah hujan (mm)
  hu: number; // kelembapan (%)
  ws: number; // kecepatan angin (km/h)
  wd?: string; // arah angin, mis. "Timur Laut"
  wd_deg?: number; // arah angin dalam derajat
  weather: number; // kode cuaca BMKG
  weather_desc: string;
  weather_desc_en?: string;
  vs_text?: string;
}

export interface BmkgApiResponse {
  lokasi: BmkgLokasi;
  data: Array<{
    lokasi: BmkgLokasi;
    cuaca: BmkgCuacaItem[][];
  }>;
}
