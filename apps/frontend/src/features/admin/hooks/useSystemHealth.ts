import { useQuery } from "@tanstack/react-query";
import { systemHealthService } from "../../../services/systemHealthService";

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: () => systemHealthService.getHealth(),
    refetchInterval: 15000, // polling tiap 15 detik
    staleTime: 10000,
  });
};
