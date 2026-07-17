import { useApiQuery } from "../../../hooks/useApiQuery";
import { earthquakeService } from "../../../services/earthquakeService";

export const useEarthquake = () =>
  useApiQuery({
    queryKey: ["earthquake", "latest"] as const,
    queryFn: earthquakeService.getLatest,
    options: {
      staleTime: 60_000,
      refetchInterval: 180_000,
    },
  });
