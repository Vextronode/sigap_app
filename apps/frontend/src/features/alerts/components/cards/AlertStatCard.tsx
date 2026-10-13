import React from "react";
import type { LucideIcon } from "lucide-react";

export interface AlertStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBgClass: string;
  trendText?: string;
  isLoading?: boolean;
}

export const AlertStatCard: React.FC<AlertStatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgClass,
  trendText,
  isLoading = false,
}) => {
  return (
    <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-xs sm:text-sm font-medium text-[color:var(--text-muted)]">
          {title}
        </span>
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-3 sm:mt-4 flex items-baseline">
        {isLoading ? (
          <div className="h-9 w-16 bg-[color:var(--surface-muted)] rounded-md animate-pulse" />
        ) : (
          <>
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--text)]">
              {value}
            </span>
            {trendText && (
              <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {trendText}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
