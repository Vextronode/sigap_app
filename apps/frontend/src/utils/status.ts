import type { AlertLevel, CurrentAlert } from "../types/dashboard";

type AlertMeta = {
  label: string;
  tone: "safe" | "warning" | "orange" | "danger";
  description: string;
};

export const alertMeta: Record<AlertLevel, AlertMeta> = {
  AMAN: {
    label: "Aman",
    tone: "safe",
    description: "Tidak ada ancaman bencana aktif saat ini.",
  },
  NORMAL: {
    label: "Normal",
    tone: "safe",
    description: "Sistem berjalan normal dan tidak ada peringatan aktif.",
  },
  WASPADA: {
    label: "Waspada",
    tone: "warning",
    description: "Tetap pantau informasi resmi dan siapkan langkah aman.",
  },
  SIAGA: {
    label: "Siaga",
    tone: "orange",
    description: "Siapkan dokumen penting dan ikuti arahan pemerintah desa.",
  },
  AWAS: {
    label: "Awas",
    tone: "danger",
    description: "Ikuti instruksi resmi dan segera menuju titik evakuasi.",
  },
};

export const normalizeAlertLevel = (level?: string): AlertLevel => {
  const normalized = level?.toUpperCase();
  if (
    normalized === "AMAN" ||
    normalized === "NORMAL" ||
    normalized === "WASPADA" ||
    normalized === "SIAGA" ||
    normalized === "AWAS"
  ) {
    return normalized;
  }
  return "NORMAL";
};

export const getAlertMeta = (alert?: CurrentAlert | null) => {
  const level = normalizeAlertLevel(alert?.level);
  return alertMeta[level];
};
