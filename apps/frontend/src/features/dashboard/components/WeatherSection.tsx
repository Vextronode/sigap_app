import { Cloud, CloudLightning, CloudOff, CloudRain, CloudSun, LucideDroplet, Sun, Thermometer, Wind } from "lucide-react";
import { BsMoon, BsCloudMoon } from "react-icons/bs";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton, Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { SectionHeader } from "../../../components/common/SectionHeader";
import type { CurrentWeather, WeatherForecastItem } from "../../../types/dashboard";

type WeatherSectionProps = {
  weather: CurrentWeather | null;
  forecast: WeatherForecastItem[];
  isWeatherLoading?: boolean;
  isWeatherError?: boolean;
  isForecastLoading?: boolean;
  isForecastError?: boolean;
};

const windDirectionMap: Record<string, string> = {
  N:  "Dari Utara",     
  NE: "Dari Timur Laut",  
  E:  "Dari Timur",     
  SE: "Dari Tenggara", 
  S:  "Dari Selatan",  
  SW: "Dari Barat Daya",   
  W:  "Dari Barat", 
  NW: "Dari Barat Laut", 
};

/**
 * Klasifikasi kondisi cuaca dari weather_desc BMKG.
 */
type WeatherCategory = "badai" | "hujan" | "berawan" | "cerahberawan" | "cerah";

const classifyWeather = (condition: string): WeatherCategory => {
  const s = condition.toLowerCase();
  if (s.includes("badai") || s.includes("petir") || s.includes("thunder") || s.includes("storm")) return "badai";
  if (s.includes("hujan") || s.includes("rain") || s.includes("drizzle") || s.includes("gerimis")) return "hujan";
  if (s.includes("cerah berawan") || s.includes("partly cloudy")) return "cerahberawan";
  if (s.includes("berawan") || s.includes("cloud") || s.includes("mendung") || s.includes("overcast")) return "berawan";
  return "cerah";
};

/**
 * Deteksi apakah waktu saat ini / label prakiraan menunjuk ke malam hari (18:00 - 05:59 WIB).
 */
const checkIsNight = (label?: string): boolean => {
  if (label) {
    const s = label.toLowerCase();
    if (s.includes("malam")) return true;
    if (s.includes("pagi") || s.includes("siang") || s.includes("sore")) return false;
  }
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
};

/** Warna ikon per kategori cuaca */
const WEATHER_COLORS: Record<WeatherCategory, string> = {
  badai:       "var(--danger, #ef4444)",
  hujan:       "#3b82f6",
  berawan:     "#94a3b8",
  cerahberawan:"#f59e0b",
  cerah:       "#f59e0b",
};

/** Komponen ikon cuaca yang dinamis menyesuaikan kondisi cuaca & waktu (Siang vs Malam) */
const WeatherIcon = ({
  condition,
  label,
  size = 42,
}: {
  condition: string;
  label?: string;
  size?: number;
}) => {
  const category = classifyWeather(condition);
  const isNight = checkIsNight(label);

  // Pada malam hari, warna bulan menggunakan biru lembut / indigo pastel (#60a5fa / #818cf8)
  const color = isNight && (category === "cerah" || category === "cerahberawan" || category === "berawan")
    ? "#60a5fa"
    : WEATHER_COLORS[category];

  const props = { size, color, "aria-hidden": true } as const;

  switch (category) {
    case "badai":
      return <CloudLightning {...props} />;
    case "hujan":
      return <CloudRain {...props} />;
    case "berawan":
      return isNight ? <BsCloudMoon {...props} /> : <Cloud {...props} />;
    case "cerahberawan":
      return isNight ? <BsCloudMoon {...props} /> : <CloudSun {...props} />;
    case "cerah":
      return isNight ? <BsMoon {...props} /> : <Sun {...props} />;
  }
};

export const WeatherSection = ({
  weather,
  isWeatherLoading = false,
  isWeatherError = false,
}: WeatherSectionProps) => {
  return (
    <section aria-labelledby="weather">
      <SectionHeader id="weather" title="Monitoring Cuaca" icon={<CloudSun size={22} />} />
      {isWeatherError ? (
        <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40 text-sky-600 dark:text-sky-400 shadow-2xs">
              <CloudOff size={24} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Data Cuaca Belum Tersambung
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mt-1">
                Terjadi gangguan koneksi data atau internet saat memuat informasi cuaca terkini.
              </p>
            </div>
          </div>
        </Card>
      ) : isWeatherLoading ? (
        <>
          <Skeleton className="mb-6 h-[100px] w-full !rounded-2xl" />
          <div className="weather-grid">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </>
      ) : weather ? (
        <>
          <Card className="mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-[0.8rem] font-extrabold uppercase text-[color:var(--text-muted)]">
                Cuaca Saat Ini
              </span>
              <strong className="mt-1 block text-[2.5rem] font-extrabold leading-tight text-[color:var(--primary)]">
                {weather.weather}
              </strong>
              <small className="font-bold text-[color:var(--text-muted)]">
                Cibenda, Kecamatan Parigi, Kabupaten Pangandaran, Jawa Barat
              </small>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[color:var(--icon-chip-bg)]">
              <WeatherIcon condition={weather.weather} size={42} />
            </div>
          </Card>

          <div className="weather-grid">
            <Card className="metric-card">
              <span>Suhu terkini</span>
              <strong>
                <Thermometer size={26} aria-hidden="true" />
                {weather.temperature}°C
              </strong>
              <small>{weather.weather}</small>
            </Card>
            <Card className="metric-card">
              <span>Kelembapan</span>
              <strong>
                <LucideDroplet size={26} aria-hidden="true" />
                {weather.humidity}%
              </strong>
              <small>{weather.visibility ? `Jarak pandang ${weather.visibility}` : "Data BMKG"}</small>
            </Card>
            <Card className="metric-card">
              <span>Laju & Arah Angin</span>
              <strong>
                <Wind size={26} aria-hidden="true" />
                {weather.windSpeed}
                <span>km/jam</span>
              </strong>
              <small>
                {windDirectionMap[weather.windDirection] ?? (weather.windDirection ? `Dari ${weather.windDirection}` : "Data BMKG")}
              </small>
            </Card>
          </div>
        </>
      ) : (
        <StateMessage title="Cuaca belum tersedia" message="Data cuaca resmi belum berhasil dimuat." />
      )}
    </section>
  );
};