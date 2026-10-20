import { BmkgService } from "./bmkg.service.js";
import { OpenMeteoService } from "./openmeteo.service.js";
import type { CurrentWeather, ForecastItem } from "../types/weather.types.js";

// Kode wilayah adm4 Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran
const DEFAULT_ADM4_CODE = process.env.BMKG_ADM4_CODE ?? "32.18.01.2008";

export class WeatherService {
  /**
   * Mengambil data cuaca saat ini dengan mode HYBRID dan Graceful Fallback (SEC-20):
   * - Kondisi & icon cuaca per jam: Open-Meteo
   * - Suhu, kelembapan, laju & arah angin resmi: BMKG
   * - Jika salah satu provider down/502, sistem otomatis fallback penuh ke provider yang aktif.
   * - Mengembalikan null hanya jika kedua provider data gagal diakses.
   */
  static async getCurrent(adm4Code = DEFAULT_ADM4_CODE): Promise<CurrentWeather | null> {
    const [bmkgResult, openMeteoResult] = await Promise.allSettled([
      BmkgService.getCurrentWeather(adm4Code),
      OpenMeteoService.getCurrentCondition(),
    ]);

    const bmkg = bmkgResult.status === "fulfilled" ? bmkgResult.value : null;
    const openMeteo = openMeteoResult.status === "fulfilled" ? openMeteoResult.value : null;

    if (!bmkg && !openMeteo) {
      console.error("[WeatherService.getCurrent] Kedua penyedia data cuaca gagal:", {
        bmkgError: bmkgResult.status === "rejected" ? bmkgResult.reason : null,
        openMeteoError: openMeteoResult.status === "rejected" ? openMeteoResult.reason : null,
      });
      return null;
    }

    if (!bmkg && openMeteo) {
      console.warn(
        "[WeatherService.getCurrent] BMKG tidak tersedia. Mengaktifkan fallback penuh ke Open-Meteo."
      );
    } else if (bmkg && !openMeteo) {
      console.warn(
        "[WeatherService.getCurrent] Open-Meteo tidak tersedia. Mengaktifkan fallback penuh ke BMKG."
      );
    }

    return {
      temperature: bmkg ? bmkg.temperature : openMeteo!.temperature,
      humidity: bmkg ? bmkg.humidity : openMeteo!.humidity,
      weather: openMeteo ? openMeteo.weather : (bmkg?.weather ?? "Cerah Berawan"),
      windSpeed: bmkg ? bmkg.windSpeed : openMeteo!.windSpeed,
      windDirection: bmkg ? bmkg.windDirection : openMeteo!.windDirection,
      visibility: bmkg?.visibility?.trim() || openMeteo?.visibility || "> 10 km",
      updatedAt: openMeteo
        ? openMeteo.updatedAt
        : (bmkg?.updatedAt ?? new Date().toISOString()),
    };
  }

  /**
   * Mengambil prakiraan harian 5 hari dari Open-Meteo dengan fallback otomatis ke BMKG.
   */
  static async getForecast(adm4Code = DEFAULT_ADM4_CODE): Promise<ForecastItem[]> {
    try {
      return await OpenMeteoService.getForecast();
    } catch (openMeteoError) {
      console.warn(
        "[WeatherService.getForecast] Open-Meteo gagal, mencoba fallback ke BMKG:",
        openMeteoError instanceof Error ? openMeteoError.message : openMeteoError
      );
      return await BmkgService.getForecast(adm4Code);
    }
  }
}
