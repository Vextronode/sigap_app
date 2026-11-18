import assert from "node:assert/strict";
import { test } from "node:test";
import { AlertLevel } from "../generated/prisma/enums.js";
import { ESTIMATED_TSUNAMI_SOURCE, OFFICIAL_TSUNAMI_SOURCE } from "../src/config/alertRules.js";
import {
  mapAlertLevelToSid,
  parseDepthKm,
  sanitizeExternalId,
  buildSidExternalId,
  mapToSidAlertInput,
  sidTypeOf,
} from "../src/services/sidPayloadMapper.js";
import { SidIntegrationService } from "../src/services/sidIntegration.service.js";

test("SID Mapper: mapAlertLevelToSid mapping akurat ke enum openapi", () => {
  assert.equal(mapAlertLevelToSid(AlertLevel.RED), "awas");
  assert.equal(mapAlertLevelToSid(AlertLevel.ORANGE), "siaga");
  assert.equal(mapAlertLevelToSid(AlertLevel.YELLOW), "waspada");
  assert.equal(mapAlertLevelToSid(AlertLevel.GREEN), "info");
  assert.equal(mapAlertLevelToSid("UNKNOWN"), "info");
});

test("SID Mapper: sidTypeOf menentukan jenis dari sumber alert", () => {
  assert.equal(sidTypeOf(OFFICIAL_TSUNAMI_SOURCE), "tsunami");
  assert.equal(sidTypeOf(ESTIMATED_TSUNAMI_SOURCE), "tsunami");
  assert.equal(sidTypeOf("BMKG"), "gempa");
});

test("SID Mapper: parseDepthKm mengekstrak angka kedalaman", () => {
  assert.equal(parseDepthKm("10 km"), 10);
  assert.equal(parseDepthKm("25km"), 25);
  assert.equal(parseDepthKm("15.5 km"), 15.5);
  assert.equal(parseDepthKm(""), null);
  assert.equal(parseDepthKm(null), null);
  assert.equal(parseDepthKm("tidak diketahui"), null);
});

test("SID Mapper: sanitizeExternalId mematuhi regex ^[A-Za-z0-9._:-]{1,100}$", () => {
  const valid = sanitizeExternalId("gempa-881_sub.01:id");
  assert.equal(valid, "gempa-881_sub.01:id");

  const dirty = sanitizeExternalId("gempa #881 @desa (cibenda)?");
  assert.equal(dirty, "gempa--881--desa--cibenda--");
  assert.ok(/^[A-Za-z0-9._:-]{1,100}$/.test(dirty));
});

test("SID Mapper: buildSidExternalId konsisten berdasarkan jenis dan waktu kejadian", () => {
  const time = "2026-11-18T04:45:00.000Z";
  const gempaId = buildSidExternalId("gempa", time);
  assert.equal(gempaId, "gempa-2026-11-18T04:45:00.000Z");

  const tsunamiId = buildSidExternalId("tsunami", new Date("2026-11-18T05:00:00.000Z"));
  assert.equal(tsunamiId, "tsunami-2026-11-18T05:00:00.000Z");
});

test("SID Mapper: mapToSidAlertInput menggunakan title dan message dari notification SIGAP", () => {
  const now = new Date("2026-11-18T10:00:00.000Z");
  const mapped = mapToSidAlertInput({
    externalId: "gempa-2026-11-18T09:00:00.000Z",
    alert: {
      id: "alert-1",
      level: AlertLevel.ORANGE,
      source: "BMKG",
      description: "Gempa M5.6 dirasakan di sekitar Desa Cibenda (III Pangandaran).",
      createdAt: new Date("2026-11-18T09:00:00.000Z"),
      eventTime: new Date("2026-11-18T09:00:00.000Z"),
      activeUntil: new Date("2026-11-19T09:00:00.000Z"),
    },
    notification: {
      payload: {
        title: "[SIAGA] Gempa M5.6 dirasakan di sekitar Desa Cibenda",
        body: "Gempa M5.6 dirasakan di sekitar Desa Cibenda (III Pangandaran). Hindari bangunan retak.",
      },
    },
    determiningEarthquake: {
      magnitude: 5.6,
      depth: "18 km",
      location: "23 km barat daya Pangandaran",
      updatedAt: "2026-11-18T09:00:00.000Z",
    },
    publicBaseUrl: "https://sigap-berdampak.widyatama.ac.id",
    now,
  });

  assert.ok(mapped);
  assert.equal(mapped.type, "gempa");
  assert.equal(mapped.level, "siaga");
  assert.equal(mapped.title, "[SIAGA] Gempa M5.6 dirasakan di sekitar Desa Cibenda");
  assert.equal(
    mapped.message,
    "Gempa M5.6 dirasakan di sekitar Desa Cibenda (III Pangandaran). Hindari bangunan retak."
  );
  assert.equal(mapped.magnitude, 5.6);
  assert.equal(mapped.depth_km, 18);
  assert.equal(mapped.location, "23 km barat daya Pangandaran");
  assert.equal(mapped.link_url, "https://sigap-berdampak.widyatama.ac.id/?view=warga");
  assert.equal(mapped.occurred_at, "2026-11-18T09:00:00.000Z");
  assert.equal(mapped.sent_at, "2026-11-18T10:00:00.000Z");
  assert.equal(mapped.expires_at, "2026-11-19T09:00:00.000Z");
});

