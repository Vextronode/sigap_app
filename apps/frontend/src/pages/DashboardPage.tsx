import { Announcements } from "../features/dashboard/components/Announcements";
import { CurrentAlertCard } from "../features/dashboard/components/CurrentAlertCard";
import { NotificationPrompt } from "../features/dashboard/components/NotificationPrompt";
import { EarthquakeCard } from "../features/dashboard/components/EarthquakeCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { EmergencyContacts } from "../features/dashboard/components/EmergencyContacts";
import { EvacuationRoutes } from "../features/dashboard/components/EvacuationRoutes";
import { PreparednessGuide } from "../features/dashboard/components/PreparednessGuide";
import { TsunamiCard } from "../features/dashboard/components/TsunamiCard";
import { WeatherSection } from "../features/dashboard/components/WeatherSection";
import { useAnnouncements } from "../features/dashboard/hooks/useAnnouncements";
import { useCurrentAlert } from "../features/dashboard/hooks/useCurrentAlert";
import { useIndonesiaEarthquake } from "../features/dashboard/hooks/useIndonesiaEarthquake";
import { useEmergencyContacts } from "../features/dashboard/hooks/useEmergencyContacts";
import { useEvacuation } from "../features/dashboard/hooks/useEvacuation";
import { useEvacuationRoutes } from "../features/dashboard/hooks/useEvacuationRoutes";
import { useForecast } from "../features/dashboard/hooks/useForecast";
import { usePangandaranEarthquake } from "../features/dashboard/hooks/usePangandaranEarthquake";
import { usePangandaranHistory } from "../features/dashboard/hooks/usePangandaranHistory";
import { useWestJavaEarthquake } from "../features/dashboard/hooks/useWestJavaEarthquake";
import { useTsunamiStatus } from "../features/dashboard/hooks/useTsunamiStatus";
import { useWeather } from "../features/dashboard/hooks/useWeather";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

import { Siren, TriangleAlert, } from "lucide-react";

export default function DashboardPage() {
  useDocumentTitle("Dashboard SIGAP Desa Cibenda");

  const weatherQuery = useWeather();
  const forecastQuery = useForecast();
  const indonesiaEarthquakeQuery = useIndonesiaEarthquake();
  const westJavaEarthquakeQuery = useWestJavaEarthquake();
  const pangandaranEarthquakeQuery = usePangandaranEarthquake();
  const pangandaranHistoryQuery = usePangandaranHistory();
  const tsunamiQuery = useTsunamiStatus();
  const alertQuery = useCurrentAlert();
  const announcementsQuery = useAnnouncements();
  const contactsQuery = useEmergencyContacts();
  const evacuationQuery = useEvacuation();
  const evacuationRoutesQuery = useEvacuationRoutes();

  /**
   * Global loading indicator hanya aktif ketika data pertama kali dimuat.
   * 
   * Jangan gunakan isFetching di sini karena isFetching juga bernilai true
   * ketika background polling / refetch sedang berjalan.
   */

  const isInitialLoading = [
    weatherQuery,
    forecastQuery,
    indonesiaEarthquakeQuery,
    westJavaEarthquakeQuery,
    pangandaranEarthquakeQuery,
    tsunamiQuery,
    alertQuery,
    announcementsQuery,
    contactsQuery,
    evacuationQuery,
    evacuationRoutesQuery,
  ].some((query) => query.isLoading);

  return (
    <div className="dashboard-page">
      <span
        className={`refresh-indicator ${isInitialLoading ? "refresh-indicator--visible" : ""
          }`}
      >
        Memperbarui data...
      </span>
      <div className="dashboard-stack">
        <CurrentAlertCard
          alert={alertQuery.data ?? null}
          isLoading={alertQuery.isLoading}
          isError={alertQuery.isError}
        />
        <NotificationPrompt />
        {/* Fitur Ringkasan AI dinonaktifkan sementara:
        <AISummaryCard
          summary={summaryQuery.data ?? null}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        */}
        <WeatherSection
          weather={weatherQuery.data ?? null}
          forecast={forecastQuery.data ?? []}
          isWeatherLoading={weatherQuery.isLoading}
          isWeatherError={weatherQuery.isError}
          isForecastLoading={forecastQuery.isLoading}
          isForecastError={forecastQuery.isError}
        />
        <section aria-labelledby="earthquake">
          <SectionHeader
            id="earthquake"
            title="Monitoring Gempa Bumi"
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
            <div className="dashboard-grid dashboard-grid--two">
              <EarthquakeCard
                title="Info Gempa Indonesia"
                earthquake={indonesiaEarthquakeQuery.data ?? null}
                isLoading={indonesiaEarthquakeQuery.isLoading}
                isError={indonesiaEarthquakeQuery.isError}
              />
              <EarthquakeCard
                title="Info Gempa Jawa Barat"
                earthquake={westJavaEarthquakeQuery.data ?? null}
                isLoading={westJavaEarthquakeQuery.isLoading}
                isError={westJavaEarthquakeQuery.isError}
              />
            </div>
          </div>
        </section>
        <section aria-labelledby="tsunami">
          <SectionHeader
            id="tsunami"
            title="Monitoring Tsunami"
            icon={<Siren size={22} />}
          />
          <TsunamiCard
            tsunami={tsunamiQuery.data ?? null}
            isLoading={tsunamiQuery.isLoading}
            isError={tsunamiQuery.isError}
          />
        </section>
        <EvacuationRoutes
          points={evacuationQuery.data ?? []}
          routes={evacuationRoutesQuery.data ?? []}
          isPointsLoading={evacuationQuery.isLoading}
          isPointsError={evacuationQuery.isError}
          isRoutesLoading={evacuationRoutesQuery.isLoading}
          isRoutesError={evacuationRoutesQuery.isError}
        />
        <EmergencyContacts
          contacts={contactsQuery.data ?? []}
          isLoading={contactsQuery.isLoading}
          isError={contactsQuery.isError}
        />
        <PreparednessGuide />
        <Announcements
          announcements={announcementsQuery.data ?? []}
          isLoading={announcementsQuery.isLoading}
          isError={announcementsQuery.isError}
        />
      </div>
    </div>
  );
}
