import { prisma } from "../config/prisma.js";
import { randomUUID } from "crypto";

const USER_INCLUDE = {
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  },
};

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: USER_INCLUDE,
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: USER_INCLUDE,
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: USER_INCLUDE,
  });
}

export async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

export async function getRoleByName(name: string) {
  return prisma.role.findUnique({
    where: { name },
  });
}

export async function countActiveAdmins(): Promise<number> {
  const adminUsers = await prisma.user.findMany({
    where: {
      isActive: true,
      userRoles: {
        some: {
          role: {
            name: "admin",
          },
        },
      },
    },
  });

  return adminUsers.length;
}

export async function createUserWithRole(data: {
  name: string;
  email: string;
  passwordHash: string;
  roleId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
        isActive: true,
      },
    });

    await tx.userRole.create({
      data: {
        userId: newUser.id,
        roleId: data.roleId,
      },
    });

    return tx.user.findUniqueOrThrow({
      where: { id: newUser.id },
      include: USER_INCLUDE,
    });
  });
}

export async function updateUserWithRole(
  userId: string,
  data: {
    name?: string;
    isActive?: boolean;
    roleId?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    // 1. Update data User
    const updateData: { name?: string; isActive?: boolean } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (Object.keys(updateData).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // 2. Replace UserRole jika roleId disediakan (FR3: hapus baris lama, insert baru)
    if (data.roleId) {
      await tx.userRole.deleteMany({
        where: { userId },
      });

      await tx.userRole.create({
        data: {
          userId,
          roleId: data.roleId,
        },
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: userId },
      include: USER_INCLUDE,
    });
  });
}

export async function resetUserPassword(userId: string, hashedPassword: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      failedLoginCount: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
    },
    include: USER_INCLUDE,
  });
}

export async function unlockUserAccount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
    },
    include: USER_INCLUDE,
  });
}

/**
 * Menginvalidasi sesi aktif user dengan menambahkan revoked token dummy jangka panjang
 */
export async function revokeActiveSessionsForUser(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari
  return prisma.revokedToken.create({
    data: {
      jti: `revoke-all-user-${userId}-${Date.now()}-${randomUUID()}`,
      userId,
      expiresAt,
    },
  });
}
