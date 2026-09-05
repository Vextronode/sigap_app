import { CurrentAlertCard } from "../features/dashboard/components/CurrentAlertCard";
import { EarthquakeCard } from "../features/dashboard/components/EarthquakeCard";
import { TsunamiCard } from "../features/dashboard/components/TsunamiCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { WeatherSection } from "../features/dashboard/components/WeatherSection";
import { SystemConnectivitySection } from "../features/admin/components/SystemConnectivitySection";
import { useCurrentAlert } from "../features/dashboard/hooks/useCurrentAlert";
import { useForecast } from "../features/dashboard/hooks/useForecast";
import { usePangandaranEarthquake } from "../features/dashboard/hooks/usePangandaranEarthquake";
import { usePangandaranHistory } from "../features/dashboard/hooks/usePangandaranHistory";
import { useTsunamiStatus } from "../features/dashboard/hooks/useTsunamiStatus";
import { useWeather } from "../features/dashboard/hooks/useWeather";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

import { TriangleAlert } from "lucide-react";

export default function AdminDashboardPage() {
  useDocumentTitle("Dashboard Admin - SIGAP Desa Cibenda");

  const weatherQuery = useWeather();
  const forecastQuery = useForecast();
  const pangandaranEarthquakeQuery = usePangandaranEarthquake();
  const pangandaranHistoryQuery = usePangandaranHistory();
  const tsunamiQuery = useTsunamiStatus();
  const alertQuery = useCurrentAlert();

  const isInitialLoading = [
    weatherQuery,
    forecastQuery,
    pangandaranEarthquakeQuery,
    tsunamiQuery,
    alertQuery,
  ].some((query) => query.isLoading);

  return (
    <div className="dashboard-page">
      <span
        className={`refresh-indicator ${
          isInitialLoading ? "refresh-indicator--visible" : ""
        }`}
      >
        Memperbarui data sistem...
      </span>

      <div className="dashboard-stack">
        {/* 1. Status Alert Kesiapsiagaan */}
        <CurrentAlertCard
          alert={alertQuery.data ?? null}
          isLoading={alertQuery.isLoading}
          isError={alertQuery.isError}
          showSystemStatus={true}
        />

        {/* 2. Fitur Monitor Konektivitas Sistem */}
        <SystemConnectivitySection />

        {/* 3. Komponen Cuaca Real-time */}
        <WeatherSection
          weather={weatherQuery.data ?? null}
          forecast={forecastQuery.data ?? []}
          isWeatherLoading={weatherQuery.isLoading}
          isWeatherError={weatherQuery.isError}
          isForecastLoading={forecastQuery.isLoading}
          isForecastError={forecastQuery.isError}
        />

        {/* 4. Komponen Gempa Pangandaran & Status Tsunami */}
        <section aria-labelledby="earthquake">
          <SectionHeader
            id="earthquake"
            title="Monitoring Gempa Bumi & Tsunami"
            icon={<TriangleAlert size={22} />}
          />
          <div className="dashboard-stack">
            <EarthquakeCard
              title="Info Gempa Pangandaran"
              earthquake={pangandaranEarthquakeQuery.data ?? null}
              isLoading={pangandaranEarthquakeQuery.isLoading}
              isError={pangandaranEarthquakeQuery.isError}
              historicalEarthquake={pangandaranHistoryQuery.data ?? null}
            />
            <TsunamiCard
              tsunami={tsunamiQuery.data ?? null}
              isLoading={tsunamiQuery.isLoading}
              isError={tsunamiQuery.isError}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
