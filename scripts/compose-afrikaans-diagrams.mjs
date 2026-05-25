// Free + instant Afrikaans labelled diagrams → public/afrikaans/diagram_*.svg
//
//   node scripts/compose-afrikaans-diagrams.mjs
//
// Six code-drawn SVGs: a plant and a child figure, each rendered three times with
// ONE part highlighted (vivid colour + soft halo) and the rest greyed out — so
// across the option tiles only the named part changes, which is the whole point
// of a "tap the labelled part" item. No network, no cost.

import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "afrikaans");
fs.mkdirSync(DIR, { recursive: true });

const GREY = "#C7CDD1";
const HALO = "#FFE680";
const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${inner}</svg>\n`;
const halo = (cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${HALO}" opacity="0.7"/>`;

// ── Plant: leaves (blare) / stem (stam) / root (wortel) ──────────────────────
const PLANT_GREEN = "#43A047";
const PLANT_BROWN = "#8B5A2B";
function plant(hi) {
  const col = { leaves: hi === "leaves" ? PLANT_GREEN : GREY,
                stem:   hi === "stem"   ? PLANT_GREEN : GREY,
                root:   hi === "root"   ? PLANT_BROWN : GREY };
  const halos = { leaves: halo(60, 50, 30, 24), stem: halo(60, 70, 13, 28), root: halo(60, 106, 26, 15) };
  return wrap(
    (halos[hi] || "") +
    // roots (below the soil)
    `<path d="M60 95 C 55 103 47 105 43 113 M60 95 C 60 104 60 109 60 115 M60 95 C 65 103 73 105 77 113" fill="none" stroke="${col.root}" stroke-width="4" stroke-linecap="round"/>` +
    // stem
    `<rect x="56" y="46" width="8" height="49" rx="4" fill="${col.stem}"/>` +
    // leaves (two side, one top)
    `<ellipse cx="44" cy="62" rx="15" ry="7.5" fill="${col.leaves}" transform="rotate(-28 44 62)"/>` +
    `<ellipse cx="76" cy="58" rx="15" ry="7.5" fill="${col.leaves}" transform="rotate(28 76 58)"/>` +
    `<ellipse cx="60" cy="44" rx="8" ry="12" fill="${col.leaves}"/>`,
  );
}

// ── Body: head (kop) / arm / leg (been) ──────────────────────────────────────
const BODY_HI = "#FB8C00";
function body(hi) {
  const col = { kop: hi === "kop" ? BODY_HI : GREY,
                arm: hi === "arm" ? BODY_HI : GREY,
                been: hi === "been" ? BODY_HI : GREY };
  const halos = {
    kop: halo(60, 22, 19, 19),
    arm: halo(39, 57, 14, 14) + halo(81, 57, 14, 14),
    been: halo(52, 92, 13, 16) + halo(68, 92, 13, 16),
  };
  return wrap(
    (halos[hi] || "") +
    // head
    `<circle cx="60" cy="22" r="13" fill="${col.kop}"/>` +
    // torso (always neutral)
    `<rect x="49" y="38" width="22" height="36" rx="8" fill="${GREY}"/>` +
    // arms
    `<path d="M51 44 L34 64 M69 44 L86 64" fill="none" stroke="${col.arm}" stroke-width="7" stroke-linecap="round"/>` +
    // legs
    `<path d="M55 73 L50 106 M65 73 L70 106" fill="none" stroke="${col.been}" stroke-width="8" stroke-linecap="round"/>`,
  );
}

const assets = {
  diagram_plant_blare: plant("leaves"),
  diagram_plant_stam: plant("stem"),
  diagram_plant_wortel: plant("root"),
  diagram_body_kop: body("kop"),
  diagram_body_arm: body("arm"),
  diagram_body_been: body("been"),
};

for (const [key, svg] of Object.entries(assets)) {
  fs.writeFileSync(path.join(DIR, `${key}.svg`), svg);
}
console.log(`Composed ${Object.keys(assets).length} labelled diagrams: ${Object.keys(assets).join(", ")}`);
console.log(`Total files in public/afrikaans: ${fs.readdirSync(DIR).filter((f) => f.endsWith(".svg")).length}`);
