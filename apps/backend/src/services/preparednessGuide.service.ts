import * as preparednessGuideRepo from "../repositories/preparednessGuide.repository.js";
import {
  NotFoundError,
  BadRequestError,
  ValidationError,
} from "../errors/AppError.js";
import type {
  CreatePreparednessGuideDto,
  UpdatePreparednessGuideDto,
} from "../types/preparednessGuide.types.js";

export class PreparednessGuideService {
  // ambil seluruh daftar panduan kesiapsiagaan
  static async getAll() {
    return preparednessGuideRepo.findAll();
  }

  // ambil satu panduan kesiapsiagaan berdasarkan id
  static async getById(id: string) {
    const guide = await preparednessGuideRepo.findById(id);
    if (!guide) {
      throw new NotFoundError("Panduan kesiapsiagaan tidak ditemukan.");
    }
    return guide;
  }

  // buat entri panduan kesiapsiagaan baru
  static async create(data: CreatePreparednessGuideDto) {
    const totalCount = await preparednessGuideRepo.count();
    if (totalCount >= 5) {
      throw new BadRequestError(
        "Kapasitas maksimal 5 panduan kesiapsiagaan telah tercapai. Hapus salah satu panduan untuk menambahkan yang baru."
      );
    }

    const hasContent = Boolean(data.content && data.content.trim() !== "");
    const hasExternalUrl = Boolean(
      data.externalUrl && data.externalUrl.trim() !== ""
    );

    // validasi batas minimal satu mode input harus terisi
    if (!hasContent && !hasExternalUrl) {
      throw new ValidationError(
        "Minimal salah satu dari konten artikel atau tautan eksternal wajib diisi."
      );
    }

    return preparednessGuideRepo.create({
      title: data.title.trim(),
      content: hasContent ? data.content!.trim() : null,
      externalUrl: hasExternalUrl ? data.externalUrl!.trim() : null,
      imageUrl: data.imageUrl ?? null,
      sourceType: data.sourceType ?? "RESMI",
      sourceLabel: data.sourceLabel ? data.sourceLabel.trim() : "Pemerintah Desa Cibenda",
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

    const nextImageUrl =
      data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl;

    const nextSourceLabel =
      data.sourceLabel !== undefined
        ? (data.sourceLabel && data.sourceLabel.trim() !== "" ? data.sourceLabel.trim() : "Pemerintah Desa Cibenda")
        : existing.sourceLabel;

    // validasi batas gabungan setelah pembaruan tidak boleh kosong dua duanya
    if (!nextContent && !nextExternalUrl) {
      throw new ValidationError(
        "Minimal salah satu dari konten artikel atau tautan eksternal harus tetap terisi."
      );
    }

    return preparednessGuideRepo.update(id, {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.content !== undefined && { content: nextContent }),
      ...(data.externalUrl !== undefined && { externalUrl: nextExternalUrl }),
      ...(data.imageUrl !== undefined && { imageUrl: nextImageUrl }),
      ...(data.sourceType !== undefined && { sourceType: data.sourceType }),
      ...(data.sourceLabel !== undefined && { sourceLabel: nextSourceLabel }),
      ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt }),
    });
  }

  // hapus entri panduan kesiapsiagaan
  static async delete(id: string) {
    await this.getById(id);
    return preparednessGuideRepo.deleteById(id);
  }
}
