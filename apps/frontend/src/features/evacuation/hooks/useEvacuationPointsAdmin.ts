import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  evacuationService,
  type EvacuationPointPayload,
} from "../../../services/evacuationService";

export const useEvacuationPointsList = () => {
  return useQuery({
    queryKey: ["evacuation-points"],
    queryFn: () => evacuationService.getPoints(),
    staleTime: 30_000,
  });
};

export const useCreateEvacuationPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EvacuationPointPayload) =>
      evacuationService.createPoint(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evacuation-points"] });
    },
  });
};

export const useUpdateEvacuationPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<EvacuationPointPayload>;
    }) => evacuationService.updatePoint(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evacuation-points"] });
    },
  });
};

export const useDeleteEvacuationPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => evacuationService.removePoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evacuation-points"] });
    },
  });
};
