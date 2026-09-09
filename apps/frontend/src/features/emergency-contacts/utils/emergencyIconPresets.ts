import React from "react";
import {
  Ambulance,
  Flame,
  Shield,
  AlertTriangle,
  Hospital,
  Landmark,
  LifeBuoy,
  Award,
  PhoneCall,
  Radio,
  HeartHandshake,
  Droplets,
  Zap,
  Truck,
  Siren,
  HeartPulse,
} from "lucide-react";

export type EmergencyIconKey =
  | "ambulance"
  | "damkar"
  | "polisi"
  | "bpbd"
  | "sar"
  | "puskesmas"
  | "koramil"
  | "desa"
  | "phone"
  | "radio"
  | "relawan"
  | "pdam"
  | "pln"
  | "logistik"
  | "siren"
  | "medis";

export interface IconPreset {
  key: EmergencyIconKey;
  label: string;
  category: "Medis" | "Keamanan" | "Bencana" | "Layanan";
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  boxClass: string;
  badgeClass: string;
}

export const EMERGENCY_ICON_PRESETS: IconPreset[] = [
  {
    key: "ambulance",
    label: "Ambulans / Gawat Darurat",
    category: "Medis",
    Icon: Ambulance,
    boxClass: "bg-[#EF4444] text-white shadow-2xs",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200/50",
  },
  {
    key: "damkar",
    label: "Pemadam Kebakaran (Damkar)",
    category: "Keamanan",
    Icon: Flame,
    boxClass:
      "bg-[#FEE2E2] text-[#EF4444] dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50",
  },
  {
    key: "polisi",
    label: "Kepolisian (Polsek / Polres)",
    category: "Keamanan",
    Icon: Shield,
    boxClass:
      "bg-[#E0E7FF] text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50",
  },
  {
    key: "bpbd",
    label: "Peringatan Bencana (BPBD)",
    category: "Bencana",
    Icon: AlertTriangle,
    boxClass:
      "bg-[#FEF3C7] text-[#B45309] dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50",
  },
  {
    key: "sar",
    label: "SAR / Basarnas / Penyelamat",
    category: "Bencana",
    Icon: LifeBuoy,
    boxClass:
      "bg-[#FFEDD5] text-[#EA580C] dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/40",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/50",
  },
  {
    key: "puskesmas",
    label: "Puskesmas / Rumah Sakit",
    category: "Medis",
    Icon: Hospital,
    boxClass:
      "bg-[#CCFBF1] text-[#0D9488] dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/40",
    badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/50",
  },
  {
    key: "koramil",
    label: "TNI / Babinsa / Koramil",
    category: "Keamanan",
    Icon: Award,
    boxClass:
      "bg-[#D1FAE5] text-[#059669] dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50",
  },
  {
    key: "desa",
    label: "Pemerintah / Balai Desa",
    category: "Layanan",
    Icon: Landmark,
    boxClass:
      "bg-[#EEF2FF] text-[#4338CA] dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/40",
    badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50",
  },
  {
    key: "phone",
    label: "Hotline & Kontak Umum",
    category: "Layanan",
    Icon: PhoneCall,
    boxClass:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200",
  },
  {
    key: "relawan",
    label: "Relawan / Posko Warga / Tagana",
    category: "Layanan",
    Icon: HeartHandshake,
    boxClass:
      "bg-[#F3E8FF] text-[#7E22CE] dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/40",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50",
  },
  {
    key: "medis",
    label: "Pos Medis / P3K Lapangan",
    category: "Medis",
    Icon: HeartPulse,
    boxClass:
      "bg-[#FFE4E6] text-[#E11D48] dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50",
  },
  {
    key: "siren",
    label: "Sirine / Peringatan Dini",
    category: "Bencana",
    Icon: Siren,
    boxClass:
      "bg-[#FEE2E2] text-[#DC2626] dark:bg-red-950/60 dark:text-red-400 border border-red-200/50 dark:border-red-900/40",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200/50",
  },
  {
    key: "radio",
    label: "Radio Komunikasi (RAPI / Orari)",
    category: "Layanan",
    Icon: Radio,
    boxClass:
      "bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/40",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/50",
  },
  {
    key: "pdam",
    label: "Pasokan Air Bersih (PDAM)",
    category: "Layanan",
    Icon: Droplets,
    boxClass:
      "bg-[#CFFAFE] text-[#0891B2] dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-900/40",
    badgeClass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/50",
  },
  {
    key: "pln",
    label: "Kelistrikan Darurat (PLN)",
    category: "Layanan",
    Icon: Zap,
    boxClass:
      "bg-[#FEF9C3] text-[#CA8A04] dark:bg-yellow-950/60 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/40",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-200/50",
  },
  {
    key: "logistik",
    label: "Logistik & Transportasi Evakuasi",
    category: "Bencana",
    Icon: Truck,
    boxClass:
      "bg-[#F1F5F9] text-[#475569] dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700",
    badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200",
  },
];

