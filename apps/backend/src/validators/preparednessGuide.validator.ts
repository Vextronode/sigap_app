import type { Request, Response, NextFunction } from "express";

const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

// validasi input pembuatan panduan kesiapsiagaan baru
export function validateCreatePreparednessGuide(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title, content, externalUrl, sourceType } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!title || typeof title !== "string" || title.trim() === "") {
    errors.title = "Judul panduan kesiapsiagaan wajib diisi.";
  }

  const hasContent = Boolean(
    content && typeof content === "string" && content.trim() !== ""
  );
  const hasExternalUrl = Boolean(
    externalUrl && typeof externalUrl === "string" && externalUrl.trim() !== ""
  );

  if (!hasContent && !hasExternalUrl) {
    errors.content =
      "Minimal salah satu dari konten artikel atau tautan eksternal wajib diisi.";
  }

  if (hasExternalUrl && !URL_REGEX.test(externalUrl.trim())) {
    errors.externalUrl = "Format tautan eksternal tidak valid (harus diawali http:// atau https://).";
  }

  if (
    sourceType !== undefined &&
    sourceType !== "RESMI" &&
    sourceType !== "MITRA"
  ) {
    errors.sourceType = "Tipe sumber panduan harus berupa RESMI atau MITRA.";
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

// validasi input pembaruan panduan kesiapsiagaan
export function validateUpdatePreparednessGuide(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title, externalUrl, sourceType } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim() === "")
  ) {
    errors.title = "Judul panduan tidak boleh kosong.";
  }

  if (
    externalUrl !== undefined &&
    externalUrl !== null &&
    externalUrl.trim() !== "" &&
    !URL_REGEX.test(externalUrl.trim())
  ) {
    errors.externalUrl = "Format tautan eksternal tidak valid (harus diawali http:// atau https://).";
  }

  if (
    sourceType !== undefined &&
    sourceType !== "RESMI" &&
    sourceType !== "MITRA"
  ) {
    errors.sourceType = "Tipe sumber panduan harus berupa RESMI atau MITRA.";
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
