// Validates a delivered reading question-bank level file against the skill
// tree and the engine's schema. This is the gate: malformed files bounce back
// with actionable messages BEFORE anything reaches production.
//
//   node scripts/validate-reading-bank.mjs L9
//   node scripts/validate-reading-bank.mjs L9 L10 L11      (multiple)
//   node scripts/validate-reading-bank.mjs all              (L9..L14)
//
// ERROR  = blocks the file (engine would break or content is mis-wired).
// WARN   = still a scaffold / advisory (e.g. AUTHOR: placeholders, no items).
// Exit code 1 if any ERROR in any file, else 0.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_DIR = path.join(ROOT, "data/reading-question-banks");
const tree = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/reading-skill-tree.json"), "utf8")
);

const ALLOWED_GATES = new Set(["E", "F", "G", "NONE"]);
const ALLOWED_MODES = new Set([
  "similarity-band",
  "sequence",
  "cloze",
  "rubric",
  "choice",
]);

const num = (v) => typeof v === "number" && Number.isFinite(v);
const str = (v) => typeof v === "string" && v.length > 0;
const arr = Array.isArray;

// tree skills by level → { bank_skill_id: treeSkill }
function treeSkillsForLevel(level) {
  const L = tree.levels.find((l) => l.id === level);
  if (!L) return null;
  const map = new Map();
  for (const t of L.tiers)
    for (const s of t.atomic_skills) map.set(s.bank_skill_id, s);
  return map;
}

function validateAnswerKey(ak, where, E) {
  if (!ak || typeof ak !== "object") return E(`${where}: missing answerKey`);
  if (!ALLOWED_MODES.has(ak.mode))
    return E(`${where}: answerKey.mode "${ak.mode}" invalid (allowed: ${[...ALLOWED_MODES].join(", ")})`);
  switch (ak.mode) {
    case "similarity-band":
      if (!str(ak.reference)) E(`${where}: similarity-band needs non-empty "reference"`);
      if (!ak.bands || !num(ak.bands.green) || !num(ak.bands.amber))
        E(`${where}: similarity-band needs bands.green & bands.amber (numbers 0–1)`);
      if (!num(ak.copyRejectAt)) E(`${where}: similarity-band needs "copyRejectAt" (number 0–1)`);
      break;
    case "sequence":
      if (!arr(ak.order) || ak.order.length < 2 || !ak.order.every(str))
        E(`${where}: sequence needs "order" (array of ≥2 non-empty strings)`);
      break;
    case "cloze":
      if (!arr(ak.blanks) || ak.blanks.length < 1)
        E(`${where}: cloze needs non-empty "blanks"`);
      else
        ak.blanks.forEach((b, i) => {
          if (!num(b.index) || !str(b.answer))
            E(`${where}: cloze blanks[${i}] needs numeric "index" and string "answer"`);
        });
      if (!num(ak.semanticEquivAt)) E(`${where}: cloze needs "semanticEquivAt"`);
      if (!num(ak.passAccuracy)) E(`${where}: cloze needs "passAccuracy"`);
      break;
    case "rubric":
      if (!arr(ak.checks) || ak.checks.length < 1)
        E(`${where}: rubric needs non-empty "checks"`);
      else
        ak.checks.forEach((c, i) => {
          if (!str(c.id) || !str(c.description))
            E(`${where}: rubric checks[${i}] needs string "id" and "description"`);
        });
      if (!num(ak.passFraction)) E(`${where}: rubric needs "passFraction" (0–1)`);
      break;
    case "choice":
      if (!arr(ak.options) || ak.options.length < 2 || !ak.options.every(str))
        E(`${where}: choice needs "options" (≥2 non-empty strings)`);
      if (!Number.isInteger(ak.correct) || ak.correct < 0 || (arr(ak.options) && ak.correct >= ak.options.length))
        E(`${where}: choice needs integer "correct" that indexes into options`);
      break;
  }
}

