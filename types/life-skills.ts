// ─── Life Skills — content, skill tree, student model, session ───────────────
// Foundation Phase (Grades 1–3) launch scope. Grade 4 (Intermediate Phase)
// blocked on source doc. Bank shape and validator live at
// scripts/validate-life-skills-bank.mjs; this file is the TypeScript mirror.

// ─── Bank content ─────────────────────────────────────────────────────────────

export type LifeSkillsInputType =
  | "choice"
  | "image-match"
  | "audio-tap"
  | "sequence"
  | "text"
  | "true-false"
  | "numeric";

/** Canonical error-signal codes. Authors may add topic-specific codes
 *  prefixed `ERR_LS_…`, so stored values are plain `string[]` in items. */
export type LifeSkillsCanonicalErrorSignal =
  | "ERR_LS_FACT"
  | "ERR_LS_CLASS"
  | "ERR_LS_SEQ"
  | "ERR_LS_SAFETY"
  | "ERR_LS_EMPATHY"
  | "ERR_LS_CONTEXT"
  | "ERR_LS_VOCAB"
  | "correct";

export interface LifeSkillsBankQuestion {
  ref: string;                  // unique within topic, "T01.01"
  question: string;             // what the learner sees / hears
  ruby_prompt: string;          // Ruby's warmer framing for the question
  context?: string;             // image description / scenario setup
  input_type: LifeSkillsInputType;
  options?: string[];           // required for choice / image-match / sequence
  /** Image keys parallel to `options` (image-match). Files live at
   *  public/life-skills/<key>.<ext>; the session falls back to the option text
   *  when a file is absent. Optional — items without it render as text. */
  image_refs?: string[];
  expected: string | number;    // correct answer (or comma-separated order for sequence)
  memo: string;                 // why the answer is correct + wrong-answer hint
  error_signals: string[];      // 1–3 ERR_LS_* codes
  difficulty?: number;          // 1–5
}

export type LifeSkillsGate = "NONE";

export interface LifeSkillsTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;                              // "Beginning Knowledge & Health Education" etc.
  skill_ids: string[];                         // topics map 1:1 to a single skill today
  gate: LifeSkillsGate;
  pass_threshold: number;                      // 0–1 (default 0.6 — FET no-timer rule)
  questions_for_mastery: number;
  target_item_count: number;
  caps_term?: string;                          // "T1 W1–3"
  sensitive?: boolean;
  templates?: string[];
  recovery_strategy: string;                   // one-line remediation hint
  questions: LifeSkillsBankQuestion[];
}

export interface LifeSkillsBank {
  version: string;
  subject: "life-skills";
  description?: string;
  topics: Record<string, LifeSkillsTopic>;     // key = topic_id, e.g. "LS.L1.BKH.T01"
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface LifeSkillsErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface LifeSkillsAtomicSkill {
  id: string;                                  // "LS.L1.BKH.T01"
  bank_skill_id: string;                       // index into LifeSkillsBank.topics
  title: string;
  description: string;
  caps_term?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: LifeSkillsErrorSignature[];
  recovery_strategy: string;
  sensitive?: boolean;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface LifeSkillsTier {
  id: string;                                  // "LS.L1.BKH"
  title: string;
  atomic_skills: LifeSkillsAtomicSkill[];
}

export interface LifeSkillsLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: LifeSkillsTier[];
}

export interface LifeSkillsSkillTree {
  version: string;
  subject: "life-skills";
  description?: string;
  levels: LifeSkillsLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type LifeSkillsMasteryStatus =
  | "locked"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface LifeSkillsAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeSkillsInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  scaffolded: boolean;
  timestamp: string;
}

export interface LifeSkillsSessionRecord {
  sessionId: string;
  timestamp: number;
  accuracy: number;
  passed: boolean;
}

export interface LifeSkillsSkillMastery {
  skill_id: string;
  status: LifeSkillsMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: LifeSkillsInputType[];
  scaffolded_attempts: number;
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
  attempts: LifeSkillsAttempt[];
  session_history?: LifeSkillsSessionRecord[];
  /** BKT: continuous probability the student has learned this skill (0–1) */
  p_learned?: number;
}

export interface LifeSkillsStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_skill_id: string;
  skill_mastery: Record<string, LifeSkillsSkillMastery>;
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
  /** Per-skill list of question refs already served — prevents repeats */
  used_questions: Record<string, string[]>;
}

// ─── Session / API ────────────────────────────────────────────────────────────

export interface LifeSkillsGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeSkillsInputType;
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

export interface LifeSkillsGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
}

export interface LifeSkillsGenerateQuestionResponse {
  question: LifeSkillsGeneratedQuestion | null;
}

export interface LifeSkillsSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeSkillsInputType;
  question: string;
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
  language?: string;
}

export interface LifeSkillsSubmitAnswerResponse {
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: LifeSkillsMasteryStatus;
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
