import React from "react";
import { Monitor, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { AlertStatsSummary } from "../../../../types/alert";
import { AlertStatCard } from "./AlertStatCard";

interface AlertStatCardsProps {
  stats?: AlertStatsSummary;
  isLoading?: boolean;
}

export const AlertStatCards: React.FC<AlertStatCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const cards = [
    {
      id: "pending",
      title: "Menunggu Verifikasi",
      value: stats?.pending ?? 0,
      icon: Monitor,
      iconBgClass: "bg-[#EEF4FF] dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-400",
    },
    {
      id: "confirmed",
      title: "Dikonfirmasi (24 Jam)",
      value: stats?.confirmed ?? 0,
      icon: CheckCircle2,
      iconBgClass: "bg-[#DCFCE7] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400",
      trendText: stats?.confirmed ? "↑12%" : undefined,
    },
    {
      id: "rejected",
      title: "Ditolak (False Alarm)",
      value: stats?.rejected ?? 0,
      icon: XCircle,
      iconBgClass: "bg-[#F1F5F9] dark:bg-slate-800 text-[#64748B] dark:text-slate-300",
    },
    {
      id: "escalated",
      title: "Ditindaklanjuti",
      value: stats?.escalated ?? 0,
      icon: AlertTriangle,
      iconBgClass: "bg-[#FEF9C3] dark:bg-amber-950/40 text-[#CA8A04] dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => (
        <AlertStatCard
          key={card.id}
          title={card.title}
          value={card.value}
          icon={card.icon}
          iconBgClass={card.iconBgClass}
          trendText={card.trendText}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
