import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { CurrentWeather, WeatherForecastItem } from "../types/dashboard";

export const weatherService = {
  getCurrent: async (village = "cibenda") => {
    const response = await apiClient.get<ApiResponse<CurrentWeather>>("/public/weather/current", {
      params: { village },
    });
    return response.data.data;
  },
  getForecast: async () => {
    const response = await apiClient.get<ApiResponse<WeatherForecastItem[]>>("/public/weather/forecast");
    return response.data.data;
  },
};
