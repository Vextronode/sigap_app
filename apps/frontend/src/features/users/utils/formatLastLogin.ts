/**
 * Memformat waktu login terakhir sesuai spesifikasi SIGAP:
 * - Hari ini: "Hari ini, 08:12 WIB"
 * - Kemarin: "Kemarin, 14:30 WIB"
 * - Tanggal lain: "12 Okt 2023, 09:15 WIB"
 * - Belum pernah: "Belum pernah login"
 */
import { wibDayDiff } from "../../../utils/date";

export function formatLastLoginTime(isoString?: string | null): {
  primaryText: string;
  hasLoggedIn: boolean;
} {
  if (!isoString) {
    return {
      primaryText: "Belum pernah login",
      hasLoggedIn: false,
    };
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return {
      primaryText: "Belum pernah login",
      hasLoggedIn: false,
    };
  }

  const now = new Date();

  // Format jam dan menit WIB
  const timeStr = date
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    })
    .replace(".", ":");

  // Format perbandingan kalender tanggal WIB, bukan zona perangkat (TK-05)
  const dayDiff = wibDayDiff(date, now);

  if (dayDiff === 0) {
    return {
      primaryText: `Hari ini, ${timeStr} WIB`,
      hasLoggedIn: true,
    };
  }

  if (dayDiff === 1) {
    return {
      primaryText: `Kemarin, ${timeStr} WIB`,
      hasLoggedIn: true,
    };
  }

  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);

  return {
    primaryText: `${dateFormatted}, ${timeStr} WIB`,
    hasLoggedIn: true,
  };
}

/**
 * Format alamat IP agar IP loopback / localhost ditampilkan ramah pengguna
 */
export function formatIpAddress(ip?: string | null): string {
  if (!ip || ip.trim() === "") return "-";
  const cleaned = ip.replace(/^::ffff:/, "").trim();
  if (cleaned === "::1" || cleaned === "127.0.0.1") {
    return "127.0.0.1 (Localhost)";
  }
  return cleaned;
}
