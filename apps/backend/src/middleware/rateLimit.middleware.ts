import rateLimit from "express-rate-limit";

export const generateRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per `window` (here, per minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: "Terlalu banyak permintaan.",
        errors: ["Anda telah melebihi batas permintaan. Silakan coba lagi nanti."],
    }
});

export const aiSummaryRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Terlalu banyak permintaan.",
        errors: ["Rate limit AI summary terlampaui. Silakan coba lagi nanti."],
    },
});

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Terlalu banyak percobaan login.",
        errors: ["Anda telah melebihi batas percobaan login. Silakan coba lagi dalam 15 menit."],
    },
});