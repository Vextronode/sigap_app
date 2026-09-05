import { Router } from "express";
import { SystemHealthController } from "../controllers/systemHealth.controller.js";

export const systemHealthRouter = Router();

// endpoint monitoring status konektivitas sistem
systemHealthRouter.get("/", SystemHealthController.getHealth);
