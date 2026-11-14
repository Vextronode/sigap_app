/**
 * SIGAP Design System Color Tokens
 * Single Source of Truth untuk warna tema SIGAP.
 *
 * Digunakan untuk:
 * 1. Komponen React / TSX yang membutuhkan string warna hex murni (Leaflet Map, Canvas, Dynamic Inline Style)
 * 2. Selaras dengan deklarasi `@theme` di `index.css` dan variable CSS di `variables.css`
 */

export const SIGAP_THEME = {
  primary: "#00247D",
  primaryHover: "#001D66",
  primaryLight: "#EEF4FF",

  // Status Kebencanaan & Sistem
  status: {
    safe: "#10B981",
    safeBg: "#D1FAE5",
    warning: "#FFC642",
    warningBg: "#FEF3C7",
    orange: "#F97316",
    orangeBg: "#FFEDD5",
    danger: "#DC2626",
    dangerBg: "#FEE2E2",
  },

  // Tema Gelap (Dark Mode)
  dark: {
    background: "#101418",
    surface: "#171C22",
    border: "#2C3642",
  },

  // Tema Terang (Light Mode Surfaces)
  light: {
    background: "#F6F7F9",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F5F9",
    text: "#20242A",
    textMuted: "#606875",
    border: "#DDE3EA",
  },
} as const;

export type SigapTheme = typeof SIGAP_THEME;

