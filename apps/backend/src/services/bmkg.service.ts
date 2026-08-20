/**
 * Service untuk fetch & parsing data cuaca dari BMKG Public API,
 * sesuai kontrak resmi `API_SPEC.md` v2.0 — endpoint /weather/current
 * dan /weather/forecast.
 *
 * Task: SIG-117 - BE - Service fetch & parsing API BMKG
 *
 * BMKG Mapping (dari API_SPEC.md §8.1):
 *   GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=<kode>
 *   Field dipakai: t, hu, weather_desc, ws, wd, vs_text, local_datetime
 *
 * ⚠️  Keterbatasan data BMKG Public API:
 *   Data prakiraan cuaca (termasuk cuaca saat ini) hanya diperbarui 2x sehari
 *   oleh BMKG, berdasarkan model NWP run pukul 00:00 UTC (07:00 WIB) dan
 *   12:00 UTC (19:00 WIB). Field `analysis_date` di setiap item menunjukkan
 *   kapan data terakhir digenerate. Akibatnya, kondisi cuaca yang ditampilkan
 *   adalah PRAKIRAAN, bukan observasi real-time — bisa berbeda dengan kondisi
 *   aktual saat terjadi perubahan cuaca mendadak (mis. hujan lokal singkat).
 *   Ini adalah keterbatasan resmi API publik BMKG, bukan bug aplikasi.
 */

import { requestWithRetry } from "../utils/httpRetryWrapper.js";
import type { BmkgApiResponse, BmkgCuacaItem } from "../types/bmkg.types.js";
import type { CurrentWeather, ForecastItem } from "../types/weather.types.js";
import type { TsunamiStatus, TsunamiStatusInfo } from "../types/alert.types.js";
import { EarthquakeService } from "./earthquake.service.js";

const BMKG_BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";

export class BmkgService {
  /** Fetch mentah dari BMKG, dengan retry (lihat httpRetryWrapper.ts untuk SIG-122) */
  private static fetchRaw(adm4Code: string): Promise<BmkgApiResponse> {
    return requestWithRetry<BmkgApiResponse>(
      BMKG_BASE_URL,
      { params: { adm4: adm4Code } },
      { retries: 3, retryDelayMs: 1000, backoffFactor: 2, timeoutMs: 8000 }
    );
  }

  /** Untuk GET /weather/current — ambil slot waktu yang paling dekat dengan sekarang.
   *
   * Data yang dikembalikan adalah PRAKIRAAN BMKG, bukan observasi real-time.
   * BMKG memperbarui data 2x sehari (pukul 07:00 dan 19:00 WIB), sehingga
   * kondisi cuaca yang ditampilkan mungkin berbeda dengan cuaca aktual
   * jika terjadi perubahan mendadak di antara jadwal update BMKG.
   */
  static async getCurrentWeather(adm4Code: string): Promise<CurrentWeather> {
    const raw = await this.fetchRaw(adm4Code);
    const items = this.flatten(raw);
    const latest = this.pickClosestToNow(items);

    if (!latest) {
      throw new Error(`Data cuaca BMKG kosong untuk adm4=${adm4Code}`);
    }

    return this.toCurrentWeather(latest);
  }

  /** Untuk GET /weather/forecast — 3 hari ke depan, interval 3 jam (sesuai catatan API_SPEC.md §8.2) */
  static async getForecast(adm4Code: string): Promise<ForecastItem[]> {
    const raw = await this.fetchRaw(adm4Code);

    const items = this.flatten(raw);

    return this.buildDashboardForecast(items);
  }

  /**
   * Status tsunami. InaTEWS resmi belum bisa diakses lewat API publik —
   * kampus/ketua tim sedang mengurus akses resmi secara terpisah. Sampai itu
   * didapat:
   *
   * - Override manual tetap tersedia lewat env `BMKG_TSUNAMI_STATUS` (mis.
   *   operator yang punya info resmi dari kanal lain, atau untuk demo),
   *   boleh berupa 4 level penuh (NORMAL/WASPADA/SIAGA/AWAS).
   * - Kalau tidak di-override, status DIESTIMASI dari field `Potensi` pada
   *   gempa BMKG yang relevan untuk Desa Cibenda (lihat `estimateTsunamiStatus`).
   *   Estimasi ini SENGAJA dibatasi maksimal WASPADA — `Potensi` adalah flag
   *   biner otomatis dari satu gempa saja (bukan status resmi InaTEWS yang
   *   bisa naik/turun seiring data gelombang nyata), jadi tidak pernah
   *   dipakai sebagai dasar SIAGA/AWAS secara otomatis. Overclaim di level
   *   tertinggi jauh lebih berbahaya daripada under-claim di level menengah.
   */
  static async getTsunamiStatus(): Promise<TsunamiStatusInfo> {
    const configured = process.env.BMKG_TSUNAMI_STATUS?.toUpperCase();

    if (
      configured === "AWAS" ||
      configured === "SIAGA" ||
      configured === "WASPADA" ||
      configured === "NORMAL"
    ) {
      return {
        status: configured,
        source: "BMKG InaTEWS",
        description: this.buildOfficialTsunamiDescription(configured),
      };
    }

    return this.estimateTsunamiStatus();
  }

