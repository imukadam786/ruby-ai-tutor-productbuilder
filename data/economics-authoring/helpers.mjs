// Builder helpers for authoring Economics question pools. Each returns a bank
// question object in the exact shape types/economics.ts expects, so the pool
// files stay readable and the content (not the boilerplate) is what we write.
//
// Tap-only mechanics. choice / true-false / cloze / sequence / diagram-label
// all render as an option grid and score by exact match.

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

// diagram-label — graph/diagram reading. `image` is the image_ref key (a file
// the content team supplies under public/economics/<image>.webp); `options`
// are the tappable labels and `expected` is the right one. A `source` graph
// block renders the image above the options; `caption` describes it for the
// text fallback before the image exists.
export const dl = (ref, question, image, options, expected, memo, error_signals = [], difficulty = 2, caption = "") => {
  if (!options.includes(expected)) throw new Error(`dl ${ref}: expected not in options`);
  return {
    ref,
    question,
    input_type: "diagram-label",
    options,
    expected,
    image_refs: [image],
    source: { type: "graph", content: image, caption },
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
