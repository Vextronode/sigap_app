import type { Request, Response, NextFunction } from "express";

// validasi input pembuatan kontak darurat
export function validateCreateEmergencyContact(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { institution, phoneNumber, icon } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!institution || typeof institution !== "string" || institution.trim() === "") {
    errors.institution = "Nama institusi wajib diisi.";
  } else if (institution.trim().length > 150) {
    errors.institution = "Nama institusi maksimal 150 karakter.";
  }

  const phoneRegex = /^[+0-9\s-]{6,25}$/;
  if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
    errors.phoneNumber = "Nomor telepon wajib diisi.";
  } else if (!phoneRegex.test(phoneNumber.trim())) {
    errors.phoneNumber = "Format nomor telepon tidak valid (6-25 karakter, hanya angka, +, -, spasi).";
  }

  if (icon !== undefined && (typeof icon !== "string" || icon.length > 50)) {
    errors.icon = "Icon harus berupa string nama preset yang valid (maks. 50 karakter).";
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
  const { institution, phoneNumber, icon } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (institution === undefined && phoneNumber === undefined && icon === undefined) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors: {
        body: "Minimal salah satu data institusi, nomor telepon, atau icon harus diisi.",
      },
    });
  }

  if (institution !== undefined) {
    if (typeof institution !== "string" || institution.trim() === "") {
      errors.institution = "Nama institusi tidak boleh kosong.";
    } else if (institution.trim().length > 150) {
      errors.institution = "Nama institusi maksimal 150 karakter.";
    }
  }

  if (phoneNumber !== undefined) {
    const phoneRegex = /^[+0-9\s-]{6,25}$/;
    if (typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
      errors.phoneNumber = "Nomor telepon tidak boleh kosong.";
    } else if (!phoneRegex.test(phoneNumber.trim())) {
      errors.phoneNumber = "Format nomor telepon tidak valid (6-25 karakter, hanya angka, +, -, spasi).";
    }
  }

  if (icon !== undefined && (typeof icon !== "string" || icon.length > 50)) {
    errors.icon = "Icon harus berupa string nama preset yang valid (maks. 50 karakter).";
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

