import type { Request, Response } from "express";

import { AlertService } from "../services/alert.service.js";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../types/weather.types.js";
import type {
  AlertFilterQuery,
  AlertListPagination,
  AlertRecord,
} from "../types/alert.types.js";

interface CustomHttpError extends Error {
  statusCode?: number;
}

export class AlertController {
  // ambil alert terkini (public)
  static async getLatest(_req: Request, res: Response) {
    try {
      const data = await AlertService.getCurrentAlert();

      const response: ApiSuccessResponse<AlertRecord | null> = {
        success: true,
        message: data
          ? "Alert terbaru berhasil diambil."
          : "Belum ada alert yang tersedia.",
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("[GET /alerts] error:", error);

      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil alert terbaru.",
        errors: ["Layanan alert sementara tidak tersedia."],
      };
      res.status(502).json(response);
    }
  }

  // ambil seluruh riwayat alert tanpa filter (legacy public)
  static async getHistory(_req: Request, res: Response) {
    try {
      const data = await AlertService.getAllAlerts();

      const response: ApiSuccessResponse<AlertRecord[]> = {
        success: true,
        message: "Riwayat alert berhasil diambil.",
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("[GET /alerts/history] error:", error);

      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil riwayat alert.",
        errors: ["Layanan alert sementara tidak tersedia."],
      };
      res.status(502).json(response);
    }
  }

  // ambil daftar alert terfilter dengan pagination untuk admin / operator (FS-02)
  static async getFiltered(req: Request, res: Response) {
    try {
      const query: AlertFilterQuery = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        severity: req.query.severity as AlertFilterQuery["severity"],
        reviewStatus: req.query.reviewStatus as AlertFilterQuery["reviewStatus"],
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await AlertService.getFilteredAlerts(query);

      return res.status(200).json({
        success: true,
        message: "Daftar riwayat alert berhasil diambil.",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("[GET /alerts/filtered] error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil daftar riwayat alert.",
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  // ambil detail satu entri alert berdasarkan ID (FS-02 AC2)
  static async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await AlertService.getAlertById(id);

      return res.status(200).json({
        success: true,
        message: "Detail alert berhasil diambil.",
        data,
      });
    } catch (error) {
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal mengambil detail alert.",
        errors: [customError.message || String(error)],
      });
    }
  }

  // perbarui status review klasifikasi alert (FS-02 FR3)
  static async review(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const reviewerId = req.user?.sub;

      if (!reviewerId) {
        return res.status(401).json({
          success: false,
          message: "Autentikasi diperlukan.",
          errors: ["Identitas reviewer tidak ditemukan dalam sesi."],
        });
      }

      const updated = await AlertService.reviewAlert(
        id,
        {
          reviewStatus: req.body.reviewStatus,
        },
        reviewerId
      );

      return res.status(200).json({
        success: true,
        message: "Status review alert berhasil diperbarui.",
        data: updated,
      });
    } catch (error) {
      console.error("[PATCH /alerts/:id/review] error:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message:
          customError.message || "Gagal memperbarui status review alert.",
        errors: [customError.message || String(error)],
      });
    }
  }
}

