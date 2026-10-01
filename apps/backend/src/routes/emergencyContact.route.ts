import { Router } from "express";
import { EmergencyContactController } from "../controllers/emergencyContact.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import {
  validateCreateEmergencyContact,
  validateUpdateEmergencyContact,
} from "../validators/emergencyContact.validator.js";

// rute publik kontak darurat untuk warga
export const publicEmergencyContactRouter = Router();
publicEmergencyContactRouter.get("/", EmergencyContactController.getAll);
publicEmergencyContactRouter.get("/:id", EmergencyContactController.getById);

// rute terproteksi kontak darurat untuk staf desa (admin & operator)
export const protectedEmergencyContactRouter = Router();
protectedEmergencyContactRouter.use(authMiddleware);
protectedEmergencyContactRouter.get("/", EmergencyContactController.getAll);
protectedEmergencyContactRouter.get("/:id", EmergencyContactController.getById);

// SEC-05: Mutasi (create/update/delete) memerlukan permission 'content.manage' (Admin & Operator)
protectedEmergencyContactRouter.post(
  "/",
  requirePermission("content.manage"),
  validateCreateEmergencyContact,
  EmergencyContactController.create
);
protectedEmergencyContactRouter.put(
  "/:id",
  requirePermission("content.manage"),
  validateUpdateEmergencyContact,
  EmergencyContactController.update
);
protectedEmergencyContactRouter.delete(
  "/:id",
  requirePermission("content.manage"),
  EmergencyContactController.delete
);
