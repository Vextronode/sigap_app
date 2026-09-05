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