// tipe data kontak darurat
export interface EmergencyContactRecord {
  id: string;
  institution: string;
  phoneNumber: string;
  isCore: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmergencyContactDto {
  institution: string;
  phoneNumber: string;
}

export interface UpdateEmergencyContactDto {
  institution?: string;
  phoneNumber?: string;
}
