/**
 * Utility helper untuk memformat timestamp dan label alert
 * dalam Bahasa Indonesia untuk SIGAP Desa Cibenda.
 */

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
  }).replace(".", ":");

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  let primary: string;
  if (isToday) {
    primary = `Hari Ini, ${timeStr} WIB`;
  } else if (isYesterday) {
    primary = `Kemarin, ${timeStr} WIB`;
  } else {
    const day = date.getDate();
    const month = date.toLocaleDateString("id-ID", { month: "short" });
    primary = `${day} ${month}, ${timeStr} WIB`;
  }

  return { primary, relative };
}
