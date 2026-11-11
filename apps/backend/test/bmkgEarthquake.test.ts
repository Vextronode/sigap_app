import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyTsunamiPotential,
  mergeBmkgFeeds,
  parseBmkgDateTime,
  parseFeltAreas,
} from "../src/utils/bmkgEarthquake.util.js";

// Bentuk item mengikuti feed BMKG: gempaterkini memuat Potensi tanpa Dirasakan,
// gempadirasakan memuat Dirasakan tanpa Potensi, autogempa memuat keduanya dan Shakemap.
const base = {
  Tanggal: "11 Nov 2026",
  Jam: "06:12:04 WIB",
  DateTime: "2026-11-10T23:12:04+00:00",
  Coordinates: "-7.90,108.40",
  Lintang: "7.90 LS",
  Bujur: "108.40 BT",
  Magnitude: "5.2",
  Kedalaman: "10 km",
};
const terkini = { ...base, Wilayah: "35 km BaratDaya PANGANDARAN-JABAR", Potensi: "Tidak berpotensi tsunami" };
const dirasakan = {
  ...base,
  Wilayah: "Pusat gempa berada di laut 35 km barat daya Pangandaran",
  Dirasakan: "III Pangandaran, II - III Ciamis",
};
const auto = {
  ...base,
  Wilayah: "Pusat gempa berada di laut 35 km barat daya Pangandaran",
  Potensi: "Gempa ini dirasakan untuk diteruskan pada masyarakat",
  Dirasakan: "III Pangandaran, II - III Ciamis",
  Shakemap: "20261111061204.mmi.jpg",
};

test("kejadian di gempaterkini dan gempadirasakan disatukan", () => {
  const merged = mergeBmkgFeeds({ terkini: [terkini], dirasakan: [dirasakan] });
  assert.equal(merged.length, 1);
  assert.equal(merged[0].Dirasakan, "III Pangandaran, II - III Ciamis");
  assert.equal(merged[0].Potensi, "Tidak berpotensi tsunami");
  assert.equal(merged[0].Wilayah, terkini.Wilayah);
});

test("Potensi diambil dari gempaterkini, data inti dan Shakemap dari autogempa", () => {
  const merged = mergeBmkgFeeds({ auto, terkini: [terkini], dirasakan: [dirasakan] });
  assert.equal(merged.length, 1);
  assert.equal(merged[0].Potensi, "Tidak berpotensi tsunami");
  assert.equal(merged[0].Shakemap, "20261111061204.mmi.jpg");
  assert.equal(merged[0].Wilayah, auto.Wilayah);
});

test("kejadian berbeda tetap terpisah", () => {
  const other = { ...dirasakan, DateTime: "2026-11-10T20:00:00+00:00" };
  assert.equal(mergeBmkgFeeds({ terkini: [terkini], dirasakan: [dirasakan, other] }).length, 2);
});

test("item dengan DateTime tidak valid dibuang", () => {
  const broken = { ...dirasakan, DateTime: "tidak-valid" };
  assert.equal(mergeBmkgFeeds({ dirasakan: [broken] }).length, 0);
  assert.equal(parseBmkgDateTime("tidak-valid"), null);
  assert.equal(parseBmkgDateTime(undefined), null);
  assert.equal(parseBmkgDateTime("2026-11-10T23:12:04+00:00"), "2026-11-10T23:12:04.000Z");
});

test("klasifikasi Potensi hanya mengenali teks terverifikasi", () => {
  assert.equal(classifyTsunamiPotential("Tidak berpotensi tsunami"), "TIDAK_BERPOTENSI");
  assert.equal(
    classifyTsunamiPotential("Gempa ini dirasakan untuk diteruskan pada masyarakat"),
    "INFORMASI_DIRASAKAN"
  );
  assert.equal(classifyTsunamiPotential("Berpotensi tsunami"), "TIDAK_DIKENAL");
  assert.equal(classifyTsunamiPotential(""), null);
  assert.equal(classifyTsunamiPotential(undefined), null);
});

test("Dirasakan dipecah menjadi wilayah dan skala MMI", () => {
  assert.deepEqual(parseFeltAreas("III Pangandaran, II - III Ciamis, III-IV Kecamatan Bula"), [
    { area: "Pangandaran", mmi: "III" },
    { area: "Ciamis", mmi: "II-III" },
    { area: "Kecamatan Bula", mmi: "III-IV" },
  ]);
  assert.deepEqual(parseFeltAreas("Banjar"), [{ area: "Banjar", mmi: null }]);
  assert.deepEqual(parseFeltAreas("-"), []);
  assert.deepEqual(parseFeltAreas(undefined), []);
});
