import { apiClient, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { CurrentWeather, WeatherForecastItem } from "../types/dashboard";

export const weatherService = {
  getCurrent: async () => {
    const response = await apiClient.get<ApiResponse<CurrentWeather>>(publicPath("/weather/current"));
    return response.data.data;
  },
  getForecast: async () => {
    const response = await apiClient.get<ApiResponse<WeatherForecastItem[]>>(publicPath("/weather/forecast"));
    return response.data.data;
  },
};
