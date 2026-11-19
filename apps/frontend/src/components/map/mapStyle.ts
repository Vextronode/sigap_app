import { namedFlavor, type Flavor } from "@protomaps/basemaps";

/**
 * Gaya peta dasar SIGAP: turunan gaya Protomaps `light`/`dark` dengan warna yang lebih
 * kontras dan selaras palet SIGAP (air biru, vegetasi hijau, pasir pantai, jalan utama
 * oranye/kuning), agar peta jalan mudah dibaca dan tetap menarik tanpa citra satelit.
 */
const LIGHT_OVERRIDES: Partial<Flavor> = {
  background: "#eef1f4",
  earth: "#f4f1ea",
  water: "#9fd0f5",
  ocean_label: "#2b6aa3",
  park_a: "#cfe9c4",
  park_b: "#bfe0b2",
  wood_a: "#c3e2b5",
  wood_b: "#b4d9a5",
  scrub_a: "#d8ecc9",
  scrub_b: "#cde6bc",
  beach: "#f6e7b8",
  sand: "#f3e3b5",
  hospital: "#fde2e2",
  school: "#fdf1cf",
  buildings: "#ddd5c8",
  highway: "#f9a03f",
  highway_casing_early: "#d97706",
  highway_casing_late: "#d97706",
  major: "#ffd46b",
  major_casing_early: "#e0a92b",
  major_casing_late: "#e0a92b",
  link: "#ffd46b",
  minor_a: "#ffffff",
  minor_b: "#ffffff",
  minor_casing: "#cbc3b6",
  minor_service: "#ffffff",
  minor_service_casing: "#d6cfc3",
  boundaries: "#8a7aa8",
  city_label: "#1f2937",
  subplace_label: "#374151",
  roads_label_major: "#3f3f46",
  roads_label_minor: "#52525b",
};

const DARK_OVERRIDES: Partial<Flavor> = {
  background: "#101418",
  earth: "#171c22",
  water: "#12395f",
  ocean_label: "#7fb4e6",
  park_a: "#1c3324",
  park_b: "#1f3a28",
  wood_a: "#1b3122",
  wood_b: "#1d3525",
  beach: "#3a3424",
  sand: "#3a3424",
  buildings: "#2c3642",
  highway: "#c2410c",
  highway_casing_early: "#7c2d12",
  highway_casing_late: "#7c2d12",
  major: "#a16207",
  major_casing_early: "#713f12",
  major_casing_late: "#713f12",
  link: "#a16207",
  minor_a: "#3b4654",
  minor_b: "#3b4654",
  minor_service: "#323c48",
};

export const sigapFlavor = (theme: "light" | "dark"): Flavor => ({
  ...namedFlavor(theme),
  ...(theme === "dark" ? DARK_OVERRIDES : LIGHT_OVERRIDES),
});
