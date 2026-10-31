import { prisma } from "../config/prisma.js";
import type {
  CreateEvacuationPointDto,
  UpdateEvacuationPointDto,
} from "../types/evacuationPoint.types.js";

// ambil seluruh titik evakuasi berurutan dari titik inti
export async function findAll() {
  return prisma.evacuationPoint.findMany({
    orderBy: [{ isCore: "desc" }, { createdAt: "asc" }],
  });
}

// cari titik evakuasi berdasarkan id
export async function findById(id: string) {
  return prisma.evacuationPoint.findUnique({
    where: { id },
  });
}

// buat titik evakuasi baru
export async function create(data: CreateEvacuationPointDto) {
  return prisma.evacuationPoint.create({
    data: {
      name: data.name,
      address: data.address ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      elevation: data.elevation ?? null,
      capacity: data.capacity ?? null,
      description: data.description ?? null,
      facilities: data.facilities ?? [],
      isCore: data.isCore ?? false,
    },
  });
}

// perbarui data titik evakuasi
export async function update(id: string, data: UpdateEvacuationPointDto) {
  return prisma.evacuationPoint.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.elevation !== undefined && { elevation: data.elevation }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.facilities !== undefined && { facilities: data.facilities }),
      ...(data.isCore !== undefined && { isCore: data.isCore }),
    },
  });
}

// hapus data titik evakuasi
export async function deleteById(id: string) {
  return prisma.evacuationPoint.delete({
    where: { id },
  });
}
