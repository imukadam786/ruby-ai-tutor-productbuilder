// ─── Geography (FET Grades 10–12) — content, skill tree, student model,
//     session ───────────────────────────────────────────────────────────────
//
// Geography is a FET content subject (Grades 10–12 only). Direct mirror of
// types/history.ts:
//   • Skill-model pieces (tree / level / mastery / profile) follow the History
//     shape — real prerequisite chains, though this subject ships every skill
//     ungated (gate "NONE", prerequisites []).
//   • Bank is keyed by `topics` (NOT `skills`), each topic holds a fixed
//     20-item pool. The topic id IS the atomic skill id (e.g. "GEO.G10.MAP.A1").
//
// What Geography uses on top of History's mechanics:
//   • `data-interpret` — carries a `data` block (table of rows) rendered above
//     the option grid. Scored by plain equality on the picked option.
//   • `scenario` / `match` — plain option grids (options + expected string).
//   • `sequence` — ordering mechanic: `items` ({id,text}) + `expected_order`
//     (array of item ids), NO options. The learner taps items into order; the
//     answer crosses the API as a JSON-stringified id array.
//
// FET rule: no timer, 60% pass mark per pool, 20-item target.

// ─── Bank content ─────────────────────────────────────────────────────────────

export type GeographyInputType =
  | "choice"
  | "true-false"
  | "cloze"
  | "scenario"
  | "match"
  | "sequence"
  | "diagram-label"
  | "data-interpret"
  | "sort-buckets"
  | "highlight-source";

// ─── Optional source block on any question ────────────────────────────────────

export type GeographySourceType = "text" | "image" | "map" | "cartoon";

export interface GeographyProvenance {
  author?: string;
  date?: string;
  origin?: string;
  type?: "primary" | "secondary";
}

export interface GeographySource {
  type: GeographySourceType;
  /** For type "text": the passage. For image/map/cartoon: the image_ref key. */
  content: string;
  provenance?: GeographyProvenance;
  caption?: string;
}

// ─── Per-mechanic schema fragments (carried on the bank question) ─────────────

export interface GeographyBucket {
  id: string;
  label: string;
}
/** Used by both sort-buckets (with correct_bucket) and sequence (without). */
export interface GeographyItem {
  id: string;
  text: string;
  correct_bucket?: string;
}

export interface GeographyHighlightTarget {
  phrase: string;
  reason: string;
}

/** Inline data block for data-interpret items. `table` is an array of rows;
 *  the first row is the header. Other variants kept for forward-compat with
 *  the Life Sciences shape. */
export interface GeographyDataBlock {
  table?: Array<Array<string | number>>;
  image_ref?: string;
  chart_type?: string;
  calculation?: string;
  description?: string;
}

// ─── Bank question ────────────────────────────────────────────────────────────

export interface GeographyBankQuestion {
  ref: string;                     // unique within the topic
  question: string;                // shown on screen above the mechanic
  input_type: GeographyInputType;
  /** Required for choice / true-false / cloze / scenario / match / diagram-label
   *  / data-interpret. */
  options?: string[];
  /** Plain answer for option-driven mechanics. Absent for sequence (uses
   *  expected_order) and a descriptive string for sort-buckets. */
  expected?: string | number;
  memo: string;
  error_signals?: string[];
  difficulty?: number;             // 1–3

  /** Image keys for diagram-label. Files served from
   *  public/geography/<key>.{png|svg|jpg} with a text fallback. */
  image_refs?: string[];

  // Optional `source` field — renders above the mechanic.
  source?: GeographySource;

  // Per-mechanic payloads. Exactly one set is populated per question.
  data?: GeographyDataBlock;       // data-interpret

  buckets?: GeographyBucket[];     // sort-buckets
  items?: GeographyItem[];         // sort-buckets + sequence
  pass_threshold?: number;         // sort-buckets

  expected_order?: string[];       // sequence

  source_text?: string;            // highlight-source
  task?: string;                   // highlight-source
  targets?: GeographyHighlightTarget[];
  min_correct?: number;            // highlight-source
  max_wrong?: number;              // highlight-source

  context?: string;                // inline note above mechanic
}

export type GeographyGate = "NONE";

/** One bank entry. Keyed in the bank by the atomic skill id
 *  (e.g. "GEO.G10.MAP.A1"). */
export interface GeographyTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;
  skill_ids: string[];
  gate: GeographyGate;
  pass_threshold: number;          // 0–1 (FET = 0.6)
  questions_for_mastery: number;
  target_item_count: number;       // 20 for FET pools
  caps_term?: string;
  caps_topic?: string;
  templates?: string[];
  recovery_strategy: string;
  questions: GeographyBankQuestion[];
}

export interface GeographyBank {
  version: string;
  subject: "geography";
  description?: string;
  /** key = atomic skill id (e.g. "GEO.G10.MAP.A1"). */
  topics: Record<string, GeographyTopic>;
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface GeographyErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface GeographyAtomicSkill {
  id: string;
  bank_skill_id?: string;
  title: string;
  description: string;
  caps_term?: string;
  caps_topic?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: GeographyErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface GeographyTier {
  id: string;                      // "L10.MAP"
  title: string;                   // "Mapwork & Techniques"
  description?: string;
  atomic_skills: GeographyAtomicSkill[];
}

export interface GeographyLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: GeographyTier[];
}

export interface GeographySkillTree {
  version: string;
  subject: "geography";
  description?: string;
  grades_covered?: number[];
  levels: GeographyLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type GeographyMasteryStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface GeographySkillAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: GeographyInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  timestamp: string;
}

export interface GeographySkillMastery {
  skill_id: string;
  status: GeographyMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: GeographyInputType[];
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
}

export interface GeographyStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_skill_id: string;
  skill_mastery: Record<string, GeographySkillMastery>;
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
  used_questions: Record<string, string[]>;
}

// ─── Session / API ────────────────────────────────────────────────────────────

/** What the API hands the client. The client renders the mechanic and
 *  serialises the learner's answer back to a string (JSON-stringified for the
 *  structured mechanics: sort-buckets, sequence, highlight-source). */
export interface GeographyGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: GeographyInputType;
  question: string;
  options?: string[];
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
  context?: string;
  image_refs?: string[];
  source?: GeographySource;

  // Per-mechanic payloads forwarded verbatim from the bank.
  data?: GeographyDataBlock;
  buckets?: GeographyBucket[];
  items?: GeographyItem[];
  pass_threshold?: number;
  expected_order?: string[];
  source_text?: string;
  task?: string;
  targets?: GeographyHighlightTarget[];
  min_correct?: number;
  max_wrong?: number;
}

export interface GeographyGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
  attempt_number?: number;
}

export interface GeographyGenerateQuestionResponse {
  question: GeographyGeneratedQuestion | null;
}

export interface GeographySubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: GeographyInputType;
  question: string;
  /** Plain string for option-driven mechanics. JSON-stringified payload for
   *  sort-buckets / sequence / highlight-source. */
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
}

export interface GeographySubmitAnswerResponse {
  is_correct: boolean;
  /** 0–1 fractional score (some mechanics are scored by ratio not all-or-none). */
  score: number;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: GeographyMasteryStatus;
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
