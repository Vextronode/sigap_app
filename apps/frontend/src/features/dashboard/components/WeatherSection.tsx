import { CloudSun, LucideDroplet, Thermometer, Wind } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { CurrentWeather, WeatherForecastItem } from "../../../types/dashboard";
import { dummyForecast, dummyWeather } from "../data/dummyData";

type WeatherSectionProps = {
  weather: CurrentWeather | null;
  forecast: WeatherForecastItem[];
  isWeatherLoading?: boolean;
  isWeatherError?: boolean;
  isForecastLoading?: boolean;
  isForecastError?: boolean;
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
  const displayWeather = weather && !isWeatherError ? weather : dummyWeather;
  const displayForecast = forecast.length > 0 && !isForecastError ? forecast : dummyForecast;

  return (
    <section aria-labelledby="weather">
      <SectionHeader id="weather" title="Monitoring Cuaca" icon={<CloudSun size={22} />} />
      {isWeatherLoading ? (
        <div className="weather-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="weather-grid">
          <Card className="metric-card">
            <span>Suhu terkini</span>
            <strong>
              <Thermometer size={26} aria-hidden="true" />
              {displayWeather.temperature}°C
            </strong>
            <small>{displayWeather.weather}</small>
          </Card>
          <Card className="metric-card">
            <span>Kelembapan</span>
            <strong>
              <LucideDroplet size={26} aria-hidden="true" />
              {displayWeather.humidity}%
            </strong>
            <small>{displayWeather.visibility ? `Jarak pandang ${displayWeather.visibility}` : "Data BMKG"}</small>
          </Card>
          <Card className="metric-card">
            <span>Laju & Arah Angin</span>
            <strong>
              <Wind size={26} aria-hidden="true" />
              {displayWeather.windSpeed}
              <span>km/jam</span>
            </strong>
            <small>{windDirectionMap[displayWeather.windDirection] ?? `Dari ${displayWeather.windDirection}`}</small>
          </Card>
        </div>
      )}

      <Card className="forecast-card" aria-label="Prakiraan cuaca">
        {isForecastLoading ? (
          <div className="forecast-list">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="forecast-list">
            {displayForecast.slice(0, 4).map((item) => (
              <article className="forecast-item" key={`${item.label}-${item.date}`}>
                <span>{item.label}</span>
                <CloudSun size={22} />
                <strong>{item.temperature}°C</strong>
                <small>{weatherIcon(item.condition)}</small>
              </article>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
};
