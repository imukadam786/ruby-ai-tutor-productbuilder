import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/anthropic";
import { getReadingSkillById } from "@/lib/reading-student-model";
import {
  ReadingAnswerSubmission,
  ReadingDiagnosticResult,
  ReadingSkillAttempt,
  ReadingErrorType,
} from "@/types/reading";

const VALID_ERROR_TYPES: ReadingErrorType[] = [
  "ERR_PHONEME_CONF", "ERR_SOUND_RECALL", "ERR_BLEND_FAIL", "ERR_SOUND_OMIT",
  "ERR_SOUND_INSERT", "ERR_VOWEL_CONF", "ERR_ORTHO_GUESS", "ERR_SIGHT_MISS",
  "ERR_MULTI_BREAK", "ERR_FLUENCY_HES", "ERR_MEANING_BLIND", "ERR_SELF_MON",
  "correct",
];

function checkAnswerCorrectness(studentAnswer: string, expectedAnswer: string): boolean {
  const normalise = (s: string) =>
    s.toLowerCase().trim().replace(/[.,!?'"]/g, "").replace(/\s+/g, " ");
  const student = normalise(studentAnswer);
  const expected = normalise(expectedAnswer);
  if (student === expected) return true;
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
  if (usedHint) return "ERR_SOUND_RECALL";
  const student = studentAnswer.toLowerCase().trim();
  const expected = expectedAnswer.toLowerCase().trim();
  if (student.length === 0) return "ERR_SOUND_OMIT";
  // Phoneme-level error: similar length but different sounds
  if (Math.abs(student.length - expected.length) <= 2 && student !== expected) {
    return "ERR_PHONEME_CONF";
  }
  return "ERR_MEANING_BLIND";
}

function sanitiseErrorType(raw: string, fallback: ReadingErrorType): ReadingErrorType {
  return VALID_ERROR_TYPES.includes(raw as ReadingErrorType)
    ? (raw as ReadingErrorType)
    : fallback;
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

Analyse the student's response and provide diagnostic feedback.

For error_type, use ONLY one of these exact values:
- "correct" (student answered correctly)
- "ERR_PHONEME_CONF" (confuses similar sounds, e.g. /p/ vs /b/)
- "ERR_SOUND_RECALL" (cannot retrieve a letter's sound)
- "ERR_BLEND_FAIL" (can say phonemes separately but cannot blend into a word)
- "ERR_SOUND_OMIT" (phoneme missing from output — medial vowels or final consonants)
- "ERR_SOUND_INSERT" (extra phoneme added)
- "ERR_VOWEL_CONF" (short/long vowel mismatch or vowel team error)
- "ERR_ORTHO_GUESS" (uses visual shape or first letter to guess rather than decode)
- "ERR_SIGHT_MISS" (irregular high-frequency word misread)
- "ERR_MULTI_BREAK" (decodes syllables separately but cannot blend full word)
- "ERR_FLUENCY_HES" (hesitations or slow word-by-word reading)
- "ERR_MEANING_BLIND" (reads accurately but shows no comprehension)
- "ERR_SELF_MON" (does not notice or correct errors that create nonsense)

Respond in this exact JSON format (no markdown, raw JSON only):
{
  "is_correct": ${isCorrect},
  "error_type": "one of the values above",
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

    const finalErrorType = sanitiseErrorType(aiDiagnosis.error_type, preClassified);

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
      error_type: finalErrorType,
      feedback: aiDiagnosis.feedback,
      timestamp: new Date().toISOString(),
    };

    // Base decision derived from correctness; the full Section 10/11 decision is
    // recalculated client-side in ReadingSession once the profile is updated.
    const decision: ReadingDiagnosticResult["decision"] = isCorrect ? "PRACTICE" : "RETEACH";

    const result: ReadingDiagnosticResult = {
      is_correct: isCorrect,
      error_type: finalErrorType,
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
      decision,
    };

    return NextResponse.json({ result, attempt });
  } catch (error) {
    console.error("Reading submit-answer error:", error);
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 });
  }
}
