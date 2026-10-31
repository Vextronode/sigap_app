import { LuSiren } from "react-icons/lu";
import { Radio } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function SirenIotControlPage() {
  useDocumentTitle("Kontrol Sirine & IoT - SIGAP Desa Cibenda");

  return (
    <div className="w-full space-y-6 pb-14 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Kontrol Sirine & IoT
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pusat kendali perangkat keras sirine peringatan dini dan sensor telemetri kebencanaan.
        </p>
      </div>

      {/* Card Placeholder Kosong / Coming Soon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xs text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm mb-5">
          <LuSiren size={36} className="animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/70 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50 mb-3">
          <Radio size={12} className="animate-pulse" />
          Integrasi Perangkat Keras Sedang Berjalan
        </span>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white max-w-md">
          Modul Kontrol Sirine & IoT Belum Tersedia
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
          Sistem sedang menunggu penyelarasan protokol komunikasi MQTT dan pengujian fisik aktuator sirine peringatan dini di titik-titik rawan Desa Cibenda.
        </p>
      </div>
    </div>
  );
}
