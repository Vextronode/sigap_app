import { Cloud, CloudLightning, CloudRain, CloudSun, LucideDroplet, Sun, Thermometer, Wind} from "lucide-react";
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
 * Urutan cek penting: badai/petir dulu sebelum hujan, hujan dulu sebelum berawan.
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

/** Warna ikon per kategori cuaca */
const WEATHER_COLORS: Record<WeatherCategory, string> = {
  badai:       "var(--danger, #ef4444)",
  hujan:       "var(--primary)",
  berawan:     "var(--text-muted, #6b7280)",
  cerahberawan:"var(--warning)",
  cerah:       "var(--warning)",
};

/** Komponen ikon cuaca yang berubah sesuai kondisi */
const WeatherIcon = ({ condition, size = 42 }: { condition: string; size?: number }) => {
  const category = classifyWeather(condition);
  const color = WEATHER_COLORS[category];
  const props = { size, color, "aria-hidden": true } as const;

  switch (category) {
    case "badai":       return <CloudLightning {...props} />;
    case "hujan":       return <CloudRain {...props} />;
    case "berawan":     return <Cloud {...props} />;
    case "cerahberawan":return <CloudSun {...props} />;
    case "cerah":       return <Sun {...props} />;
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
            {/* Disclaimer: BMKG Public API hanya update 2x sehari (07:00 & 19:00 WIB),
                bukan observasi real-time. Data yang ditampilkan adalah prakiraan NWP BMKG.
                Kondisi aktual bisa berbeda jika terjadi perubahan cuaca mendadak. */}
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
          
          {/* Cukup pakai ini untuk menampilkan teks arah angin */}
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

              <WeatherIcon condition={item.condition} size={22} />

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