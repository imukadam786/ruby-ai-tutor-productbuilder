// Merge one authored topic into the Business Studies question bank, then verify.
// Usage: node scripts/merge-bs-topic.mjs <topic-json-file>
// The topic file is a JSON object: { "<SKILL_ID>": { ...topic... } }
import { readFileSync, writeFileSync } from "node:fs";

const bankPath = "data/business-studies-question-bank.json";
const topicPath = process.argv[2];
if (!topicPath) {
  console.error("Usage: node scripts/merge-bs-topic.mjs <topic-json-file>");
  process.exit(1);
}

const bank = JSON.parse(readFileSync(bankPath, "utf8"));
const incoming = JSON.parse(readFileSync(topicPath, "utf8"));

const skillIds = Object.keys(incoming);

// ── Validate each incoming pool before writing ────────────────────────────────
const problems = [];
function check(cond, ref, msg) {
  if (!cond) problems.push(`${ref}: ${msg}`);
}
for (const id of skillIds) {
  for (const q of incoming[id].questions) {
    const r = q.ref;
    switch (q.input_type) {
      case "choice":
      case "cloze":
      case "sequence":
        check(Array.isArray(q.options) && q.options.length >= 2, r, "missing options");
        check(q.options?.includes(q.expected), r, "expected not in options");
        break;
      case "true-false":
        check(JSON.stringify(q.options) === JSON.stringify(["True", "False"]), r, "tf options must be [True,False]");
        check(q.expected === "True" || q.expected === "False", r, "tf expected must be True/False");
        break;
      case "sort-buckets": {
        const ids = new Set((q.buckets ?? []).map((b) => b.id));
        check(ids.size >= 2, r, "need ≥2 buckets");
        for (const it of q.items ?? []) check(ids.has(it.correct_bucket), r, `item ${it.id} bad bucket`);
        break;
      }
      case "highlight-source":
        for (const t of q.targets ?? []) check((q.source_text ?? "").includes(t.phrase), r, `phrase not verbatim: "${t.phrase}"`);
        check((q.targets ?? []).length >= 1, r, "no targets");
        break;
      case "argument-builder": {
        const ids = new Set((q.pool ?? []).map((p) => p.id));
        check((q.correct_selection ?? []).length >= 1, r, "no correct_selection");
        for (const s of q.correct_selection ?? []) check(ids.has(s), r, `selection id not in pool: ${s}`);
        check(q.pick_n === (q.correct_selection ?? []).length, r, "pick_n != correct_selection length");
        check(JSON.stringify(q.expected) === JSON.stringify(q.correct_selection), r, "expected != correct_selection");
        break;
      }
      case "paragraph-template": {
        for (const slot of q.template ?? []) {
          const correct = (slot.options ?? []).filter((o) => o.correct);
          check(correct.length === 1, r, `slot ${slot.slot} needs exactly 1 correct option`);
        }
        const expectedIds = (q.template ?? []).map((s) => (s.options ?? []).find((o) => o.correct)?.id);
        check(JSON.stringify(q.expected) === JSON.stringify(expectedIds), r, "expected != correct slot ids");
        break;
      }
      case "source-comparison": {
        const ok = new Set(["a_only", "b_only", "both", "neither"]);
        for (const s of q.statements ?? []) check(ok.has(s.correct_answer), r, `statement ${s.id} bad answer`);
        check((q.statements ?? []).length >= 1, r, "no statements");
        break;
      }
      default:
        problems.push(`${r}: unknown input_type ${q.input_type}`);
    }
    check(typeof q.memo === "string" && q.memo.length > 0, r, "missing memo");
    check(Array.isArray(q.error_signals) && q.error_signals.length > 0, r, "missing error_signals");
    check([1, 2, 3].includes(q.difficulty), r, "bad difficulty");
  }
}
if (problems.length) {
  console.error("VALIDATION FAILED — nothing written:\n" + problems.join("\n"));
  process.exit(1);
}

for (const id of skillIds) bank.topics[id] = incoming[id];
writeFileSync(bankPath, JSON.stringify(bank, null, 2) + "\n", "utf8");

for (const id of skillIds) {
  const q = bank.topics[id].questions;
  const refs = new Set(q.map((x) => x.ref));
  const d = { 1: 0, 2: 0, 3: 0 };
  q.forEach((x) => { d[x.difficulty]++; });
  const dup = q.length !== refs.size;
  console.log(
    `${id}  count=${q.length}  unique=${refs.size}  diff=${JSON.stringify(d)}` +
    (dup ? "  !!! DUPLICATE REFS" : "  OK"),
  );
}
