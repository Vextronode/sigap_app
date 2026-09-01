/**
 * Service cuaca menggunakan Open-Meteo API (https://open-meteo.com).
 *
 * Dipilih menggantikan BMKG Public API untuk endpoint /weather/current
 * dan /weather/forecast karena:
 *   - BMKG Public API hanya update 2x sehari (07:00 & 19:00 WIB) → tidak
 *     mencerminkan kondisi aktual, mis. hujan sebelum jam 07.00 masih tampil
 *     "Cerah" sampai update berikutnya.
 *   - Open-Meteo update setiap jam, gratis, tanpa API key, open-source.
 *   - Suhu/kelembapan/kecepatan angin tetap tersedia dan tetap akurat.
 *
 * BMKG tetap dipakai untuk data gempa bumi & tsunami (lihat bmkg.service.ts).
 *
 * Dokumen WMO weather code: https://open-meteo.com/en/docs#weathervariables
 * Koordinat Desa Cibenda: LAT -7.6838, LON 108.5610 (default; bisa di-override via env).
 */

import { requestWithRetry } from "../utils/httpRetryWrapper.js";
import type { CurrentWeather, ForecastItem } from "../types/weather.types.js";

// ---------------------------------------------------------------------------
// Koordinat & URL
// ---------------------------------------------------------------------------

const LAT = parseFloat(process.env.VILLAGE_LAT ?? "-7.6838");
const LON = parseFloat(process.env.VILLAGE_LON ?? "108.5610");

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// ---------------------------------------------------------------------------
// Tipe respons Open-Meteo (subset yang dipakai)
// ---------------------------------------------------------------------------

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
    is_day: number; // 1 = siang, 0 = malam
  };
  hourly: {
    time: string[];
    relativehumidity_2m: number[];
    precipitation_probability: number[];
    visibility: number[]; // dalam meter
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_mean: number[];
  };
}

// ---------------------------------------------------------------------------
// Pemetaan kode WMO → teks kondisi cuaca (Bahasa Indonesia)
// Teks mengandung kata kunci yang dikenali classifyWeather() di frontend
// (mis. "Hujan", "Berawan", "Badai", "Cerah") agar ikon & indikator tetap akurat.
// ---------------------------------------------------------------------------

const WMO_CONDITION: Record<number, string> = {
  0: "Cerah",
  1: "Cerah",
  2: "Cerah Berawan",
  3: "Berawan",
  45: "Berkabut",
  48: "Berkabut",
  51: "Gerimis Ringan",  // Drizzle: Light intensity
  53: "Gerimis Sedang",  // Drizzle: Moderate intensity
  55: "Gerimis Lebat",   // Drizzle: Dense intensity
  56: "Gerimis",
  57: "Gerimis Lebat",
  61: "Hujan Ringan",
  63: "Hujan Sedang",
  65: "Hujan Lebat",
  66: "Hujan Ringan",
  67: "Hujan Lebat",
  71: "Hujan Ringan",
  73: "Hujan Sedang",
  75: "Hujan Lebat",
  77: "Hujan Ringan",
  80: "Hujan Ringan",
  81: "Hujan Sedang",
  82: "Hujan Lebat",
  85: "Hujan Sedang",
  86: "Hujan Lebat",
  95: "Badai Petir",
  96: "Badai Petir",
  99: "Badai Petir Lebat",
};

/** Konversi derajat angin → arah kompas (8 penjuru) */
function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  return dirs[Math.round(deg / 45) % 8];
}

/** Konversi kode WMO → teks kondisi. Fallback ke "Cerah Berawan" jika kode tidak dikenal. */
function wmoToCondition(code: number): string {
  return WMO_CONDITION[code] ?? "Cerah Berawan";
}

// ---------------------------------------------------------------------------
// Label hari prakiraan (Bahasa Indonesia)
// ---------------------------------------------------------------------------

const DAY_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

function buildDayLabel(dateStr: string, indexFromToday: number): string {
  if (indexFromToday === 0) return "Hari Ini";
  if (indexFromToday === 1) return "Besok";
  const date = new Date(`${dateStr}T00:00:00+07:00`);
  return DAY_ID[date.getDay()];
}

// ---------------------------------------------------------------------------
// OpenMeteoService
// ---------------------------------------------------------------------------

export class OpenMeteoService {
  /** Fetch lengkap (current_weather + hourly + daily) — untuk forecast. */
  private static fetchRaw(): Promise<OpenMeteoResponse> {
    return requestWithRetry<OpenMeteoResponse>(
      BASE_URL,
      {
        params: {
          latitude: LAT,
          longitude: LON,
          current_weather: true,
          hourly: [
            "relativehumidity_2m",
            "precipitation_probability",
            "visibility",
          ].join(","),
          daily: [
            "weathercode",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_mean",
          ].join(","),
          timezone: "Asia/Jakarta",
          forecast_days: 5,
        },
      },
      { retries: 3, retryDelayMs: 1000, backoffFactor: 2, timeoutMs: 8000 }
    );
  }

  /**
   * Fetch ringan — hanya current_weather, tanpa hourly/daily.
   * Dipakai oleh getCurrentCondition() agar tidak membebani quota
   * saat endpoint /weather/current dipanggil (forecast punya fetchRaw sendiri).
   */
  private static fetchCurrentOnly(): Promise<Pick<OpenMeteoResponse, "current_weather">> {
    return requestWithRetry<Pick<OpenMeteoResponse, "current_weather">>(
      BASE_URL,
      {
        params: {
          latitude: LAT,
          longitude: LON,
          current_weather: true,
          timezone: "Asia/Jakarta",
        },
      },
      { retries: 3, retryDelayMs: 1000, backoffFactor: 2, timeoutMs: 8000 }
    );
  }

  /**
   * Hanya kondisi cuaca saat ini (WMO code → teks Indonesia) + timestamp.
   *
   * Digunakan oleh /weather/current dalam mode hybrid:
   *   - Kondisi (cerah/hujan/gerimis dll) dari Open-Meteo — update tiap jam
   *   - Suhu, kelembapan, angin dari BMKG — sesuai permintaan user
   */
  static async getCurrentCondition(): Promise<{ weather: string; updatedAt: string }> {
    const raw = await this.fetchCurrentOnly();
    const cw = raw.current_weather;

    return {
      weather: wmoToCondition(cw.weathercode),
      updatedAt: new Date(
        cw.time.includes("+") || cw.time.includes("Z")
          ? cw.time
          : `${cw.time}+07:00`
      ).toISOString(),
    };
  }

  /**
   * GET /weather/forecast
   *
   * Prakiraan harian 5 hari — satu item per hari, bukan per slot 3 jam.
   * Suhu yang ditampilkan adalah suhu maksimum harian.
   * Probabilitas hujan menggunakan precipitation_probability_mean (rata-rata harian yang realistis,
   * bukan lonjakan spike 15-menit di tengah malam agar tidak membingungkan warga).
   */
  static async getForecast(): Promise<ForecastItem[]> {
    const raw = await this.fetchRaw();
    const { daily } = raw;

    return daily.time.map((dateStr, i) => ({
      label: buildDayLabel(dateStr, i),
      date: dateStr,
      condition: wmoToCondition(daily.weathercode[i]),
      temperature: Math.round(daily.temperature_2m_max[i]),
      rainProbability: daily.precipitation_probability_mean[i] ?? 0,
    }));
  }
}
