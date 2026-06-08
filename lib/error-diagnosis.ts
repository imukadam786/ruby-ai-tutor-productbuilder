// ─── Tier-1 error diagnosis: predicted-wrong-answer matching ─────────────────
//
// Each maths question carries the misconception codes it's designed to catch
// (`error_signals`) PLUS the parts needed to reconstruct the answer (groups/each,
// tens/ones, an `expression`, etc). This module turns each code into a predictor:
// "if a student made THIS mistake, what answer would it produce?". We then match
// the student's actual wrong answer against those predictions and return the code
// whose prediction it equals — exact diagnosis, zero AI cost.
//
// If nothing matches (a random guess, a novel slip), diagnoseError returns null
// and the caller falls back to the question's first-listed code.
//
// PROOF SCOPE: numeric / dual_numeric / triple_numeric shapes (Grade 6 maths).

import { checkAnswerCorrectness } from "@/lib/diagnostic-engine";

type BankQuestion = Record<string, unknown>;

// ── Field helpers ────────────────────────────────────────────────────────────

function num(q: BankQuestion, key: string): number | null {
  const v = q[key];
  if (typeof v === "number" && !isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  return null;
}

function str(q: BankQuestion, key: string): string | null {
  const v = q[key];
  return typeof v === "string" ? v : null;
}

// Normalise unicode minus/multiply/divide variants to ASCII so regexes are simple.
function normaliseOps(s: string): string {
  return s
    .replace(/[−‐–—﹣－]/g, "-")
    .replace(/[×✕·∙*xX]/g, "*")
    .replace(/[÷]/g, "/");
}

interface Binary {
  a: number;
  b: number;
  op: "+" | "-" | "*" | "/";
}

// Extract a single "a op b" from the question's expression or text.
function parseBinary(q: BankQuestion): Binary | null {
  const source =
    str(q, "expression") ?? str(q, "question") ?? str(q, "ruby_prompt") ?? "";
  const m = normaliseOps(source).match(
    /(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)/
  );
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[3]);
  const op = m[2] as Binary["op"];
  if (isNaN(a) || isNaN(b)) return null;
  return { a, b, op };
}

// Visible numbers in a sequence context, e.g. "1, 2, 3, ___" → [1,2,3].
function parseSequence(q: BankQuestion): { terms: number[]; step: number } | null {
  const ctx = str(q, "context") ?? str(q, "question") ?? "";
  const terms = (ctx.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).filter((n) => !isNaN(n));
  if (terms.length < 2) return null;
  const step = terms[1] - terms[0];
  // Require a constant step so we only predict when the rule is unambiguous.
  for (let i = 2; i < terms.length; i++) {
    if (terms[i] - terms[i - 1] !== step) return null;
  }
  return { terms, step };
}

function expectedNum(q: BankQuestion): number | null {
  const e = str(q, "expected");
  if (e == null) return null;
  const n = Number(e.trim());
  return isNaN(n) ? null : n;
}

// ── Predictors ───────────────────────────────────────────────────────────────
// Each returns the wrong answer(s) its misconception would produce, as strings
// ready to compare with checkAnswerCorrectness, or null if not computable here.

type Predictor = (q: BankQuestion) => (string | number)[] | null;

