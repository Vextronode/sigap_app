import axios from "axios";
import { pingDatabase } from "../repositories/health.repository.js";
import { OPEN_METEO_BASE_URL, OPEN_METEO_COORDINATES } from "./openmeteo.service.js";
import { DEFAULT_ADM4_CODE } from "./weather.service.js";
import {
  getSchedulerStatus,
  isSchedulerHealthy,
  SCHEDULER_STALE_INTERVALS,
  type SchedulerState,
  type SchedulerStatus,
} from "../scheduler/schedulerStatus.js";

type ServiceStatus = "ONLINE" | "STANDBY" | "OFFLINE";

export interface ServiceHealthItem {
  name: string;
  category: "weather" | "earthquake" | "sid" | "push" | "database" | "scheduler";
  status: ServiceStatus;
  provider: string;
  /** null bila tidak diukur atau pengecekan gagal. */
  latencyMs: number | null;
  message: string;
  lastChecked: string;
}

export interface SystemHealthData {
  services: ServiceHealthItem[];
  scheduler: SchedulerStatus;
  overallStatus: "HEALTHY" | "DEGRADED";
  checkedAt: string;
}

interface NetworkChecks {
  weather: ServiceHealthItem;
  earthquake: ServiceHealthItem;
  database: ServiceHealthItem;
  checkedAt: string;
}

// SEC-10: pengecekan jaringan di-cache agar tidak membebani DB dan API eksternal.
// Status scheduler dihitung pada setiap request karena tidak memerlukan jaringan.
const HEALTH_CACHE_TTL_MS = 120 * 1000;
let networkCache: { data: NetworkChecks; cachedAt: number } | null = null;

/** Waktu tempuh request, atau null bila gagal. */
const probe = async (url: string, timeout: number): Promise<number | null> => {
  const start = Date.now();
  try {
    await axios.get(url, { timeout });
    return Date.now() - start;
  } catch {
    return null;
  }
};

