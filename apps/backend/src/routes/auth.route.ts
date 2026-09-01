import { Router } from "express";
import { loginController, meController } from "../controllers/auth.controller.js";
import { validateLogin } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const publicAuthRouter = Router();
publicAuthRouter.post("/login", validateLogin, loginController);

export const protectedAuthRouter = Router();
protectedAuthRouter.get("/me", authMiddleware, meController);