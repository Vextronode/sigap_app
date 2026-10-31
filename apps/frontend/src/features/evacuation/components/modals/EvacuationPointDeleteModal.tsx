import React from "react";
import { AlertTriangle, ShieldCheck, Loader2, X } from "lucide-react";
import type { EvacuationPoint } from "../../../../types/dashboard";

interface EvacuationPointDeleteModalProps {
  isOpen: boolean;
  point: EvacuationPoint | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const EvacuationPointDeleteModal: React.FC<EvacuationPointDeleteModalProps> = ({
  isOpen,
  point,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !point) return null;

  const isCore = !!point.isCore;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {isCore ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck size={26} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
              Titik Evakuasi Utama Dilindungi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Titik <strong className="text-slate-900 dark:text-white">"{point.name}"</strong> merupakan shelter evakuasi utama/inti Desa Cibenda. Titik ini tidak dapat dihapus dari sistem demi menjamin kesiapsiagaan warga saat darurat.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
              Hapus Titik Evakuasi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus titik evakuasi <strong className="text-slate-900 dark:text-white">"{point.name}"</strong>? Titik ini tidak akan lagi muncul di peta evakuasi publik warga.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                Hapus Titik
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
