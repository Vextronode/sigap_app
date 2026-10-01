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
const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:4173"];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (Postman, cURL, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin '${origin}' tidak diizinkan.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-cron-secret"],
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
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      errors: {},
    });
  }
);

export default app;