// ─── Physical Sciences answer scoring (shared client + server) ───────────────
//
// Single source of truth for scoring a Physical Sciences answer (all grades).
// The server route scores authoritatively; the client uses the SAME function to
// show feedback instantly (the expected answer / fields / order ship with the
// question). All modes are deterministic — no LLM.

import type { MatricPhysSciAnswerMode, MatricPhysSciMultiField } from "@/types/matric-phys-sci";

function norm(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function numbersEqual(student: string, expected: string | number, tolerance: number): boolean {
  const stuNum = Number(student);
  const expNum = Number(expected);
  if (!Number.isFinite(stuNum) || !Number.isFinite(expNum)) return false;
  return Math.abs(stuNum - expNum) <= tolerance;
}

function scoreSingleField(
  answerMode: "text" | "choice" | "numeric",
  studentAnswer: string,
  expectedAnswer: string | number | undefined,
  tolerance: number | undefined,
): boolean {
  const stu = norm(studentAnswer);
  if (!stu) return false;
  if (expectedAnswer === undefined) {
    return answerMode === "text" ? stu.length > 0 : false;
  }
  switch (answerMode) {
    case "numeric":
      return numbersEqual(studentAnswer, expectedAnswer, tolerance ?? 0);
    case "choice":
      return norm(expectedAnswer) === stu;
    case "text":
    default:
      // Free-text — any non-empty response; the model answer is shown alongside.
      return stu.length > 0;
  }
}

/** Sequence answer is a JSON array of step ids; correct iff it matches order. */
function scoreSequence(studentAnswer: string, expectedOrder: string[]): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(studentAnswer);
  } catch {
    return false;
  }
  if (!Array.isArray(parsed) || parsed.length !== expectedOrder.length) return false;
  return parsed.every((id, i) => id === expectedOrder[i]);
}

/** multiField answers are "|"-joined in field order; each field scored with tolerance. */
function scoreMultiField(
  studentAnswer: string,
  fields: { label: string; expectedAnswer: string | number }[],
): boolean {
  const parts = studentAnswer.split("|").map((s) => s.trim());
  if (parts.length !== fields.length) return false;
  for (let i = 0; i < fields.length; i++) {
    const stu = parts[i];
    const exp = fields[i].expectedAnswer;
    if (!stu) return false;
    const expStr = String(exp).trim();
    const expNum = Number(expStr);
    const stuNum = Number(stu);
    if (Number.isFinite(expNum) && Number.isFinite(stuNum)) {
      const tol = Math.max(0.05, Math.abs(expNum) * 0.05);
      if (Math.abs(stuNum - expNum) > tol) return false;
    } else if (norm(expStr) !== norm(stu)) {
      return false;
    }
  }
  return true;
}

export interface PhysSciScoreInput {
  answerMode: MatricPhysSciAnswerMode;
  studentAnswer: string;
  expectedAnswer?: string | number;
  tolerance?: number;
  fields?: MatricPhysSciMultiField[];
  expectedOrder?: string[];
}

/** Score a Physical Sciences answer. Used identically by client and server. */
export function scorePhysSci(input: PhysSciScoreInput): boolean {
  const { answerMode, studentAnswer } = input;
  if (answerMode === "multiField" && input.fields) {
    return scoreMultiField(studentAnswer, input.fields);
  }
  if (answerMode === "sequence" && input.expectedOrder) {
    return scoreSequence(studentAnswer, input.expectedOrder);
  }
  if (answerMode === "text" || answerMode === "choice" || answerMode === "numeric") {
    return scoreSingleField(answerMode, studentAnswer, input.expectedAnswer, input.tolerance);
  }
  return false;
}
