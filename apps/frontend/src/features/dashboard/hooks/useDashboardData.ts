import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../../services/dashboardService";

export const dashboardQueryKey = ["dashboard"];

export const useDashboardData = () =>
  useQuery({
    queryKey: dashboardQueryKey,
    queryFn: dashboardService.getDashboard,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
