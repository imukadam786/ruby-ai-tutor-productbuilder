// Free + instant Afrikaans picture assets → public/afrikaans/<key>.svg
//
//   node scripts/fetch-afrikaans-images.mjs
//
// Two free sources, no AI/illustrator cost:
//   1. Code-drawn SVGs for colours (solid blocks) and coloured balls (circles).
//   2. Twemoji (CC-BY 4.0, https://github.com/jdecked/twemoji) for single, clearly
//      mappable objects — downloaded as SVG so they render identically on every
//      device. Attribution lives in scripts/afrikaans-image-manifest.md.
//
// Relational / multi-object keys (positions, scenes, labelled diagrams, size and
// colour variants) are intentionally NOT covered here — they can't be a single
// clean emoji and are handled in a later pass. The app already falls back to the
// English-text option for any key without a file, so partial coverage is safe.

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "afrikaans");
fs.mkdirSync(OUT, { recursive: true });

// ── 1. Code-drawn SVGs (truly instant, zero network) ─────────────────────────
const COLOURS = {
  colour_rooi: "#E53935",
  colour_blou: "#1E88E5",
  colour_geel: "#FDD835",
  colour_groen: "#43A047",
  colour_swart: "#212121",
};
const BALLS = { bal_rooi: "#E53935", bal_blou: "#1E88E5", bal_geel: "#FDD835" };

const colourBlock = (hex) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="16" fill="${hex}"/></svg>\n`;
const ball = (hex) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${hex}"/><ellipse cx="38" cy="36" rx="11" ry="8" fill="#ffffff" opacity="0.35"/></svg>\n`;

let drawn = 0;
for (const [key, hex] of Object.entries(COLOURS)) {
  fs.writeFileSync(path.join(OUT, `${key}.svg`), colourBlock(hex));
  drawn++;
}
for (const [key, hex] of Object.entries(BALLS)) {
  fs.writeFileSync(path.join(OUT, `${key}.svg`), ball(hex));
  drawn++;
}

// ── 2. Twemoji single objects ─────────────────────────────────────────────────
const EMOJI = {
  appel: "1f34e", food_appel: "1f34e", food_piesang: "1f34c", food_lemoen: "1f34a",
  food_brood: "1f35e", food_eier: "1f95a", food_kaas: "1f9c0", food_koek: "1f370",
  food_vleis: "1f356",
  bal: "26bd",
  animal_hond: "1f415", hond: "1f415", animal_kat: "1f408", kat: "1f408",
  animal_voel: "1f426", voel: "1f426", animal_vis: "1f41f", animal_hoender: "1f414",
  clothes_hemp: "1f455", clothes_broek: "1f456", clothes_rok: "1f457",
  clothes_skoene: "1f45f", clothes_hoed: "1f9e2",
  body_oe: "1f440", body_mond: "1f444", body_neus: "1f443", body_hande: "1f450",
  body_voete: "1f9b6",
  weather_son: "2600", son_geel: "2600", weather_reen: "1f327", weather_wolk: "2601",
  weather_sneeu: "2744",
  obj_deur: "1f6aa", obj_venster: "1fa9f", obj_stoel: "1fa91",
  place_skool: "1f3eb", place_winkel: "1f3ea", place_hospitaal: "1f3e5",
  trans_trein: "1f682", trans_bus: "1f68c", trans_motor: "1f697",
  feel_bly: "1f600", feel_hartseer: "1f622", feel_kwaad: "1f620", feel_moeg: "1f62b",
  act_slaap: "1f6cc",
};
const CDN = (cp) => `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${cp}.svg`;

const ok = [];
const failed = [];
for (const [key, cp] of Object.entries(EMOJI)) {
  try {
    const res = await fetch(CDN(cp));
    const body = await res.text();
    if (res.ok && body.trimStart().startsWith("<svg")) {
      fs.writeFileSync(path.join(OUT, `${key}.svg`), body);
      ok.push(key);
    } else {
      failed.push(`${key} (${cp}) HTTP ${res.status}`);
    }
  } catch (e) {
    failed.push(`${key} (${cp}) ${e.message}`);
  }
}

console.log(`Code-drawn: ${drawn} (colours + balls)`);
console.log(`Twemoji downloaded: ${ok.length}/${Object.keys(EMOJI).length}`);
if (failed.length) console.log(`Failed:\n  ${failed.join("\n  ")}`);
console.log(`\nTotal files in public/afrikaans: ${fs.readdirSync(OUT).filter((f) => f.endsWith(".svg")).length}`);
