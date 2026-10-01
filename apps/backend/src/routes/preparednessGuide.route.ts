import { Router } from "express";
import { PreparednessGuideController } from "../controllers/preparednessGuide.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import {
  validateCreatePreparednessGuide,
  validateUpdatePreparednessGuide,
} from "../validators/preparednessGuide.validator.js";

// rute publik panduan kesiapsiagaan untuk warga
export const publicPreparednessGuideRouter = Router();
publicPreparednessGuideRouter.get("/", PreparednessGuideController.getAll);
publicPreparednessGuideRouter.get("/:id", PreparednessGuideController.getById);

// rute terproteksi panduan kesiapsiagaan untuk staf desa (admin & operator)
export const protectedPreparednessGuideRouter = Router();
protectedPreparednessGuideRouter.use(authMiddleware);
protectedPreparednessGuideRouter.get("/", PreparednessGuideController.getAll);
protectedPreparednessGuideRouter.get("/:id", PreparednessGuideController.getById);

// SEC-05: Mutasi (create/update/delete) memerlukan permission 'content.manage' (Admin & Operator)
protectedPreparednessGuideRouter.post(
  "/",
  requirePermission("content.manage"),
  validateCreatePreparednessGuide,
  PreparednessGuideController.create
);
protectedPreparednessGuideRouter.put(
  "/:id",
  requirePermission("content.manage"),
  validateUpdatePreparednessGuide,
  PreparednessGuideController.update
);
protectedPreparednessGuideRouter.delete(
  "/:id",
  requirePermission("content.manage"),
  PreparednessGuideController.delete
);
