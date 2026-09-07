import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface AlertFeedback {
  type: "success" | "error";
  message: string;
}

interface AlertFeedbackBannerProps {
  feedback: AlertFeedback | null;
  onDismiss: () => void;
}

export const AlertFeedbackBanner: React.FC<AlertFeedbackBannerProps> = ({
  feedback,
  onDismiss,
}) => {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";

  return (
    <div
      className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
        isSuccess
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-rose-50 border-rose-200 text-rose-800"
      }`}
      role="status"
    >
      <div className="flex items-center gap-2">
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        ) : (
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
        )}
        <span>{feedback.message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  );
};
