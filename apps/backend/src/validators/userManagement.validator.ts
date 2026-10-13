import type { Request, Response, NextFunction } from "express";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCreateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, email, password, role } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.name = "Nama lengkap wajib diisi minimal 2 karakter.";
  } else if (name.trim().length > 100) {
    errors.name = "Nama lengkap maksimal 100 karakter.";
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    errors.email = "Format email tidak valid.";
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    errors.password = "Password wajib diisi minimal 8 karakter.";
  }

  if (!role || typeof role !== "string" || !["admin", "operator"].includes(role.toLowerCase().trim())) {
    errors.role = "Peran wajib dipilih antara 'admin' atau 'operator'.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi data pengguna gagal.",
      errors,
    });
  }

  next();
}

export function validateUpdateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, role, isActive } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (name === undefined && role === undefined && isActive === undefined) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors: {
        body: "Minimal salah satu data nama, peran, atau status aktif harus dikirimkan.",
      },
    });
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Nama lengkap minimal 2 karakter.";
    } else if (name.trim().length > 100) {
      errors.name = "Nama lengkap maksimal 100 karakter.";
    }
  }

  if (role !== undefined) {
    if (typeof role !== "string" || !["admin", "operator"].includes(role.toLowerCase().trim())) {
      errors.role = "Peran tidak valid. Pilih antara 'admin' atau 'operator'.";
    }
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.isActive = "Status aktif harus berupa boolean (true/false).";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi data pembaruan gagal.",
      errors,
    });
  }

  next();
}

export function validateResetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { newPassword } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    errors.newPassword = "Password baru wajib diisi minimal 8 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi reset password gagal.",
      errors,
    });
  }

  next();
}
