// ─── Natural Sciences — Senior Phase (Grades 7–9) — content, skill tree,
//     student model, session ───────────────────────────────────────────────────
//
// Natural Sciences SP is the Senior-Phase science subject (Grades 7–9). In the
// Senior Phase the IP subject "Natural Sciences & Life Orientation" (Grades 4–6)
// splits — Life Orientation becomes its own subject and this is the Sciences half.
// CAPS organises every grade around four knowledge strands, one per term:
//   • Term 1 — Life & Living
//   • Term 2 — Matter & Materials
//   • Term 3 — Energy & Change
//   • Term 4 — Planet Earth & Beyond
//
// This is a content subject and a direct mirror of types/geography.ts:
//   • Skill-model pieces (tree / level / mastery / profile) follow the same
//     shape — prerequisite chains are supported but every skill ships ungated
//     (gate "NONE", prerequisites []), so all skills are open once a grade is
//     selected.
//   • Bank is keyed by `topics` (NOT `skills`), each topic holds a fixed pool.
//     The topic id IS the atomic skill id (e.g. "LO.G7.LL.A1").
//
// Content-subject rule: no timer, mastery is 75% accuracy over an 80%-of-pool
// (capped 20) coverage — see lib/content-mastery.ts. Per-pool pass mark is 0.6.

// ─── Bank content ─────────────────────────────────────────────────────────────

export type LifeOrientationSpInputType =
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

export type LifeOrientationSpSourceType = "text" | "image" | "map" | "cartoon";

export interface LifeOrientationSpProvenance {
  author?: string;
  date?: string;
  origin?: string;
  type?: "primary" | "secondary";
}

export interface LifeOrientationSpSource {
  type: LifeOrientationSpSourceType;
  /** For type "text": the passage. For image/map/cartoon: the image_ref key. */
  content: string;
  provenance?: LifeOrientationSpProvenance;
  caption?: string;
}

// ─── Per-mechanic schema fragments (carried on the bank question) ─────────────

export interface LifeOrientationSpBucket {
  id: string;
  label: string;
}
/** Used by both sort-buckets (with correct_bucket) and sequence (without). */
export interface LifeOrientationSpItem {
  id: string;
  text: string;
  correct_bucket?: string;
}

export interface LifeOrientationSpHighlightTarget {
  phrase: string;
  reason: string;
}

/** Inline data block for data-interpret items. `table` is an array of rows;
 *  the first row is the header. */
export interface LifeOrientationSpDataBlock {
  table?: Array<Array<string | number>>;
  image_ref?: string;
  chart_type?: string;
  calculation?: string;
  description?: string;
}

// ─── Bank question ────────────────────────────────────────────────────────────

export interface LifeOrientationSpBankQuestion {
  ref: string;                     // unique within the topic
  question: string;                // shown on screen above the mechanic
  input_type: LifeOrientationSpInputType;
  /** Required for choice / true-false / cloze / scenario / match / diagram-label
   *  / data-interpret. */
  options?: string[];
  /** Plain answer for option-driven mechanics. Absent for sequence (uses
   *  expected_order) and a descriptive string for sort-buckets. */
  expected?: string | number;
  memo: string;
  error_signals?: string[];
  difficulty?: number;             // 1–5

  /** Image keys for diagram-label / illustrated items. Files served from
   *  public/life-orientation-sp/<key>.{png|svg|jpg|webp} with a text fallback. */
  image_refs?: string[];

  // Optional `source` field — renders above the mechanic.
  source?: LifeOrientationSpSource;

  // Per-mechanic payloads. Exactly one set is populated per question.
  data?: LifeOrientationSpDataBlock;       // data-interpret

  buckets?: LifeOrientationSpBucket[];     // sort-buckets
  items?: LifeOrientationSpItem[];         // sort-buckets + sequence
  pass_threshold?: number;         // sort-buckets

  expected_order?: string[];       // sequence

  source_text?: string;            // highlight-source
  task?: string;                   // highlight-source
  targets?: LifeOrientationSpHighlightTarget[];
  min_correct?: number;            // highlight-source
  max_wrong?: number;              // highlight-source

  context?: string;                // inline note above mechanic
}

export type LifeOrientationSpGate = "NONE";

/** One bank entry. Keyed in the bank by the atomic skill id
 *  (e.g. "LO.G7.LL.A1"). */
export interface LifeOrientationSpTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;
  skill_ids: string[];
  gate: LifeOrientationSpGate;
  pass_threshold: number;          // 0–1 (content subject = 0.6)
  questions_for_mastery: number;
  target_item_count: number;       // 20 for content pools
  caps_term?: string;
  caps_topic?: string;
  templates?: string[];
  recovery_strategy: string;
  questions: LifeOrientationSpBankQuestion[];
}

export interface LifeOrientationSpBank {
  version: string;
  subject: "life-orientation-sp";
  description?: string;
  /** key = atomic skill id (e.g. "LO.G7.LL.A1"). */
  topics: Record<string, LifeOrientationSpTopic>;
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface LifeOrientationSpErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface LifeOrientationSpAtomicSkill {
  id: string;
  bank_skill_id?: string;
  title: string;
  description: string;
  caps_term?: string;
  caps_topic?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: LifeOrientationSpErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface LifeOrientationSpTier {
  id: string;                      // "L7.LL"
  title: string;                   // "Term 1 — Life & Living"
  description?: string;
  atomic_skills: LifeOrientationSpAtomicSkill[];
}

export interface LifeOrientationSpLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: LifeOrientationSpTier[];
}

export interface LifeOrientationSpSkillTree {
  version: string;
  subject: "life-orientation-sp";
  description?: string;
  grades_covered?: number[];
  levels: LifeOrientationSpLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type LifeOrientationSpMasteryStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface LifeOrientationSpSkillAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeOrientationSpInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  timestamp: string;
}

export interface LifeOrientationSpSkillMastery {
  skill_id: string;
  status: LifeOrientationSpMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: LifeOrientationSpInputType[];
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
}

export interface LifeOrientationSpStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_skill_id: string;
  skill_mastery: Record<string, LifeOrientationSpSkillMastery>;
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
export interface LifeOrientationSpGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeOrientationSpInputType;
  question: string;
  options?: string[];
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
  context?: string;
  image_refs?: string[];
  source?: LifeOrientationSpSource;

  // Per-mechanic payloads forwarded verbatim from the bank.
  data?: LifeOrientationSpDataBlock;
  buckets?: LifeOrientationSpBucket[];
  items?: LifeOrientationSpItem[];
  pass_threshold?: number;
  expected_order?: string[];
  source_text?: string;
  task?: string;
  targets?: LifeOrientationSpHighlightTarget[];
  min_correct?: number;
  max_wrong?: number;
}

export interface LifeOrientationSpGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
  attempt_number?: number;
}

export interface LifeOrientationSpGenerateQuestionResponse {
  question: LifeOrientationSpGeneratedQuestion | null;
}

export interface LifeOrientationSpSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: LifeOrientationSpInputType;
  question: string;
  /** Plain string for option-driven mechanics. JSON-stringified payload for
   *  sort-buckets / sequence / highlight-source. */
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
}

export interface LifeOrientationSpSubmitAnswerResponse {
  is_correct: boolean;
  /** 0–1 fractional score (some mechanics are scored by ratio not all-or-none). */
  score: number;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: LifeOrientationSpMasteryStatus;
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
