/**
 * Type sesuai kontrak resmi `API_SPEC.md` v2.0 (by Naufal Fadhiil) —
 * endpoint /weather/current dan /weather/forecast.
 *
 * Ini MENGGANTIKAN pendekatan sebelumnya (environmentalData.types.ts yang
 * ikut OpenAPI schemas/environmental.yaml) untuk task SIG-117, karena
 * dikonfirmasi API_SPEC.md ini yang valid.
 */

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
}

/** Response bentuk `/weather/current` */
export interface CurrentWeather {
  temperature: number;
  humidity: number;
  weather: string;
  windSpeed: number;
  windDirection: string;
  visibility: string;
  updatedAt: string; // ISO 8601
}

/** Satu item response bentuk `/weather/forecast` */
export interface ForecastItem {
  label: string;
  date: string;
  condition: string;
  temperature: number;
  rainProbability: number;
}
