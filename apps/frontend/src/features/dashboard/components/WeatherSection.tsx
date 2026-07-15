import { CloudSun, Droplets, Thermometer, Wind } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { StateMessage } from "../../../components/ui/StateMessage";
import { SectionHeader } from "../../../components/common/SectionHeader";
import type { CurrentWeather, WeatherForecastItem } from "../../../types/dashboard";
import { formatWeekday } from "../../../utils/date";

type WeatherSectionProps = {
  weather: CurrentWeather | null;
  forecast: WeatherForecastItem[];
};

const weatherIcon = (condition: string) => {
  const normalized = condition.toLowerCase();
  if (normalized.includes("hujan") || normalized.includes("rain")) return "Hujan";
  if (normalized.includes("awan") || normalized.includes("cloud")) return "Berawan";
  return "Cerah";
};

export const WeatherSection = ({ weather, forecast }: WeatherSectionProps) => (
  <section aria-labelledby="weather">
    <SectionHeader id="weather" title="Monitoring Cuaca" icon={<CloudSun size={22} />} />
    {weather ? (
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
            <Droplets size={26} aria-hidden="true" />
            {weather.humidity}%
          </strong>
          <small>{weather.visibility ? `Jarak pandang ${weather.visibility}` : "Data BMKG"}</small>
        </Card>
        <Card className="metric-card">
          <span>Laju angin</span>
          <strong>
            <Wind size={26} aria-hidden="true" />
            {weather.windSpeed} km/jam
          </strong>
          <small>{weather.windDirection}</small>
        </Card>
      </div>
    ) : (
      <StateMessage title="Cuaca belum tersedia" message="Data cuaca resmi belum berhasil dimuat." />
    )}

    <Card className="forecast-card" aria-label="Prakiraan cuaca">
      {forecast.length > 0 ? (
        <div className="forecast-list">
          {forecast.slice(0, 4).map((item) => (
            <article className="forecast-item" key={`${item.date}-${item.condition}`}>
              <span>{formatWeekday(item.date)}</span>
              <CloudSun size={22} aria-hidden="true" />
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
