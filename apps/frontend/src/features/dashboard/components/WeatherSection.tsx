import {
  CalendarDays,
  Cloud,
  CloudLightning,
  CloudOff,
  CloudRain,
  CloudSun,
  ExternalLink,
  LucideDroplet,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { BsMoon, BsCloudMoon } from "react-icons/bs";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton, Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { SectionHeader } from "../../../components/common/SectionHeader";
import type { CurrentWeather, WeatherForecastItem } from "../../../types/dashboard";

type WeatherSectionProps = {
  weather: CurrentWeather | null;
  forecast?: WeatherForecastItem[];
  isWeatherLoading?: boolean;
  isWeatherError?: boolean;
  isForecastLoading?: boolean;
  isForecastError?: boolean;
  showForecast?: boolean;
  showSourceLink?: boolean;
};

const windDirectionMap: Record<string, string> = {
  N: "Dari Utara",
  NE: "Dari Timur Laut",
  E: "Dari Timur",
  SE: "Dari Tenggara",
  S: "Dari Selatan",
  SW: "Dari Barat Daya",
  W: "Dari Barat",
  NW: "Dari Barat Laut",
};

/**
 * Klasifikasi kondisi cuaca dari weather_desc BMKG/Open-Meteo.
 */
type WeatherCategory = "badai" | "hujan" | "berawan" | "cerahberawan" | "cerah";

const classifyWeather = (condition: string): WeatherCategory => {
  const s = condition.toLowerCase();
  if (
    s.includes("badai") ||
    s.includes("petir") ||
    s.includes("thunder") ||
    s.includes("storm")
  )
    return "badai";
  if (
    s.includes("hujan") ||
    s.includes("rain") ||
    s.includes("drizzle") ||
    s.includes("gerimis")
  )
    return "hujan";
  if (s.includes("cerah berawan") || s.includes("partly cloudy"))
    return "cerahberawan";
  if (
    s.includes("berawan") ||
    s.includes("cloud") ||
    s.includes("mendung") ||
    s.includes("overcast")
  )
    return "berawan";
  return "cerah";
};

/**
 * Deteksi apakah waktu saat ini / label prakiraan menunjuk ke malam hari (18:00 - 05:59 WIB).
 */
const checkIsNight = (label?: string): boolean => {
  if (label) {
    const s = label.toLowerCase();
    if (s.includes("malam")) return true;
    if (s.includes("pagi") || s.includes("siang") || s.includes("sore"))
      return false;
  }
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
};

/** Warna ikon per kategori cuaca */
const WEATHER_COLORS: Record<WeatherCategory, string> = {
  badai: "var(--danger, #ef4444)",
  hujan: "#3b82f6",
  berawan: "#94a3b8",
  cerahberawan: "#f59e0b",
  cerah: "#f59e0b",
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

  const color =
    isNight &&
    (category === "cerah" ||
      category === "cerahberawan" ||
      category === "berawan")
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

/** Helper memformat string tanggal YYYY-MM-DD menjadi format ringkas misal 20 Okt */
const formatForecastDate = (dateStr: string) => {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      const month = months[parseInt(parts[1], 10) - 1];
      return `${day} ${month}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const WeatherSection = ({
  weather,
  forecast = [],
  isWeatherLoading = false,
  isWeatherError = false,
  isForecastLoading = false,
  isForecastError = false,
  showForecast = false,
  showSourceLink = false,
}: WeatherSectionProps) => {
  return (
    <section aria-labelledby="weather">
      <SectionHeader
        id="weather"
        title="Monitoring Cuaca"
        icon={<CloudSun size={22} />}
      />

      {/* 1. KARTU CUACA SAAT INI */}
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
                Terjadi gangguan koneksi data atau internet saat memuat
                informasi cuaca terkini.
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
          <Card className="mb-6 flex items-center justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <span className="block text-[0.8rem] font-extrabold uppercase tracking-wider text-[color:var(--text-muted)]">
                Cuaca Saat Ini
              </span>
              <strong className="mt-1 block text-[2.25rem] sm:text-[2.6rem] font-extrabold leading-tight text-[color:var(--primary)]">
                {weather.weather}
              </strong>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Cibenda, Kecamatan Parigi, Kabupaten Pangandaran, Jawa Barat
              </p>

              {/* Tautan Sumber Resmi BMKG (Hanya di Admin) */}
              {showSourceLink && (
                <div className="mt-2.5 max-w-full">
                  <a
                    href="https://www.bmkg.go.id/cuaca/prakiraan-cuaca/32.18.01.2008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[color:var(--primary)] hover:underline transition-colors max-w-full"
                    style={{ color: "var(--primary)" }}
                    title="Lihat Prakiraan Cuaca Desa Cibenda di Situs Resmi BMKG"
                  >
                    <span className="leading-snug break-words" style={{ color: "var(--primary)" }}>
                      <span className="inline sm:hidden">Sumber: BMKG Desa Cibenda</span>
                      <span className="hidden sm:inline">Sumber: BMKG (Prakiraan Cuaca Desa Cibenda)</span>
                    </span>
                    <ExternalLink size={12} className="shrink-0" style={{ color: "var(--primary)" }} aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-[color:var(--icon-chip-bg)] shadow-xs">
              <WeatherIcon condition={weather.weather} size={40} />
            </div>
          </Card>

          {/* METRIC GRID */}
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
              <small>
                {weather.visibility
                  ? `Jarak pandang ${weather.visibility}`
                  : "Data BMKG"}
              </small>
            </Card>
            <Card className="metric-card">
              <span>Laju & Arah Angin</span>
              <strong>
                <Wind size={26} aria-hidden="true" />
                {weather.windSpeed}
                <span>km/jam</span>
              </strong>
              <small>
                {windDirectionMap[weather.windDirection] ??
                  (weather.windDirection
                    ? `Dari ${weather.windDirection}`
                    : "Data BMKG")}
              </small>
            </Card>
          </div>
        </>
      ) : (
        <StateMessage
          title="Cuaca belum tersedia"
          message="Data cuaca resmi belum berhasil dimuat."
        />
      )}

      {/* 2. KARTU PRAKIRAAN CUACA (FORECAST CARD - HANYA DI HALAMAN ADMIN) */}
      {showForecast && (
        <Card
          className="mt-6 overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs !p-0"
          aria-label="Prakiraan cuaca"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50">
                <CalendarDays size={18} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Prakiraan Cuaca Mendatang
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Prediksi cuaca beberapa hari ke depan di Desa Cibenda
                </p>
              </div>
            </div>
            {showSourceLink && (
              <a
                href="https://open-meteo.com/en/docs#latitude=-7.6838&longitude=108.5610"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--primary)] hover:underline transition-colors"
                style={{ color: "var(--primary)" }}
                title="Lihat Visualisasi Cuaca Desa Cibenda di Open-Meteo"
              >
                <span style={{ color: "var(--primary)" }}>Prakiraan Lengkap Open-Meteo</span>
                <ExternalLink size={12} className="shrink-0" style={{ color: "var(--primary)" }} aria-hidden="true" />
              </a>
            )}
          </div>

          <div className="p-3.5 sm:p-5">
            {isForecastLoading ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : isForecastError ? (
              <div className="py-4 text-center">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Prakiraan cuaca sementara belum dapat diperbarui dari provider data.
                </p>
              </div>
            ) : forecast.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
                {forecast.slice(0, 5).map((item) => (
                  <article
                    key={`${item.label}-${item.date}`}
                    className="flex flex-col items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-3 sm:p-3.5 text-center transition-all hover:bg-white dark:hover:bg-slate-800/70 hover:shadow-2xs hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* 1. Label Hari & Tanggal */}
                    <div className="w-full">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {item.label}
                      </span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                        {formatForecastDate(item.date)}
                      </span>
                    </div>

                    {/* 2. Ikon Cuaca */}
                    <div className="mt-2.5 mb-1 flex h-9 w-9 items-center justify-center">
                      <WeatherIcon
                        condition={item.condition}
                        label={item.label}
                        size={28}
                      />
                    </div>

                    {/* 3. Chip Persentase Hujan (Tepat di bawah ikon, di atas teks kondisi) */}
                    <div className="min-h-[22px] flex items-center justify-center mb-1">
                      {item.rainProbability > 0 ? (
                        <span
                          className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50"
                          title={`Peluang hujan: ${item.rainProbability}%`}
                        >
                          🌧 {item.rainProbability}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          0%
                        </span>
                      )}
                    </div>

                    {/* 4. Teks Kondisi Cuaca */}
                    <strong
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 w-full"
                      title={item.condition}
                    >
                      {item.condition}
                    </strong>

                    {/* 5. Suhu Utama Mandiri (Tidak bercampur dengan persentase hujan) */}
                    <div className="mt-2 flex items-center justify-center w-full">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {item.temperature}°C
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <StateMessage
                title="Prakiraan belum tersedia"
                message="Data prakiraan cuaca belum dikirimkan oleh sistem."
              />
            )}
          </div>
        </Card>
      )}
    </section>
  );
};