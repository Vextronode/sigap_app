import { Router } from "express";
import { WeatherController } from "../controllers/weather.controller.js";

export const publicWeatherRouter = Router();

/**
 * GET /api/public/weather/current
 * Mode HYBRID dengan Graceful Fallback (BMKG + Open-Meteo)
 */
publicWeatherRouter.get("/current", WeatherController.getCurrent);

/**
 * GET /api/public/weather/forecast
 * Prakiraan harian 5 hari dari Open-Meteo dengan fallback BMKG
 */
publicWeatherRouter.get("/forecast", WeatherController.getForecast);
