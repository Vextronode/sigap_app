import { hashPassword } from "../utils/password.util.js";
import * as userManagementRepo from "../repositories/userManagement.repository.js";
import type {
  CreateUserDTO,
  UpdateUserDTO,
  UserSummaryDTO,
  RoleDTO,
  UserStatisticsDTO,
} from "../types/userManagement.types.js";

export class ConflictError extends Error {
  statusCode = 409;
}

export class NotFoundError extends Error {
  statusCode = 404;
}

export class ValidationError extends Error {
  statusCode = 400;
}

function formatUserSummary(user: any): UserSummaryDTO {
  const roleName = user.userRoles?.[0]?.role?.name ?? "operator";
  const roleId = user.userRoles?.[0]?.role?.id ?? "";
  const permissions: string[] = Array.from(
    new Set(
      user.userRoles?.flatMap((ur: any) =>
        ur.role.rolePermissions.map((rp: any) => rp.permission.code)
      ) || []
    )
  );

  const now = new Date();
  const isLocked = Boolean(user.lockedUntil && user.lockedUntil > now);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive ?? true,
    role: roleName,
    roleId,
    permissions,
    isLocked,
    lockedUntil: user.lockedUntil ? user.lockedUntil.toISOString() : null,
    failedLoginCount: user.failedLoginCount ?? 0,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    lastLoginIp: user.lastLoginIp ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getUsersList(options?: {
  search?: string;
  role?: string;
  status?: string; // "active" | "inactive" | "locked"
}): Promise<UserSummaryDTO[]> {
  const users = await userManagementRepo.getAllUsers();
  let summaries = users.map(formatUserSummary);

  if (options?.search?.trim()) {
    const q = options.search.toLowerCase().trim();
    summaries = summaries.filter((u) => {
      const nameMatch = u.name.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      const roleName = u.role.toLowerCase();
      const roleLabel = (u.role === "admin" ? "administrator" : "petugas lapangan").toLowerCase();
      const roleShort = (u.role === "admin" ? "admin" : "petugas").toLowerCase();
      const roleMatch =
        roleName.includes(q) || roleLabel.includes(q) || roleShort.includes(q);

      return nameMatch || emailMatch || roleMatch;
    });
  }

  if (options?.role && options.role !== "ALL") {
    summaries = summaries.filter((u) => u.role === options.role);
  }

  if (options?.status && options.status !== "ALL") {
    if (options.status === "active") {
      summaries = summaries.filter((u) => u.isActive && !u.isLocked);
    } else if (options.status === "inactive") {
      summaries = summaries.filter((u) => !u.isActive);
    } else if (options.status === "locked") {
      summaries = summaries.filter((u) => u.isLocked);
    }
  }

  return summaries;
}

export async function getUserStatistics(): Promise<UserStatisticsDTO> {
  const users = await userManagementRepo.getAllUsers();
  const summaries = users.map(formatUserSummary);

  const totalUsers = summaries.length;
  const totalAdmins = summaries.filter((u) => u.role === "admin" && u.isActive).length;
  const totalOperators = summaries.filter((u) => u.role === "operator" && u.isActive).length;
  const totalInactiveOrLocked = summaries.filter((u) => !u.isActive || u.isLocked).length;

  return {
    totalUsers,
    totalAdmins,
    totalOperators,
    totalInactiveOrLocked,
  };
}

export async function getRolesList(): Promise<RoleDTO[]> {
  const roles = await userManagementRepo.getAllRoles();
  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissions: r.rolePermissions.map((rp) => rp.permission.code),
  }));
}

export async function getUserById(id: string): Promise<UserSummaryDTO> {
  const user = await userManagementRepo.getUserById(id);
  if (!user) {
    throw new NotFoundError("Pengguna tidak ditemukan dalam sistem.");
  }
  return formatUserSummary(user);
}

