#!/usr/bin/env node
// Mengunduh file peta dasar (PMTiles) yang tercatat di apps/frontend/public/maps/manifest.json
// dari aset GitHub Release `basemap-<versi>`, lalu memverifikasi sha256-nya. File yang sudah
// ada dengan sha256 yang cocok dilewati. Gagal (exit 1) bila unduhan atau sha256 tidak cocok.
//
// Pemakaian: node scripts/maps/fetch-basemap.mjs
// BASEMAP_RELEASE_URL mengganti alamat dasar rilis (default: rilis repositori SIGAP).
import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MAPS_DIR = join(ROOT, "apps", "frontend", "public", "maps");
const RELEASE_BASE =
  process.env.BASEMAP_RELEASE_URL ?? "https://github.com/Vextronode/sigap_app/releases/download";

const sha256OfFile = (path) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(path)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });

const manifest = JSON.parse(await readFile(join(MAPS_DIR, "manifest.json"), "utf8"));
const tag = `basemap-${manifest.version}`;

for (const layer of manifest.layers) {
  const target = join(MAPS_DIR, layer.file);
  if (existsSync(target) && (await sha256OfFile(target)) === layer.sha256) {
    console.log(`OK (sudah ada): ${layer.file}`);
    continue;
  }

  const url = `${RELEASE_BASE}/${tag}/${layer.file}`;
  console.log(`Mengunduh ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Gagal mengunduh ${layer.file}: HTTP ${response.status}`);
    process.exit(1);
  }
  const data = Buffer.from(await response.arrayBuffer());
  const digest = createHash("sha256").update(data).digest("hex");
  if (digest !== layer.sha256) {
    console.error(`sha256 ${layer.file} tidak cocok: ${digest} (manifest: ${layer.sha256})`);
    process.exit(1);
  }

  const partial = `${target}.part`;
  await writeFile(partial, data);
  await rm(target, { force: true });
  await rename(partial, target);
  console.log(`OK: ${layer.file} (${(layer.bytes / 1048576).toFixed(1)} MiB)`);
}
