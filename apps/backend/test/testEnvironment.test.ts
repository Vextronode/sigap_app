import assert from "node:assert/strict";
import { test } from "node:test";

test("tes tidak memakai database dari .env", async () => {
  // config/prisma memuat dotenv; nilai dari test/setup.ts harus tetap berlaku.
  await import("../src/config/prisma.js");
  assert.equal(process.env.DATABASE_URL, "postgresql://test:test@127.0.0.1:1/sigap_test");
  assert.equal(process.env.DIRECT_URL, "postgresql://test:test@127.0.0.1:1/sigap_test");
});
