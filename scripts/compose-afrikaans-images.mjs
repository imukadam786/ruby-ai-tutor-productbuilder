// Free + instant Afrikaans leftovers that aren't a single icon but can be
// COMPOSED from shapes + the Twemoji animals already fetched. No network, no cost.
//
//   node scripts/compose-afrikaans-images.mjs   (run AFTER fetch-afrikaans-images.mjs)
//
// Covers: positions (ball/cat + box, on/under/in), size variants (big/small dog,
// big cat), and the white cloud. Writes public/afrikaans/<key>.svg.

import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "afrikaans");
const need = (f) => {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) {
    console.error(`Missing ${f} — run scripts/fetch-afrikaans-images.mjs first.`);
    process.exit(1);
  }
  return fs.readFileSync(p, "utf8");
};

// Inline an already-downloaded Twemoji as a NESTED <svg> (its own viewBox is
// 0 0 36 36). Nested SVG renders in every browser even when the parent is loaded
// via <img> — no external/data-URI resource loading, which some browsers block.
const innerOf = (file) =>
  need(file).replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
const dogInner = innerOf("animal_hond.svg");
const catInner = innerOf("animal_kat.svg");
const img = (inner, x, y, w, h) =>
  `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 36 36" overflow="visible">${inner}</svg>`;

const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${inner}</svg>\n`;

// An open cardboard box occupying [x,y,w,h] with a darker rim to read as "open".
const box = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#D9A66C" stroke="#A9743E" stroke-width="3"/>` +
  `<rect x="${x}" y="${y}" width="${w}" height="11" rx="4" fill="#A9743E"/>`;
const ball = (cx, cy, r) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#E53935"/>` +
  `<ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.35}" rx="${r * 0.3}" ry="${r * 0.22}" fill="#fff" opacity="0.35"/>`;

const assets = {
  // ── Positions: ball + box ──────────────────────────────────────────────────
  pos_op:    wrap(box(32, 60, 56, 46) + ball(60, 46, 17)),                 // ball ON box
  pos_onder: wrap(box(32, 14, 56, 44) + ball(60, 94, 17)),                 // ball UNDER box
  pos_in:    wrap(box(26, 42, 68, 60) + ball(60, 78, 15)),                 // ball IN box
  // ── Positions: cat + box (same layout, cat instead of ball) ────────────────
  cat_on_box:    wrap(box(30, 64, 60, 44) + img(catInner, 38, 24, 44, 44)),
  cat_under_box: wrap(box(30, 12, 60, 42) + img(catInner, 38, 64, 44, 44)),
  cat_in_box:    wrap(box(24, 46, 72, 58) + img(catInner, 38, 40, 44, 44)),
  // ── Size variants: same animal, big vs small (whitespace = smaller) ────────
  hond_groot: wrap(img(dogInner, 6, 6, 108, 108)),
  hond_klein: wrap(img(dogInner, 42, 42, 36, 36)),
  kat_groot:  wrap(img(catInner, 6, 6, 108, 108)),
  // ── White cloud — reuse the weather cloud icon ─────────────────────────────
  wolk_wit: need("weather_wolk.svg"),
};

for (const [key, svg] of Object.entries(assets)) {
  fs.writeFileSync(path.join(DIR, `${key}.svg`), svg);
}
console.log(`Composed ${Object.keys(assets).length} leftover assets:`);
console.log(`  ${Object.keys(assets).join(", ")}`);
console.log(`Total files in public/afrikaans: ${fs.readdirSync(DIR).filter((f) => f.endsWith(".svg")).length}`);
