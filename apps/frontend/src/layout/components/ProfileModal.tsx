import { useState } from "react";
import {
  X,
  CircleUser,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GrUserAdmin } from "react-icons/gr";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/authService";
import axios from "axios";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user } = useAuthStore();

  const isOperator = user?.roles?.some((r) => r.toLowerCase().includes("operator")) ?? false;
  const isAdminRole = !isOperator;

  // State form ganti password mandiri
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError(null);
    setPwSuccess(null);
  };

  const handleClose = () => {
    setShowChangePassword(false);
    resetPasswordForm();
    onClose();
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!currentPassword.trim()) {
      setPwError("Password saat ini wajib diisi.");
      return;
    }

    if (!newPassword.trim()) {
      setPwError("Password baru wajib diisi.");
      return;
    }

    if (!confirmPassword.trim()) {
      setPwError("Konfirmasi password baru wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Konfirmasi password baru tidak sama.");
      return;
    }

    if (newPassword.length < 8) {
      setPwError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword === currentPassword) {
      setPwError("Password baru tidak boleh sama dengan password saat ini.");
      return;
    }

    try {
      setPwLoading(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      setPwSuccess("Password akun Anda berhasil diperbarui!");
      resetPasswordForm();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const resp = err.response?.data;
        const msg = resp?.message || (Array.isArray(resp?.errors) ? resp.errors[0] : null);
        setPwError(msg || "Gagal mengubah password.");
      } else if (err instanceof Error) {
        setPwError(err.message);
      } else {
        setPwError("Terjadi kesalahan pada server saat mengubah password.");
      }
    } finally {
      setPwLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isAdminRole
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50"
                  : "bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50"
              }`}
            >
              {isAdminRole ? (
                <GrUserAdmin className="w-4 h-4" />
              ) : (
                <CircleUser className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                {isAdminRole ? "Profil Administrator" : "Profil Petugas Lapangan"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Informasi kredensial & hak akses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup modal profil"
          >
            <X size={17} />
          </button>
        </div>

        {/* Profile Information List Card */}
        <div className="my-3.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/70 overflow-hidden text-left shadow-2xs">
          {/* Nama Akun */}
          <div className="px-3.5 py-2.5">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase block">
              Nama Akun
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 block mt-0.5">
              {(() => {
                const raw = user?.name;
                if (!raw || raw.trim() === "" || raw === "Admin Placeholder") {
                  return isAdminRole ? "Administrator" : "Petugas Lapangan";
                }
                return raw;
              })()}
            </span>
          </div>

          {/* Email Terdaftar */}
          <div className="px-3.5 py-2.5">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase block">
              Email Terdaftar
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 break-all block mt-0.5">
              {user?.email || (isAdminRole ? "admin@cibenda.desa.id" : "operator@cibenda.desa.id")}
            </span>
          </div>

          {/* Peran & Akses */}
          <div className="px-3.5 py-2.5">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase block mb-1">
              Peran & Akses
            </span>
            <div>
              {isAdminRole ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/90 dark:border-rose-800/80">
                  Administrator (Akses Penuh)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/70 text-[#00247D] dark:text-blue-300 border border-blue-200/90 dark:border-blue-800/80">
                  Petugas Lapangan (Operasional)
                </span>
              )}
            </div>
          </div>

          {/* Status Sesi */}
          <div className="px-3.5 py-2.5">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase block mb-1">
              Status Sesi
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Aktif Terautentikasi
            </span>
          </div>
        </div>

        {/* Section Ganti Password Mandiri */}
        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setShowChangePassword(!showChangePassword);
              setPwError(null);
              setPwSuccess(null);
            }}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-800/60 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 text-amber-900 dark:text-amber-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <KeyRound size={14} className="text-amber-500 shrink-0" />
              <span>Ubah Kata Sandi Akun</span>
            </div>
            {showChangePassword ? (
              <ChevronUp size={14} className="text-amber-600 dark:text-amber-400" />
            ) : (
              <ChevronDown size={14} className="text-amber-600 dark:text-amber-400" />
            )}
          </button>

          {showChangePassword && (
            <form onSubmit={handleChangePasswordSubmit} className="mt-3 space-y-3 text-left">
              {pwSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{pwSuccess}</span>
                </div>
              )}

              {pwError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{pwError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password Saat Ini
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00247D] focus:ring-1 focus:ring-[#00247D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password Baru (Min. 8 karakter)
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00247D] focus:ring-1 focus:ring-[#00247D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00247D] focus:ring-1 focus:ring-[#00247D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-2 bg-[#00247D] hover:bg-[#001c61] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {pwLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Password Baru</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 mt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
