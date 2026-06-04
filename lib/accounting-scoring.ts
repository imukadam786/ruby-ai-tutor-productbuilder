// ─── Accounting scoring ──────────────────────────────────────────────────────────
//
// Per-mechanic scorers. Each returns { correct, score } where:
//   • `correct` = whether the answer passes the mechanic's pass rule (used to
//     update mastery counters).
//   • `score` = fractional accuracy 0–1 (used for finer-grained feedback).
//
// API contract: student_answer arrives as a string. For the 5 structured
// mechanics it is a JSON-stringified payload; for choice/true-false/cloze/
// sequence/diagram-label/image-match it is the picked option string.
// Expected answer is derived from the bank item — for structured mechanics
// it is built server-side from the relevant payload fields and compared
// in-memory (not stringified back-and-forth).
//
// Failure mode: any malformed JSON or missing field falls through to
// { correct: false, score: 0 } rather than throwing.

import type {
  AccountingBankQuestion,
  AccountingComparisonAnswer,
  AccountingEffect,
  AccountingHighlightTarget,
  AccountingInputType,
  AccountingParagraphSlot,
  AccountingSortBucketItem,
} from "@/types/accounting";

// Default accounting-equation columns when a question omits `columns`.
const DEFAULT_EQUATION_COLUMNS = ["A", "OE", "L"];

export interface ScoreResult {
  correct: boolean;
  score: number;
}

