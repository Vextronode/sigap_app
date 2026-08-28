import { Cloud, CloudLightning, CloudRain, CloudSun, LucideDroplet, Sun, Thermometer, Wind } from "lucide-react";
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

/** Label ringkas untuk teks prakiraan (mis. di forecast card) */
const weatherLabel = (condition: string): string => {
  const category = classifyWeather(condition);
  const labels: Record<WeatherCategory, string> = {
    badai:       "Badai",
    hujan:       "Hujan",
    berawan:     "Berawan",
    cerahberawan:"Cerah Berawan",
    cerah:       "Cerah",
  };
  return labels[category];
};

export const WeatherSection = ({
  weather,
  forecast,
  isWeatherLoading = false,
  isWeatherError = false,
  isForecastLoading = false,
  isForecastError = false,
}: WeatherSectionProps) => {
  return (
    <section aria-labelledby="weather">
      <SectionHeader id="weather" title="Monitoring Cuaca" icon={<CloudSun size={22} />} />
      {isWeatherLoading ? (
        <>
          <Skeleton className="mb-6 h-[100px] w-full !rounded-2xl" />
          <div className="weather-grid">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </>
      ) : isWeatherError ? (
        <StateMessage
          type="error"
          title="Cuaca gagal dimuat"
          message="Data cuaca terkini belum dapat diambil dari API."
        />
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
              <span
                className="mt-1 block text-[0.7rem] text-[color:var(--text-muted)] opacity-60"
                title="BMKG Public API memperbarui data prakiraan cuaca 2x sehari (pukul 07:00 dan 19:00 WIB). Data yang ditampilkan adalah prakiraan, bukan pengamatan langsung."
              >
                ⓘ Prakiraan BMKG · diperbarui 2× sehari
              </span>
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

      <Card className="forecast-card" aria-label="Prakiraan cuaca">
        {isForecastLoading ? (
          <div className="forecast-list">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isForecastError ? (
          <StateMessage
            type="error"
            title="Prakiraan gagal dimuat"
            message="Data prakiraan cuaca belum dapat diambil dari API."
          />
        ) : forecast.length > 0 ? (
          <div className="forecast-list">
            {forecast.slice(0, 4).map((item) => (
              <article
                className="forecast-item"
                key={`${item.label}-${item.date}`}
              >
                <span>{item.label}</span>

                <WeatherIcon condition={item.condition} label={item.label} size={22} />

                <strong>{item.temperature}°C</strong>

                <small>{weatherLabel(item.condition)}</small>
              </article>
            ))}
          </div>
        ) : (
          <StateMessage title="Prakiraan belum tersedia" message="Backend belum mengirim data prakiraan cuaca." />
        )}
      </Card>
    </section>
  );
};