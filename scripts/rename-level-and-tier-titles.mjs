#!/usr/bin/env node
// One-shot: rewrite every level `title` (14) and tier `title` (55) in
// data/reading-skill-tree.json from teacher-jargon to parent-friendly phrasing.
// Run once and inspect the diff.
//
// What changes: only the `title` field on each level and each tier (69 total).
// What is preserved: id, description, atomic_skills, tiers, plus anything else.
//
// Safety: writes a fresh backup at data/reading-skill-tree.json.lvl-tier-bak
// before overwriting. Aborts if any level or tier id has no mapping below.

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TREE_PATH = resolve(__dirname, "..", "data", "reading-skill-tree.json");
const BACKUP_PATH = TREE_PATH + ".lvl-tier-bak";

// ─── 14 level titles ──────────────────────────────────────────────────────────
// One sentence per level, plain English. Grade noted in parentheses so parents
// can map level → school year at a glance. The skill-tree UI renders these as
// "Level N — <title>", so the level number isn't repeated inside the title.
// L3's "HARD GATE 1" engineering tag is dropped from the title — the gate
// state is shown separately in the UI via the hardGate styling, not the title.
const LEVEL_TITLES = {
  1: "Listening, talking and sound play (Grade R)",
  2: "Letters and their sounds (Grade 1)",
  3: "Spelling by sound — first foundation check (Grade 1–2)",
  4: "Reading words smoothly (Grade 2–3)",
  5: "Understanding what you read (Grade 3)",
  6: "Reading to learn (Grade 4)",
  7: "Reading for ideas and writing clear paragraphs (Grade 5)",
  8: "Thinking like a learner — cause, effect and summary (Grade 6)",
  9: "Reading and analysing arguments (Grade 7)",
  10: "Judging arguments and writing your own (Grade 8)",
  11: "Working with several sources (Grade 9)",
  12: "Building strong essays (Grade 10)",
  13: "Deeper reading and exam preparation (Grade 11)",
  14: "Reading and writing at matric exam level (Grade 12)",
};

// ─── 55 tier titles ───────────────────────────────────────────────────────────
// Same plain-English style as the atomic titles. Each tier groups 2–11 related
// skills; the title should describe what a parent would see the learner doing
// across the whole tier.
const TIER_TITLES = {
  // L1 — Grade R (oral foundations)
  "R1.T1": "Listening and learning new words",
  "R1.T2": "Speaking in full sentences",
  "R1.T3": "Playing with sounds inside words",

  // L2 — Grade 1 (alphabet)
  "R2.T1": "Letter sounds",
  "R2.T2": "Two-letter sounds and blends",
  "R2.T3": "Reading sounds quickly without thinking",

  // L3 — Grade 1–2 (encoding)
  "R3.T1": "Spelling short words",
  "R3.T2": "Spelling on their own",

  // L4 — Grade 2–3 (decoding & fluency)
  "R4.T1": "Reading new words by sound",
  "R4.T2": "Reading whole words at a glance",
  "R4.T3": "Reading aloud smoothly",

  // L5 — Grade 3 (comprehension)
  "R5.T1": "Finding answers and reading between the lines",
  "R5.T2": "Using new words and 'because'",
  "R5.T3": "Writing clear answers",

  // L6 — Grade 4 (academic reading begins)
  "R6.T1": "Understanding what a text is mainly about",
  "R6.T2": "Reading tables, charts and instructions",
  "R6.T3": "Writing clear paragraphs",

  // L7 — Grade 5 (structured writing)
  "R7.T1": "Reading for the gist and key details",
  "R7.T2": "Comparing information across texts",
  "R7.T3": "Writing more than one paragraph",
  "R7.T4": "Explaining ideas out loud",

  // L8 — Grade 6 (early academic reasoning)
  "R8.T1": "Cause, effect and audience",
  "R8.T2": "Summarising and comparing texts",
  "R8.T3": "Writing clear school-style essays",
  "R8.T4": "Explaining and defending ideas out loud",

  // L9 — Grade 7 (analytical reading)
  "R9.T1": "Picking apart an argument",
  "R9.T2": "Judging evidence and perspective",
  "R9.T3": "Writing and speaking about arguments",

  // L10 — Grade 8 (argument evaluation)
  "R10.T1": "Judging whether arguments work",
  "R10.T2": "Reading and combining several sources",
  "R10.T3": "Writing and giving structured arguments",

  // L11 — Grade 9 (synthesis & independence)
  "R11.T1": "Using sources carefully",
  "R11.T2": "Writing longer essays",
  "R11.T3": "Self-checking and presenting",

  // L12 — Grade 10 (FET)
  "R12.T1": "Structured argument writing",
  "R12.T2": "Deeper analysis of texts",
  "R12.T3": "Independent essay writing",
  "R12.T4": "Reading and understanding unseen texts",
  "R12.T5": "Letters, speeches and articles",
  "R12.T6": "Grammar, punctuation and editing",
  "R12.T7": "Speaking and listening",

  // L13 — Grade 11 (FET)
  "R13.T1": "Deeper literary analysis",
  "R13.T2": "Comparing across texts",
  "R13.T3": "Reading the bigger picture (ideology and media)",
  "R13.T4": "Reading and understanding unseen texts",
  "R13.T5": "Reports, reviews and dialogues",
  "R13.T6": "Editing for clarity and precision",
  "R13.T7": "Extended speaking and listening",

  // L14 — Grade 12 (FET / NSC)
  "R14.T1": "Exam-precise responses",
  "R14.T2": "Mature, layered thinking",
  "R14.T3": "Distinction-level writing",
  "R14.T4": "Reading and understanding unseen texts",
  "R14.T5": "Formal articles, interviews and speeches",
  "R14.T6": "Polishing language to exam standard",
  "R14.T7": "Speaking and listening at exam standard",
};

