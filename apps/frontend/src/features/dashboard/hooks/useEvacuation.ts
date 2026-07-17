import { useApiQuery } from "../../../hooks/useApiQuery";
import { evacuationService } from "../../../services/evacuationService";

export const useEvacuation = () =>
  useApiQuery({
    queryKey: ["evacuation", "points"] as const,
    queryFn: evacuationService.getPoints,
    options: {
      staleTime: 300_000,
    },
  });
