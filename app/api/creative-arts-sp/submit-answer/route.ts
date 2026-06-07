import { withRubies } from "@/lib/with-rubies";
import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken, enforceSharedQuestionLimit } from "@/lib/server-usage";
import { getTopic } from "@/lib/creative-arts-sp-selector";
import { scoreCreativeArtsSpAnswer } from "@/lib/creative-arts-sp-scoring";
import type {
  CreativeArtsSpSubmitAnswerRequest,
  CreativeArtsSpSubmitAnswerResponse,
} from "@/types/creative-arts-sp";

// ─── Senior-Phase-appropriate praise pool (Grades 7–9) ────────────────────────
const PRAISE = [
  "Correct — nice thinking.",
  "Spot on. ✓",
  "That's right.",
  "Exactly. Well done.",
  "Correct.",
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

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
    const submission: CreativeArtsSpSubmitAnswerRequest = await req.json();

    const topic = getTopic(submission.skill_id);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const question = topic.questions.find((q) => q.ref === submission.question_ref);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const memo = question.memo ?? "";
    const errorSignals = question.error_signals ?? [];

    const { correct: isCorrect, score } = scoreCreativeArtsSpAnswer(
      submission.input_type,
      submission.student_answer,
      question,
    );

    const feedback = isCorrect
      ? pick(PRAISE)
      : `Not quite — let's try again. ${topic.recovery_strategy}`;

    const response: CreativeArtsSpSubmitAnswerResponse = {
      is_correct: isCorrect,
      score,
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
    console.error("[creative-arts-sp/submit-answer] error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}

export const POST = withRubies("creative-arts-sp", handler);