  private static buildOfficialTsunamiDescription(status: TsunamiStatus): string {
    switch (status) {
      case "AWAS":
        return "BMKG mengeluarkan status AWAS tsunami. Ikuti arahan evakuasi resmi.";
      case "SIAGA":
        return "BMKG mengeluarkan status SIAGA tsunami. Siapkan diri untuk evakuasi.";
      case "WASPADA":
        return "BMKG mengeluarkan status WASPADA tsunami. Tetap pantau informasi resmi.";
      case "NORMAL":
      default:
        return "Tidak ada peringatan tsunami aktif dari BMKG.";
    }
  }

  /**
   * Estimasi status tsunami dari field `Potensi` gempa BMKG yang relevan
   * untuk Desa Cibenda (radius + umur maksimum sama seperti yang dipakai
   * card gempa Pangandaran & Decision Engine — lihat EarthquakeService.getPangandaran).
   * Dibatasi maksimal WASPADA, tidak pernah otomatis jadi SIAGA/AWAS.
   */
  private static async estimateTsunamiStatus(): Promise<TsunamiStatusInfo> {
    const nearest = await EarthquakeService.getPangandaran();

    const isPotentiallyTsunamigenic =
      nearest?.potential?.trim().toLowerCase() === "berpotensi tsunami";

    if (isPotentiallyTsunamigenic && nearest) {
      return {
        status: "WASPADA",
        source: "BMKG (estimasi dari data gempa)",
        description: `Estimasi awal dari gempa M${nearest.magnitude} di ${nearest.location}: berpotensi tsunami menurut data BMKG. Ini BUKAN peringatan resmi InaTEWS — SIGAP belum terhubung ke InaTEWS, tetap pantau kanal resmi BMKG untuk status lanjutan.`,
      };
    }

    return {
      status: "NORMAL",
      source: "BMKG",
      description:
        "Tidak ada indikasi potensi tsunami dari data gempa terkini BMKG. SIGAP belum terhubung ke status resmi InaTEWS.",
    };
  }

  private static flatten(raw: BmkgApiResponse): BmkgCuacaItem[] {
    const firstEntry = raw.data?.[0];
    return (firstEntry?.cuaca ?? []).flat();
  }

  private static buildDashboardForecast(
    items: BmkgCuacaItem[]
  ): ForecastItem[] {

    // Gunakan tanggal WIB untuk filter — ambil dari local_datetime langsung
    // (misal "2026-08-20 07:00:00" → "2026-08-20"), bukan dari UTC yang bisa
    // beda tanggal saat jam < 07:00 WIB (masih hari sebelumnya di UTC)
    const nowWib = new Date(Date.now() + 7 * 3600 * 1000);
    const todayWib = nowWib.toISOString().slice(0, 10);

    const tomorrowWib = new Date(nowWib);
    tomorrowWib.setUTCDate(nowWib.getUTCDate() + 1);

    const dayAfterWib = new Date(nowWib);
    dayAfterWib.setUTCDate(nowWib.getUTCDate() + 2);

    const tomorrowKey = tomorrowWib.toISOString().slice(0, 10);
    const dayAfterKey = dayAfterWib.toISOString().slice(0, 10);

    /** Ambil tanggal WIB dari item (10 karakter pertama local_datetime) */
    const localDate = (item: BmkgCuacaItem): string =>
      item.local_datetime?.slice(0, 10) ??
      new Date(this.toUtcIso(item) + "+00:00")
        .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
        .slice(0, 10);

    /** Ambil jam WIB dari item (karakter ke-11–12 dari local_datetime) */
    const localHour = (item: BmkgCuacaItem): number =>
      item.local_datetime
        ? parseInt(item.local_datetime.slice(11, 13), 10)
        : new Date(this.toUtcIso(item)).getUTCHours() + 7;

    const current = this.pickClosestToNow(items);

    const afternoon =
      items.find((item) => {
        return localDate(item) === todayWib && localHour(item) >= 15;
      }) ?? current;

    const tomorrowForecast =
      items.find((item) => localDate(item) === tomorrowKey);

    const dayAfterForecast =
      items.find((item) => localDate(item) === dayAfterKey);

    const result: ForecastItem[] = [];

    if (current) {
      result.push({
        ...this.toForecastItem(current),
        label: "Hari Ini",
      });
    }

    if (afternoon) {
      result.push({
        ...this.toForecastItem(afternoon),
        label: "Sore Ini",
      });
    }

    if (tomorrowForecast) {
      result.push({
        ...this.toForecastItem(tomorrowForecast),
        label: new Intl.DateTimeFormat("id-ID", {
          weekday: "short",
        }).format(tomorrowWib),
      });
    }

    if (dayAfterForecast) {
      result.push({
        ...this.toForecastItem(dayAfterForecast),
        label: new Intl.DateTimeFormat("id-ID", {
          weekday: "short",
        }).format(dayAfterWib),
      });
    }

    return result;
  }

