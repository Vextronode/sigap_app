import { prisma } from "../config/prisma.js";
import type {
  CreatePreparednessGuideDto,
  UpdatePreparednessGuideDto,
} from "../types/preparednessGuide.types.js";

// ambil seluruh panduan kesiapsiagaan terurut dari yang terbaru
export async function findAll() {
  return prisma.preparednessGuide.findMany({
    orderBy: { publishedAt: "desc" },
  });
}

// cari panduan kesiapsiagaan berdasarkan id
export async function findById(id: string) {
  return prisma.preparednessGuide.findUnique({
    where: { id },
  });
}

// buat entri panduan kesiapsiagaan baru
export async function create(data: CreatePreparednessGuideDto) {
  return prisma.preparednessGuide.create({
    data: {
      title: data.title,
      content: data.content ?? null,
      externalUrl: data.externalUrl ?? null,
      sourceType: data.sourceType ?? "RESMI",
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    },
  });
}

// perbarui data panduan kesiapsiagaan
export async function update(id: string, data: UpdatePreparednessGuideDto) {
  return prisma.preparednessGuide.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.externalUrl !== undefined && { externalUrl: data.externalUrl }),
      ...(data.sourceType !== undefined && { sourceType: data.sourceType }),
      ...(data.publishedAt !== undefined && {
        publishedAt: new Date(data.publishedAt),
      }),
    },
  });
}

// hapus data panduan kesiapsiagaan
export async function deleteById(id: string) {
  return prisma.preparednessGuide.delete({
    where: { id },
  });
}
