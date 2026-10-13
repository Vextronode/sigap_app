import React from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import type { PreparednessGuideRecord } from "../../types/preparedness.types";

interface PreparednessGuideDeleteModalProps {
  guide: PreparednessGuideRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const PreparednessGuideDeleteModal: React.FC<
  PreparednessGuideDeleteModalProps
> = ({ guide, isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen || !guide) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Batal dan tutup"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Hapus Panduan Kesiapsiagaan?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Anda akan menghapus panduan{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              "{guide.title}"
            </span>
            . Berkas gambar sampul dan seluruh data panduan ini akan dihapus secara
            permanen dari basis data untuk membebaskan ruang penyimpanan.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-lg shadow-rose-600/20 transition disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Ya, Hapus Panduan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
