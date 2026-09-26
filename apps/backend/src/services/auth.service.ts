import { comparePassword } from "../utils/password.util.js";
import { signToken } from "../utils/jwt.util.js";
import { findByEmail, incrementFailedLogin, resetFailedLogin } from "../repositories/user.repository.js";
import { randomUUID } from "crypto";

export class AuthenticationError extends Error { }
export class AccountLockedError extends Error {}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function login(email: string, password: string) {
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

  if (!user) {
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

  await resetFailedLogin(user.id);

  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.code))
    )
  );

  const jti = randomUUID();

  const token = signToken({
    sub: user.id,
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