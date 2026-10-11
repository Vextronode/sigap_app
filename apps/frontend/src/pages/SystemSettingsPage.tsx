import { Settings } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function SystemSettingsPage() {
  useDocumentTitle("Pengaturan Sistem - SIGAP Desa Cibenda");

  return (
    <div className="w-full space-y-6 pb-14 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Pengaturan Sistem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi umum, parameter ambang batas peringatan, dan integrasi API sistem SIGAP.
        </p>
      </div>

      {/* Card Placeholder Kosong / Coming Soon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xs text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm mb-5">
          <Settings size={36} className="animate-spin-slow" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-3">
          Tahap Pengembangan Sistem
        </span>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white max-w-md">
          Halaman Pengaturan Sistem Belum Dikonfigurasi
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
          Modul pengaturan konfigurasi sistem dasar saat ini masih dalam perancangan. Manajemen operasional kesiapsiagaan (Kontak Darurat, Titik Lokasi, dan Panduan) kini dapat diakses secara langsung melalui menu navigasi samping.
        </p>
      </div>
    </div>
  );
}
