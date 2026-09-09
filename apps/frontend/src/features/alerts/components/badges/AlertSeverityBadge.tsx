import React from "react";
import { Check, AlertOctagon, ShieldAlert, AlertTriangle } from "lucide-react";

interface AlertSeverityBadgeProps {
  level: string;
  className?: string;
}

export const AlertSeverityBadge: React.FC<AlertSeverityBadgeProps> = ({
  level,
  className = "",
}) => {
  const normalized = (level || "").toUpperCase();

  let label: string;
  let badgeStyle: string;
  let icon: React.ReactNode;

  switch (normalized) {
    case "RED":
    case "AWAS":
    case "CRITICAL":
      label = "AWAS";
      badgeStyle = "bg-rose-600 text-white shadow-xs";
      icon = <AlertTriangle size={12} strokeWidth={2.5} className="shrink-0 text-white" />;
      break;

    case "ORANGE":
    case "SIAGA":
      label = "SIAGA";
      badgeStyle = "bg-orange-500 text-white shadow-xs";
      icon = <ShieldAlert size={12} strokeWidth={2.5} className="shrink-0 text-white" />;
      break;

    case "YELLOW":
    case "WASPADA":
      label = "WASPADA";
      badgeStyle = "bg-amber-500 text-white shadow-xs";
      icon = <AlertOctagon size={12} strokeWidth={2.5} className="shrink-0 text-white" />;
      break;

    case "GREEN":
    case "AMAN":
    default:
      label = "AMAN";
      badgeStyle = "bg-emerald-600 text-white shadow-xs";
      icon = <Check size={12} strokeWidth={3} className="shrink-0 text-white" />;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide select-none ${badgeStyle} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
