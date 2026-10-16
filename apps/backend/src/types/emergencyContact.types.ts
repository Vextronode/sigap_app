// tipe data kontak darurat
export interface EmergencyContactRecord {
  id: string;
  institution: string;
  phoneNumber: string;
  isCore: boolean;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmergencyContactDto {
  institution: string;
  phoneNumber: string;
  icon?: string | null;
}

export type UpdateEmergencyContactDto = Partial<CreateEmergencyContactDto>;