const FAIL: ScoreResult = { correct: false, score: 0 };
const PASS_FULL: ScoreResult = { correct: true, score: 1 };

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function norm(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

// ─── Plain-equality mechanics (reused from Life Sciences) ─────────────────────

function scorePlainEquality(studentAnswer: string, expected: string | number): ScoreResult {
  const stu = norm(studentAnswer);
  if (!stu) return FAIL;
  return stu === norm(expected) ? PASS_FULL : FAIL;
}

function scoreTrueFalse(studentAnswer: string, expected: string | number): ScoreResult {
  const stu = norm(studentAnswer);
  if (!stu) return FAIL;
  const truthy = new Set(["true", "t", "yes", "y", "1"]);
  const falsy = new Set(["false", "f", "no", "n", "0"]);
  const exp = norm(expected);
  const stuBool = truthy.has(stu) ? "true" : falsy.has(stu) ? "false" : stu;
  const expBool = truthy.has(exp) ? "true" : falsy.has(exp) ? "false" : exp;
  return stuBool === expBool ? PASS_FULL : FAIL;
}

// ─── sort-buckets ─────────────────────────────────────────────────────────────
// student_answer: { "<itemId>": "<bucketId>", ... }
// expected: derived from bank `items[].correct_bucket`
// pass: (correct / total) ≥ pass_threshold (default 0.75)

function scoreSortBuckets(studentAnswer: string, question: AccountingBankQuestion): ScoreResult {
  const items: AccountingSortBucketItem[] = question.items ?? [];
  if (items.length === 0) return FAIL;
  const answer = safeJsonParse<Record<string, string>>(studentAnswer);
  if (!answer) return FAIL;
  const correct = items.filter((it) => answer[it.id] === it.correct_bucket).length;
  const score = correct / items.length;
  const threshold = question.pass_threshold ?? 0.75;
  return { correct: score >= threshold, score };
}

// ─── highlight-source ─────────────────────────────────────────────────────────
// student_answer: ["phrase A", "phrase C", ...]
// expected: derived from bank `targets[].phrase`
// pass: correct ≥ min_correct AND wrong ≤ max_wrong

function scoreHighlightSource(studentAnswer: string, question: AccountingBankQuestion): ScoreResult {
  const targets: AccountingHighlightTarget[] = question.targets ?? [];
  if (targets.length === 0) return FAIL;
  const selected = safeJsonParse<string[]>(studentAnswer);
  if (!Array.isArray(selected)) return FAIL;
  const targetSet = new Set(targets.map((t) => norm(t.phrase)));
  const selectedNorm = selected.map(norm);
  const correctCount = selectedNorm.filter((p) => targetSet.has(p)).length;
  const wrongCount = selectedNorm.filter((p) => !targetSet.has(p)).length;
  const minCorrect = question.min_correct ?? Math.max(1, Math.ceil(targets.length / 2));
  const maxWrong = question.max_wrong ?? 1;
  const passes = correctCount >= minCorrect && wrongCount <= maxWrong;
  const score = targets.length > 0 ? correctCount / targets.length : 0;
  return { correct: passes, score };
}

// ─── argument-builder ─────────────────────────────────────────────────────────
// student_answer: ["e1", "e3", "e5"]
// expected: derived from bank `correct_selection`
// pass: set equality

function scoreArgumentBuilder(studentAnswer: string, question: AccountingBankQuestion): ScoreResult {
  const expected = question.correct_selection ?? [];
  if (expected.length === 0) return FAIL;
  const selected = safeJsonParse<string[]>(studentAnswer);
  if (!Array.isArray(selected)) return FAIL;
  if (selected.length !== expected.length) {
    const overlap = selected.filter((id) => expected.includes(id)).length;
    return { correct: false, score: expected.length > 0 ? overlap / expected.length : 0 };
  }
  const expSet = new Set(expected);
  const stuSet = new Set(selected);
  const equal = expSet.size === stuSet.size && [...expSet].every((id) => stuSet.has(id));
  return equal ? PASS_FULL : FAIL;
}

// ─── paragraph-template ───────────────────────────────────────────────────────
// student_answer: { "point": "p1", "evidence": "e2", "explanation": "x1" }
// expected: derived from bank `template[].options` where correct === true
// pass: all 3 slots correct

function scoreParagraphTemplate(studentAnswer: string, question: AccountingBankQuestion): ScoreResult {
  const template: AccountingParagraphSlot[] = question.template ?? [];
  if (template.length === 0) return FAIL;
  const answer = safeJsonParse<Record<string, string>>(studentAnswer);
  if (!answer) return FAIL;
  let correctSlots = 0;
  for (const slot of template) {
    const correctOpt = slot.options.find((o) => o.correct);
    if (!correctOpt) continue;
    if (answer[slot.slot] === correctOpt.id) correctSlots++;
  }
  const score = template.length > 0 ? correctSlots / template.length : 0;
  return { correct: correctSlots === template.length, score };
}

// ─── source-comparison ────────────────────────────────────────────────────────
// student_answer: { "<statementId>": "a_only" | "b_only" | "both" | "neither" }
// expected: derived from bank `statements[].correct_answer`
// pass: (correct rows / total) ≥ pass_threshold (default 0.75)

function scoreSourceComparison(studentAnswer: string, question: AccountingBankQuestion): ScoreResult {
  const statements = question.statements ?? [];
  if (statements.length === 0) return FAIL;
  const answer = safeJsonParse<Record<string, AccountingComparisonAnswer>>(studentAnswer);
  if (!answer) return FAIL;
  const correct = statements.filter((s) => answer[s.id] === s.correct_answer).length;
  const score = correct / statements.length;
  const threshold = question.pass_threshold ?? 0.75;
  return { correct: score >= threshold, score };
}

// ─── equation-effect ──────────────────────────────────────────────────────────
// student_answer: { "A": "increase", "OE": "no_effect", "L": "increase" }
// expected: derived from bank `effects` keyed by column id
// pass: every column correct (a 2–3 cell grid; partial is not "right")

function scoreEquationEffect(studentAnswer: string, question: AccountingBankQuestion): ScoreResult {
  const effects = question.effects ?? {};
  const columnIds =
    question.columns && question.columns.length > 0
      ? question.columns.map((c) => c.id)
      : DEFAULT_EQUATION_COLUMNS;
  if (columnIds.length === 0) return FAIL;
  const answer = safeJsonParse<Record<string, AccountingEffect>>(studentAnswer);
  if (!answer) return FAIL;
  const correct = columnIds.filter((id) => answer[id] === effects[id]).length;
  const score = correct / columnIds.length;
  return { correct: score === 1, score };
}

// ─── double-entry ─────────────────────────────────────────────────────────────
// student_answer: { "debit": "bank", "credit": "sales" }
// expected: derived from bank `debit` / `credit` account ids
// pass: both the debit and the credit account correct

function scoreDoubleEntry(studentAnswer: string, question: AccountingBankQuestion): ScoreResult {
  const { debit, credit } = question;
  if (!debit || !credit) return FAIL;
  const answer = safeJsonParse<{ debit?: string; credit?: string }>(studentAnswer);
  if (!answer) return FAIL;
  let correct = 0;
  if (answer.debit === debit) correct++;
  if (answer.credit === credit) correct++;
  return { correct: correct === 2, score: correct / 2 };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function scoreAccountingAnswer(
  inputType: AccountingInputType,
  studentAnswer: string,
  question: AccountingBankQuestion,
): ScoreResult {
  if (!studentAnswer || studentAnswer.trim().length === 0) return FAIL;
  switch (inputType) {
    case "true-false":
      return scoreTrueFalse(studentAnswer, question.expected);
    case "choice":
    case "cloze":
    case "sequence":
    case "diagram-label":
    case "image-match":
      return scorePlainEquality(studentAnswer, question.expected);
    case "sort-buckets":
      return scoreSortBuckets(studentAnswer, question);
    case "highlight-source":
      return scoreHighlightSource(studentAnswer, question);
    case "argument-builder":
      return scoreArgumentBuilder(studentAnswer, question);
    case "paragraph-template":
      return scoreParagraphTemplate(studentAnswer, question);
    case "source-comparison":
      return scoreSourceComparison(studentAnswer, question);
    case "equation-effect":
      return scoreEquationEffect(studentAnswer, question);
    case "double-entry":
      return scoreDoubleEntry(studentAnswer, question);
    default:
      return scorePlainEquality(studentAnswer, question.expected);
  }
}