export async function createNewUser(
  _currentUserId: string,
  payload: CreateUserDTO
): Promise<UserSummaryDTO> {
  // 1. Validasi email duplikat
  const existing = await userManagementRepo.getUserByEmail(payload.email.trim());
  if (existing) {
    throw new ValidationError("Email sudah terdaftar untuk pengguna lain.");
  }

  // 2. Ambil role yang valid dari database
  const roleName = payload.role.toLowerCase().trim();
  const role = await userManagementRepo.getRoleByName(roleName);
  if (!role) {
    throw new ValidationError(
      `Peran '${payload.role}' tidak valid. Pilih antara 'admin' atau 'operator'.`
    );
  }

  // 3. Hash password
  const passwordHash = await hashPassword(payload.password);

  // 4. Create user
  const newUser = await userManagementRepo.createUserWithRole({
    name: payload.name.trim(),
    email: payload.email.toLowerCase().trim(),
    passwordHash,
    roleId: role.id,
  });

  return formatUserSummary(newUser);
}

export async function updateUser(
  currentUserId: string,
  targetUserId: string,
  payload: UpdateUserDTO
): Promise<UserSummaryDTO> {
  const targetUser = await userManagementRepo.getUserById(targetUserId);
  if (!targetUser) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  const isTargetAdmin = targetUser.userRoles.some(
    (ur) => ur.role.name === "admin"
  );
  const isTargetActive = targetUser.isActive;

  // Safeguard 1: Anti-Self Deactivation & Anti-Self Demotion
  if (currentUserId === targetUserId) {
    if (payload.isActive === false) {
      throw new ValidationError(
        "Anda tidak dapat menonaktifkan akun Administrator Anda sendiri yang sedang aktif."
      );
    }
    if (payload.role && payload.role !== "admin") {
      throw new ValidationError(
        "Anda tidak dapat menurunkan hak akses akun Anda sendiri dari Administrator."
      );
    }
  }

  // Safeguard 2: Last Active Admin Guard (FR6 & AC4)
  const isDeactivatingAdmin =
    isTargetAdmin && isTargetActive && payload.isActive === false;
  const isDemotingAdmin =
    isTargetAdmin && payload.role && payload.role !== "admin";

  if (isDeactivatingAdmin || isDemotingAdmin) {
    const activeAdminCount = await userManagementRepo.countActiveAdmins();
    if (activeAdminCount <= 1) {
      throw new ConflictError(
        "Operasi ditolak: Akun ini adalah satu-satunya Administrator aktif dalam sistem. Sistem wajib memiliki minimal satu Administrator aktif."
      );
    }
  }

  // Cari roleId baru jika role dikirim
  let newRoleId: string | undefined = undefined;
  if (payload.role) {
    const role = await userManagementRepo.getRoleByName(
      payload.role.toLowerCase().trim()
    );
    if (!role) {
      throw new ValidationError(`Peran '${payload.role}' tidak valid.`);
    }
    newRoleId = role.id;
  }

  // Lakukan update
  const updatedUser = await userManagementRepo.updateUserWithRole(targetUserId, {
    name: payload.name?.trim(),
    isActive: payload.isActive,
    roleId: newRoleId,
  });

  // Jika akun dinonaktifkan atau role diubah, gugurkan sesi aktif (AC3)
  if (payload.isActive === false || newRoleId) {
    try {
      await userManagementRepo.revokeActiveSessionsForUser(targetUserId);
    } catch (e) {
      console.warn("[UserManagement] Failed to revoke session:", e);
    }
  }

  return formatUserSummary(updatedUser);
}

export async function resetPassword(
  _currentUserId: string,
  targetUserId: string,
  newPassword: string
): Promise<void> {
  const targetUser = await userManagementRepo.getUserById(targetUserId);
  if (!targetUser) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new ValidationError("Password baru minimal harus terdiri dari 8 karakter.");
  }

  const hashedPassword = await hashPassword(newPassword);
  await userManagementRepo.resetUserPassword(targetUserId, hashedPassword);

  // Gugurkan sesi aktif akun tersebut (AC5)
  try {
    await userManagementRepo.revokeActiveSessionsForUser(targetUserId);
  } catch (e) {
    console.warn("[UserManagement] Failed to revoke session on password reset:", e);
  }
}

export async function unlockUserAccount(targetUserId: string): Promise<UserSummaryDTO> {
  const targetUser = await userManagementRepo.getUserById(targetUserId);
  if (!targetUser) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  const unlocked = await userManagementRepo.unlockUserAccount(targetUserId);
  return formatUserSummary(unlocked);
}
