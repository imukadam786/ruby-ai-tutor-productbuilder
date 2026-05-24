#!/usr/bin/env node
// One-shot: rewrite every level, tier, and atomic-skill `title` in
// data/skill-tree.json (the maths tree) from teacher-jargon to parent-friendly
// phrasing. Mirrors the three reading-tree passes already shipped.
//
// What changes: only `title` fields — 17 levels, 51 tiers, 78 atomic skills
// (146 total).
// What is preserved: ids, descriptions, atomic_skills children, tiers children,
//   prerequisites, templates, error_signatures, mastery_criteria, recovery —
//   everything except the `title` field itself.
//
// Safety: writes a fresh backup at data/skill-tree.json.titles-bak before
// overwriting. Aborts if any in-tree id has no mapping or any map entry
// references an id not in the tree.
//
// Maths note: unlike reading, the maths placement engine is algorithmic
// (gate-window, not a grade→level lookup), so the level titles do NOT carry
// a grade in parentheses. Each level title still reads as a concrete topic
// a parent will recognise.

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TREE_PATH = resolve(__dirname, "..", "data", "skill-tree.json");
const BACKUP_PATH = TREE_PATH + ".titles-bak";

// ─── 17 level titles ──────────────────────────────────────────────────────────
const LEVEL_TITLES = {
  1: "Counting and recognising numbers",
  2: "Adding numbers",
  3: "Taking away and subtracting",
  4: "Adding and subtracting in your head",
  5: "Multiplying and times tables",
  6: "Multiplying bigger numbers",
  7: "Dividing — sharing and grouping",
  8: "Understanding fractions",
  9: "Working with fractions",
  10: "Decimals",
  11: "Ratio, proportion and percentages",
  12: "Negative numbers and order of operations",
  13: "Patterns and the start of algebra",
  14: "Solving equations",
  15: "Shape, angles, area and volume",
  16: "Working with data and probability",
  17: "Tackling harder word problems",
};

// ─── 51 tier titles ───────────────────────────────────────────────────────────
const TIER_TITLES = {
  // L1 — Counting and recognising numbers
  "L1.T1": "Counting objects",
  "L1.T2": "Reading, writing and comparing numbers",
  "L1.T3": "Tens and ones",
  // L2 — Adding numbers
  "L2.T1": "Putting groups together",
  "L2.T2": "Knowing addition facts up to 20",
  "L2.T3": "Adding two-digit numbers",
  // L3 — Taking away and subtracting
  "L3.T1": "Taking objects away",
  "L3.T2": "Finding the difference",
  "L3.T3": "Subtracting two-digit numbers",
  // L4 — Adding and subtracting in your head
  "L4.T1": "Adding in your head",
  "L4.T2": "Subtracting in your head",
  "L4.T3": "Adding and subtracting three-digit numbers",
  // L5 — Multiplying and times tables
  "L5.T1": "Equal groups and arrays",
  "L5.T2": "Skip counting and times tables",
  "L5.T3": "How order works in multiplication",
  // L6 — Multiplying bigger numbers
  "L6.T1": "Using multiplication to scale things",
  "L6.T2": "Multiplying bigger numbers",
  "L6.T3": "Breaking multiplications into easier parts",
  // L7 — Dividing
  "L7.T1": "Sharing and grouping",
  "L7.T2": "Using multiplication to do division",
  "L7.T3": "Dividing bigger numbers",
  // L8 — Understanding fractions
  "L8.T1": "Fractions as equal parts",
  "L8.T2": "Placing fractions on a number line",
  "L8.T3": "Equivalent fractions",
  // L9 — Working with fractions
  "L9.T1": "Adding and subtracting fractions",
  "L9.T2": "Multiplying fractions",
  "L9.T3": "Dividing fractions",
  // L10 — Decimals
  "L10.T1": "Tenths and hundredths",
  "L10.T2": "Working with decimals",
  "L10.T3": "Rounding and estimating",
  // L11 — Ratio, proportion and percentages
  "L11.T1": "Ratios",
  "L11.T2": "Proportion and percentages",
  "L11.T3": "Percentage increase and decrease",
  // L12 — Negative numbers
  "L12.T1": "Understanding negative numbers",
  "L12.T2": "Working with negative numbers",
  "L12.T3": "Order of operations (BODMAS)",
  // L13 — Patterns and the start of algebra
  "L13.T1": "Number patterns and sequences",
  "L13.T2": "Letters in maths (expressions)",
  "L13.T3": "Expanding and factorising",
  // L14 — Solving equations
  "L14.T1": "Solving simple equations",
  "L14.T2": "Solving equations with letters on both sides",
  "L14.T3": "Setting up and solving equations from word problems",
  // L15 — Shape, angles, area, volume
  "L15.T1": "Angles",
  "L15.T2": "Area and perimeter",
  "L15.T3": "Volume",
  // L16 — Data and probability
  "L16.T1": "Average, middle value and most common",
  "L16.T2": "Bar charts and pie charts",
  "L16.T3": "Chance and probability",
  // L17 — Advanced problem solving
  "L17.T1": "Multi-step word problems",
  "L17.T2": "Explaining and justifying your maths",
  "L17.T3": "Strategies for solving tricky problems",
};

