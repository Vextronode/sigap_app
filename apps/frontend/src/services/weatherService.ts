import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { CurrentWeather, WeatherForecastItem } from "../types/dashboard";

export const weatherService = {
  getCurrent: async (village = "cibenda") => {
    const response = await apiClient.get<ApiResponse<CurrentWeather>>("/weather/current", {
      params: { village },
    });
    return response.data.data;
  },
  getForecast: async () => {
    const response = await apiClient.get<ApiResponse<WeatherForecastItem[]>>("/weather/forecast");
    return response.data.data;
  },
};
