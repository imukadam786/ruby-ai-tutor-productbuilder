import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/anthropic";
import { checkLanguage, localiseFeedback } from "@/lib/language-utils";
import { selectPraise } from "@/lib/praise";
import { getReadingSkillById } from "@/lib/reading-student-model";
import { evaluateSequence } from "@/lib/reading-bank-evaluator";
import { openAIJudge } from "@/lib/reading-llm-judge";
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

    // Student's language — used to localise all student-facing feedback,
    // including the early-returning bank and R5 paths below.
    const lang = submission.language && submission.language !== "English"
      ? submission.language
      : "English";
    // Correct-answer praise tier from the reading level (R1–R2 → younger pool).
    const rLevel = parseInt(submission.skill_id?.match(/^R(\d+)/)?.[1] ?? "3", 10);
    const praiseGrade = rLevel <= 2 ? 2 : 5;

    // ── L6+ static-bank scoring (Intermediate Phase) ───────────────────────
    // generate-question sent the answer-key as JSON in expected_answer.
    // Deterministic skills score here with no LLM call; the others are
    // recorded honestly until their scorers are wired (next slice).
    if (skill.bank_skill_id) {
      let answerKey:
        | {
            mode?: string;
            order?: string[];
            reference?: string;
            checks?: { description?: string }[];
            options?: string[];
            correct?: number;
          }
        | null = null;
      try { answerKey = JSON.parse(submission.expected_answer); } catch { answerKey = null; }

      if (answerKey?.mode) {
        let bankCorrect = false;
        let bankError: string | null = null;
        let feedback: string;

        if (answerKey.mode === "sequence" && Array.isArray(answerKey.order)) {
          const studentSteps = submission.student_answer
            .split(/\r?\n|(?:^|\s)\d+[.)]\s*/)
            .map((s) => s.trim())
            .filter(Boolean);
          const seq = evaluateSequence(studentSteps, answerKey.order, {
            passThreshold: 0.7,
            requireZeroOmissions: true,
          });
          bankCorrect = seq.pass;
          bankError = seq.firedError;
          feedback = seq.pass
            ? "Great — your steps are in the right order!"
            : seq.firedError === "STEP_OMISSION"
              ? "Some steps are missing. Make sure every step is included, in order."
              : "The steps are out of order. Re-read and put them in the right sequence.";
        } else if (answerKey.mode === "similarity-band") {
          // Write-your-own answers (Find the Main Idea / details / data /
          // vocab) — marked by the AI judge. Main-idea uses the calibrated
          // path (no task); others are graded on their own skill task.
          const isMainIdea = (skill.bank_skill_id ?? "").endsWith(".A1");
          const judge = openAIJudge(getOpenAI());
          const r = await judge({
            studentAnswer: submission.student_answer,
            sourceText: submission.question,
            referenceMainIdea: answerKey.reference,
            task: isMainIdea ? undefined : `${skill.title} — ${skill.description}`,
          });
          bankCorrect = r.pass;
          bankError = r.firedError;
          feedback = r.pass
            ? "Nice work — that captures it."
            : r.reason || "Not quite — try to cover the whole idea in your own words.";
        } else if (answerKey.mode === "rubric") {
          // Writing skills — marked by the AI judge against the bank checklist.
          const checks = Array.isArray(answerKey.checks)
            ? answerKey.checks.map((c) => c.description).filter((d): d is string => !!d)
            : [];
          const judge = openAIJudge(getOpenAI());
          const r = await judge({
            studentAnswer: submission.student_answer,
            sourceText: submission.question,
            checklist: checks,
          });
          bankCorrect = r.pass;
          bankError = r.firedError;
          feedback = r.pass
            ? "Good writing — you covered what was needed."
            : r.reason || "Some parts are missing — check the instructions and try again.";
        } else if (
          answerKey.mode === "choice" &&
          Array.isArray(answerKey.options) &&
          typeof answerKey.correct === "number"
        ) {
          // Multiple choice (e.g. fact/opinion) — deterministic, no LLM.
          // Accept the option text, its letter (A/B/C), or its number.
          const opts = answerKey.options;
          const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
          const a = norm(submission.student_answer);
          let chosen = opts.findIndex((o) => norm(o) === a);
          if (chosen < 0) {
            const letter = "abcdefghij".indexOf(a);
            if (letter >= 0 && letter < opts.length) chosen = letter;
          }
          if (chosen < 0) {
            const n = parseInt(a, 10);
            if (!Number.isNaN(n) && n >= 1 && n <= opts.length) chosen = n - 1;
          }
          bankCorrect = chosen === answerKey.correct;
          bankError = bankCorrect ? null : "WRONG_CHOICE";
          feedback = bankCorrect
            ? "Correct!"
            : `Not quite — the correct answer is "${opts[answerKey.correct]}".`;
        } else {
          // cloze (A4): the blanked-passage display is still to be built, so
          // record honestly rather than mark something the child couldn't
          // properly attempt.
          feedback = "Answer recorded. Automatic marking for this question type is being set up.";
        }

        const et = (bankCorrect ? "correct" : bankError ?? "ERR_MEANING_BLIND") as ReadingErrorType;
        // Correct → pre-translated praise lookup (no LLM). Wrong → AI-translated.
        const bankLoc = bankCorrect
          ? { feedback: selectPraise(praiseGrade, 2, lang), recovery: "" }
          : await localiseFeedback({ feedback, recovery: skill.recovery_strategy ?? "" }, lang);
        const bankAttempt: ReadingSkillAttempt = {
          id: `rattempt_${Date.now()}`,
          skill_id: submission.skill_id,
          template: submission.template,
          question: submission.question,
          student_answer: submission.student_answer,
          student_steps: submission.student_steps,
          expected_answer: submission.expected_answer,
          is_correct: bankCorrect,
          scaffolded: submission.used_hint,
          error_type: et,
          feedback: bankLoc.feedback,
          timestamp: new Date().toISOString(),
        };
        const bankResult: ReadingDiagnosticResult = {
          is_correct: bankCorrect,
          error_type: et,
          feedback: bankLoc.feedback,
          recovery_explanation: bankLoc.recovery,
          mastery_update: {
            skill_id: submission.skill_id,
            new_status: "in_progress",
            correct_count: bankCorrect ? 1 : 0,
            attempt_count: 1,
            formats_used: [submission.template],
          },
          next_action: "continue_skill",
        };
        return NextResponse.json({ result: bankResult, attempt: bankAttempt });
      }
    }

    // ── R5.T1 comprehension (L5) — meaning-based marking ───────────────────
    // R5.T1.A1/A2/A3 are "read the passage, answer in your own words" skills.
    // They have no bank_skill_id, so without this they fall to the rigid
    // string match below — which fails correct paraphrases (e.g. answering
    // "They led the family" to the matriarch question). Route them through
    // the same semantic judge the higher levels use. Lenient on exact
    // wording: meaning is what counts, paraphrasing is fine.
    const isR5Comprehension =
      /^R5\.T1\.A[123]$/.test(submission.skill_id) &&
      submission.template === "written";
    if (isR5Comprehension) {
      const judge = openAIJudge(getOpenAI());
      const r = await judge({
        studentAnswer: submission.student_answer,
        sourceText: submission.question, // passage + question, as rendered
        referenceMainIdea: submission.expected_answer,
        task:
          `${skill.title} — ${skill.description} ` +
          `Mark the child CORRECT if their answer shows they understood and ` +
          `answered the question using the passage. Answering in their own ` +
          `words (paraphrasing) is fully acceptable — do NOT require the exact ` +
          `words from the text, and do NOT mark down for spelling or grammar. ` +
          `Mark wrong only if the answer is factually incorrect, off-topic, or ` +
          `a non-attempt.`,
      });
      const r5Correct = r.pass;
      const r5Error: ReadingErrorType = r5Correct ? "correct" : "ERR_MEANING_BLIND";
      const r5FeedbackEn = r5Correct
        ? "Well done — that's right. You explained it clearly in your own words."
        : r.reason
          ? `Not quite. ${r.reason}. Re-read the passage, find the part that answers the question, then say it in your own words.`
          : "Not quite — re-read the passage, find the part that answers the question, then say it in your own words.";
      const r5Loc = r5Correct
        ? { feedback: selectPraise(praiseGrade, 2, lang), recovery: "" }
        : await localiseFeedback({ feedback: r5FeedbackEn, recovery: skill.recovery_strategy ?? "" }, lang);
      const r5Attempt: ReadingSkillAttempt = {
        id: `rattempt_${Date.now()}`,
        skill_id: submission.skill_id,
        template: submission.template,
        question: submission.question,
        student_answer: submission.student_answer,
        student_steps: submission.student_steps,
        expected_answer: submission.expected_answer,
        is_correct: r5Correct,
        scaffolded: submission.used_hint,
        error_type: r5Error,
        feedback: r5Loc.feedback,
        timestamp: new Date().toISOString(),
      };
      const r5Result: ReadingDiagnosticResult = {
        is_correct: r5Correct,
        error_type: r5Error,
        feedback: r5Loc.feedback,
        recovery_explanation: r5Loc.recovery,
        mastery_update: {
          skill_id: submission.skill_id,
          new_status: "in_progress",
          correct_count: r5Correct ? 1 : 0,
          attempt_count: 1,
          formats_used: [submission.template],
        },
        next_action: "continue_skill",
      };
      return NextResponse.json({ result: r5Result, attempt: r5Attempt });
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

    const langInstruction = lang !== "English"
      ? `\nIMPORTANT: Write ONLY the "feedback" and "recovery_explanation" values in ${lang}. All other JSON field names and values (error_type, is_correct) must remain in English.\n`
      : "";

    // ── 2-tier LLM decision ───────────────────────────────────────────────────
    // Tier 1 — correct:    pre-translated praise lookup (lib/praise.ts), 0 API calls
    // Tier 2 — incorrect:  LLM generates friendly, language-correct feedback

    let aiDiagnosis: {
      is_correct: boolean;
      error_type: string;
      feedback: string;
      recovery_explanation: string;
    };

    if (isCorrect) {
      // Tier 1 — pre-translated praise lookup, NO LLM call in any language.
      aiDiagnosis = {
        is_correct: true,
        error_type: "correct",
        feedback: selectPraise(praiseGrade, 2, lang),
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

      if (lang !== "English" && aiDiagnosis.feedback) {
        const langOk = await checkLanguage(aiDiagnosis.feedback, lang);
        if (!langOk) {
          const retryPrompt = prompt + `\n\nCRITICAL OVERRIDE: Your "feedback" and "recovery_explanation" MUST be written entirely in ${lang}. Not a single English word in those two fields.`;
          const retryResp = await getOpenAI().chat.completions.create({
            model: OPENAI_MODEL,
            max_tokens: 300,
            messages: [{ role: "user", content: retryPrompt }],
          }, { signal: AbortSignal.timeout(15_000) });
          try {
            const retryText = retryResp.choices[0]?.message?.content ?? "";
            const retryMatch = retryText.match(/\{[\s\S]*\}/);
            const retryParsed = JSON.parse(retryMatch ? retryMatch[0] : retryText);
            if (retryParsed.feedback) aiDiagnosis = { ...aiDiagnosis, ...retryParsed };
          } catch { /* keep original */ }
        }
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
