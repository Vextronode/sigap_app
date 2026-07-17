import { useApiQuery } from "../../../hooks/useApiQuery";
import { weatherService } from "../../../services/weatherService";

export const useWeather = () =>
  useApiQuery({
    queryKey: ["weather", "current"] as const,
    queryFn: () => weatherService.getCurrent(),
    options: {
      staleTime: 60_000,
      refetchInterval: 180_000,
    },
  });
