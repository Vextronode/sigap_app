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
 * GET /api/public/weather/current  —  mode HYBRID
 *
 * - Kondisi cuaca (Berawan, Hujan, Gerimis dll) → Open-Meteo
 *   Alasan: update tiap jam, jauh lebih akurat dibanding BMKG Public
 *   yang update 2x sehari dan tidak mencerminkan kondisi sub-07:00 WIB.
 *
 * - Suhu, kelembapan, laju & arah angin, jarak pandang → BMKG
 *   Alasan: sesuai permintaan agar metrik kuantitatif konsisten dengan
 *   data resmi BMKG yang ditampilkan di portal BMKG.
 *
 * Kedua API dipanggil paralel (Promise.all) agar latensi minimal.
 */
publicWeatherRouter.get("/current", async (_req, res) => {
  try {
    const [bmkg, openMeteo] = await Promise.all([
      BmkgService.getCurrentWeather(DEFAULT_ADM4_CODE),
      OpenMeteoService.getCurrentCondition(),
    ]);

    const data: CurrentWeather = {
      temperature:   bmkg.temperature,
      humidity:      bmkg.humidity,
      weather:       openMeteo.weather,   // Open-Meteo: kondisi lebih akurat
      windSpeed:     bmkg.windSpeed,
      windDirection: bmkg.windDirection,
      visibility:    bmkg.visibility,
      updatedAt:     openMeteo.updatedAt, // Open-Meteo: lebih fresh (tiap jam)
    };

    const response: ApiSuccessResponse<CurrentWeather> = {
      success: true,
      message: "Current weather retrieved successfully.",
      data,
    };
    res.json(response);
  } catch (error) {
    console.error("[GET /weather/current] error:", error);
    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal mengambil data cuaca.",
      errors: [error instanceof Error ? error.message : String(error)],
    };
    res.status(502).json(response);
  }
});

/**
 * GET /api/public/weather/forecast
 *
 * Prakiraan harian 5 hari dari Open-Meteo — satu item per hari penuh,
 * bukan per slot 3 jam. Cocok untuk petani & nelayan yang butuh
 * gambaran cuaca per hari, bukan per slot siang/sore yang membingungkan.
 */
publicWeatherRouter.get("/forecast", async (_req, res) => {
  try {
    const data = await OpenMeteoService.getForecast();
    const response: ApiSuccessResponse<ForecastItem[]> = {
      success: true,
      message: "Forecast retrieved successfully.",
      data,
    };
    res.json(response);
  } catch (error) {
    console.error("[GET /weather/forecast] error:", error);
    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal mengambil data prakiraan cuaca dari Open-Meteo.",
      errors: [error instanceof Error ? error.message : String(error)],
    };
    res.status(502).json(response);
  }
});

