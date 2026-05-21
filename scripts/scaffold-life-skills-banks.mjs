// Scaffold Life Skills bank shells from the skill tree.
//
//   node scripts/scaffold-life-skills-banks.mjs
//   node scripts/scaffold-life-skills-banks.mjs --force   (overwrite existing)
//
// Reads `data/life-skills-skill-tree.json` and emits one bank file per atomic
// skill into `data/life-skills-question-banks/<bank_skill_id>.json`. Each file
// is a flat scaffold: skill metadata pre-wired, `questions[]` empty for the
// head of education to fill in. Mirrors the per-topic split (not the Maths
// monolithic shape) and the BankQuestion item type from
// `lib/question-selector.ts` (item field is `input_type`, not `answerMode`).
//
// By default this script will NOT overwrite existing bank files — once content
// is authored, only --force will replace it (use with care).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TREE_PATH = path.join(ROOT, "data/life-skills-skill-tree.json");
const BANK_DIR = path.join(ROOT, "data/life-skills-question-banks");
const FORCE = process.argv.includes("--force");

const ITEM_DENSITY = { 1: 15, 2: 15, 3: 20, 4: 15 }; // top of locked range (10–15 L1/L2, 15–20 L3)
const PASS_THRESHOLD = 0.6; // CAPS Foundation Phase: "achieved" band

function bankShell(level, tier, skill) {
  return {
    version: "1.0",
    topic_id: skill.id,
    title: skill.title,
    description: skill.description,
    grade: level.grade,
    strand: tier.title,
    skill_ids: [skill.bank_skill_id],
    gate: "NONE",
    pass_threshold: PASS_THRESHOLD,
    questions_for_mastery: skill.mastery_criteria?.correct_required ?? 3,
    target_item_count: ITEM_DENSITY[level.grade] ?? 12,
    caps_term: skill.caps_term ?? null,
    sensitive: skill.sensitive === true,
    templates: skill.templates ?? [],
    recovery_strategy: skill.recovery_strategy ?? null,
    questions: [],
  };
}

function main() {
  if (!fs.existsSync(TREE_PATH)) {
    console.error(`ERROR: tree not found at ${TREE_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(BANK_DIR)) {
    fs.mkdirSync(BANK_DIR, { recursive: true });
    console.log(`Created ${BANK_DIR}`);
  }

  const tree = JSON.parse(fs.readFileSync(TREE_PATH, "utf8"));
  let wrote = 0;
  let skipped = 0;
  let blocked = 0;

  for (const level of tree.levels) {
    if (!level.tiers || level.tiers.length === 0) {
      console.log(`L${level.id} (Grade ${level.grade}): no tiers — skipping (likely blocked on source doc)`);
      blocked++;
      continue;
    }
    for (const tier of level.tiers) {
      for (const skill of tier.atomic_skills ?? []) {
        const out = path.join(BANK_DIR, `${skill.bank_skill_id}.json`);
        if (fs.existsSync(out) && !FORCE) {
          skipped++;
          continue;
        }
        fs.writeFileSync(out, JSON.stringify(bankShell(level, tier, skill), null, 2) + "\n");
        wrote++;
      }
    }
  }

  console.log(`\nScaffold complete.`);
  console.log(`  wrote:   ${wrote} bank file(s)`);
  console.log(`  skipped: ${skipped} (already exist; use --force to overwrite)`);
  console.log(`  blocked: ${blocked} level(s) awaiting source content`);
  console.log(`\nNext: head of education fills questions[] in each bank file.`);
}

main();