const checkWeather = async (timestamp: string): Promise<ServiceHealthItem> => {
  const { latitude, longitude } = OPEN_METEO_COORDINATES;
  const [bmkg, openMeteo] = await Promise.all([
    probe(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${DEFAULT_ADM4_CODE}`, 3500),
    probe(`${OPEN_METEO_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`, 3000),
  ]);
  const reachable = [bmkg, openMeteo].filter((latency): latency is number => latency !== null);

  const status: ServiceStatus =
    reachable.length === 2 ? "ONLINE" : reachable.length === 1 ? "STANDBY" : "OFFLINE";
  const message =
    status === "ONLINE"
      ? "Prakiraan cuaca BMKG dan Open-Meteo terhubung."
      : status === "STANDBY"
        ? `Hanya ${bmkg !== null ? "BMKG" : "Open-Meteo"} yang terhubung; cuaca memakai sumber yang tersedia.`
        : "Prakiraan cuaca BMKG dan Open-Meteo tidak dapat dijangkau.";

  return {
    name: "Cuaca BMKG dan Open-Meteo",
    category: "weather",
    status,
    provider: "BMKG dan Open-Meteo",
    latencyMs: reachable.length > 0 ? Math.max(...reachable) : null,
    message,
    lastChecked: timestamp,
  };
};

const checkEarthquake = async (timestamp: string): Promise<ServiceHealthItem> => {
  const latency = await probe("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", 3500);
  return {
    name: "Data Gempa BMKG",
    category: "earthquake",
    status: latency !== null ? "ONLINE" : "OFFLINE",
    provider: "Badan Meteorologi, Klimatologi, dan Geofisika",
    latencyMs: latency,
    message:
      latency !== null
        ? "Feed gempa BMKG terhubung."
        : "Feed gempa BMKG tidak dapat diambil. Level memakai rekaman earthquake_records dan alert aktif.",
    lastChecked: timestamp,
  };
};

const checkDatabase = async (timestamp: string): Promise<ServiceHealthItem> => {
  const start = Date.now();
  // DEPLOY-01 (FR-A10): label generik, tidak membuka penyedia DB di endpoint publik.
  try {
    await pingDatabase();
    return {
      name: "PostgreSQL Database",
      category: "database",
      status: "ONLINE",
      provider: "PostgreSQL",
      latencyMs: Date.now() - start,
      message: "Koneksi database stabil.",
      lastChecked: timestamp,
    };
  } catch {
    return {
      name: "PostgreSQL Database",
      category: "database",
      status: "OFFLINE",
      provider: "PostgreSQL",
      latencyMs: null,
      message: "Terjadi gangguan koneksi ke basis data.",
      lastChecked: timestamp,
    };
  }
};

const runNetworkChecks = async (): Promise<NetworkChecks> => {
  const now = Date.now();
  if (networkCache && now - networkCache.cachedAt < HEALTH_CACHE_TTL_MS) {
    return networkCache.data;
  }

  const checkedAt = new Date().toISOString();
  const [weather, earthquake, database] = await Promise.all([
    checkWeather(checkedAt),
    checkEarthquake(checkedAt),
    checkDatabase(checkedAt),
  ]);
  const data = { weather, earthquake, database, checkedAt };
  networkCache = { data, cachedAt: now };
  return data;
};

const SCHEDULER_MESSAGES: Record<SchedulerState, string> = {
  AKTIF: "Siklus evaluasi alert berjalan normal.",
  MEMULAI: "Menunggu siklus evaluasi pertama selesai.",
  TERLAMBAT: `Tidak ada siklus sukses melewati ${SCHEDULER_STALE_INTERVALS} kali interval. Level dihitung langsung dari BMKG.`,
  GAGAL: "Siklus terakhir gagal menyimpan alert. Level dihitung langsung dari BMKG.",
  TIDAK_AKTIF:
    "Scheduler internal tidak aktif dan belum ada siklus dari pemicu eksternal. Level dihitung langsung dari BMKG.",
};

const schedulerItem = (scheduler: SchedulerStatus, healthy: boolean): ServiceHealthItem => ({
  name: "Scheduler Alert",
  category: "scheduler",
  status: healthy ? "ONLINE" : "OFFLINE",
  provider: "Evaluasi Alert BMKG",
  latencyMs: null,
  message: SCHEDULER_MESSAGES[scheduler.state],
  lastChecked: new Date().toISOString(),
});

export class SystemHealthService {
  /**
   * Status konektivitas sistem untuk dashboard admin. Status keseluruhan HEALTHY
   * bila database, data gempa BMKG, dan scheduler sehat (TK-04).
   */
  static async getHealth(): Promise<SystemHealthData> {
    const network = await runNetworkChecks();
    const scheduler = getSchedulerStatus();
    const schedulerHealthy = isSchedulerHealthy();
    const hasVapid = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

    const services: ServiceHealthItem[] = [
      network.weather,
      network.earthquake,
      {
        name: "Gateway Integrasi OpenSID",
        category: "sid",
        status: "STANDBY",
        provider: "SIGAP Notification Gateway",
        latencyMs: null,
        message: "Integrasi SID belum tersedia.",
        lastChecked: network.checkedAt,
      },
      {
        name: "Web Push Notification Service",
        category: "push",
        status: hasVapid ? "ONLINE" : "STANDBY",
        provider: "W3C VAPID (Google FCM & Apple APNs)",
        latencyMs: null,
        message: hasVapid
          ? "Kunci VAPID aktif, notifikasi darurat siap dikirimkan ke peramban warga."
          : "VAPID key belum diset lengkap.",
        lastChecked: network.checkedAt,
      },
      network.database,
      schedulerItem(scheduler, schedulerHealthy),
    ];

    const isHealthy =
      network.database.status === "ONLINE" &&
      network.earthquake.status === "ONLINE" &&
      schedulerHealthy;

    return {
      services,
      scheduler,
      overallStatus: isHealthy ? "HEALTHY" : "DEGRADED",
      checkedAt: network.checkedAt,
    };
  }
}
