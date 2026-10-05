import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import type { CorsOptions } from "cors";
import morgan from "morgan";

import { publicRouter, protectedRouter } from "./routes/index.js";
import { generalRateLimiter } from "./middleware/rateLimit.middleware.js";

const app = express();

app.use(helmet());

/**
 * SEC-02: CORS dikonfigurasi dengan whitelist origin dari environment variable.
 * Set ALLOWED_ORIGINS di Vercel env: https://sigap.example.com,https://www.sigap.example.com
 */
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim().replace(/\/+$/, ""))
  : [];
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
];
const allowedOrigins: string[] = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const isLocalDevOrigin = (origin: string) => {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (Postman, cURL, server-to-server)
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, "");

    // Di development, izinkan port apa pun pada localhost dan 127.0.0.1
    if (process.env.NODE_ENV !== "production" && isLocalDevOrigin(cleanOrigin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    const corsError = new Error(`CORS: Origin '${origin}' tidak diizinkan oleh kebijakan server.`);
    (corsError as Error & { statusCode?: number }).statusCode = 403;
    return callback(corsError);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-cron-secret", "x-device-token"],
};

app.use(cors(corsOptions));

app.use(morgan("dev"));

/**
 * SEC-03: Batasi ukuran body JSON/URL-encoded agar tidak bisa di-abuse
 * dengan payload berukuran besar yang menyebabkan DoS di event loop Node.js.
 */
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api/public", generalRateLimiter, publicRouter);
app.use("/api/protected", generalRateLimiter, protectedRouter);
// Alias agar endpoint publik juga dapat diakses langsung via /api/... di Postman
app.use("/api", generalRateLimiter, publicRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan.",
    errors: {},
  });
});

/* Global Error Handler */
app.use(
  (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("[ServerError]", err);

    const errorObj = err as Error & { statusCode?: number; status?: number };
    const statusCode = errorObj.statusCode || errorObj.status || 500;

    // Khusus penolakan CORS
    if (errorObj.message?.includes("CORS")) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak oleh kebijakan keamanan browser (CORS).",
        errors: [errorObj.message],
      });
    }

    // Khusus sintaks JSON rusak dari body parser
    if (errorObj instanceof SyntaxError && "body" in errorObj) {
      return res.status(400).json({
        success: false,
        message: "Format payload JSON tidak valid.",
        errors: ["Request body mengandung sintaks JSON yang rusak."],
      });
    }

    const isDev = process.env.NODE_ENV !== "production";
    const message = isDev || statusCode < 500
      ? (errorObj.message || "Terjadi kesalahan pada server.")
      : "Terjadi kesalahan pada server.";

    res.status(statusCode).json({
      success: false,
      message,
      errors: [message],
    });
  }
);

export default app;