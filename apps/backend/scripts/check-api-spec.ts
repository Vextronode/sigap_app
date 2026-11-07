import SwaggerParser from "@apidevtools/swagger-parser";
import express from "express";
import { fileURLToPath } from "node:url";

/**
 * Memvalidasi docs/api_spec/openapi.yaml dan mencocokkan isinya dengan rute Express.
 * Tidak membuka koneksi database: rute hanya didaftarkan, tidak dipanggil.
 */
// Nilai pengisi agar modul backend dapat dimuat tanpa berkas .env.
process.env.JWT_SECRET ??= "placeholder-only-for-route-listing-000000";
process.env.DATABASE_URL ??= "postgresql://check:check@localhost:5432/check";

const SPEC_PATH = fileURLToPath(new URL("../../../docs/api_spec/openapi.yaml", import.meta.url));
const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

type RouterLike = object;
type Mount = { parent: RouterLike; child: RouterLike; path: string };
type RegisteredRoute = { router: RouterLike; path: string; methods: Record<string, boolean> };

const mounts: Mount[] = [];
const registered: RegisteredRoute[] = [];

// Express 5 tidak menyimpan mount path setelah rute terdaftar, jadi pendaftaran dicatat di sini.
const routerProto = express.Router.prototype as unknown as {
  use: (this: RouterLike, ...args: unknown[]) => unknown;
  route: (this: RouterLike, path: string) => { methods: Record<string, boolean> };
};
const originalUse = routerProto.use;
const originalRoute = routerProto.route;

routerProto.use = function (...args) {
  const path = typeof args[0] === "string" ? args[0] : "";
  for (const arg of args) {
    if (typeof arg === "function" && Array.isArray((arg as { stack?: unknown }).stack)) {
      mounts.push({ parent: this, child: arg, path });
    }
  }
  return originalUse.apply(this, args);
};

routerProto.route = function (path) {
  const route = originalRoute.call(this, path);
  registered.push({ router: this, path, methods: route.methods });
  return route;
};

const { default: app } = await import("../src/app.js");

const prefixesOf = (router: RouterLike): string[] =>
  router === app.router
    ? [""]
    : mounts
        .filter(({ child }) => child === router)
        .flatMap(({ parent, path }) => prefixesOf(parent).map((prefix) => prefix + path));

const expressRoutes = () => {
  const entries = registered.flatMap(({ router, path, methods }) =>
    prefixesOf(router).flatMap((prefix) =>
      Object.keys(methods)
        .filter((method) => HTTP_METHODS.includes(method))
        .map((method) => ({ method, path: (prefix + path).replace(/\/$/, "") }))
    )
  );
  const publicPaths = new Set(
    entries
      .filter(({ path }) => path.startsWith("/api/public/"))
      .map(({ path }) => path.replace("/api/public", "/api"))
  );

  return new Set(
    entries
      // /api/* yang sama dengan /api/public/* adalah alias (lihat app.ts), tidak dicatat ganda.
      .filter(({ path }) => !publicPaths.has(path))
      .map(({ method, path }) => {
        const specPath = path.replace(/^\/api/, "").replace(/:(\w+)/g, "{$1}");
        return `${method.toUpperCase()} ${specPath}`;
      })
  );
};

const specRoutes = async () => {
  const spec = await SwaggerParser.validate(SPEC_PATH);
  const routes = new Set<string>();
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      if (item && method in item) routes.add(`${method.toUpperCase()} ${path}`);
    }
  }
  return routes;
};

const documented = await specRoutes();
const implemented = expressRoutes();
const undocumented = [...implemented].filter((route) => !documented.has(route)).sort();
const missing = [...documented].filter((route) => !implemented.has(route)).sort();

for (const route of undocumented) console.error(`Belum ada di OpenAPI: ${route}`);
for (const route of missing) console.error(`Tidak ada di backend: ${route}`);

if (undocumented.length > 0 || missing.length > 0) {
  process.exit(1);
}
console.log(`OK: OpenAPI valid dan cocok dengan ${implemented.size} rute backend.`);
process.exit(0);
