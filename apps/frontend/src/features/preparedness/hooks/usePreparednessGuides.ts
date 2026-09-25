import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { preparednessService } from "../../../services/preparednessService";
import type {
  CreatePreparednessGuideInput,
  UpdatePreparednessGuideInput,
} from "../types/preparedness.types";

export const PREPAREDNESS_KEYS = {
  all: ["preparedness-guides"] as const,
  admin: () => [...PREPAREDNESS_KEYS.all, "admin"] as const,
  public: () => [...PREPAREDNESS_KEYS.all, "public"] as const,
  detail: (id: string) => [...PREPAREDNESS_KEYS.all, "detail", id] as const,
};

export function usePreparednessGuidesAdmin() {
  return useQuery({
    queryKey: PREPAREDNESS_KEYS.admin(),
    queryFn: () => preparednessService.getAllAdmin(),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}

export function usePreparednessGuidesPublic() {
  return useQuery({
    queryKey: PREPAREDNESS_KEYS.public(),
    queryFn: () => preparednessService.getAllPublic(),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}

export function useCreatePreparednessGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePreparednessGuideInput) =>
      preparednessService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREPAREDNESS_KEYS.all });
    },
  });
}

export function useUpdatePreparednessGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePreparednessGuideInput;
    }) => preparednessService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREPAREDNESS_KEYS.all });
    },
  });
}

export function useDeletePreparednessGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => preparednessService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREPAREDNESS_KEYS.all });
    },
  });
}
