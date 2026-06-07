#!/usr/bin/env node
/**
 * Generator for Grade 10 / Grade 11 Physical Sciences tap-native question banks.
 *
 * Usage: node scripts/gen-phys-sci-grade-bank.mjs 10
 *        node scripts/gen-phys-sci-grade-bank.mjs 11
 *
 * Reads compact authoring modules from data/grade-<G>-phys-sci-authoring/*.mjs,
 * expands them into the canonical Matric-compatible item schema (choice / numeric
 * / sequence), writes one per-skill JSON file into
 * data/grade-<G>-physical-sciences-question-banks/<skill>.json (for head-of-ed
 * review parity with the Grade 12 bank), and writes the combined bank file
 * data/grade-<G>-physical-sciences-question-bank.json that the selector imports.
 *
 * Compact authoring item forms (one object per item):
 *   choice  : { g:"A"|"B", q, a, d:[d1,d2], m?, x, e:[...], src?, ref? }
 *   numeric : { g, q, n:<number>, tol?, u?, m?, x, e:[...], src?, ref? }
 *   sequence: { g, q, seq:[step1, step2, ...], m?, x, e:[...], src?, ref? }
 * Defaults: m (marks) 2 for choice, 3 for numeric/sequence; passThreshold 0.7;
 * src "fresh". Correct choice option position is rotated by item index (i % 3)
 * so the answer is not always first.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const grade = process.argv[2];
if (grade !== "10" && grade !== "11") {
  console.error("Usage: node scripts/gen-phys-sci-grade-bank.mjs <10|11>");
  process.exit(1);
}

const SUBJECT = `grade-${grade}-physical-sciences`;
const SRC_DIR = path.resolve(process.cwd(), `data/grade-${grade}-phys-sci-authoring`);
const PER_SKILL_DIR = path.resolve(process.cwd(), `data/${SUBJECT}-question-banks`);
const OUT = path.resolve(process.cwd(), `data/${SUBJECT}-question-bank.json`);

function expandItem(skill, raw, i) {
  const id = `${skill}.q${String(i + 1).padStart(2, "0")}`;
  const base = {
    id,
    skill,
    gate: raw.g || "A",
    source: raw.src || "fresh",
    ...(raw.ref ? { source_ref: raw.ref } : {}),
    question: raw.q,
  };

  if (Array.isArray(raw.seq)) {
    const items = raw.seq.map((text, k) => ({ id: `s${k + 1}`, text }));
    return {
      ...base,
      answerMode: "sequence",
      items,
      expected_order: items.map((s) => s.id),
      marks: raw.m ?? 3,
      explanation: raw.x,
      errorSignals: raw.e || [],
      passThreshold: raw.pt ?? 0.7,
    };
  }

  if (typeof raw.n === "number") {
    return {
      ...base,
      answerMode: "numeric",
      expectedAnswer: raw.n,
      ...(raw.tol !== undefined ? { tolerance: raw.tol } : { tolerance: 0.05 }),
      ...(raw.u ? { unit: raw.u } : {}),
      marks: raw.m ?? 3,
      explanation: raw.x,
      errorSignals: raw.e || [],
      passThreshold: raw.pt ?? 0.7,
    };
  }

  // choice
  if (!raw.a || !Array.isArray(raw.d) || raw.d.length !== 2) {
    throw new Error(`${id}: choice item needs a correct answer 'a' and exactly two distractors 'd'`);
  }
  const pos = i % 3;
  const options = [...raw.d];
  options.splice(pos, 0, raw.a);
  return {
    ...base,
    answerMode: "choice",
    expectedAnswer: raw.a,
    marks: raw.m ?? 2,
    explanation: raw.x,
    errorSignals: raw.e || [],
    passThreshold: raw.pt ?? 0.7,
    options,
  };
}

function validateExpanded(it) {
  const problems = [];
  if (it.answerMode === "choice") {
    if (!it.options || it.options.length !== 3) problems.push("not 3 options");
    if (!it.options.includes(it.expectedAnswer)) problems.push("expectedAnswer not in options");
    if (new Set(it.options).size !== it.options.length) problems.push("duplicate options");
  } else if (it.answerMode === "numeric") {
    if (typeof it.expectedAnswer !== "number") problems.push("numeric expectedAnswer not a number");
  } else if (it.answerMode === "sequence") {
    if (!it.items || it.items.length < 2) problems.push("sequence needs >=2 steps");
    if (!it.expected_order || it.expected_order.length !== it.items.length) problems.push("expected_order mismatch");
  }
  if (!it.question) problems.push("missing question");
  if (!it.explanation) problems.push("missing explanation");
  return problems;
}

const files = (await fs.readdir(SRC_DIR)).filter((f) => /\.mjs$/.test(f)).sort();
await fs.mkdir(PER_SKILL_DIR, { recursive: true });

const skills = {};
let totalItems = 0;
let problemCount = 0;

for (const file of files) {
  const mod = await import(pathToFileURL(path.join(SRC_DIR, file)).href);
  const def = mod.default;
  if (!def || !def.skill) {
    console.error(`[skip] ${file} has no default export with a skill field`);
    continue;
  }
  const expanded = def.items.map((raw, i) => expandItem(def.skill, raw, i));
  for (const it of expanded) {
    const problems = validateExpanded(it);
    if (problems.length) {
      problemCount++;
      console.error(`  ✗ ${it.id}: ${problems.join("; ")}`);
    }
  }
  const skillObj = {
    skill: def.skill,
    skill_title: def.skill_title,
    grades: [Number(grade)],
    paper: def.paper,
    version: def.version || "1.0",
    ...(def.notes ? { notes: def.notes } : {}),
    items: expanded,
  };
  skills[def.skill] = skillObj;
  totalItems += expanded.length;
  await fs.writeFile(
    path.join(PER_SKILL_DIR, `${def.skill}.json`),
    JSON.stringify(skillObj, null, 2) + "\n",
    "utf8"
  );
}

const out = {
  subject: SUBJECT,
  version: "1.0",
  description: `Combined Grade ${grade} Physical Sciences question bank (tap-native: choice/numeric/sequence), produced by scripts/gen-phys-sci-grade-bank.mjs from data/grade-${grade}-phys-sci-authoring/*.mjs. Re-run after editing any authoring module.`,
  built_at: new Date().toISOString(),
  skills,
};

await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`Wrote ${OUT}`);
console.log(`  skills: ${Object.keys(skills).length}`);
console.log(`  total items: ${totalItems}`);
console.log(`  schema problems: ${problemCount}`);
if (problemCount > 0) process.exit(1);
