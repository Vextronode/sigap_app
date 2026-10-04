import { useApiQuery } from "../../../hooks/useApiQuery";
import { earthquakeService } from "../../../services/earthquakeService";

export const usePangandaranEarthquake = () =>
  useApiQuery({
    queryKey: ["earthquake", "pangandaran"] as const,
    queryFn: earthquakeService.getPangandaran,
    options: {
      refetchInterval: 60_000,
    },
  });
