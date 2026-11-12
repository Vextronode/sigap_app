import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

type State = {
  latest: Record<string, unknown> | null;
  dbDown: boolean;
  bmkgUp: boolean;
  quake: Record<string, unknown> | null;
  /** Daftar gempa untuk skenario rentetan; bila kosong memakai `quake`. */
  quakes: Record<string, unknown>[] | null;
  quakeThrows: boolean;
  saved: Record<string, unknown>[];
  extended: number;
  pushLogs: number;
};

const initialState = (): State => ({
  latest: null,
  dbDown: false,
  bmkgUp: true,
  quake: null,
  quakes: null,
  quakeThrows: false,
  saved: [],
  extended: 0,
  pushLogs: 0,
});

let state = initialState();

const whenDbUp = <T>(value: () => T) => {
  if (state.dbDown) throw new Error("db down");
  return value();
};

const src = (path: string) => new URL(`../src/${path}`, import.meta.url).href;

const LAST_FEED_SUCCESS_AT = "2026-11-12T03:00:00.000Z";

mock.module(src("config/prisma.ts"), {
  namedExports: {
    prisma: {
      alert: {
        findFirst: async () => whenDbUp(() => state.latest),
        create: async ({ data }: { data: Record<string, unknown> }) =>
          whenDbUp(() => {
            state.saved.push(data);
            state.latest = record({ id: `n${state.saved.length}`, ...data });
            return state.latest;
          }),
        update: async ({ data }: { data: Record<string, unknown> }) =>
          whenDbUp(() => {
            state.extended++;
            state.latest = { ...state.latest, ...data };
            return state.latest;
          }),
      },
      pushSubscription: { findMany: async () => [] },
      notificationLog: {
        create: async () => {
          state.pushLogs++;
          return {};
        },
      },
    },
  },
});
mock.module(src("services/earthquake.service.ts"), {
  namedExports: {
    EarthquakeService: {
      getPangandaran: async () => {
        if (state.quakeThrows) throw new Error("gagal");
        return state.quake;
      },
      getActiveEvents: async () => {
        if (state.quakeThrows) throw new Error("gagal");
        const events = state.quakes ?? (state.quake ? [state.quake] : []);
        return events.filter(
          (event) => Date.now() - new Date(String(event.updatedAt)).getTime() <= 24 * 3_600_000
        );
      },
      isLiveDataAvailable: async () => state.bmkgUp,
      getLastFeedSuccessAt: () => LAST_FEED_SUCCESS_AT,
    },
  },
});
mock.module(src("config/webPush.ts"), {
  namedExports: {
    webpush: { sendNotification: async () => {} },
    VAPID_PUBLIC_KEY: "",
  },
});

const { AlertService } = await import("../src/services/alert.service.js");
const { BmkgService } = await import("../src/services/bmkg.service.js");
const { NotificationService } = await import("../src/services/notification.service.js");
const { runAlertCheck } = await import("../src/scheduler/alert.scheduler.js");
const { AlertController } = await import("../src/controllers/alert.controller.js");
const { decideAlertAction } = await import("../src/services/alertSequence.service.js");
const { parseFeltAreas } = await import("../src/utils/bmkgEarthquake.util.js");

const OFFICIAL = "BMKG InaTEWS";
const ESTIMATE = "BMKG (estimasi dari data gempa)";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000);

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: "a1",
    level: "YELLOW",
    source: "BMKG",
    description: "d",
    reviewStatus: "BELUM_DITINJAU",
    reviewedBy: null,
    reviewedAt: null,
    reviewer: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const quake = (ageHours: number, tsunamiPotential: string | null = null, felt = "", magnitude = 6) => ({
  magnitude,
  location: "Laut",
  depth: "10 km",
  coordinates: { latitude: 0, longitude: 0 },
  distanceToVillage: 50,
  felt,
  feltAreas: parseFeltAreas(felt),
  potential: "",
  tsunamiPotential,
  shakemap: "",
  updatedAt: hoursAgo(ageHours).toISOString(),
});

/** Mengosongkan cache alert 60 detik, lalu memasang kondisi skenario. */
const arrange = async (next: Partial<State>) => {
  state = initialState();
  await AlertService.saveAlert("YELLOW" as never, "reset-cache");
  state = { ...initialState(), ...next };
};

const currentLevel = async () => (await AlertService.getCurrentAlert())?.level;