// ─── Run ──────────────────────────────────────────────────────────────────────
const raw = await readFile(TREE_PATH, "utf8");
const tree = JSON.parse(raw);

const seenLevels = new Set();
const seenTiers = new Set();
const missingLevels = [];
const missingTiers = [];
let lvlChanged = 0, lvlUnchanged = 0;
let tierChanged = 0, tierUnchanged = 0;

for (const level of tree.levels) {
  seenLevels.add(level.id);
  const newLvl = LEVEL_TITLES[level.id];
  if (newLvl == null) {
    missingLevels.push(level.id);
  } else if (level.title === newLvl) {
    lvlUnchanged++;
  } else {
    level.title = newLvl;
    lvlChanged++;
  }

  for (const tier of level.tiers) {
    seenTiers.add(tier.id);
    const newTier = TIER_TITLES[tier.id];
    if (newTier == null) {
      missingTiers.push(tier.id);
    } else if (tier.title === newTier) {
      tierUnchanged++;
    } else {
      tier.title = newTier;
      tierChanged++;
    }
  }
}

const extraLevels = Object.keys(LEVEL_TITLES).map(Number).filter((id) => !seenLevels.has(id));
const extraTiers = Object.keys(TIER_TITLES).filter((id) => !seenTiers.has(id));

if (missingLevels.length || missingTiers.length || extraLevels.length || extraTiers.length) {
  if (missingLevels.length) console.error("✗ Levels in tree but missing from LEVEL_TITLES:", missingLevels);
  if (missingTiers.length) console.error("✗ Tiers in tree but missing from TIER_TITLES:", missingTiers);
  if (extraLevels.length) console.error("✗ LEVEL_TITLES has IDs not in tree:", extraLevels);
  if (extraTiers.length) console.error("✗ TIER_TITLES has IDs not in tree:", extraTiers);
  process.exit(1);
}

await copyFile(TREE_PATH, BACKUP_PATH);
await writeFile(TREE_PATH, JSON.stringify(tree, null, 2) + "\n", "utf8");

console.log("✓ Backup written: " + BACKUP_PATH);
console.log(`✓ Levels: ${lvlChanged} rewritten, ${lvlUnchanged} unchanged (14 covered).`);
console.log(`✓ Tiers:  ${tierChanged} rewritten, ${tierUnchanged} unchanged (55 covered).`);
