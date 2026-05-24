// Normalise the L13 and L14 authored banks (Downloads) into the canonical
// reading-bank schema by INJECTING items into each pre-wired scaffold rather
// than rebuilding skill metadata. Same approach as scripts/normalize-l12.mjs;
// L13/L14 share L12's structurally-clean shape:
//   - every item already uses canonical rubric answerKey
//     (mode/checks[id,description]/passFraction) — no rubric reshaping needed.
//   - every source either is inline `passage` or is missing entirely
//     (pure writing/composition prompts, no textIds pool to resolve).
//     route.ts serves item.passage when present; for prompt-only items the
//     full `stimulus` is what the learner sees as the question.
//   - the authored `question` is a one-line restatement; the full task with
//     all constraints (word count, structure, register) lives in `stimulus`.
//     route.ts serves `item.question || item.prompt || defaultPrompt`, so we
//     fold the full stimulus into the served field — otherwise the learner
//     never sees the constraints.
// Faithful: original fields are preserved; nothing is dropped. Anything
// uncertain is flagged _needsReview, not silently broken.
//
// Run: node scripts/normalize-l13-l14.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DL = "C:/Users/keega/Downloads";

const str = (v) => typeof v === "string" && v.trim().length > 0;

function canonAnswerKey(ak, flag) {
  if (!ak || ak.mode !== "rubric") {
    flag(`unexpected answerKey.mode ${JSON.stringify(ak && ak.mode)}`);
    return { mode: "rubric", checks: [{ id: "CHECK_1", description: "Answer meets the skill requirements." }], passFraction: 0.6 };
  }
  const checks = (Array.isArray(ak.checks) ? ak.checks : []).map((c, i) => ({
    id: str(c.id) ? c.id : `CHECK_${i + 1}`,
    description: str(c.description) ? c.description : (typeof c === "string" ? c : JSON.stringify(c)),
    // Preserve authored rubric extras (observableSignals, component, scoringMode,
    // weight, etc.) so nothing the head of ed wrote is lost.
    ...Object.fromEntries(Object.entries(c).filter(([k]) => k !== "id" && k !== "description")),
  }));
  if (!checks.length) {
    flag("rubric has no checks");
    checks.push({ id: "CHECK_1", description: "Answer meets the skill requirements." });
  }
  return {
    mode: "rubric",
    checks,
    passFraction: typeof ak.passFraction === "number" ? ak.passFraction : 0.6,
    ...(ak.compulsoryCheck ? { compulsoryCheck: ak.compulsoryCheck } : {}),
    // Preserve any other authored answerKey-level fields (e.g. scoringPolicy).
    ...Object.fromEntries(Object.entries(ak).filter(([k]) => !["mode", "checks", "passFraction", "compulsoryCheck"].includes(k))),
  };
}

function canonItem(it) {
  const reviews = [];
  const flag = (why) => reviews.push(why);

  const stimulus = str(it.stimulus) ? it.stimulus.trim() : "";
  const ask = str(it.question) ? it.question.trim() : "";
  let served = stimulus;
  if (ask && !stimulus.includes(ask)) served = stimulus ? `${stimulus}\n\nTask: ${ask}` : ask;
  if (!served) flag("no stimulus/question — nothing to serve");

  const out = {
    ...it,
    id: it.id,
    errorSignals: Array.isArray(it.errorSignals) ? it.errorSignals : [],
    randomisable: typeof it.randomisable === "boolean" ? it.randomisable : true,
    answerKey: canonAnswerKey(it.answerKey, flag),
  };
  if (str(it.passage)) out.passage = it.passage;
  out.question = served;
  out.prompt = stimulus || served; // satisfies validator hasSource for prompt-only items

  if (reviews.length) out._needsReview = reviews.join("; ");
  return out;
}

function processLevel(level) {
  const BANK = join(root, `data/reading-question-banks/${level}.json`);
  const AUTH = join(DL, `${level}.json`);

  const scaffold = JSON.parse(readFileSync(BANK, "utf8"));
  const authored = JSON.parse(readFileSync(AUTH, "utf8"));
  const bySkill = new Map(authored.skills.map((s) => [s.skillId, s]));

  scaffold.bankVersion = "1.0";
  scaffold.texts = Array.isArray(scaffold.texts) ? scaffold.texts : [];

  const flags = [];
  let totalItems = 0;

  for (const sk of scaffold.skills) {
    const a = bySkill.get(sk.skillId);
    if (!a) { flags.push(`scaffold skill ${sk.skillId} has no authored counterpart`); continue; }

    if (!str(sk.defaultPrompt) || /^AUTHOR:/.test(sk.defaultPrompt))
      sk.defaultPrompt = `Complete the "${sk.name || sk.skillId}" task: read any source material provided and write the response described.`;
    if (/^AUTHOR:/.test(sk.questionFormat || ""))
      sk.questionFormat = `Extended written response for "${sk.name || sk.skillId}", scored against the rubric.`;
    if (!Array.isArray(sk.tolerance)) sk.tolerance = [];
    if (!Array.isArray(sk.recovery)) sk.recovery = [];

    const seen = new Set();
    sk.items = a.items.map((it) => {
      if (seen.has(it.id)) flags.push(`${sk.skillId}: duplicate item id ${it.id}`);
      seen.add(it.id);
      return canonItem(it);
    });
    totalItems += sk.items.length;
    bySkill.delete(sk.skillId);
  }

  for (const leftover of bySkill.keys())
    flags.push(`authored skill ${leftover} is not in the scaffold/skill tree — skipped`);

  const reviews = scaffold.skills.flatMap((s) =>
    (s.items || []).filter((i) => i._needsReview).map((i) => `${s.skillId}/${i.id}: ${i._needsReview}`)
  );

  writeFileSync(BANK, JSON.stringify(scaffold, null, 2));

  const modes = {};
  let withPassage = 0, promptOnly = 0;
  for (const s of scaffold.skills) for (const i of s.items || []) {
    modes[i.answerKey.mode] = (modes[i.answerKey.mode] || 0) + 1;
    if (i.passage) withPassage++; else promptOnly++;
  }
  console.log(
    `${level}: ${scaffold.skills.length} skills, ${totalItems} items, ${scaffold.texts.length} texts, modes=${JSON.stringify(modes)}, passage=${withPassage}, prompt-only=${promptOnly}`
  );
  if (flags.length) console.log(`  structural flags (${flags.length}):\n   ` + flags.join("\n   "));
  if (reviews.length) console.log(`  _needsReview (${reviews.length}):\n   ` + reviews.slice(0, 20).join("\n   ") + (reviews.length > 20 ? `\n   …and ${reviews.length - 20} more` : ""));
  return flags.length + reviews.length;
}

let total = 0;
for (const lvl of ["L13", "L14"]) total += processLevel(lvl);
console.log(total ? `\n${total} item(s) flagged for review` : "\nclean — nothing flagged");
