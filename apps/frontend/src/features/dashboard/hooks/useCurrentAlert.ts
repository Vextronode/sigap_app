import { useApiQuery } from "../../../hooks/useApiQuery";
import { alertService } from "../../../services/alertService";

export const useCurrentAlert = () =>
  useApiQuery({
    queryKey: ["alerts", "current"] as const,
    queryFn: alertService.getCurrent,
    options: {
      staleTime: 45_000,
      refetchInterval: 120_000,
    },
  });