const originalStatus = process.env.BMKG_TSUNAMI_STATUS;

beforeEach(() => {
  delete process.env.BMKG_TSUNAMI_STATUS;
});

afterEach(() => {
  if (originalStatus === undefined) delete process.env.BMKG_TSUNAMI_STATUS;
  else process.env.BMKG_TSUNAMI_STATUS = originalStatus;
});

test("estimasi tsunami mengikuti masa aktif gempa 24 jam", async () => {
  await arrange({ quake: quake(1, "BERPOTENSI") });
  assert.equal((await BmkgService.getTsunamiStatus()).status, "WASPADA");

  await arrange({ quake: quake(25, "BERPOTENSI") });
  assert.equal((await BmkgService.getTsunamiStatus()).status, "NORMAL");

  await arrange({ quake: null });
  assert.equal((await BmkgService.getTsunamiStatus()).status, "NORMAL");
});

test("status review tidak mengubah level alert (ADR-041)", async () => {
  await arrange({ latest: record({ reviewStatus: "DITOLAK" }) });
  assert.equal(await currentLevel(), "YELLOW");

  await arrange({ latest: record({ reviewStatus: "DITOLAK", createdAt: hoursAgo(25) }) });
  assert.equal(await currentLevel(), "GREEN");

  await arrange({ latest: record({ reviewStatus: "DIKONFIRMASI", createdAt: hoursAgo(25) }) });
  assert.equal(await currentLevel(), "GREEN");
});

test("siklus scheduler tidak menyimpan ulang alert yang Ditolak", async () => {
  await arrange({ quake: quake(1), latest: record({ createdAt: hoursAgo(30), description: "lama" }) });
  const first = await runAlertCheck();
  assert.equal(first.saved, true);

  const pushLogs = state.pushLogs;
  const savedAlert = state.latest;
  await arrange({
    quake: quake(1),
    pushLogs,
    latest: { ...savedAlert, reviewStatus: "DITOLAK" },
  });
  const second = await runAlertCheck();
  assert.equal(second.saved, false);
  assert.equal(state.pushLogs, pushLogs);
});

test("estimasi tsunami lewat 24 jam tidak memicu alert baru", async () => {
  await arrange({
    quake: quake(25, "BERPOTENSI"),
    latest: record({ createdAt: hoursAgo(25), source: ESTIMATE }),
  });
  const result = await runAlertCheck();
  assert.equal(result.level, "GREEN");
  assert.equal(state.saved.length, 0);
  assert.equal(state.pushLogs, 0);
});

test("UNKNOWN saat database dan BMKG gagal (ADR-037)", async () => {
  await arrange({ dbDown: true, bmkgUp: false });
  assert.equal(await currentLevel(), "UNKNOWN");
  assert.equal(await NotificationService.getLatestPayload(), null);
});

test("database gagal dengan BMKG hidup memakai evaluasi langsung", async () => {
  await arrange({ dbDown: true, quake: quake(1) });
  assert.equal(await currentLevel(), "YELLOW");

  await arrange({ dbDown: true, quakeThrows: true });
  assert.equal(await currentLevel(), "UNKNOWN");
});

test("tabel alerts kosong mengikuti ketersediaan BMKG", async () => {
  await arrange({ bmkgUp: false });
  assert.equal(await currentLevel(), "UNKNOWN");

  await arrange({ bmkgUp: true });
  assert.equal(await currentLevel(), "GREEN");
});

test("BMKG mati dengan database hidup (ADR-043)", async () => {
  await arrange({ bmkgUp: false, latest: record({ createdAt: hoursAgo(30) }) });
  assert.equal(await currentLevel(), "UNKNOWN");

  await arrange({ bmkgUp: true, latest: record({ createdAt: hoursAgo(30) }) });
  assert.equal(await currentLevel(), "GREEN");

  await arrange({ bmkgUp: false, latest: record({ createdAt: hoursAgo(1) }) });
  assert.equal(await currentLevel(), "YELLOW");

  await arrange({ bmkgUp: false, latest: record({ level: "GREEN", createdAt: hoursAgo(1) }) });
  assert.equal(await currentLevel(), "UNKNOWN");

  process.env.BMKG_TSUNAMI_STATUS = "AWAS";
  await arrange({
    bmkgUp: false,
    latest: record({ level: "RED", source: OFFICIAL, createdAt: hoursAgo(2) }),
  });
  assert.equal(await currentLevel(), "RED");
});

