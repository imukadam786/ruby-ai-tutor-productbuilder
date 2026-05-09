import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL, OPENAI_SMART_MODEL } from "@/lib/anthropic";
import { checkLanguage } from "@/lib/language-utils";
import { getSkillById } from "@/lib/student-model";
import {
  checkAnswerCorrectness,
  classifyError,
  buildDiagnosticPrompt,
} from "@/lib/diagnostic-engine";
import { AnswerSubmission, DiagnosticResult, ErrorType, SkillAttempt } from "@/types/ruby";

const VALID_ERROR_TYPES: ErrorType[] = [
  "correct",
  "conceptual_gap",
  "strategy_gap",
  "representation_confusion",
  "execution_slip",
];

export async function POST(req: NextRequest) {
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

    // Grade-aware praise pools.
    // Grades 1–3: warm, enthusiastic, emoji-friendly.
    // Grades 4–7: encouraging but not childish.
    // Grades 8–12: minimal; extra line added for hard questions (difficulty ≥ 4).
    const PRAISE_EARLY = [
      "Amazing! You got it! ⭐",
      "Brilliant work! That's exactly right! 🌟",
      "Yes! You did it! Keep going! ⭐",
      "Fantastic! That's correct! 🎉",
      "Superstar! Well done! ⭐",
    ];
    const PRAISE_MID = [
      "Correct! Good thinking.",
      "Well done — that's right.",
      "Spot on. Keep it up.",
      "Nice work. That's exactly it.",
      "Correct. Good approach.",
    ];
    const PRAISE_SENIOR = [
      "Correct.",
      "Right answer.",
      "That's it.",
      "Exactly right.",
      "Correct — well done.",
    ];
    const PRAISE_SENIOR_HARD = [
      "Correct — that one takes real understanding.",
      "Right. That's a genuinely challenging skill.",
      "Exactly right. Not an easy question.",
      "Correct — good work on a hard one.",
    ];

    function selectPraise(grade: number, difficulty: number): string {
      const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
      if (grade <= 3) return pick(PRAISE_EARLY);
      if (grade <= 7) return pick(PRAISE_MID);
      // Senior: acknowledge hard questions specifically
      if (difficulty >= 4) return pick(PRAISE_SENIOR_HARD);
      return pick(PRAISE_SENIOR);
    }

    let aiDiagnosis: {
      is_correct: boolean;
      error_type: string;
      feedback: string;
      recovery_explanation: string;
    };

    if (isCorrect) {
      // Tier 1 — translate praise if needed, otherwise no LLM call
      let praise = selectPraise(submission.grade ?? 5, submission.difficulty ?? 2);
      if (submission.language && submission.language !== "English") {
        try {
          const praiseResp = await getOpenAI().chat.completions.create({
            model: OPENAI_MODEL,
            max_tokens: 60,
            messages: [{
              role: "user",
              content: `Translate this short praise sentence into ${submission.language} for a school student. Return only the translated sentence, nothing else: "${praise}"`,
            }],
          }, { signal: AbortSignal.timeout(8_000) });
          praise = praiseResp.choices[0]?.message?.content?.trim() || praise;
        } catch { /* keep English on failure */ }
      }
      aiDiagnosis = {
        is_correct: true,
        error_type: "correct",
        feedback: praise,
        recovery_explanation: "",
      };
    } else if (submission.attempt_number <= 1) {
      // Tier 2 — first incorrect: use pre-authored recovery tip, no LLM call
      aiDiagnosis = {
        is_correct: false,
        error_type: preClassifiedError,
        feedback: "Not quite — give it another try!",
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
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
        aiDiagnosis = {
          ...parsed,
          error_type: VALID_ERROR_TYPES.includes(parsed.error_type)
            ? parsed.error_type
            : preClassifiedError,
        };
      } catch {
        aiDiagnosis = {
          is_correct: false,
          error_type: preClassifiedError,
          feedback: `Let's work through this together. ${skill.recovery_strategy}`,
          recovery_explanation: skill.recovery_strategy,
        };
      }

      if (submission.language && submission.language !== "English" && aiDiagnosis.feedback) {
        const langOk = await checkLanguage(aiDiagnosis.feedback, submission.language);
        if (!langOk) {
          const retryPrompt = diagnosticPrompt + `\n\nCRITICAL OVERRIDE: Your "feedback" and "recovery_explanation" MUST be written entirely in ${submission.language}. Not a single English word in those two fields.`;
          try {
            const retryResp = await openai.chat.completions.create({
              model: OPENAI_MODEL,
              max_tokens: 1024,
              messages: [{ role: "user", content: retryPrompt }],
            }, { signal: AbortSignal.timeout(20_000) });
            const retryText = retryResp.choices[0]?.message?.content ?? "";
            const retryMatch = retryText.match(/\{[\s\S]*\}/);
            const retryParsed = JSON.parse(retryMatch ? retryMatch[0] : retryText);
            if (retryParsed.feedback) aiDiagnosis = { ...aiDiagnosis, ...retryParsed };
          } catch { /* keep original */ }
        }
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
