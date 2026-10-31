#!/usr/bin/env bash
# =============================================================================
# deploy/sigap.sh: satu pintu untuk menjalankan SIGAP dengan Docker Compose.
# Menyusun semua argumen compose (-f, --env-file, profil, file env DB) sehingga
# perintah docker compose tidak perlu diketik manual.
#
# Pemakaian: bash deploy/sigap.sh <perintah> [argumen]   (bisa dari folder mana pun)
# Jalankan `bash deploy/sigap.sh help` untuk daftar perintah.
# =============================================================================
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$DEPLOY_DIR/compose.reference.yml"
COMPOSE_ENV="$DEPLOY_DIR/compose.env"
APP_ENV="$DEPLOY_DIR/sigap.env"
EXTERNAL_ENV="$DEPLOY_DIR/sigap.external.env"
STATE_DIR="$DEPLOY_DIR/.state"

info() { echo "[sigap] $*"; }
warn() { echo "[sigap] PERINGATAN: $*" >&2; }
die() { echo "[sigap] ERROR: $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Pemakaian: bash deploy/sigap.sh <perintah> [argumen]

  build                     Build image backend, migrate, dan web (tag dari compose.env)
  up [--db local|external]  Validasi env lalu jalankan stack (default: mode terakhir, awalnya local)
  down                      Hentikan stack (volume data TIDAK dihapus)
  restart [service]         Restart semua service atau satu service
  logs [service]            Ikuti log (200 baris terakhir)
  status                    Status container dan health
  migrate                   Jalankan migrasi skema (prisma migrate deploy)
  health                    Cek /api/healthz dan /api/readyz lewat port web
  smoke                     health + beberapa endpoint publik dan halaman SPA
  shell <service>           Buka shell (sh) di container service
  reset                     HAPUS stack beserta volume DB (hanya mode local, perlu konfirmasi)

File konfigurasi (salin dari *.example, chmod 600):
  deploy/compose.env           variabel compose (proyek, tag image, port host)
  deploy/sigap.env             env runtime aplikasi (+ container db untuk mode local)
  deploy/sigap.external.env    variabel DB untuk mode external (menimpa sigap.env)
EOF
}

# Ambil nilai assignment terakhir yang tidak di-comment. File env tidak pernah di-source.
env_get() {
  local file="$1" key="$2"
  grep -E "^${key}=" "$file" 2>/dev/null | tail -n 1 | cut -d= -f2- || true
}

compose() {
  docker compose --project-directory "$DEPLOY_DIR" -f "$COMPOSE_FILE" --env-file "$COMPOSE_ENV" "$@"
}

# ---------------------------------------------------------------------------
# Mode DB
# ---------------------------------------------------------------------------

DB_MODE=""

load_db_mode() {
  DB_MODE="local"
  if [[ -f "$STATE_DIR/db_mode" ]]; then
    DB_MODE="$(tr -d '[:space:]' < "$STATE_DIR/db_mode")"
  fi
  [[ "$DB_MODE" == "local" || "$DB_MODE" == "external" ]] || die "Isi .state/db_mode tidak valid (harus local atau external)."
}

save_db_mode() {
  mkdir -p "$STATE_DIR"
  echo "$1" > "$STATE_DIR/db_mode"
  DB_MODE="$1"
}

apply_db_mode() {
  if [[ "$DB_MODE" == "local" ]]; then
    export COMPOSE_PROFILES="localdb"
    export SIGAP_DB_ENV_FILE=""
  else
    export COMPOSE_PROFILES=""
    export SIGAP_DB_ENV_FILE="sigap.external.env"
  fi
}

# ---------------------------------------------------------------------------
# Validasi (pesan hanya menyebut NAMA variabel, tidak pernah nilainya)
# ---------------------------------------------------------------------------

require_docker() {
  command -v docker >/dev/null 2>&1 || die "docker tidak ditemukan."
  docker compose version >/dev/null 2>&1 || die "plugin docker compose tidak ditemukan."
  local version major minor
  version="$(docker compose version --short 2>/dev/null | sed 's/^v//')"
  major="${version%%.*}"
  minor="$(echo "$version" | cut -d. -f2)"
  if [[ "$major" =~ ^[0-9]+$ && "$minor" =~ ^[0-9]+$ ]] && (( major < 2 || (major == 2 && minor < 20) )); then
    die "docker compose >= 2.20 dibutuhkan (depends_on.required, env_file.required)."
  fi
}

