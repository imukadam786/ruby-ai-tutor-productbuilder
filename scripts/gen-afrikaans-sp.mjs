#!/usr/bin/env node
// Merge the Senior Phase (Grades 7-9) Afrikaans FAL content into the consolidated
// skill tree + question bank. IDEMPOTENT: strips any existing G7/G8/G9 levels and
// bank skills first, then inserts freshly-generated content in correct grade order
// (after Grade 6, before Grade 10). Foundation/Intermediate (1-6) and FET (10-12)
// content is left untouched.
//
//   source : data/afrikaans-sp-authoring/g7.mjs, g8.mjs, g9.mjs
//   targets: data/afrikaans-skill-tree.json, data/afrikaans-question-bank.json
//
// Run: node scripts/gen-afrikaans-sp.mjs   (then validate-afrikaans-bank.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TREE_PATH = join(ROOT, "data", "afrikaans-skill-tree.json");
const BANK_PATH = join(ROOT, "data", "afrikaans-question-bank.json");
const SP_GRADES = [7, 8, 9];

const PROGRESSION = {
  model: "practice-through",
  complete_when: "all_items_correct_once",
  reteach_on_error: true,
  requeue_missed: true,
  allow_scaffolding: true,
  blocks_progress: false,
};

const pad2 = (n) => String(n).padStart(2, "0");
const stripGloss = (s) => s.replace(/\s*\([^)]*\)\s*$/, "").trim();

// Resolve a prerequisite shorthand to a full skill id.
//  "LUI.01"           -> AF.G{grade}.LUI.01   (same grade)
//  "AF.G6.LEE.02"     -> passthrough (already a full id)
function resolvePrereq(grade, pre) {
  if (pre.startsWith("AF.")) return pre;
  return `AF.G${grade}.${pre}`;
}

function buildGrade(spec) {
  const { id: grade } = spec;
  const treeTiers = [];
  const bankSkills = {};

  for (const tier of spec.tiers) {
    const tierId = `AF.G${grade}.${tier.code}`;
    const atomic = [];

    for (const sk of tier.skills) {
      const skillId = `AF.G${grade}.${tier.code}.${sk.n}`;
      const templates = sk.templates ?? ["choice"];
      const caps = sk.caps_term ?? "T1-T4";

      // ── tree node ──────────────────────────────────────────────
      atomic.push({
        id: skillId,
        bank_skill_id: skillId,
        title: sk.title,
        description: sk.desc,
        caps_term: caps,
        prerequisites: (sk.prereq ?? []).map((p) => resolvePrereq(grade, p)),
        templates,
        error_signatures: sk.error_signatures ?? [],
        recovery_strategy: sk.recovery,
        progression: { ...PROGRESSION },
      });

      // ── bank entry ─────────────────────────────────────────────
      const questions = (sk.q ?? []).map((item, i) => {
        const ref = `G${grade}${tier.code}${sk.n}.${pad2(i + 1)}`;
        const out = {
          ref,
          question: item.q,
          input_type: item.t ?? "choice",
          options: item.o,
          expected: item.x,
          memo: item.m,
          error_signals: item.e ?? sk.defErr ?? ["ERR_AF_GENERAL"],
          difficulty: item.d ?? 2,
        };
        if (item.a != null) out.audio = item.a;     // listening
        if (item.c != null) out.context = item.c;    // reading passage
        if (item.img != null) out.image_refs = item.img;
        // sequence/text items legitimately have no options
        if (out.options == null) delete out.options;
        return out;
      });

      bankSkills[skillId] = {
        title: sk.btitle ?? stripGloss(sk.title),
        description: sk.bdesc ?? sk.desc,
        grade,
        strand: tier.strand,
        skill_ids: [skillId],
        gate: "NONE",
        complete_when: "all_items_correct_once",
        reteach_on_error: true,
        target_item_count: 20,
        caps_term: caps,
        sensitive: false,
        templates,
        recovery_strategy: sk.recovery,
        questions,
      };
    }

    treeTiers.push({
      id: tierId,
      title: tier.title,
      description: tier.description,
      atomic_skills: atomic,
    });
  }

  const level = {
    id: grade,
    grade,
    title: spec.title,
    description: spec.description,
    tiers: treeTiers,
  };
  return { level, bankSkills };
}

// ── Load authoring modules (skip grades not yet authored) ─────────────────────
const built = [];
for (const g of SP_GRADES) {
  try {
    const m = await import(`../data/afrikaans-sp-authoring/g${g}.mjs`);
    built.push(buildGrade(m.GRADE));
  } catch (e) {
    if (e.code === "ERR_MODULE_NOT_FOUND") {
      console.log(`(skipping Grade ${g}: authoring module not found yet)`);
    } else {
      throw e;
    }
  }
}

// ── Merge into the tree ───────────────────────────────────────────────────────
const tree = JSON.parse(readFileSync(TREE_PATH, "utf8"));
tree.levels = tree.levels.filter((l) => !SP_GRADES.includes(l.grade));
for (const { level } of built) tree.levels.push(level);
tree.levels.sort((a, b) => a.grade - b.grade);

// ── Merge into the bank ───────────────────────────────────────────────────────
const bank = JSON.parse(readFileSync(BANK_PATH, "utf8"));
for (const key of Object.keys(bank.skills)) {
  const m = key.match(/^AF\.G(\d+)\./);
  if (m && SP_GRADES.includes(Number(m[1]))) delete bank.skills[key];
}
// preserve grade order: rebuild the skills map 1..12
const merged = {};
const allSp = Object.assign({}, ...built.map((b) => b.bankSkills));
const ordered = Object.keys(bank.skills).concat(Object.keys(allSp));
const gradeOf = (k) => Number(k.match(/^AF\.G(\d+)\./)?.[1] ?? 0);
ordered.sort((a, b) => gradeOf(a) - gradeOf(b) || a.localeCompare(b));
for (const k of ordered) merged[k] = bank.skills[k] ?? allSp[k];
bank.skills = merged;

writeFileSync(TREE_PATH, JSON.stringify(tree, null, 2) + "\n");
writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2) + "\n");

// ── Report ────────────────────────────────────────────────────────────────────
let skills = 0, items = 0;
for (const { level, bankSkills } of built) {
  const s = Object.keys(bankSkills).length;
  const it = Object.values(bankSkills).reduce((n, e) => n + e.questions.length, 0);
  skills += s; items += it;
  const tiers = level.tiers.map((t) => `${t.id.split(".").pop()}:${t.atomic_skills.length}`).join(" ");
  console.log(`Grade ${level.grade}: ${s} skills, ${it} items  [${tiers}]`);
}
console.log(`\nTotal SP: ${skills} skills, ${items} items merged.`);
