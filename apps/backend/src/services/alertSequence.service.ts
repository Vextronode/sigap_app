import { AlertLevel } from "../../generated/prisma/enums.js";
import { ALERT_ACTIVE_MAX_AGE_MS, ALERT_RULES } from "../config/alertRules.js";
import { LEVEL_RANK } from "./decisionEngine.service.js";
import { alertActiveFrom, isAlertRecordActive } from "./alert.service.js";
import type { AlertRecord, DecisionResult } from "../types/alert.types.js";

export type AlertAction =
  | { type: "skip" }
  | { type: "save"; notify: boolean; referenceMagnitude: number | null }
  | { type: "extend"; referenceMagnitude: number };

/** Selisih magnitudo dibulatkan ke satu desimal agar 4.1 + 1.0 tetap sama dengan 5.1. */
const magnitudeStep = (magnitude: number, reference: number) =>
  Math.round((magnitude - reference) * 10) / 10;

const sameTime = (left: Date | null | undefined, right: string) =>
  !!left && new Date(left).getTime() === new Date(right).getTime();

const rankOf = (level: string) => LEVEL_RANK[level as AlertLevel] ?? 0;

/**
 * Aturan duplikat untuk alert tanpa rentetan gempa (status tsunami). Estimasi
 * tsunami dikenali dari gempa asalnya, sehingga revisi data BMKG pada gempa yang
 * sama tidak menerbitkan alert ulang. Status resmi dikenali dari teksnya dan
 * diterbitkan ulang setiap 24 jam sebagai pengingat (ADR-045).
 */
const isDuplicateWithoutSequence = (result: DecisionResult, latest: AlertRecord | null) => {
  if (!latest || latest.level !== result.level || latest.source !== result.source) return false;
  if (result.sourceEventTime) return sameTime(latest.eventTime, result.sourceEventTime);
  return (
    Date.now() - new Date(latest.createdAt).getTime() <= ALERT_ACTIVE_MAX_AGE_MS &&
    latest.description === result.description
  );
};

/**
 * Rentetan berlanjut bila masih ada gempa aktif yang terjadi selama alert rentetan
 * sebelumnya berlaku. Penurunan level karena gempa penentu berakhir terjadi tepat
 * saat alert tersebut berakhir, sehingga tidak dianggap rentetan baru.
 */
const continuesSequence = (result: DecisionResult, latest: AlertRecord): boolean =>
  !!latest.episodeStartedAt &&
  !!result.sequence &&
  new Date(result.sequence.startedAt).getTime() <=
    alertActiveFrom(latest).getTime() + ALERT_ACTIVE_MAX_AGE_MS;

/**
 * Menentukan tindakan scheduler terhadap hasil Decision Engine, dibandingkan
 * dengan rekaman alert terakhir apa adanya (ADR-046):
 * - Tidak ada alert aktif dan rentetan tidak berlanjut: alert baru dan notifikasi.
 * - Level naik: alert baru dan notifikasi.
 * - Level turun: alert baru tanpa notifikasi.
 * - Level sama: alert baru dan notifikasi bila magnitudo terbesar pada level itu
 *   paling sedikit `magnitudeStepForNotification` di atas magnitudo yang terakhir
 *   dikirim notifikasi; selain itu alert yang berlaku diperpanjang tanpa notifikasi.
 * Hasil tanpa rentetan gempa (status tsunami) memakai aturan duplikat sebelumnya.
 */
export const decideAlertAction = (
  result: DecisionResult,
  latest: AlertRecord | null
): AlertAction => {
  const sequence = result.sequence;
  if (!sequence) {
    return isDuplicateWithoutSequence(result, latest)
      ? { type: "skip" }
      : { type: "save", notify: true, referenceMagnitude: null };
  }

  const isSequence = !!latest && continuesSequence(result, latest);
  const previous = latest && (isSequence || isAlertRecordActive(latest)) ? latest : null;

  if (!previous) {
    return { type: "save", notify: true, referenceMagnitude: sequence.levelMaxMagnitude };
  }

  const rankDelta = rankOf(result.level) - rankOf(previous.level);
  if (rankDelta > 0) {
    return { type: "save", notify: true, referenceMagnitude: sequence.levelMaxMagnitude };
  }
  if (rankDelta < 0) {
    return { type: "save", notify: false, referenceMagnitude: previous.referenceMagnitude ?? null };
  }

  // Level sama, tetapi alert sebelumnya bukan alert rentetan gempa.
  if (!isSequence) {
    return { type: "save", notify: false, referenceMagnitude: sequence.levelMaxMagnitude };
  }

  const reference = previous.referenceMagnitude;
  if (
    reference !== null &&
    reference !== undefined &&
    magnitudeStep(sequence.levelMaxMagnitude, reference) >=
      ALERT_RULES.sequence.magnitudeStepForNotification
  ) {
    return { type: "save", notify: true, referenceMagnitude: sequence.levelMaxMagnitude };
  }

  const changed =
    !sameTime(previous.eventTime, sequence.eventTime) ||
    !sameTime(previous.episodeStartedAt, sequence.startedAt) ||
    previous.episodeEventCount !== sequence.eventCount ||
    previous.episodeMaxMagnitude !== sequence.maxMagnitude ||
    previous.description !== result.description ||
    previous.source !== result.source;

  return changed
    ? { type: "extend", referenceMagnitude: reference ?? sequence.levelMaxMagnitude }
    : { type: "skip" };
};
