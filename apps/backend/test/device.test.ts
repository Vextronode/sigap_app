import assert from "node:assert/strict";
import { mock, test } from "node:test";

process.env.DEVICE_SHARED_KEY = "kunci-perangkat-uji";

type StoredDevice = {
  id: string;
  deviceCode: string;
  name: string;
  status: "ONLINE" | "OFFLINE";
  lastSeen: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const db = new Map<string, StoredDevice>();
const calls = { markSeen: 0, findAll: 0 };

mock.module(new URL("../src/repositories/device.repository.ts", import.meta.url).href, {
  namedExports: {
    findByDeviceCode: async (deviceCode: string) => db.get(deviceCode) ?? null,
    findAll: async () => {
      calls.findAll += 1;
      return [...db.values()];
    },
    create: async (data: { deviceCode: string; name: string; lastSeen: Date }) => {
      const device: StoredDevice = {
        id: `id-${data.deviceCode}`,
        ...data,
        status: "ONLINE",
        createdAt: data.lastSeen,
        updatedAt: data.lastSeen,
      };
      db.set(data.deviceCode, device);
      return device;
    },
    markSeen: async (deviceCode: string, lastSeen: Date) => {
      calls.markSeen += 1;
      const device = db.get(deviceCode);
      if (!device) throw new Error("P2025");
      Object.assign(device, { status: "ONLINE", lastSeen });
      return { ...device };
    },
  },
});

mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-25T03:00:00Z") });

const { DeviceService } = await import("../src/services/device.service.js");
const { deviceAuthMiddleware, optionalDeviceAuthMiddleware } = await import(
  "../src/middleware/deviceAuth.middleware.js"
);
const { validateRegisterDevice, validateStatusQuery } = await import("../src/validators/device.validator.js");

const seconds = (value: number) => mock.timers.tick(value * 1000);

test("register perangkat baru membuat entri ONLINE", async () => {
  const device = await DeviceService.register("UU-BARU", "Unit Utama");
  assert.equal(device.status, "ONLINE");
  assert.equal(db.get("UU-BARU")?.name, "Unit Utama");
});

test("register ulang memperbarui lastSeen tanpa menimpa nama", async () => {
  db.set("UU-LAMA", {
    id: "id-lama",
    deviceCode: "UU-LAMA",
    name: "Nama dari admin",
    status: "OFFLINE",
    lastSeen: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  });

  const device = await DeviceService.register("UU-LAMA", "Nama dari firmware");
  assert.equal(device.name, "Nama dari admin");
  assert.equal(device.status, "ONLINE");
  assert.deepEqual(device.lastSeen, new Date());
});

test("laporan dari deviceCode yang belum terdaftar ditolak 404", async () => {
  await assert.rejects(DeviceService.recordSeen("TIDAK-ADA"), { statusCode: 404 });
});

test("laporan dalam 60 detik hanya dicatat di memori, sesudahnya ditulis ke database", async () => {
  await DeviceService.register("UU-TULIS", "Unit Utama");
  const before = calls.markSeen;

  for (let poll = 0; poll < 3; poll += 1) {
    seconds(15);
    await DeviceService.recordSeen("UU-TULIS");
  }
  assert.equal(calls.markSeen, before);

  seconds(15);
  const device = await DeviceService.recordSeen("UU-TULIS");
  assert.equal(calls.markSeen, before + 1);
  assert.deepEqual(device.lastSeen, new Date());
});

test("perangkat aktif selama melapor dalam 45 detik, offline sesudahnya", async () => {
  db.clear();
  seconds(60); // cache daftar perangkat kedaluwarsa
  await DeviceService.register("UU-STATUS", "Unit Utama");

  seconds(14);
  await DeviceService.recordSeen("UU-STATUS"); // hanya di memori
  seconds(45);
  let status = await DeviceService.getSystemStatus();
  assert.equal(status.status, "ONLINE");
  assert.equal(status.activeDevices, 1);

  seconds(1);
  status = await DeviceService.getSystemStatus();
  assert.equal(status.status, "OFFLINE");
  assert.equal(status.totalDevices, 1);
});

test("ringkasan status tidak membaca database pada setiap poll", async () => {
  const before = calls.findAll;
  await DeviceService.recordSeen("UU-STATUS");
  await DeviceService.getSystemStatus();
  await DeviceService.recordSeen("UU-STATUS");
  await DeviceService.getSystemStatus();
  assert.ok(calls.findAll - before <= 1);
});

const run = (
  middleware: (req: never, res: never, next: () => void) => unknown,
  req: { headers?: Record<string, string>; body?: unknown; query?: Record<string, unknown> }
) => {
  let status = 0;
  let passed = false;
  const res = {
    locals: {} as Record<string, unknown>,
    status(code: number) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  };
  middleware({ headers: {}, query: {}, ...req } as never, res as never, () => {
    passed = true;
  });
  return { result: passed ? "lolos" : status, locals: res.locals };
};

test("status tanpa header token tetap publik dan tidak dihitung sebagai laporan perangkat", () => {
  const { result, locals } = run(optionalDeviceAuthMiddleware, {});
  assert.equal(result, "lolos");
  assert.equal(locals.deviceAuthenticated, undefined);
});

test("status dengan token salah ditolak 401, token benar ditandai perangkat", () => {
  assert.equal(run(optionalDeviceAuthMiddleware, { headers: { "x-device-token": "salah" } }).result, 401);
  const { result, locals } = run(optionalDeviceAuthMiddleware, {
    headers: { "x-device-token": "kunci-perangkat-uji" },
  });
  assert.equal(result, "lolos");
  assert.equal(locals.deviceAuthenticated, true);
});

test("register dan heartbeat tanpa token ditolak 401", () => {
  assert.equal(run(deviceAuthMiddleware, {}).result, 401);
});

test("validasi menolak deviceCode bukan teks atau terlalu panjang", () => {
  assert.equal(run(validateRegisterDevice, { body: { deviceCode: 123, name: "A" } }).result, 400);
  assert.equal(run(validateRegisterDevice, { body: { deviceCode: "X".repeat(65), name: "A" } }).result, 400);
  assert.equal(run(validateRegisterDevice, { body: { deviceCode: "UU-1", name: "A" } }).result, "lolos");
  assert.equal(run(validateStatusQuery, { query: { deviceCode: ["a", "b"] } }).result, 400);
  assert.equal(run(validateStatusQuery, { query: {} }).result, "lolos");
});
