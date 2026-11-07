import type { AlertLevel, CurrentAlert } from "../types/dashboard";

type AlertMeta = {
  label: string;
  tone: "safe" | "warning" | "orange" | "danger" | "neutral";
  description: string;
};

export const alertMeta: Record<AlertLevel, AlertMeta> = {
  GREEN: {
    label: "Aman",
    tone: "safe",
    description: "Tidak ada ancaman bencana aktif saat ini.",
  },
  YELLOW: {
    label: "Waspada",
    tone: "warning",
    description: "Tetap pantau informasi resmi dan siapkan langkah aman.",
  },
  ORANGE: {
    label: "Siaga",
    tone: "orange",
    description: "Siapkan dokumen penting dan ikuti arahan pemerintah desa.",
  },
  RED: {
    label: "Awas",
    tone: "danger",
    description: "Ikuti instruksi resmi dan segera menuju titik evakuasi.",
  },
  UNKNOWN: {
    label: "Data Tidak Tersedia",
    tone: "neutral",
    description: "Data peringatan sedang tidak tersedia. Pantau informasi resmi BMKG.",
  },
};

export const normalizeAlertLevel = (level?: string): AlertLevel => {
  const normalized = level?.toUpperCase();
  if (
    normalized === "GREEN" ||
    normalized === "YELLOW" ||
    normalized === "ORANGE" ||
    normalized === "RED"
  ) {
    return normalized;
  }
  return "UNKNOWN";
};

export const getAlertMeta = (alert?: CurrentAlert | null) => {
  const level = normalizeAlertLevel(alert?.level);
  return alertMeta[level];
};
