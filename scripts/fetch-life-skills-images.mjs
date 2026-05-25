// Free + instant Life Skills picture assets -> public/life-skills/<key>.svg
//
//   node scripts/fetch-life-skills-images.mjs
//
// Downloads one Twemoji SVG per key in scripts/life-skills-image-map.mjs
// (Twemoji, CC-BY 4.0, https://github.com/jdecked/twemoji) — single, clearly
// mappable objects only. No AI / illustrator cost. Same approach as
// scripts/fetch-afrikaans-images.mjs.
//
// The session falls back to the English-text option for any key without a file,
// and inject-life-skills-image-refs.mjs only pictures a question when EVERY one
// of its options has a file here, so partial coverage is always safe.

import fs from "node:fs";
import path from "node:path";
import { KEY_TO_EMOJI } from "./life-skills-image-map.mjs";

const OUT = path.join(process.cwd(), "public", "life-skills");
fs.mkdirSync(OUT, { recursive: true });

const CDN = (cp) => `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${cp}.svg`;

const ok = [];
const failed = [];
for (const [key, cp] of Object.entries(KEY_TO_EMOJI)) {
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

console.log(`Twemoji downloaded: ${ok.length}/${Object.keys(KEY_TO_EMOJI).length}`);
if (failed.length) console.log(`Failed:\n  ${failed.join("\n  ")}`);
console.log(`Total SVGs in public/life-skills: ${fs.readdirSync(OUT).filter((f) => f.endsWith(".svg")).length}`);
