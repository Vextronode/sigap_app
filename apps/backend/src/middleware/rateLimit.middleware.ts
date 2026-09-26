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