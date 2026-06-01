// Shared helpers for authoring Grade 10 Afrikaans bank skills.
// CRLF-aware: splices new skill entries into data/afrikaans-question-bank.json
// before the closing of the `skills` object, leaving existing bytes untouched.
// Idempotent: skips any skill id already present.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BANK = join(ROOT, "data", "afrikaans-question-bank.json");

// ── question builders ────────────────────────────────────────────────────────
// All learner-facing text (question, options, ruby_prompt, memo) is Afrikaans.
const base = (ref, input_type, question, expected, memo, error_signals, difficulty, extra = {}) => ({
  ref,
  question,
  ...(extra.ruby_prompt ? { ruby_prompt: extra.ruby_prompt } : {}),
  ...(extra.audio ? { audio: extra.audio } : {}),
  ...(extra.context ? { context: extra.context } : {}),
  input_type,
  ...(extra.options ? { options: extra.options } : {}),
  expected,
  memo,
  error_signals,
  difficulty,
});

// choice: options + single expected
export const ch = (ref, question, options, expected, memo, errs, diff, extra = {}) =>
  base(ref, "choice", question, expected, memo, errs, diff, { ...extra, options });

// true/false (or two-way). Defaults to Waar/Onwaar; pass options to override.
export const tf = (ref, question, expected, memo, errs, diff, extra = {}) =>
  base(ref, "true-false", question, expected, memo, errs, diff, {
    ...extra,
    options: extra.options ?? ["Waar", "Onwaar"],
  });

// cloze: fill the blank from options
export const cz = (ref, question, options, expected, memo, errs, diff, extra = {}) =>
  base(ref, "cloze", question, expected, memo, errs, diff, { ...extra, options });

// sequence: expected is the correct ordered array; options carries the same items
export const sq = (ref, question, ordered, memo, errs, diff, extra = {}) =>
  base(ref, "sequence", question, ordered, memo, errs, diff, { ...extra, options: ordered });

// skill entry wrapper
export const skill = (id, title, description, strand, caps_term, templates, recovery_strategy, questions) => ({
  [id]: {
    title,
    description,
    grade: 10,
    strand,
    skill_ids: [id],
    gate: "NONE",
    complete_when: "all_items_correct_once",
    reteach_on_error: true,
    target_item_count: 20,
    caps_term,
    sensitive: false,
    templates,
    recovery_strategy,
    questions,
  },
});

// ── splice into the bank, preserving existing bytes ──────────────────────────
export function insertSkills(skillsObj) {
  let text = readFileSync(BANK, "utf8");
  const EOL = text.includes("\r\n") ? "\r\n" : "\n";
  const fresh = Object.fromEntries(
    Object.entries(skillsObj).filter(([id]) => !new RegExp(`"${id.replace(/\./g, "\\.")}"\\s*:`).test(text))
  );
  const skipped = Object.keys(skillsObj).length - Object.keys(fresh).length;
  if (Object.keys(fresh).length === 0) {
    console.log(`All ${skipped} skill(s) already present — nothing inserted.`);
    return;
  }
  // serialise each entry, indent to 4 spaces (object-member depth), join with commas
  const chunks = Object.entries(fresh).map(([id, entry]) => {
    const obj = { [id]: entry };
    // stringify then strip the outer { } so we get just the "id": {...} member
    const full = JSON.stringify(obj, null, 2);
    const inner = full.slice(full.indexOf("\n") + 1, full.lastIndexOf("\n"));
    return inner
      .split("\n")
      .map((line) => "  " + line) // shift from 2-space to 4-space member indent
      .join(EOL);
  });
  const marker = `${EOL}  }${EOL}}`; // close of skills object + root object
  const idx = text.lastIndexOf(marker);
  if (idx === -1) throw new Error("could not find closing of skills object");
  const before = text.slice(0, idx);
  const after = text.slice(idx);
  const out = before + "," + EOL + chunks.join("," + EOL) + after;
  writeFileSync(BANK, out);
  console.log(`Inserted ${Object.keys(fresh).length} skill(s)${skipped ? `, skipped ${skipped} existing` : ""}.`);
}
