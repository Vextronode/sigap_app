/**
 * Memformat waktu login terakhir sesuai spesifikasi SIGAP:
 * - Hari ini: "Hari ini, 08:12 WIB"
 * - Kemarin: "Kemarin, 14:30 WIB"
 * - Tanggal lain: "12 Okt 2023, 09:15 WIB"
 * - Belum pernah: "Belum pernah login"
 */
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

  // Format perbandingan kalender tanggal WIB
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return {
      primaryText: `Hari ini, ${timeStr} WIB`,
      hasLoggedIn: true,
    };
  }

  if (isSameDay(date, yesterday)) {
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
