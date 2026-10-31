#!/usr/bin/env bash
# =============================================================================
# deploy/sigap.sh: satu pintu untuk menjalankan SIGAP dengan Docker Compose.
# Menyusun semua argumen compose (-f, --env-file, profil, file env DB, tag image)
# sehingga perintah docker compose tidak perlu diketik manual.
#
# Pemakaian: bash deploy/sigap.sh <perintah> [argumen]   (bisa dari folder mana pun)
# Jalankan `bash deploy/sigap.sh help` untuk daftar perintah.
#
# Tag image yang berjalan dicatat di .state/current_tag. Semua perintah memakai
# tag itu (bukan SIGAP_IMAGE_TAG di compose.env), agar container tidak dibuat
# ulang dengan versi lama tanpa disadari. compose.env hanya tag awal.
# =============================================================================
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$DEPLOY_DIR/.." && pwd)"
COMPOSE_FILE="$DEPLOY_DIR/compose.reference.yml"
COMPOSE_ENV="$DEPLOY_DIR/compose.env"
APP_ENV="$DEPLOY_DIR/sigap.env"
EXTERNAL_ENV="$DEPLOY_DIR/sigap.external.env"
STATE_DIR="$DEPLOY_DIR/.state"
BACKUP_DIR="$DEPLOY_DIR/backups"
DEPLOY_LOG="$STATE_DIR/deploy.log"

info() { echo "[sigap] $*"; }
warn() { echo "[sigap] PERINGATAN: $*" >&2; }
die() { echo "[sigap] ERROR: $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Pemakaian: bash deploy/sigap.sh <perintah> [argumen]

Rilis
  deploy <tag> [--migrate] [--no-build]
                            Build image <tag> dari checkout saat ini, jalankan, lalu smoke test.
                            Bila smoke gagal, otomatis kembali ke tag sebelumnya.
                            --migrate  : wajib bila ada migrasi pending (backup DB lalu konfirmasi)
                            --no-build : pakai image <tag> yang sudah ada
                            Exit: 0 = OK, 1 = gagal & rollback berhasil, 2 = rollback juga gagal
  up [--db local|external]  Jalankan stack dengan tag aktif (pertama kali: tag compose.env);
                            ditolak bila ada migrasi pending
  build                     Build image dengan tag aktif

Operasi
  down                      Hentikan stack (volume data TIDAK dihapus)
  restart [service]         Restart semua service atau satu service
  logs [service]            Ikuti log (200 baris terakhir)
  status                    Tag aktif/sebelumnya, status container, 10 baris deploy.log
  migrate                   Backup (mode local), tampilkan migrasi pending, konfirmasi, jalankan
  health                    Cek /api/healthz dan /api/readyz lewat port web
  smoke                     health + beberapa endpoint publik dan halaman SPA
  shell <service>           Buka shell (sh) di container service

Data (hanya mode DB local)
  backup [label]            pg_dump -Fc ke deploy/backups/ beserta .sha256
  restore <file.dump>       Verifikasi sha256, stop backend, restore, start, smoke (perlu konfirmasi)
  reset                     HAPUS stack beserta volume DB (perlu konfirmasi)

File konfigurasi (salin dari *.example, chmod 600):
  deploy/compose.env           variabel compose (proyek, tag awal, port host)
  deploy/sigap.env             env runtime aplikasi (+ container db untuk mode local)
  deploy/sigap.external.env    variabel DB untuk mode external (menimpa sigap.env)
EOF
}

# Ambil nilai assignment terakhir yang tidak di-comment. File env tidak pernah di-source.
env_get() {
  local file="$1" key="$2"
  grep -E "^${key}=" "$file" 2>/dev/null | tail -n 1 | cut -d= -f2- || true
}

state_get() {
  [[ -f "$STATE_DIR/$1" ]] && tr -d '[:space:]' < "$STATE_DIR/$1" || true
}

state_set() {
  mkdir -p "$STATE_DIR"
  echo "$2" > "$STATE_DIR/$1"
}

log_event() {
  mkdir -p "$STATE_DIR"
  echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$DEPLOY_LOG"
}

confirm() {
  local word="$1" prompt="$2" answer
  read -r -p "$prompt Ketik '$word' untuk melanjutkan: " answer
  [[ "$answer" == "$word" ]]
}

