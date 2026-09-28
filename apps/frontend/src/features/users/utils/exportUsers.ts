import type { UserRecord } from "../../../types/userManagement";

/**
 * Utilitas untuk mengunduh daftar pengguna ke dalam format spreadsheet CSV/Excel
 */
export function exportUsersToCSV(users: UserRecord[]): void {
  const headers = [
    "No",
    "Nama Lengkap",
    "Email",
    "Peran Akses",
    "Status Akun",
    "Login Terakhir",
    "IP Terakhir",
    "Tanggal Terdaftar",
  ];

  const rows = users.map((u, index) => {
    const roleLabel = u.role === "admin" ? "Administrator" : "Petugas Lapangan";
    const statusLabel = u.isLocked
      ? "Terkunci"
      : u.isActive
      ? "Aktif"
      : "Nonaktif";

    let lastLoginText = "Belum pernah login";
    if (u.lastLoginAt) {
      try {
        const d = new Date(u.lastLoginAt);
        lastLoginText = `${new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }).format(d)} WIB`;
      } catch {
        lastLoginText = u.lastLoginAt;
      }
    }

    let createdAtText: string;
    try {
      const d = new Date(u.createdAt);
      createdAtText = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(d);
    } catch {
      createdAtText = u.createdAt;
    }

    const lastIpText = u.lastLoginIp || "-";

    return [
      String(index + 1),
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${roleLabel}"`,
      `"${statusLabel}"`,
      `"${lastLoginText}"`,
      `"${lastIpText}"`,
      `"${createdAtText}"`,
    ];
  });

  // Gabungkan dengan BOM UTF-8 agar Excel membaca karakter khusus / aksen dengan benar
  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const todayStr = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Daftar_Pengguna_SIGAP_Cibenda_${todayStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
