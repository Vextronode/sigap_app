import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

// Data tiruan per URL; tidak ada request jaringan.
const responses: Record<string, unknown> = {};

mock.module(new URL("../src/utils/httpRetryWrapper.ts", import.meta.url).href, {
  namedExports: {
    requestWithRetry: async (url: string) => {
      const key = Object.keys(responses).find((prefix) => url.startsWith(prefix));
      if (!key) throw new Error(`URL tidak dimock: ${url}`);
      return responses[key];
    },
  },
});

const { OpenMeteoService } = await import("../src/services/openmeteo.service.js");
const { BmkgService } = await import("../src/services/bmkg.service.js");

const ZONES = ["UTC", "Asia/Jakarta", "America/New_York"];
const originalTz = process.env.TZ;

afterEach(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

/** Tanggal kalender WIB, mis. "2026-11-13". */
const wibDateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(date);

test("label hari prakiraan Open-Meteo sama di zona server mana pun (TK-05)", async () => {
  responses["https://api.open-meteo.com"] = {
    current_weather: { time: "2026-11-12T13:00", temperature: 30, windspeed: 5, winddirection: 90, weathercode: 1 },
    hourly: { time: [], weathercode: [], precipitation: [], precipitation_probability: [] },
    daily: {
      time: ["2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15"],
      weathercode: [1, 1, 1, 1],
      temperature_2m_max: [31, 31, 31, 31],
      temperature_2m_min: [24, 24, 24, 24],
      precipitation_probability_mean: [0, 0, 0, 0],
      precipitation_probability_max: [0, 0, 0, 0],
      precipitation_sum: [0, 0, 0, 0],
    },
  };

  for (const zone of ZONES) {
    process.env.TZ = zone;
    const labels = (await OpenMeteoService.getForecast()).map((item) => item.label);
    assert.deepEqual(labels, ["Hari Ini", "Besok", "Sab", "Min"], `zona ${zone}`);
  }
});

test("waktu cuaca BMKG memakai UTC, bukan local_datetime yang dianggap UTC (TK-05)", async () => {
  responses["https://api.bmkg.go.id"] = {
    data: [
      {
        cuaca: [
          [
            {
              local_datetime: "2026-11-12 13:00:00",
              utc_datetime: "2026-11-12 06:00:00",
              t: 30,
              hu: 70,
              weather_desc: "Cerah",
              ws: 5,
              wd: "E",
              vs_text: "> 10 km",
            },
          ],
        ],
      },
    ],
  };

  for (const zone of ZONES) {
    process.env.TZ = zone;
    const weather = await BmkgService.getCurrentWeather("32.18.01.2008");
    assert.equal(weather.updatedAt, "2026-11-12T06:00:00.000Z", `zona ${zone}`);
  }
});

test("label hari prakiraan cadangan BMKG sama di zona server mana pun (TK-05)", async () => {
  const now = Date.now();
  const tomorrow = new Date(now + 24 * 3_600_000);
  const localTime = (date: Date) => `${wibDateKey(date)} 12:00:00`;
  const utcTime = (date: Date) => `${wibDateKey(date)} 05:00:00`;

  responses["https://api.bmkg.go.id"] = {
    data: [
      {
        cuaca: [
          [
            { local_datetime: localTime(new Date(now)), utc_datetime: utcTime(new Date(now)), t: 30, hu: 70, weather_desc: "Cerah", ws: 5 },
            { local_datetime: localTime(tomorrow), utc_datetime: utcTime(tomorrow), t: 30, hu: 70, weather_desc: "Cerah", ws: 5 },
          ],
        ],
      },
    ],
  };

  const expected = new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "Asia/Jakarta" }).format(tomorrow);
  for (const zone of ZONES) {
    process.env.TZ = zone;
    const forecast = await BmkgService.getForecast("32.18.01.2008");
    assert.equal(forecast.at(-1)?.label, expected, `zona ${zone}`);
  }
});
