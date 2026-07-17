import { comparePassword } from "../utils/password.util.js";
import { signToken } from "../utils/jwt.util.js";
import { findByEmail } from "../repositories/user.repository.js";

export class AuthenticationError extends Error { }

export async function login(email: string, password: string) {
  const user = await findByEmail(email);

  if (!user) {
    throw new AuthenticationError("Email atau password salah.");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError("Email atau password salah.");
  }

  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.code))
    )
  );

  const token = signToken({
    sub: user.id,
    email: user.email,
    roles,
    permissions,
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