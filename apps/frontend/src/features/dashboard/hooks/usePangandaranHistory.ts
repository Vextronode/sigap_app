import { useApiQuery } from "../../../hooks/useApiQuery";
import { earthquakeService } from "../../../services/earthquakeService";

export const usePangandaranHistory = () =>
  useApiQuery({
    queryKey: ["earthquake", "pangandaran", "history"] as const,
    queryFn: earthquakeService.getPangandaranHistory,
    options: {
      staleTime: 5 * 60 * 1000,
      refetchInterval: false,
    },
  });
