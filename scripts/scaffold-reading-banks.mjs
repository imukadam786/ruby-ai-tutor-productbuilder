// Generates per-level scaffold question-bank files L9.json..L14.json from the
// merged skill tree. Every skill is pre-wired (correct skillId, level, tier,
// grade, error code, recovery) so the head of education only fills `texts[]`
// and each skill's `items[]`. Re-runnable; SKIPS a level file if it already
// exists (so authored content is never overwritten).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const tree = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/reading-skill-tree.json"), "utf8")
);
const OUT_DIR = path.join(ROOT, "data/reading-question-banks");

const deliveryFor = (templates) => {
  const t = new Set(templates || []);
  if (t.has("voice") && t.size === 1) return "VOICE";
  if (t.has("written") && !t.has("reading")) return "TEXT";
  return "HYBRID";
};
const errCode = (sigs) =>
  sigs && sigs.length
    ? "ERR_" + String(sigs[0].type).toUpperCase()
    : "ERR_REVIEW";

let summary = [];
for (const L of tree.levels) {
  if (L.id < 9) continue; // only the new Senior/FET levels
  const grade = L.id - 2; // L9->Gr7 ... L14->Gr12
  const outPath = path.join(OUT_DIR, `L${L.id}.json`);
  if (fs.existsSync(outPath)) {
    summary.push(`L${L.id}: SKIPPED (already exists — not overwriting)`);
    continue;
  }

  const skills = [];
  L.tiers.forEach((tier, tIdx) => {
    const tierNo = tIdx + 1;
    tier.atomic_skills.forEach((s) => {
      const recovery = (s.error_signatures || []).map((sig) => ({
        errorVariant: String(sig.type).toUpperCase(),
        action: s.recovery_strategy || "AUTHOR: recovery action",
      }));
      skills.push({
        skillId: s.bank_skill_id, // e.g. "L9.A1" — matches tree.bank_skill_id
        name: s.title,
        gate: "NONE",
        level: L.id,
        tier: `${tierNo} — ${tier.title}`,
        grade,
        description: s.description,
        deliveryMode: deliveryFor(s.templates),
        questionFormat: "AUTHOR: describe the answer expected (e.g. '1 sentence stating the central argument')",
        defaultPrompt: "AUTHOR: the question shown to the learner",
        errorCode: errCode(s.error_signatures),
        passCondition: {
          metric: "accuracy",
          threshold: 0.6,
          amberFloor: 0.4,
          texts: 8,
          sessions: 2,
        },
        tolerance: [],
        recovery,
        items: [], // AUTHOR fills — see READING_BANK_AUTHORING_GUIDE.md
      });
    });
  });

  const bank = {
    $comment: `L${L.id} = Grade ${grade}. SCAFFOLD — author fills texts[] and each skill's items[]. ` +
      `Skill structure is pre-wired to the skill tree; do not change skillId/level/tier/grade. ` +
      `See data/reading-question-banks/READING_BANK_AUTHORING_GUIDE.md. ` +
      `Validate with: node scripts/validate-reading-bank.mjs L${L.id}`,
    level: L.id,
    gate: "NONE",
    specVersion: L.id <= 11 ? "Senior v1.1" : "FET v1.0 (no-timer, 60%)",
    bankVersion: "0.1-scaffold",
    grades: [grade],
    texts: [],
    skills,
  };
  fs.writeFileSync(outPath, JSON.stringify(bank, null, 2) + "\n");
  summary.push(`L${L.id}: written — ${skills.length} skills, Grade ${grade}`);
}
console.log(summary.join("\n"));
