// Regenerates public/offline-manifest.json from the subject question banks.
// Run via: node scripts/gen-offline-manifest.mjs
//
// For each subject that carries images, this lists every image the bank
// references (resolved to a real file under public/<slug>/) plus its byte size.
// The offline downloader reads this to know exactly what to cache for the
// subjects a learner picked — so "make this subject available offline" pulls
// the right diagrams and nothing else.
//
// Image keys live in two bank fields: `image_refs` (string[]) and the Life
// Skills `stem_image` (string). Keys are bare basenames; the actual file may be
// .webp / .svg / .png / .jpg, so we resolve against what is on disk. Keys with
// no matching file (e.g. diagrams not yet drawn) are reported under `missing`
// rather than silently dropped, so gaps are visible.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "data");
const publicDir = path.join(repoRoot, "public");
const outFile = path.join(publicDir, "offline-manifest.json");

// Extensions tried when resolving a bare image key, in preference order.
const IMAGE_EXTS = ["webp", "svg", "png", "jpg", "jpeg"];

function readJson(file) {
  let raw = fs.readFileSync(file, "utf-8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  return JSON.parse(raw);
}

// Walk an arbitrary bank value and collect every image key, wherever nested.
function collectImageKeys(node, keys) {
  if (Array.isArray(node)) {
    for (const item of node) collectImageKeys(item, keys);
    return;
  }
  if (node && typeof node === "object") {
    if (Array.isArray(node.image_refs)) {
      for (const k of node.image_refs) if (typeof k === "string") keys.add(k);
    }
    if (typeof node.stem_image === "string") keys.add(node.stem_image);
    for (const v of Object.values(node)) collectImageKeys(v, keys);
  }
}

// Find <slug>/<key>.<ext> on disk. Returns { url, bytes } or null if absent.
// A key that already includes a known extension is used as-is.
function resolveImage(slug, key) {
  const subjectDir = path.join(publicDir, slug);
  const hasExt = IMAGE_EXTS.some((e) => key.toLowerCase().endsWith(`.${e}`));
  const candidates = hasExt ? [key] : IMAGE_EXTS.map((e) => `${key}.${e}`);
  for (const rel of candidates) {
    const abs = path.join(subjectDir, rel);
    if (fs.existsSync(abs)) {
      return { url: `/${slug}/${rel}`, bytes: fs.statSync(abs).size };
    }
  }
  return null;
}

// Bank files: top-level data/<slug>-question-bank.json, plus split banks under
// data/<slug>-question-banks/*.json. Group every key by its subject slug.
function bankFilesBySlug() {
  const bySlug = new Map();
  const add = (slug, file) => {
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(file);
  };
  for (const entry of fs.readdirSync(dataDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith("-question-bank.json")) {
      add(entry.name.replace("-question-bank.json", ""), path.join(dataDir, entry.name));
    } else if (entry.isDirectory() && entry.name.endsWith("-question-banks")) {
      const slug = entry.name.replace("-question-banks", "");
      const dir = path.join(dataDir, entry.name);
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith(".json")) add(slug, path.join(dir, f));
      }
    }
  }
  return bySlug;
}

const subjects = {};
let totalImages = 0;
let totalBytes = 0;

for (const [slug, files] of [...bankFilesBySlug()].sort()) {
  // Only subjects with a public/<slug>/ folder can have offline images.
  if (!fs.existsSync(path.join(publicDir, slug))) continue;

  const keys = new Set();
  for (const file of files) {
    try {
      collectImageKeys(readJson(file), keys);
    } catch (e) {
      console.warn(`skipping ${path.relative(repoRoot, file)}: ${e.message}`);
    }
  }
  if (keys.size === 0) continue;

  const images = [];
  const missing = [];
  let bytes = 0;
  for (const key of [...keys].sort()) {
    const resolved = resolveImage(slug, key);
    if (resolved) {
      images.push(resolved);
      bytes += resolved.bytes;
    } else {
      missing.push(key);
    }
  }
  if (images.length === 0 && missing.length === 0) continue;

  subjects[slug] = {
    imageCount: images.length,
    totalBytes: bytes,
    images,
    ...(missing.length ? { missing } : {}),
  };
  totalImages += images.length;
  totalBytes += bytes;
}

// Short content hash so the downloader can detect when a subject's images
// changed and re-cache, rather than serving stale diagrams.
const version = crypto
  .createHash("sha256")
  .update(JSON.stringify(subjects))
  .digest("hex")
  .slice(0, 12);

const manifest = {
  generatedBy: "scripts/gen-offline-manifest.mjs",
  version,
  subjects,
};

fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + "\n");

const mb = (totalBytes / (1024 * 1024)).toFixed(1);
console.log(`Wrote ${path.relative(repoRoot, outFile)}`);
console.log(`  ${Object.keys(subjects).length} subjects, ${totalImages} images, ${mb} MB total`);
for (const [slug, s] of Object.entries(subjects)) {
  const miss = s.missing ? `, ${s.missing.length} missing` : "";
  console.log(`  ${slug}: ${s.imageCount} images, ${(s.totalBytes / 1024).toFixed(0)} KB${miss}`);
}
