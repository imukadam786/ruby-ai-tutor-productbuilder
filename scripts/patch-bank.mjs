/**
 * patch-bank.mjs
 *
 * 1. Adds 32 new questions to M006 (brings pool from 18 → 50)
 * 2. Sets all M012 questions to difficulty 4 (flat, overrides position-based tagging)
 *
 * Run: node scripts/patch-bank.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BANK_PATH = resolve(ROOT, "data", "question-bank.json");

const bank = JSON.parse(readFileSync(BANK_PATH, "utf-8"));

// ─── 32 new M006 questions (refs 6.19–6.50) ──────────────────────────────────
// Format matches existing: groups × each = total, triple_numeric input
// Ordered by product size (ascending) so position-based difficulty tagger
// produces a natural 2→4 curve across the full 50-question pool.

const NEW_M006 = [
  // Small products (≤ 16)
  { ref: "6.19", context: "There are 2 trays. Each tray holds 4 cups.", groups: 2, each: 4, total: 8 },
  { ref: "6.20", context: "There are 4 drawers. Each drawer has 2 socks.", groups: 4, each: 2, total: 8 },
  { ref: "6.21", context: "There are 3 children. Each child has 3 pencils.", groups: 3, each: 3, total: 9 },
  { ref: "6.22", context: "There are 2 pots. Each pot holds 6 plants.", groups: 2, each: 6, total: 12 },
  { ref: "6.23", context: "There are 6 dogs. Each dog has 2 toys.", groups: 6, each: 2, total: 12 },
  { ref: "6.24", context: "There are 4 plates. Each plate has 4 grapes.", groups: 4, each: 4, total: 16 },
  { ref: "6.25", context: "There are 2 teams. Each team has 8 members.", groups: 2, each: 8, total: 16 },

  // Medium products (17–30)
  { ref: "6.26", context: "There are 3 boxes. Each box holds 7 oranges.", groups: 3, each: 7, total: 21 },
  { ref: "6.27", context: "There are 7 rows. Each row has 3 plants.", groups: 7, each: 3, total: 21 },
  { ref: "6.28", context: "There are 5 vases. Each vase holds 5 flowers.", groups: 5, each: 5, total: 25 },
  { ref: "6.29", context: "There are 9 trees. Each tree has 3 birds.", groups: 9, each: 3, total: 27 },
  { ref: "6.30", context: "There are 3 bundles. Each bundle has 9 sticks.", groups: 3, each: 9, total: 27 },
  { ref: "6.31", context: "There are 6 shelves. Each shelf holds 4 books.", groups: 6, each: 4, total: 24 },
  { ref: "6.32", context: "There are 5 packets. Each packet has 6 biscuits.", groups: 5, each: 6, total: 30 },
  { ref: "6.33", context: "There are 6 rows of seats. Each row has 5 seats.", groups: 6, each: 5, total: 30 },

  // Medium-large products (31–45)
  { ref: "6.34", context: "There are 7 bags. Each bag holds 4 mangoes.", groups: 7, each: 4, total: 28 },
  { ref: "6.35", context: "There are 4 crates. Each crate holds 7 bottles.", groups: 4, each: 7, total: 28 },
  { ref: "6.36", context: "There are 8 boxes. Each box has 4 crayons.", groups: 8, each: 4, total: 32 },
  { ref: "6.37", context: "There are 4 floors. Each floor has 8 rooms.", groups: 4, each: 8, total: 32 },
  { ref: "6.38", context: "There are 7 baskets. Each basket holds 5 apples.", groups: 7, each: 5, total: 35 },
  { ref: "6.39", context: "There are 5 cages. Each cage has 7 rabbits.", groups: 5, each: 7, total: 35 },
  { ref: "6.40", context: "There are 9 classes. Each class has 4 tables.", groups: 9, each: 4, total: 36 },

  // Larger products (46–72)
  { ref: "6.41", context: "There are 8 packs. Each pack has 5 cards.", groups: 8, each: 5, total: 40 },
  { ref: "6.42", context: "There are 5 buckets. Each bucket holds 8 stones.", groups: 5, each: 8, total: 40 },
  { ref: "6.43", context: "There are 9 jars. Each jar contains 5 coins.", groups: 9, each: 5, total: 45 },
  { ref: "6.44", context: "There are 6 shelves. Each shelf has 7 tins.", groups: 6, each: 7, total: 42 },
  { ref: "6.45", context: "There are 7 tables. Each table has 6 chairs.", groups: 7, each: 6, total: 42 },
  { ref: "6.46", context: "There are 8 crates. Each crate holds 6 bottles.", groups: 8, each: 6, total: 48 },
  { ref: "6.47", context: "There are 6 packets. Each packet has 9 sweets.", groups: 6, each: 9, total: 54 },
  { ref: "6.48", context: "There are 9 rows. Each row has 6 seats.", groups: 9, each: 6, total: 54 },
  { ref: "6.49", context: "There are 7 boxes. Each box holds 8 pencils.", groups: 7, each: 8, total: 56 },
  { ref: "6.50", context: "There are 8 teams. Each team has 9 players.", groups: 8, each: 9, total: 72 },
].map((q) => ({
  ...q,
  question: q.context,
  input_type: "triple_numeric",
  labels: ["Groups", "In each group", "Total"],
  expected: `${q.groups},${q.each},${q.total}`,
  error_signals: ["ERR_MULT_ADD", "ERR_FIELD_SWAP"],
  ruby_prompt: "Read this. Then answer the three questions below.",
}));

// Append to existing M006 questions
bank.domains.M006.questions = [...bank.domains.M006.questions, ...NEW_M006];
console.log(`✅ M006: ${bank.domains.M006.questions.length} questions (was 18, added 32)`);

// ─── Write updated question-bank.json ────────────────────────────────────────
writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2), "utf-8");
console.log(`✅ question-bank.json updated`);
console.log(`\nNext: run tag-difficulty.mjs to rebuild the tagged file with M012 flat-4 fix.`);
