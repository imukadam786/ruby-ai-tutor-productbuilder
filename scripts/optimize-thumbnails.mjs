// One-off: shrink the Subjects-hub thumbnails to the smallest webp that still
// looks crisp at the card's display size (~224px desktop / 160px mobile, so a
// 384px source covers retina), and convert the new Natural Sciences & Technology
// thumbnail from the original in Downloads. Re-encodes in place only when the
// result is smaller, so nothing ever grows.
//
// Run: node scripts/optimize-thumbnails.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const THUMB_DIR = "public/thumbnails";
const MAX_WIDTH = 384;
const QUALITY = 70;

// Convert the new technology thumbnail from its Downloads original first.
const NEW = {
  src: path.join(os.homedir(), "Downloads", "technology thumbnail.jpeg"),
  out: path.join(THUMB_DIR, "natural-sciences-tech.webp"),
};

// Every thumbnail the hub actually references.
const USED = [
  "discover", "mathematics", "english", "life-skills", "afrikaans-fal",
  "social-sciences", "physical-science", "maths-literacy", "life-sciences",
  "history", "business-studies", "accounting", "tourism", "geography",
  "natural-sciences-sp", "social-sciences-sp", "ems-sp", "natural-sciences-tech",
];

const kb = (n) => (n / 1024).toFixed(1) + "KB";

async function encode(srcPath, outPath) {
  // Read into a buffer so sharp never holds a lock on the file we overwrite
  // (Windows blocks renaming/overwriting a file that's still open).
  const input = fs.readFileSync(srcPath);
  const out = await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer();
  const before = fs.existsSync(outPath) ? fs.statSync(outPath).size : Infinity;
  const after = out.length;
  if (after < before) {
    fs.writeFileSync(outPath, out);
    return { changed: true, before, after };
  }
  return { changed: false, before, after };
}

(async () => {
  // New technology thumbnail.
  if (fs.existsSync(NEW.src)) {
    const r = await encode(NEW.src, NEW.out);
    console.log("natural-sciences-tech".padEnd(22), "NEW", kb(r.after));
  } else {
    console.log("⚠ Downloads source not found:", NEW.src);
  }

  for (const name of USED) {
    const p = path.join(THUMB_DIR, name + ".webp");
    if (!fs.existsSync(p)) { console.log(name.padEnd(22), "MISSING — skipped"); continue; }
    const r = await encode(p, p);
    console.log(
      name.padEnd(22),
      r.changed ? `${kb(r.before)} → ${kb(r.after)}` : `kept ${kb(r.before)}`
    );
  }
})();
