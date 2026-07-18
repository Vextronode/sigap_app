import { useApiQuery } from "../../../hooks/useApiQuery";
import { earthquakeService } from "../../../services/earthquakeService";

export const useLatestEarthquake = () =>
  useApiQuery({
    queryKey: ["earthquake", "latest"] as const,
    queryFn: earthquakeService.getLatest,
    options: {
      staleTime: 120_000,
      refetchInterval: 300_000,
    },
  });
