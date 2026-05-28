// ─── Natural Sciences & Technology — content, skill tree, student model ──────
// Covers IP Grades 4–6 across four CAPS strands:
//   T1 Life and Living, T2 Matter and Materials,
//   T3 Energy and Change, T4 Planet Earth and Beyond.
// Technology (Structures / Processing / Systems & Control) is woven into each
// strand rather than treated as a fifth tier — same as CAPS.
//
// Bank shape and validator live at scripts/validate-nst-bank.mjs; this file is
// the TypeScript mirror. Shape mirrors types/life-skills.ts.

// ─── Bank content ─────────────────────────────────────────────────────────────

export type NstInputType =
  | "choice"
  | "image-match"
  | "audio-tap"
  | "sequence"
  | "text"
  | "true-false"
  | "numeric";

/** Canonical error-signal codes. Authors may add topic-specific codes
 *  prefixed `ERR_NST_…`, so stored values are plain `string[]` in items. */
export type NstCanonicalErrorSignal =
  | "ERR_NST_FACT"
  | "ERR_NST_CLASS"
  | "ERR_NST_SEQ"
  | "ERR_NST_PROCESS"
  | "ERR_NST_DESIGN"
  | "ERR_NST_VOCAB"
  | "ERR_NST_SAFETY"
  | "correct";

export interface NstBankQuestion {
  ref: string;                  // unique within topic, "T01.01"
  question: string;             // what the learner sees / hears
  ruby_prompt: string;          // Ruby's warmer framing for the question
  context?: string;             // image description / scenario setup
  input_type: NstInputType;
  options?: string[];           // required for choice / image-match / sequence
  /** Image keys parallel to `options` (image-match). Files live at
   *  public/nst/<key>.<ext>; the session falls back to the option text
   *  when a file is absent. Optional — items without it render as text. */
  image_refs?: string[];
  expected: string | number;    // correct answer (or comma-separated order for sequence)
  memo: string;                 // why the answer is correct + wrong-answer hint
  error_signals: string[];      // 1–3 ERR_NST_* codes
  difficulty?: number;          // 1–5
}

export type NstGate = "NONE";

export interface NstTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;                              // "Life and Living" etc.
  skill_ids: string[];                         // topics map 1:1 to a single skill today
  gate: NstGate;
  pass_threshold: number;                      // 0–1 (default 0.6 — FET no-timer rule)
  questions_for_mastery: number;
  target_item_count: number;
  caps_term?: string;                          // "T1"
  sensitive?: boolean;
  templates?: string[];
  recovery_strategy: string;                   // one-line remediation hint
  questions: NstBankQuestion[];
}

export interface NstBank {
  version: string;
  subject: "natural-sciences-tech";
  description?: string;
  topics: Record<string, NstTopic>;            // key = topic_id, e.g. "NST.L4.LL.T01"
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface NstErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface NstAtomicSkill {
  id: string;                                  // "NST.L4.LL.T01"
  bank_skill_id: string;                       // index into NstBank.topics
  title: string;
  description: string;
  caps_term?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: NstErrorSignature[];
  recovery_strategy: string;
  sensitive?: boolean;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface NstTier {
  id: string;                                  // "NST.L4.LL"
  title: string;
  atomic_skills: NstAtomicSkill[];
}

export interface NstLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: NstTier[];
}

export interface NstSkillTree {
  version: string;
  subject: "natural-sciences-tech";
  description?: string;
  levels: NstLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type NstMasteryStatus =
  | "locked"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface NstAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: NstInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  scaffolded: boolean;
  timestamp: string;
}

export interface NstSessionRecord {
  sessionId: string;
  timestamp: number;
  accuracy: number;
  passed: boolean;
}

export interface NstSkillMastery {
  skill_id: string;
  status: NstMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: NstInputType[];
  scaffolded_attempts: number;
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
  attempts: NstAttempt[];
  session_history?: NstSessionRecord[];
  /** BKT: continuous probability the student has learned this skill (0–1) */
  p_learned?: number;
}

export interface NstStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_skill_id: string;
  skill_mastery: Record<string, NstSkillMastery>;
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
  /** Per-skill list of question refs already served — prevents repeats */
  used_questions: Record<string, string[]>;
}

// ─── Session / API ────────────────────────────────────────────────────────────

export interface NstGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: NstInputType;
  question: string;
  ruby_prompt: string;
  context?: string;
  options?: string[];
  /** Image keys parallel to `options` (image-match), or undefined for text. */
  image_refs?: string[];
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
}

export interface NstGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
}

export interface NstGenerateQuestionResponse {
  question: NstGeneratedQuestion | null;
}

export interface NstSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: NstInputType;
  question: string;
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
  language?: string;
}

export interface NstSubmitAnswerResponse {
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: NstMasteryStatus;
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
