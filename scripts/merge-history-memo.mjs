/**
 * Merges memoText + rubric from a history memo JSON into the corresponding paper JSON.
 * Usage: node scripts/merge-history-memo.mjs <path-to-memo-file>
 * Example: node scripts/merge-history-memo.mjs data/papers/hist-p1-may-jun-2025-memo.json
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const papersDir = join(__dirname, "../data/papers");

const memoPath = process.argv[2];
if (!memoPath) {
  console.error("Usage: node merge-history-memo.mjs <path-to-memo-file>");
  process.exit(1);
}

const memo = JSON.parse(readFileSync(memoPath, "utf8"));

// Derive paper filename: strip "-memo" suffix
const memoFilename = basename(memoPath);
const paperFilename = memoFilename.replace("-memo.json", ".json");
const paperPath = join(papersDir, paperFilename);

if (!existsSync(paperPath)) {
  console.error(`Paper file not found: ${paperPath}`);
  process.exit(1);
}

const paper = JSON.parse(readFileSync(paperPath, "utf8"));

// Normalise label: strip whitespace so "1.1.1 (a)" == "1.1.1(a)"
const norm = (s) => s.replace(/\s+/g, "");

// Build lookup maps: by id AND by normalised label
const memoById = new Map();
const memoByLabel = new Map();
for (const q of memo.questions) {
  for (const sq of q.subQuestions) {
    memoById.set(sq.id, sq);
    memoByLabel.set(norm(sq.label), sq);
  }
}

let merged = 0;
let missing = 0;

for (const q of paper.questions) {
  for (const sq of q.subQuestions) {
    const memoSQ = memoById.get(sq.id) ?? memoByLabel.get(norm(sq.label));
    if (memoSQ) {
      if (memoSQ.memoText) sq.memoText = memoSQ.memoText;
      if (memoSQ.rubric) sq.rubric = memoSQ.rubric;
      merged++;
    } else {
      console.warn(`  No memo match for subQuestion id: ${sq.id} (${sq.label})`);
      missing++;
    }
  }
}

writeFileSync(paperPath, JSON.stringify(paper, null, 2), "utf8");
console.log(`Merged into ${paperFilename}: ${merged} subquestions updated, ${missing} unmatched`);
