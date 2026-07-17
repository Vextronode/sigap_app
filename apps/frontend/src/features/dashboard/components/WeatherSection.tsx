import { CloudSun, LucideDroplet, Thermometer, Wind} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
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

const weatherIcon = (condition: string) => {
  const normalized = condition.toLowerCase();
  if (normalized.includes("hujan") || normalized.includes("rain")) return "Hujan";
  if (normalized.includes("awan") || normalized.includes("cloud")) return "Berawan";
  return "Cerah";
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
      <div className="weather-grid">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    ) : isWeatherError ? (
      <StateMessage
        type="error"
        title="Cuaca gagal dimuat"
        message="Data cuaca terkini belum dapat diambil dari API."
      />
    ) : weather ? (
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

              <CloudSun size={22} />

              <strong>{item.temperature}°C</strong>

              <small>{weatherIcon(item.condition)}</small>
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