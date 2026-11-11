import type { CurrentAlert } from "../types/dashboard";
import { formatWibMoment } from "./date";

/**
 * Ringkasan rentetan gempa untuk banner dan bar insiden, hanya bila ada lebih
 * dari satu gempa aktif. Contoh: "Rentetan: 6 gempa sejak 10.12 WIB, terbesar
 * M5.6. Berlaku s.d. 12 Nov 10.12 WIB bila tidak ada gempa baru."
 */
export const getSequenceSummary = (alert?: CurrentAlert | null): string | null => {
  if (
    !alert?.episodeStartedAt ||
    !alert.episodeEventCount ||
    alert.episodeEventCount < 2 ||
    alert.episodeMaxMagnitude == null
  ) {
    return null;
  }

  const summary = `Rentetan: ${alert.episodeEventCount} gempa sejak ${formatWibMoment(
    alert.episodeStartedAt
  )}, terbesar M${alert.episodeMaxMagnitude}.`;

  return alert.activeUntil
    ? `${summary} Berlaku s.d. ${formatWibMoment(alert.activeUntil)} bila tidak ada gempa baru.`
    : summary;
};