// ─── 78 atomic skill titles ───────────────────────────────────────────────────
const ATOMIC_TITLES = {
  // L1 — Counting and recognising numbers
  "L1.T1.A1": "Counting objects up to 10",
  "L1.T1.A2": "Counting objects up to 20",
  "L1.T2.A1": "Reading and writing numbers 0–20",
  "L1.T2.A2": "Putting numbers in order up to 20",
  "L1.T2.A3": "Comparing numbers using <, >, and =",
  "L1.T3.A1": "Understanding tens and ones up to 99",

  // L2 — Adding numbers
  "L2.T1.A1": "Adding by counting everything",
  "L2.T1.A2": "Adding by counting on from the first number",
  "L2.T2.A1": "Doubles and near-doubles (2+2, 3+4)",
  "L2.T2.A2": "Using 10 to make adding easier",
  "L2.T3.A1": "Adding two-digit numbers without carrying",
  "L2.T3.A2": "Adding two-digit numbers with carrying",

  // L3 — Taking away and subtracting
  "L3.T1.A1": "Subtracting by taking objects away",
  "L3.T1.A2": "Subtracting by counting back",
  "L3.T2.A1": "Finding the difference by counting up",
  "L3.T3.A1": "Subtracting two-digit numbers without borrowing",
  "L3.T3.A2": "Subtracting two-digit numbers with borrowing",

  // L4 — Adding and subtracting in your head
  "L4.T1.A1": "Adding by rounding then adjusting",
  "L4.T1.A2": "Adding by splitting numbers apart",
  "L4.T2.A1": "Subtracting by rounding then adjusting",
  "L4.T3.A1": "Adding and subtracting three-digit numbers",

  // L5 — Multiplying and times tables
  "L5.T1.A1": "Making equal groups",
  "L5.T1.A2": "Showing multiplication with rows and columns",
  "L5.T2.A1": "Skip counting by 2s, 5s, and 10s",
  "L5.T2.A2": "Times tables: 2, 5, and 10",
  "L5.T2.A3": "Times tables: 3, 4, 6, 7, 8, and 9",
  "L5.T3.A1": "Knowing 3×4 and 4×3 give the same answer",

  // L6 — Multiplying bigger numbers
  "L6.T1.A1": "Multiplying to make things bigger or smaller",
  "L6.T2.A1": "Multiplying a 2-digit number by a 1-digit number",
  "L6.T2.A2": "Multiplying a 3-digit number by a 1-digit number",
  "L6.T2.A3": "Multiplying a 2-digit number by a 2-digit number",
  "L6.T3.A1": "Breaking up multiplications to make them easier (e.g. 7×12 = 7×10 + 7×2)",

  // L7 — Dividing
  "L7.T1.A1": "Dividing by sharing equally",
  "L7.T1.A2": "Dividing by making equal groups",
  "L7.T2.A1": "Using times tables to do division",
  "L7.T3.A1": "Dividing a 2-digit number by a 1-digit number (with remainders)",

  // L8 — Understanding fractions
  "L8.T1.A1": "Reading unit fractions (1/2, 1/3, 1/4)",
  "L8.T1.A2": "Reading fractions like 2/3 or 3/4",
  "L8.T2.A1": "Placing fractions on a number line",
  "L8.T3.A1": "Finding equivalent fractions (1/2 = 2/4)",

  // L9 — Working with fractions
  "L9.T1.A1": "Adding fractions with the same bottom number",
  "L9.T1.A2": "Adding fractions with different bottom numbers",
  "L9.T2.A1": "Multiplying a fraction by a whole number",
  "L9.T2.A2": "Multiplying one fraction by another",
  "L9.T3.A1": "Dividing a fraction by a whole number",
  "L9.T3.A2": "Dividing one fraction by another (flip and multiply)",

  // L10 — Decimals
  "L10.T1.A1": "Understanding tenths and hundredths",
  "L10.T2.A1": "Adding and subtracting decimals",
  "L10.T2.A2": "Multiplying and dividing decimals by 10, 100, and 1000",
  "L10.T3.A1": "Rounding decimals to the nearest whole number or decimal place",

  // L11 — Ratio and percentages
  "L11.T1.A1": "Writing and simplifying ratios",
  "L11.T1.A2": "Sharing an amount in a given ratio",
  "L11.T2.A1": "Solving proportion problems by finding the value of one",
  "L11.T2.A2": "Finding a percentage of an amount",
  "L11.T3.A1": "Working out percentage increase and decrease",

  // L12 — Negative numbers
  "L12.T1.A1": "Comparing and ordering negative numbers",
  "L12.T2.A1": "Adding and subtracting with negative numbers",
  "L12.T2.A2": "Multiplying and dividing with negative numbers",
  "L12.T3.A1": "Using BODMAS to do operations in the right order",

  // L13 — Algebra start
  "L13.T1.A1": "Finding and continuing number patterns",
  "L13.T2.A1": "Writing and working out expressions with letters",
  "L13.T2.A2": "Simplifying expressions by grouping like terms",
  "L13.T3.A1": "Expanding single brackets (e.g. 3(x+2))",
  "L13.T3.A2": "Factorising by pulling out a common factor",

  // L14 — Equations
  "L14.T1.A1": "Solving one-step equations",
  "L14.T1.A2": "Solving two-step equations",
  "L14.T2.A1": "Solving equations with the unknown on both sides",
  "L14.T3.A1": "Writing and solving equations from word problems",

  // L15 — Geometry
  "L15.T1.A1": "Identifying and measuring angles",
  "L15.T1.A2": "Angle rules (straight line, opposite angles, triangles)",
  "L15.T2.A1": "Finding the area of rectangles and triangles",
  "L15.T3.A1": "Finding the volume of cuboids (box shapes)",

  // L16 — Data and probability
  "L16.T1.A1": "Working out the mean, median, and mode",
  "L16.T2.A1": "Reading and drawing bar charts and pie charts",
  "L16.T3.A1": "Working out and writing probability",

  // L17 — Advanced problem solving
  "L17.T1.A1": "Solving word problems with several steps",
  "L17.T2.A1": "Making and explaining mathematical guesses",
  "L17.T3.A1": "Using a clear plan to solve tricky problems",
};

