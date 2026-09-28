import { Router } from "express";
import { UserManagementController } from "../controllers/userManagement.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import {
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword,
} from "../validators/userManagement.validator.js";

export const protectedUserManagementRouter = Router();

// Seluruh rute manajemen akun & role wajib terautentikasi dan memiliki permission 'user.manage' (Admin)
protectedUserManagementRouter.use(authMiddleware);
protectedUserManagementRouter.use(requirePermission("user.manage"));

// Metrik & Statistik Pengguna
protectedUserManagementRouter.get("/stats", UserManagementController.getStats);

// Daftar Peran & Permissions
protectedUserManagementRouter.get("/roles", UserManagementController.getRoles);

// CRUD Pengguna
protectedUserManagementRouter.get("/", UserManagementController.getUsers);
protectedUserManagementRouter.get("/:id", UserManagementController.getUserById);
protectedUserManagementRouter.post(
  "/",
  validateCreateUser,
  UserManagementController.createUser
);
protectedUserManagementRouter.put(
  "/:id",
  validateUpdateUser,
  UserManagementController.updateUser
);

// Tindakan Khusus Akun
protectedUserManagementRouter.post(
  "/:id/reset-password",
  validateResetPassword,
  UserManagementController.resetPassword
);
protectedUserManagementRouter.post(
  "/:id/unlock",
  UserManagementController.unlockUser
);
