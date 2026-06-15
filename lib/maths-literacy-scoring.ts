// ─── Maths Literacy answer scoring (shared client + server) ──────────────────
//
// Single source of truth for checking a Maths Literacy answer. The server route
// scores authoritatively; the client uses the SAME functions to show feedback
// instantly (the answer key ships to the browser with the question). Because both
// run identical logic on identical inputs, they cannot disagree.

import type { MathsLiteracyAnswerMode } from "@/types/maths-literacy";

export interface AnswerKey {
  mode: MathsLiteracyAnswerMode;
  expectedAnswer?: string | number;
  tolerance?: number;
  unit?: string;
  options?: string[];
  fields?: { label: string; expectedAnswer: string | number; tolerance?: number }[];
}

// ─── Number parsing (SA decimal-comma aware) ────────────────────────────────
// "R5 400" → 5400 · "5,4" → 5.4 · "59,5%" → 59.5 · "R1 234,56" → 1234.56
// "1,234.56" → 1234.56 · "4 200 000" → 4200000 · "4,200,000" → 4200000
export function parseNumber(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  let s = String(raw).trim();
  if (!s) return null;
  s = s.replace(/[−‒–—－]/g, "-");
  s = s.replace(/[Rr$€£%]/g, "").replace(/\s+/g, "").replace(/[a-zA-Zµ°]+$/g, "");
  if (!s) return null;
  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length !== 3) {
      s = s.replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function checkNumeric(studentRaw: string, expected: number, tolerance: number): boolean {
  const student = parseNumber(studentRaw);
  if (student === null) return false;
  return Math.abs(student - expected) <= Math.max(tolerance, 1e-9);
}

function normaliseChoice(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function checkMultiChoice(studentRaw: string, expected: string, options?: string[]): boolean {
  const a = normaliseChoice(studentRaw);
  const e = normaliseChoice(expected);
  if (!a) return false;
  if (a === e) return true;
  if (options && a.length === 1) {
    const idx = "abcdefghij".indexOf(a);
    if (idx >= 0 && idx < options.length) {
      return normaliseChoice(options[idx]) === e;
    }
  }
  return false;
}

function checkField(
  studentRaw: string,
  field: { expectedAnswer: string | number; tolerance?: number }
): boolean {
  if (typeof field.expectedAnswer === "number") {
    return checkNumeric(studentRaw, field.expectedAnswer, field.tolerance ?? 0);
  }
  return normaliseChoice(studentRaw) === normaliseChoice(String(field.expectedAnswer));
}

/** Parse the JSON answer key shipped with a question. Returns null on bad JSON. */
export function parseAnswerKey(raw: string): AnswerKey | null {
  try {
    return JSON.parse(raw) as AnswerKey;
  } catch {
    return null;
  }
}

export interface ScoreResult {
  isCorrect: boolean;
  partialCredit?: { correct: number; total: number };
}

/** Score an answer against its key. Used identically by client and server. */
export function scoreMathsLiteracy(
  key: AnswerKey,
  studentAnswer: string,
  studentFields?: { label: string; value: string }[]
): ScoreResult {
  if (key.mode === "numeric" && typeof key.expectedAnswer === "number") {
    return { isCorrect: checkNumeric(studentAnswer, key.expectedAnswer, key.tolerance ?? 0) };
  }
  if (key.mode === "multiChoice" && typeof key.expectedAnswer === "string") {
    return { isCorrect: checkMultiChoice(studentAnswer, key.expectedAnswer, key.options) };
  }
  if (key.mode === "multiField" && key.fields) {
    const fieldResults = key.fields.map((spec) => {
      const provided = studentFields?.find((f) => f.label === spec.label);
      return checkField(provided?.value ?? "", spec);
    });
    const correct = fieldResults.filter(Boolean).length;
    return {
      isCorrect: correct === fieldResults.length,
      partialCredit: { correct, total: fieldResults.length },
    };
  }
  return { isCorrect: false };
}

/** Human-readable correct answer for display in feedback. */
export function formatExpectedAnswer(key: AnswerKey): string {
  if (key.mode === "numeric") {
    const unit = key.unit ? ` ${key.unit}` : "";
    return `${key.expectedAnswer}${unit}`;
  }
  if (key.mode === "multiChoice") {
    return `${key.expectedAnswer}`;
  }
  return (key.fields ?? []).map((f) => `${f.label}: ${f.expectedAnswer}`).join("; ");
}
