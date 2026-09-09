export interface EmergencyContactRecord {
  id: string;
  institution: string;
  phoneNumber: string;
  isCore: boolean;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmergencyContactPayload {
  institution: string;
  phoneNumber: string;
  icon?: string | null;
}

export interface UpdateEmergencyContactPayload {
  institution?: string;
  phoneNumber?: string;
  icon?: string | null;
}

export interface EmergencyContactFeedback {
  type: "success" | "error";
  message: string;
}