test("siklus scheduler saat BMKG mati tidak menyimpan dan tidak mengirim push", async () => {
  await arrange({ bmkgUp: false, latest: record({ createdAt: hoursAgo(30) }) });
  const result = await runAlertCheck();
  assert.equal(result.saved, false);
  assert.equal(state.pushLogs, 0);
});

test("status tsunami resmi mengikuti BMKG_TSUNAMI_STATUS (ADR-045)", async (t) => {
  const redRecord = (ageHours: number, description: string) =>
    record({ level: "RED", source: OFFICIAL, description, createdAt: hoursAgo(ageHours) });

  process.env.BMKG_TSUNAMI_STATUS = "AWAS";
  const awas = (await BmkgService.getTsunamiStatus()).description;

  await t.test("terisi, rekaman 30 jam tetap RED", async () => {
    process.env.BMKG_TSUNAMI_STATUS = "AWAS";
    await arrange({ latest: redRecord(30, awas) });
    assert.equal(await currentLevel(), "RED");
  });

  await t.test("terisi, rekaman 1 jam tidak diterbitkan ulang", async () => {
    process.env.BMKG_TSUNAMI_STATUS = "AWAS";
    await arrange({ latest: redRecord(1, awas) });
    assert.equal((await runAlertCheck()).saved, false);
    assert.equal(state.pushLogs, 0);
  });

  await t.test("terisi, rekaman 25 jam terbit ulang sebagai pengingat", async () => {
    process.env.BMKG_TSUNAMI_STATUS = "AWAS";
    await arrange({ latest: redRecord(25, awas) });
    assert.equal((await runAlertCheck()).saved, true);
    assert.equal(state.pushLogs, 1);
    assert.equal(await currentLevel(), "RED");
  });

  await t.test("dikosongkan, level langsung turun", async () => {
    await arrange({ latest: redRecord(1, awas) });
    assert.equal(await currentLevel(), "GREEN");
  });

  await t.test("diisi NORMAL, level langsung turun", async () => {
    process.env.BMKG_TSUNAMI_STATUS = "NORMAL";
    await arrange({ latest: redRecord(1, awas) });
    assert.equal(await currentLevel(), "GREEN");
  });

  await t.test("AWAS turun ke SIAGA menerbitkan alert baru", async () => {
    process.env.BMKG_TSUNAMI_STATUS = "SIAGA";
    await arrange({ latest: redRecord(1, awas) });
    assert.equal((await runAlertCheck()).level, "ORANGE");
    assert.equal(await currentLevel(), "ORANGE");
  });
});

test("alert gempa berakhir setelah 24 jam tanpa status tsunami", async () => {
  await arrange({ latest: record({ createdAt: hoursAgo(1) }) });
  assert.equal(await currentLevel(), "YELLOW");

  await arrange({ latest: record({ createdAt: hoursAgo(25) }) });
  assert.equal(await currentLevel(), "GREEN");
});

test("tabel kosong: alert pertama tersimpan, siklus berikutnya duplikat", async () => {
  await arrange({ quake: quake(1) });
  assert.equal((await runAlertCheck()).saved, true);
  assert.equal((await runAlertCheck()).saved, false);
  assert.equal(state.saved.length, 1);
});

test("controller membalas UNKNOWN saat service gagal", async (t) => {
  t.mock.method(AlertService, "getCurrentAlert", async () => {
    throw new Error("gagal");
  });
  let body: { data: { level: string } } | undefined;
  const res = {
    status() {
      return this;
    },
    json(payload: { data: { level: string } }) {
      body = payload;
      return this;
    },
  };
  await AlertController.getLatest({} as never, res as never);
  assert.equal(body?.data.level, "UNKNOWN");
});

// Rentetan gempa (ADR-046)
const FELT = "III Pangandaran";

/** Siklus berikutnya dengan alert terakhir dan hitungan push dari siklus sebelumnya. */
const nextCycle = async (quakes: Record<string, unknown>[]) => {
  await arrange({ latest: state.latest, pushLogs: state.pushLogs, quakes });
  return runAlertCheck();
};

