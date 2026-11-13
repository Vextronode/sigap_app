import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import express, { type Request, type Response } from "express";

const {
  generalRateLimiter,
  isCachedPublicRead,
  loginRateLimiter,
  publicRateLimiter,
} = await import("../src/middleware/rateLimit.middleware.js");

/**
 * Aplikasi tiruan dengan mount yang sama seperti app.ts. Handler hanya membalas 200,
 * sehingga yang diuji adalah pembagian limiter. `trust proxy` loopback membuat
 * X-Forwarded-For dari klien lokal menjadi req.ip, untuk mensimulasikan banyak IP.
 */
const ok = (_req: Request, res: Response) => {
  res.json({ success: true });
};
const stubRouter = express.Router();
stubRouter.post("/auth/login", loginRateLimiter, (_req, res) => {
  res.status(401).json({ success: false });
});
stubRouter.use(ok);

const app = express();
app.set("trust proxy", "loopback");
app.use("/api/public", publicRateLimiter, stubRouter);
app.use("/api/protected", generalRateLimiter, stubRouter);
app.use("/api", publicRateLimiter, stubRouter);

let baseUrl = "";
const server = app.listen(0, "127.0.0.1");

before(async () => {
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

const request = async (path: string, ip: string, method = "GET") => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "X-Forwarded-For": ip },
  });
  await res.arrayBuffer();
  return res.status;
};

/** Mengirim `count` request dalam gelombang paralel, lalu mengembalikan seluruh status. */
const burst = async (paths: string[], count: number, ip: string, method = "GET") => {
  const statuses: number[] = [];
  for (let start = 0; start < count; start += 100) {
    const batch = Array.from({ length: Math.min(100, count - start) }, (_, offset) =>
      request(paths[(start + offset) % paths.length], ip, method)
    );
    statuses.push(...(await Promise.all(batch)));
  }
  return statuses;
};

/** Pola polling dashboard warga yang memakai limiter baca publik. */
const DASHBOARD_READ_PATHS = [
  "/api/public/alerts/current",
  "/api/public/device/status",
  "/api/public/earthquakes/map",
  "/api/public/earthquakes/indonesia",
  "/api/public/earthquakes/west-java",
  "/api/public/earthquakes/pangandaran",
  "/api/public/earthquakes/pangandaran/history",
  "/api/public/tsunami/status",
];

test("endpoint baca ter-cache dikenali; endpoint lain tidak (TK-07)", () => {
  const isRead = (method: string, path: string) =>
    isCachedPublicRead({ method, path } as Request);

  for (const path of [
    "/alerts",
    "/alerts/current",
    "/earthquakes",
    "/earthquakes/latest",
    "/earthquakes/map",
    "/earthquakes/indonesia",
    "/earthquakes/west-java",
    "/earthquakes/west-java/history",
    "/earthquakes/pangandaran",
    "/earthquakes/pangandaran/history",
    "/tsunami",
    "/tsunami/status",
    "/tsunamis/status",
    "/device/status",
  ]) {
    assert.equal(isRead("GET", path), true, path);
  }

  for (const path of [
    "/alerts/history",
    "/alerts/123",
    "/weather/current",
    "/weather/forecast",
    "/evacuation-points",
    "/emergency-contacts",
    "/system-health",
    "/earthquakes/unknown",
    "/notifications/vapid-public-key",
  ]) {
    assert.equal(isRead("GET", path), false, path);
  }

  assert.equal(isRead("POST", "/device/status"), false);
  assert.equal(isRead("POST", "/alerts/current"), false);
});

test("250 warga dari satu IP (3.000 request baca per menit) tidak terkena 429 (TK-07 AC1)", async () => {
  const ip = "203.0.113.10";
  const statuses = await burst(DASHBOARD_READ_PATHS, 3000, ip);
  assert.equal(statuses.filter((status) => status === 429).length, 0);

  // Penyalahgunaan dari satu IP tetap dibatasi.
  assert.equal(await request("/api/public/alerts/current", ip), 429);

  // IP lain tidak ikut terblok.
  assert.equal(await request("/api/public/alerts/current", "203.0.113.11"), 200);

  // Penghitung baca terpisah dari limiter umum: endpoint tidak ter-cache tetap terbuka.
  assert.equal(await request("/api/public/alerts/history", ip), 200);
});

test("limiter umum tetap 300 per menit dan dipakai bersama /api/protected (TK-07 AC2)", async () => {
  const ip = "203.0.113.20";
  const statuses = await burst(["/api/public/weather/current", "/api/public/alerts/history"], 300, ip);
  assert.equal(statuses.filter((status) => status === 429).length, 0);

  assert.equal(await request("/api/public/weather/current", ip), 429);
  // Path Protected yang serupa dengan endpoint baca publik tetap memakai limiter umum.
  assert.equal(await request("/api/protected/alerts/current", ip), 429);
  // Limiter baca IP yang sama tidak terpengaruh.
  assert.equal(await request("/api/public/alerts/current", ip), 200);
});

test("GET /api/protected dengan path serupa tidak lolos ke limiter baca (TK-07 AC2)", async () => {
  const ip = "203.0.113.30";
  const statuses = await burst(["/api/protected/alerts", "/api/protected/device/status"], 300, ip);
  assert.equal(statuses.filter((status) => status === 429).length, 0);
  assert.equal(await request("/api/protected/alerts", ip), 429);
});

test("alias /api memakai pembagian limiter yang sama (TK-07)", async () => {
  const ip = "203.0.113.40";
  const statuses = await burst(["/api/alerts/current", "/api/earthquakes/map"], 301, ip);
  assert.equal(statuses.filter((status) => status === 429).length, 0);
});

test("batas login tetap 15 percobaan gagal per 15 menit (TK-07 AC2)", async () => {
  const ip = "203.0.113.50";
  const statuses = await burst(["/api/public/auth/login"], 15, ip, "POST");
  assert.deepEqual([...new Set(statuses)], [401]);
  assert.equal(await request("/api/public/auth/login", ip, "POST"), 429);
});
