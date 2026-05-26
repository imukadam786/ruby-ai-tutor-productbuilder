// Align Life Skills mastery metadata with actual engine behaviour.
// The runtime gates topics on topic.questions.length (the pool), so a student
// only "masters" a topic after attempting every authored item. The bank's
// `questions_for_mastery` and the tree's `mastery_criteria.correct_required`
// were left at FP-launch defaults (3 or 4), which told a misleading story:
// "mastery at 5" suggested the student could stop short. Aligning both fields
// to `target_item_count` so the metadata matches what really happens.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");
const TREE_PATH = path.join(ROOT, "data/life-skills-skill-tree.json");

const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
const tree = JSON.parse(fs.readFileSync(TREE_PATH, "utf8"));

let bankChanged = 0;
for (const [id, topic] of Object.entries(bank.topics)) {
  const target = topic.target_item_count ?? topic.questions.length;
  if (topic.questions_for_mastery !== target) {
    topic.questions_for_mastery = target;
    bankChanged += 1;
  }
}

let treeChanged = 0;
for (const level of tree.levels) {
  for (const tier of level.tiers ?? []) {
    for (const skill of tier.atomic_skills ?? []) {
      const topic = bank.topics[skill.bank_skill_id];
      const target = topic?.target_item_count ?? topic?.questions.length;
      if (!target) continue;
      if (skill.mastery_criteria.correct_required !== target) {
        skill.mastery_criteria.correct_required = target;
        treeChanged += 1;
      }
    }
  }
}

fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2));
fs.writeFileSync(TREE_PATH, JSON.stringify(tree, null, 2));

console.log(`✓ Bank: updated questions_for_mastery on ${bankChanged} topics.`);
console.log(`✓ Tree: updated mastery_criteria.correct_required on ${treeChanged} atomic skills.`);
