import { Router } from "express";
import { EvacuationPointController } from "../controllers/evacuationPoint.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateCreateEvacuationPoint,
  validateUpdateEvacuationPoint,
} from "../validators/evacuationPoint.validator.js";

// rute publik titik evakuasi untuk warga & peta interaktif
export const publicEvacuationPointRouter = Router();
publicEvacuationPointRouter.get("/", EvacuationPointController.getAll);
publicEvacuationPointRouter.get("/:id", EvacuationPointController.getById);

// rute terproteksi titik evakuasi untuk admin
export const protectedEvacuationPointRouter = Router();
protectedEvacuationPointRouter.use(authMiddleware);
protectedEvacuationPointRouter.get("/", EvacuationPointController.getAll);
protectedEvacuationPointRouter.get("/:id", EvacuationPointController.getById);
protectedEvacuationPointRouter.post(
  "/",
  validateCreateEvacuationPoint,
  EvacuationPointController.create
);
protectedEvacuationPointRouter.put(
  "/:id",
  validateUpdateEvacuationPoint,
  EvacuationPointController.update
);
protectedEvacuationPointRouter.delete(
  "/:id",
  EvacuationPointController.delete
);
