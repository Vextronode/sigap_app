import { Router } from "express";
import { publicAuthRouter, protectedAuthRouter } from "./auth.route.js";

export const publicRouter = Router();
publicRouter.use("/auth", publicAuthRouter);

export const protectedRouter = Router();
protectedRouter.use("/auth", protectedAuthRouter);