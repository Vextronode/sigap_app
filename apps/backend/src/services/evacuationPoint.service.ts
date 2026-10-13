import * as evacuationPointRepo from "../repositories/evacuationPoint.repository.js";
import type {
  CreateEvacuationPointDto,
  UpdateEvacuationPointDto,
} from "../types/evacuationPoint.types.js";

export class EvacuationPointService {
  // ambil seluruh daftar titik evakuasi
  static async getAll() {
    return evacuationPointRepo.findAll();
  }

  // ambil satu titik evakuasi berdasarkan id
  static async getById(id: string) {
    const point = await evacuationPointRepo.findById(id);
    if (!point) {
      const error = new Error("Titik evakuasi tidak ditemukan.");
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }
    return point;
  }

  // buat titik evakuasi baru
  static async create(data: CreateEvacuationPointDto) {
    return evacuationPointRepo.create({
      name: data.name.trim(),
      address: data.address?.trim() || null,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      elevation: data.elevation != null ? Number(data.elevation) : null,
      capacity: data.capacity != null ? Number(data.capacity) : null,
      description: data.description?.trim() || null,
      facilities: Array.isArray(data.facilities) ? data.facilities : [],
      isCore: data.isCore ?? false,
    });
  }

  // perbarui data titik evakuasi
  static async update(id: string, data: UpdateEvacuationPointDto) {
    await this.getById(id);

    const updatePayload: UpdateEvacuationPointDto = {};
    if (data.name !== undefined) {
      updatePayload.name = data.name.trim();
    }
    if (data.address !== undefined) {
      updatePayload.address = data.address ? data.address.trim() : null;
    }
    if (data.latitude !== undefined) {
      updatePayload.latitude = Number(data.latitude);
    }
    if (data.longitude !== undefined) {
      updatePayload.longitude = Number(data.longitude);
    }
    if (data.elevation !== undefined) {
      updatePayload.elevation = data.elevation != null ? Number(data.elevation) : null;
    }
    if (data.capacity !== undefined) {
      updatePayload.capacity = data.capacity != null ? Number(data.capacity) : null;
    }
    if (data.description !== undefined) {
      updatePayload.description = data.description ? data.description.trim() : null;
    }
    if (data.facilities !== undefined) {
      updatePayload.facilities = Array.isArray(data.facilities) ? data.facilities : [];
    }
    if (data.isCore !== undefined) {
      updatePayload.isCore = Boolean(data.isCore);
    }

    return evacuationPointRepo.update(id, updatePayload);
  }

  // hapus titik evakuasi dengan pengamanan titik inti
  static async delete(id: string) {
    const point = await this.getById(id);

    // tolak penghapusan jika merupakan titik evakuasi inti strategis desa
    if (point.isCore) {
      const error = new Error("Titik evakuasi utama/inti tidak dapat dihapus demi keselamatan desa.");
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    return evacuationPointRepo.deleteById(id);
  }
}
