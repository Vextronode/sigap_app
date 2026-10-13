// tipe data titik evakuasi bencana desa
export interface EvacuationPointRecord {
  id: string;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  elevation?: number | null;
  capacity?: number | null;
  description?: string | null;
  facilities: string[];
  isCore: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEvacuationPointDto {
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  elevation?: number | null;
  capacity?: number | null;
  description?: string | null;
  facilities?: string[];
  isCore?: boolean;
}

export interface UpdateEvacuationPointDto {
  name?: string;
  address?: string | null;
  latitude?: number;
  longitude?: number;
  elevation?: number | null;
  capacity?: number | null;
  description?: string | null;
  facilities?: string[];
  isCore?: boolean;
}
