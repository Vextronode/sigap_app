import { Router } from "express";
import { SystemHealthController } from "../controllers/systemHealth.controller.js";
import { healthRateLimiter } from "../middleware/rateLimit.middleware.js";

export const systemHealthRouter = Router();

// SEC-10: Rate limiting 60 req/menit per IP untuk mencegah DoS exhaustion
systemHealthRouter.get("/", healthRateLimiter, SystemHealthController.getHealth);

