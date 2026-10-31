import { useApiQuery } from "../../../hooks/useApiQuery";
import { earthquakeService } from "../../../services/earthquakeService";

export const useWestJavaEarthquake = () =>
  useApiQuery({
    queryKey: ["earthquake", "west-java"] as const,
    queryFn: earthquakeService.getWestJava,
    options: {
      refetchInterval: 60_000,
    },
  });
