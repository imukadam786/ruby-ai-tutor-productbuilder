// Builds public/life-skills/_contact-sheet.html — every generated icon next to
// the bank option label(s) it stands for, so a reviewer can eyeball all the
// Life Skills picture assets at once (open the file in a browser).
//
//   node scripts/make-life-skills-contact-sheet.mjs

import fs from "node:fs";
import path from "node:path";
import { KEY_TO_EMOJI, LABEL_TO_KEY } from "./life-skills-image-map.mjs";

const OUT = path.join(process.cwd(), "public", "life-skills");

// key -> the option labels that use it
const labelsForKey = {};
for (const [label, key] of Object.entries(LABEL_TO_KEY)) {
  (labelsForKey[key] ??= []).push(label);
}

const cards = Object.keys(KEY_TO_EMOJI)
  .sort()
  .map((key) => {
    const exists = fs.existsSync(path.join(OUT, `${key}.svg`));
    const labels = (labelsForKey[key] ?? ["(unused)"]).join(", ");
    const img = exists
      ? `<img src="${key}.svg" alt="${key}">`
      : `<div class="missing">missing</div>`;
    return `<figure>${img}<figcaption><b>${key}</b><br>${labels}</figcaption></figure>`;
  })
  .join("\n");

const html = `<!doctype html><meta charset="utf-8"><title>Life Skills image assets</title>
<style>
  body{font:14px system-ui,sans-serif;margin:24px;background:#f7f7f8;color:#1a2744}
  h1{font-size:18px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
  figure{margin:0;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px;text-align:center}
  img{width:64px;height:64px;object-fit:contain}
  .missing{width:64px;height:64px;margin:0 auto;display:flex;align-items:center;justify-content:center;color:#b91c1c;border:1px dashed #b91c1c;border-radius:8px;font-size:11px}
  figcaption{margin-top:8px;font-size:12px;line-height:1.3;color:#374151}
</style>
<h1>Life Skills image-match assets — ${Object.keys(KEY_TO_EMOJI).length} icons (Twemoji, CC-BY 4.0)</h1>
<div class="grid">
${cards}
</div>`;

fs.writeFileSync(path.join(OUT, "_contact-sheet.html"), html);
console.log(`Wrote ${path.join(OUT, "_contact-sheet.html")}`);
