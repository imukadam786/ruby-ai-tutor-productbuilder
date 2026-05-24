// ─── Afrikaans First Additional Language (FAL) — content, skill tree, student
//     model, session ─────────────────────────────────────────────────────────
//
// Afrikaans FAL is a LANGUAGE taught to young children (Grades 1–3, ages 6–9),
// so this file deliberately blends two existing subject shapes:
//
//   • Skill-model pieces (tree / level / mastery / profile) are modelled on
//     types/reading.ts, because the tree has real prerequisite chains.
//   • Bank / question pieces are modelled on types/life-skills.ts, because the
//     learner taps / chooses / listens (no free-text typing, no LLM judge) —
//     BUT the bank's top-level key is `skills` (not `topics`), and each question
//     additionally carries `audio` (Afrikaans to speak aloud) and `image_refs`
//     (image-match keys, parallel to `options`).
//
// Pedagogy: instructions / hints are English (home language); the target content
// is Afrikaans. The bank validator is scripts/validate-afrikaans-bank.mjs.

// ─── Bank content ─────────────────────────────────────────────────────────────

export type AfrikaansInputType =
  | "choice"
  | "true-false"
  | "image-match"
  | "sequence"
  | "text"
  | "cloze";

export interface AfrikaansBankQuestion {
  ref: string;                  // unique within the skill, e.g. "KLK01.01"
  question: string;             // English instruction shown on screen
  ruby_prompt: string;          // friendly English voiceover
  /** Afrikaans text the engine speaks aloud — present on listening/phonics items. */
  audio?: string;
  context?: string;             // optional note / scenario / English-meaning hint
  /** Image keys (afrikaans-image-manifest.md), in the SAME order as `options`. */
  image_refs?: string[];
  input_type: AfrikaansInputType;
  options?: string[];           // required for choice / true-false / image-match / cloze
  expected: string | number;    // correct answer (must equal one of `options` for option types)
  memo: string;                 // English explanation shown after answering
  error_signals: string[];      // ERR_AF_* codes
  difficulty?: number;          // 1–3
}

export type AfrikaansGate = "NONE";

/** One bank entry. Keyed in the bank by the atomic skill id (e.g. "AF.G1.KLK.01") —
 *  the skill id IS the selection key (unlike Life Skills' separate topic ids). */
export interface AfrikaansSkillBankEntry {
  title: string;
  description?: string;
  grade: number;
  strand: string;                              // "Klanke", "Luister", …
  skill_ids: string[];                         // 1:1 with the atomic skill today
  gate: AfrikaansGate;
  pass_threshold: number;                      // 0–1 (default 0.6 — FET no-timer rule)
  questions_for_mastery: number;
  target_item_count: number;
  caps_term?: string;
  sensitive?: boolean;
  templates?: string[];
  recovery_strategy: string;                   // one-line remediation hint
  questions: AfrikaansBankQuestion[];
}

export interface AfrikaansBank {
  version: string;
  subject: "afrikaans-fal";
  description?: string;
  /** key = atomic skill id, e.g. "AF.G1.KLK.01" (NOT `topics`). */
  skills: Record<string, AfrikaansSkillBankEntry>;
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface AfrikaansErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface AfrikaansAtomicSkill {
  id: string;                                  // "AF.G1.KLK.01"
  bank_skill_id?: string;                      // index into AfrikaansBank.skills
  title: string;
  description: string;
  caps_term?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: AfrikaansErrorSignature[];
  recovery_strategy: string;
  sensitive?: boolean;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface AfrikaansTier {
  id: string;                                  // "AF.G1.KLK"
  title: string;                               // "Klanke (Phonics / sound awareness)"
  description?: string;
  atomic_skills: AfrikaansAtomicSkill[];
}

export interface AfrikaansLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: AfrikaansTier[];
}

export interface AfrikaansSkillTree {
  version: string;
  subject: "afrikaans-fal";
  description?: string;
  levels: AfrikaansLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type AfrikaansMasteryStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface AfrikaansSkillAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: AfrikaansInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  timestamp: string;
}

export interface AfrikaansSkillMastery {
  skill_id: string;
  status: AfrikaansMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: AfrikaansInputType[];
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
}

export interface AfrikaansStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_skill_id: string;
  skill_mastery: Record<string, AfrikaansSkillMastery>;
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
  /** Per-skill list of question refs already served — prevents repeats. */
  used_questions: Record<string, string[]>;
}

// ─── Session / API ────────────────────────────────────────────────────────────

export interface AfrikaansGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: AfrikaansInputType;
  question: string;
  ruby_prompt: string;
  /** Afrikaans to speak aloud (listening/phonics items). */
  audio?: string;
  context?: string;
  /** Image-match keys, parallel to `options`. */
  image_refs?: string[];
  options?: string[];
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
}

export interface AfrikaansGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
  attempt_number?: number;
}

export interface AfrikaansGenerateQuestionResponse {
  question: AfrikaansGeneratedQuestion | null;
}

export interface AfrikaansSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: AfrikaansInputType;
  question: string;
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
  language?: string;
}

export interface AfrikaansSubmitAnswerResponse {
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: AfrikaansMasteryStatus;
    correct_count: number;
    attempt_count: number;
  };
  next_action:
    | "continue_skill"
    | "advance_skill"
    | "advance_tier"
    | "advance_level"
    | "review_prerequisite";
  next_skill_id?: string;
}
