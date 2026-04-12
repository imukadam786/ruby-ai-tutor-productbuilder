import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/anthropic";
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

// Phoneme patterns extracted from a target word — used for word-based phoneme tasks.
// Returns the key sound cluster(s) to look for in the student's spoken word.
const PHONEME_CLUSTERS: Record<string, string[]> = {
  th: ["th"], sh: ["sh"], ch: ["ch"], ph: ["ph", "f"], wh: ["wh", "w"],
  ng: ["ng"], ck: ["ck", "k"], qu: ["qu", "kw"],
  bl: ["bl"], br: ["br"], cl: ["cl"], cr: ["cr"], dr: ["dr"], fl: ["fl"],
  fr: ["fr"], gl: ["gl"], gr: ["gr"], pl: ["pl"], pr: ["pr"], sc: ["sc"],
  sk: ["sk"], sl: ["sl"], sm: ["sm"], sn: ["sn"], sp: ["sp"], st: ["st"],
  sw: ["sw"], tr: ["tr"], tw: ["tw"],
};

function extractTargetPhoneme(question: string): string | null {
  // Look for quoted sound patterns like 'th', "sh", or /ch/ in the question
  const quoted = question.match(/['"/]([a-z]{1,3})['"/]/i);
  if (quoted) return quoted[1].toLowerCase();
  // Look for "the X sound" or "X sound"
  const soundMatch = question.match(/\b([a-z]{1,3})\s+sound/i);
  if (soundMatch) return soundMatch[1].toLowerCase();
  return null;
}

function checkPhonemeWordMatch(studentWord: string, expectedWord: string, question: string): boolean {
  const student = studentWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!student) return false;

  // Try to identify the target phoneme from the question first
  const targetPhoneme = extractTargetPhoneme(question);
  if (targetPhoneme) {
    const variants = PHONEME_CLUSTERS[targetPhoneme] ?? [targetPhoneme];
    return variants.some((v) => student.includes(v));
  }

  // Fallback: extract the phoneme from the expected word (first 1-2 chars usually)
  const expected = expectedWord.toLowerCase().replace(/[^a-z]/g, "");
  if (expected.length >= 2) {
    const cluster = expected.slice(0, 2);
    if (PHONEME_CLUSTERS[cluster]) {
      const variants = PHONEME_CLUSTERS[cluster] ?? [cluster];
      return variants.some((v) => student.includes(v));
    }
  }
  // Single consonant/vowel match
  return student.includes(expected.slice(0, 1));
}

function checkAnswerCorrectness(studentAnswer: string, expectedAnswer: string, question = ""): boolean {
  const normalise = (s: string) =>
    s.toLowerCase().trim().replace(/[.,!?'"]/g, "").replace(/\s+/g, " ");
  const student = normalise(studentAnswer);
  const expected = normalise(expectedAnswer);
  if (student === expected) return true;
  if (expected.length > 3 && student.includes(expected)) return true;

  // Phoneme-word task: question asks to "say a word with the X sound"
  // Accept any word containing the target phoneme
  if (/say a word|tell me a word|think of a word|word that (has|starts|contains)/i.test(question)) {
    return checkPhonemeWordMatch(student, expected, question);
  }

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

    const isCorrect = checkAnswerCorrectness(submission.student_answer, submission.expected_answer, submission.question);
    const preClassified = preClassifyError(
      isCorrect,
      submission.student_answer,
      submission.expected_answer,
      submission.used_hint
    );

    // Detect phoneme-word tasks so the AI grader applies the right rule
    const isPhonemeWordTask = /say a word|tell me a word|think of a word|word that (has|starts|contains)/i.test(
      submission.question
    );
    const phonemeWordNote = isPhonemeWordTask
      ? `\nNOTE: This question asked the student to say any word containing a target sound — NOT an exact word. Mark as correct if the student's word genuinely contains the target phoneme, even if it differs from the expected answer.`
      : "";

    const lang = submission.language && submission.language !== "English"
      ? submission.language
      : "English";
    const langInstruction = lang !== "English"
      ? `\nIMPORTANT: Write ONLY the "feedback" and "recovery_explanation" values in ${lang}. All other JSON field names and values (error_type, is_correct) must remain in English.\n`
      : "";

    // ── 2-tier LLM decision ───────────────────────────────────────────────────
    // Tier 1 — correct:    static praise (translated if needed), 0 API calls
    // Tier 2 — incorrect:  LLM generates friendly, language-correct feedback
    const PRAISE_EN = [
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
      // Tier 1 — no LLM call; translate praise if needed
      let praise = PRAISE_EN[Math.floor(Math.random() * PRAISE_EN.length)];
      if (lang !== "English") {
        try {
          const praiseResp = await getOpenAI().chat.completions.create({
            model: OPENAI_MODEL,
            max_tokens: 60,
            messages: [{
              role: "user",
              content: `Translate this short praise sentence into ${lang} for a child. Return only the translated sentence, nothing else: "${praise}"`,
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
    } else {
      // Tier 2 — LLM generates friendly, student-facing, language-correct feedback
      const isFirstAttempt = submission.attempt_number <= 1;
      const prompt = `You are Ruby, a warm and encouraging literacy tutor for primary school students (Grade R–3).${langInstruction}

A student is practising this reading skill:
SKILL: ${skill.title}
DESCRIPTION: ${skill.description}

QUESTION THEY WERE ASKED: ${submission.question}
CORRECT ANSWER: ${submission.expected_answer}
STUDENT'S ANSWER: ${submission.student_answer}
${isFirstAttempt ? "This is their first attempt." : "They have already tried this more than once."}
${phonemeWordNote}

Write feedback that:
- Tells the student what they got wrong in simple, friendly words (no jargon)
- Shows them the correct answer clearly
- Gives one practical tip they can do RIGHT NOW to improve (no technical codes like "Elkonin box drill" or "PHONEME_OMIT" — explain it in plain language a child understands)
${isFirstAttempt ? "- Keep it brief and encouraging since it is their first try" : "- Be a bit more detailed since they have tried before"}

For error_type, use ONLY one of these exact English values:
"ERR_PHONEME_CONF", "ERR_SOUND_RECALL", "ERR_BLEND_FAIL", "ERR_SOUND_OMIT",
"ERR_SOUND_INSERT", "ERR_VOWEL_CONF", "ERR_ORTHO_GUESS", "ERR_SIGHT_MISS",
"ERR_MULTI_BREAK", "ERR_FLUENCY_HES", "ERR_MEANING_BLIND", "ERR_SELF_MON"

Respond in this exact JSON format (no markdown, raw JSON only):
{
  "is_correct": false,
  "error_type": "one of the values above",
  "feedback": "1-2 warm sentences telling the student what went wrong and showing the correct answer.",
  "recovery_explanation": "One plain-language tip the student can act on immediately."
}`;

      const aiResponse = await getOpenAI().chat.completions.create({
        model: OPENAI_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }, { signal: AbortSignal.timeout(20_000) });

      const aiText = aiResponse.choices[0]?.message?.content ?? "";

      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        aiDiagnosis = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
      } catch {
        aiDiagnosis = {
          is_correct: false,
          error_type: preClassified,
          feedback: "Not quite — give it another try!",
          recovery_explanation: "Read each sound carefully from left to right, then blend them together.",
        };
      }
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
    };

    return NextResponse.json({ result, attempt });
  } catch (error) {
    console.error("Reading submit-answer error:", error);
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 });
  }
}
