import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

type State = {
  latest: Record<string, unknown> | null;
  dbDown: boolean;
  bmkgUp: boolean;
  quake: Record<string, unknown> | null;
  quakeThrows: boolean;
  saved: Record<string, unknown>[];
  pushLogs: number;
};

const initialState = (): State => ({
  latest: null,
  dbDown: false,
  bmkgUp: true,
  quake: null,
  quakeThrows: false,
  saved: [],
  pushLogs: 0,
});

let state = initialState();

const whenDbUp = <T>(value: () => T) => {
  if (state.dbDown) throw new Error("db down");
  return value();
};

const src = (path: string) => new URL(`../src/${path}`, import.meta.url).href;

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
        const ageMs = state.quake ? Date.now() - new Date(String(state.quake.updatedAt)).getTime() : Infinity;
        return ageMs <= 24 * 3_600_000 ? [state.quake] : [];
      },
      isLiveDataAvailable: async () => state.bmkgUp,
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

const quake = (ageHours: number, tsunamiPotential: string | null = null, felt = "") => ({
  magnitude: 6,
  location: "Laut",
  depth: "10 km",
  coordinates: { latitude: 0, longitude: 0 },
  distanceToVillage: 50,
  felt,
  feltAreas: [],
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
  await arrange({
    quake: quake(1),
    pushLogs,
    latest: record({
      level: first.level,
      source: first.source,
      description: first.description,
      reviewStatus: "DITOLAK",
    }),
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
