import { useApiQuery } from "../../../hooks/useApiQuery";
import { deviceService } from "../../../services/deviceService";

export const useDeviceStatus = () =>
  useApiQuery({
    queryKey: ["device", "status"] as const,
    queryFn: deviceService.getStatus,
    options: {
      staleTime: 30_000,
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    },
  });
