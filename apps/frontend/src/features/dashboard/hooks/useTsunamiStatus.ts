import { useApiQuery } from "../../../hooks/useApiQuery";
import { tsunamiService } from "../../../services/tsunamiService";

export const useTsunamiStatus = () =>
  useApiQuery({
    queryKey: ["tsunami", "status"] as const,
    queryFn: tsunamiService.getStatus,
    options: {
      staleTime: 120_000,
      refetchInterval: 300_000,
    },
  });