// ─── Run ──────────────────────────────────────────────────────────────────────
const raw = await readFile(TREE_PATH, "utf8");
const tree = JSON.parse(raw);

const seenLevels = new Set();
const seenTiers = new Set();
const seenAtomic = new Set();
const missing = { levels: [], tiers: [], atomic: [] };
const counts = { lvlChanged: 0, lvlUnchanged: 0, tierChanged: 0, tierUnchanged: 0, atomicChanged: 0, atomicUnchanged: 0 };

for (const level of tree.levels) {
  seenLevels.add(level.id);
  const nl = LEVEL_TITLES[level.id];
  if (nl == null) missing.levels.push(level.id);
  else if (level.title === nl) counts.lvlUnchanged++;
  else { level.title = nl; counts.lvlChanged++; }

  for (const tier of level.tiers) {
    seenTiers.add(tier.id);
    const nt = TIER_TITLES[tier.id];
    if (nt == null) missing.tiers.push(tier.id);
    else if (tier.title === nt) counts.tierUnchanged++;
    else { tier.title = nt; counts.tierChanged++; }

    for (const skill of tier.atomic_skills) {
      seenAtomic.add(skill.id);
      const ns = ATOMIC_TITLES[skill.id];
      if (ns == null) missing.atomic.push(skill.id);
      else if (skill.title === ns) counts.atomicUnchanged++;
      else { skill.title = ns; counts.atomicChanged++; }
    }
  }
}

const extras = {
  levels: Object.keys(LEVEL_TITLES).map(Number).filter((id) => !seenLevels.has(id)),
  tiers: Object.keys(TIER_TITLES).filter((id) => !seenTiers.has(id)),
  atomic: Object.keys(ATOMIC_TITLES).filter((id) => !seenAtomic.has(id)),
};

const anyProblem =
  missing.levels.length || missing.tiers.length || missing.atomic.length ||
  extras.levels.length || extras.tiers.length || extras.atomic.length;

if (anyProblem) {
  if (missing.levels.length) console.error("✗ Levels in tree missing from LEVEL_TITLES:", missing.levels);
  if (missing.tiers.length) console.error("✗ Tiers in tree missing from TIER_TITLES:", missing.tiers);
  if (missing.atomic.length) console.error("✗ Atomic skills in tree missing from ATOMIC_TITLES:", missing.atomic);
  if (extras.levels.length) console.error("✗ LEVEL_TITLES has IDs not in tree:", extras.levels);
  if (extras.tiers.length) console.error("✗ TIER_TITLES has IDs not in tree:", extras.tiers);
  if (extras.atomic.length) console.error("✗ ATOMIC_TITLES has IDs not in tree:", extras.atomic);
  process.exit(1);
}

await copyFile(TREE_PATH, BACKUP_PATH);
await writeFile(TREE_PATH, JSON.stringify(tree, null, 2) + "\n", "utf8");

console.log("✓ Backup written: " + BACKUP_PATH);
console.log(`✓ Levels: ${counts.lvlChanged} rewritten, ${counts.lvlUnchanged} unchanged (${counts.lvlChanged + counts.lvlUnchanged} of 17).`);
console.log(`✓ Tiers:  ${counts.tierChanged} rewritten, ${counts.tierUnchanged} unchanged (${counts.tierChanged + counts.tierUnchanged} of 51).`);
console.log(`✓ Atomic: ${counts.atomicChanged} rewritten, ${counts.atomicUnchanged} unchanged (${counts.atomicChanged + counts.atomicUnchanged} of 78).`);
