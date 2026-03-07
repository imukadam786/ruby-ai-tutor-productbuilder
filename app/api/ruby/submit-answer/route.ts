import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/anthropic";
import { getSkillById } from "@/lib/student-model";
import {
  checkAnswerCorrectness,
  classifyError,
  buildDiagnosticPrompt,
} from "@/lib/diagnostic-engine";
import { AnswerSubmission, DiagnosticResult, SkillAttempt } from "@/types/ruby";

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

    // Get AI diagnostic
    const diagnosticPrompt = buildDiagnosticPrompt(
      submission,
      skill,
      preClassifiedError
    );

    const aiResponse = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: diagnosticPrompt }],
    });

    const aiText = aiResponse.choices[0]?.message?.content ?? "";

    let aiDiagnosis: {
      is_correct: boolean;
      error_type: string;
      feedback: string;
      recovery_explanation: string;
    };

    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      aiDiagnosis = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
    } catch {
      // Fallback if AI response is not valid JSON
      aiDiagnosis = {
        is_correct: isCorrect,
        error_type: preClassifiedError,
        feedback: isCorrect
          ? "Great work! Your answer is correct."
          : `Your answer was ${submission.student_answer} but the expected answer is ${submission.expected_answer}. Let's look at this together.`,
        recovery_explanation: skill.recovery_strategy,
      };
    }

    // Build the attempt record
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
