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
      title: "Menunggu Validasi",
      value: stats?.pending ?? 0,
      icon: Monitor,
      iconBgClass: "bg-[#EEF4FF] text-[#1E40AF]",
    },
    {
      id: "confirmed",
      title: "Dikonfirmasi (24 Jam)",
      value: stats?.confirmed ?? 0,
      icon: CheckCircle2,
      iconBgClass: "bg-[#DCFCE7] text-[#16A34A]",
      trendText: stats?.confirmed ? "↑12%" : undefined,
    },
    {
      id: "rejected",
      title: "Ditolak (False Alarm)",
      value: stats?.rejected ?? 0,
      icon: XCircle,
      iconBgClass: "bg-[#F1F5F9] text-[#64748B]",
    },
    {
      id: "escalated",
      title: "Ditindaklanjuti",
      value: stats?.escalated ?? 0,
      icon: AlertTriangle,
      iconBgClass: "bg-[#FEF9C3] text-[#CA8A04]",
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
