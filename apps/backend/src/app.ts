import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import type { CorsOptions } from "cors";
import morgan from "morgan";

import { publicRouter, protectedRouter } from "./routes/index.js";
import { healthRouter } from "./routes/health.route.js";
import { generalRateLimiter } from "./middleware/rateLimit.middleware.js";
import { helmetOptions } from "./config/helmet.config.js";
import {
  assertAllowedOriginsConfigured,
  parseAllowedOrigins,
  resolveTrustProxy,
} from "./config/runtimeOptions.js";

const app = express();

/**
 * DEPLOY-01 (FR-A3): Di belakang reverse proxy, req.ip (dipakai rate limiter dan
 * lastLoginIp) baru berisi IP klien bila Express diberi tahu hop mana yang dipercaya.
 * Nilai diambil dari TRUST_PROXY: jumlah hop, atau daftar subnet/preset seperti
 * `loopback, linklocal, uniquelocal` (melewati semua hop ber-IP privat). Tanpa
 * TRUST_PROXY, tidak ada proxy yang dipercaya.
 * JANGAN pakai `true`: entri X-Forwarded-For paling kiri bisa dipalsukan klien,
 * sehingga rate limit per IP bisa dihindari. Tinjau ulang nilainya setiap kali
 * topologi proxy di depan aplikasi berubah.
 */
const trustProxy = resolveTrustProxy(process.env.TRUST_PROXY);
app.set("trust proxy", trustProxy);
console.log(`[Proxy] trust proxy = ${String(trustProxy)}`);

app.use(helmet(helmetOptions));

/**
 * SEC-02 / DEPLOY-01 (FR-A7): CORS dengan whitelist origin dari ALLOWED_ORIGINS,
 * mis. https://sigap.example.com,https://www.sigap.example.com.
 * - Browser tetap mengirim Origin pada request tulis meskipun same-origin, jadi origin
 *   aplikasi wajib terdaftar (startup gagal di production bila kosong).
 * - Origin localhost/127.0.0.1 (port apa pun) hanya diizinkan bila NODE_ENV !== "production".
 */
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
assertAllowedOriginsConfigured(allowedOrigins, isProduction);

const isLocalDevOrigin = (origin: string) => {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (Postman, cURL, server-to-server)
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, "");

    // Di development, izinkan port apa pun pada localhost dan 127.0.0.1
    if (!isProduction && isLocalDevOrigin(cleanOrigin)) {
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

// DEPLOY-01 (FR-A11): format log akses dari LOG_FORMAT; default `combined` di production
// (tanpa warna, cocok untuk log container), `dev` di luar production.
app.use(morgan(process.env.LOG_FORMAT ?? (isProduction ? "combined" : "dev")));

/**
 * SEC-03: Batasi ukuran body JSON/URL-encoded agar tidak bisa di-abuse
 * dengan payload berukuran besar yang menyebabkan DoS di event loop Node.js.
 */
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// DEPLOY-01 (FR-A4): /api/healthz & /api/readyz harus sebelum router /api yang
// memakai rate limiter, agar healthcheck tidak terkena limit atau tertangkap router lain.
app.use("/api", healthRouter);

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
    const errorObj = err as Error & {
      statusCode?: number;
      status?: number;
      errors?: string[];
      type?: string;
    };

    // DEPLOY-01 (FR-A11): body-parser menempelkan raw request body di `err.body`, dan
    // pesan SyntaxError bisa memuat potongan input; keduanya bisa berisi password.
    if (errorObj instanceof SyntaxError && "body" in errorObj) {
      console.error(`[ServerError] Payload JSON tidak valid (${errorObj.type ?? "parse error"}); isi body tidak di-log.`);
    } else {
      console.error("[ServerError]", err);
    }
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

    const errors =
      errorObj.errors && errorObj.errors.length > 0
        ? errorObj.errors
        : [message];

    res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
);

export default app;