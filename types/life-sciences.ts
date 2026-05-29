// ─── Life Sciences (FET Grades 10–12) — content, skill tree, student model,
//     session ───────────────────────────────────────────────────────────────
//
// Life Sciences is a FET content subject (Grades 10–12 only). The shape blends:
//
//   • Skill-model pieces (tree / level / mastery / profile) are modelled on
//     types/reading.ts via types/afrikaans.ts — real prerequisite chains.
//   • Bank / question pieces follow types/life-skills.ts — bank is keyed by
//     `topics` (NOT `skills`), each topic holds a fixed 20-item pool.
//
// Two things this subject introduces that no prior subject has:
//   • `data-interpret` items carry a `data` block (table / calculation /
//     description / chart_type) that the session renders inline.
//   • `short-response` items carry a `rubric.must_mention[]` checklist that
//     the AI judge (reading-llm-judge in must_mention mode) grades against.
//
// FET rule: no timer, 60% pass mark per pool, 20-item target.
// Validator: scripts/validate-life-sciences-bank.mjs.

// ─── Bank content ─────────────────────────────────────────────────────────────

export type LifeSciencesInputType =
  | "choice"
  | "true-false"
  | "cloze"
  | "match"
  | "sequence"
  | "scenario"
  | "diagram-label"
  | "data-interpret"
  | "short-response";

/** `data` block on data-interpret items. All fields optional; renderer falls
 *  through in this order: image_ref → table → calculation → description →
 *  chart_type label. */
export interface LifeSciencesDataBlock {
  /** 2-D array. First row is treated as the header. */
  table?: Array<Array<string | number>>;
  /** Raw calculation expression to render in a preformatted block, e.g.
   *  "50 mm ÷ 0.05 mm". */
  calculation?: string;
  /** Italic description paragraph (graph in words, etc.). */
  description?: string;
  /** When a chart image isn't available, this label is shown as a fallback
   *  ("Chart: <chart_type>"). */
  chart_type?: string;
  /** Optional image key — when present and the file exists at
   *  public/life-sciences/<key>.png|svg, render it. */
  image_ref?: string;
}

/** Rubric on short-response items. The AI judge checks the learner's free-text
 *  answer against every entry in `must_mention[]`. All entries must be covered
 *  for the answer to count as correct. */
export interface LifeSciencesRubric {
  must_mention: string[];
  max_marks: number;
}

export interface LifeSciencesBankQuestion {
  ref: string;                  // unique within the topic, e.g. "G10.CHEM.A1.01"
  question: string;             // shown on screen
  input_type: LifeSciencesInputType;
  /** Required for choice / true-false / cloze / match / sequence / scenario /
   *  diagram-label / data-interpret. Optional for short-response. */
  options?: string[];
  expected: string | number;
  memo: string;                 // explanation shown after answering
  error_signals: string[];      // ERR_LSC_* codes
  difficulty?: number;          // 1–3
  /** Diagram keys, in the same order as `options` where relevant. Render
   *  resolves files at public/life-sciences/<key>.png|svg; text fallback when
   *  missing. */
  image_refs?: string[];
  /** Inline data block (data-interpret items only). */
  data?: LifeSciencesDataBlock;
  /** Grading rubric (short-response items only). */
  rubric?: LifeSciencesRubric;
  context?: string;
}

export type LifeSciencesGate = "NONE";

/** One bank entry. Keyed in the bank by the atomic skill id
 *  (e.g. "LSC.G10.S1.CHEM.A1"). */
export interface LifeSciencesTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;                              // "S1 — Life at Molecular..."
  skill_ids: string[];                         // 1:1 with the atomic skill
  gate: LifeSciencesGate;
  pass_threshold: number;                      // 0–1 (FET = 0.6)
  questions_for_mastery: number;
  target_item_count: number;                   // 20 for FET pools
  caps_term?: string;
  caps_topic?: string;
  templates?: string[];
  recovery_strategy: string;
  questions: LifeSciencesBankQuestion[];
}

export interface LifeSciencesBank {
  version: string;
  subject: "life-sciences";
  description?: string;
  /** key = atomic skill id (e.g. "LSC.G10.S1.CHEM.A1"). */
  topics: Record<string, LifeSciencesTopic>;
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface LifeSciencesErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface LifeSciencesAtomicSkill {
  id: string;                                  // "LSC.G10.S1.CHEM.A1"
  bank_skill_id?: string;                      // index into topics
  title: string;
  description: string;
  caps_term?: string;
  caps_topic?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: LifeSciencesErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface LifeSciencesTier {
  id: string;                                  // "L10.S1"
  title: string;                               // "S1 — Life at..."
  description?: string;
  atomic_skills: LifeSciencesAtomicSkill[];
}

export interface LifeSciencesLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: LifeSciencesTier[];
}

export interface LifeSciencesSkillTree {
  version: string;
  subject: "life-sciences";
  description?: string;
  grades_covered?: number[];
  levels: LifeSciencesLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type LifeSciencesMasteryStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface LifeSciencesSkillAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeSciencesInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  timestamp: string;
}

export interface LifeSciencesSkillMastery {
  skill_id: string;
  status: LifeSciencesMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: LifeSciencesInputType[];
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
}

export interface LifeSciencesStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_skill_id: string;
  skill_mastery: Record<string, LifeSciencesSkillMastery>;
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
  /** Per-skill list of question refs already served. */
  used_questions: Record<string, string[]>;
}

// ─── Session / API ────────────────────────────────────────────────────────────

export interface LifeSciencesGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeSciencesInputType;
  question: string;
  options?: string[];
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
  context?: string;
  image_refs?: string[];
  data?: LifeSciencesDataBlock;
  rubric?: LifeSciencesRubric;
}

export interface LifeSciencesGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
  attempt_number?: number;
}

export interface LifeSciencesGenerateQuestionResponse {
  question: LifeSciencesGeneratedQuestion | null;
}

export interface LifeSciencesSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeSciencesInputType;
  question: string;
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
  /** Forwarded so the route can grade short-response without re-loading the
   *  bank. Omitted for non-short-response items. */
  rubric?: LifeSciencesRubric;
}

export interface LifeSciencesSubmitAnswerResponse {
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: LifeSciencesMasteryStatus;
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
