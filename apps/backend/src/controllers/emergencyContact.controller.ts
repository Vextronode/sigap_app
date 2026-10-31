import type { Request, Response } from "express";
import { EmergencyContactService } from "../services/emergencyContact.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class EmergencyContactController {
  // ambil seluruh kontak darurat
  static getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await EmergencyContactService.getAll();
    return res.status(200).json({
      success: true,
      message: "Daftar kontak darurat berhasil diambil.",
      data,
    });
  });

  // ambil detail kontak darurat berdasarkan id
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await EmergencyContactService.getById(id);
    return res.status(200).json({
      success: true,
      message: "Detail kontak darurat berhasil diambil.",
      data,
    });
  });

  // buat kontak darurat tambahan baru
  static create = asyncHandler(async (req: Request, res: Response) => {
    const { institution, phoneNumber, icon } = req.body;
    const data = await EmergencyContactService.create({
      institution,
      phoneNumber,
      icon,
    });
    return res.status(201).json({
      success: true,
      message: "Kontak darurat berhasil ditambahkan.",
      data,
    });
  });

  // perbarui informasi kontak darurat
  static update = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { institution, phoneNumber, icon } = req.body;
    const data = await EmergencyContactService.update(id, {
      institution,
      phoneNumber,
      icon,
    });
    return res.status(200).json({
      success: true,
      message: "Kontak darurat berhasil diperbarui.",
      data,
    });
  });

  // hapus kontak darurat non inti
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await EmergencyContactService.delete(id);
    return res.status(200).json({
      success: true,
      message: "Kontak darurat berhasil dihapus.",
    });
  });
}
