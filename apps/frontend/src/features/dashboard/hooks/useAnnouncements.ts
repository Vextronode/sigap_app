import { useApiQuery } from "../../../hooks/useApiQuery";
import { announcementService } from "../../../services/announcementService";

export const useAnnouncements = () =>
  useApiQuery({
    queryKey: ["announcements"] as const,
    queryFn: announcementService.getAll,
    options: {
      staleTime: 120_000,
      refetchInterval: 300_000,
    },
  });
