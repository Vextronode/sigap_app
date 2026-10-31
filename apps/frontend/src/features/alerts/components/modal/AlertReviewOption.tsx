import React from "react";
import { Check, type LucideIcon } from "lucide-react";

export interface AlertReviewOptionData {
  id: "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti";
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}

interface AlertReviewOptionProps {
  option: AlertReviewOptionData;
  isSelected: boolean;
  onSelect: (id: "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti") => void;
}

export const AlertReviewOption: React.FC<AlertReviewOptionProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
        isSelected
          ? `${option.tone} shadow-2xs`
          : "border-[color:var(--border)] hover:border-slate-400 bg-[color:var(--surface)]"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
          isSelected
            ? "border-[#00247D] bg-[#00247D] text-white"
            : "border-[color:var(--border)] text-transparent"
        }`}
      >
        {isSelected && <Check size={12} strokeWidth={3} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon size={15} className="shrink-0" />
          <span className="text-sm font-semibold text-[color:var(--text)]">
            {option.title}
          </span>
        </div>
        <p className="text-xs text-[color:var(--text-muted)] mt-1 leading-normal">
          {option.description}
        </p>
      </div>
    </button>
  );
};
