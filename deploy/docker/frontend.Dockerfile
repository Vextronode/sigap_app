# syntax=docker/dockerfile:1.7
# DEPLOY-01 (FR-B3): image web SIGAP (SPA Vite disajikan Caddy + proxy /api).
# Build context = root repo:
#   docker build -f deploy/docker/frontend.Dockerfile .
# VITE_API_BASE_URL default relatif (/api), sehingga satu image bisa dipakai di
# host mana pun: browser memanggil API di origin yang sama, Caddy meneruskannya.

ARG NODE_VERSION=24.22.2
ARG CADDY_VERSION=2.11.7

FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
# Workaround npm/cli#4828 di ci.yml (`npm install <binding-linux-x64-gnu> --no-save`)
# sengaja TIDAK dipakai: lockfile sudah memuat binding Linux x64 glibc sehingga
# `npm ci` memasang versi yang persis cocok, sedangkan `npm install` tanpa versi
# memasang binding terbaru yang bisa tidak cocok dengan paket intinya (terbukti:
# rolldown 1.2.15 vs binding 1.2.16). Bila build gagal karena binding hilang,
# perbaiki lockfile, jangan menambah install tanpa versi.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace=apps/frontend --include-workspace-root

COPY apps/frontend apps/frontend

# Hanya di stage build; tidak ikut ke image runtime.
ARG VITE_API_BASE_URL=/api
ARG VITE_ALERT_REFETCH_INTERVAL_MS=12000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_ALERT_REFETCH_INTERVAL_MS=${VITE_ALERT_REFETCH_INTERVAL_MS}
RUN npm run build --workspace=apps/frontend

FROM caddy:${CADDY_VERSION}-alpine AS runtime
COPY deploy/docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/frontend/dist /srv
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
