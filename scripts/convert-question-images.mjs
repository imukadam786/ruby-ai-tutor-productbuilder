// Convert the source-of-truth question images (large 1254px PNGs in ~/Downloads)
// into small WebP files served from public/<subject>/.
//
//   node scripts/convert-question-images.mjs            (convert)
//   node scripts/convert-question-images.mjs --dry      (report only, no writes)
//
// Routing + profile per file come from scripts/_question-image-map.json, which is
// derived from Image_Prompts (the head-of-ed source of truth). Two profiles:
//   icon    — flat Twemoji-style answer tiles (Afrikaans, Life Skills): 512px square
//   diagram — labelled study diagrams (Life Sciences): longest edge 1024px, kept legible
//
// Originals are left untouched in Downloads — they are the masters. Geography is
// intentionally excluded (no images yet; head of ed generates those).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const DRY = process.argv.includes("--dry");
const ROOT = process.cwd();
const SRC_DIR = path.join(os.homedir(), "Downloads");
const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts", "_question-image-map.json"), "utf8").replace(/^﻿/, ""),
);

const PROFILES = {
  icon: { resize: { width: 512, height: 512, fit: "inside", withoutEnlargement: true }, webp: { quality: 80 } },
  diagram: { resize: { width: 1024, height: 1024, fit: "inside", withoutEnlargement: true }, webp: { quality: 88 } },
};

const kb = (n) => (n / 1024).toFixed(1);
let srcTotal = 0, outTotal = 0, done = 0, missing = 0;
const byFolder = {};

for (const { file, folder, profile } of map) {
  const src = path.join(SRC_DIR, file);
  if (!fs.existsSync(src)) {
    console.warn(`  skip (not in Downloads): ${file}`);
    missing++;
    continue;
  }
  const outDir = path.join(ROOT, "public", folder);
  const outName = file.replace(/\.png$/i, ".webp");
  const outPath = path.join(outDir, outName);
  const srcBytes = fs.statSync(src).size;
  srcTotal += srcBytes;

  if (DRY) {
    console.log(`  [${profile}] ${file} -> public/${folder}/${outName}`);
    done++;
    byFolder[folder] = (byFolder[folder] || 0) + 1;
    continue;
  }

  fs.mkdirSync(outDir, { recursive: true });
  const p = PROFILES[profile];
  const buf = await sharp(src).resize(p.resize).webp(p.webp).toBuffer();
  fs.writeFileSync(outPath, buf);
  outTotal += buf.length;
  done++;
  byFolder[folder] = (byFolder[folder] || 0) + 1;
  console.log(`  [${profile}] ${file}  ${kb(srcBytes)}KB -> ${kb(buf.length)}KB  ${outName}`);
}

console.log("\n--- summary ---");
for (const [f, n] of Object.entries(byFolder)) console.log(`  public/${f}/ : ${n} files`);
console.log(`  converted: ${done}   missing: ${missing}`);
if (!DRY) {
  console.log(`  source total: ${kb(srcTotal)}KB   output total: ${kb(outTotal)}KB   (${(srcTotal / outTotal).toFixed(1)}x smaller)`);
}
