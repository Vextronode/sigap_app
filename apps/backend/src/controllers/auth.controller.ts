import { Request, Response } from "express";
import { login, AuthenticationError } from "../services/auth.service.js";

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
        errors: {},
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      errors: {},
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