// One-off: clone the Natural Sciences SP code files into Social Sciences SP,
// applying the rename + accent (rose → orange) substitutions. grade-map is
// written by hand (it carries hard-coded skill ids), so it is NOT in this list.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  ["types/natural-sciences-sp.ts", "types/social-sciences-sp.ts"],
  ["lib/natural-sciences-sp-selector.ts", "lib/social-sciences-sp-selector.ts"],
  ["lib/natural-sciences-sp-scoring.ts", "lib/social-sciences-sp-scoring.ts"],
  ["lib/natural-sciences-sp-student-model.ts", "lib/social-sciences-sp-student-model.ts"],
  ["components/natural-sciences-sp/NaturalSciencesSpSession.tsx", "components/social-sciences-sp/SocialSciencesSpSession.tsx"],
  ["components/natural-sciences-sp/NaturalSciencesSpSkillTreeView.tsx", "components/social-sciences-sp/SocialSciencesSpSkillTreeView.tsx"],
  ["app/api/natural-sciences-sp/generate-question/route.ts", "app/api/social-sciences-sp/generate-question/route.ts"],
  ["app/api/natural-sciences-sp/submit-answer/route.ts", "app/api/social-sciences-sp/submit-answer/route.ts"],
];

// Ordered: underscores & long forms before generic; identifiers before colours.
const REPLACEMENTS = [
  [/natural_sciences_sp/g, "social_sciences_sp"],   // sessionStorage keys
  [/natural-sciences-sp/g, "social-sciences-sp"],   // paths, slugs, json
  [/NaturalSciencesSp/g, "SocialSciencesSp"],        // PascalCase symbols
  [/naturalSciencesSp/g, "socialSciencesSp"],        // camelCase symbols
  [/NSSP/g, "SSSP"],                                  // id prefix / const
  [/nssp/g, "sssp"],                                  // q-id prefix
  [/"Natural Sciences"/g, '"Social Sciences"'],      // quoted labels
  [/Natural Sciences Skill Tree/g, "Social Sciences Skill Tree"],
  [/Natural Sciences starts/g, "Social Sciences starts"],
  [/More Natural Sciences grades/g, "More Social Sciences grades"],
  // Accent: rose → orange (class fragments only, not prose)
  [/bg-rose-/g, "bg-orange-"],
  [/border-rose-/g, "border-orange-"],
  [/text-rose-/g, "text-orange-"],
  [/ring-rose-/g, "ring-orange-"],
  [/shadow-rose-/g, "shadow-orange-"],
  [/hover:bg-rose-/g, "hover:bg-orange-"],
  [/hover:border-rose-/g, "hover:border-orange-"],
  [/accent="rose"/g, 'accent="orange"'],
];

for (const [src, dest] of FILES) {
  let text = await readFile(join(ROOT, src), "utf8");
  for (const [re, to] of REPLACEMENTS) text = text.replace(re, to);
  await mkdir(dirname(join(ROOT, dest)), { recursive: true });
  await writeFile(join(ROOT, dest), text);
  console.log(`wrote ${dest}`);
}
