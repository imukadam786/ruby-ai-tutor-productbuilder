import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/anthropic";
import { getReadingSkillById } from "@/lib/reading-student-model";
import {
  ReadingAnswerSubmission,
  ReadingDiagnosticResult,
  ReadingSkillAttempt,
  ReadingErrorType,
} from "@/types/reading";

function checkAnswerCorrectness(studentAnswer: string, expectedAnswer: string): boolean {
  const normalise = (s: string) =>
    s.toLowerCase().trim().replace(/[.,!?'"]/g, "").replace(/\s+/g, " ");
  const student = normalise(studentAnswer);
  const expected = normalise(expectedAnswer);
  if (student === expected) return true;
  // Allow if student answer contains the expected answer or vice versa (partial credit)
  if (expected.length > 3 && student.includes(expected)) return true;
  return false;
}

function preClassifyError(
  isCorrect: boolean,
  studentAnswer: string,
  expectedAnswer: string,
  usedHint: boolean
): ReadingErrorType {
  if (isCorrect) return "correct";
  if (usedHint) return "recall_error";
  // Simple heuristics
  const student = studentAnswer.toLowerCase().trim();
  const expected = expectedAnswer.toLowerCase().trim();
  if (student.length === 0) return "omission";
  // Phoneme-level error: similar length but different sounds
  if (Math.abs(student.length - expected.length) <= 2 && student !== expected) {
    return "phoneme_error";
  }
  return "comprehension_gap";
}

export async function POST(req: NextRequest) {
  try {
    const submission: ReadingAnswerSubmission = await req.json();

    const skill = getReadingSkillById(submission.skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const isCorrect = checkAnswerCorrectness(submission.student_answer, submission.expected_answer);
    const preClassified = preClassifyError(
      isCorrect,
      submission.student_answer,
      submission.expected_answer,
      submission.used_hint
    );

    const prompt = `You are Ruby, a literacy diagnostic tutor for primary school students (Grade R–3).

A student is working on this reading/literacy skill:
SKILL: ${skill.title}
DESCRIPTION: ${skill.description}
RECOVERY STRATEGY: ${skill.recovery_strategy}

QUESTION: ${submission.question}
EXPECTED ANSWER: ${submission.expected_answer}
STUDENT'S ANSWER: ${submission.student_answer}
USED HINT: ${submission.used_hint}
PRE-CLASSIFIED ERROR: ${preClassified}

Analyse the student's response and provide diagnostic feedback.

Respond in this exact JSON format (no markdown, raw JSON only):
{
  "is_correct": ${isCorrect},
  "error_type": "${preClassified}",
  "feedback": "Warm, encouraging 1-2 sentence feedback appropriate for a young learner. If correct, celebrate. If wrong, gently explain what went wrong.",
  "recovery_explanation": "A brief, simple explanation or tip to help the student improve on this skill."
}

Keep language simple, warm, and age-appropriate for a primary school child.`;

    const aiResponse = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
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
      aiDiagnosis = {
        is_correct: isCorrect,
        error_type: preClassified,
        feedback: isCorrect
          ? "Well done! Your answer is correct!"
          : `Your answer was "${submission.student_answer}" but the expected answer is "${submission.expected_answer}". Let's keep practising!`,
        recovery_explanation: skill.recovery_strategy,
      };
    }

    const attempt: ReadingSkillAttempt = {
      id: `rattempt_${Date.now()}`,
      skill_id: submission.skill_id,
      template: submission.template,
      question: submission.question,
      student_answer: submission.student_answer,
      student_steps: submission.student_steps,
      expected_answer: submission.expected_answer,
      is_correct: isCorrect,
      scaffolded: submission.used_hint,
      error_type: (aiDiagnosis.error_type as ReadingErrorType) || preClassified,
      feedback: aiDiagnosis.feedback,
      timestamp: new Date().toISOString(),
    };

    const result: ReadingDiagnosticResult = {
      is_correct: isCorrect,
      error_type: (aiDiagnosis.error_type as ReadingErrorType) || preClassified,
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
    console.error("Reading submit-answer error:", error);
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 });
  }
}
