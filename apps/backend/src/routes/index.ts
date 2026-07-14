import { Router } from "express";
import { publicAuthRouter, protectedAuthRouter } from "./auth.route.js";
import { publicWeatherRouter } from "./weather.route.js";

export const publicRouter = Router();
publicRouter.use("/auth", publicAuthRouter);
publicRouter.use("/weather", publicWeatherRouter);

export const protectedRouter = Router();
protectedRouter.use("/auth", protectedAuthRouter);
