import { TSUNAMI_POTENTIAL_TEXTS } from "../config/alertRules.js";
import type {
  BmkgEarthquakeItem,
  FeltArea,
  TsunamiPotential,
} from "../types/earthquake.types.js";

const loggedWarnings = new Set<string>();

/** Mencatat peringatan sekali per pesan agar polling berkala tidak membanjiri log. */
const warnOnce = (message: string) => {
  if (loggedWarnings.has(message)) return;
  loggedWarnings.add(message);
  console.warn(message);
};

/** Waktu kejadian BMKG dalam ISO UTC, atau null bila tidak dapat dibaca. */
export const parseBmkgDateTime = (raw: string | undefined): string | null => {
  if (!raw) return null;

  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const withOffset = /([+-]\d{2}:\d{2}|Z)$/i.test(normalized) ? normalized : `${normalized}Z`;
  const date = new Date(withOffset);

  if (Number.isNaN(date.getTime())) {
    warnOnce(`[BMKG] DateTime gempa tidak dapat dibaca, item dilewati: "${raw}"`);
    return null;
  }
  return date.toISOString();
};

/** Klasifikasi teks `Potensi`; teks yang belum terverifikasi dicatat dan tidak ditebak. */
export const classifyTsunamiPotential = (
  text: string | undefined
): TsunamiPotential | null => {
  const normalized = text?.trim().replace(/\s+/g, " ").toLowerCase();
  if (!normalized) return null;

  const known = TSUNAMI_POTENTIAL_TEXTS[normalized];
  if (known) return known;

  warnOnce(`[BMKG] Nilai Potensi belum dikenali: "${text}"`);
  return "TIDAK_DIKENAL";
};

const FELT_ENTRY_PATTERN = /^([IVX]+(?:\s*-\s*[IVX]+)?)\s+(.+)$/;

/** Memecah teks `Dirasakan`, mis. "III Pangandaran, II - III Ciamis", menjadi wilayah dan skala MMI. */
export const parseFeltAreas = (felt: string | undefined): FeltArea[] =>
  (felt ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "" && entry !== "-")
    .map((entry) => {
      const match = entry.match(FELT_ENTRY_PATTERN);
      return match
        ? { area: match[2].trim(), mmi: match[1].replace(/\s+/g, "") }
        : { area: entry, mmi: null };
    });

type FeedItems = {
  auto?: BmkgEarthquakeItem | null;
  terkini?: BmkgEarthquakeItem[];
  dirasakan?: BmkgEarthquakeItem[];
};

/**
 * Menyatukan autogempa, gempaterkini, dan gempadirasakan per kejadian (DateTime sama).
 * Data inti diambil dari autogempa, lalu gempaterkini, lalu gempadirasakan.
 * `Dirasakan` dari autogempa atau gempadirasakan, `Potensi` dari gempaterkini atau
 * autogempa, dan `Shakemap` dari autogempa (ADR-046).
 */
export const mergeBmkgFeeds = ({ auto, terkini = [], dirasakan = [] }: FeedItems): BmkgEarthquakeItem[] => {
  type Sources = { auto?: BmkgEarthquakeItem; terkini?: BmkgEarthquakeItem; dirasakan?: BmkgEarthquakeItem };
  const events = new Map<string, Sources>();

  const add = (key: keyof Sources, item: BmkgEarthquakeItem) => {
    const eventId = parseBmkgDateTime(item.DateTime);
    if (!eventId) return;
    const sources = events.get(eventId) ?? {};
    sources[key] ??= item;
    events.set(eventId, sources);
  };

  if (auto) add("auto", auto);
  terkini.forEach((item) => add("terkini", item));
  dirasakan.forEach((item) => add("dirasakan", item));

  return [...events.values()].map((sources) => {
    const base = (sources.auto ?? sources.terkini ?? sources.dirasakan) as BmkgEarthquakeItem;
    return {
      ...base,
      Dirasakan: sources.auto?.Dirasakan || sources.dirasakan?.Dirasakan || "",
      Potensi: sources.terkini?.Potensi || sources.auto?.Potensi || "",
      Shakemap: sources.auto?.Shakemap || "",
    };
  });
};
