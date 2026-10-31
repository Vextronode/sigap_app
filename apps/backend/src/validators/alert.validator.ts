import type { Request, Response, NextFunction } from "express";
import { AlertLevel } from "../../generated/prisma/enums.js";
import {
  LABEL_TO_REVIEW_STATUS,
  LABEL_TO_SEVERITY,
} from "../repositories/alert.repository.js";

const VALID_REVIEW_ACTIONS = ["Dikonfirmasi", "Ditolak", "Ditindaklanjuti"];
const VALID_SEVERITIES = [
  AlertLevel.GREEN,
  AlertLevel.YELLOW,
  AlertLevel.ORANGE,
  AlertLevel.RED,
];

// validasi payload body untuk endpoint PATCH /api/protected/alerts/:id/review
export function validateReviewAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { reviewStatus } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!reviewStatus || typeof reviewStatus !== "string" || reviewStatus.trim() === "") {
    errors.reviewStatus = "Status tinjauan alert wajib diisi.";
  } else {
    const trimmed = reviewStatus.trim();
    if (
      trimmed === "Belum Diverifikasi" ||
      trimmed === "Belum Ditinjau" ||
      trimmed === "BELUM_DITINJAU"
    ) {
      errors.reviewStatus =
        "Status 'Belum Diverifikasi' tidak dapat dipilih secara manual. Pilih antara Dikonfirmasi, Ditolak, atau Ditindaklanjuti.";
    } else if (!VALID_REVIEW_ACTIONS.includes(trimmed) && !["DIKONFIRMASI", "DITOLAK", "DITINDAKLANJUTI"].includes(trimmed)) {
      errors.reviewStatus =
        "Status tinjauan tidak valid. Nilai yang diperbolehkan: Dikonfirmasi, Ditolak, atau Ditindaklanjuti.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors,
    });
  }

  next();
}

// validasi query parameter untuk endpoint GET /api/protected/alerts
export function validateAlertFilterQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { page, limit, severity, reviewStatus, startDate, endDate } = req.query;
  const errors: Record<string, string> = {};

  if (page !== undefined) {
    const parsedPage = Number(page);
    if (isNaN(parsedPage) || parsedPage < 1 || !Number.isInteger(parsedPage)) {
      errors.page = "Parameter page harus berupa bilangan bulat positif (minimal 1).";
    }
  }

  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100 || !Number.isInteger(parsedLimit)) {
      errors.limit = "Parameter limit harus berupa bilangan bulat antara 1 hingga 100.";
    }
  }

  if (severity !== undefined) {
    const severityStr = String(severity).trim();
    const mapped =
      LABEL_TO_SEVERITY[severityStr] ??
      LABEL_TO_SEVERITY[severityStr.toUpperCase()];

    if (!mapped) {
      errors.severity =
        "Nilai severity tidak valid. Nilai yang diperbolehkan: Aman (GREEN), Waspada (YELLOW), Siaga (ORANGE), Awas (RED).";
    } else {
      req.query.severity = mapped;
    }
  }

  if (reviewStatus !== undefined) {
    const statusStr = String(reviewStatus).trim();
    if (!LABEL_TO_REVIEW_STATUS[statusStr]) {
      errors.reviewStatus =
        "Nilai reviewStatus tidak valid. Nilai yang diperbolehkan: 'Belum Diverifikasi', 'Belum Ditinjau', 'Dikonfirmasi', 'Ditolak', atau 'Ditindaklanjuti'.";
    }
  }

  if (startDate !== undefined) {
    const dateParsed = Date.parse(String(startDate));
    if (isNaN(dateParsed)) {
      errors.startDate =
        "Format startDate tidak valid. Gunakan format ISO date (contoh: 2026-09-01).";
    }
  }

  if (endDate !== undefined) {
    const dateParsed = Date.parse(String(endDate));
    if (isNaN(dateParsed)) {
      errors.endDate =
        "Format endDate tidak valid. Gunakan format ISO date (contoh: 2026-09-30).";
    }
  }

  if (startDate !== undefined && endDate !== undefined && !errors.startDate && !errors.endDate) {
    if (new Date(String(startDate)) > new Date(String(endDate))) {
      errors.dateRange = "startDate tidak boleh lebih besar dari endDate.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi parameter filter gagal.",
      errors,
    });
  }

  next();
}
