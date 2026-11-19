import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util.js";
import { findSessionState, isTokenRevoked } from "../repositories/token.repository.js";

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

    // Cek blocklist revoked_tokens, keaktifan akun, dan versi token.
    // Token lama tanpa klaim tokenVersion dianggap versi 0.
    try {
      const [revoked, session] = await Promise.all([
        isTokenRevoked(payload.jti),
        findSessionState(payload.sub),
      ]);
      const isSessionValid =
        session !== null &&
        session.isActive &&
        session.tokenVersion === (payload.tokenVersion ?? 0);

      if (revoked || !isSessionValid) {
        return res.status(401).json({
          success: false,
          message: "Token tidak valid atau kedaluwarsa.",
          errors: ["Sesi ini sudah diakhiri, silahkan login kembali."],
        });
      }
    } catch (dbErr) {
      // Jika terjadi transient network error / timeout ke database saat cek sesi,
      // jangan langsung anggap token 401 Unauthorized (karena signature token sudah valid).
      console.warn("[authMiddleware] Database query session check warning:", dbErr);
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