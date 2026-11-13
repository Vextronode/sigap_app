import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

/**
 * Rate limiter umum untuk endpoint API (publik & terproteksi).
 * Diberikan batas 300 req/menit per IP untuk mengakomodasi multi-fetching
 * frontend dashboard SIGAP (sekali load ~9 endpoint) terutama saat situasi darurat bencana
 * di mana beberapa warga mengakses dari IP publik/Wi-Fi desa yang sama.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 300, // Maksimal 300 request per menit per IP
  standardHeaders: true, // Mengirim header standard `RateLimit-*`
  legacyHeaders: false, // Menonaktifkan header usang `X-RateLimit-*`
  message: {
    success: false,
    message: "Terlalu banyak permintaan.",
    errors: ["Anda telah melebihi batas permintaan. Silakan coba lagi nanti."],
  },
});

// Alias untuk menjaga kompatibilitas jika masih ada referensi lama
export const generateRateLimiter = generalRateLimiter;

/**
 * TK-07: GET publik yang dilayani dari cache backend (alert terkini, gempa, tsunami,
 * status perangkat). Path relatif terhadap mount `/api/public` atau alias `/api`.
 */
const CACHED_PUBLIC_READ_PATH =
  /^\/(alerts(\/current)?|earthquakes(\/(map|indonesia|latest|west-java(\/history)?|pangandaran(\/history)?))?|tsunamis?(\/status)?|device\/status)\/?$/;

export const isCachedPublicRead = (req: Request): boolean =>
  req.method === "GET" && CACHED_PUBLIC_READ_PATH.test(req.path);

/**
 * TK-07 (ADR-048): batas baca publik untuk 250 warga di belakang satu IP publik
 * (CGNAT atau Wi-Fi desa), sekitar 12 request per warga per menit saat dashboard
 * dibuka bersamaan. Penghitungnya terpisah dari limiter umum.
 */
export const publicReadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan.",
    errors: ["Anda telah melebihi batas permintaan. Silakan coba lagi nanti."],
  },
});

/**
 * Limiter untuk mount publik: request baca ter-cache hanya dihitung limiter baca,
 * request lain dihitung limiter umum (login dan kesehatan sistem tetap ditambah
 * limiter khususnya). `generalRateLimiter` tidak diberi `skip` karena instance yang
 * sama juga menjaga `/api/protected`, yang memiliki path serupa.
 */
export const publicRateLimiter = (req: Request, res: Response, next: NextFunction) =>
  isCachedPublicRead(req)
    ? publicReadRateLimiter(req, res, next)
    : generalRateLimiter(req, res, next);

/**
 * Rate limiter khusus endpoint login untuk mencegah brute-force volumetrik.
 * Berjalan bersamaan dengan mekanisme Account Lockout (5x salah password per akun).
 * - max: 15 percobaan per 15 menit per IP.
 * - skipSuccessfulRequests: true agar login yang berhasil tidak memakan kuota IP.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 15,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan login.",
    errors: [
      "Anda telah melebihi batas percobaan login jaringan. Silakan coba lagi dalam 15 menit.",
    ],
  },
});

/**
 * SEC-10: Rate limiter khusus endpoint system health untuk mencegah flooding DoS
 * terhadap pool koneksi database dan pemblokiran IP oleh Open-Meteo/BMKG.
 * - max: 60 request per 1 menit per IP.
 */
export const healthRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan pemantauan sistem.",
    errors: ["Batas frekuensi pengecekan sistem terlampaui. Silakan coba lagi dalam 1 menit."],
  },
});