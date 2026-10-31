export interface UserRecord {
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

export interface UserStatistics {
  totalUsers: number;
  totalAdmins: number;
  totalOperators: number;
  totalInactiveOrLocked: number;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  name?: string;
  role?: string;
  isActive?: boolean;
}

export interface ResetPasswordPayload {
  newPassword: string;
}
