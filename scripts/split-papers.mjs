import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "../lib/matric/papers.ts");
const lines = readFileSync(src, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

// ── Paper id lines (1-based) and their subjects ───────────────────────────────
const PAPER_MAP = [
  [54,    "MATHS_PAPERS"],
  [723,   "MATHS_PAPERS"],
  [1442,  "PHYSICS_PAPERS"],
  [2110,  "MATHS_PAPERS"],
  [2764,  "MATHS_PAPERS"],
  [3409,  "MATHS_PAPERS"],
  [3881,  "MATHS_PAPERS"],
  [4387,  "MATHS_PAPERS"],
  [4885,  "MATHS_PAPERS"],
  [5390,  "PHYSICS_PAPERS"],
  [5879,  "PHYSICS_PAPERS"],
  [6349,  "PHYSICS_PAPERS"],
  [6826,  "PHYSICS_PAPERS"],
  [7300,  "PHYSICS_PAPERS"],
  [7864,  "PHYSICS_PAPERS"],
  [8397,  "PHYSICS_PAPERS"],
  [8910,  "PHYSICS_PAPERS"],
  [9475,  "PHYSICS_PAPERS"],
  [10164, "MATHS_PAPERS"],
  [10684, "MATHS_PAPERS"],
  [11154, "MATHS_PAPERS"],
  [11866, "MATHS_PAPERS"],
  [12584, "ENGLISH_PAPERS"],
  [12879, "ENGLISH_PAPERS"],
];

// ── For each paper: find exact open { and close }, by indentation ─────────────
// The outer paper object is the ONLY object with exactly 2-space indentation.
// Open: scan BACKWARD from id line to find /^  \{/
// Close: scan FORWARD from id line to find /^  \},?/

function findPaperBlock(idLineOneBased) {
  const idIdx = idLineOneBased - 1; // 0-indexed

  // Scan backward for `  {` (exactly 2 spaces + open brace)
  let openIdx = idIdx - 1;
  while (openIdx >= 0 && !/^  \{$/.test(lines[openIdx])) {
    openIdx--;
  }
  if (openIdx < 0) throw new Error(`Could not find opening { for id line ${idLineOneBased}`);

  // Scan forward for `  },` or `  }` (exactly 2 spaces + close brace)
  let closeIdx = idIdx + 1;
  while (closeIdx < lines.length && !/^  \},?$/.test(lines[closeIdx])) {
    closeIdx++;
  }
  if (closeIdx >= lines.length) throw new Error(`Could not find closing } for id line ${idLineOneBased}`);

  return lines.slice(openIdx, closeIdx + 1).join("\n");
}

// ── Group blocks by export const name ────────────────────────────────────────
const groups = { MATHS_PAPERS: [], PHYSICS_PAPERS: [], ENGLISH_PAPERS: [] };
for (const [idLine, exportConst] of PAPER_MAP) {
  const block = findPaperBlock(idLine);
  groups[exportConst].push(block);
}

// Verify counts
console.log("Papers per group:", Object.fromEntries(
  Object.entries(groups).map(([k, v]) => [k, v.length])
));

// ── Types block (everything before export const PAPERS) ───────────────────────
const papersLine = lines.findIndex(l => l.startsWith("export const PAPERS"));
const typesBlock = lines.slice(0, papersLine).join("\n").trimEnd();

// ── Helper functions (everything after `];`) ──────────────────────────────────
const closingIdx = lines.findIndex(l => l === "];");
const helpersBlock = lines.slice(closingIdx + 1).join("\n").trimStart();

// ── File name map ─────────────────────────────────────────────────────────────
const FILE_MAP = {
  MATHS_PAPERS:   "papers-maths",
  PHYSICS_PAPERS: "papers-physics",
  ENGLISH_PAPERS: "papers-english",
};

// ── Write subject files ───────────────────────────────────────────────────────
for (const [exportConst, fileName] of Object.entries(FILE_MAP)) {
  const blocks = groups[exportConst];
  // Normalise each block to end with `  },` (not `  }`)
  const normalisedBlocks = blocks.map(b => b.replace(/^  \}$/m, "  },").trimEnd());

  const body = [
    `import type { Paper } from "./papers";`,
    ``,
    `export const ${exportConst}: Paper[] = [`,
    normalisedBlocks.join("\n\n"),
    `];`,
    ``,
  ].join("\n");

  const outPath = join(__dirname, `../lib/matric/${fileName}.ts`);
  writeFileSync(outPath, body, "utf8");
  console.log(`Written: ${fileName}.ts (${blocks.length} papers, ${body.split("\n").length} lines)`);
}

// ── Rewrite papers.ts ─────────────────────────────────────────────────────────
const newPapersTs = [
  typesBlock,
  ``,
  `import { MATHS_PAPERS } from "./papers-maths";`,
  `import { PHYSICS_PAPERS } from "./papers-physics";`,
  `import { ENGLISH_PAPERS } from "./papers-english";`,
  ``,
  `export const PAPERS: Paper[] = [`,
  `  ...MATHS_PAPERS,`,
  `  ...PHYSICS_PAPERS,`,
  `  ...ENGLISH_PAPERS,`,
  `];`,
  ``,
  helpersBlock,
].join("\n");

writeFileSync(src, newPapersTs, "utf8");
console.log(`\nRewritten papers.ts (${newPapersTs.split("\n").length} lines)`);
