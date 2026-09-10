import React from "react";
import { AlertTriangle, Trash2, X, Loader2, ShieldCheck } from "lucide-react";
import type { EmergencyContactRecord } from "../../../../types/emergencyContact";

interface EmergencyContactDeleteModalProps {
  isOpen: boolean;
  contact: EmergencyContactRecord | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const EmergencyContactDeleteModal: React.FC<EmergencyContactDeleteModalProps> = ({
  isOpen,
  contact,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !contact) return null;

  const isCore = contact.isCore;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer transition-colors"
          aria-label="Tutup konfirmasi"
        >
          <X size={18} />
        </button>

        {isCore ? (
          // Proteksi Kontak Inti (Security Notice)
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 flex items-center justify-center">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h3
                id="delete-modal-title"
                className="font-bold text-slate-900 dark:text-white text-base sm:text-lg"
              >
                Kontak Inti Dilindungi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Kontak <strong>{contact.institution}</strong> merupakan bagian dari kontak darurat inti Desa Cibenda. Sesuai spesifikasi sistem <strong>FS-03</strong>, kontak inti tidak dapat dihapus.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        ) : (
          // Konfirmasi Hapus Kontak Tambahan
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3
                id="delete-modal-title"
                className="font-bold text-slate-900 dark:text-white text-base sm:text-lg"
              >
                Hapus Kontak Darurat?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Apakah Anda yakin ingin menghapus kontak <strong>{contact.institution}</strong> (
                <span className="font-mono">{contact.phoneNumber}</span>)?
              </p>
              <div className="mt-3 p-3 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                Tindakan ini permanen. Kontak ini akan langsung dihilangkan dari sistem informasi publik warga.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>{isDeleting ? "Menghapus..." : "Ya, Hapus Kontak"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
