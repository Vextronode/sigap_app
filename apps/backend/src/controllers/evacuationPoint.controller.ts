import type { Request, Response } from "express";
import { EvacuationPointService } from "../services/evacuationPoint.service.js";

interface CustomHttpError extends Error {
  statusCode?: number;
}

export class EvacuationPointController {
  // ambil seluruh titik evakuasi
  static async getAll(_req: Request, res: Response) {
    try {
      const data = await EvacuationPointService.getAll();
      return res.status(200).json({
        success: true,
        message: "Daftar titik evakuasi berhasil diambil.",
        data,
      });
    } catch (error) {
      console.error("[evacuation_point] gagal mengambil daftar:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil daftar titik evakuasi.",
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  // ambil detail titik evakuasi berdasarkan id
  static async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await EvacuationPointService.getById(id);
      return res.status(200).json({
        success: true,
        message: "Detail titik evakuasi berhasil diambil.",
        data,
      });
    } catch (error) {
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal mengambil detail titik evakuasi.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // buat titik evakuasi baru
  static async create(req: Request, res: Response) {
    try {
      const { name, address, latitude, longitude, elevation, capacity, description, facilities, isCore } = req.body;
      const data = await EvacuationPointService.create({
        name,
        address,
        latitude,
        longitude,
        elevation,
        capacity,
        description,
        facilities,
        isCore,
      });
      return res.status(201).json({
        success: true,
        message: "Titik evakuasi berhasil ditambahkan.",
        data,
      });
    } catch (error) {
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      console.error("[evacuation_point] gagal membuat entri:", error);
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal membuat titik evakuasi.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // perbarui titik evakuasi
  static async update(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { name, address, latitude, longitude, elevation, capacity, description, facilities, isCore } = req.body;

      const data = await EvacuationPointService.update(id, {
        name,
        address,
        latitude,
        longitude,
        elevation,
        capacity,
        description,
        facilities,
        isCore,
      });

      return res.status(200).json({
        success: true,
        message: "Titik evakuasi berhasil diperbarui.",
        data,
      });
    } catch (error) {
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      console.error("[evacuation_point] gagal memperbarui entri:", error);
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal memperbarui titik evakuasi.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // hapus titik evakuasi
  static async delete(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await EvacuationPointService.delete(id);
      return res.status(200).json({
        success: true,
        message: "Titik evakuasi berhasil dihapus.",
      });
    } catch (error) {
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      console.error("[evacuation_point] gagal menghapus entri:", error);
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal menghapus titik evakuasi.",
        errors: [customError.message || String(error)],
      });
    }
  }
}
