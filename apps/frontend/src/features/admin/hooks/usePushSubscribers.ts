import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../../../services/notificationService";

export const usePushSubscribers = () => {
  return useQuery({
    queryKey: ["admin", "subscribers-count"],
    queryFn: () => notificationService.getSubscriberCount(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
};
