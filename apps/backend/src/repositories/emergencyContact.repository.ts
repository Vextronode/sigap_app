import { prisma } from "../config/prisma.js";
import type {
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
} from "../types/emergencyContact.types.js";

// ambil seluruh kontak darurat berurutan dari kontak inti
export async function findAll() {
  return prisma.emergencyContact.findMany({
    orderBy: [{ isCore: "desc" }, { createdAt: "asc" }],
  });
}

// cari kontak darurat berdasarkan id
export async function findById(id: string) {
  return prisma.emergencyContact.findUnique({
    where: { id },
  });
}

// buat entri kontak darurat baru
export async function create(
  data: CreateEmergencyContactDto & { isCore?: boolean }
) {
  return prisma.emergencyContact.create({
    data: {
      institution: data.institution,
      phoneNumber: data.phoneNumber,
      isCore: data.isCore ?? false,
    },
  });
}

// perbarui data kontak darurat
export async function update(id: string, data: UpdateEmergencyContactDto) {
  return prisma.emergencyContact.update({
    where: { id },
    data,
  });
}

// hapus data kontak darurat
export async function deleteById(id: string) {
  return prisma.emergencyContact.delete({
    where: { id },
  });
}
