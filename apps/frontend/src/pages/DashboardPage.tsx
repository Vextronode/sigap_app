import { RefreshCcw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { CardSkeleton } from "../components/ui/Skeleton";
import { StateMessage } from "../components/ui/StateMessage";
import { AISummaryCard } from "../features/dashboard/components/AISummaryCard";
import { Announcements } from "../features/dashboard/components/Announcements";
import { CurrentAlertCard } from "../features/dashboard/components/CurrentAlertCard";
import { EarthquakeCard } from "../features/dashboard/components/EarthquakeCard";
import { EmergencyContacts } from "../features/dashboard/components/EmergencyContacts";
import { EvacuationRoutes } from "../features/dashboard/components/EvacuationRoutes";
import { PreparednessGuide } from "../features/dashboard/components/PreparednessGuide";
import { TsunamiCard } from "../features/dashboard/components/TsunamiCard";
import { WeatherSection } from "../features/dashboard/components/WeatherSection";
import { useDashboardData } from "../features/dashboard/hooks/useDashboardData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const DashboardLoading = () => (
  <div className="dashboard-stack" aria-label="Memuat dashboard">
    <CardSkeleton />
    <CardSkeleton />
    <div className="dashboard-grid dashboard-grid--three">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <div className="dashboard-grid dashboard-grid--two">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export default function DashboardPage() {
  useDocumentTitle("Dashboard SIGAP Desa Cibenda");
  const { data, isLoading, isError, refetch, isFetching } = useDashboardData();

  if (isLoading) return <DashboardLoading />;

  if (isError && !data) {
    return (
      <StateMessage
        type="error"
        title="Dashboard gagal dimuat"
        message="Periksa koneksi atau pastikan backend SIGAP dapat diakses."
        action={
          <Button variant="secondary" onClick={() => void refetch()} icon={<RefreshCcw size={18} />}>
            Muat ulang
          </Button>
        }
      />
    );
  }

  const weather = data?.weather ?? null;
  const forecast = data?.forecast ?? [];
  const earthquake = data?.earthquake ?? null;
  const tsunami = data?.tsunami ?? null;
  const alert = data?.alert ?? null;
  const summary = data?.summary ?? null;
  const announcements = data?.announcement ?? [];
  const contacts = data?.contacts ?? [];
  const evacuationPoints = data?.evacuation ?? [];
  const evacuationRoutes = data?.evacuationRoutes ?? [];

  return (
    <div className="dashboard-stack">
      {isFetching && <span className="refresh-indicator">Memperbarui data...</span>}
      <CurrentAlertCard alert={alert} />
      <AISummaryCard summary={summary} />
      <WeatherSection weather={weather} forecast={forecast} />
      <div className="dashboard-grid dashboard-grid--two" id="earthquake">
        <EarthquakeCard earthquake={earthquake} />
        <div id="tsunami">
          <TsunamiCard tsunami={tsunami} />
        </div>
      </div>
      <EvacuationRoutes points={evacuationPoints} routes={evacuationRoutes} />
      <EmergencyContacts contacts={contacts} />
      <PreparednessGuide />
      <Announcements announcements={announcements} />
    </div>
  );
}
