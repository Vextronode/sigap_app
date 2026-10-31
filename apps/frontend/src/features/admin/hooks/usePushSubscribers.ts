import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../../../services/notificationService";

export const usePushSubscribers = () => {
  return useQuery({
    queryKey: ["admin", "subscribers-count"],
    queryFn: () => notificationService.getSubscriberCount(),
    staleTime: 0,
    refetchInterval: 5_000, // Live auto-poll setiap 5 detik agar admin melihat perubahan subscriber secara real-time
  });
};
