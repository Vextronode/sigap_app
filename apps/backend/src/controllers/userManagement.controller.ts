import type { Request, Response } from "express";
import * as userManagementService from "../services/userManagement.service.js";

interface CustomHttpError extends Error {
  statusCode?: number;
}

export class UserManagementController {
  /**
   * Mengambil daftar seluruh pengguna dengan filter pencarian, peran, dan status
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const { search, role, status } = req.query;
      const users = await userManagementService.getUsersList({
        search: typeof search === "string" ? search : undefined,
        role: typeof role === "string" ? role : undefined,
        status: typeof status === "string" ? status : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Daftar pengguna berhasil diambil.",
        data: users,
      });
    } catch (error) {
      console.error("[UserManagement] Gagal mengambil daftar pengguna:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal mengambil daftar pengguna.",
        errors: [customError.message || String(error)],
      });
    }
  }

  /**
   * Mengambil statistik metrik pengguna (KPI Cards)
   */
  static async getStats(_req: Request, res: Response) {
    try {
      const stats = await userManagementService.getUserStatistics();
      return res.status(200).json({
        success: true,
        message: "Statistik pengguna berhasil diambil.",
        data: stats,
      });
    } catch (error) {
      console.error("[UserManagement] Gagal mengambil statistik:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal mengambil statistik pengguna.",
        errors: [customError.message || String(error)],
      });
    }
  }

  /**
   * Mengambil daftar peran (roles) dan permissions yang tersedia
   */
  static async getRoles(_req: Request, res: Response) {
    try {
      const roles = await userManagementService.getRolesList();
      return res.status(200).json({
        success: true,
        message: "Daftar peran berhasil diambil.",
        data: roles,
      });
    } catch (error) {
      console.error("[UserManagement] Gagal mengambil daftar peran:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal mengambil daftar peran.",
        errors: [customError.message || String(error)],
      });
    }
  }

  /**
   * Mengambil detail satu pengguna berdasarkan ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await userManagementService.getUserById(id);

      return res.status(200).json({
        success: true,
        message: "Detail pengguna berhasil diambil.",
        data: user,
      });
    } catch (error) {
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal mengambil detail pengguna.",
        errors: [customError.message || String(error)],
      });
    }
  }

  /**
   * Membuat pengguna / petugas baru (FR1 & FR2)
   */
  static async createUser(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.sub ?? "";
      const { name, email, password, role } = req.body;

      const newUser = await userManagementService.createNewUser(currentUserId, {
        name,
        email,
        password,
        role,
      });

      return res.status(201).json({
        success: true,
        message: "Pengguna berhasil ditambahkan ke sistem.",
        data: newUser,
      });
    } catch (error) {
      console.error("[UserManagement] Gagal membuat pengguna:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal menambahkan pengguna.",
        errors: [customError.message || String(error)],
      });
    }
  }

  /**
   * Memperbarui profil, peran, atau status aktif pengguna (FR3 & FR4)
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.sub ?? "";
      const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { name, role, isActive } = req.body;

      const updatedUser = await userManagementService.updateUser(
        currentUserId,
        targetUserId,
        { name, role, isActive }
      );

      return res.status(200).json({
        success: true,
        message: "Data pengguna berhasil diperbarui.",
        data: updatedUser,
      });
    } catch (error) {
      console.error("[UserManagement] Gagal memperbarui pengguna:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal memperbarui data pengguna.",
        errors: [customError.message || String(error)],
      });
    }
  }

  /**
   * Reset password pengguna oleh Administrator (FR5 & AC5)
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.sub ?? "";
      const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { newPassword } = req.body;

      await userManagementService.resetPassword(
        currentUserId,
        targetUserId,
        newPassword
      );

      return res.status(200).json({
        success: true,
        message: "Password pengguna berhasil direset.",
      });
    } catch (error) {
      console.error("[UserManagement] Gagal mereset password:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal mereset password pengguna.",
        errors: [customError.message || String(error)],
      });
    }
  }

  /**
   * Buka blokir akun yang terkunci karena gagal login (Improvement)
   */
  static async unlockUser(req: Request, res: Response) {
    try {
      const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const unlockedUser = await userManagementService.unlockUserAccount(targetUserId);

      return res.status(200).json({
        success: true,
        message: "Blokir akun berhasil dibuka. Pengguna dapat login kembali sekarang.",
        data: unlockedUser,
      });
    } catch (error) {
      console.error("[UserManagement] Gagal membuka blokir pengguna:", error);
      const customError = error as CustomHttpError;
      const statusCode = customError.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: customError.message || "Gagal membuka blokir akun pengguna.",
        errors: [customError.message || String(error)],
      });
    }
  }
}
