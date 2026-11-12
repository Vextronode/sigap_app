/**
 * Utility helper untuk memformat timestamp dan label alert
 * dalam Bahasa Indonesia untuk SIGAP Desa Cibenda.
 */

import { WIB_TIME_ZONE, wibDayDiff } from "../../../utils/date";

export interface FormattedAlertTime {
  primary: string; // contoh: "Hari Ini, 14:23 WIB" atau "Kemarin, 22:45 WIB"
  relative: string; // contoh: "2 menit lalu" atau "4 jam lalu"
}

export function formatAlertTimestamp(value?: string | null): FormattedAlertTime {
  if (!value) {
    return {
      primary: "--:-- WIB",
      relative: "Belum tersedia",
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      primary: value,
      relative: "-",
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // Waktu relatif dalam Bahasa Indonesia
  let relative = "Baru saja";
  if (diffMin >= 1 && diffMin < 60) {
    relative = `${diffMin} menit lalu`;
  } else if (diffHour >= 1 && diffHour < 24) {
    relative = `${diffHour} jam lalu`;
  } else if (diffDay >= 1 && diffDay < 30) {
    relative = `${diffDay} hari lalu`;
  } else if (diffDay >= 30) {
    const months = Math.floor(diffDay / 30);
    relative = `${months} bulan lalu`;
  }

  // Format jam (contoh: "14:23 WIB")
  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: WIB_TIME_ZONE,
  }).replace(".", ":");

  // "Hari Ini" dan "Kemarin" mengikuti kalender WIB, bukan zona perangkat (TK-05).
  const dayDiff = wibDayDiff(date, now);

  let primary: string;
  if (dayDiff === 0) {
    primary = `Hari Ini, ${timeStr} WIB`;
  } else if (dayDiff === 1) {
    primary = `Kemarin, ${timeStr} WIB`;
  } else {
    const dayMonth = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      timeZone: WIB_TIME_ZONE,
    });
    primary = `${dayMonth}, ${timeStr} WIB`;
  }

  return { primary, relative };
}