# SIGAP_IMAGE_TAG di environment shell menimpa nilai dari --env-file compose.env.
compose_raw() {
  docker compose --project-directory "$DEPLOY_DIR" -f "$COMPOSE_FILE" --env-file "$COMPOSE_ENV" "$@"
}

# Non-interaktif: stdin dari /dev/null agar `compose run/exec` tidak memakan input
# yang ditujukan ke konfirmasi ("ya"/"restore") berikutnya.
compose() {
  compose_raw "$@" < /dev/null
}

# ---------------------------------------------------------------------------
# Tag & mode DB
# ---------------------------------------------------------------------------

DB_MODE=""

valid_tag() {
  [[ "$1" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$ && "$1" != "latest" ]]
}

# Tag aktif: .state/current_tag, atau tag awal compose.env bila belum pernah jalan.
use_tag() {
  local tag="${1:-}"
  [[ -n "$tag" ]] || tag="$(state_get current_tag)"
  [[ -n "$tag" ]] || tag="$(env_get "$COMPOSE_ENV" SIGAP_IMAGE_TAG)"
  [[ -n "$tag" ]] || die "Tag image belum ditentukan (SIGAP_IMAGE_TAG di compose.env kosong)."
  valid_tag "$tag" || die "Tag image tidak valid atau 'latest'."
  export SIGAP_IMAGE_TAG="$tag"
}

