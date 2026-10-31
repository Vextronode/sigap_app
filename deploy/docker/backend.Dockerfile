# syntax=docker/dockerfile:1.7
# DEPLOY-01 (FR-B2): image backend SIGAP.
# Build context = root repo (npm workspaces + root lockfile):
#   docker build -f deploy/docker/backend.Dockerfile --target runtime .
# Target: runtime (default, server API) dan migrate (`prisma migrate deploy`).
# Tidak ada secret di image: semua konfigurasi datang dari env saat container jalan.

# Glibc (bookworm), bukan Alpine: biner native (bcrypt, Prisma) memakai varian -gnu.
ARG NODE_VERSION=24.22.2

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app

# Manifest kedua workspace wajib ada agar `npm ci` cocok dengan root lockfile.
FROM base AS manifests
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

# Semua dependency (termasuk dev) + `postinstall: prisma generate`.
# DATABASE_URL/DIRECT_URL dummy hanya di perintah RUN ini (bukan ENV), supaya
# prisma.config.ts bisa dimuat tanpa menempelkan nilai apa pun ke image.
# tsconfig.json wajib ada saat `prisma generate`: tanpa itu generator memakai
# ekstensi `.ts` di import antar-file client (bukan `.js` sesuai NodeNext), dan
# hasil kompilasi gagal dimuat di runtime (ERR_MODULE_NOT_FOUND .../class.ts).
FROM manifests AS deps
COPY apps/backend/prisma apps/backend/prisma
COPY apps/backend/prisma.config.ts apps/backend/tsconfig.json apps/backend/
RUN --mount=type=cache,target=/root/.npm \
    DATABASE_URL=postgresql://build:build@localhost:5432/build \
    DIRECT_URL=postgresql://build:build@localhost:5432/build \
    npm ci --workspace=apps/backend --include-workspace-root

FROM deps AS build
COPY apps/backend apps/backend
RUN npm run build --workspace=apps/backend

# Migrasi skema: dijalankan sekali sebelum backend start (lihat compose).
FROM build AS migrate
WORKDIR /app/apps/backend
USER node
CMD ["npx", "prisma", "migrate", "deploy"]

# Dependency produksi saja. `--omit=optional` ikut dipakai karena Prisma CLI
# berstatus devOptional (devDependency + peer opsional @prisma/client); npm hanya
# membuangnya bila dev DAN optional di-omit. Satu-satunya optional non-dev lain
# (pg-cloudflare) hanya untuk Cloudflare Workers. Install script dilewati, lalu
# hanya bcrypt (binding native) yang di-rebuild. apps/backend/node_modules dibuat
# agar COPY di bawah selalu punya sumber walau npm tidak membuat folder nested.
FROM manifests AS prod-deps
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --omit=optional --ignore-scripts --workspace=apps/backend --include-workspace-root \
    && npm rebuild bcrypt \
    && mkdir -p apps/backend/node_modules

FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY apps/backend/package.json ./apps/backend/package.json
WORKDIR /app/apps/backend
USER node
EXPOSE 3000
# Image slim tidak punya curl: pakai fetch bawaan Node.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/healthz').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "dist/src/server.js"]
