import { ErrorType, AnswerSubmission, AtomicSkill } from "@/types/ruby";

// ─── Error Classification ─────────────────────────────────────────────────────

interface ClassificationInput {
  isCorrect: boolean;
  studentAnswer: string;
  expectedAnswer: string;
  studentSteps: string;
  skill: AtomicSkill;
  usedHint: boolean;
  attemptNumber: number;
}

export function classifyError(input: ClassificationInput): ErrorType {
  if (input.isCorrect) return "correct";

  const { studentAnswer, expectedAnswer, studentSteps, skill } = input;

  // Check each error signature in the skill for heuristic matching
  // This is a rule-based pre-classifier; the LLM provides the detailed diagnosis

  // Execution slip: answer is close (±1 or ±10%) to expected
  const numericExpected = parseFloat(expectedAnswer.replace(/[^0-9.\-]/g, ""));
  const numericStudent = parseFloat(studentAnswer.replace(/[^0-9.\-]/g, ""));
  if (!isNaN(numericExpected) && !isNaN(numericStudent)) {
    const diff = Math.abs(numericExpected - numericStudent);
    const percentOff = diff / Math.abs(numericExpected);
    if (diff <= 2 || percentOff <= 0.1) {
      return "execution_slip";
    }
  }

  // Strategy gap: student shows no working / very short steps when steps expected
  const stepsExpected = studentSteps.trim().length < 10 && studentAnswer.trim() !== "";
  if (stepsExpected && skill.error_signatures.some(e => e.type === "strategy_gap")) {
    return "strategy_gap";
  }

  // Representation confusion: answer is completely different magnitude or format
  if (!isNaN(numericExpected) && !isNaN(numericStudent)) {
    const percentOff = Math.abs(numericExpected - numericStudent) / Math.abs(numericExpected);
    if (percentOff > 5) {
      return "conceptual_gap";
    }
  }

  // Default to conceptual gap for wrong answers that don't fit other patterns
  if (skill.error_signatures.length > 0) {
    return skill.error_signatures[0].type;
  }

  return "conceptual_gap";
}

// ─── Answer Normalisation ─────────────────────────────────────────────────────

export function normaliseAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[,]/g, ""); // remove thousand separators
}

export function checkAnswerCorrectness(
  studentAnswer: string,
  expectedAnswer: string
): boolean {
  const s = normaliseAnswer(studentAnswer);
  const e = normaliseAnswer(expectedAnswer);

  if (s === e) return true;

  // Numeric comparison with tolerance
  const sNum = parseFloat(s.replace(/[^0-9.\-\/]/g, ""));
  const eNum = parseFloat(e.replace(/[^0-9.\-\/]/g, ""));
  if (!isNaN(sNum) && !isNaN(eNum)) {
    return Math.abs(sNum - eNum) < 0.001;
  }

  // Fraction comparison: "1/2" vs "0.5"
  const sFrac = parseFraction(s);
  const eFrac = parseFraction(e);
  if (sFrac !== null && eFrac !== null) {
    return Math.abs(sFrac - eFrac) < 0.001;
  }
  if (sFrac !== null && !isNaN(eNum)) return Math.abs(sFrac - eNum) < 0.001;
  if (eFrac !== null && !isNaN(sNum)) return Math.abs(eFrac - sNum) < 0.001;

  return false;
}

function parseFraction(str: string): number | null {
  const match = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (match) return parseInt(match[1]) / parseInt(match[2]);
  return null;
}

// ─── Build Diagnostic Prompt ──────────────────────────────────────────────────

export function buildDiagnosticPrompt(
  submission: AnswerSubmission,
  skill: AtomicSkill,
  preClassifiedError: ErrorType
): string {
  const errorDescriptions = skill.error_signatures
    .map(e => `- ${e.type}: ${e.description} (e.g. ${e.example})`)
    .join("\n");

  const langInstruction = submission.language && submission.language !== "English"
    ? `\nIMPORTANT: Write your "feedback" and "recovery_explanation" values in ${submission.language}. All other JSON fields (is_correct, error_type, confidence) remain in English.\n`
    : "";

  return `You are Ruby, a precise and empathetic math diagnostic tutor.${langInstruction}

A student answered a question. Analyse their response and provide targeted feedback.

SKILL: ${skill.title}
SKILL DESCRIPTION: ${skill.description}
QUESTION: ${submission.question}
EXPECTED ANSWER: ${submission.expected_answer}
STUDENT ANSWER: ${submission.student_answer}
STUDENT WORKING/STEPS: ${submission.student_steps || "(none shown)"}
USED HINT: ${submission.used_hint}
IS CORRECT: ${submission.student_answer.trim().toLowerCase() !== "" && checkAnswerCorrectness(submission.student_answer, submission.expected_answer)}

KNOWN ERROR PATTERNS FOR THIS SKILL:
${errorDescriptions}

PRE-CLASSIFIED ERROR TYPE: ${preClassifiedError}

RECOVERY STRATEGY FOR THIS SKILL: ${skill.recovery_strategy}

Please respond in this exact JSON format:
{
  "is_correct": boolean,
  "error_type": "correct" | "conceptual_gap" | "strategy_gap" | "representation_confusion" | "execution_slip",
  "feedback": "2-3 sentences of warm, specific feedback addressing exactly what the student did. If correct, praise specifically what they did well. If incorrect, acknowledge their effort without discouraging them.",
  "recovery_explanation": "1-3 sentences using the recovery strategy to re-teach or consolidate the concept. Be concrete and use the specific numbers from this question.",
  "confidence": 0.0-1.0
}

Be specific to this student's actual work. Do not be generic.`;
}
