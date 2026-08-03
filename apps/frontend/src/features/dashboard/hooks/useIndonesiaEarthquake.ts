import { useApiQuery } from "../../../hooks/useApiQuery";
import { earthquakeService } from "../../../services/earthquakeService";

export const useIndonesiaEarthquake = () =>
  useApiQuery({
    queryKey: ["earthquake", "indonesia"] as const,
    queryFn: earthquakeService.getIndonesia,
    options: {
      staleTime: 0,
      refetchInterval: 60_000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
    },
  });
