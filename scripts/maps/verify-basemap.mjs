#!/usr/bin/env node
// Memverifikasi file peta dasar (PMTiles) di apps/frontend/public/maps terhadap manifest.json:
// setiap file yang tercatat harus ada, ukurannya sama, dan sha256-nya cocok. Gagal (exit 1)
// bila ada yang hilang atau tidak cocok. Dipakai di CI dan saat build image web.
//
// Pemakaian: node scripts/maps/verify-basemap.mjs
import { createHash } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAPS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "apps", "frontend", "public", "maps");

const sha256OfFile = (path) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(path)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });

const manifest = JSON.parse(await readFile(join(MAPS_DIR, "manifest.json"), "utf8"));
let failed = false;

for (const layer of manifest.layers) {
  const path = join(MAPS_DIR, layer.file);
  if (!existsSync(path)) {
    console.error(`HILANG: ${layer.file}`);
    failed = true;
    continue;
  }
  const size = statSync(path).size;
  const digest = await sha256OfFile(path);
  if (size !== layer.bytes || digest !== layer.sha256) {
    console.error(`TIDAK COCOK: ${layer.file} (ukuran ${size}, sha256 ${digest})`);
    failed = true;
    continue;
  }
  console.log(`OK: ${layer.file} (${(size / 1048576).toFixed(1)} MiB)`);
}

if (failed) process.exit(1);
