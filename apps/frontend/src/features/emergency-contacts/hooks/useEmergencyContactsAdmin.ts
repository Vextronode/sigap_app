import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emergencyContactService } from "../../../services/emergencyContactService";
import type {
  CreateEmergencyContactPayload,
  UpdateEmergencyContactPayload,
} from "../../../types/emergencyContact";

export const useEmergencyContactsList = () => {
  return useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: () => emergencyContactService.getAll(),
    staleTime: 30_000,
  });
};

export const useCreateEmergencyContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmergencyContactPayload) =>
      emergencyContactService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });
};

export const useUpdateEmergencyContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEmergencyContactPayload;
    }) => emergencyContactService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });
};

export const useDeleteEmergencyContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emergencyContactService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });
};
