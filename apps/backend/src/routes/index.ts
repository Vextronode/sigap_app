import { Router } from "express";

import { publicAuthRouter, protectedAuthRouter } from "./auth.route.js";
import { publicWeatherRouter } from "./weather.route.js";
import { publicAlertsRouter } from "./alert.route.js";
import { publicEarthquakesRouter } from "./earthquakes.route.js";
import { publicTsunamiRouter } from "./tsunami.route.js";
import { publicDeviceRouter } from "./device.route.js";
import { publicNotificationRouter, protectedNotificationRouter } from "./notification.route.js";
import { internalRouter } from "./internal.route.js";
import {
  publicEmergencyContactRouter,
  protectedEmergencyContactRouter,
} from "./emergencyContact.route.js";

export const publicRouter = Router();

// Authentication
publicRouter.use("/auth", publicAuthRouter);

// Weather
publicRouter.use("/weather", publicWeatherRouter);

// BMKG
publicRouter.use("/alerts", publicAlertsRouter);
publicRouter.use("/earthquakes", publicEarthquakesRouter);
publicRouter.use("/tsunami", publicTsunamiRouter);
publicRouter.use("/tsunamis", publicTsunamiRouter);

// kontak darurat
publicRouter.use("/emergency-contacts", publicEmergencyContactRouter);

// IoT Device
publicRouter.use("/device", publicDeviceRouter);

// Push Notification
publicRouter.use("/notifications", publicNotificationRouter);

// Internal — trigger untuk cron-job.org (Vercel production)
publicRouter.use("/internal", internalRouter);

export const protectedRouter = Router();
protectedRouter.use("/auth", protectedAuthRouter);
protectedRouter.use("/notifications", protectedNotificationRouter);
protectedRouter.use("/emergency-contacts", protectedEmergencyContactRouter);

