import { Activity } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { EarthquakeCard } from "./EarthquakeCard";
import type { Earthquake } from "../../../types/dashboard";

type EarthquakeSectionProps = {
  indonesiaData: Earthquake | null;
  westJavaData: Earthquake | null;
  pangandaranData: Earthquake | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const EarthquakeSection = ({
  indonesiaData,
  westJavaData,
  pangandaranData,
  isLoading = false,
  isError = false,
}: EarthquakeSectionProps) => {
  return (
    <section aria-labelledby="earthquake">
      <SectionHeader
        id="earthquake"
        title="Monitoring Gempa Bumi"
        icon={<Activity size={22} />}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <EarthquakeCard
          title="Info Gempa Indonesia"
          earthquake={indonesiaData}
          isLoading={isLoading}
          isError={isError}
        />
        <EarthquakeCard
          title="Info Gempa Jawa Barat"
          earthquake={westJavaData}
          isLoading={isLoading}
          isError={isError}
        />
        <EarthquakeCard
          title="Info Gempa Pangandaran"
          earthquake={pangandaranData}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </section>
  );
};