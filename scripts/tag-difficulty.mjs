/**
 * tag-difficulty.mjs
 *
 * Assigns a difficulty score (1–5) to every question in:
 *   1. data/question-bank.json         (maths practice — 778 questions)
 *   2. data/question-banks/1-50.json   (reading diagnostic + warmup bank)
 *
 * Difficulty is computed heuristically by domain base + position-within-domain.
 * After running, review the CSV output and correct any errors before the next step.
 *
 * Usage:
 *   node scripts/tag-difficulty.mjs
 *
 * Outputs:
 *   difficulty-tags-maths.csv    — one row per maths question
 *   difficulty-tags-reading.csv  — one row per reading warmup question
 *   data/question-bank.tagged.json  — question-bank.json with difficulty added
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Domain-level difficulty configuration ────────────────────────────────────
// base: starting difficulty (first question in domain)
// range: how much difficulty increases from first → last question (spread)
const DOMAIN_CONFIG = {
  M001: { base: 1, range: 1, label: "Counting and Cardinality" },
  M002: { base: 1, range: 1, label: "Number Sequences" },
  M003: { base: 2, range: 1, label: "Place Value" },
  M004: { base: 1, range: 2, label: "Addition" },
  M005: { base: 1, range: 2, label: "Subtraction" },
  M006: { base: 2, range: 2, label: "Multiplication" },
  M007: { base: 2, range: 1, label: "Decomposition / Division Intro" },
  M008: { base: 3, range: 1, label: "Fractions" },
  M_DEC: { base: 3, range: 1, label: "Decimals" },
  M009: { base: 3, range: 2, label: "Ratio and Proportion" },
  M010: { base: 3, range: 1, label: "Negative Numbers / BODMAS" },
  M011: { base: 3, range: 2, label: "Algebra — Patterns and Variables" },
  M012: { base: 4, range: 0, label: "Linear Equations" },
  M013: { base: 4, range: 1, label: "Geometry / Quadratics" },
  M014: { base: 4, range: 1, label: "Statistics / Functions" },
  M015: { base: 4, range: 1, label: "Logarithms" },
  M016: { base: 5, range: 0, label: "Trigonometry" },
  M017: { base: 5, range: 0, label: "Calculus" },
  M018: { base: 5, range: 0, label: "Advanced Problem Solving" },
};

// ─── Reading skill difficulty by skill ID prefix ──────────────────────────────
const READING_SKILL_DIFFICULTY = {
  "R1.T1": 1,
  "R1.T2": 1,
  "R1.T3": 2,
  "R2.T1": 2,
  "R2.T2": 2,
  "R2.T3": 3,
  "R3.T1": 3,
  "R3.T2": 3,
  "R4.T1": 3,
  "R4.T2": 4,
  "R4.T3": 4,
  "R5.T1": 4,
  "R5.T2": 5,
  "R5.T3": 5,
};

function getReadingDifficulty(skillId) {
  if (!skillId) return 3;
  const tier = skillId.split(".").slice(0, 2).join(".");
  return READING_SKILL_DIFFICULTY[tier] ?? 3;
}

// ─── Maths difficulty by position within domain ───────────────────────────────
function getMathsDifficulty(domainId, index, total) {
  const config = DOMAIN_CONFIG[domainId];
  if (!config) return 3;
  const { base, range } = config;
  const fraction = total > 1 ? index / (total - 1) : 0;
  const raw = base + fraction * range;
  return Math.min(5, Math.max(1, Math.round(raw)));
}

// ─── Process maths question bank ─────────────────────────────────────────────
function processMathsBank() {
  const bankPath = join(ROOT, "data", "question-bank.json");
  if (!existsSync(bankPath)) {
    console.error("❌ data/question-bank.json not found");
    return [];
  }

  const bank = JSON.parse(readFileSync(bankPath, "utf-8"));
  const rows = [];
  const taggedBank = { ...bank, domains: {} };

  for (const [domainId, domain] of Object.entries(bank.domains)) {
    const questions = domain.questions;
    const taggedQuestions = questions.map((q, i) => {
      const difficulty = getMathsDifficulty(domainId, i, questions.length);
      rows.push({
        domain: domainId,
        domain_label: DOMAIN_CONFIG[domainId]?.label ?? domainId,
        ref: q.ref,
        question: (q.ruby_prompt || q.question || "").replace(/"/g, "'").slice(0, 120),
        expected: q.expected ?? "",
        difficulty,
        notes: "",
      });
      return { ...q, difficulty };
    });
    taggedBank.domains[domainId] = { ...domain, questions: taggedQuestions };
  }

  // Write tagged bank
  const outPath = join(ROOT, "data", "question-bank.tagged.json");
  writeFileSync(outPath, JSON.stringify(taggedBank, null, 2), "utf-8");
  console.log(`✅ Maths bank tagged → ${outPath}`);

  return rows;
}

// ─── Process reading warmup bank files ───────────────────────────────────────
function processReadingBanks() {
  const banksDir = join(ROOT, "data", "question-banks");
  const rows = [];

  for (let i = 1; i <= 50; i++) {
    const filePath = join(banksDir, `${i}.json`);
    if (!existsSync(filePath)) continue;

    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    const questions = Array.isArray(data) ? data : data.questions ?? [];

    for (const q of questions) {
      // Only process phase 2 (warmup) questions
      if (q.phase !== 2) continue;

      const difficulty = getReadingDifficulty(q.skillId);
      rows.push({
        bank_file: i,
        question_id: q.id ?? "",
        skill_id: q.skillId ?? "",
        domain_code: q.domainCode ?? "",
        question: (q.question ?? "").replace(/"/g, "'").slice(0, 120),
        answer_mode: q.answerMode ?? "",
        difficulty,
        notes: "",
      });
    }
  }

  return rows;
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────
function toCSV(headers, rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = headers.join(",");
  const body = rows.map((r) => headers.map((h) => escape(r[h])).join(",")).join("\n");
  return `${header}\n${body}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log("🏷  Tagging question difficulty…\n");

const mathsRows = processMathsBank();
const mathsCSV = toCSV(
  ["domain", "domain_label", "ref", "question", "expected", "difficulty", "notes"],
  mathsRows
);
const mathsOut = join(ROOT, "difficulty-tags-maths.csv");
writeFileSync(mathsOut, mathsCSV, "utf-8");
console.log(`✅ Maths CSV (${mathsRows.length} questions) → ${mathsOut}`);

const readingRows = processReadingBanks();
if (readingRows.length > 0) {
  const readingCSV = toCSV(
    ["bank_file", "question_id", "skill_id", "domain_code", "question", "answer_mode", "difficulty", "notes"],
    readingRows
  );
  const readingOut = join(ROOT, "difficulty-tags-reading.csv");
  writeFileSync(readingOut, readingCSV, "utf-8");
  console.log(`✅ Reading CSV (${readingRows.length} warmup questions) → ${readingOut}`);
} else {
  console.log("ℹ️  No phase-2 reading questions found — check data/question-banks/ files.");
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next steps:
  1. Open difficulty-tags-maths.csv and difficulty-tags-reading.csv
  2. Review difficulty column (1 = easiest, 5 = hardest)
  3. Fill in the 'notes' column for any corrections
  4. Once approved, the difficulty values bake into question-bank.tagged.json
     and will be used by the BKT-aware question selector automatically.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
