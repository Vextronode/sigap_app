import React from "react";
import { Users, ShieldCheck, UserCheck, ShieldAlert } from "lucide-react";
import type { UserStatistics } from "../../../types/userManagement";

interface UserKPIStatsProps {
  stats?: UserStatistics;
  isLoading?: boolean;
}

export const UserKPIStats: React.FC<UserKPIStatsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: "Total Pengguna",
      value: stats?.totalUsers ?? 0,
      description: "Seluruh akun terdaftar",
      icon: Users,
      bgColor: "bg-slate-100 dark:bg-slate-800",
      textColor: "text-slate-700 dark:text-slate-300",
      borderColor: "border-slate-200 dark:border-slate-800",
    },
    {
      title: "Administrator",
      value: stats?.totalAdmins ?? 0,
      description: "Akses penuh sistem & kelola data",
      icon: ShieldCheck,
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      textColor: "text-rose-600 dark:text-rose-400",
      borderColor: "border-rose-100 dark:border-rose-900/40",
    },
    {
      title: "Petugas Lapangan",
      value: stats?.totalOperators ?? 0,
      description: "Validasi alert & monitoring sensor",
      icon: UserCheck,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      textColor: "text-[#00247D] dark:text-blue-400",
      borderColor: "border-blue-100 dark:border-blue-900/40",
    },
    {
      title: "Terkunci / Nonaktif",
      value: stats?.totalInactiveOrLocked ?? 0,
      description: "Memerlukan perhatian admin",
      icon: ShieldAlert,
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      textColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-100 dark:border-amber-900/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs transition-all hover:shadow-md ${card.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.textColor}`}>
                <Icon size={18} />
              </div>
            </div>

            <div className="mt-3">
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
              )}
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
