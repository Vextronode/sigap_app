import { Router } from "express";
import { EvacuationPointController } from "../controllers/evacuationPoint.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import {
  validateCreateEvacuationPoint,
  validateUpdateEvacuationPoint,
} from "../validators/evacuationPoint.validator.js";

// rute publik titik evakuasi untuk warga & peta interaktif
export const publicEvacuationPointRouter = Router();
publicEvacuationPointRouter.get("/", EvacuationPointController.getAll);
publicEvacuationPointRouter.get("/:id", EvacuationPointController.getById);

// rute terproteksi titik evakuasi untuk staf desa (admin & operator)
export const protectedEvacuationPointRouter = Router();
protectedEvacuationPointRouter.use(authMiddleware);
protectedEvacuationPointRouter.get("/", EvacuationPointController.getAll);
protectedEvacuationPointRouter.get("/:id", EvacuationPointController.getById);

// SEC-05: Mutasi (create/update/delete) memerlukan permission 'content.manage' (Admin & Operator)
protectedEvacuationPointRouter.post(
  "/",
  requirePermission("content.manage"),
  validateCreateEvacuationPoint,
  EvacuationPointController.create
);
protectedEvacuationPointRouter.put(
  "/:id",
  requirePermission("content.manage"),
  validateUpdateEvacuationPoint,
  EvacuationPointController.update
);
protectedEvacuationPointRouter.delete(
  "/:id",
  requirePermission("content.manage"),
  EvacuationPointController.delete
);
