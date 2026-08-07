import { AISummaryCard } from "../features/dashboard/components/AISummaryCard";
import { Announcements } from "../features/dashboard/components/Announcements";
import { CurrentAlertCard } from "../features/dashboard/components/CurrentAlertCard";
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
import { useSummary } from "../features/dashboard/hooks/useSummary";
import { usePangandaranEarthquake } from "../features/dashboard/hooks/usePangandaranEarthquake";
import { useWestJavaEarthquake } from "../features/dashboard/hooks/useWestJavaEarthquake";
import { useTsunamiStatus } from "../features/dashboard/hooks/useTsunamiStatus";
import { useWeather } from "../features/dashboard/hooks/useWeather";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

import { Siren, TriangleAlert,  } from "lucide-react"; 

export default function DashboardPage() {
  useDocumentTitle("Dashboard SIGAP Desa Cibenda");
  const weatherQuery = useWeather();
  const forecastQuery = useForecast();
  const indonesiaEarthquakeQuery = useIndonesiaEarthquake();
  const westJavaEarthquakeQuery = useWestJavaEarthquake();
  const pangandaranEarthquakeQuery = usePangandaranEarthquake();
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
    indonesiaEarthquakeQuery,
    westJavaEarthquakeQuery,
    pangandaranEarthquakeQuery,
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
  );
}
