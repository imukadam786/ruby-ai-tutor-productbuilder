import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken } from "@/lib/server-usage";
import { getTopic } from "@/lib/nst-selector";
import type {
  NstSubmitAnswerRequest,
  NstSubmitAnswerResponse,
} from "@/types/nst";

// ─── Intermediate-Phase praise pool (Grades 4–6) ──────────────────────────────
const PRAISE = [
  "Spot on! ⭐",
  "Excellent — that's correct! 🌟",
  "Nice work! 🎉",
  "Yes! That's it. ⭐",
  "Brilliant! 🌟",
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function norm(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreAnswer(
  inputType: string,
  studentAnswer: string,
  expectedAnswer: string | number,
): boolean {
  const exp = norm(expectedAnswer);
  const stu = norm(studentAnswer);
  if (!stu) return false;

  switch (inputType) {
    case "sequence": {
      const expParts = exp.split(",").map((s) => s.trim());
      const stuParts = stu.split(",").map((s) => s.trim());
      if (expParts.length !== stuParts.length) return false;
      return expParts.every((p, i) => p === stuParts[i]);
    }
    case "true-false": {
      const truthy = new Set(["true", "t", "yes", "y", "1"]);
      const falsy = new Set(["false", "f", "no", "n", "0"]);
      const expBool = truthy.has(exp) ? "true" : falsy.has(exp) ? "false" : exp;
      const stuBool = truthy.has(stu) ? "true" : falsy.has(stu) ? "false" : stu;
      return expBool === stuBool;
    }
    case "numeric": {
      const expNum = Number(expectedAnswer);
      const stuNum = Number(studentAnswer);
      if (Number.isFinite(expNum) && Number.isFinite(stuNum)) {
        return expNum === stuNum;
      }
      return exp === stu;
    }
    case "text":
    case "choice":
    case "image-match":
    default:
      // For text items, accept any non-empty answer as correct (the bank's
      // expected is illustrative — many text questions have multiple valid
      // answers). The memo always shows what good answers look like.
      if (inputType === "text") return stu.length > 0;
      return exp === stu;
  }
}

export async function POST(req: NextRequest) {
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

  try {
    const submission: NstSubmitAnswerRequest = await req.json();

    const topic = getTopic(submission.skill_id);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const question = topic.questions.find((q) => q.ref === submission.question_ref);
    const expected = question?.expected ?? submission.expected_answer;
    const memo = question?.memo ?? "";
    const errorSignals = question?.error_signals ?? [];

    const isCorrect = scoreAnswer(
      submission.input_type,
      submission.student_answer,
      expected,
    );

    const feedback = isCorrect
      ? pick(PRAISE)
      : `Not quite — let's try again. ${topic.recovery_strategy}`;

    const response: NstSubmitAnswerResponse = {
      is_correct: isCorrect,
      error_signals: isCorrect ? [] : errorSignals,
      feedback,
      memo,
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
    console.error("[nst/submit-answer] error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}
