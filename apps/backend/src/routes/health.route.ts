import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";

export const healthRouter = Router();

// DEPLOY-01 (FR-A4): sengaja tanpa rate limiter; didaftarkan di app.ts sebelum router /api.
healthRouter.get("/healthz", HealthController.liveness);
healthRouter.get("/readyz", HealthController.readiness);
