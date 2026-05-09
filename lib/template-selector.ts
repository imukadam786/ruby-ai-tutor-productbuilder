import { QuestionTemplate } from "@/types/ruby";
import { ReadingTemplate } from "@/types/reading";

// ─── Maths Template Selector ──────────────────────────────────────────────────

export function selectMathsTemplate(
  decision: string,
  errorType: string | null,
  recentTemplates: QuestionTemplate[]
): QuestionTemplate {
  // RETEACH: select by error type — change approach, not just cycle
  if (decision === "reteach") {
    const preferred: Record<string, QuestionTemplate> = {
      execution_slip:            "story",    // contextualise the operation
      strategy_gap:              "concrete", // visual/physical representation
      representation_confusion:  "concrete", // ground in physical form
      conceptual_gap:            "symbolic", // simplified symbolic form
    };
    const target: QuestionTemplate = (errorType && preferred[errorType]) ? preferred[errorType] : "concrete";
    const last = recentTemplates[recentTemplates.length - 1];
    if (last === target) {
      // Preferred template just used — pick next best
      const fallback: Record<QuestionTemplate, QuestionTemplate> = {
        concrete: "story",
        story:    "concrete",
        symbolic: "concrete",
      };
      return fallback[target];
    }
    return target;
  }

  // ACCELERATE: symbolic — highest demand, no scaffolding
  if (decision === "accelerate") return "symbolic";

  // BACKTRACK / review_prerequisite: concrete — start foundational
  if (decision === "backtrack" || decision === "review_prerequisite") return "concrete";

  // PRACTICE / ADVANCE: rotate, avoid consecutive repetition
  const all: QuestionTemplate[] = ["concrete", "story", "symbolic"];
  const last = recentTemplates[recentTemplates.length - 1];
  const available = all.filter((t) => t !== last);
  const prevPrev = recentTemplates[recentTemplates.length - 2] as QuestionTemplate | undefined;
  const lastAvailableIndex = prevPrev !== undefined ? available.indexOf(prevPrev) : -1;
  return available[(lastAvailableIndex + 1) % available.length];
}

// ─── Reading Template Selector ────────────────────────────────────────────────

export function selectReadingTemplate(
  decision: string,
  errorType: string | null,
  lessonPhase: string | null,
  recentTemplates: ReadingTemplate[]
): ReadingTemplate {
  // Lesson arc phase overrides decision when active
  if (lessonPhase === "guided") return "oral";
  if (lessonPhase === "mastery_check") {
    const last = recentTemplates[recentTemplates.length - 1];
    return last === "written" ? "reading" : "written";
  }

  // RETEACH: favour oral or listening — most fundamental, easiest to scaffold
  if (decision === "reteach") {
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
      // Avoid immediate repetition — swap oral↔listening
      return target === "oral" ? "listening" : "oral";
    }
    return target;
  }

  // ACCELERATE: written or reading — highest demand
  if (decision === "accelerate") {
    const last = recentTemplates[recentTemplates.length - 1];
    return last === "written" ? "reading" : "written";
  }

  // BACKTRACK: oral — start foundational on prerequisite skill
  if (decision === "backtrack") return "oral";

  // PRACTICE / ADVANCE: rotate, no consecutive repetition
  const all: ReadingTemplate[] = ["oral", "listening", "written", "reading"];
  const last = recentTemplates[recentTemplates.length - 1];
  const available = all.filter((t) => t !== last);
  const prevPrev = recentTemplates[recentTemplates.length - 2] as ReadingTemplate | undefined;
  const lastAvailableIndex = prevPrev !== undefined ? available.indexOf(prevPrev) : -1;
  return available[(lastAvailableIndex + 1) % available.length];
}
