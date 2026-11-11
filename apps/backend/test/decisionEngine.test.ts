import assert from "node:assert/strict";
import { test } from "node:test";
import { DecisionEngineService } from "../src/services/decisionEngine.service.js";
import { parseFeltAreas } from "../src/utils/bmkgEarthquake.util.js";

const OFFICIAL = "BMKG InaTEWS";
const ESTIMATE = "BMKG (estimasi dari data gempa)";

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

const quake = (felt: string, ageHours = 0, magnitude = 5) => ({
  magnitude,
  depth: "10 km",
  location: "x",
  coordinates: { latitude: 0, longitude: 0 },
  distanceToVillage: 10,
  felt,
  feltAreas: parseFeltAreas(felt),
  potential: "",
  tsunamiPotential: null,
  shakemap: "",
  updatedAt: hoursAgo(ageHours),
});

const tsunami = (status: string) => ({
  status,
  source: status === "WASPADA" ? ESTIMATE : OFFICIAL,
  description: `tsunami ${status}`,
});

const evaluate = (input: object) => DecisionEngineService.evaluate(input as never);

const cases: [string, object, string, string][] = [
  ["tanpa data", {}, "GREEN", "BMKG"],
  ["NORMAL tanpa gempa", { tsunami: tsunami("NORMAL") }, "GREEN", "BMKG"],
  ["gempa tidak dirasakan", { earthquakes: [quake("")] }, "YELLOW", "BMKG"],
  ["gempa dirasakan", { earthquakes: [quake("III Parigi")] }, "ORANGE", "BMKG"],
  ["gempa dirasakan lewat 24 jam", { earthquakes: [quake("III Parigi", 25)] }, "GREEN", "BMKG"],
  ["dirasakan di Parigi Moutong (Sulawesi)", { earthquakes: [quake("III Parigi Moutong")] }, "YELLOW", "BMKG"],
  ["dirasakan di Kecamatan Parigi", { earthquakes: [quake("III Kecamatan Parigi")] }, "ORANGE", "BMKG"],
  ["WASPADA dan gempa dirasakan", { tsunami: tsunami("WASPADA"), earthquakes: [quake("III Parigi")] }, "ORANGE", "BMKG"],
  ["WASPADA dan gempa tidak dirasakan", { tsunami: tsunami("WASPADA"), earthquakes: [quake("")] }, "YELLOW", ESTIMATE],
  ["SIAGA dan gempa dirasakan", { tsunami: tsunami("SIAGA"), earthquakes: [quake("III Parigi")] }, "ORANGE", OFFICIAL],
  ["AWAS dan gempa dirasakan", { tsunami: tsunami("AWAS"), earthquakes: [quake("III Parigi")] }, "RED", OFFICIAL],
  ["WASPADA dan gempa lewat 24 jam", { tsunami: tsunami("WASPADA"), earthquakes: [quake("III Parigi", 25)] }, "YELLOW", ESTIMATE],
];

for (const [name, input, level, source] of cases) {
  test(`Decision Engine: ${name}`, () => {
    const result = evaluate(input);
    assert.equal(result.level, level);
    assert.equal(result.source, source);
  });
}

test("Decision Engine: gempa susulan kecil tidak menurunkan level", () => {
  const result = evaluate({
    earthquakes: [quake("", 1, 4.1), quake("III Pangandaran", 3, 5.6)],
  });
  assert.equal(result.level, "ORANGE");
  assert.match(result.description, /M5\.6/);
});

test("Decision Engine: ringkasan rentetan gempa aktif", () => {
  const result = evaluate({
    earthquakes: [
      quake("", 1, 4.1),
      quake("III Pangandaran", 2, 4.8),
      quake("III Pangandaran", 3, 5.6),
      quake("III Pangandaran", 30, 6.5),
    ],
  });
  assert.equal(result.level, "ORANGE");
  assert.equal(result.sequence?.eventCount, 3);
  assert.equal(result.sequence?.maxMagnitude, 5.6);
  assert.equal(result.sequence?.levelMaxMagnitude, 5.6);
  assert.match(result.description, /M5\.6/);
});

test("Decision Engine: masa aktif mengikuti kejadian terbaru pada level tertinggi", () => {
  const latestFelt = quake("III Pangandaran", 2, 4.8);
  const result = evaluate({ earthquakes: [quake("", 1, 4.1), latestFelt, quake("III Pangandaran", 3, 5.6)] });
  assert.equal(result.sequence?.eventTime, latestFelt.updatedAt);
});

test("Decision Engine: status tsunami tidak membawa ringkasan rentetan", () => {
  const result = evaluate({ tsunami: tsunami("AWAS"), earthquakes: [quake("III Parigi")] });
  assert.equal(result.sequence, undefined);
});
