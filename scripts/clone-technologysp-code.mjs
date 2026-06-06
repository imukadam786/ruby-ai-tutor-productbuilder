// One-off: clone the Economic & Management Sciences SP code files into
// Technology SP, applying the rename + accent (violet → slate) substitutions.
// grade-map is written by hand (it carries hard-coded skill ids), so it is NOT
// in this list.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  ["types/ems-sp.ts", "types/technology-sp.ts"],
  ["lib/ems-sp-selector.ts", "lib/technology-sp-selector.ts"],
  ["lib/ems-sp-scoring.ts", "lib/technology-sp-scoring.ts"],
  ["lib/ems-sp-student-model.ts", "lib/technology-sp-student-model.ts"],
  ["components/ems-sp/EmsSpSession.tsx", "components/technology-sp/TechnologySpSession.tsx"],
  ["components/ems-sp/EmsSpSkillTreeView.tsx", "components/technology-sp/TechnologySpSkillTreeView.tsx"],
  ["app/api/ems-sp/generate-question/route.ts", "app/api/technology-sp/generate-question/route.ts"],
  ["app/api/ems-sp/submit-answer/route.ts", "app/api/technology-sp/submit-answer/route.ts"],
];

// Ordered: underscores & long forms before generic; identifiers before colours.
const REPLACEMENTS = [
  [/ems_sp/g, "technology_sp"],                         // sessionStorage keys
  [/ems-sp/g, "technology-sp"],                         // paths, slugs, json
  [/EmsSp/g, "TechnologySp"],                           // PascalCase symbols
  [/emsSp/g, "technologySp"],                           // camelCase symbols
  [/\bEMS\b/g, "TECH"],                                  // id prefix / const / ERR_ codes
  [/Economic & Management Sciences Skill Tree/g, "Technology Skill Tree"],
  [/Economic & Management Sciences starts/g, "Technology starts"],
  [/More Economic & Management Sciences grades/g, "More Technology grades"],
  [/Economic & Management Sciences/g, "Technology"],   // catch-all label/prose
  // Accent: violet → slate (class fragments + accent prop only, not prose)
  [/accent="violet"/g, 'accent="slate"'],
  [/bg-violet-/g, "bg-slate-"],
  [/border-violet-/g, "border-slate-"],
  [/text-violet-/g, "text-slate-"],
  [/ring-violet-/g, "ring-slate-"],
  [/shadow-violet-/g, "shadow-slate-"],
  [/from-violet-/g, "from-slate-"],
  [/to-violet-/g, "to-slate-"],
  [/hover:bg-violet-/g, "hover:bg-slate-"],
  [/hover:border-violet-/g, "hover:border-slate-"],
  [/hover:text-violet-/g, "hover:text-slate-"],
];

for (const [src, dest] of FILES) {
  let text = await readFile(join(ROOT, src), "utf8");
  for (const [re, to] of REPLACEMENTS) text = text.replace(re, to);
  await mkdir(dirname(join(ROOT, dest)), { recursive: true });
  await writeFile(join(ROOT, dest), text);
  console.log(`wrote ${dest}`);
}
