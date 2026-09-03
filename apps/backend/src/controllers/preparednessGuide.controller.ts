import type { Request, Response } from "express";
import { PreparednessGuideService } from "../services/preparednessGuide.service.js";

interface CustomHttpError extends Error {
  statusCode?: number;
}

export class PreparednessGuideController {
  // ambil seluruh daftar panduan kesiapsiagaan
  static async getAll(_req: Request, res: Response) {
    try {
      const data = await PreparednessGuideService.getAll();
      return res.status(200).json({
        success: true,
        message: "Daftar panduan kesiapsiagaan berhasil diambil.",
        data,
      });
    } catch (error) {
      console.error("[preparedness_guide] gagal mengambil daftar:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil daftar panduan kesiapsiagaan.",
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  // ambil detail satu panduan kesiapsiagaan berdasarkan id
  static async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await PreparednessGuideService.getById(id);
      return res.status(200).json({
        success: true,
        message: "Detail panduan kesiapsiagaan berhasil diambil.",
        data,
      });
    } catch (error) {
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message:
          customError.message ||
          "Gagal mengambil detail panduan kesiapsiagaan.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // buat entri panduan kesiapsiagaan baru
  static async create(req: Request, res: Response) {
    try {
      const { title, content, externalUrl, sourceType, publishedAt } = req.body;
      const data = await PreparednessGuideService.create({
        title,
        content,
        externalUrl,
        sourceType,
        publishedAt,
      });
      return res.status(201).json({
        success: true,
        message: "Panduan kesiapsiagaan berhasil ditambahkan.",
        data,
      });
    } catch (error) {
      console.error("[preparedness_guide] gagal menambahkan panduan:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message:
          customError.message || "Gagal menambahkan panduan kesiapsiagaan.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // perbarui informasi panduan kesiapsiagaan
  static async update(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { title, content, externalUrl, sourceType, publishedAt } = req.body;
      const data = await PreparednessGuideService.update(id, {
        title,
        content,
        externalUrl,
        sourceType,
        publishedAt,
      });
      return res.status(200).json({
        success: true,
        message: "Panduan kesiapsiagaan berhasil diperbarui.",
        data,
      });
    } catch (error) {
      console.error("[preparedness_guide] gagal memperbarui panduan:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message:
          customError.message || "Gagal memperbarui panduan kesiapsiagaan.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // hapus panduan kesiapsiagaan
  static async delete(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await PreparednessGuideService.delete(id);
      return res.status(200).json({
        success: true,
        message: "Panduan kesiapsiagaan berhasil dihapus.",
      });
    } catch (error) {
      console.error("[preparedness_guide] gagal menghapus panduan:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message:
          customError.message || "Gagal menghapus panduan kesiapsiagaan.",
        errors: [customError.message || String(error)],
      });
    }
  }
}
