import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

export interface ActionFeedbackModalProps {
  isOpen: boolean;
  type: "success" | "error" | "info";
  title?: string;
  message: string;
  onClose: () => void;
  autoCloseMs?: number;
}

export const ActionFeedbackModal: React.FC<ActionFeedbackModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  autoCloseMs = 4000,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Auto close khusus sukses atau ketika autoCloseMs disetel
    if (autoCloseMs && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  const defaultTitle = isSuccess
    ? "Aksi Berhasil"
    : isError
    ? "Terjadi Kesalahan"
    : "Informasi Sistem";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-12 px-4 pointer-events-none"
    >
      {/* Kartu Floating Pop-up Notifikasi */}
      <div
        className={`pointer-events-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
          isSuccess
            ? "border-emerald-300 dark:border-emerald-700/60 ring-2 ring-emerald-500/20 shadow-emerald-500/10"
            : isError
            ? "border-rose-300 dark:border-rose-700/60 ring-2 ring-rose-500/20 shadow-rose-500/10"
            : "border-blue-300 dark:border-blue-700/60 ring-2 ring-blue-500/20 shadow-blue-500/10"
        }`}
      >
        {/* Ikon Status */}
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isSuccess
              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400"
              : isError
              ? "bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400"
              : "bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400"
          }`}
        >
          {isSuccess && <CheckCircle2 size={22} />}
          {isError && <AlertTriangle size={22} />}
          {!isSuccess && !isError && <CheckCircle2 size={22} />}
        </div>

        {/* Konten Teks */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {title || defaultTitle}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words font-medium">
            {message}
          </p>
        </div>

        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