test("rentetan: gempa susulan dengan level sama memperpanjang alert tanpa push", async () => {
  const main = quake(3, null, FELT, 5.6);
  const aftershock = quake(1, null, FELT, 4.0);

  await arrange({ quakes: [main] });
  assert.equal((await runAlertCheck()).saved, true);
  assert.equal(state.pushLogs, 1);
  assert.equal(state.latest?.referenceMagnitude, 5.6);

  const result = await nextCycle([main, aftershock]);
  assert.equal(result.saved, false);
  assert.equal(result.extended, true);
  assert.equal(state.pushLogs, 1);
  assert.equal(state.latest?.episodeEventCount, 2);
  assert.equal(
    (state.latest?.eventTime as Date).getTime(),
    new Date(aftershock.updatedAt).getTime()
  );
  assert.match(String(state.latest?.description), /M5\.6/);

  const unchanged = await nextCycle([main, aftershock]);
  assert.equal(unchanged.saved, false);
  assert.equal(unchanged.extended, undefined);
  assert.equal(state.extended, 0);
});

test("rentetan: magnitudo +1,0 dari push terakhir menerbitkan alert dan push baru", async () => {
  const first = quake(3, null, FELT, 4.0);
  const larger = quake(2, null, FELT, 5.1);
  const smaller = quake(1, null, FELT, 5.5);

  await arrange({ quakes: [first] });
  await runAlertCheck();
  assert.equal(state.pushLogs, 1);

  const second = await nextCycle([first, larger]);
  assert.equal(second.saved, true);
  assert.equal(state.pushLogs, 2);
  assert.equal(state.latest?.referenceMagnitude, 5.1);

  const third = await nextCycle([first, larger, smaller]);
  assert.equal(third.saved, false);
  assert.equal(third.extended, true);
  assert.equal(state.pushLogs, 2);
});

test("rentetan: level naik selalu menerbitkan alert dan push", async () => {
  const unfelt = quake(2, null, "", 5.0);
  await arrange({ quakes: [unfelt] });
  await runAlertCheck();
  assert.equal(state.latest?.level, "YELLOW");

  const result = await nextCycle([unfelt, quake(1, null, FELT, 4.2)]);
  assert.equal(result.level, "ORANGE");
  assert.equal(result.saved, true);
  assert.equal(state.pushLogs, 2);
});

test("rentetan: penurunan level saat gempa penentu berakhir tanpa push", async () => {
  await arrange({
    latest: record({
      level: "ORANGE",
      eventTime: hoursAgo(24.1),
      referenceMagnitude: 5.6,
      episodeStartedAt: hoursAgo(24.1),
      episodeEventCount: 2,
      episodeMaxMagnitude: 5.6,
      createdAt: hoursAgo(24.1),
    }),
    quakes: [quake(20, null, "", 4.0)],
  });
  const result = await runAlertCheck();
  assert.equal(result.level, "YELLOW");
  assert.equal(result.saved, true);
  assert.equal(state.pushLogs, 0);
  assert.equal(state.latest?.referenceMagnitude, 5.6);
});

test("rentetan: gempa baru setelah alert lama berakhir lama menerbitkan push", async () => {
  await arrange({
    latest: record({
      level: "ORANGE",
      eventTime: hoursAgo(50),
      referenceMagnitude: 5.6,
      episodeStartedAt: hoursAgo(50),
      createdAt: hoursAgo(50),
    }),
    quakes: [quake(2, null, "", 4.0)],
  });
  const result = await runAlertCheck();
  assert.equal(result.saved, true);
  assert.equal(state.pushLogs, 1);
});

test("rentetan: masa aktif alert gempa dihitung dari waktu kejadian", async () => {
  await arrange({
    latest: record({ level: "ORANGE", eventTime: hoursAgo(25), createdAt: hoursAgo(1) }),
  });
  assert.equal(await currentLevel(), "GREEN");

  const eventTime = hoursAgo(20);
  await arrange({
    latest: record({ level: "ORANGE", eventTime, createdAt: hoursAgo(1) }),
  });
  const current = await AlertService.getCurrentAlert();
  assert.equal(current?.level, "ORANGE");
  assert.equal(current?.activeUntil?.getTime(), eventTime.getTime() + 24 * 3_600_000);
});

test("rentetan: BMKG menambah wilayah Dirasakan pada gempa yang sama tanpa push ulang", async () => {
  const event = quake(2, null, FELT, 5.4);
  await arrange({ quakes: [event] });
  await runAlertCheck();
  assert.equal(state.pushLogs, 1);

  const revised = { ...event, felt: `${FELT}, II Ciamis, II Banjar`, feltAreas: parseFeltAreas(`${FELT}, II Ciamis, II Banjar`) };
  const result = await nextCycle([revised]);
  assert.equal(result.saved, false);
  assert.equal(result.extended, true);
  assert.equal(state.pushLogs, 1);
  assert.match(String(state.latest?.description), /Ciamis/);
});

