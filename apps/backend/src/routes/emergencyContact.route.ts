import { Router } from "express";
import { EmergencyContactController } from "../controllers/emergencyContact.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateCreateEmergencyContact,
  validateUpdateEmergencyContact,
} from "../validators/emergencyContact.validator.js";

// rute publik kontak darurat untuk warga
export const publicEmergencyContactRouter = Router();
publicEmergencyContactRouter.get("/", EmergencyContactController.getAll);
publicEmergencyContactRouter.get("/:id", EmergencyContactController.getById);

// rute terproteksi kontak darurat untuk admin
export const protectedEmergencyContactRouter = Router();
protectedEmergencyContactRouter.use(authMiddleware);
protectedEmergencyContactRouter.get("/", EmergencyContactController.getAll);
protectedEmergencyContactRouter.get("/:id", EmergencyContactController.getById);
protectedEmergencyContactRouter.post(
  "/",
  validateCreateEmergencyContact,
  EmergencyContactController.create
);
protectedEmergencyContactRouter.put(
  "/:id",
  validateUpdateEmergencyContact,
  EmergencyContactController.update
);
protectedEmergencyContactRouter.delete(
  "/:id",
  EmergencyContactController.delete
);