const PREDICTORS: Record<string, Predictor> = {
  // — Multi-field swaps —
  // Multiplication (groups, in-each, total): groups and in-each written swapped.
  ERR_FIELD_SWAP: (q) => {
    const g = num(q, "groups"), e = num(q, "each"), t = num(q, "total");
    if (g == null || e == null || t == null) return null;
    return [`${e},${g},${t}`];
  },
  // Place value (tens, ones): the two digits entered the wrong way round.
  ERR_DIGIT_SWAP: (q) => {
    const tens = num(q, "expected_tens"), ones = num(q, "expected_ones");
    if (tens == null || ones == null) return null;
    return [`${ones},${tens}`];
  },
  // Fraction (denominator, numerator): top and bottom swapped.
  ERR_INVERT: (q) => {
    const unit = num(q, "expected_unit"), count = num(q, "expected_count");
    if (unit == null || count == null) return null;
    return [`${count},${unit}`];
  },
  ERR_PART_WHOLE: (q) => {
    const unit = num(q, "expected_unit"), count = num(q, "expected_count");
    if (unit == null || count == null) return null;
    return [`${count},${unit}`];
  },

  // — Operation confusions (computed from the parts) —
  // Multiplication done as addition: total = groups + in-each.
  ERR_MULT_ADD: (q) => {
    const g = num(q, "groups"), e = num(q, "each");
    if (g == null || e == null) return null;
    return [`${g},${e},${g + e}`];
  },
  // Subtraction done as addition.
  ERR_SUB_ADD: (q) => {
    const b = parseBinary(q);
    return b && b.op === "-" ? [b.a + b.b] : null;
  },
  // Operands done in the wrong order (subtraction / division).
  ERR_REVERSAL: (q) => {
    const b = parseBinary(q);
    if (!b) return null;
    if (b.op === "-") return [b.b - b.a];
    if (b.op === "/" && b.a !== 0) return [b.b / b.a];
    return null;
  },
  // Division done as its inverse (multiplied instead).
  ERR_DIV_INVERSE: (q) => {
    const b = parseBinary(q);
    return b && b.op === "/" ? [b.a * b.b] : null;
  },
  // — Near-misses (right method, small slip) —
  ERR_OFF_BY_ONE: (q) => {
    const e = expectedNum(q);
    return e == null ? null : [e + 1, e - 1];
  },
  ERR_DIV_OFF: (q) => {
    const e = expectedNum(q);
    return e == null ? null : [e + 1, e - 1];
  },
  ERR_MULT_OFF: (q) => {
    const e = expectedNum(q);
    return e == null ? null : [e + 1, e - 1];
  },
  // Times-table slip: one row too many or too few.
  ERR_TIMES_TABLE: (q) => {
    const b = parseBinary(q);
    if (!b || b.op !== "*") return null;
    const p = b.a * b.b;
    return [p - b.a, p + b.a, p - b.b, p + b.b];
  },

  // — Sequences —
  // Counted the wrong direction: applied the step backwards off the last term.
  ERR_SEQ_DIR: (q) => {
    if ((str(q, "missing_position") ?? "End") !== "End") return null;
    const s = parseSequence(q);
    if (!s) return null;
    const last = s.terms[s.terms.length - 1];
    return [last - s.step];
  },

  // — Two-digit addition: dropped the carry from the ones column —
  ERR_ADD_ONES: (q) => {
    const b = parseBinary(q);
    if (!b || b.op !== "+") return null;
    const ones = (b.a % 10) + (b.b % 10);
    if (ones < 10) return null; // no carry to drop → not this error
    const tens = Math.floor(b.a / 10) + Math.floor(b.b / 10);
    return [tens * 10 + (ones % 10)];
  },
};

/**
 * Diagnose which misconception a wrong answer reveals.
 * Tries each of the question's declared error codes in listed (priority) order
 * and returns the first whose predicted answer matches the student's. Returns
 * null when no prediction matches — the caller should fall back to a generic
 * code or escalate.
 *
 * Only call this on answers already known to be WRONG.
 */
export function diagnoseError(
  studentAnswer: string,
  bankQuestion: BankQuestion | null | undefined
): string | null {
  if (!bankQuestion || !studentAnswer?.trim()) return null;
  const codes = bankQuestion.error_signals;
  if (!Array.isArray(codes)) return null;
  const expected = typeof bankQuestion.expected === "string" ? bankQuestion.expected : null;

  try {
    for (const code of codes) {
      const predict = PREDICTORS[code as string];
      if (!predict) continue;
      const predictions = predict(bankQuestion);
      if (!predictions) continue;
      for (const p of predictions) {
        const ps = String(p);
        // Skip a prediction that coincides with the correct answer (bad predictor).
        if (expected && checkAnswerCorrectness(ps, expected)) continue;
        if (checkAnswerCorrectness(studentAnswer, ps)) {
          return code as string;
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}
