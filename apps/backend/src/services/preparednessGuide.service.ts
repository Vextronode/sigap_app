import * as preparednessGuideRepo from "../repositories/preparednessGuide.repository.js";
import type {
  CreatePreparednessGuideDto,
  UpdatePreparednessGuideDto,
} from "../types/preparednessGuide.types.js";

interface CustomHttpError extends Error {
  statusCode?: number;
}

export class PreparednessGuideService {
  // ambil seluruh daftar panduan kesiapsiagaan
  static async getAll() {
    return preparednessGuideRepo.findAll();
  }

  // ambil satu panduan kesiapsiagaan berdasarkan id
  static async getById(id: string) {
    const guide = await preparednessGuideRepo.findById(id);
    if (!guide) {
      const error: CustomHttpError = new Error(
        "Panduan kesiapsiagaan tidak ditemukan."
      );
      error.statusCode = 404;
      throw error;
    }
    return guide;
  }

  // buat entri panduan kesiapsiagaan baru
  static async create(data: CreatePreparednessGuideDto) {
    const hasContent = Boolean(data.content && data.content.trim() !== "");
    const hasExternalUrl = Boolean(
      data.externalUrl && data.externalUrl.trim() !== ""
    );

    // validasi batas minimal satu mode input harus terisi
    if (!hasContent && !hasExternalUrl) {
      const error: CustomHttpError = new Error(
        "Minimal salah satu dari konten artikel atau tautan eksternal wajib diisi."
      );
      error.statusCode = 422;
      throw error;
    }

    return preparednessGuideRepo.create({
      title: data.title.trim(),
      content: hasContent ? data.content!.trim() : null,
      externalUrl: hasExternalUrl ? data.externalUrl!.trim() : null,
      sourceType: data.sourceType ?? "RESMI",
      publishedAt: data.publishedAt,
    });
  }

  // perbarui data panduan kesiapsiagaan
  static async update(id: string, data: UpdatePreparednessGuideDto) {
    const existing = await this.getById(id);

    const nextContent =
      data.content !== undefined
        ? (data.content && data.content.trim() !== "" ? data.content.trim() : null)
        : existing.content;

    const nextExternalUrl =
      data.externalUrl !== undefined
        ? (data.externalUrl && data.externalUrl.trim() !== "" ? data.externalUrl.trim() : null)
        : existing.externalUrl;

    // validasi batas gabungan setelah pembaruan tidak boleh kosong dua duanya
    if (!nextContent && !nextExternalUrl) {
      const error: CustomHttpError = new Error(
        "Minimal salah satu dari konten artikel atau tautan eksternal harus tetap terisi."
      );
      error.statusCode = 422;
      throw error;
    }

    return preparednessGuideRepo.update(id, {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.content !== undefined && { content: nextContent }),
      ...(data.externalUrl !== undefined && { externalUrl: nextExternalUrl }),
      ...(data.sourceType !== undefined && { sourceType: data.sourceType }),
      ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt }),
    });
  }

  // hapus entri panduan kesiapsiagaan
  static async delete(id: string) {
    await this.getById(id);
    return preparednessGuideRepo.deleteById(id);
  }
}
