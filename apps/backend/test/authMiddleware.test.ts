import assert from "node:assert/strict";
import { mock, test } from "node:test";

process.env.JWT_SECRET = "0123456789012345678901234567890123";

const state: {
  revoked: boolean;
  dbDown: boolean;
  session: { isActive: boolean; tokenVersion: number } | null;
} = { revoked: false, dbDown: false, session: null };

const whenDbUp = <T>(value: () => T) => {
  if (state.dbDown) throw new Error("db down");
  return value();
};

mock.module(new URL("../src/repositories/token.repository.ts", import.meta.url).href, {
  namedExports: {
    isTokenRevoked: async () => whenDbUp(() => state.revoked),
    findSessionState: async () => whenDbUp(() => state.session),
    revokeToken: async () => {},
  },
});

const { signToken } = await import("../src/utils/jwt.util.js");
const { authMiddleware } = await import("../src/middleware/auth.middleware.js");

const claims = { sub: "u1", email: "a@b.c", roles: ["admin"], permissions: [], jti: "j1" };
const tokenV0 = signToken({ ...claims, tokenVersion: 0 });
const tokenV1 = signToken({ ...claims, tokenVersion: 1 });
const legacyToken = signToken(claims as never);

const authenticate = async (token: string) => {
  let status = 0;
  let passed = false;
  const res = {
    status(code: number) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  };
  await authMiddleware(
    { headers: { authorization: `Bearer ${token}` } } as never,
    res as never,
    () => {
      passed = true;
    }
  );
  return passed ? "lolos" : status;
};

const active = (tokenVersion: number) => ({ isActive: true, tokenVersion });

const cases: [string, string, Partial<typeof state>, string | number][] = [
  ["token aktif", tokenV0, { session: active(0) }, "lolos"],
  ["token lama tanpa klaim, versi 0", legacyToken, { session: active(0) }, "lolos"],
  ["token lama tanpa klaim, sesi dicabut", legacyToken, { session: active(1) }, 401],
  ["versi token tertinggal", tokenV0, { session: active(1) }, 401],
  ["login ulang setelah dicabut", tokenV1, { session: active(1) }, "lolos"],
  ["akun dinonaktifkan", tokenV0, { session: { isActive: false, tokenVersion: 0 } }, 401],
  ["akun tidak ada", tokenV0, { session: null }, 401],
  ["token sudah logout", tokenV0, { session: active(0), revoked: true }, 401],
  ["database gagal", tokenV0, { dbDown: true }, "lolos"],
  ["token rusak", "abc", {}, 401],
];

for (const [name, token, arrange, expected] of cases) {
  test(`authMiddleware: ${name}`, async () => {
    Object.assign(state, { revoked: false, dbDown: false, session: null }, arrange);
    assert.equal(await authenticate(token), expected);
  });
}
