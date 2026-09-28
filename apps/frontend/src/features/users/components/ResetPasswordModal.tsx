import React, { useState } from "react";
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import type { UserRecord } from "../../../types/userManagement";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
  onConfirmReset: (userId: string, newPassword: string) => Promise<void>;
  isSubmitting: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirmReset,
  isSubmitting,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  // Generator password aman acak
  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setShowPassword(true);
    setError(null);
  };

  const handleCopyCredentials = () => {
    if (!newPassword || newPassword.length < 8) {
      setError("Isi atau acak password terlebih dahulu sebelum menyalin kredensial.");
      return;
    }

    const roleName = user.role === "admin" ? "Administrator" : "Petugas Lapangan";
    const text = `*KREDENSIAL LOGIN SIGAP DESA CIBENDA*
Halo Bapak/Ibu ${user.name},
Berikut adalah kredensial akses Anda untuk sistem SIGAP Desa Cibenda:
- *Email:* ${user.email}
- *Password Baru:* ${newPassword}
- *Peran Akses:* ${roleName}
- *Tautan Login:* ${window.location.origin}/admin/login

Harap simpan kredensial ini dengan aman dan tidak membagikannya kepada pihak lain.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError("Password baru wajib terdiri dari minimal 8 karakter.");
      return;
    }

    try {
      await onConfirmReset(user.id, newPassword);
      onClose();
    } catch (err) {
      console.error("[ResetPasswordModal] Error:", err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Reset Password Pengguna
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur ulang kata sandi akun pengguna
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Pengguna Terpilih */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Target Akun:</div>
          <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
            {user.name}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
            {user.email}
          </div>
        </div>

        {/* Form Reset Password */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password Baru <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#00247D] dark:text-blue-400 hover:underline cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Acak Password Aman</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Minimal 8 karakter..."
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border ${
                  error
                    ? "border-rose-400 dark:border-rose-600"
                    : "border-slate-200 dark:border-slate-700"
                } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00247D] font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Tombol Salin Kredensial untuk WhatsApp */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              }`}
            >
              {copied ? (
                <>
                  <Check size={15} />
                  <span>Kredensial Disalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Salin Format Kredensial untuk WhatsApp</span>
                </>
              )}
            </button>
          </div>

          {/* Peringatan Keamanan */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5 text-[11.5px] text-amber-800 dark:text-amber-300">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Peringatan Keamanan:</strong> Reset password akan segera
              menggugurkan seluruh sesi aktif akun ini demi menjaga integritas sistem.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mereset...</span>
                </>
              ) : (
                <span>Simpan Password Baru</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