require_file() {
  [[ -f "$1" ]] || die "File $(basename "$1") belum ada. Salin dari $(basename "$1").example lalu isi."
}

check_permissions() {
  local file="$1" mode
  mode="$(stat -c '%a' "$file" 2>/dev/null || echo "")"
  if [[ -n "$mode" && "$mode" != "600" && "$mode" != "400" ]]; then
    warn "$(basename "$file") ber-izin $mode; disarankan chmod 600 (berisi secret)."
  fi
}

check_placeholders() {
  local file="$1" names
  names="$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=.*<[^>]+>' "$file" | cut -d= -f1 | sort -u | tr '\n' ' ' || true)"
  [[ -z "$names" ]] || die "$(basename "$file") masih berisi placeholder <...> pada: ${names}"
}

check_image_tag() {
  local tag
  tag="$(env_get "$COMPOSE_ENV" SIGAP_IMAGE_TAG)"
  [[ -n "$tag" ]] || die "SIGAP_IMAGE_TAG kosong di compose.env."
  [[ "$tag" != "latest" ]] || die "SIGAP_IMAGE_TAG tidak boleh 'latest'."
}

# Mode local: DATABASE_URL harus menunjuk service `db` dengan kredensial yang sama
# dengan POSTGRES_*, dan tanpa sslmode (sslmode di URL menimpa DB_SSL).
check_local_db() {
  local url re user pass host db query
  url="$(env_get "$APP_ENV" DATABASE_URL)"
  re='^postgres(ql)?://([^:@/]+):([^@/]+)@([^:/?]+)(:[0-9]+)?/([^?]+)(\?(.*))?$'
  [[ "$url" =~ $re ]] || die "DATABASE_URL di sigap.env bukan format postgresql://user:password@host:port/db."
  user="${BASH_REMATCH[2]}"; pass="${BASH_REMATCH[3]}"; host="${BASH_REMATCH[4]}"
  db="${BASH_REMATCH[6]}"; query="${BASH_REMATCH[8]}"
  [[ "$host" == "db" ]] || die "Host DATABASE_URL harus 'db' (nama service) pada mode local."
  [[ "$user" == "$(env_get "$APP_ENV" POSTGRES_USER)" ]] || die "User di DATABASE_URL tidak sama dengan POSTGRES_USER."
  [[ "$pass" == "$(env_get "$APP_ENV" POSTGRES_PASSWORD)" ]] || die "Password di DATABASE_URL tidak sama dengan POSTGRES_PASSWORD."
  [[ "$db" == "$(env_get "$APP_ENV" POSTGRES_DB)" ]] || die "Nama DB di DATABASE_URL tidak sama dengan POSTGRES_DB."
  [[ "$query" != *sslmode=* ]] || die "Hapus sslmode dari DATABASE_URL; atur lewat DB_SSL."
  [[ "$(env_get "$APP_ENV" DIRECT_URL)" == "$url" ]] || die "DIRECT_URL harus sama dengan DATABASE_URL pada mode local."
}

check_external_db() {
  local name url
  [[ -n "$(env_get "$EXTERNAL_ENV" DATABASE_URL)" ]] || die "DATABASE_URL kosong di sigap.external.env."
  for name in DATABASE_URL DIRECT_URL; do
    url="$(env_get "$EXTERNAL_ENV" "$name")"
    [[ "$url" != *sslmode=* ]] || die "Hapus sslmode dari ${name} di sigap.external.env; atur lewat DB_SSL."
  done
}

# Validasi sebelum menjalankan container. Untuk `build`, env runtime cukup ada
# (compose membutuhkan file env_file), placeholder belum wajib diganti.
preflight() {
  local stage="${1:-run}"
  require_docker
  require_file "$COMPOSE_ENV"
  require_file "$APP_ENV"
  check_placeholders "$COMPOSE_ENV"
  check_image_tag
  apply_db_mode
  [[ "$stage" == "build" ]] && return 0

  check_permissions "$COMPOSE_ENV"
  check_permissions "$APP_ENV"
  check_placeholders "$APP_ENV"
  if [[ "$DB_MODE" == "local" ]]; then
    check_local_db
  else
    require_file "$EXTERNAL_ENV"
    check_permissions "$EXTERNAL_ENV"
    check_placeholders "$EXTERNAL_ENV"
    check_external_db
  fi
}

