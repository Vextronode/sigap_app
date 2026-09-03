import type { Request, Response } from "express";
import { EmergencyContactService } from "../services/emergencyContact.service.js";

interface CustomHttpError extends Error {
  statusCode?: number;
}

export class EmergencyContactController {
  // ambil seluruh kontak darurat
  static async getAll(_req: Request, res: Response) {
    try {
      const data = await EmergencyContactService.getAll();
      return res.status(200).json({
        success: true,
        message: "Daftar kontak darurat berhasil diambil.",
        data,
      });
    } catch (error) {
      console.error("[emergency_contact] gagal mengambil daftar:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil daftar kontak darurat.",
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  // ambil detail kontak darurat berdasarkan id
  static async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await EmergencyContactService.getById(id);
      return res.status(200).json({
        success: true,
        message: "Detail kontak darurat berhasil diambil.",
        data,
      });
    } catch (error) {
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal mengambil detail kontak darurat.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // buat kontak darurat tambahan baru
  static async create(req: Request, res: Response) {
    try {
      const { institution, phoneNumber } = req.body;
      const data = await EmergencyContactService.create({
        institution,
        phoneNumber,
      });
      return res.status(201).json({
        success: true,
        message: "Kontak darurat berhasil ditambahkan.",
        data,
      });
    } catch (error) {
      console.error("[emergency_contact] gagal menambahkan kontak:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal menambahkan kontak darurat.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // perbarui informasi kontak darurat
  static async update(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { institution, phoneNumber } = req.body;
      const data = await EmergencyContactService.update(id, {
        institution,
        phoneNumber,
      });
      return res.status(200).json({
        success: true,
        message: "Kontak darurat berhasil diperbarui.",
        data,
      });
    } catch (error) {
      console.error("[emergency_contact] gagal memperbarui kontak:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal memperbarui kontak darurat.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // hapus kontak darurat non inti
  static async delete(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await EmergencyContactService.delete(id);
      return res.status(200).json({
        success: true,
        message: "Kontak darurat berhasil dihapus.",
      });
    } catch (error) {
      console.error("[emergency_contact] gagal menghapus kontak:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal menghapus kontak darurat.",
        errors: [customError.message || String(error)],
      });
    }
  }
}
