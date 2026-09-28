import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import type { UserRecord, CreateUserPayload, UpdateUserPayload } from "../../../types/userManagement";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (payload: CreateUserPayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateUserPayload) => Promise<void>;
  editingUser: UserRecord | null;
  currentUserId?: string;
  isSubmitting: boolean;
}

interface UserFormContentProps {
  onClose: () => void;
  onSubmitCreate: (payload: CreateUserPayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateUserPayload) => Promise<void>;
  editingUser: UserRecord | null;
  currentUserId?: string;
  isSubmitting: boolean;
}

const UserFormContent: React.FC<UserFormContentProps> = ({
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  editingUser,
  currentUserId,
  isSubmitting,
}) => {
  const isEditMode = Boolean(editingUser);
  const isSelf = Boolean(editingUser && currentUserId && editingUser.id === currentUserId);

  const [name, setName] = useState(editingUser?.name ?? "");
  const [email, setEmail] = useState(editingUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "operator">(
    (editingUser?.role as "admin" | "operator") || "operator"
  );
  const [isActive, setIsActive] = useState(editingUser?.isActive ?? true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fungsi utilitas untuk mengacak password yang aman & mudah dibaca
  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Nama lengkap wajib diisi minimal 2 karakter.";
    }

    if (!isEditMode) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        newErrors.email = "Format alamat email tidak valid.";
      }

      if (!password || password.length < 8) {
        newErrors.password = "Password wajib diisi minimal 8 karakter.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEditMode && editingUser) {
        await onSubmitUpdate(editingUser.id, {
          name: name.trim(),
          role,
          isActive: isSelf ? true : isActive,
        });
      } else {
        await onSubmitCreate({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        });
      }
      onClose();
    } catch (err) {
      console.error("[UserFormModal] Submit error:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 text-left">
      {/* Modal Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            {isEditMode ? "Perbarui Data Petugas" : "Tambah Petugas Baru"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEditMode
              ? "Sesuaikan peran, nama profil, dan status aktif akun."
              : "Daftarkan akun administrator atau petugas lapangan baru."}
          </p>
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

      {/* Modal Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User size={16} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border ${
                errors.name
                  ? "border-rose-400 dark:border-rose-600 focus:ring-rose-400"
                  : "border-slate-200 dark:border-slate-700 focus:ring-[#00247D]"
              } text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.name && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Alamat Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              disabled={isEditMode}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="petugas@cibenda.desa.id"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm ${
                isEditMode
                  ? "bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              } border ${
                errors.email
                  ? "border-rose-400 dark:border-rose-600"
                  : "border-slate-200 dark:border-slate-700"
              } focus:outline-none focus:ring-2 focus:ring-[#00247D]`}
            />
          </div>
          {isEditMode && (
            <p className="text-[11px] text-slate-400 mt-1">
              Alamat email digunakan sebagai ID unik akun dan tidak dapat diubah.
            </p>
          )}
          {errors.email && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password (Hanya pada mode tambah pengguna) */}
        {!isEditMode && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password Awal <span className="text-rose-500">*</span>
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
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border ${
                  errors.password
                    ? "border-rose-400 dark:border-rose-600"
                    : "border-slate-200 dark:border-slate-700"
                } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00247D]`}
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
            {errors.password && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>
            )}
          </div>
        )}

        {/* Pilihan Peran Akun */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Peran Hak Akses (Role) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Petugas Lapangan (Biru) */}
            <button
              type="button"
              disabled={isSelf}
              onClick={() => setRole("operator")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                role === "operator"
                  ? "border-[#00247D] dark:border-blue-500 ring-2 ring-[#00247D]/20 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              } ${isSelf ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2">
                <UserCheck
                  size={18}
                  className={
                    role === "operator"
                      ? "text-[#00247D] dark:text-blue-400"
                      : "text-slate-400"
                  }
                />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Petugas Lapangan
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Akses operasional: verifikasi alert bencana, cuaca & status IoT.
              </p>
            </button>

            {/* Administrator (Merah) */}
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                role === "admin"
                  ? "border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={18}
                  className={
                    role === "admin"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-400"
                  }
                />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Administrator
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Akses penuh: kelola akun, manajemen data desa & konfigurasi sistem.
              </p>
            </button>
          </div>
          {isSelf && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
              <AlertTriangle size={13} />
              Anda tidak dapat menurunkan peran akun Administrator Anda sendiri.
            </p>
          )}
        </div>

        {/* Status Aktif (Mode Edit) */}
        {isEditMode && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                  Status Akun Aktif
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Akun nonaktif tidak akan dapat login ke sistem SIGAP.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  disabled={isSelf}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    isActive ? "peer-checked:bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </label>
            </div>
            {isSelf && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                <AlertTriangle size={13} />
                Akun yang sedang Anda gunakan saat ini tidak dapat dinonaktifkan.
              </p>
            )}
          </div>
        )}

        {/* Actions Button */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00247D] hover:bg-[#001d66] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{isEditMode ? "Simpan Perubahan" : "Tambah Petugas"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  editingUser,
  currentUserId,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <UserFormContent
        key={editingUser ? editingUser.id : "create-user"}
        onClose={onClose}
        onSubmitCreate={onSubmitCreate}
        onSubmitUpdate={onSubmitUpdate}
        editingUser={editingUser}
        currentUserId={currentUserId}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
