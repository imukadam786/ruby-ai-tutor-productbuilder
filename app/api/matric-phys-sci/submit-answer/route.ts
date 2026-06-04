import { withRubies } from "@/lib/with-rubies";
import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken, enforceSharedQuestionLimit } from "@/lib/server-usage";
import { getSkill } from "@/lib/matric-phys-sci-selector";
import type {
  MatricPhysSciSubmitAnswerRequest,
  MatricPhysSciSubmitAnswerResponse,
} from "@/types/matric-phys-sci";

// ─── Matric praise pool ───────────────────────────────────────────────────────
const PRAISE = [
  "Correct.",
  "Spot on.",
  "Nice work.",
  "Exactly right.",
  "Well done.",
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function norm(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function numbersEqual(student: string, expected: string | number, tolerance: number): boolean {
  const stuNum = Number(student);
  const expNum = Number(expected);
  if (!Number.isFinite(stuNum) || !Number.isFinite(expNum)) return false;
  // tolerance is absolute (the bank stores items like {expectedAnswer: 9.8, tolerance: 0.05})
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
    // text items can have no canonical expected; accept any non-empty
    return answerMode === "text" ? stu.length > 0 : false;
  }
  switch (answerMode) {
    case "numeric":
      return numbersEqual(studentAnswer, expectedAnswer, tolerance ?? 0);
    case "choice":
      return norm(expectedAnswer) === stu;
    case "text":
    default:
      // Free-text answers — accept any non-empty response. The model answer is
      // returned to the learner alongside the explanation so they can compare.
      return stu.length > 0;
  }
}

/**
 * For sequence items, the student answer is a JSON-stringified array of step
 * ids in the chosen order. Correct iff it exactly matches `expected_order`.
 */
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

/**
 * For multiField items, the bank stores an array of {label, expectedAnswer}.
 * The session serialises the student's answers in the same order joined by
 * "|". We split on "|" and score each field. Numeric tolerance for multiField
 * defaults to 5% of the expected value (since per-field tolerance is rarely
 * authored — fall back to a generous comparison for floats).
 */
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

async function handler(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = await verifyToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count this answered question against the shared daily Freebie pool (chat
  // messages + subject questions, cap 5). Paid plans are unlimited; this 429s
  // with `upgradeRequired` so the client shows the upgrade modal.
  const limitResponse = await enforceSharedQuestionLimit(userId);
  if (limitResponse) return limitResponse;

  try {
    const submission: MatricPhysSciSubmitAnswerRequest = await req.json();

    const skill = getSkill(submission.skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const item = skill.items.find((it) => it.id === submission.question_ref);
    if (!item) {
      return NextResponse.json({ error: "Item not found in skill" }, { status: 404 });
    }

    let isCorrect = false;
    if (item.answerMode === "multiField" && item.fields) {
      isCorrect = scoreMultiField(submission.student_answer, item.fields);
    } else if (item.answerMode === "sequence" && item.expected_order) {
      isCorrect = scoreSequence(submission.student_answer, item.expected_order);
    } else if (
      item.answerMode === "text" ||
      item.answerMode === "choice" ||
      item.answerMode === "numeric"
    ) {
      isCorrect = scoreSingleField(
        item.answerMode,
        submission.student_answer,
        item.expectedAnswer,
        item.tolerance,
      );
    }

    const feedback = isCorrect
      ? pick(PRAISE)
      : "Not quite. Check the worked answer below and try the next one.";

    const response: MatricPhysSciSubmitAnswerResponse = {
      is_correct: isCorrect,
      error_signals: isCorrect ? [] : item.errorSignals ?? [],
      feedback,
      explanation: item.explanation,
      mastery_update: {
        skill_id: submission.skill_id,
        new_status: "in_progress",
        correct_count: isCorrect ? 1 : 0,
        attempt_count: 1,
      },
      next_action: "continue_skill",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[matric-phys-sci/submit-answer] error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}

export const POST = withRubies("matric-phys-sci", handler);
