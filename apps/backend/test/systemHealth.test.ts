import assert from "node:assert/strict";
import { test } from "node:test";
import { mock } from "node:test";

const state = { dbUp: true, networkUp: true };

mock.module(new URL("../src/repositories/health.repository.ts", import.meta.url).href, {
  namedExports: {
    pingDatabase: async () => {
      if (!state.dbUp) throw new Error("db down");
    },
  },
});

mock.module("axios", {
  defaultExport: {
    get: async () => {
      if (!state.networkUp) throw new Error("network down");
      return { data: {} };
    },
  },
});

const schedulerStatus = await import("../src/scheduler/schedulerStatus.js");
const { SystemHealthService } = await import("../src/services/systemHealth.service.js");

const serviceOf = (data: Awaited<ReturnType<typeof SystemHealthService.getHealth>>, category: string) =>
  data.services.find((service) => service.category === category);

test("kesehatan sistem: database, BMKG, dan scheduler sehat menghasilkan HEALTHY (TK-04)", async () => {
  schedulerStatus.configureSchedulerStatus({ enabled: true, intervalMs: 60_000 });
  schedulerStatus.resetSchedulerStatus();

  const data = await SystemHealthService.getHealth();
  assert.equal(data.overallStatus, "HEALTHY");
  assert.equal(serviceOf(data, "database")?.status, "ONLINE");
  assert.equal(serviceOf(data, "earthquake")?.status, "ONLINE");
  assert.equal(serviceOf(data, "push")?.latencyMs, null);
  assert.equal(serviceOf(data, "scheduler")?.status, "ONLINE");
});

test("kesehatan sistem: scheduler gagal menghasilkan DEGRADED tanpa menunggu cache jaringan (TK-04)", async () => {
  schedulerStatus.markCycleFinished(false);

  const data = await SystemHealthService.getHealth();
  assert.equal(data.scheduler.state, "GAGAL");
  assert.equal(serviceOf(data, "scheduler")?.status, "OFFLINE");
  assert.equal(data.overallStatus, "DEGRADED");
});
