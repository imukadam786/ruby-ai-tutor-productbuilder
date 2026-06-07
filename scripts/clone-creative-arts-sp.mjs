// One-shot scaffolder: clones the 9 mechanical Life Orientation SP files into
// their Creative Arts SP equivalents with identifiers renamed. Content (skill
// tree, question bank, curriculum map) is authored separately in
// build-creative-arts-sp.mjs + scripts/content/ca-*.mjs.
//
// Run once: node scripts/clone-creative-arts-sp.mjs
// Safe to re-run (overwrites the generated files).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Ordered string replacements. Longer / more-specific patterns first.
const RULES = [
  [/life-orientation-sp/g, "creative-arts-sp"],
  [/life_orientation_sp/g, "creative_arts_sp"],
  [/LifeOrientationSp/g, "CreativeArtsSp"],
  [/lifeOrientationSp/g, "creativeArtsSp"],
  [/Life Orientation/g, "Creative Arts"],
  [/q_lo_/g, "q_ca_"],
  [/`lo_\$\{Date\.now\(\)\}`/g, "`ca_${Date.now()}`"],
];

function rename(src) {
  return RULES.reduce((s, [re, to]) => s.replace(re, to), src);
}

const PAIRS = [
  ["types/life-orientation-sp.ts", "types/creative-arts-sp.ts"],
  ["lib/life-orientation-sp-grade-map.ts", "lib/creative-arts-sp-grade-map.ts"],
  ["lib/life-orientation-sp-student-model.ts", "lib/creative-arts-sp-student-model.ts"],
  ["lib/life-orientation-sp-selector.ts", "lib/creative-arts-sp-selector.ts"],
  ["lib/life-orientation-sp-scoring.ts", "lib/creative-arts-sp-scoring.ts"],
  [
    "components/life-orientation-sp/LifeOrientationSpSkillTreeView.tsx",
    "components/creative-arts-sp/CreativeArtsSpSkillTreeView.tsx",
  ],
  [
    "components/life-orientation-sp/LifeOrientationSpSession.tsx",
    "components/creative-arts-sp/CreativeArtsSpSession.tsx",
  ],
  [
    "app/api/life-orientation-sp/generate-question/route.ts",
    "app/api/creative-arts-sp/generate-question/route.ts",
  ],
  [
    "app/api/life-orientation-sp/submit-answer/route.ts",
    "app/api/creative-arts-sp/submit-answer/route.ts",
  ],
];

for (const [src, dest] of PAIRS) {
  const raw = await readFile(join(ROOT, src), "utf8");
  const out = rename(raw);
  await mkdir(dirname(join(ROOT, dest)), { recursive: true });
  await writeFile(join(ROOT, dest), out);
  console.log(`✓ ${dest}`);
}
console.log("done — 9 files cloned.");
