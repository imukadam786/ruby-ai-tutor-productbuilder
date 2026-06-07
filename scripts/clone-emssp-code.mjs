// One-off: clone the Social Sciences SP code files into Economic & Management
// Sciences SP, applying the rename + accent (orange → violet) substitutions.
// grade-map is written by hand (it carries hard-coded skill ids), so it is NOT
// in this list.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  ["types/social-sciences-sp.ts", "types/ems-sp.ts"],
  ["lib/social-sciences-sp-selector.ts", "lib/ems-sp-selector.ts"],
  ["lib/social-sciences-sp-scoring.ts", "lib/ems-sp-scoring.ts"],
  ["lib/social-sciences-sp-student-model.ts", "lib/ems-sp-student-model.ts"],
  ["components/social-sciences-sp/SocialSciencesSpSession.tsx", "components/ems-sp/EmsSpSession.tsx"],
  ["components/social-sciences-sp/SocialSciencesSpSkillTreeView.tsx", "components/ems-sp/EmsSpSkillTreeView.tsx"],
  ["app/api/social-sciences-sp/generate-question/route.ts", "app/api/ems-sp/generate-question/route.ts"],
  ["app/api/social-sciences-sp/submit-answer/route.ts", "app/api/ems-sp/submit-answer/route.ts"],
];

// Ordered: underscores & long forms before generic; identifiers before colours.
const REPLACEMENTS = [
  [/social_sciences_sp/g, "ems_sp"],                  // sessionStorage keys
  [/social-sciences-sp/g, "ems-sp"],                  // paths, slugs, json
  [/SocialSciencesSp/g, "EmsSp"],                     // PascalCase symbols
  [/socialSciencesSp/g, "emsSp"],                     // camelCase symbols
  [/SSSP/g, "EMS"],                                    // id prefix / const
  [/sssp/g, "ems"],                                    // q-id prefix
  [/Social Sciences Skill Tree/g, "Economic & Management Sciences Skill Tree"],
  [/Social Sciences starts/g, "Economic & Management Sciences starts"],
  [/More Social Sciences grades/g, "More Economic & Management Sciences grades"],
  [/Social Sciences/g, "Economic & Management Sciences"], // catch-all label/prose
  // Accent: orange → violet (class fragments + accent prop only, not prose)
  [/accent="orange"/g, 'accent="violet"'],
  [/bg-orange-/g, "bg-violet-"],
  [/border-orange-/g, "border-violet-"],
  [/text-orange-/g, "text-violet-"],
  [/ring-orange-/g, "ring-violet-"],
  [/shadow-orange-/g, "shadow-violet-"],
  [/from-orange-/g, "from-violet-"],
  [/to-orange-/g, "to-violet-"],
  [/hover:bg-orange-/g, "hover:bg-violet-"],
  [/hover:border-orange-/g, "hover:border-violet-"],
  [/hover:text-orange-/g, "hover:text-violet-"],
];

for (const [src, dest] of FILES) {
  let text = await readFile(join(ROOT, src), "utf8");
  for (const [re, to] of REPLACEMENTS) text = text.replace(re, to);
  await mkdir(dirname(join(ROOT, dest)), { recursive: true });
  await writeFile(join(ROOT, dest), text);
  console.log(`wrote ${dest}`);
}
