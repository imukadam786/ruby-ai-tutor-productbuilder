import { NextRequest, NextResponse } from "next/server";
import { getMathsLiteracySkillById } from "@/lib/maths-literacy-student-model";
import type {
  MathsLiteracyAnswerMode,
  MathsLiteracyDiagnosticResult,
  MathsLiteracySkillAttempt,
  MathsLiteracySubmitRequest,
  MathsLiteracySubmitResponse,
} from "@/types/maths-literacy";
import { verifyToken, enforceSharedQuestionLimit } from "@/lib/server-usage";

// ─── Number parsing (SA decimal-comma aware) ────────────────────────────────
// "R5 400"   → 5400
// "5,4"      → 5.4
// "59,5%"    → 59.5
// "R1 234,56"→ 1234.56
// "1,234.56" → 1234.56 (US fallback: comma = thousands when point present)
function parseNumber(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  let s = String(raw).trim();
  if (!s) return null;
  // Strip common unit/currency markers and whitespace (incl. NBSP and SA thousands space)
  s = s.replace(/[Rr$€£%]/g, "").replace(/\s+/g, "").replace(/[a-zA-Zµ°]+$/g, "");
  if (s.includes(".") && s.includes(",")) {
    // Both present — treat comma as thousands separator (US format)
    s = s.replace(/,/g, "");
  } else if (s.includes(",") && !s.includes(".")) {
    // Decimal comma (SA convention)
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

// ─── Scoring ────────────────────────────────────────────────────────────────
interface AnswerKey {
  mode: MathsLiteracyAnswerMode;
  expectedAnswer?: string | number;
  tolerance?: number;
  unit?: string;
  options?: string[];
  fields?: { label: string; expectedAnswer: string | number; tolerance?: number }[];
}

function checkNumeric(studentRaw: string, expected: number, tolerance: number): boolean {
  const student = parseNumber(studentRaw);
  if (student === null) return false;
  return Math.abs(student - expected) <= tolerance;
}

function normaliseChoice(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function checkMultiChoice(
  studentRaw: string,
  expected: string,
  options?: string[]
): boolean {
  const a = normaliseChoice(studentRaw);
  const e = normaliseChoice(expected);
  if (!a) return false;
  if (a === e) return true;
  // Accept a letter (A/B/C/D) indexing the matching option.
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
  // String field (e.g. "P"/"L" or "Short"/"Tall")
  return normaliseChoice(studentRaw) === normaliseChoice(String(field.expectedAnswer));
}

function formatExpectedForFeedback(key: AnswerKey): string {
  if (key.mode === "numeric") {
    const unit = key.unit ? ` ${key.unit}` : "";
    return `${key.expectedAnswer}${unit}`;
  }
  if (key.mode === "multiChoice") {
    return `"${key.expectedAnswer}"`;
  }
  return (key.fields ?? [])
    .map((f) => `${f.label}: ${f.expectedAnswer}`)
    .join("; ");
}

export async function POST(req: NextRequest) {
  try {
    const submission: MathsLiteracySubmitRequest = await req.json();

    // Count this answered question against the shared daily Freebie pool (chat
    // messages + subject questions, cap 5). Anonymous callers are not metered;
    // paid plans are unlimited. 429s with `upgradeRequired` for the modal.
    const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
    if (token) {
      const userId = await verifyToken(token);
      if (userId) {
        const limitResponse = await enforceSharedQuestionLimit(userId);
        if (limitResponse) return limitResponse;
      }
    }

    const skill = getMathsLiteracySkillById(submission.skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    let key: AnswerKey;
    try {
      key = JSON.parse(submission.expected_answer_key) as AnswerKey;
    } catch {
      return NextResponse.json({ error: "Bad answer key" }, { status: 400 });
    }

    let isCorrect = false;
    let partialCredit: { correct: number; total: number } | undefined;
    const errorSignals: string[] = [];

    if (key.mode === "numeric" && typeof key.expectedAnswer === "number") {
      isCorrect = checkNumeric(
        submission.student_answer,
        key.expectedAnswer,
        key.tolerance ?? 0
      );
    } else if (key.mode === "multiChoice" && typeof key.expectedAnswer === "string") {
      isCorrect = checkMultiChoice(
        submission.student_answer,
        key.expectedAnswer,
        key.options
      );
    } else if (key.mode === "multiField" && key.fields) {
      const fieldResults = key.fields.map((spec) => {
        const provided = submission.student_fields?.find((f) => f.label === spec.label);
        const value = provided?.value ?? "";
        return checkField(value, spec);
      });
      const correctCount = fieldResults.filter(Boolean).length;
      partialCredit = { correct: correctCount, total: fieldResults.length };
      isCorrect = correctCount === fieldResults.length;
    }

    // Surface up to three error signals from the bank item on miss. We don't
    // re-load the bank server-side — the client can pass them through if it
    // wants per-signal feedback in a later iteration.
    if (!isCorrect) errorSignals.push("INCORRECT_ANSWER");

    const expectedText = formatExpectedForFeedback(key);
    const feedback = isCorrect
      ? "Correct."
      : partialCredit
      ? `Not quite — you got ${partialCredit.correct} of ${partialCredit.total} parts. The full answer was: ${expectedText}.`
      : `Not quite — the answer was ${expectedText}.`;

    const timestamp = new Date().toISOString();

    const attempt: MathsLiteracySkillAttempt = {
      id: `mla_${Date.now()}`,
      skill_id: submission.skill_id,
      question_id: submission.question_id,
      question: submission.question,
      student_answer:
        submission.student_answer ||
        (submission.student_fields ?? [])
          .map((f) => `${f.label}: ${f.value}`)
          .join(" | "),
      is_correct: isCorrect,
      error_signals: errorSignals,
      feedback,
      timestamp,
    };

    const result: MathsLiteracyDiagnosticResult = {
      is_correct: isCorrect,
      partial_credit: partialCredit,
      error_signals: errorSignals,
      feedback,
      working_steps: submission.working_steps,
      mastery_update: {
        skill_id: submission.skill_id,
        new_status: "in_progress",
        correct_count: isCorrect ? 1 : 0,
        attempt_count: 1,
      },
      next_action: "continue_skill",
    };

    const body: MathsLiteracySubmitResponse = { result, attempt };
    return NextResponse.json(body);
  } catch (error) {
    console.error("Maths Literacy submit-answer error:", error);
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 });
  }
}
