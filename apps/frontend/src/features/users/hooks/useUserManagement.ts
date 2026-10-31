import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userManagementService } from "../../../services/userManagementService";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  ResetPasswordPayload,
} from "../../../types/userManagement";

export const useUsersList = (
  filters?: {
    search?: string;
    role?: string;
    status?: string;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => userManagementService.getUsers(filters),
    staleTime: 10_000,
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
};

export const useUserStats = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: () => userManagementService.getStats(),
    staleTime: 15_000,
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
};

export const useUserRoles = () => {
  return useQuery({
    queryKey: ["admin-users-roles"],
    queryFn: () => userManagementService.getRoles(),
    staleTime: 60_000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      userManagementService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserPayload;
    }) => userManagementService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
    },
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ResetPasswordPayload;
    }) => userManagementService.resetPassword(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
    },
  });
};

export const useUnlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userManagementService.unlockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
    },
  });
};
