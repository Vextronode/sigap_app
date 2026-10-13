import { useApiQuery } from "../../../hooks/useApiQuery";
import { earthquakeService } from "../../../services/earthquakeService";

export const useWestJavaHistory = () =>
  useApiQuery({
    queryKey: ["earthquake", "west-java", "history"] as const,
    queryFn: earthquakeService.getWestJavaHistory,
    options: {
      staleTime: 5 * 60 * 1000,
      refetchInterval: false,
    },
  });
