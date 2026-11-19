// Memeriksa tautan relatif pada seluruh berkas Markdown yang dilacak git.
// Tautan menuju path di .release-exclude dilewati bila berkasnya tidak ada,
// karena path tersebut memang tidak ikut ke branch main.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const toPosix = (path) => path.split(sep).join("/");

const trackedMarkdown = execFileSync("git", ["ls-files", "-z", "*.md"], { encoding: "utf8" })
  .split("\0")
  .filter((file) => file && existsSync(file));

const releaseExcluded = readFileSync(".release-exclude", "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

const isReleaseExcluded = (path) =>
  releaseExcluded.some((entry) => path === entry || (entry.endsWith("/") && path.startsWith(entry)));

const isExternal = (target) => /^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target);

const stripCode = (markdown) =>
  markdown.replace(/^(```|~~~)[\s\S]*?^\1.*$/gm, "").replace(/`[^`\n]*`/g, "");

const linkTargets = (markdown) =>
  [...stripCode(markdown).matchAll(/\[[^\]]*\]\(\s*(<[^>]+>|[^)]+?)\s*\)/g)].map(([, raw]) =>
    raw.replace(/^<|>$/g, "").replace(/\s+["'].*["']$/, "")
  );

const broken = [];
for (const file of trackedMarkdown) {
  for (const target of linkTargets(readFileSync(file, "utf8"))) {
    if (isExternal(target)) continue;
    const pathPart = decodeURI(target.split(/[#?]/)[0]);
    if (!pathPart) continue;
    const resolved = toPosix(relative(".", join(dirname(file), pathPart)));
    if (!existsSync(resolved) && !isReleaseExcluded(resolved)) {
      broken.push(`${file}: ${target}`);
    }
  }
}

if (broken.length > 0) {
  console.error(`Tautan rusak (${broken.length}):\n${broken.join("\n")}`);
  process.exit(1);
}
console.log(`OK: tautan pada ${trackedMarkdown.length} berkas Markdown valid.`);
