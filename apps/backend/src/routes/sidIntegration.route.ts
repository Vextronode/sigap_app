import { Router } from "express";
import { SidIntegrationController } from "../controllers/sidIntegration.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const protectedSidIntegrationRouter = Router();

// Endpoint diagnostik admin dilindungi autentikasi
protectedSidIntegrationRouter.use(authMiddleware);
protectedSidIntegrationRouter.get("/status", SidIntegrationController.getStatus);
protectedSidIntegrationRouter.post("/ping", SidIntegrationController.testPing);
