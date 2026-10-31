export interface RoleDTO {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface UserSummaryDTO {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
  roleId: string;
  permissions: string[];
  isLocked: boolean;
  lockedUntil: string | null;
  failedLoginCount: number;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: string; // "admin" | "operator"
}

export interface UpdateUserDTO {
  name?: string;
  role?: string; // "admin" | "operator"
  isActive?: boolean;
}

export interface ResetPasswordDTO {
  newPassword: string;
}

export interface UserStatisticsDTO {
  totalUsers: number;
  totalAdmins: number;
  totalOperators: number;
  totalInactiveOrLocked: number;
}
