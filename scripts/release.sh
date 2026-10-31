#!/usr/bin/env bash
# =============================================================================
# scripts/release.sh: menyiapkan branch release/<versi> untuk PR ke main.
#
# Isi rilis = isi branch dev, tanpa path yang terdaftar di .release-exclude
# (dokumen kerja tim, prompt AI, aset desain). Tree dev diambil utuh, bukan
# di-merge baris per baris, karena main dibuat lewat squash merge sehingga bukan
# ancestor dev (merge biasa menghasilkan ratusan konflik). Akibatnya perubahan
# yang hanya ada di main akan tertimpa: semua perubahan WAJIB lewat dev.
#
# Pemakaian: bash scripts/release.sh <vX.Y.Z>
# Script tidak melakukan push dan tidak membuat tag; langkah berikutnya dicetak
# di akhir.
# =============================================================================
set -euo pipefail

# Git Bash (Windows) mengubah argumen berbentuk "a/b:c" menjadi path Windows,
# sehingga "origin/dev:.release-exclude" rusak. Matikan konversi itu.
export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*"

REMOTE=origin
SOURCE="${RELEASE_SOURCE:-$REMOTE/dev}" # RELEASE_SOURCE hanya untuk uji coba
TARGET="$REMOTE/main"
EXCLUDE_FILE=.release-exclude

info() { echo "[release] $*"; }
die() { echo "[release] ERROR: $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Pemakaian: bash scripts/release.sh <vX.Y.Z>

Membuat branch release/<vX.Y.Z> dari origin/main berisi tree origin/dev tanpa
path di .release-exclude, lalu commit. Tidak melakukan push dan tidak membuat tag.
EOF
}

version="${1:-}"
if [[ "$version" == "-h" || "$version" == "--help" || "$version" == "help" ]]; then
  usage
  exit 0
fi
[[ "$version" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { usage; die "Versi harus berformat vX.Y.Z."; }
branch="release/$version"

cd "$(git rev-parse --show-toplevel)"
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || die "Working tree tidak bersih; commit atau stash dulu."

info "Fetch $REMOTE"
git fetch --quiet --prune --tags "$REMOTE"
git rev-parse --quiet --verify "$SOURCE^{commit}" >/dev/null || die "Sumber $SOURCE tidak ditemukan."
git rev-parse --quiet --verify "$TARGET^{commit}" >/dev/null || die "Target $TARGET tidak ditemukan."
if git rev-parse --quiet --verify "refs/heads/$branch" >/dev/null; then die "Branch $branch sudah ada di lokal."; fi
if git ls-remote --exit-code --heads "$REMOTE" "$branch" >/dev/null; then die "Branch $branch sudah ada di $REMOTE."; fi
if git rev-parse --quiet --verify "refs/tags/$version" >/dev/null; then die "Tag $version sudah ada."; fi

# Daftar pengecualian dibaca dari sumber rilis (bukan working tree) agar CRLF
# checkout Windows tidak ikut terbaca.
git cat-file -e "$SOURCE:$EXCLUDE_FILE" 2>/dev/null || die "$EXCLUDE_FILE tidak ada di $SOURCE."
mapfile -t excludes < <(git show "$SOURCE:$EXCLUDE_FILE" | sed -e 's/\r$//' -e 's/[[:space:]]*$//' | grep -vE '^(#|$)' || true)
((${#excludes[@]})) || die "$EXCLUDE_FILE kosong."

trap 'echo "[release] Gagal. Untuk membatalkan: git merge --abort; git switch -; git branch -D $branch" >&2' ERR

info "Membuat $branch dari $TARGET ($(git rev-parse --short "$TARGET"))"
git switch --quiet --no-track -c "$branch" "$TARGET"

# -s ours hanya untuk mencatat sumber sebagai parent kedua; tree diganti utuh di bawah.
git merge --quiet --no-ff --no-commit -s ours "$SOURCE" >/dev/null
git read-tree -u --reset "$SOURCE"
# -f: index sengaja berbeda dari HEAD (main) setelah read-tree.
git rm -r -q -f --ignore-unmatch -- "${excludes[@]}"

leftover="$(git ls-files -- "${excludes[@]}")"
[[ -z "$leftover" ]] || die "Path pengecualian masih ada di index:"$'\n'"$leftover"
if git diff --cached --quiet "$TARGET"; then
  die "Tidak ada perubahan dibanding $TARGET."
fi

git commit --quiet -m "chore(release): $version" \
  -m "Isi dari $SOURCE ($(git rev-parse --short "$SOURCE")) tanpa path di $EXCLUDE_FILE."
trap - ERR

info "Selesai: $(git diff --shortstat "$TARGET" HEAD)"
info "Path yang dikecualikan:"
printf '  - %s\n' "${excludes[@]}"
cat <<EOF

Langkah berikutnya:
  1. Periksa isi rilis : git diff --stat $TARGET $branch
  2. Push              : git push -u $REMOTE $branch
  3. Buka PR $branch -> main; job CI "Release guard" harus hijau.
  4. Setelah merge     : git fetch $REMOTE && git tag -a $version -m "SIGAP $version" $TARGET && git push $REMOTE $version
EOF
