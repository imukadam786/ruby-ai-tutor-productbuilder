import { withRubies } from "@/lib/with-rubies";
import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken, enforceSharedQuestionLimit } from "@/lib/server-usage";
import { getTopic } from "@/lib/life-skills-selector";
import { scoreLifeSkills } from "@/lib/life-skills-scoring";
import type {
  LifeSkillsSubmitAnswerRequest,
  LifeSkillsSubmitAnswerResponse,
} from "@/types/life-skills";

// ─── Foundation-Phase praise pool (Grades 1–3) ────────────────────────────────
const PRAISE = [
  "Amazing! You got it! ⭐",
  "Brilliant work! That's exactly right! 🌟",
  "Yes! You did it! Keep going! ⭐",
  "Fantastic! That's correct! 🎉",
  "Superstar! Well done! ⭐",
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function handler(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  // Auth required so progress can be tied to a user and the answered question
  // can be counted against the shared daily Freebie pool.
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
    const submission: LifeSkillsSubmitAnswerRequest = await req.json();

    const topic = getTopic(submission.skill_id);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const question = topic.questions.find((q) => q.ref === submission.question_ref);
    // Use bank-truth where available so we always return the canonical memo,
    // even if the client posted a stale expected_answer.
    const expected = question?.expected ?? submission.expected_answer;
    const memo = question?.memo ?? "";
    const errorSignals = question?.error_signals ?? [];

    const isCorrect = scoreLifeSkills(
      submission.input_type,
      submission.student_answer,
      expected,
    );

    const feedback = isCorrect
      ? pick(PRAISE)
      : `Not quite — let's try again. ${topic.recovery_strategy}`;

    const response: LifeSkillsSubmitAnswerResponse = {
      is_correct: isCorrect,
      // Surface error_signals only when the answer was wrong, so the UI can show
      // them as reteach hints. On a correct answer they're irrelevant.
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
    console.error("[life-skills/submit-answer] error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}

export const POST = withRubies("life-skills", handler);
