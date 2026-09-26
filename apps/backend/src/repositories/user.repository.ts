import { prisma } from "../config/prisma.js";

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function incrementFailedLogin(
  userId: string,
  count: number,
  lockedUntil: Date | null
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: count,
      lastFailedLoginAt: new Date(),
      lockedUntil,
    },
  });
}

export async function resetFailedLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
    },
  });
}