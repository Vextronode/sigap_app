import { Request, Response, NextFunction } from "express";

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!email || typeof email !== "string") {
    errors.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Format email tidak valid.";
  }

  if (!password || typeof password !== "string") {
    errors.password = "Password wajib diisi.";
  } else if (password.length < 6) {
    errors.password = "Password minimal 6 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors: Object.entries(errors).map(([field, error]) => `${field}: ${error}`),
    });
  }

  next();
}

export function validateChangePassword(req: Request, res: Response, next: NextFunction) {
  const { currentPassword, newPassword } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!currentPassword || typeof currentPassword !== "string") {
    errors.currentPassword = "Password saat ini wajib diisi.";
  }

  if (!newPassword || typeof newPassword !== "string") {
    errors.newPassword = "Password baru wajib diisi.";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password baru minimal 8 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    const firstErrorMessage = Object.values(errors)[0] || "Validasi gagal.";
    return res.status(422).json({
      success: false,
      message: firstErrorMessage,
      errors: Object.entries(errors).map(([field, error]) => `${field}: ${error}`),
    });
  }

  next();
}