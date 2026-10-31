import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ModalFormErrorBannerProps {
  error: string | null;
  onDismiss?: () => void;
}

export const ModalFormErrorBanner: React.FC<ModalFormErrorBannerProps> = ({
  error,
  onDismiss,
}) => {
  if (!error) return null;

  const hasBullets = error.includes("\n• ");

  return (
    <div
      className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-2xs animate-in fade-in duration-200"
      role="alert"
    >
      <AlertTriangle
        size={18}
        className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
      />
      <div className="flex-1 space-y-1 text-left">
        <p className="font-bold text-amber-950 dark:text-amber-100">
          Perhatian Ketentuan Input:
        </p>
        {hasBullets ? (
          <div className="space-y-1 text-amber-900/90 dark:text-amber-200/90 font-medium">
            <p>• {error}</p>
          </div>
        ) : (
          <p className="leading-relaxed text-amber-900/90 dark:text-amber-200/90 font-medium whitespace-pre-line">
            {error}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 p-1 cursor-pointer transition-colors"
          aria-label="Tutup pesan"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};
