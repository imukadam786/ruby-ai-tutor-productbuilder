import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { getOpenAI, OPENAI_MODEL, OPENAI_SMART_MODEL } from "@/lib/anthropic";
import { getSkillById } from "@/lib/student-model";
import {
  checkAnswerCorrectness,
  classifyError,
  buildDiagnosticPrompt,
} from "@/lib/diagnostic-engine";
import { AnswerSubmission, DiagnosticResult, SkillAttempt } from "@/types/ruby";

export async function POST(req: NextRequest) {
  const deny = requireApiSecret(req);
  if (deny) return deny;
  try {
    const submission: AnswerSubmission = await req.json();

    const skill = getSkillById(submission.skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const isCorrect = checkAnswerCorrectness(
      submission.student_answer,
      submission.expected_answer
    );

    const preClassifiedError = classifyError({
      isCorrect,
      studentAnswer: submission.student_answer,
      expectedAnswer: submission.expected_answer,
      studentSteps: submission.student_steps,
      skill,
      usedHint: submission.used_hint,
      attemptNumber: 1,
    });

    const diagnosticPrompt = buildDiagnosticPrompt(
      submission,
      skill,
      preClassifiedError
    );

    // ── 3-tier LLM decision ───────────────────────────────────────────────────
    // Tier 1 — correct:             static praise, 0 API calls
    // Tier 2 — first incorrect:     pre-authored recovery tip, 0 API calls
    // Tier 3 — repeated incorrect:  LLM deep re-teaching, 1 API call
    const PRAISE = [
      "Great work! That's exactly right.",
      "Well done! Keep it up.",
      "Correct! You're doing brilliantly.",
      "Excellent! That's the right answer.",
      "Spot on! Nice thinking.",
    ];

    let aiDiagnosis: {
      is_correct: boolean;
      error_type: string;
      feedback: string;
      recovery_explanation: string;
    };

    if (isCorrect) {
      // Tier 1 — no LLM call
      const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      aiDiagnosis = {
        is_correct: true,
        error_type: "none",
        feedback: praise,
        recovery_explanation: "",
      };
    } else if (submission.attempt_number <= 1) {
      // Tier 2 — first incorrect: use pre-authored recovery tip, no LLM call
      aiDiagnosis = {
        is_correct: false,
        error_type: preClassifiedError,
        feedback: `Not quite — the answer is ${submission.expected_answer}. Let's try another one.`,
        recovery_explanation: skill.recovery_strategy,
      };
    } else {
      // Tier 3 — repeated incorrect: call LLM for personalised re-teaching
      const openai = getOpenAI();
      let aiText = "";

      if (submission.working_image) {
        const visionResponse = await openai.chat.completions.create({
          model: OPENAI_SMART_MODEL,
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: diagnosticPrompt },
                { type: "image_url", image_url: { url: submission.working_image, detail: "high" } },
                { type: "text", text: "The image above is a photo of the student's handwritten working from their book. Use it to inform your diagnosis — look for the steps they attempted, any errors in their method, and whether their process matches their final answer." },
              ],
            },
          ],
        }, { signal: AbortSignal.timeout(20_000) });
        aiText = visionResponse.choices[0]?.message?.content ?? "";
      } else {
        const aiResponse = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          max_tokens: 1024,
          messages: [{ role: "user", content: diagnosticPrompt }],
        }, { signal: AbortSignal.timeout(20_000) });
        aiText = aiResponse.choices[0]?.message?.content ?? "";
      }

      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        aiDiagnosis = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
      } catch {
        aiDiagnosis = {
          is_correct: false,
          error_type: preClassifiedError,
          feedback: `Your answer was ${submission.student_answer} but the expected answer is ${submission.expected_answer}. Let's look at this step by step.`,
          recovery_explanation: skill.recovery_strategy,
        };
      }
    }

    const attempt: SkillAttempt = {
      id: `attempt_${Date.now()}`,
      skill_id: submission.skill_id,
      template: submission.template,
      question: submission.question,
      student_answer: submission.student_answer,
      student_steps: submission.student_steps,
      expected_answer: submission.expected_answer,
      is_correct: isCorrect,
      scaffolded: submission.used_hint,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error_type: (aiDiagnosis.error_type as any) || preClassifiedError,
      feedback: aiDiagnosis.feedback,
      timestamp: new Date().toISOString(),
    };

    const result: DiagnosticResult = {
      is_correct: isCorrect,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error_type: (aiDiagnosis.error_type as any) || preClassifiedError,
      feedback: aiDiagnosis.feedback,
      recovery_explanation: aiDiagnosis.recovery_explanation,
      mastery_update: {
        skill_id: submission.skill_id,
        new_status: "in_progress",
        correct_count: isCorrect ? 1 : 0,
        attempt_count: 1,
        formats_used: [submission.template],
      },
      next_action: "continue_skill",
    };

    return NextResponse.json({ result, attempt });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 }
    );
  }
}
