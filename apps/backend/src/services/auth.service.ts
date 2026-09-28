import { comparePassword } from "../utils/password.util.js";
import { signToken } from "../utils/jwt.util.js";
import { findByEmail, incrementFailedLogin, updateLastLogin } from "../repositories/user.repository.js";
import { randomUUID } from "crypto";

export class AuthenticationError extends Error { }
export class AccountLockedError extends Error {}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function login(email: string, password: string, ip?: string) {
  let user;
  try {
    user = await findByEmail(email);
  } catch (dbError) {
    console.error("[AuthService] Database connectivity error during login:", dbError);

    const errStr = dbError instanceof Error ? dbError.message : String(dbError);
    if (errStr.includes("53000") || errStr.includes("quota")) {
      const quotaErr = new Error(
        "Layanan basis data cloud mencapai batas kuota (quota exceeded). Silahkan hubungi administrator sistem atau perbarui paket database Neon."
      );
      (quotaErr as Error & { statusCode?: number }).statusCode = 503;
      throw quotaErr;
    }

    const netErr = new Error(
      "Koneksi ke basis data server terputus. Silahkan periksa jaringan dan coba beberapa saat lagi."
    );
    (netErr as Error & { statusCode?: number }).statusCode = 503;
    throw netErr;
  }

  if (!user || !user.isActive) {
    throw new AuthenticationError("Email atau password salah.");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AccountLockedError(
      "Akun terkunci sementara karena terlalu banyak percobaan login gagal. Silahkan coba lagi dalam beberapa menit lagi."
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    const now = new Date();
    const withinWindow =
      user.lastFailedLoginAt !== null &&
      now.getTime() - user.lastFailedLoginAt.getTime() < LOCKOUT_WINDOW_MS;
    
    const newCount = withinWindow ? user.failedLoginCount + 1 : 1;
    const lockedUntil =
      newCount >= MAX_FAILED_ATTEMPTS ? new Date(now.getTime() + LOCKOUT_WINDOW_MS) : null;

    await incrementFailedLogin(user.id, newCount, lockedUntil);
    throw new AuthenticationError("Email atau password salah.");
  }

  await updateLastLogin(user.id, ip);

  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.code))
    )
  );

  const jti = randomUUID();

  const token = signToken({
    sub: user.id,
    name: user.name,
    email: user.email,
    roles,
    permissions,
    jti,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles,
    },
  };
}

export async function changeSelfPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const { prisma } = await import("../config/prisma.js");
  const { hashPassword } = await import("../utils/password.util.js");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new AuthenticationError("Pengguna tidak ditemukan atau tidak aktif.");
  }

  const isCurrentValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentValid) {
    throw new AuthenticationError("Password saat ini salah.");
  }

  if (currentPassword === newPassword) {
    const err = new Error("Password baru tidak boleh sama dengan password saat ini.");
    (err as Error & { statusCode?: number }).statusCode = 422;
    throw err;
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  return { message: "Password berhasil diperbarui." };
}