import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import type { EmergencyContactFeedback } from "../../../types/emergencyContact";

interface EmergencyContactFeedbackBannerProps {
  feedback: EmergencyContactFeedback | null;
  onDismiss: () => void;
}

export const EmergencyContactFeedbackBanner: React.FC<EmergencyContactFeedbackBannerProps> = ({
  feedback,
  onDismiss,
}) => {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border flex items-start justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
        isSuccess
          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300"
          : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300"
      }`}
      role="status"
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
        )}
        <span className="font-medium">{feedback.message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  );
};
