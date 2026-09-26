import { Router } from "express";
import { loginController, meController, logoutController } from "../controllers/auth.controller.js";
import { validateLogin } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { loginRateLimiter } from "../middleware/rateLimit.middleware.js";

export const publicAuthRouter = Router();
publicAuthRouter.post("/login", loginRateLimiter, validateLogin, loginController);

export const protectedAuthRouter = Router();
protectedAuthRouter.get("/me", authMiddleware, meController);
protectedAuthRouter.post("/logout", authMiddleware, logoutController);