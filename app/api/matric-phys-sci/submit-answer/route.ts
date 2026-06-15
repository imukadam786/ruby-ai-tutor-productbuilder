import { withRubies } from "@/lib/with-rubies";
import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken, enforceSharedQuestionLimit } from "@/lib/server-usage";
import { getSkill } from "@/lib/matric-phys-sci-selector";
import { scorePhysSci } from "@/lib/matric-phys-sci-scoring";
import { asPhysSciGrade } from "@/lib/phys-sci-grade";
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
    const grade = asPhysSciGrade(submission.grade);

    const skill = getSkill(submission.skill_id, grade);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const item = skill.items.find((it) => it.id === submission.question_ref);
    if (!item) {
      return NextResponse.json({ error: "Item not found in skill" }, { status: 404 });
    }

    const isCorrect = scorePhysSci({
      answerMode: item.answerMode,
      studentAnswer: submission.student_answer,
      expectedAnswer: item.expectedAnswer,
      tolerance: item.tolerance,
      fields: item.fields,
      expectedOrder: item.expected_order,
    });

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
