#!/usr/bin/env bash
# Membangun file peta dasar SIGAP (PMTiles) dari build harian Protomaps (data OpenStreetMap).
#
# Hanya potongan wilayah yang diunduh (HTTP range request), bukan file dunia.
# Hasil:
#   <OUT_DIR>/indonesia-<versi>.pmtiles   seluruh Indonesia, zoom 0-8 (konteks peta gempa)
#   <OUT_DIR>/pangandaran-<versi>.pmtiles Kabupaten Pangandaran, zoom 0-15 (peta evakuasi)
#   <OUT_DIR>/manifest.json               versi, nama file, ukuran, dan sha256
#
# Pemakaian:
#   bash scripts/maps/build-basemap.sh [TANGGAL_BUILD] [OUT_DIR]
#   TANGGAL_BUILD: YYYYMMDD build harian Protomaps (default: nilai SOURCE_DATE di bawah)
#   OUT_DIR      : default apps/frontend/public/maps
#
# Membutuhkan CLI `pmtiles` (github.com/protomaps/go-pmtiles), sha256sum, dan python3.
# Data peta: (c) OpenStreetMap contributors, ODbL; basemap Protomaps.
set -euo pipefail

SOURCE_DATE="${1:-20261118}"
OUT_DIR="${2:-apps/frontend/public/maps}"
SOURCE_URL="https://build.protomaps.com/${SOURCE_DATE}.pmtiles"

# minLon,minLat,maxLon,maxLat
INDONESIA_BBOX="94.9,-11.2,141.1,6.2"
INDONESIA_MAXZOOM=8
PANGANDARAN_BBOX="108.30,-7.90,108.90,-7.45"
PANGANDARAN_MAXZOOM=15

[[ "$SOURCE_DATE" =~ ^[0-9]{8}$ ]] || { echo "TANGGAL_BUILD harus YYYYMMDD" >&2; exit 1; }
command -v pmtiles >/dev/null || { echo "CLI pmtiles tidak ditemukan" >&2; exit 1; }

VERSION="${SOURCE_DATE}"
INDONESIA_FILE="indonesia-${VERSION}.pmtiles"
PANGANDARAN_FILE="pangandaran-${VERSION}.pmtiles"

mkdir -p "$OUT_DIR"

echo "Sumber: $SOURCE_URL"
pmtiles extract "$SOURCE_URL" "$OUT_DIR/$INDONESIA_FILE" \
  --bbox="$INDONESIA_BBOX" --maxzoom="$INDONESIA_MAXZOOM"
pmtiles extract "$SOURCE_URL" "$OUT_DIR/$PANGANDARAN_FILE" \
  --bbox="$PANGANDARAN_BBOX" --maxzoom="$PANGANDARAN_MAXZOOM"

python3 - "$OUT_DIR" "$VERSION" "$SOURCE_URL" "$INDONESIA_FILE" "$INDONESIA_BBOX" "$INDONESIA_MAXZOOM" \
  "$PANGANDARAN_FILE" "$PANGANDARAN_BBOX" "$PANGANDARAN_MAXZOOM" <<'PY'
import hashlib, json, os, sys

out_dir, version, source = sys.argv[1:4]
layers = []
for name, (file, bbox, maxzoom) in zip(
    ["indonesia", "pangandaran"], [sys.argv[4:7], sys.argv[7:10]]
):
    path = os.path.join(out_dir, file)
    with open(path, "rb") as fh:
        digest = hashlib.sha256(fh.read()).hexdigest()
    layers.append({
        "name": name,
        "file": file,
        "bbox": [float(v) for v in bbox.split(",")],
        "maxzoom": int(maxzoom),
        "bytes": os.path.getsize(path),
        "sha256": digest,
    })

manifest = {"version": version, "source": source, "layers": layers}
with open(os.path.join(out_dir, "manifest.json"), "w") as fh:
    json.dump(manifest, fh, indent=2)
    fh.write("\n")
print(json.dumps(manifest, indent=2))
PY
