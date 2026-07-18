import { AISummaryCard } from "../features/dashboard/components/AISummaryCard";
import { Announcements } from "../features/dashboard/components/Announcements";
import { CurrentAlertCard } from "../features/dashboard/components/CurrentAlertCard";
import { EarthquakeCard } from "../features/dashboard/components/EarthquakeCard";
import { EmergencyContacts } from "../features/dashboard/components/EmergencyContacts";
import { EvacuationRoutes } from "../features/dashboard/components/EvacuationRoutes";
import { PreparednessGuide } from "../features/dashboard/components/PreparednessGuide";
import { TsunamiCard } from "../features/dashboard/components/TsunamiCard";
import { WeatherSection } from "../features/dashboard/components/WeatherSection";
import { useAnnouncements } from "../features/dashboard/hooks/useAnnouncements";
import { useCurrentAlert } from "../features/dashboard/hooks/useCurrentAlert";
import { useLatestEarthquake } from "../features/dashboard/hooks/useLatestEarthquake";
import { useEmergencyContacts } from "../features/dashboard/hooks/useEmergencyContacts";
import { useEvacuation } from "../features/dashboard/hooks/useEvacuation";
import { useEvacuationRoutes } from "../features/dashboard/hooks/useEvacuationRoutes";
import { useForecast } from "../features/dashboard/hooks/useForecast";
import { useSummary } from "../features/dashboard/hooks/useSummary";
import { useTsunamiStatus } from "../features/dashboard/hooks/useTsunamiStatus";
import { useWeather } from "../features/dashboard/hooks/useWeather";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function DashboardPage() {
  useDocumentTitle("Dashboard SIGAP Desa Cibenda");
  const weatherQuery = useWeather();
  const forecastQuery = useForecast();
  const earthquakeQuery = useLatestEarthquake();
  const tsunamiQuery = useTsunamiStatus();
  const alertQuery = useCurrentAlert();
  const summaryQuery = useSummary();
  const announcementsQuery = useAnnouncements();
  const contactsQuery = useEmergencyContacts();
  const evacuationQuery = useEvacuation();
  const evacuationRoutesQuery = useEvacuationRoutes();

  const isFetching = [
    weatherQuery,
    forecastQuery,
    earthquakeQuery,
    tsunamiQuery,
    alertQuery,
    summaryQuery,
    announcementsQuery,
    contactsQuery,
    evacuationQuery,
    evacuationRoutesQuery,
  ].some((query) => query.isFetching && !query.isLoading);

  return (
    <div className="dashboard-stack">
      {isFetching && <span className="refresh-indicator">Memperbarui data...</span>}
      <CurrentAlertCard
        alert={alertQuery.data ?? null}
        isLoading={alertQuery.isLoading}
        isError={alertQuery.isError}
      />
      <AISummaryCard
        summary={summaryQuery.data ?? null}
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
      />
      <WeatherSection
        weather={weatherQuery.data ?? null}
        forecast={forecastQuery.data ?? []}
        isWeatherLoading={weatherQuery.isLoading}
        isWeatherError={weatherQuery.isError}
        isForecastLoading={forecastQuery.isLoading}
        isForecastError={forecastQuery.isError}
      />
      <div className="dashboard-grid dashboard-grid--two" id="earthquake">
        <EarthquakeCard
          earthquake={earthquakeQuery.data ?? null}
          isLoading={earthquakeQuery.isLoading}
          isError={earthquakeQuery.isError}
        />
        <div id="tsunami">
          <TsunamiCard
            tsunami={tsunamiQuery.data ?? null}
            isLoading={tsunamiQuery.isLoading}
            isError={tsunamiQuery.isError}
          />
        </div>
      </div>
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
  );
}
