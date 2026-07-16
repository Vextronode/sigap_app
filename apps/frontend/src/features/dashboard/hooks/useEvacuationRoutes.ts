import { useApiQuery } from "../../../hooks/useApiQuery";
import { evacuationService } from "../../../services/evacuationService";

export const useEvacuationRoutes = () =>
  useApiQuery({
    queryKey: ["evacuation", "routes"] as const,
    queryFn: evacuationService.getRoutes,
    options: {
      staleTime: 300_000,
    },
  });
