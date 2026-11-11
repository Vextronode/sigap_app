/**
 * Decision Engine — menentukan level kesiapsiagaan dari status tsunami dan
 * seluruh gempa relevan yang masih aktif.
 *
 * Sumber gempa (lihat alert.scheduler.ts): `EarthquakeService.getActiveEvents()`,
 * yaitu gempa yang sudah lolos filter relevansi Desa Cibenda.
 *
 * Setiap gempa aktif selama 24 jam sejak waktu kejadiannya. Level gempa adalah
 * level tertinggi di antara gempa yang masih aktif, sehingga gempa susulan yang
 * lebih kecil tidak menurunkan level selama gempa penentu masih aktif (ADR-046).
 */

import { AlertLevel } from "../../generated/prisma/enums.js";
import { ALERT_ACTIVE_MAX_AGE_MS } from "../config/alertRules.js";
import { isFeltNearVillage } from "../utils/bmkgEarthquake.util.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";
import type { DecisionInput, DecisionResult, TsunamiStatus } from "../types/alert.types.js";

export const LEVEL_RANK: Record<AlertLevel, number> = {
  [AlertLevel.GREEN]: 0,
  [AlertLevel.YELLOW]: 1,
  [AlertLevel.ORANGE]: 2,
  [AlertLevel.RED]: 3,
};

const eventTimeMs = (earthquake: EarthquakeInfo) => new Date(earthquake.updatedAt).getTime();

/**
 * Status tsunami (resmi InaTEWS via override manual, ATAU estimasi
 * SIGAP dari data gempa — lihat BmkgService.getTsunamiStatus()).
 */
const evaluateTsunami = (tsunami: DecisionInput["tsunami"]): DecisionResult | null => {
  if (!tsunami || tsunami.status === "NORMAL") return null;

  const tsunamiLevelMap: Record<Exclude<TsunamiStatus, "NORMAL">, AlertLevel> = {
    AWAS: AlertLevel.RED,
    SIAGA: AlertLevel.ORANGE,
    WASPADA: AlertLevel.YELLOW,
  };

  return {
    level: tsunamiLevelMap[tsunami.status as Exclude<TsunamiStatus, "NORMAL">],
    source: tsunami.source,
    description: tsunami.description,
  };
};

/** Level satu gempa, atau null bila sudah berumur lebih dari 24 jam. */
const assessEarthquake = (earthquake: EarthquakeInfo): AlertLevel | null => {
  const ageMs = Date.now() - eventTimeMs(earthquake);
  if (!(ageMs <= ALERT_ACTIVE_MAX_AGE_MS)) return null;
  return isFeltNearVillage(earthquake.feltAreas) ? AlertLevel.ORANGE : AlertLevel.YELLOW;
};

const describeEarthquake = (earthquake: EarthquakeInfo, level: AlertLevel): string =>
  level === AlertLevel.ORANGE
    ? `Gempa M${earthquake.magnitude} dirasakan warga di sekitar Desa Cibenda (${earthquake.felt}).`
    : `Gempa M${earthquake.magnitude} terdeteksi dalam radius pemantauan Desa Cibenda, namun belum ada laporan dirasakan warga. Tetap pantau informasi resmi BMKG.`;

/**
 * Rentetan gempa: level tertinggi di antara gempa aktif. Deskripsi dan masa
 * aktif memakai kejadian terbaru pada level tersebut.
 */
const evaluateEarthquakes = (earthquakes: DecisionInput["earthquakes"]): DecisionResult | null => {
  const active = (earthquakes ?? [])
    .map((event) => ({ event, level: assessEarthquake(event) }))
    .filter((item): item is { event: EarthquakeInfo; level: AlertLevel } => item.level !== null);

  if (active.length === 0) return null;

  const topRank = Math.max(...active.map((item) => LEVEL_RANK[item.level]));
  const atTopLevel = active.filter((item) => LEVEL_RANK[item.level] === topRank);
  const latestAtTop = atTopLevel.reduce((latest, item) =>
    eventTimeMs(item.event) > eventTimeMs(latest.event) ? item : latest
  );
  const startedAt = Math.min(...active.map((item) => eventTimeMs(item.event)));

  return {
    level: latestAtTop.level,
    source: "BMKG",
    description: describeEarthquake(latestAtTop.event, latestAtTop.level),
    sequence: {
      eventTime: latestAtTop.event.updatedAt,
      eventMagnitude: latestAtTop.event.magnitude,
      levelMaxMagnitude: Math.max(...atTopLevel.map((item) => item.event.magnitude)),
      startedAt: new Date(startedAt).toISOString(),
      eventCount: active.length,
      maxMagnitude: Math.max(...active.map((item) => item.event.magnitude)),
    },
  };
};

export class DecisionEngineService {
  /**
   * Level akhir = level tertinggi antara tsunami dan gempa (ADR-040).
   * Bila sama tinggi, status tsunami yang dipakai. Bila gempa lebih tinggi,
   * informasi tsunami tetap disertakan pada deskripsi.
   */
  static evaluate(input: DecisionInput): DecisionResult {
    const tsunami = evaluateTsunami(input.tsunami);
    const earthquake = evaluateEarthquakes(input.earthquakes);

    if (tsunami && earthquake && LEVEL_RANK[earthquake.level] > LEVEL_RANK[tsunami.level]) {
      return {
        ...earthquake,
        description: `${earthquake.description} ${tsunami.description}`,
      };
    }

    const result = tsunami ?? earthquake;
    if (result) return result;

    return {
      level: AlertLevel.GREEN,
      source: "BMKG",
      description: "Tidak terdapat peringatan resmi BMKG.",
    };
  }
}
