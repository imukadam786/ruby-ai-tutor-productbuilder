import { withRubies } from "@/lib/with-rubies";
import { NextRequest, NextResponse } from "next/server";
import { getMathsLiteracySkillById } from "@/lib/maths-literacy-student-model";
import type {
  MathsLiteracyDiagnosticResult,
  MathsLiteracySkillAttempt,
  MathsLiteracySubmitRequest,
  MathsLiteracySubmitResponse,
} from "@/types/maths-literacy";
import {
  parseAnswerKey,
  scoreMathsLiteracy,
  formatExpectedAnswer,
} from "@/lib/maths-literacy-scoring";
import { verifyToken, enforceSharedQuestionLimit } from "@/lib/server-usage";

async function handler(req: NextRequest) {
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

    const key = parseAnswerKey(submission.expected_answer_key);
    if (!key) {
      return NextResponse.json({ error: "Bad answer key" }, { status: 400 });
    }

    const { isCorrect, partialCredit } = scoreMathsLiteracy(
      key,
      submission.student_answer,
      submission.student_fields
    );

    // Surface error signals from the bank item on miss. We don't re-load the bank
    // server-side — the client passes the question's real codes through for
    // per-signal feedback; fall back to a generic marker if absent.
    const errorSignals: string[] = isCorrect
      ? []
      : submission.error_signals && submission.error_signals.length > 0
      ? submission.error_signals
      : ["INCORRECT_ANSWER"];

    const expectedText = formatExpectedAnswer(key);
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

export const POST = withRubies("maths-literacy", handler);