test("SID Mapper: mapToSidAlertInput untuk tsunami resmi berlaku 24 jam ke depan", () => {
  const now = new Date("2026-11-18T10:00:00.000Z");
  const mapped = mapToSidAlertInput({
    externalId: "tsunami-2026-11-18T09:50:00.000Z",
    alert: {
      id: "alert-tsunami",
      level: AlertLevel.RED,
      source: OFFICIAL_TSUNAMI_SOURCE,
      description: "Peringatan Dini Tsunami BMKG InaTEWS untuk wilayah pesisir selatan.",
      createdAt: now,
      activeUntil: null,
    },
    notification: {
      payload: {
        title: "[AWAS] Status tsunami dari BMKG",
        body: "Peringatan Dini Tsunami BMKG InaTEWS. Segera evakuasi menjauhi pesisir.",
      },
    },
    now,
  });

  assert.ok(mapped);
  assert.equal(mapped.type, "tsunami");
  assert.equal(mapped.level, "awas");
  assert.equal(mapped.expires_at, new Date("2026-11-19T10:00:00.000Z").toISOString());
});

test("SID Mapper: mapToSidAlertInput mengembalikan null bila alert sudah expired", () => {
  const now = new Date("2026-11-19T12:00:00.000Z");
  const mapped = mapToSidAlertInput({
    externalId: "gempa-expired",
    alert: {
      id: "alert-old",
      level: AlertLevel.YELLOW,
      source: "BMKG",
      description: "Gempa lama.",
      createdAt: new Date("2026-11-18T08:00:00.000Z"),
      activeUntil: new Date("2026-11-19T08:00:00.000Z"), // 4 jam yang lalu
    },
    notification: {
      payload: {
        title: "[WASPADA] Gempa lama",
        body: "Gempa lama",
      },
    },
    now,
  });

  assert.equal(mapped, null, "Harus mengembalikan null agar tidak mengirim alert kedaluwarsa ke SID (422)");
});

test("SidIntegrationService: isConfigured mengembalikan false bila variabel env kosong", () => {
  const oldEnabled = process.env.SID_INTEGRATION_ENABLED;
  const oldUrl = process.env.SID_API_BASE_URL;
  const oldToken = process.env.SID_API_TOKEN;

  try {
    delete process.env.SID_INTEGRATION_ENABLED;
    delete process.env.SID_API_BASE_URL;
    delete process.env.SID_API_TOKEN;

    assert.equal(SidIntegrationService.isConfigured(), false);
  } finally {
    process.env.SID_INTEGRATION_ENABLED = oldEnabled;
    process.env.SID_API_BASE_URL = oldUrl;
    process.env.SID_API_TOKEN = oldToken;
  }
});

test("SidIntegrationService: Lifecycle Antrean, tracking active IDs, dan pembatalan upsert saat /end", () => {
  const oldEnabled = process.env.SID_INTEGRATION_ENABLED;
  const oldUrl = process.env.SID_API_BASE_URL;
  const oldToken = process.env.SID_API_TOKEN;

  try {
    process.env.SID_INTEGRATION_ENABLED = "true";
    process.env.SID_API_BASE_URL = "https://mock-sid.test/api/integrations/v1";
    process.env.SID_API_TOKEN = "valid-mock-token";

    SidIntegrationService.clearQueueForTest();

    // 1. Enqueue Alert Baru
    const extId = "gempa-test-01";
    SidIntegrationService.enqueueAlert(extId, {
      type: "gempa",
      level: "siaga",
      title: "Gempa M5.6",
      message: "Arahan",
      occurred_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
    });

    assert.deepEqual(SidIntegrationService.getActiveExternalIds(), [extId]);
    let status = SidIntegrationService.getStatus();
    assert.equal(status.queueSize, 1);
    assert.equal(status.items[0].id, `upsert-${extId}`);

    // 2. Enqueue End Alert -> upsert yang pending harus dibuang, active IDs dihapus
    SidIntegrationService.enqueueEndAlert(extId);
    assert.deepEqual(SidIntegrationService.getActiveExternalIds(), []);
    status = SidIntegrationService.getStatus();
    assert.equal(status.queueSize, 1);
    assert.equal(status.items[0].id, `end-${extId}`);

    // 3. endAllActiveAlerts mengakhiri semua id yang tersisa
    const extId2 = "gempa-test-02";
    SidIntegrationService.enqueueAlert(extId2, {
      type: "gempa",
      level: "waspada",
      title: "Gempa M4.8",
      occurred_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
    });
    assert.ok(SidIntegrationService.getActiveExternalIds().includes(extId2));

    SidIntegrationService.endAllActiveAlerts();
    assert.equal(SidIntegrationService.getActiveExternalIds().length, 0);

    const endItem = SidIntegrationService.getStatus().items.find((i) => i.id === `end-${extId2}`);
    assert.ok(endItem, "Item end untuk extId2 harus terdaftar di antrean");
  } finally {
    process.env.SID_INTEGRATION_ENABLED = oldEnabled;
    process.env.SID_API_BASE_URL = oldUrl;
    process.env.SID_API_TOKEN = oldToken;
    SidIntegrationService.clearQueueForTest();
  }
});

test("SidIntegrationService: System Health mencerminkan hasil pengiriman terakhir", () => {
  SidIntegrationService.clearQueueForTest();

  // Sebelum ada transmisi: null
  assert.equal(SidIntegrationService.getLastDispatchResult(), null);

  // Simulasi pengiriman sukses
  SidIntegrationService.recordDispatchResult(true);
  const okResult = SidIntegrationService.getLastDispatchResult();
  assert.equal(okResult?.ok, true);

  // Simulasi kegagalan transmisi
  SidIntegrationService.recordDispatchResult(false, "HTTP 500: Server Error");
  const failResult = SidIntegrationService.getLastDispatchResult();
  assert.equal(failResult?.ok, false);
  assert.equal(failResult?.error, "HTTP 500: Server Error");
});
