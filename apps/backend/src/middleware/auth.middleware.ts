import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util.js";
import { isTokenRevoked } from "../repositories/token.repository.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan.",
      errors: ["Header Authorization Bearer wajib disertakan."],
    });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);

    // Cek apakah token masuk ke blocklist revoked_tokens
    try {
      const revoked = await isTokenRevoked(payload.jti);
      if (revoked) {
        return res.status(401).json({
          success: false,
          message: "Token tidak valid atau kedaluwarsa.",
          errors: ["Sesi ini sudah diakhiri, silahkan login kembali."],
        });
      }
    } catch (dbErr) {
      // Jika terjadi transient network error / timeout ke database saat cek revoked,
      // jangan langsung anggap token 401 Unauthorized (karena signature token sudah valid).
      console.warn("[authMiddleware] Database query isTokenRevoked warning:", dbErr);
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau kedaluwarsa.",
      errors: ["Token tidak valid atau kedaluwarsa."],
    });
  }
}