load_db_mode() {
  DB_MODE="$(state_get db_mode)"
  DB_MODE="${DB_MODE:-local}"
  [[ "$DB_MODE" == "local" || "$DB_MODE" == "external" ]] || die "Isi .state/db_mode tidak valid (harus local atau external)."
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

require_local_db() {
  [[ "$DB_MODE" == "local" ]] || die "Perintah ini hanya untuk mode DB local (DB external dikelola di luar compose)."
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

# Untuk `build`/operasi baca, env runtime cukup ada (compose butuh file env_file);
# placeholder dan konsistensi DB baru wajib sebelum container dijalankan.
preflight() {
  local stage="${1:-run}"
  require_docker
  require_file "$COMPOSE_ENV"
  require_file "$APP_ENV"
  check_placeholders "$COMPOSE_ENV"
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
  # curl sudah mencetak 000 bila koneksi gagal.
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$(base_url)$path")" || true
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
  local failed=0 path
  cmd_health || failed=1
  info "Smoke test endpoint publik & SPA"
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
# Migrasi & backup
# ---------------------------------------------------------------------------

# Mode local: pastikan container db hidup sebelum membaca/menjalankan migrasi.
# (Menyebut service db secara eksplisit mengaktifkan profilnya, jadi jangan di mode external.)
ensure_db_up() {
  [[ "$DB_MODE" == "local" ]] || return 0
  compose up -d --wait db >/dev/null 2>&1 || die "Container db tidak bisa dijalankan. Lihat: logs db"
}

# Cetak status migrasi (memakai image migrate dengan tag aktif); 0 = ada yang pending.
has_pending_migrations() {
  local out
  out="$(compose run --rm --no-deps migrate npx prisma migrate status 2>&1 || true)"
  echo "$out" | grep -E "migrations? found|not yet been applied|up to date|^[0-9]{14}_" || true
  if echo "$out" | grep -q "Database schema is up to date"; then
    return 1
  fi
  echo "$out" | grep -q "not yet been applied" || die "Status migrasi tidak bisa dibaca (DB belum siap?). Lihat: logs db"
}

# Sebelum migrasi: mode local di-backup otomatis; mode external tidak bisa di-backup
# dari sini, jadi operator wajib memastikan backup milik pengelola DB sudah ada.
backup_before_migration() {
  local label="$1"
  if [[ "$DB_MODE" == "local" ]]; then
    cmd_backup "$label"
  else
    warn "Mode DB external: backup TIDAK dibuat oleh skrip ini. Pastikan backup DB terbaru dari pengelola DB sudah ada sebelum melanjutkan."
  fi
}

run_migrate() {
  ensure_db_up
  if ! has_pending_migrations; then
    info "Tidak ada migrasi pending."
    return 0
  fi
  backup_before_migration "pre-migrate"
  confirm "ya" "Migrasi di atas akan dijalankan ke DB (tidak bisa dibatalkan otomatis)." || die "Migrasi dibatalkan."
  compose run --rm migrate
  log_event "MIGRATE tag=$SIGAP_IMAGE_TAG"
}

cmd_backup() {
  require_local_db
  local label="${1:-manual}" stamp file user db
  [[ "$label" =~ ^[A-Za-z0-9._-]+$ ]] || die "Label backup hanya boleh huruf, angka, titik, minus, garis bawah."
  user="$(env_get "$APP_ENV" POSTGRES_USER)"; db="$(env_get "$APP_ENV" POSTGRES_DB)"
  stamp="$(date '+%Y%m%d-%H%M%S')"
  mkdir -p "$BACKUP_DIR"
  file="$BACKUP_DIR/${label}-${stamp}.dump"
  info "Backup DB ke $(basename "$file")"
  compose exec -T db pg_dump -U "$user" -d "$db" -Fc > "$file" || { rm -f "$file"; die "pg_dump gagal."; }
  [[ -s "$file" ]] || { rm -f "$file"; die "File backup kosong."; }
  (cd "$BACKUP_DIR" && sha256sum "$(basename "$file")" > "$(basename "$file").sha256")
  chmod 600 "$file" "$file.sha256" 2>/dev/null || true
  log_event "BACKUP file=$(basename "$file")"
  info "Backup selesai: deploy/backups/$(basename "$file")"
}

cmd_restore() {
  require_local_db
  local file="${1:-}" user db
  [[ -n "$file" && -f "$file" ]] || die "Pakai: restore <file.dump> (file harus ada)."
  [[ -f "$file.sha256" ]] || die "File $(basename "$file").sha256 tidak ada; restore hanya dari backup terverifikasi."
  (cd "$(dirname "$file")" && sha256sum -c --quiet "$(basename "$file").sha256") || die "Checksum tidak cocok."
  user="$(env_get "$APP_ENV" POSTGRES_USER)"; db="$(env_get "$APP_ENV" POSTGRES_DB)"
  warn "restore akan MENIMPA isi DB dengan $(basename "$file")."
  confirm "restore" "" || die "Dibatalkan."
  compose stop web backend
  compose_raw exec -T db pg_restore -U "$user" -d "$db" --clean --if-exists --no-owner --no-privileges < "$file"
  compose up -d --wait backend web
  log_event "RESTORE file=$(basename "$file")"
  cmd_smoke
}

# ---------------------------------------------------------------------------
# Deploy & rollback
# ---------------------------------------------------------------------------

start_stack() {
  compose up -d --wait --wait-timeout 300 --remove-orphans
}

cmd_deploy() {
  local tag="" migrate=0 build=1 previous
  while (($#)); do
    case "$1" in
      --migrate) migrate=1 ;;
      --no-build) build=0 ;;
      -*) die "Opsi tidak dikenal untuk deploy: $1" ;;
      *) [[ -z "$tag" ]] || die "Hanya satu tag."; tag="$1" ;;
    esac
    shift
  done
  [[ -n "$tag" ]] || die "Pakai: deploy <tag> [--migrate] [--no-build]"
  valid_tag "$tag" || die "Tag image tidak valid atau 'latest'."

  previous="$(state_get current_tag)"
  use_tag "$tag"
  preflight

  if (( build )); then
    if [[ "$(git -C "$REPO_DIR" describe --tags --exact-match 2>/dev/null || true)" != "$tag" ]]; then
      warn "Checkout saat ini bukan git tag '$tag'; image dibangun dari kode yang ter-checkout."
    fi
    info "Build image tag $tag"
    compose build
  fi

  ensure_db_up
  if has_pending_migrations; then
    (( migrate )) || die "Ada migrasi pending. Ulangi dengan --migrate (DB akan di-backup dulu)."
    backup_before_migration "pre-$tag"
    confirm "ya" "Migrasi di atas akan dijalankan dengan image $tag." || die "Deploy dibatalkan sebelum migrasi; stack lama tetap berjalan."
    compose run --rm migrate || die "Migrasi gagal; stack lama tetap berjalan."
    log_event "MIGRATE tag=$tag"
  fi

  info "Menjalankan stack tag $tag (sebelumnya: ${previous:-<tidak ada>})"
  if start_stack && cmd_smoke; then
    [[ -n "$previous" && "$previous" != "$tag" ]] && state_set previous_tag "$previous"
    state_set current_tag "$tag"
    log_event "DEPLOY OK tag=$tag previous=${previous:-none} db_mode=$DB_MODE"
    info "DEPLOY OK ($tag)"
    return 0
  fi

  log_event "DEPLOY FAIL tag=$tag"
  if [[ -z "$previous" || "$previous" == "$tag" ]]; then
    warn "Tidak ada tag sebelumnya untuk rollback."
    exit 2
  fi
  warn "Deploy $tag gagal; rollback ke $previous (image saja; skema DB tidak dikembalikan)."
  export SIGAP_IMAGE_TAG="$previous"
  if start_stack && cmd_smoke; then
    log_event "ROLLBACK OK tag=$previous"
    warn "Rollback ke $previous berhasil. Bila $tag sempat menjalankan migrasi, pertimbangkan restore backup pre-$tag."
    exit 1
  fi
  log_event "ROLLBACK FAIL tag=$previous"
  warn "Rollback ke $previous juga gagal. Periksa: bash deploy/sigap.sh logs"
  exit 2
}

cmd_up() {
  if [[ "${1:-}" == "--db" ]]; then
    [[ "${2:-}" == "local" || "${2:-}" == "external" ]] || die "Pakai: up --db local|external"
    state_set db_mode "$2"
    DB_MODE="$2"
  elif [[ -n "${1:-}" ]]; then
    die "Argumen tidak dikenal untuk up: $1"
  fi
  use_tag
  preflight
  # Service migrate selalu ikut `up`; tolak bila ada migrasi pending agar migrasi
  # hanya berjalan lewat jalur yang membuat backup dan meminta konfirmasi.
  ensure_db_up
  if has_pending_migrations; then
    die "Ada migrasi pending. Jalankan 'deploy <tag> --migrate' atau 'migrate' lebih dulu."
  fi
  info "Menjalankan stack (mode DB: $DB_MODE, tag: $SIGAP_IMAGE_TAG)"
  start_stack
  state_set current_tag "$SIGAP_IMAGE_TAG"
  log_event "UP tag=$SIGAP_IMAGE_TAG db_mode=$DB_MODE"
  compose ps
}

cmd_status() {
  echo "Tag aktif     : $(state_get current_tag || true)"
  echo "Tag sebelumnya: $(state_get previous_tag || true)"
  echo "Mode DB       : $DB_MODE"
  compose ps --format 'table {{.Name}}\t{{.Image}}\t{{.Status}}'
  [[ -f "$DEPLOY_LOG" ]] && { echo "--- deploy.log (10 terakhir)"; tail -n 10 "$DEPLOY_LOG"; }
  return 0
}

cmd_reset() {
  require_local_db
  warn "reset akan MENGHAPUS semua container DAN volume DB (data hilang permanen)."
  confirm "reset" "" || die "Dibatalkan."
  compose down -v --remove-orphans
  rm -f "$STATE_DIR/current_tag" "$STATE_DIR/previous_tag"
  log_event "RESET"
  info "Stack dan volume dihapus."
}

main() {
  local command="${1:-help}"
  shift || true
  load_db_mode

  case "$command" in
    deploy)  cmd_deploy "$@" ;;
    up)      cmd_up "$@" ;;
    build)   use_tag; preflight build; compose build "$@" ;;
    down)    use_tag; preflight build; compose down ;;
    restart) use_tag; preflight; compose restart "$@" ;;
    logs)    use_tag; preflight build; compose logs -f --tail=200 "$@" ;;
    status)  use_tag; preflight build; cmd_status ;;
    migrate) use_tag; preflight; run_migrate ;;
    health)  require_file "$COMPOSE_ENV"; cmd_health ;;
    smoke)   require_file "$COMPOSE_ENV"; cmd_smoke ;;
    shell)
      [[ -n "${1:-}" ]] || die "Pakai: shell <service>"
      use_tag; preflight build; compose_raw exec "$1" sh ;;
    backup)  use_tag; preflight; cmd_backup "$@" ;;
    restore) use_tag; preflight; cmd_restore "$@" ;;
    reset)   use_tag; preflight build; cmd_reset ;;
    help|-h|--help) usage ;;
    *) usage; die "Perintah tidak dikenal: $command" ;;
  esac
}

main "$@"
