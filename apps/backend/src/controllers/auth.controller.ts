import { Request, Response } from "express";
import { login, AuthenticationError, AccountLockedError } from "../services/auth.service.js";
import { revokeToken } from "../repositories/token.repository.js";

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        message: error.message,
        errors: ["Kredensial login tidak valid."],
      });
    }

    const customErr = error as Error & { statusCode?: number };
    const statusCode = customErr.statusCode || 500;
    const message = customErr.message || "Terjadi kesalahan pada server.";

    console.error("Login error:", error);
    return res.status(statusCode).json({
      success: false,
      message,
      errors: [message],
    });
  }
}

export async function meController(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    message: "Profil berhasil diambil.",
    data: { user: req.user },
  });
}

export async function logoutController(req: Request, res: Response) {
  const { jti, sub, exp } = req.user!;
  const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 1 hour if exp is not set

  await revokeToken(jti, sub, expiresAt);

  return res.status(200).json({
    success: true,
    message: "Logout berhasil.",
    data: {},
  });
}