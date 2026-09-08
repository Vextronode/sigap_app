import React from "react";

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
  let dotStyle: string;

  switch (normalized) {
    case "RED":
    case "AWAS":
    case "CRITICAL":
      label = "Awas";
      badgeStyle = "bg-rose-100 text-rose-800";
      dotStyle = "bg-rose-500";
      break;

    case "ORANGE":
    case "SIAGA":
      label = "Siaga";
      badgeStyle = "bg-orange-100 text-orange-800";
      dotStyle = "bg-orange-500";
      break;

    case "YELLOW":
    case "WASPADA":
      label = "Waspada";
      badgeStyle = "bg-amber-100 text-amber-800";
      dotStyle = "bg-amber-500";
      break;

    case "GREEN":
    case "AMAN":
    default:
      label = "Aman";
      badgeStyle = "bg-emerald-100 text-emerald-800";
      dotStyle = "bg-emerald-500";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none ${badgeStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      <span>{label}</span>
    </span>
  );
};
