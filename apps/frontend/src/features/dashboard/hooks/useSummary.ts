import { useApiQuery } from "../../../hooks/useApiQuery";
import { summaryService } from "../../../services/summaryService";

export const useSummary = () =>
  useApiQuery({
    queryKey: ["summaries", "weather"] as const,
    queryFn: summaryService.getWeatherSummary,
    options: {
      staleTime: 120_000,
      refetchInterval: 300_000,
    },
  });