# ---------------------------------------------------------------------------
# HTTP check
# ---------------------------------------------------------------------------

base_url() {
  local bind port
  bind="$(env_get "$COMPOSE_ENV" SIGAP_HTTP_BIND)"; port="$(env_get "$COMPOSE_ENV" SIGAP_HTTP_PORT)"
  [[ -z "$bind" || "$bind" == "0.0.0.0" ]] && bind="127.0.0.1"
  echo "http://${bind}:${port:-8080}"
}

# Cetak "OK|FAIL <kode> <path>"; kembalikan 1 bila kode bukan yang diharapkan.
probe() {
  local path="$1" expected="${2:-200}" code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$(base_url)$path" || echo 000)"
  if [[ "$code" == "$expected" ]]; then
    echo "  OK   $code $path"
  else
    echo "  FAIL $code $path (diharapkan $expected)"
    return 1
  fi
}

cmd_health() {
  command -v curl >/dev/null 2>&1 || die "curl tidak ditemukan."
  info "Health check $(base_url)"
  local failed=0
  probe /api/healthz || failed=1
  probe /api/readyz || failed=1
  return "$failed"
}

cmd_smoke() {
  local failed=0
  cmd_health || failed=1
  info "Smoke test endpoint publik & SPA"
  local path
  for path in / /admin/login /api/public/weather/current /api/public/earthquakes/latest \
    /api/public/tsunami /api/public/emergency-contacts /api/public/evacuation-points; do
    probe "$path" || failed=1
  done
  if (( failed == 0 )); then
    info "Smoke test lulus."
  else
    warn "Smoke test ada yang gagal."
  fi
  return "$failed"
}

# ---------------------------------------------------------------------------
# Perintah
# ---------------------------------------------------------------------------

cmd_up() {
  if [[ "${1:-}" == "--db" ]]; then
    [[ "${2:-}" == "local" || "${2:-}" == "external" ]] || die "Pakai: up --db local|external"
    save_db_mode "$2"
  elif [[ -n "${1:-}" ]]; then
    die "Argumen tidak dikenal untuk up: $1"
  fi
  preflight
  info "Menjalankan stack (mode DB: $DB_MODE, tag: $(env_get "$COMPOSE_ENV" SIGAP_IMAGE_TAG))"
  compose up -d --wait --wait-timeout 300
  mkdir -p "$STATE_DIR"
  env_get "$COMPOSE_ENV" SIGAP_IMAGE_TAG > "$STATE_DIR/current_tag"
  compose ps
}

cmd_reset() {
  [[ "$DB_MODE" == "local" ]] || die "reset hanya untuk mode local (data DB external tidak dikelola compose)."
  warn "reset akan MENGHAPUS semua container DAN volume DB (data hilang permanen)."
  local answer
  read -r -p "Ketik 'reset' untuk melanjutkan: " answer
  [[ "$answer" == "reset" ]] || die "Dibatalkan."
  compose down -v --remove-orphans
  info "Stack dan volume dihapus."
}

main() {
  local command="${1:-help}"
  shift || true
  load_db_mode

  case "$command" in
    build)   preflight build; compose build "$@" ;;
    up)      cmd_up "$@" ;;
    down)    preflight build; compose down ;;
    restart) preflight; compose restart "$@" ;;
    logs)    preflight build; compose logs -f --tail=200 "$@" ;;
    status)  preflight build; compose ps ;;
    migrate) preflight; compose run --rm migrate ;;
    health)  require_file "$COMPOSE_ENV"; cmd_health ;;
    smoke)   require_file "$COMPOSE_ENV"; cmd_smoke ;;
    shell)
      [[ -n "${1:-}" ]] || die "Pakai: shell <service>"
      preflight build; compose exec "$1" sh ;;
    reset)   preflight build; cmd_reset ;;
    help|-h|--help) usage ;;
    *) usage; die "Perintah tidak dikenal: $command" ;;
  esac
}

main "$@"
