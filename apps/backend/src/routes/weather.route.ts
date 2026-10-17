import { Router } from "express";
import { BmkgService } from "../services/bmkg.service.js";
import { OpenMeteoService } from "../services/openmeteo.service.js";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  CurrentWeather,
  ForecastItem,
} from "../types/weather.types.js";

export const publicWeatherRouter = Router();

// Kode wilayah adm4 Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran
const DEFAULT_ADM4_CODE = process.env.BMKG_ADM4_CODE ?? "32.18.01.2008";

/**
 * GET /api/public/weather/current  —  mode HYBRID dengan Graceful Fallback
 *
 * - Ideal (Keduanya Sehat):
 *   - Kondisi cuaca (Berawan, Hujan, Gerimis, dll) & update per jam → Open-Meteo
 *   - Suhu, kelembapan, laju & arah angin, jarak pandang resmi → BMKG
 *
 * - Resiliensi / Graceful Degradation (SEC-20):
 *   - Jika API BMKG lambat / down / 502, sistem otomatis beralih menggunakan
 *     seluruh metrik Open-Meteo sehingga UI dashboard tidak pernah blank/error 502.
 *   - Jika Open-Meteo down, sistem menggunakan data BMKG.
 *   - Kegagalan 502 hanya terjadi jika kedua provider data sekaligus tidak dapat diakses.
 */
publicWeatherRouter.get("/current", async (_req, res) => {
  try {
    const [bmkgResult, openMeteoResult] = await Promise.allSettled([
      BmkgService.getCurrentWeather(DEFAULT_ADM4_CODE),
      OpenMeteoService.getCurrentCondition(),
    ]);

    const bmkg = bmkgResult.status === "fulfilled" ? bmkgResult.value : null;
    const openMeteo =
      openMeteoResult.status === "fulfilled" ? openMeteoResult.value : null;

    if (!bmkg && !openMeteo) {
      console.error("[GET /weather/current] Kedua penyedia data cuaca gagal:", {
        bmkgError:
          bmkgResult.status === "rejected" ? bmkgResult.reason : null,
        openMeteoError:
          openMeteoResult.status === "rejected" ? openMeteoResult.reason : null,
      });

      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil data cuaca.",
        errors: [
          "Layanan data cuaca BMKG & Open-Meteo sementara tidak tersedia. Silakan coba beberapa saat lagi.",
        ],
      };
      return res.status(502).json(response);
    }

    if (!bmkg && openMeteo) {
      console.warn(
        "[GET /weather/current] BMKG tidak tersedia. Mengaktifkan fallback penuh ke Open-Meteo."
      );
    } else if (bmkg && !openMeteo) {
      console.warn(
        "[GET /weather/current] Open-Meteo tidak tersedia. Mengaktifkan fallback penuh ke BMKG."
      );
    }

    const data: CurrentWeather = {
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

    const response: ApiSuccessResponse<CurrentWeather> = {
      success: true,
      message: "Current weather retrieved successfully.",
      data,
    };
    return res.json(response);
  } catch (error) {
    console.error("[GET /weather/current] unexpected error:", error);
    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal mengambil data cuaca.",
      errors: ["Terjadi kesalahan internal saat memproses data cuaca."],
    };
    return res.status(500).json(response);
  }
});

/**
 * GET /api/public/weather/forecast
 *
 * Prakiraan harian 5 hari dari Open-Meteo — satu item per hari penuh.
 * Jika Open-Meteo mengalami gangguan, sistem otomatis fallback ke prakiraan BMKG.
 */
publicWeatherRouter.get("/forecast", async (_req, res) => {
  try {
    let data: ForecastItem[];
    try {
      data = await OpenMeteoService.getForecast();
    } catch (openMeteoError) {
      console.warn(
        "[GET /weather/forecast] Open-Meteo gagal, mencoba fallback ke BMKG:",
        openMeteoError instanceof Error ? openMeteoError.message : openMeteoError
      );
      data = await BmkgService.getForecast(DEFAULT_ADM4_CODE);
    }

    const response: ApiSuccessResponse<ForecastItem[]> = {
      success: true,
      message: "Forecast retrieved successfully.",
      data,
    };
    return res.json(response);
  } catch (error) {
    console.error("[GET /weather/forecast] error:", error);
    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal mengambil data prakiraan cuaca.",
      errors: [
        "Layanan data prakiraan cuaca sementara tidak tersedia. Silakan coba beberapa saat lagi.",
      ],
    };
    return res.status(502).json(response);
  }
});

