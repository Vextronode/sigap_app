import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

type StoredRecord = {
  eventTime: string;
  magnitude: number;
  depth: string;
  location: string;
  latitude: number;
  longitude: number;
  distanceToVillage: number;
  felt: string | null;
  potential: string | null;
  shakemap: string | null;
};

const state: { records: StoredRecord[]; upserts: StoredRecord[]; feeds: Record<string, unknown> } = {
  records: [],
  upserts: [],
  feeds: {},
};

mock.module(new URL("../src/utils/httpRetryWrapper.ts", import.meta.url).href, {
  namedExports: {
    requestWithRetry: async (url: string) => {
      const feed = Object.entries(state.feeds).find(([suffix]) => url.endsWith(suffix));
      if (!feed) throw new Error(`URL tidak dimock: ${url}`);
      return feed[1];
    },
  },
});

mock.module(new URL("../src/repositories/earthquakeRecord.repository.ts", import.meta.url).href, {
  namedExports: {
    EarthquakeRecordRepository: {
      findSince: async (from: string) => state.records.filter((record) => record.eventTime >= from),
      findByEventTime: async (eventTime: string) =>
        state.records.find((record) => record.eventTime === eventTime) ?? null,
      upsert: async (data: StoredRecord) => {
        state.upserts.push(data);
        state.records = [...state.records.filter((record) => record.eventTime !== data.eventTime), data];
        return { id: "x", createdAt: new Date(), updatedAt: new Date(), ...data };
      },
    },
  },
});

const { EarthquakeService } = await import("../src/services/earthquake.service.js");

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000);
const bmkgTime = (date: Date) => date.toISOString().replace(/\.\d+Z$/, "+00:00");

const item = (date: Date, extra: Record<string, string>) => ({
  Tanggal: "-",
  Jam: "-",
  DateTime: bmkgTime(date),
  Coordinates: "-7.90,108.40",
  Lintang: "7.90 LS",
  Bujur: "108.40 BT",
  Magnitude: "5.2",
  Kedalaman: "10 km",
  Wilayah: "35 km BaratDaya PANGANDARAN-JABAR",
  ...extra,
});

const record = (date: Date, felt: string): StoredRecord => ({
  eventTime: date.toISOString(),
  magnitude: 4.8,
  depth: "10 km",
  location: "40 km BaratDaya PANGANDARAN-JABAR",
  latitude: -7.95,
  longitude: 108.3,
  distanceToVillage: 40,
  felt,
  potential: "Tidak berpotensi tsunami",
  shakemap: null,
});

// Waktu BMKG tanpa milidetik, sama dengan format feed.
const atSecond = (date: Date) => new Date(Math.floor(date.getTime() / 1000) * 1000);
const live = atSecond(hoursAgo(1));
const sulawesi = atSecond(hoursAgo(2));

beforeEach(() => {
  state.upserts = [];
  state.records = [record(hoursAgo(20), "III Pangandaran")];
  state.feeds = {
    "autogempa.json": { Infogempa: { gempa: item(hoursAgo(30), { Potensi: "Tidak berpotensi tsunami" }) } },
    "gempaterkini.json": { Infogempa: { gempa: [item(live, { Potensi: "Tidak berpotensi tsunami" })] } },
    "gempadirasakan.json": {
      Infogempa: {
        gempa: [
          item(live, { Dirasakan: "III Pangandaran" }),
          item(sulawesi, { Coordinates: "-0.50,120.10", Dirasakan: "III Parigi Moutong" }),
        ],
      },
    },
  };
});

test("gempa aktif menggabungkan data live dan earthquake_records 24 jam", async () => {
  const events = await EarthquakeService.getActiveEvents();
  const times = events.map((event) => event.updatedAt);

  assert.equal(events.length, 2);
  assert.ok(times.includes(live.toISOString()));
  assert.ok(times.includes(state.records[0].eventTime));
  assert.ok(!times.includes(sulawesi.toISOString()), "gempa Parigi Moutong tidak relevan");

  const merged = events.find((event) => event.updatedAt === live.toISOString());
  assert.equal(merged?.felt, "III Pangandaran");
  assert.equal(merged?.tsunamiPotential, "TIDAK_BERPOTENSI");
});

test("kejadian live hanya disimpan bila baru atau berubah", async () => {
  await EarthquakeService.getActiveEvents();
  assert.equal(state.upserts.length, 1);
  assert.equal(state.upserts[0].eventTime, live.toISOString());

  state.upserts = [];
  await EarthquakeService.getActiveEvents();
  assert.equal(state.upserts.length, 0);
});
