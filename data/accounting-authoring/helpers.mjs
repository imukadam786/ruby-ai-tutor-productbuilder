// Builder helpers for authoring Accounting question pools. Each returns a bank
// question object in the exact shape types/accounting.ts expects, so the pool
// files stay readable and the content (not the boilerplate) is what we write.
//
// Tap-only mechanics. choice / true-false / cloze / sequence all render as an
// option grid and score by exact match, so they share one builder shape.

let _seq = 0; // only used if a ref is auto-generated (we always pass refs)

// choice — tap one of `options`; `expected` must be one of them verbatim.
export const mc = (ref, question, options, expected, memo, error_signals = [], difficulty = 2) => {
  if (!options.includes(expected)) throw new Error(`mc ${ref}: expected not in options`);
  return { ref, question, input_type: "choice", options, expected, memo, error_signals, difficulty };
};

// cloze — same as choice but flagged as a fill-the-blank (tap the right word).
export const cloze = (ref, question, options, expected, memo, error_signals = [], difficulty = 2) => {
  if (!options.includes(expected)) throw new Error(`cloze ${ref}: expected not in options`);
  return { ref, question, input_type: "cloze", options, expected, memo, error_signals, difficulty };
};

// sequence — tap the correctly ordered option.
export const seq = (ref, question, options, expected, memo, error_signals = [], difficulty = 2) => {
  if (!options.includes(expected)) throw new Error(`seq ${ref}: expected not in options`);
  return { ref, question, input_type: "sequence", options, expected, memo, error_signals, difficulty };
};

// true-false — `truth` is a boolean.
export const tf = (ref, question, truth, memo, error_signals = [], difficulty = 1) => ({
  ref,
  question,
  input_type: "true-false",
  options: ["True", "False"],
  expected: truth ? "True" : "False",
  memo,
  error_signals,
  difficulty,
});

// sort-buckets — buckets: [[id,label],...]; items: [[id,text,bucketId],...]
export const sort = (ref, question, buckets, items, memo, error_signals = [], difficulty = 2, pass_threshold = 0.75) => ({
  ref,
  question,
  input_type: "sort-buckets",
  buckets: buckets.map(([id, label]) => ({ id, label })),
  items: items.map(([id, text, correct_bucket]) => ({ id, text, correct_bucket })),
  pass_threshold,
  expected: "",
  memo,
  error_signals,
  difficulty,
});

// equation-effect — a/oe/l each one of "+","-","0".
const EFFECT = { "+": "increase", "-": "decrease", "0": "no_effect" };
export const eq = (ref, question, a, oe, l, memo, error_signals = [], difficulty = 2) => {
  for (const e of [a, oe, l]) if (!EFFECT[e]) throw new Error(`eq ${ref}: bad effect ${e}`);
  return {
    ref,
    question,
    input_type: "equation-effect",
    columns: [
      { id: "A", label: "Assets" },
      { id: "OE", label: "Owner's equity" },
      { id: "L", label: "Liabilities" },
    ],
    effects: { A: EFFECT[a], OE: EFFECT[oe], L: EFFECT[l] },
    expected: "",
    memo,
    error_signals,
    difficulty,
  };
};

// double-entry — accounts: [[id,label],...]; debit/credit are account ids.
export const de = (ref, question, accounts, debit, credit, memo, error_signals = [], difficulty = 2) => {
  const ids = accounts.map(([id]) => id);
  if (!ids.includes(debit) || !ids.includes(credit)) throw new Error(`de ${ref}: debit/credit not in accounts`);
  return {
    ref,
    question,
    input_type: "double-entry",
    accounts: accounts.map(([id, label]) => ({ id, label })),
    debit,
    credit,
    expected: "",
    memo,
    error_signals,
    difficulty,
  };
};

// source-comparison — statements: [[id,text,answer],...] answer ∈ a_only|b_only|both|neither
export const cmp = (ref, question, sourceA, sourceB, statements, memo, error_signals = [], difficulty = 3) => ({
  ref,
  question,
  input_type: "source-comparison",
  source_a: { text: sourceA },
  source_b: { text: sourceB },
  statements: statements.map(([id, text, correct_answer]) => ({ id, text, correct_answer })),
  pass_threshold: 0.75,
  expected: "",
  memo,
  error_signals,
  difficulty,
});

// paragraph-template — slots: [[slot,label,[[id,text,correct],...]],...]
export const para = (ref, question, prompt, slots, memo, error_signals = [], difficulty = 3) => ({
  ref,
  question,
  input_type: "paragraph-template",
  prompt,
  template: slots.map(([slot, label, options]) => ({
    slot,
    label,
    options: options.map(([id, text, correct]) => ({ id, text, correct: !!correct })),
  })),
  expected: "",
  memo,
  error_signals,
  difficulty,
});

export function _resetSeq() {
  _seq = 0;
}
