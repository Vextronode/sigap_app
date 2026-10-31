import type { Request, Response } from "express";
import { EvacuationPointService } from "../services/evacuationPoint.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class EvacuationPointController {
  // ambil seluruh titik evakuasi
  static getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await EvacuationPointService.getAll();
    return res.status(200).json({
      success: true,
      message: "Daftar titik evakuasi berhasil diambil.",
      data,
    });
  });

  // ambil detail titik evakuasi berdasarkan id
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await EvacuationPointService.getById(id);
    return res.status(200).json({
      success: true,
      message: "Detail titik evakuasi berhasil diambil.",
      data,
    });
  });

  // buat titik evakuasi baru
  static create = asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      address,
      latitude,
      longitude,
      elevation,
      capacity,
      description,
      facilities,
      isCore,
    } = req.body;

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
  });

  // perbarui titik evakuasi
  static update = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      name,
      address,
      latitude,
      longitude,
      elevation,
      capacity,
      description,
      facilities,
      isCore,
    } = req.body;

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
  });

  // hapus titik evakuasi
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await EvacuationPointService.delete(id);
    return res.status(200).json({
      success: true,
      message: "Titik evakuasi berhasil dihapus.",
    });
  });
}
