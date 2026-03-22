import { QuestionTemplate } from "@/types/ruby";
import { ReadingTemplate } from "@/types/reading";

// ─── Maths Template Selector ──────────────────────────────────────────────────

export function selectMathsTemplate(
  is_correct: boolean,
  errorType: string | null,
  recentTemplates: QuestionTemplate[]
): QuestionTemplate {
  // Incorrect answer: select by error type — change approach, not just cycle
  if (!is_correct) {
    const preferred: Record<string, QuestionTemplate> = {
      execution_slip:            "story",    // contextualise the operation
      strategy_gap:              "concrete", // visual/physical representation
      representation_confusion:  "concrete", // ground in physical form
      conceptual_gap:            "symbolic", // simplified symbolic form
    };
    const target: QuestionTemplate = (errorType && preferred[errorType]) ? preferred[errorType] : "concrete";
    const last = recentTemplates[recentTemplates.length - 1];
    if (last === target) {
      const fallback: Record<QuestionTemplate, QuestionTemplate> = {
        concrete: "story",
        story:    "concrete",
        symbolic: "concrete",
      };
      return fallback[target];
    }
    return target;
  }

  // Correct answer: rotate templates, avoid consecutive repetition
  const all: QuestionTemplate[] = ["concrete", "story", "symbolic"];
  const last = recentTemplates[recentTemplates.length - 1];
  const available = all.filter((t) => t !== last);
  const prevPrev = recentTemplates[recentTemplates.length - 2] as QuestionTemplate | undefined;
  const lastAvailableIndex = prevPrev !== undefined ? available.indexOf(prevPrev) : -1;
  return available[(lastAvailableIndex + 1) % available.length];
}

// ─── Reading Template Selector ────────────────────────────────────────────────

export function selectReadingTemplate(
  is_correct: boolean,
  errorType: string | null,
  lessonPhase: string | null,
  recentTemplates: ReadingTemplate[]
): ReadingTemplate {
  // Lesson arc phase overrides correctness when active
  if (lessonPhase === "guided") return "oral";
  if (lessonPhase === "mastery_check") {
    const last = recentTemplates[recentTemplates.length - 1];
    return last === "written" ? "reading" : "written";
  }

  // Incorrect answer: favour oral or listening — most fundamental, easiest to scaffold
  if (!is_correct) {
    const preferred: Record<string, ReadingTemplate> = {
      ERR_PHONEME_CONF:  "oral",
      ERR_SOUND_RECALL:  "oral",
      ERR_BLEND_FAIL:    "oral",
      ERR_SOUND_OMIT:    "listening",
      ERR_SOUND_INSERT:  "listening",
      ERR_VOWEL_CONF:    "oral",
      ERR_ORTHO_GUESS:   "listening",
      ERR_SIGHT_MISS:    "oral",
      ERR_MULTI_BREAK:   "oral",
      ERR_FLUENCY_HES:   "oral",
      ERR_MEANING_BLIND: "listening",
      ERR_SELF_MON:      "listening",
    };
    const target: ReadingTemplate = (errorType && preferred[errorType]) ? preferred[errorType] : "oral";
    const last = recentTemplates[recentTemplates.length - 1];
    if (last === target) {
      return target === "oral" ? "listening" : "oral";
    }
    return target;
  }

  // Correct answer: rotate templates, no consecutive repetition
  const all: ReadingTemplate[] = ["oral", "listening", "written", "reading"];
  const last = recentTemplates[recentTemplates.length - 1];
  const available = all.filter((t) => t !== last);
  const prevPrev = recentTemplates[recentTemplates.length - 2] as ReadingTemplate | undefined;
  const lastAvailableIndex = prevPrev !== undefined ? available.indexOf(prevPrev) : -1;
  return available[(lastAvailableIndex + 1) % available.length];
}
