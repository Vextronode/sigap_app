import type { Request, Response } from "express";
import { PreparednessGuideService } from "../services/preparednessGuide.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class PreparednessGuideController {
  // ambil seluruh daftar panduan kesiapsiagaan
  static getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await PreparednessGuideService.getAll();
    return res.status(200).json({
      success: true,
      message: "Daftar panduan kesiapsiagaan berhasil diambil.",
      data,
    });
  });

  // ambil detail satu panduan kesiapsiagaan berdasarkan id
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await PreparednessGuideService.getById(id);
    return res.status(200).json({
      success: true,
      message: "Detail panduan kesiapsiagaan berhasil diambil.",
      data,
    });
  });

  // buat entri panduan kesiapsiagaan baru
  static create = asyncHandler(async (req: Request, res: Response) => {
    const {
      title,
      content,
      externalUrl,
      imageUrl,
      sourceType,
      sourceLabel,
      publishedAt,
    } = req.body;

    const data = await PreparednessGuideService.create({
      title,
      content,
      externalUrl,
      imageUrl,
      sourceType,
      sourceLabel,
      publishedAt,
    });

    return res.status(201).json({
      success: true,
      message: "Panduan kesiapsiagaan berhasil ditambahkan.",
      data,
    });
  });

  // perbarui informasi panduan kesiapsiagaan
  static update = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      title,
      content,
      externalUrl,
      imageUrl,
      sourceType,
      sourceLabel,
      publishedAt,
    } = req.body;

    const data = await PreparednessGuideService.update(id, {
      title,
      content,
      externalUrl,
      imageUrl,
      sourceType,
      sourceLabel,
      publishedAt,
    });

    return res.status(200).json({
      success: true,
      message: "Panduan kesiapsiagaan berhasil diperbarui.",
      data,
    });
  });

  // hapus panduan kesiapsiagaan
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await PreparednessGuideService.delete(id);
    return res.status(200).json({
      success: true,
      message: "Panduan kesiapsiagaan berhasil dihapus.",
    });
  });
}
