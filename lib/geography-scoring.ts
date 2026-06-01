// ─── Geography scoring ────────────────────────────────────────────────────────
//
// Per-mechanic scorers. Each returns { correct, score } where:
//   • `correct` = whether the answer passes the mechanic's pass rule (used to
//     update mastery counters).
//   • `score` = fractional accuracy 0–1 (used for finer-grained feedback).
//
// API contract: student_answer arrives as a string. For the structured
// mechanics (sort-buckets, sequence, highlight-source) it is a JSON-stringified
// payload; for choice/true-false/cloze/scenario/match/diagram-label/
// data-interpret it is the picked option string.
//
// Failure mode: any malformed JSON or missing field falls through to
// { correct: false, score: 0 } rather than throwing.

import type {
  GeographyBankQuestion,
  GeographyHighlightTarget,
  GeographyInputType,
  GeographyItem,
} from "@/types/geography";

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

// ─── Plain-equality mechanics ─────────────────────────────────────────────────

function scorePlainEquality(studentAnswer: string, expected: string | number | undefined): ScoreResult {
  const stu = norm(studentAnswer);
  if (!stu || expected === undefined) return FAIL;
  return stu === norm(expected) ? PASS_FULL : FAIL;
}

function scoreTrueFalse(studentAnswer: string, expected: string | number | undefined): ScoreResult {
  const stu = norm(studentAnswer);
  if (!stu || expected === undefined) return FAIL;
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

function scoreSortBuckets(studentAnswer: string, question: GeographyBankQuestion): ScoreResult {
  const items: GeographyItem[] = question.items ?? [];
  if (items.length === 0) return FAIL;
  const answer = safeJsonParse<Record<string, string>>(studentAnswer);
  if (!answer) return FAIL;
  const correct = items.filter((it) => answer[it.id] === it.correct_bucket).length;
  const score = correct / items.length;
  const threshold = question.pass_threshold ?? 0.75;
  return { correct: score >= threshold, score };
}

// ─── sequence ─────────────────────────────────────────────────────────────────
// student_answer: ["s1", "s3", "s2", "s4"]  (ordered item ids)
// expected: bank `expected_order`
// pass: exact order. score = fraction of positions that match.

function scoreSequence(studentAnswer: string, question: GeographyBankQuestion): ScoreResult {
  const expectedOrder = question.expected_order ?? [];
  if (expectedOrder.length === 0) return FAIL;
  const order = safeJsonParse<string[]>(studentAnswer);
  if (!Array.isArray(order) || order.length === 0) return FAIL;
  const positionsMatched = expectedOrder.filter((id, i) => order[i] === id).length;
  const score = positionsMatched / expectedOrder.length;
  const exact =
    order.length === expectedOrder.length &&
    expectedOrder.every((id, i) => order[i] === id);
  return { correct: exact, score };
}

// ─── highlight-source ─────────────────────────────────────────────────────────
// student_answer: ["phrase A", "phrase C", ...]
// expected: derived from bank `targets[].phrase`
// pass: correct ≥ min_correct AND wrong ≤ max_wrong

function scoreHighlightSource(studentAnswer: string, question: GeographyBankQuestion): ScoreResult {
  const targets: GeographyHighlightTarget[] = question.targets ?? [];
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

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function scoreGeographyAnswer(
  inputType: GeographyInputType,
  studentAnswer: string,
  question: GeographyBankQuestion,
): ScoreResult {
  if (!studentAnswer || studentAnswer.trim().length === 0) return FAIL;
  switch (inputType) {
    case "true-false":
      return scoreTrueFalse(studentAnswer, question.expected);
    case "choice":
    case "cloze":
    case "scenario":
    case "match":
    case "diagram-label":
    case "data-interpret":
      return scorePlainEquality(studentAnswer, question.expected);
    case "sort-buckets":
      return scoreSortBuckets(studentAnswer, question);
    case "sequence":
      return scoreSequence(studentAnswer, question);
    case "highlight-source":
      return scoreHighlightSource(studentAnswer, question);
    default:
      return scorePlainEquality(studentAnswer, question.expected);
  }
}
