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

const state: { records: StoredRecord[]; feeds: Record<string, unknown>; failing: string[] } = {
  records: [],
  feeds: {},
  failing: [],
};

mock.module(new URL("../src/utils/httpRetryWrapper.ts", import.meta.url).href, {
  namedExports: {
    requestWithRetry: async (url: string) => {
      if (state.failing.some((suffix) => url.endsWith(suffix))) throw new Error(`gagal: ${url}`);
      const feed = Object.entries(state.feeds).find(([suffix]) => url.endsWith(suffix));
      if (!feed) throw new Error(`URL tidak dimock: ${url}`);
      return feed[1];
    },
  },
});

mock.module(new URL("../src/repositories/earthquakeRecord.repository.ts", import.meta.url).href, {
  namedExports: {
    EarthquakeRecordRepository: {
      findRecent: async (take: number) =>
        [...state.records].sort((a, b) => b.eventTime.localeCompare(a.eventTime)).slice(0, take),
    },
  },
});

mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-28T03:00:00Z") });

const { EarthquakeService } = await import("../src/services/earthquake.service.js");

// Waktu BMKG tanpa milidetik, sama dengan format feed.
const hoursAgo = (hours: number) => new Date(Math.floor((Date.now() - hours * 3_600_000) / 1000) * 1000);
const daysAgo = (days: number) => hoursAgo(days * 24);
const bmkgTime = (date: Date) => date.toISOString().replace(/\.\d+Z$/, "+00:00");

const item = (date: Date, extra: Record<string, string> = {}) => ({
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

const record = (date: Date, extra: Partial<StoredRecord> = {}): StoredRecord => ({
  eventTime: date.toISOString(),
  magnitude: 4.8,
  depth: "10 km",
  location: "40 km BaratDaya PANGANDARAN-JABAR",
  latitude: -7.95,
  longitude: 108.3,
  distanceToVillage: 40,
  felt: null,
  potential: null,
  shakemap: null,
  ...extra,
});

const feeds = (auto: object, terkini: object[], dirasakan: object[]) => ({
  "autogempa.json": { Infogempa: { gempa: auto } },
  "gempaterkini.json": { Infogempa: { gempa: terkini } },
  "gempadirasakan.json": { Infogempa: { gempa: dirasakan } },
});

beforeEach(() => {
  // Melewati cache peta dan cache feed (30 detik) dari tes sebelumnya.
  mock.timers.tick(60_000);
  state.records = [];
  state.failing = [];
});

test("peta: kejadian yang sama dari beberapa feed menjadi satu titik dengan data gabungan (ADR-046)", async () => {
  const event = hoursAgo(1);
  state.feeds = feeds(
    item(event, { Potensi: "", Shakemap: "20261128.mmi.jpg" }),
    [item(event, { Potensi: "Tidak berpotensi tsunami" })],
    [item(event, { Dirasakan: "III Pangandaran" })]
  );

  const points = await EarthquakeService.getMapPoints();
  assert.equal(points.length, 1);
  assert.equal(points[0].potential, "Tidak berpotensi tsunami");
  assert.equal(points[0].felt, "III Pangandaran");
  assert.match(points[0].shakemap, /20261128\.mmi\.jpg$/);
});

test("peta: koordinat di luar wilayah Indonesia tidak ditampilkan", async () => {
  state.feeds = feeds(
    item(hoursAgo(1)),
    [item(hoursAgo(2), { Coordinates: "35.68,139.69", Lintang: "35.68 LU", Bujur: "139.69 BT" })],
    []
  );

  const points = await EarthquakeService.getMapPoints();
  assert.equal(points.length, 1);
  assert.equal(points[0].updatedAt, hoursAgo(1).toISOString());
});

test("peta: rekaman database hanya ditambahkan bila berumur paling lama 7 hari", async () => {
  state.feeds = feeds(item(hoursAgo(1)), [], []);
  const recent = daysAgo(6);
  state.records = [record(recent), record(daysAgo(8))];

  const points = await EarthquakeService.getMapPoints();
  assert.deepEqual(
    points.map((point) => point.updatedAt),
    [hoursAgo(1).toISOString(), recent.toISOString()]
  );
});

test("peta: rekaman database yang lebih tua tetap melengkapi shakemap titik feed", async () => {
  const oldEvent = daysAgo(10);
  state.feeds = feeds(item(hoursAgo(1)), [item(oldEvent)], []);
  state.records = [record(oldEvent, { shakemap: "https://data.bmkg.go.id/old.mmi.jpg" })];

  const points = await EarthquakeService.getMapPoints();
  const old = points.find((point) => point.updatedAt === oldEvent.toISOString());
  assert.equal(old?.shakemap, "https://data.bmkg.go.id/old.mmi.jpg");
});

test("peta: titik diurutkan dari kejadian terbaru", async () => {
  state.feeds = feeds(item(hoursAgo(5)), [item(hoursAgo(1)), item(hoursAgo(30))], [item(hoursAgo(3))]);

  const points = await EarthquakeService.getMapPoints();
  assert.deepEqual(
    points.map((point) => point.updatedAt),
    [1, 3, 5, 30].map((hours) => hoursAgo(hours).toISOString())
  );
});

test("peta: satu feed BMKG gagal tidak menghilangkan titik dari feed lain", async () => {
  state.feeds = feeds(item(hoursAgo(1)), [item(hoursAgo(2))], [item(hoursAgo(3))]);
  state.failing = ["gempadirasakan.json"];

  const points = await EarthquakeService.getMapPoints();
  assert.equal(points.length, 2);
});
