import type { Request, Response, NextFunction } from "express";

// validasi input pembuatan kontak darurat
export function validateCreateEmergencyContact(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { institution, phoneNumber } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!institution || typeof institution !== "string" || institution.trim() === "") {
    errors.institution = "Nama institusi wajib diisi.";
  }

  if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
    errors.phoneNumber = "Nomor telepon wajib diisi.";
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

// validasi input pembaruan kontak darurat
export function validateUpdateEmergencyContact(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { institution, phoneNumber } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (institution === undefined && phoneNumber === undefined) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors: {
        body: "Minimal salah satu data institusi atau nomor telepon harus diisi.",
      },
    });
  }

  if (
    institution !== undefined &&
    (typeof institution !== "string" || institution.trim() === "")
  ) {
    errors.institution = "Nama institusi tidak boleh kosong.";
  }

  if (
    phoneNumber !== undefined &&
    (typeof phoneNumber !== "string" || phoneNumber.trim() === "")
  ) {
    errors.phoneNumber = "Nomor telepon tidak boleh kosong.";
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
