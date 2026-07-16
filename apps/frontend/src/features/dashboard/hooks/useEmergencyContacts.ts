import { useApiQuery } from "../../../hooks/useApiQuery";
import { emergencyContactService } from "../../../services/emergencyContactService";

export const useEmergencyContacts = () =>
  useApiQuery({
    queryKey: ["emergency-contacts"] as const,
    queryFn: emergencyContactService.getAll,
    options: {
      staleTime: 300_000,
    },
  });
