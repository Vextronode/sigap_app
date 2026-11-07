import assert from "node:assert/strict";
import { test } from "node:test";
import { DecisionEngineService } from "../src/services/decisionEngine.service.js";

const OFFICIAL = "BMKG InaTEWS";
const ESTIMATE = "BMKG (estimasi dari data gempa)";

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

const quake = (felt: string, ageHours = 0) => ({
  magnitude: 5,
  depth: "10 km",
  location: "x",
  coordinates: { latitude: 0, longitude: 0 },
  distanceToVillage: 10,
  felt,
  potential: "",
  shakemap: "",
  updatedAt: hoursAgo(ageHours),
});

const tsunami = (status: string) => ({
  status,
  source: status === "WASPADA" ? ESTIMATE : OFFICIAL,
  description: `tsunami ${status}`,
});

const cases: [string, object, string, string][] = [
  ["tanpa data", {}, "GREEN", "BMKG"],
  ["NORMAL tanpa gempa", { tsunami: tsunami("NORMAL") }, "GREEN", "BMKG"],
  ["gempa tidak dirasakan", { earthquake: quake("") }, "YELLOW", "BMKG"],
  ["gempa dirasakan", { earthquake: quake("III Parigi") }, "ORANGE", "BMKG"],
  ["gempa dirasakan lewat 24 jam", { earthquake: quake("III Parigi", 25) }, "GREEN", "BMKG"],
  ["WASPADA dan gempa dirasakan", { tsunami: tsunami("WASPADA"), earthquake: quake("III Parigi") }, "ORANGE", "BMKG"],
  ["WASPADA dan gempa tidak dirasakan", { tsunami: tsunami("WASPADA"), earthquake: quake("") }, "YELLOW", ESTIMATE],
  ["SIAGA dan gempa dirasakan", { tsunami: tsunami("SIAGA"), earthquake: quake("III Parigi") }, "ORANGE", OFFICIAL],
  ["AWAS dan gempa dirasakan", { tsunami: tsunami("AWAS"), earthquake: quake("III Parigi") }, "RED", OFFICIAL],
  ["WASPADA dan gempa lewat 24 jam", { tsunami: tsunami("WASPADA"), earthquake: quake("III Parigi", 25) }, "YELLOW", ESTIMATE],
];

for (const [name, input, level, source] of cases) {
  test(`Decision Engine: ${name}`, () => {
    const result = DecisionEngineService.evaluate(input as never);
    assert.equal(result.level, level);
    assert.equal(result.source, source);
  });
}
