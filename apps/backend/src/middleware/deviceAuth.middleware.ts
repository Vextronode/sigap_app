import { Request, Response, NextFunction } from "express";
import { timingSafeEqual, createHash } from "crypto";

/**
 * SEC-07: Middleware autentikasi perangkat IoT ESP32.
 *
 * ESP32 wajib menyertakan header `x-device-token` yang berisi nilai
 * yang sama dengan environment variable `DEVICE_SHARED_KEY`.
 *
 * Cara generate key yang aman:
 *   openssl rand -hex 32
 *
 * Set di backend .env:
 *   DEVICE_SHARED_KEY=nilai-hex-random-32-bytes
 *
 * Set di firmware ESP32 (Arduino):
 *   const char* DEVICE_TOKEN = "nilai-yang-sama";
 *   http.addHeader("x-device-token", DEVICE_TOKEN);
 */
const DEVICE_SHARED_KEY = process.env.DEVICE_SHARED_KEY;

if (!DEVICE_SHARED_KEY && process.env.NODE_ENV === "production") {
  console.error("[SECURITY] ⚠️  DEVICE_SHARED_KEY tidak terdefinisi di environment production!");
}

function safeTokenCompare(provided: string, expected: string): boolean {
  try {
    const a = createHash("sha256").update(provided).digest();
    const b = createHash("sha256").update(expected).digest();
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function deviceAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Jika DEVICE_SHARED_KEY belum dikonfigurasi, izinkan sementara di dev
  // tapi catat peringatan agar tidak lupa diset di production
  if (!DEVICE_SHARED_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[DEVICE AUTH] ⚠️  DEVICE_SHARED_KEY tidak diset — endpoint IoT terbuka (dev mode).");
      next();
      return;
    }
    // Production tanpa key: tolak semua request perangkat
    res.status(503).json({
      success: false,
      message: "Service Unavailable",
      errors: ["Konfigurasi autentikasi perangkat belum disiapkan."],
    });
    return;
  }

  const providedToken = req.headers["x-device-token"];

  if (!providedToken || typeof providedToken !== "string") {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: ["Header x-device-token wajib disertakan oleh perangkat IoT."],
    });
    return;
  }

  if (!safeTokenCompare(providedToken, DEVICE_SHARED_KEY)) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: ["Token perangkat tidak valid."],
    });
    return;
  }

  next();
}
