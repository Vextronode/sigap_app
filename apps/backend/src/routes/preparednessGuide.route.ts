import { Router } from "express";
import { PreparednessGuideController } from "../controllers/preparednessGuide.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateCreatePreparednessGuide,
  validateUpdatePreparednessGuide,
} from "../validators/preparednessGuide.validator.js";

// rute publik panduan kesiapsiagaan untuk warga
export const publicPreparednessGuideRouter = Router();
publicPreparednessGuideRouter.get("/", PreparednessGuideController.getAll);
publicPreparednessGuideRouter.get("/:id", PreparednessGuideController.getById);

// rute terproteksi panduan kesiapsiagaan untuk admin
export const protectedPreparednessGuideRouter = Router();
protectedPreparednessGuideRouter.use(authMiddleware);
protectedPreparednessGuideRouter.get("/", PreparednessGuideController.getAll);
protectedPreparednessGuideRouter.get("/:id", PreparednessGuideController.getById);
protectedPreparednessGuideRouter.post(
  "/",
  validateCreatePreparednessGuide,
  PreparednessGuideController.create
);
protectedPreparednessGuideRouter.put(
  "/:id",
  validateUpdatePreparednessGuide,
  PreparednessGuideController.update
);
protectedPreparednessGuideRouter.delete(
  "/:id",
  PreparednessGuideController.delete
);
