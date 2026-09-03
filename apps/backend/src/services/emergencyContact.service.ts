import * as emergencyContactRepo from "../repositories/emergencyContact.repository.js";
import type {
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
} from "../types/emergencyContact.types.js";

export class EmergencyContactService {
  // ambil seluruh daftar kontak darurat
  static async getAll() {
    return emergencyContactRepo.findAll();
  }

  // ambil satu kontak darurat berdasarkan id
  static async getById(id: string) {
    const contact = await emergencyContactRepo.findById(id);
    if (!contact) {
      const error = new Error("Kontak darurat tidak ditemukan.");
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }
    return contact;
  }

  // buat kontak darurat tambahan non inti
  static async create(data: CreateEmergencyContactDto) {
    return emergencyContactRepo.create({
      institution: data.institution.trim(),
      phoneNumber: data.phoneNumber.trim(),
      isCore: false,
    });
  }

  // perbarui institusi atau nomor kontak darurat
  static async update(id: string, data: UpdateEmergencyContactDto) {
    await this.getById(id);

    const updatePayload: UpdateEmergencyContactDto = {};
    if (data.institution !== undefined) {
      updatePayload.institution = data.institution.trim();
    }
    if (data.phoneNumber !== undefined) {
      updatePayload.phoneNumber = data.phoneNumber.trim();
    }

    return emergencyContactRepo.update(id, updatePayload);
  }

  // hapus kontak darurat dengan pengamanan kontak inti
  static async delete(id: string) {
    const contact = await this.getById(id);

    // tolak penghapusan jika kontak berstatus kontak inti
    if (contact.isCore) {
      const error = new Error("Kontak darurat inti tidak dapat dihapus.");
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    return emergencyContactRepo.deleteById(id);
  }
}
