import type { Request, Response } from "express";
import { WeatherService } from "../services/weather.service.js";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  CurrentWeather,
  ForecastItem,
} from "../types/weather.types.js";

export class WeatherController {
  /**
   * GET /api/public/weather/current
   * Mengambil data cuaca hybrid (BMKG & Open-Meteo) dengan fallback resilien.
   */
  static async getCurrent(_req: Request, res: Response) {
    try {
      const data = await WeatherService.getCurrent();

      if (!data) {
        const response: ApiErrorResponse = {
          success: false,
          message: "Gagal mengambil data cuaca.",
          errors: [
            "Layanan data cuaca BMKG & Open-Meteo sementara tidak tersedia. Silakan coba beberapa saat lagi.",
          ],
        };
        return res.status(502).json(response);
      }

      const response: ApiSuccessResponse<CurrentWeather> = {
        success: true,
        message: "Current weather retrieved successfully.",
        data,
      };
      return res.status(200).json(response);
    } catch (error) {
      console.error("[WeatherController.getCurrent] unexpected error:", error);
      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil data cuaca.",
        errors: ["Terjadi kesalahan internal saat memproses data cuaca."],
      };
      return res.status(500).json(response);
    }
  }

  /**
   * GET /api/public/weather/forecast
   * Mengambil prakiraan cuaca 5 hari dengan graceful fallback.
   */
  static async getForecast(_req: Request, res: Response) {
    try {
      const data = await WeatherService.getForecast();

      const response: ApiSuccessResponse<ForecastItem[]> = {
        success: true,
        message: "Forecast retrieved successfully.",
        data,
      };
      return res.status(200).json(response);
    } catch (error) {
      console.error("[WeatherController.getForecast] error:", error);
      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil data prakiraan cuaca.",
        errors: [
          "Layanan data prakiraan cuaca sementara tidak tersedia. Silakan coba beberapa saat lagi.",
        ],
      };
      return res.status(502).json(response);
    }
  }
}
