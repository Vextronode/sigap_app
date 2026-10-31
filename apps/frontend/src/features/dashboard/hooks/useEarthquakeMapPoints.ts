import { useQuery } from "@tanstack/react-query";
import { earthquakeService } from "../../../services/earthquakeService";

export const useEarthquakeMapPoints = () =>
  useQuery({
    queryKey: ["earthquakes", "map-points"] as const,
    queryFn: earthquakeService.getMapPoints,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

