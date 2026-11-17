import assert from "node:assert/strict";
import { test } from "node:test";
import { AlertLevel } from "../generated/prisma/enums.js";
import {
  mapAlertLevelToSid,
  parseDepthKm,
  buildAlertTitle,
  buildActionMessage,
  sanitizeExternalId,
  mapToSidAlertInput,
} from "../src/services/sidPayloadMapper.js";
import { SidIntegrationService } from "../src/services/sidIntegration.service.js";

test("SID Mapper: mapAlertLevelToSid mapping akurat ke enum openapi", () => {
  assert.equal(mapAlertLevelToSid(AlertLevel.RED), "awas");
  assert.equal(mapAlertLevelToSid(AlertLevel.ORANGE), "siaga");
  assert.equal(mapAlertLevelToSid(AlertLevel.YELLOW), "waspada");
  assert.equal(mapAlertLevelToSid(AlertLevel.GREEN), "info");
  assert.equal(mapAlertLevelToSid("UNKNOWN"), "info");
});

test("SID Mapper: parseDepthKm mengekstrak angka kedalaman", () => {
  assert.equal(parseDepthKm("10 km"), 10);
  assert.equal(parseDepthKm("25km"), 25);
  assert.equal(parseDepthKm("15.5 km"), 15.5);
  assert.equal(parseDepthKm(""), null);
  assert.equal(parseDepthKm(null), null);
  assert.equal(parseDepthKm("tidak diketahui"), null);
});

test("SID Mapper: buildAlertTitle tidak melebihi batas 150 karakter", () => {
  const shortTitle = buildAlertTitle("waspada", "gempa", 5.2, "23 km Barat Daya Cibenda");
  assert.ok(shortTitle.includes("[WASPADA]"));
  assert.ok(shortTitle.includes("M5.2"));
  assert.ok(shortTitle.length <= 150);

  const longLocation = "A".repeat(200);
  const cappedTitle = buildAlertTitle("awas", "gempa", 7.0, longLocation);
  assert.ok(cappedTitle.length <= 150);
});

test("SID Mapper: buildActionMessage membatasi panjang teks <= 1000 karakter", () => {
  const normalMsg = buildActionMessage("siaga", "gempa", "Guncangan terasa nyata.");
  assert.ok(normalMsg.length <= 1000);
  assert.ok(normalMsg.includes("Guncangan terasa nyata."));

  const veryLongDesc = "Bencana ".repeat(200);
  const cappedMsg = buildActionMessage("awas", "tsunami", veryLongDesc);
  assert.ok(cappedMsg.length <= 1000);
});

test("SID Mapper: sanitizeExternalId mematuhi regex ^[A-Za-z0-9._:-]{1,100}$", () => {
  const valid = sanitizeExternalId("gempa-881_sub.01:id");
  assert.equal(valid, "gempa-881_sub.01:id");

  const dirty = sanitizeExternalId("gempa #881 @desa (cibenda)?");
  assert.equal(dirty, "gempa--881--desa--cibenda--");
  assert.ok(/^[A-Za-z0-9._:-]{1,100}$/.test(dirty));
});

test("SID Mapper: mapToSidAlertInput menghasilkan payload lengkap sesuai spesifikasi", () => {
  const mapped = mapToSidAlertInput({
    externalId: "gempa-123",
    alertRecord: {
      id: "alert-uuid-1",
      level: AlertLevel.ORANGE,
      source: "BMKG",
      description: "Gempa M5.6 dirasakan warga di sekitar Desa Cibenda (III Pangandaran).",
      eventTime: new Date("2026-11-16T14:02:00Z"),
      referenceMagnitude: 5.6,
    },
    determiningEarthquake: {
      magnitude: 5.6,
      depth: "18 km",
      location: "23 km barat daya Pangandaran",
      updatedAt: "2026-11-16T14:02:00Z",
    },
    publicBaseUrl: "https://sigap-berdampak.widyatama.ac.id",
  });

  assert.equal(mapped.type, "gempa");
  assert.equal(mapped.level, "siaga");
  assert.equal(mapped.magnitude, 5.6);
  assert.equal(mapped.depth_km, 18);
  assert.equal(mapped.location, "23 km barat daya Pangandaran");
  assert.ok(mapped.title.length <= 150);
  assert.ok(mapped.message && mapped.message.length <= 1000);
  assert.equal(mapped.occurred_at, "2026-11-16T14:02:00.000Z");
  assert.ok(mapped.sent_at);
  assert.ok(mapped.expires_at);
  assert.equal(
    mapped.link_url,
    "https://sigap-berdampak.widyatama.ac.id/?view=warga#alert-gempa-123"
  );
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

test("SidIntegrationService: Antrean aman dan getStatus memberikan snapshot terkini", () => {
  SidIntegrationService.clearQueueForTest();
  const statusBefore = SidIntegrationService.getStatus();
  assert.equal(statusBefore.queueSize, 0);

  // Jika tidak aktif, enqueue tidak menambahkan item ke antrean
  SidIntegrationService.enqueueAlert("test-alert", {
    type: "gempa",
    level: "waspada",
    title: "Test",
    occurred_at: new Date().toISOString(),
    sent_at: new Date().toISOString(),
  });

  const statusAfter = SidIntegrationService.getStatus();
  assert.equal(statusAfter.queueSize, 0);
});
