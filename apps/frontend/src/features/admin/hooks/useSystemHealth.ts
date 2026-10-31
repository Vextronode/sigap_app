import { useQuery } from "@tanstack/react-query";
import { systemHealthService } from "../../../services/systemHealthService";

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: () => systemHealthService.getHealth(),
    refetchInterval: 60000, // polling tiap 60 detik (menghemat kuota compute DB & bandwidth)
    staleTime: 30000,
  });
};