test("rentetan: revisi magnitudo BMKG pada gempa yang sama tanpa push ulang", async () => {
  const event = quake(2, null, FELT, 5.4);
  await arrange({ quakes: [event] });
  await runAlertCheck();

  const result = await nextCycle([{ ...event, magnitude: 5.6 }]);
  assert.equal(result.saved, false);
  assert.equal(result.extended, true);
  assert.equal(state.pushLogs, 1);
  assert.equal(state.latest?.episodeMaxMagnitude, 5.6);
});

test("estimasi tsunami: revisi magnitudo pada gempa asal yang sama tanpa push ulang", async () => {
  const event = quake(2, "BERPOTENSI", "", 6.0);
  await arrange({ quakes: [event] });
  const first = await runAlertCheck();
  assert.equal(first.source, ESTIMATE);
  assert.equal(state.pushLogs, 1);
  assert.equal((state.latest?.eventTime as Date).getTime(), new Date(event.updatedAt).getTime());

  const second = await nextCycle([{ ...event, magnitude: 6.2 }]);
  assert.equal(second.source, ESTIMATE);
  assert.equal(second.saved, false);
  assert.equal(state.pushLogs, 1);
});

test("estimasi tsunami: alert estimasi tidak diperpanjang sebagai rentetan gempa", async () => {
  await arrange({
    latest: record({ level: "YELLOW", source: ESTIMATE, eventTime: hoursAgo(2), createdAt: hoursAgo(2) }),
    quakes: [quake(1, null, "", 5.0)],
  });
  const result = await runAlertCheck();
  assert.equal(result.saved, true);
  assert.equal(state.extended, 0);
  assert.equal(state.latest?.source, "BMKG");
  assert.equal(state.pushLogs, 0);
});

test("status tsunami UNKNOWN saat data gempa BMKG gagal dan status resmi kosong (TK-03)", async () => {
  await arrange({ bmkgUp: false, quake: quake(1, "BERPOTENSI") });
  const status = await BmkgService.getTsunamiStatus();
  assert.equal(status.status, "UNKNOWN");
  assert.equal(status.updatedAt, LAST_FEED_SUCCESS_AT);
});

test("status tsunami resmi tetap berlaku saat data gempa BMKG gagal (TK-03)", async () => {
  process.env.BMKG_TSUNAMI_STATUS = "AWAS";
  await arrange({ bmkgUp: false });
  const status = await BmkgService.getTsunamiStatus();
  assert.equal(status.status, "AWAS");
  assert.equal(status.source, OFFICIAL);
  assert.notEqual(status.updatedAt, null);
});

test("waktu status tsunami mengikuti data sumber, bukan waktu request (TK-03)", async () => {
  await arrange({ bmkgUp: true, quake: null });
  assert.equal((await BmkgService.getTsunamiStatus()).updatedAt, LAST_FEED_SUCCESS_AT);

  const event = quake(1, "BERPOTENSI");
  await arrange({ bmkgUp: true, quake: event });
  assert.equal((await BmkgService.getTsunamiStatus()).updatedAt, event.updatedAt);
});

test("status tsunami UNKNOWN tidak menaikkan level dan tidak disimpan", async () => {
  await arrange({ bmkgUp: false, quake: null });
  const result = await runAlertCheck();
  assert.equal(result.level, "GREEN");
  assert.equal(state.saved.length, 0);
});

test("rentetan: selisih magnitudo dibandingkan pada satu desimal", () => {
  const latest = record({
    level: "ORANGE",
    eventTime: hoursAgo(2),
    referenceMagnitude: 4.1,
    episodeStartedAt: hoursAgo(2),
  });
  const action = decideAlertAction(
    {
      level: "ORANGE",
      source: "BMKG",
      description: "d",
      sequence: {
        eventTime: hoursAgo(1).toISOString(),
        levelMaxMagnitude: 5.1,
        startedAt: hoursAgo(2).toISOString(),
        eventCount: 2,
        maxMagnitude: 5.1,
      },
    } as never,
    latest as never
  );
  assert.deepEqual(action, { type: "save", notify: true, referenceMagnitude: 5.1 });
});
