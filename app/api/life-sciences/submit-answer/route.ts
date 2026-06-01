import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken, enforceSharedQuestionLimit } from "@/lib/server-usage";
import { getTopic } from "@/lib/life-sciences-selector";
import { openAIJudge } from "@/lib/reading-llm-judge";
import { getOpenAI } from "@/lib/anthropic";
import type {
  LifeSciencesSubmitAnswerRequest,
  LifeSciencesSubmitAnswerResponse,
} from "@/types/life-sciences";

// ─── FET-appropriate praise pool (Grades 10–12) ───────────────────────────────
const PRAISE = [
  "Correct — well reasoned.",
  "Spot on. ✓",
  "That's right.",
  "Exactly. Solid answer.",
  "Correct.",
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
    case "true-false": {
      const truthy = new Set(["true", "t", "yes", "y", "1"]);
      const falsy = new Set(["false", "f", "no", "n", "0"]);
      const expBool = truthy.has(exp) ? "true" : falsy.has(exp) ? "false" : exp;
      const stuBool = truthy.has(stu) ? "true" : falsy.has(stu) ? "false" : stu;
      return expBool === stuBool;
    }
    // sequence in Life Sciences is rendered as MCQ (the option IS the full
    // ordering string), so a plain equality check is correct here.
    case "sequence":
    case "choice":
    case "cloze":
    case "match":
    case "scenario":
    case "diagram-label":
    case "data-interpret":
    default:
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

  // Count this answered question against the shared daily Freebie pool (chat
  // messages + subject questions, cap 5). Paid plans are unlimited; this 429s
  // with `upgradeRequired` so the client shows the upgrade modal.
  const limitResponse = await enforceSharedQuestionLimit(userId);
  if (limitResponse) return limitResponse;

  try {
    const submission: LifeSciencesSubmitAnswerRequest = await req.json();

    const topic = getTopic(submission.skill_id);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const question = topic.questions.find((q) => q.ref === submission.question_ref);
    const expected = question?.expected ?? submission.expected_answer;
    const memo = question?.memo ?? "";
    const errorSignals = question?.error_signals ?? [];
    // Prefer bank rubric — the client passes one through but the bank is truth.
    const rubric = question?.rubric ?? submission.rubric;

    let isCorrect: boolean;
    let feedback: string;

    if (submission.input_type === "short-response") {
      // Free-text → grade via the LLM judge in mustMention mode. When no
      // rubric is present, fall back to "non-empty answer = correct" with the
      // memo as feedback — keeps the screen moving instead of 500-ing.
      if (!rubric || !rubric.must_mention || rubric.must_mention.length === 0) {
        isCorrect = submission.student_answer.trim().length > 0;
        feedback = isCorrect ? pick(PRAISE) : "Try again — write your answer in 1–3 sentences.";
      } else {
        const judge = openAIJudge(getOpenAI());
        const verdict = await judge({
          studentAnswer: submission.student_answer,
          questionText: submission.question,
          mustMention: rubric.must_mention,
        });
        isCorrect = verdict.pass;
        if (isCorrect) {
          feedback = pick(PRAISE);
        } else if (verdict.firedError === "PARTIAL_RUBRIC") {
          feedback = "Close — you've got part of it. Re-read the memo and try to cover every required point.";
        } else {
          feedback = `Not quite — let's try again. ${topic.recovery_strategy}`;
        }
      }
    } else {
      isCorrect = scoreAnswer(submission.input_type, submission.student_answer, expected);
      feedback = isCorrect
        ? pick(PRAISE)
        : `Not quite — let's try again. ${topic.recovery_strategy}`;
    }

    const response: LifeSciencesSubmitAnswerResponse = {
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
    console.error("[life-sciences/submit-answer] error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}
