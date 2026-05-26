// ─── Social Sciences — content, skill tree, student model, session ────────────
// Covers CAPS Intermediate Phase Grades 4–6, two strands per grade:
// History (HIS) and Geography (GEO). Map skills topics and History project
// topics are out of scope for this MCQ-based tutor.
// Mirrors the Life Skills types — same shape, different subject.

// ─── Bank content ─────────────────────────────────────────────────────────────

export type SocialSciencesInputType =
  | "choice"
  | "sequence"
  | "text"
  | "true-false";

/** Canonical error-signal codes. Authors may add topic-specific codes
 *  prefixed `ERR_SS_…`, so stored values are plain `string[]` in items. */
export type SocialSciencesCanonicalErrorSignal =
  | "ERR_SS_FACT"
  | "ERR_SS_CLASS"
  | "ERR_SS_SEQ"
  | "ERR_SS_CONTEXT"
  | "ERR_SS_VOCAB"
  | "ERR_SS_TIME"
  | "ERR_SS_MAP"
  | "correct";

export interface SocialSciencesBankQuestion {
  ref: string;
  question: string;
  ruby_prompt: string;
  context?: string;
  input_type: SocialSciencesInputType;
  options?: string[];
  expected: string | number;
  memo: string;
  error_signals: string[];
  difficulty?: number;
}

export type SocialSciencesGate = "NONE";

export interface SocialSciencesTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;
  skill_ids: string[];
  gate: SocialSciencesGate;
  pass_threshold: number;
  questions_for_mastery: number;
  target_item_count: number;
  caps_term?: string;
  sensitive?: boolean;
  templates?: string[];
  recovery_strategy: string;
  questions: SocialSciencesBankQuestion[];
}

export interface SocialSciencesBank {
  version: string;
  subject: "social-sciences";
  description?: string;
  topics: Record<string, SocialSciencesTopic>;
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface SocialSciencesAtomicSkill {
  id: string;
  bank_skill_id: string;
  title: string;
  description: string;
  caps_term?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: Array<{ type: string; description: string; example: string }>;
  recovery_strategy: string;
  sensitive?: boolean;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface SocialSciencesTier {
  id: string;
  title: string;
  atomic_skills: SocialSciencesAtomicSkill[];
}

export interface SocialSciencesLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: SocialSciencesTier[];
}

export interface SocialSciencesSkillTree {
  version: string;
  subject: "social-sciences";
  description?: string;
  levels: SocialSciencesLevel[];
}

// ─── Session / API ────────────────────────────────────────────────────────────

export interface SocialSciencesGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: SocialSciencesInputType;
  question: string;
  ruby_prompt: string;
  context?: string;
  options?: string[];
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
}

export interface SocialSciencesGenerateQuestionResponse {
  question: SocialSciencesGeneratedQuestion | null;
}

export interface SocialSciencesSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: SocialSciencesInputType;
  question: string;
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
  language?: string;
}

export type SocialSciencesMasteryStatus = "available" | "in_progress" | "mastered";

export interface SocialSciencesSubmitAnswerResponse {
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: SocialSciencesMasteryStatus | "locked" | "needs_review";
    correct_count: number;
    attempt_count: number;
  };
  next_action: "continue_skill" | "advance_skill" | "advance_tier" | "advance_level";
  next_skill_id?: string;
}
