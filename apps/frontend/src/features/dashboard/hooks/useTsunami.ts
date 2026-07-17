import { useApiQuery } from "../../../hooks/useApiQuery";
import { tsunamiService } from "../../../services/tsunamiService";

export const useTsunami = () =>
  useApiQuery({
    queryKey: ["tsunami", "status"] as const,
    queryFn: tsunamiService.getStatus,
    options: {
      staleTime: 60_000,
      refetchInterval: 180_000,
    },
  });