  private static pickClosestToNow(items: BmkgCuacaItem[]): BmkgCuacaItem | null {
    if (items.length === 0) return null;
    const now = Date.now();
    return items.reduce((closest, item) => {
      // Gunakan utc_datetime atau datetime (sudah UTC) — BUKAN local_datetime
      // local_datetime adalah waktu WIB (UTC+7), jika ditambah "Z" jadi salah 7 jam
      const itemTime = new Date(this.toUtcIso(item)).getTime();
      const closestTime = new Date(this.toUtcIso(closest)).getTime();
      return Math.abs(itemTime - now) < Math.abs(closestTime - now) ? item : closest;
    });
  }

  private static toCurrentWeather(item: BmkgCuacaItem): CurrentWeather {
    return {
      temperature: Math.round(item.t),
      humidity: item.hu,
      weather: item.weather_desc,
      windSpeed: item.ws,
      windDirection: item.wd ?? "",
      visibility: item.vs_text ?? "",
      updatedAt: this.toIso(item.local_datetime ?? item.datetime),
    };
  }

  private static toForecastItem(item: BmkgCuacaItem): ForecastItem {
    // Gunakan local_datetime untuk date display (tanggal WIB)
    const localIso = item.local_datetime
      ? item.local_datetime.replace(" ", "T")
      : new Date(this.toUtcIso(item)).toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" });
    return {
      label: "",
      date: localIso.slice(0, 10),
      condition: item.weather_desc,
      temperature: item.t,
      rainProbability: this.estimateRainProbability(item),
    };
  }

  /**
   * ⚠️ PENTING: BMKG Public API TIDAK menyediakan field "probability of rain"
   * secara langsung. Ini heuristik sementara dari curah hujan (tp, mm) dan
   * deskripsi cuaca — BUKAN angka resmi BMKG.
   *
   * TODO: konfirmasi ke Naufal/tim apakah pendekatan ini bisa diterima,
   * atau apakah ada sumber/rumus lain yang harus dipakai untuk rainProbability.
   */
  private static estimateRainProbability(item: BmkgCuacaItem): number {
    const desc = item.weather_desc?.toLowerCase() ?? "";
    const tp = item.tp ?? 0;

    if (tp >= 20) return 90;
    if (tp >= 5) return 70;
    if (tp > 0 || desc.includes("hujan")) return 60;
    return desc.includes("berawan") ? 20 : 0;
  }

  /**
   * Ambil waktu UTC dari item BMKG secara aman.
   * Priority: utc_datetime → datetime (sudah UTC) → fallback ke now.
   *
   * CATATAN PENTING: jangan gunakan local_datetime untuk perbandingan waktu!
   * local_datetime adalah waktu WIB (UTC+7) tanpa timezone offset — jika
   * ditambah "Z" secara naif, hasilnya salah 7 jam (terlambat 7 jam).
   */
  private static toUtcIso(item: BmkgCuacaItem): string {
    // utc_datetime format: "2026-08-20 00:00:00" → perlu normalisasi + Z
    const raw = item.utc_datetime ?? item.datetime;
    if (!raw) return new Date().toISOString();
    const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
    const withZ = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
    const date = new Date(withZ);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  /** @deprecated Gunakan toUtcIso() untuk perbandingan waktu. Fungsi ini hanya
   * aman untuk display string yang sudah UTC (mis. field `datetime`). */
  private static toIso(rawDatetime: string | undefined): string {
    if (!rawDatetime) return new Date().toISOString();
    const normalized = rawDatetime.includes("T") ? rawDatetime : rawDatetime.replace(" ", "T");
    const withZ = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
    const date = new Date(withZ);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }
}
