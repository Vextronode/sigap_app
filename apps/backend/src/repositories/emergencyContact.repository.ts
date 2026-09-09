import { prisma } from "../config/prisma.js";
import type {
  EmergencyContactRecord,
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
} from "../types/emergencyContact.types.js";

// ambil seluruh kontak darurat berurutan dari kontak inti
export async function findAll(): Promise<EmergencyContactRecord[]> {
  return prisma.$queryRaw<EmergencyContactRecord[]>`
    SELECT 
      id, 
      institution, 
      phone_number as "phoneNumber", 
      is_core as "isCore", 
      icon, 
      created_at as "createdAt", 
      updated_at as "updatedAt" 
    FROM emergency_contacts 
    ORDER BY is_core DESC, created_at ASC;
  `;
}

// cari kontak darurat berdasarkan id
export async function findById(id: string): Promise<EmergencyContactRecord | null> {
  const rows = await prisma.$queryRaw<EmergencyContactRecord[]>`
    SELECT 
      id, 
      institution, 
      phone_number as "phoneNumber", 
      is_core as "isCore", 
      icon, 
      created_at as "createdAt", 
      updated_at as "updatedAt" 
    FROM emergency_contacts 
    WHERE id = ${id}
    LIMIT 1;
  `;
  return rows[0] ?? null;
}

// buat entri kontak darurat baru
export async function create(
  data: CreateEmergencyContactDto & { isCore?: boolean }
): Promise<EmergencyContactRecord> {
  const isCore = data.isCore ?? false;
  const icon = data.icon ?? null;

  const rows = await prisma.$queryRaw<EmergencyContactRecord[]>`
    INSERT INTO emergency_contacts (id, institution, phone_number, is_core, icon, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      ${data.institution},
      ${data.phoneNumber},
      ${isCore},
      ${icon},
      NOW(),
      NOW()
    )
    RETURNING 
      id, 
      institution, 
      phone_number as "phoneNumber", 
      is_core as "isCore", 
      icon, 
      created_at as "createdAt", 
      updated_at as "updatedAt";
  `;
  return rows[0];
}

// perbarui data kontak darurat
export async function update(
  id: string,
  data: UpdateEmergencyContactDto
): Promise<EmergencyContactRecord> {
  const current = await findById(id);
  if (!current) {
    throw new Error("Kontak darurat tidak ditemukan.");
  }

  const institution = data.institution ?? current.institution;
  const phoneNumber = data.phoneNumber ?? current.phoneNumber;
  const icon = data.icon !== undefined ? data.icon : current.icon;

  const rows = await prisma.$queryRaw<EmergencyContactRecord[]>`
    UPDATE emergency_contacts
    SET 
      institution = ${institution},
      phone_number = ${phoneNumber},
      icon = ${icon},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING 
      id, 
      institution, 
      phone_number as "phoneNumber", 
      is_core as "isCore", 
      icon, 
      created_at as "createdAt", 
      updated_at as "updatedAt";
  `;
  return rows[0];
}

// hapus data kontak darurat
export async function deleteById(id: string): Promise<EmergencyContactRecord | null> {
  const rows = await prisma.$queryRaw<EmergencyContactRecord[]>`
    DELETE FROM emergency_contacts
    WHERE id = ${id}
    RETURNING 
      id, 
      institution, 
      phone_number as "phoneNumber", 
      is_core as "isCore", 
      icon, 
      created_at as "createdAt", 
      updated_at as "updatedAt";
  `;
  return rows[0] ?? null;
}

