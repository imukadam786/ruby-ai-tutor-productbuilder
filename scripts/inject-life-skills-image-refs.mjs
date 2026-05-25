// Writes image_refs (parallel to options) into Life Skills image-match questions
// that we can fully picture, using scripts/life-skills-image-map.mjs.
//
//   node scripts/fetch-life-skills-images.mjs        # generate the SVGs first
//   node scripts/inject-life-skills-image-refs.mjs   # then wire them into the bank
//   node scripts/inject-life-skills-image-refs.mjs --dry   # report only, no write
//
// A question is pictured ONLY when EVERY option maps to a key AND that key's SVG
// already exists in public/life-skills. That guarantees a question never shows a
// mix of pictures and text tiles — it's all pictures or (untouched) all text.
// Idempotent: re-running rewrites the same image_refs.

import fs from "node:fs";
import path from "node:path";
import { LABEL_TO_KEY } from "./life-skills-image-map.mjs";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");
const IMG_DIR = path.join(ROOT, "public/life-skills");
const DRY = process.argv.includes("--dry");

const raw = fs.readFileSync(BANK_PATH, "utf8");
const usesCRLF = raw.includes("\r\n");
const bank = JSON.parse(raw);
const hasFile = (key) => fs.existsSync(path.join(IMG_DIR, `${key}.svg`));

let pictured = 0;
let skipped = 0;
const unmapped = new Map(); // option label -> count, for items we couldn't fully cover
const missingFiles = new Set();

for (const [topicId, topic] of Object.entries(bank.topics ?? {})) {
  for (let i = 0; i < (topic.questions ?? []).length; i++) {
    const q = topic.questions[i];
    if (q.input_type !== "image-match" || !Array.isArray(q.options)) continue;

    const keys = q.options.map((opt) => LABEL_TO_KEY[String(opt).trim()]);
    const allMapped = keys.every(Boolean);
    const allHaveFiles = allMapped && keys.every(hasFile);

    if (allMapped && allHaveFiles) {
      // Rebuild the object so image_refs sits right after options.
      const rebuilt = {};
      for (const [k, v] of Object.entries(q)) {
        if (k === "image_refs") continue; // drop any stale copy, re-add in place
        rebuilt[k] = v;
        if (k === "options") rebuilt.image_refs = keys;
      }
      topic.questions[i] = rebuilt;
      pictured++;
    } else {
      skipped++;
      if (q.image_refs) delete q.image_refs; // never leave a half-covered question pictured
      q.options.forEach((opt, idx) => {
        if (!keys[idx]) unmapped.set(opt, (unmapped.get(opt) ?? 0) + 1);
        else if (!hasFile(keys[idx])) missingFiles.add(keys[idx]);
      });
    }
  }
}

console.log(`Image-match questions pictured: ${pictured}`);
console.log(`Left as text (not fully coverable): ${skipped}`);
if (missingFiles.size) {
  console.log(`\nMapped but SVG missing (run fetch first): ${[...missingFiles].join(", ")}`);
}
if (unmapped.size) {
  console.log(`\nUnmapped option labels (${unmapped.size}) — these keep text buttons:`);
  for (const [label, n] of [...unmapped.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n}x  ${label}`);
  }
}

if (DRY) {
  console.log("\n(dry run — bank not written)");
} else {
  let out = JSON.stringify(bank, null, 2) + "\n";
  if (usesCRLF) out = out.replace(/\n/g, "\r\n");
  fs.writeFileSync(BANK_PATH, out);
  console.log(`\nWrote ${BANK_PATH}`);
}
