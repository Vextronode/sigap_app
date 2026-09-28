import React from "react";
import {
  ShieldCheck,
  UserCheck,
  Pencil,
  KeyRound,
  Unlock,
  Power,
  Users,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { UserRecord } from "../../../types/userManagement";
import { formatLastLoginTime, formatIpAddress } from "../utils/formatLastLogin";

interface UserTableProps {
  users: UserRecord[];
  isLoading: boolean;
  currentUserId?: string;
  activeAdminCount: number;
  onEdit: (user: UserRecord) => void;
  onResetPassword: (user: UserRecord) => void;
  onToggleStatus: (user: UserRecord) => void;
  onUnlock: (user: UserRecord) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  currentUserId,
  activeAdminCount,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onUnlock,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
          <Users size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          Tidak Ada Pengguna Ditemukan
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Tidak ada akun yang sesuai dengan filter pencarian Anda saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4">Pengguna</th>
              <th className="px-5 py-4">Peran Akses</th>
              <th className="px-5 py-4">Status Akun</th>
              <th className="px-5 py-4">Login Terakhir</th>
              <th className="px-5 py-4 hidden lg:table-cell">Terdaftar</th>
              <th className="px-5 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {users.map((user) => {
              const isSelf = Boolean(currentUserId && user.id === currentUserId);
              const isLastAdmin =
                user.role === "admin" && user.isActive && activeAdminCount <= 1;
              const { primaryText, hasLoggedIn } = formatLastLoginTime(user.lastLoginAt);

              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Pengguna (Avatar, Nama, Email) */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl ${
                          user.role === "admin"
                            ? "bg-gradient-to-br from-rose-500 to-red-600"
                            : "bg-gradient-to-br from-blue-600 to-indigo-700"
                        } text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs uppercase`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {user.name}
                          </span>
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-[#00247D] dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                              Anda
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate block font-mono">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Peran Akses: Admin = Merah, Petugas = Biru */}
                  <td className="px-5 py-4">
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60">
                        <ShieldCheck size={14} />
                        <span>Administrator</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
                        <UserCheck size={14} />
                        <span>Petugas Lapangan</span>
                      </span>
                    )}
                  </td>

                  {/* Status Akun */}
                  <td className="px-5 py-4">
                    {user.isLocked ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock size={13} className="shrink-0" />
                          <span>Terkunci</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onUnlock(user)}
                          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          title="Buka blokir sekarang"
                        >
                          <Unlock size={13} />
                          <span>Buka Blokir</span>
                        </button>
                      </div>
                    ) : user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60">
                        <AlertCircle size={13} />
                        <span>Nonaktif</span>
                      </span>
                    )}
                  </td>

                  {/* Login Terakhir (Hari ini / Kemarin / Tanggal + Jam WIB & IP) */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col text-xs leading-tight">
                      <span
                        className={`font-semibold ${
                          hasLoggedIn
                            ? "text-slate-800 dark:text-slate-200"
                            : "text-slate-400 dark:text-slate-500 italic"
                        }`}
                      >
                        {primaryText}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                        IP: {formatIpAddress(user.lastLoginIp)}
                      </span>
                    </div>
                  </td>

                  {/* Tanggal Terdaftar */}
                  <td className="px-5 py-4 hidden lg:table-cell text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Tombol Buka Kunci (Jika Terkunci) */}
                      {user.isLocked && (
                        <button
                          type="button"
                          onClick={() => onUnlock(user)}
                          aria-label={`Buka blokir akun ${user.name}`}
                          title="Buka blokir akun (Clear lockout)"
                          className="p-2 rounded-xl text-amber-600 hover:text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                        >
                          <Unlock size={16} />
                        </button>
                      )}

                      {/* Tombol Reset Password */}
                      <button
                        type="button"
                        onClick={() => onResetPassword(user)}
                        aria-label={`Reset password akun ${user.name}`}
                        title="Reset password pengguna"
                        className="p-2 rounded-xl text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                      >
                        <KeyRound size={16} />
                      </button>

                      {/* Tombol Edit Profil & Role */}
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        aria-label={`Edit pengguna ${user.name}`}
                        title="Edit pengguna"
                        className="p-2 rounded-xl text-slate-600 hover:text-[#00247D] dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Tombol Toggle Aktif / Nonaktif */}
                      <button
                        type="button"
                        disabled={isSelf || (isLastAdmin && user.isActive)}
                        onClick={() => onToggleStatus(user)}
                        aria-label={`${user.isActive ? "Nonaktifkan" : "Aktifkan"} akun ${user.name}`}
                        title={
                          isSelf
                            ? "Anda tidak dapat menonaktifkan akun sendiri"
                            : isLastAdmin && user.isActive
                            ? "Satu-satunya Administrator aktif (tidak dapat dinonaktifkan)"
                            : user.isActive
                            ? "Nonaktifkan akun"
                            : "Aktifkan akun"
                        }
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isSelf || (isLastAdmin && user.isActive)
                            ? "opacity-30 cursor-not-allowed text-slate-400"
                            : user.isActive
                            ? "text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
