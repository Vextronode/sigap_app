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
    precipitation?: number[];
    weathercode?: number[];
    visibility: number[]; // dalam meter
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_mean: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
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
  72: "Hujan Sedang",
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
            "weathercode",
            "precipitation",
            "precipitation_probability",
            "relativehumidity_2m",
            "visibility",
          ].join(","),
          daily: [
            "weathercode",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_mean",
            "precipitation_probability_max",
            "precipitation_sum",
          ].join(","),
          timezone: "Asia/Jakarta",
          forecast_days: 5,
        },
      },
      { retries: 1, retryDelayMs: 500, backoffFactor: 2, timeoutMs: 6000 }
    );
  }

  /**
   * Fetch ringan — current_weather + hourly visibility & kelembapan 1 hari.
   * Dipakai oleh getCurrentCondition() agar menyediakan kondisi cuaca,
   * metrik komprehensif, serta jarak pandang fallback jika BMKG tidak tersedia.
   */
  private static fetchCurrentOnly(): Promise<{
    current_weather: OpenMeteoResponse["current_weather"];
    hourly?: {
      time: string[];
      visibility?: number[];
      relativehumidity_2m?: number[];
    };
  }> {
    return requestWithRetry<{
      current_weather: OpenMeteoResponse["current_weather"];
      hourly?: {
        time: string[];
        visibility?: number[];
        relativehumidity_2m?: number[];
      };
    }>(
      BASE_URL,
      {
        params: {
          latitude: LAT,
          longitude: LON,
          current_weather: true,
          hourly: "visibility,relativehumidity_2m",
          forecast_days: 1,
          timezone: "Asia/Jakarta",
        },
      },
      { retries: 1, retryDelayMs: 500, backoffFactor: 2, timeoutMs: 6000 }
    );
  }

  /**
   * Kondisi cuaca saat ini (WMO code → teks Indonesia) + jarak pandang fallback + timestamp.
   *
   * Digunakan oleh /weather/current dalam mode hybrid:
   *   - Kondisi (cerah/hujan/gerimis dll) dari Open-Meteo — update tiap jam
   *   - Suhu, kelembapan, angin dari BMKG (atau fallback Open-Meteo jika BMKG down)
   *   - Jarak pandang: fallback Open-Meteo jika BMKG mengembalikan null
   */
  static async getCurrentCondition(): Promise<{
    weather: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    visibility: string;
    updatedAt: string;
  }> {
    const raw = await this.fetchCurrentOnly();
    const cw = raw.current_weather;

    let visibility = "";
    let humidity = 80;
    if (raw.hourly?.time) {
      const idx = raw.hourly.time.indexOf(cw.time);
      const chosenIdx = idx >= 0 ? idx : 0;
      if (
        raw.hourly.visibility &&
        typeof raw.hourly.visibility[chosenIdx] === "number"
      ) {
        const vsMeters = raw.hourly.visibility[chosenIdx];
        visibility =
          vsMeters >= 10000
            ? "> 10 km"
            : `${Math.max(1, Math.round(vsMeters / 1000))} km`;
      }
      if (
        raw.hourly.relativehumidity_2m &&
        typeof raw.hourly.relativehumidity_2m[chosenIdx] === "number"
      ) {
        humidity = Math.round(raw.hourly.relativehumidity_2m[chosenIdx]);
      }
    }

    return {
      weather: wmoToCondition(cw.weathercode),
      temperature: Math.round(cw.temperature),
      humidity,
      windSpeed: Math.round(cw.windspeed),
      windDirection: degreesToCompass(cw.winddirection),
      visibility: visibility || "> 10 km",
      updatedAt: new Date(
        cw.time.includes("+") || cw.time.includes("Z")
          ? cw.time
          : `${cw.time}+07:00`
      ).toISOString(),
    };
  }

  /**
   * Menentukan kode WMO yang paling representatif untuk aktivitas warga pada tanggal tertentu.
   *
   * Catatan Penting Meteorologi:
   * Open-Meteo secara default mendefinisikan `daily.weathercode` sebagai nilai WMO terburuk (MAX)
   * dalam 24 jam (00:00 - 23:59). Di pesisir Desa Cibenda, kelembapan subuh (03:00 - 05:00)
   * sering mencapai 95-99% dan memicu pembacaan drizzle mikro (WMO 51/53 selama 30 menit).
   * Jika nilai MAX mentah dipakai, maka seluruh hari akan dicap "Gerimis Sedang" meskipun
   * dari jam 07:00 hingga 18:00 WIB cuaca cerah benderang (presipitasi siang 0 mm, probabilitas < 15%).
   *
   * Algoritma ini menganalisis:
   * 1. Presipitasi nyata di jam siang hari produktif warga (06:00 - 18:00 WIB).
   * 2. Jika hari tersebut diprediksi badai petir (WMO 95-99), langsung tampilkan demi keselamatan.
   * 3. Jika presipitasi total harian sangat minim (< 1.5 mm) dan probabilitas hujan rendah (< 30%),
   *    kondisi cuaca harian disesuaikan dengan kondisi langit dominan di jam siang (Cerah / Cerah Berawan / Berawan).
   * 4. Jika ada curah hujan siang hari yang nyata (>= 1.5 mm atau probabilitas >= 50%),
   *    kondisi hujan/gerimis tetap dipertahankan.
   */
  private static determineRepresentativeCondition(
    rawDailyCode: number,
    dateStr: string,
    hourly: OpenMeteoResponse["hourly"],
    precipSum: number,
    probMean: number
  ): string {
    // 1. Keadaan darurat keselamatan: Badai petir selalu diutamakan
    if (rawDailyCode >= 95) {
      return wmoToCondition(rawDailyCode);
    }

    // 2. Jika tidak ada data hourly, fallback ke WMO harian
    if (!hourly?.time || !hourly.weathercode) {
      return wmoToCondition(rawDailyCode);
    }

    // 3. Ambil data jam aktif siang hari (06:00 - 18:00 WIB)
    const dayIndices: number[] = [];
    hourly.time.forEach((t, idx) => {
      if (t.startsWith(dateStr)) {
        const hour = parseInt(t.slice(11, 13), 10);
        if (hour >= 6 && hour <= 18) {
          dayIndices.push(idx);
        }
      }
    });

    if (dayIndices.length === 0) {
      return wmoToCondition(rawDailyCode);
    }

    // Hitung presipitasi dan probabilitas tertinggi di jam siang
    const dayPrecip = dayIndices.reduce(
      (sum, idx) => sum + (hourly.precipitation?.[idx] || 0),
      0
    );
    const dayMaxProb = Math.max(
      ...dayIndices.map((idx) => hourly.precipitation_probability[idx] || 0)
    );

    // Hitung frekuensi kode WMO di jam siang
    const codeCount: Record<number, number> = {};
    dayIndices.forEach((idx) => {
      const c = hourly.weathercode![idx];
      codeCount[c] = (codeCount[c] || 0) + 1;
    });

    // Kode yang paling sering muncul di jam siang
    const sortedCodes = Object.keys(codeCount).sort(
      (a, b) => codeCount[parseInt(b, 10)] - codeCount[parseInt(a, 10)]
    );
    const dominantDayCode = parseInt(sortedCodes[0] || "1", 10);

    // Hitung jumlah jam hujan/gerimis (WMO >= 51) di siang hari
    const wetDayHours = dayIndices.filter(
      (idx) => (hourly.weathercode![idx] || 0) >= 51
    ).length;

    // KASUS A: Jika hujan siang hari nyata dan bertahan lama (>= 3 jam atau curah >= 1.5mm atau prob >= 60%)
    if (wetDayHours >= 3 || dayPrecip >= 1.5 || dayMaxProb >= 60) {
      return wmoToCondition(rawDailyCode);
    }

    // KASUS B: Presipitasi sangat minim / hanya embun subuh sesaat (precipSum < 1.5 mm, dayPrecip < 1.0 mm)
    // dan sebagian besar siang hari cerah atau berawan
    if (precipSum < 1.5 && (probMean < 30 || dayMaxProb < 45)) {
      return wmoToCondition(dominantDayCode);
    }

    // KASUS C: Default fallback ke kode harian jika ada curah hujan terukur
    return wmoToCondition(rawDailyCode);
  }

  /**
   * GET /weather/forecast
   *
   * Prakiraan harian 5 hari — satu item per hari.
   * Suhu yang ditampilkan adalah suhu maksimum harian.
   * Kondisi cuaca dihitung representatif agar mencerminkan kondisi lapangan sebenarnya di Desa Cibenda.
   */
  static async getForecast(): Promise<ForecastItem[]> {
    const raw = await this.fetchRaw();
    const { daily, hourly } = raw;

    return daily.time.map((dateStr, i) => {
      const rawCode = daily.weathercode[i];
      const precipSum = daily.precipitation_sum?.[i] ?? 0;
      const probMean = daily.precipitation_probability_mean[i] ?? 0;
      const probMax = daily.precipitation_probability_max?.[i] ?? probMean;

      const condition = this.determineRepresentativeCondition(
        rawCode,
        dateStr,
        hourly,
        precipSum,
        probMean
      );

      // Probabilitas hujan realistis: jika kondisi disimpulkan cerah/kering dengan presipitasi 0,
      // tampilkan persentase yang rendah dan akurat
      let rainProbability = Math.round(probMean);
      if (precipSum === 0 && probMax < 25) {
        rainProbability = Math.min(rainProbability, 10);
      }

      return {
        label: buildDayLabel(dateStr, i),
        date: dateStr,
        condition,
        temperature: Math.round(daily.temperature_2m_max[i]),
        rainProbability,
      };
    });
  }
}
