import { useApiQuery } from "../../../hooks/useApiQuery";
import { alertService } from "../../../services/alertService";

const REFETCH_INTERVAL_MS = Number(import.meta.env.VITE_ALERT_REFETCH_INTERVAL_MS) || 60_000;

export const useCurrentAlert = () =>
  useApiQuery({
    queryKey: ["alerts", "current"] as const,
    queryFn: alertService.getCurrent,
    options: {
      staleTime: REFETCH_INTERVAL_MS / 2,
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  });
