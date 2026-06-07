// Optimize the UI artwork served on the Home and Subjects screens.
//
//   node scripts/optimize-ui-images.mjs            (convert)
//   node scripts/optimize-ui-images.mjs --dry      (report only, no writes)
//
// The tutor character PNGs (public/characters) and subject thumbnails
// (public/thumbnails) ship as raw 1.5–2.8 MB files loaded via plain <img>, so
// first paint of those screens downloads ~12 MB. This re-encodes them to small
// WebP files (characters longest edge 400px, thumbnails 512px) — the originals
// are left untouched as masters; only the new .webp siblings are written.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DRY = process.argv.includes("--dry");
const ROOT = process.cwd();

const JOBS = [
  { dir: path.join(ROOT, "public", "characters"), edge: 400, quality: 82 },
  { dir: path.join(ROOT, "public", "thumbnails"), edge: 512, quality: 82 },
];

const kb = (n) => (n / 1024).toFixed(0);
let srcTotal = 0;
let outTotal = 0;
let done = 0;

for (const { dir, edge, quality } of JOBS) {
  if (!fs.existsSync(dir)) {
    console.warn(`  skip (missing dir): ${dir}`);
    continue;
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpe?g)$/i.test(f));

  for (const file of files) {
    const src = path.join(dir, file);
    const out = path.join(dir, file.replace(/\.(png|jpe?g)$/i, ".webp"));
    const srcSize = fs.statSync(src).size;
    srcTotal += srcSize;

    if (DRY) {
      console.log(`  would write ${path.relative(ROOT, out)}  (from ${kb(srcSize)} KB)`);
      continue;
    }

    await sharp(src)
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toFile(out);

    const outSize = fs.statSync(out).size;
    outTotal += outSize;
    done += 1;
    console.log(`  ${path.relative(ROOT, out)}  ${kb(srcSize)} KB → ${kb(outSize)} KB`);
  }
}

console.log(
  DRY
    ? `\nDry run — ${kb(srcTotal)} KB of source images would be converted.`
    : `\nDone: ${done} files. ${kb(srcTotal)} KB → ${kb(outTotal)} KB (${(
        (1 - outTotal / srcTotal) *
        100
      ).toFixed(0)}% smaller).`
);
