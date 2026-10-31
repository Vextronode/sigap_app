import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Info,
} from "lucide-react";
import type { AlertItem } from "../../../../types/alert";
import { AlertReviewSummary } from "./AlertReviewSummary";
import {
  AlertReviewOption,
  type AlertReviewOptionData,
} from "./AlertReviewOption";

interface AlertReviewModalProps {
  isOpen: boolean;
  alert: AlertItem | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    status: "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti"
  ) => Promise<void>;
  isSubmitting?: boolean;
}

type ReviewStatus = "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti";

const REVIEW_OPTIONS: AlertReviewOptionData[] = [
  {
    id: "Dikonfirmasi",
    title: "Konfirmasi Alert",
    description:
      "Validasi alert ini sebagai data resmi terkonfirmasi untuk arsip kebencanaan desa.",
    icon: ShieldCheck,
    tone: "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100",
  },
  {
    id: "Ditolak",
    title: "Tolak / False Alarm",
    description:
      "Tandai sebagai anomali data atau laporan palsu. Tidak memblokir tampilan realtime warga.",
    icon: ShieldAlert,
    tone: "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100",
  },
  {
    id: "Ditindaklanjuti",
    title: "Ditindaklanjuti (Eskalasi)",
    description:
      "Teruskan ke tim lapangan atau instansi BPBD untuk verifikasi visual dan penanganan fisik.",
    icon: AlertTriangle,
    tone: "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100",
  },
];

const getInitialReviewStatus = (
  reviewStatus?: string | null
): ReviewStatus => {
  if (
    reviewStatus === "Dikonfirmasi" ||
    reviewStatus === "Ditolak" ||
    reviewStatus === "Ditindaklanjuti"
  ) {
    return reviewStatus;
  }

  return "Dikonfirmasi";
};

export const AlertReviewModal: React.FC<AlertReviewModalProps> = ({
  isOpen,
  alert,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedStatus, setSelectedStatus] =
    useState<ReviewStatus>(() =>
      getInitialReviewStatus(alert?.reviewStatus)
    );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !alert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setErrorMsg(null);
      await onSubmit(alert.id, selectedStatus);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan klasifikasi alert."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[color:var(--border)] flex items-center justify-between bg-[color:var(--surface-muted)]">
          <div>
            <h2
              id="review-modal-title"
              className="text-base font-bold text-[color:var(--text)]"
            >
              Detail Verifikasi Alert
            </h2>
            <p className="text-xs font-mono text-[color:var(--text-muted)] mt-0.5">
              ID: #{alert.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[color:var(--text-muted)] hover:text-[color:var(--text)] rounded-lg hover:bg-[color:var(--surface)] transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 p-6 space-y-5 bg-[color:var(--surface)]"
        >
          <AlertReviewSummary alert={alert} />

          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
              Tindakan Klasifikasi Admin / Operator
            </label>

            <div className="space-y-2">
              {REVIEW_OPTIONS.map((option) => (
                <AlertReviewOption
                  key={option.id}
                  option={option}
                  isSelected={selectedStatus === option.id}
                  onSelect={setSelectedStatus}
                />
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[color:var(--surface-muted)] border border-[color:var(--border)] flex items-start gap-2.5 text-xs text-[color:var(--text-muted)]">
            <Info
              size={16}
              className="text-[color:var(--text-muted)] shrink-0 mt-0.5"
            />
            <p>
              <strong className="text-[color:var(--text)]">Catatan Teknis:</strong> Klasifikasi ini murni
              administratif untuk pencatatan dan arsip desa.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="pt-3 border-t border-[color:var(--border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[color:var(--border)] text-xs font-semibold text-[color:var(--text)] hover:bg-[color:var(--surface-muted)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#00247D] hover:bg-[#001c60] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Eksekusi Keputusan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};