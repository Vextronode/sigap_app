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
 */

import { requestWithRetry } from "../utils/httpRetryWrapper.js";
import type { BmkgApiResponse, BmkgCuacaItem } from "../types/bmkg.types.js";
import type { CurrentWeather, ForecastItem } from "../types/weather.types.js";
import type { TsunamiStatus } from "../types/alert.types.js";

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

  /** Untuk GET /weather/current — ambil slot waktu yang paling dekat dengan sekarang */
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
   * Status tsunami placeholder.
   * Jika sumber resmi belum tersedia di backend, gunakan NORMAL sebagai default
   * atau override via env `BMKG_TSUNAMI_STATUS`.
   */
  static async getTsunamiStatus(): Promise<TsunamiStatus> {
    const configured = process.env.BMKG_TSUNAMI_STATUS?.toUpperCase();

    if (
      configured === "AWAS" ||
      configured === "SIAGA" ||
      configured === "WASPADA" ||
      configured === "NORMAL"
    ) {
      return configured;
    }

    return "NORMAL";
  }

  private static flatten(raw: BmkgApiResponse): BmkgCuacaItem[] {
    const firstEntry = raw.data?.[0];
    return (firstEntry?.cuaca ?? []).flat();
  }

  private static buildDashboardForecast(
  items: BmkgCuacaItem[]
): ForecastItem[] {

  const now = new Date();

  const today = now.toISOString().slice(0, 10);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const dayAfter = new Date(now);
  dayAfter.setDate(now.getDate() + 2);

  const tomorrowKey = tomorrow.toISOString().slice(0,10);
  const dayAfterKey = dayAfter.toISOString().slice(0,10);

  const current = this.pickClosestToNow(items);

  const afternoon =
    items.find((item) => {
      const iso = this.toIso(item.local_datetime ?? item.datetime);

      return (
        iso.startsWith(today) &&
        new Date(iso).getUTCHours() >= 15
      );
    }) ?? current;

  const tomorrowForecast =
    items.find((item) =>
      this.toIso(item.local_datetime ?? item.datetime).startsWith(tomorrowKey)
    );

  const dayAfterForecast =
    items.find((item) =>
      this.toIso(item.local_datetime ?? item.datetime).startsWith(dayAfterKey)
    );

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
      }).format(tomorrow),
    });
  }

  if (dayAfterForecast) {
    result.push({
      ...this.toForecastItem(dayAfterForecast),
      label: new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
      }).format(dayAfter),
    });
  }

  return result;
}

  private static pickClosestToNow(items: BmkgCuacaItem[]): BmkgCuacaItem | null {
    if (items.length === 0) return null;
    const now = Date.now();
    return items.reduce((closest, item) => {
      const itemTime = new Date(this.toIso(item.local_datetime ?? item.datetime)).getTime();
      const closestTime = new Date(this.toIso(closest.local_datetime ?? closest.datetime)).getTime();
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
    const iso = this.toIso(item.local_datetime ?? item.datetime);
    return {
      label: "",
      date: iso.slice(0, 10),
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

  /** BMKG kadang kasih format "2026-07-14 07:00:00", normalisasi ke ISO 8601 */
  private static toIso(rawDatetime: string | undefined): string {
    if (!rawDatetime) return new Date().toISOString();
    const normalized = rawDatetime.includes("T") ? rawDatetime : rawDatetime.replace(" ", "T");
    const withZ = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
    const date = new Date(withZ);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }
}
