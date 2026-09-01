import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan.",
      errors: {},
    });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau kedaluwarsa.",
      errors: {},
    });
  }
}