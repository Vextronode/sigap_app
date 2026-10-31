import type { Request, Response } from "express";
import * as userManagementService from "../services/userManagement.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class UserManagementController {
  /**
   * Mengambil daftar seluruh pengguna dengan filter pencarian, peran, dan status
   */
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
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
  });

  /**
   * Mengambil statistik metrik pengguna (KPI Cards)
   */
  static getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await userManagementService.getUserStatistics();
    return res.status(200).json({
      success: true,
      message: "Statistik pengguna berhasil diambil.",
      data: stats,
    });
  });

  /**
   * Mengambil daftar peran (roles) dan permissions yang tersedia
   */
  static getRoles = asyncHandler(async (_req: Request, res: Response) => {
    const roles = await userManagementService.getRolesList();
    return res.status(200).json({
      success: true,
      message: "Daftar peran berhasil diambil.",
      data: roles,
    });
  });

  /**
   * Mengambil detail satu pengguna berdasarkan ID
   */
  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await userManagementService.getUserById(id);

    return res.status(200).json({
      success: true,
      message: "Detail pengguna berhasil diambil.",
      data: user,
    });
  });

  /**
   * Membuat pengguna / petugas baru (FR1 & FR2)
   */
  static createUser = asyncHandler(async (req: Request, res: Response) => {
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
  });

  /**
   * Memperbarui profil, peran, atau status aktif pengguna (FR3 & FR4)
   */
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.user?.sub ?? "";
    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
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
  });

  /**
   * Reset password pengguna oleh Administrator (FR5 & AC5)
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.user?.sub ?? "";
    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
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
  });

  /**
   * Buka blokir akun yang terkunci karena gagal login (Improvement)
   */
  static unlockUser = asyncHandler(async (req: Request, res: Response) => {
    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const unlockedUser =
      await userManagementService.unlockUserAccount(targetUserId);

    return res.status(200).json({
      success: true,
      message:
        "Blokir akun berhasil dibuka. Pengguna dapat login kembali sekarang.",
      data: unlockedUser,
    });
  });
}