const STORAGE_KEY = "sigap_custom_emergency_contact_icons";

// Deteksi otomatis icon dari nama institusi jika belum ditentukan secara kustom
export function detectDefaultIconKey(name: string): EmergencyIconKey {
  const lower = name.toLowerCase();

  if (lower.includes("ambulans") || lower.includes("psc") || lower.includes("119")) {
    return "ambulance";
  }
  if (lower.includes("bpbd") || lower.includes("bnpb") || lower.includes("bencana")) {
    return "bpbd";
  }
  if (lower.includes("damkar") || lower.includes("pemadam") || lower.includes("kebakaran")) {
    return "damkar";
  }
  if (
    lower.includes("polisi") ||
    lower.includes("polsek") ||
    lower.includes("polres") ||
    lower.includes("kepolisian")
  ) {
    return "polisi";
  }
  if (lower.includes("koramil") || lower.includes("tni") || lower.includes("babinsa")) {
    return "koramil";
  }
  if (lower.includes("puskesmas") || lower.includes("klinik") || lower.includes("rumah sakit")) {
    return "puskesmas";
  }
  if (lower.includes("sar") || lower.includes("basarnas") || lower.includes("penyelamat")) {
    return "sar";
  }
  if (
    lower.includes("desa") ||
    lower.includes("pemerintah") ||
    lower.includes("balai") ||
    lower.includes("pemdes")
  ) {
    return "desa";
  }
  if (lower.includes("relawan") || lower.includes("tagana") || lower.includes("posko")) {
    return "relawan";
  }
  if (lower.includes("rapi") || lower.includes("orari") || lower.includes("radio")) {
    return "radio";
  }
  if (lower.includes("air") || lower.includes("pdam")) {
    return "pdam";
  }
  if (lower.includes("pln") || lower.includes("listrik")) {
    return "pln";
  }
  if (lower.includes("sirine") || lower.includes("alarm") || lower.includes("siren")) {
    return "siren";
  }
  if (lower.includes("logistik") || lower.includes("truk") || lower.includes("kendaraan")) {
    return "logistik";
  }
  if (lower.includes("medis") || lower.includes("p3k") || lower.includes("palang merah") || lower.includes("pmi")) {
    return "medis";
  }

  return "phone";
}

// Dapatkan preset berdasarkan key
export function getIconPreset(key: string): IconPreset {
  const found = EMERGENCY_ICON_PRESETS.find((p) => p.key === key);
  return found || EMERGENCY_ICON_PRESETS[8]; // default to "phone"
}

// Baca mapping icon dari localStorage
export function getSavedIconMap(): Record<string, EmergencyIconKey> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Simpan icon pilihan untuk kontak tertentu (berdasarkan ID atau nama)
export function saveContactIcon(id: string, iconKey: EmergencyIconKey, institutionName?: string): void {
  if (typeof window === "undefined") return;
  try {
    const map = getSavedIconMap();
    map[id] = iconKey;
    if (institutionName) {
      map[`name_${institutionName.trim().toLowerCase()}`] = iconKey;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // abaikan jika storage penuh / diblokir
  }
}

// Hapus data icon saat kontak dihapus
export function removeContactIcon(id: string, institutionName?: string): void {
  if (typeof window === "undefined") return;
  try {
    const map = getSavedIconMap();
    delete map[id];
    if (institutionName) {
      delete map[`name_${institutionName.trim().toLowerCase()}`];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // abaikan
  }
}

// Ambil icon visual aktif untuk kontak: Cek localStorage (by id atau name), jika belum ada gunakan deteksi otomatis
export function resolveContactIcon(id?: string, institutionName?: string, explicitKey?: string): IconPreset {
  if (explicitKey) {
    const preset = EMERGENCY_ICON_PRESETS.find((p) => p.key === explicitKey);
    if (preset) return preset;
  }

  const map = getSavedIconMap();

  if (id && map[id]) {
    const preset = EMERGENCY_ICON_PRESETS.find((p) => p.key === map[id]);
    if (preset) return preset;
  }

  if (institutionName) {
    const nameKey = `name_${institutionName.trim().toLowerCase()}`;
    if (map[nameKey]) {
      const preset = EMERGENCY_ICON_PRESETS.find((p) => p.key === map[nameKey]);
      if (preset) return preset;
    }
    const detectedKey = detectDefaultIconKey(institutionName);
    return getIconPreset(detectedKey);
  }

  return getIconPreset("phone");
}
