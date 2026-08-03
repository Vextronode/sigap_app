import { useApiQuery } from "../../../hooks/useApiQuery";
import { earthquakeService } from "../../../services/earthquakeService";

export const useWestJavaEarthquake = () =>
  useApiQuery({
    queryKey: ["earthquake", "west-java"] as const,
    queryFn: earthquakeService.getWestJava,
    options: {
      staleTime: 0,
      refetchInterval: 60_000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
    },
  });
