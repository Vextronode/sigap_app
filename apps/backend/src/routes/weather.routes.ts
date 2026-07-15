import { Router } from "express";
import { BmkgService } from "../services/bmkg.service.js";
import type { ApiErrorResponse, ApiSuccessResponse, CurrentWeather, ForecastItem } from "../types/weather.types.js";

export const weatherRouter = Router();

// Kode wilayah adm4 untuk Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran
const DEFAULT_ADM4_CODE = process.env.BMKG_ADM4_CODE ?? "32.18.01.2008";

/** GET /api/v1/weather/current — sesuai API_SPEC.md §8.1 */
weatherRouter.get("/current", async (_req, res) => {
  try {
    const data = await BmkgService.getCurrentWeather(DEFAULT_ADM4_CODE);
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
      message: "Gagal mengambil data cuaca dari BMKG",
      errors: [error instanceof Error ? error.message : String(error)],
    };
    res.status(502).json(response);
  }
});

/** GET /api/v1/weather/forecast — sesuai API_SPEC.md §8.2 */
weatherRouter.get("/forecast", async (_req, res) => {
  try {
    const data = await BmkgService.getForecast(DEFAULT_ADM4_CODE);
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
      message: "Gagal mengambil data prakiraan cuaca dari BMKG",
      errors: [error instanceof Error ? error.message : String(error)],
    };
    res.status(502).json(response);
  }
});
