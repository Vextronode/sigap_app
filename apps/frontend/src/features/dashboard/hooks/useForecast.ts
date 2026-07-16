import { useApiQuery } from "../../../hooks/useApiQuery";
import { weatherService } from "../../../services/weatherService";

export const useForecast = () =>
  useApiQuery({
    queryKey: ["weather", "forecast"] as const,
    queryFn: weatherService.getForecast,
    options: {
      staleTime: 60_000,
      refetchInterval: 180_000,
    },
  });
