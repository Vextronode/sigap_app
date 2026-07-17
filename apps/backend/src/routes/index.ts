import { Router } from "express";

import { publicAuthRouter, protectedAuthRouter } from "./auth.route.js";
import { publicWeatherRouter } from "./weather.route.js";
import { publicAlertsRouter } from "./alert.route.js";
import { publicEarthquakesRouter } from "./earthquakes.route.js";
import { publicDeviceRouter } from "./device.route.js";

export const publicRouter = Router();

// Authentication
publicRouter.use("/auth", publicAuthRouter);

// BMKG
publicRouter.use("/weather", publicWeatherRouter);
publicRouter.use("/alerts", publicAlertsRouter);
publicRouter.use("/earthquakes", publicEarthquakesRouter);

// IoT Device
publicRouter.use("/device", publicDeviceRouter);

export const protectedRouter = Router();

// Authentication (Protected)
protectedRouter.use("/auth", protectedAuthRouter);