function validateLevel(tag) {
  // Accept either a level tag (L9 / 9) or a direct path to a .json file, so a
  // delivered file can be checked before it's placed in data/.
  const isPath = /\.json$/i.test(String(tag));
  const level = isPath
    ? parseInt(path.basename(String(tag)).replace(/[^0-9]/g, ""), 10)
    : parseInt(String(tag).replace(/[^0-9]/g, ""), 10);
  const file = isPath
    ? path.resolve(ROOT, String(tag))
    : path.join(BANK_DIR, `L${level}.json`);
  const errors = [];
  const warns = [];
  const E = (m) => errors.push(m);
  const W = (m) => warns.push(m);

  if (!fs.existsSync(file)) {
    console.log(`\n■ L${level}  — FILE NOT FOUND (${file})`);
    return { level, errors: 1, warns: 0 };
  }
  let bank;
  try {
    bank = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.log(`\n■ L${level}  — INVALID JSON: ${e.message}`);
    return { level, errors: 1, warns: 0 };
  }

  const expectGrade = level - 2;
  if (bank.level !== level) E(`top: level should be ${level}, got ${JSON.stringify(bank.level)}`);
  if (!ALLOWED_GATES.has(bank.gate)) E(`top: gate "${bank.gate}" invalid (expect "NONE" for L9+)`);
  if (!arr(bank.grades) || bank.grades[0] !== expectGrade)
    E(`top: grades should be [${expectGrade}], got ${JSON.stringify(bank.grades)}`);
  if (!arr(bank.texts)) E(`top: "texts" must be an array`);
  if (!arr(bank.skills)) E(`top: "skills" must be an array`);

  const treeMap = treeSkillsForLevel(level);
  if (!treeMap) E(`top: skill tree has no level ${level}`);

  const textIds = new Set((bank.texts || []).map((t) => t && t.id));
  (bank.texts || []).forEach((t, i) => {
    if (!str(t.id)) E(`texts[${i}]: missing "id"`);
    if (!str(t.body)) E(`texts[${t.id || i}]: missing "body"`);
  });

  const seenSkillIds = new Set();
  let authoredItems = 0;
  for (const s of bank.skills || []) {
    const w = `skill ${s.skillId || "?"}`;
    if (!str(s.skillId)) { E(`${w}: missing skillId`); continue; }
    if (seenSkillIds.has(s.skillId)) E(`${w}: duplicate skillId`);
    seenSkillIds.add(s.skillId);
    // ── ERROR: real engine-breakers (wiring + serving) ──
    if (treeMap && !treeMap.has(s.skillId))
      E(`${w}: not a skill in the L${level} skill tree (skillId must equal a tree bank_skill_id — do not rename)`);
    if (!arr(s.items)) { E(`${w}: "items" must be an array`); continue; }
    if (!str(s.defaultPrompt))
      E(`${w}: "defaultPrompt" must be a non-empty string (fallback question when an item has none)`);

    // ── WARN: authoring metadata the runtime does not read ──
    if (s.level !== level) W(`${w}: level says ${JSON.stringify(s.level)}, expected ${level}`);
    if (s.grade !== expectGrade) W(`${w}: grade says ${JSON.stringify(s.grade)}, expected ${expectGrade}`);
    if (!str(s.name)) W(`${w}: missing "name"`);
    if (!str(s.tier)) W(`${w}: missing "tier"`);
    if (!str(s.deliveryMode)) W(`${w}: missing "deliveryMode"`);
    if (!str(s.errorCode)) W(`${w}: missing "errorCode"`);
    if (!s.passCondition || typeof s.passCondition !== "object")
      W(`${w}: missing "passCondition" object`);
    else if (!str(s.passCondition.metric))
      W(`${w}: passCondition has no string "metric"`);
    if (!arr(s.tolerance)) W(`${w}: "tolerance" should be an array`);
    if (!arr(s.recovery)) W(`${w}: "recovery" should be an array`);

    if (/^AUTHOR:/.test(s.defaultPrompt || "")) W(`${w}: defaultPrompt still a placeholder`);
    if (/^AUTHOR:/.test(s.questionFormat || "")) W(`${w}: questionFormat still a placeholder`);
    if (s.items.length === 0) { W(`${w}: 0 items (not yet authored)`); continue; }

    const seenItemIds = new Set();
    s.items.forEach((it, i) => {
      const iw = `${w} item ${it.id || `#${i}`}`;
      if (!str(it.id)) E(`${iw}: missing item "id"`);
      else if (seenItemIds.has(it.id)) E(`${iw}: duplicate item id`);
      seenItemIds.add(it.id);
      if (!arr(it.errorSignals)) E(`${iw}: "errorSignals" must be an array`);
      if (typeof it.randomisable !== "boolean") E(`${iw}: "randomisable" must be true/false`);
      validateAnswerKey(it.answerKey, iw, E);
      const hasSource =
        it.textId || it.passage || it.procedureText || it.dataText ||
        it.contextSentence || it.prompt;
      if (it.textId && !textIds.has(it.textId))
        E(`${iw}: textId "${it.textId}" not found in texts[]`);
      if (!hasSource && it.answerKey && it.answerKey.mode !== "choice")
        W(`${iw}: no source text or prompt (textId/passage/prompt/...) — confirm intended`);
      authoredItems++;
    });
  }

  if (treeMap) {
    for (const id of treeMap.keys())
      if (!seenSkillIds.has(id))
        E(`coverage: tree skill "${id}" has no entry in the bank (every skill must be present)`);
  }

  const status = errors.length ? "✗ ERRORS" : warns.length ? "△ scaffold/advisory" : "✓ CLEAN";
  console.log(`\n■ L${level}  ${status}  (${(bank.skills||[]).length} skills, ${authoredItems} authored items)`);
  errors.forEach((m) => console.log(`   ✗ ERROR  ${m}`));
  if (errors.length > 12) {} // (already printed; kept simple)
  warns.slice(0, 30).forEach((m) => console.log(`   △ warn   ${m}`));
  if (warns.length > 30) console.log(`   △ warn   …and ${warns.length - 30} more warnings`);
  return { level, errors: errors.length, warns: warns.length };
}

let targets = process.argv.slice(2);
if (targets.length === 1 && targets[0].toLowerCase() === "all")
  targets = [9, 10, 11, 12, 13, 14];
if (targets.length === 0) {
  console.log("usage: node scripts/validate-reading-bank.mjs <L9|9> [more…] | all");
  process.exit(2);
}
let totalErr = 0;
for (const t of targets) {
  const r = validateLevel(t);
  totalErr += r.errors;
}
console.log(
  `\n${totalErr === 0 ? "✓ All checked files pass (no blocking errors)." : `✗ ${totalErr} blocking error(s) — file(s) not ready.`}`
);
process.exit(totalErr === 0 ? 0 : 1);
