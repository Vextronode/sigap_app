import { useApiQuery } from "../../../hooks/useApiQuery";
import { deviceService } from "../../../services/deviceService";

export const useDeviceStatus = () =>
  useApiQuery({
    queryKey: ["device", "status"] as const,
    queryFn: deviceService.getStatus,
    options: {
      staleTime: 15_000,
      refetchInterval: 30_000,
      refetchIntervalInBackground: true,
    },
  });
