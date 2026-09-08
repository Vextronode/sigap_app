import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertService } from "../../../services/alertService";
import type {
  AlertFilterParams,
  AlertReviewPayload,
} from "../../../types/alert";

export const useAlerts = (params: AlertFilterParams) => {
  return useQuery({
    queryKey: ["alerts", "filtered", params],
    queryFn: () => alertService.getFiltered(params),
    placeholderData: (previousData) => previousData,
    staleTime: 10_000,
  });
};

export const useAlertStats = () => {
  return useQuery({
    queryKey: ["alerts", "stats"],
    queryFn: () => alertService.getStats(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
};

export const useAlertDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["alerts", "detail", id],
    queryFn: () => (id ? alertService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
};

export const useReviewAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AlertReviewPayload;
    }) => alertService.review(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
};
