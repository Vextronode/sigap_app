import type { Request, Response, NextFunction } from "express";

const PHONE_REGEX = /^[+0-9\s-]{6,25}$/;

function validateContactFields(body: any, isUpdate: boolean = false): Record<string, string> {
  const { institution, phoneNumber, icon } = body ?? {};
  const errors: Record<string, string> = {};

  if (!isUpdate || institution !== undefined) {
    if (!institution || typeof institution !== "string" || institution.trim() === "") {
      errors.institution = isUpdate ? "Nama institusi tidak boleh kosong." : "Nama institusi wajib diisi.";
    } else if (institution.trim().length > 150) {
      errors.institution = "Nama institusi maksimal 150 karakter.";
    }
  }

  if (!isUpdate || phoneNumber !== undefined) {
    if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
      errors.phoneNumber = isUpdate ? "Nomor telepon tidak boleh kosong." : "Nomor telepon wajib diisi.";
    } else if (!PHONE_REGEX.test(phoneNumber.trim())) {
      errors.phoneNumber = "Format nomor telepon tidak valid (6-25 karakter, hanya angka, +, -, spasi).";
    }
  }

  if (icon !== undefined && (typeof icon !== "string" || icon.length > 50)) {
    errors.icon = "Icon harus berupa string nama preset yang valid (maks. 50 karakter).";
  }

  return errors;
}

// validasi input pembuatan kontak darurat
export function validateCreateEmergencyContact(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validateContactFields(req.body, false);

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

  if (institution === undefined && phoneNumber === undefined && icon === undefined) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors: {
        body: "Minimal salah satu data institusi, nomor telepon, atau icon harus diisi.",
      },
    });
  }

  const errors = validateContactFields(req.body, true);

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors,
    });
  }

  next();
}


