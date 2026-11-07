import { prisma } from "../config/prisma.js";

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
    revokeSessions?: boolean;
  }
) {
  return prisma.$transaction(async (tx) => {
    // 1. Update data User
    const updateData: {
      name?: string;
      isActive?: boolean;
      tokenVersion?: { increment: number };
    } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.revokeSessions) updateData.tokenVersion = { increment: 1 };

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

// reset password sekaligus menggugurkan seluruh sesi aktif akun (AC5)
export async function resetUserPassword(userId: string, hashedPassword: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      failedLoginCount: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
      tokenVersion: { increment: 1 },
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
