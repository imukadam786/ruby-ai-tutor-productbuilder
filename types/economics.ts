// ─── Economics (FET Grades 10–12) — content, skill tree, student model,
//     session ───────────────────────────────────────────────────────────────
//
// Economics is a FET content subject (Grades 10–12 only). Mirrors the
// Accounting shape (types/accounting.ts), which in turn mirrors Life Sciences:
//   • Skill-model pieces (tree / level / mastery / profile) follow the same
//     shape; Economics is all-unlocked within a grade (no prerequisite chains,
//     like History/Geography) — prerequisites arrays are empty.
//   • Bank is keyed by `topics` (NOT `skills`), each topic holds a fixed
//     20-item pool.
//
// Tap-only mechanics (no free-text, no typed numbers). Economics reuses the
// generic content-subject mechanics and adds NONE of its own:
//   choice, true-false, cloze, sequence, diagram-label / image-match (graph
//   reading), sort-buckets, highlight-source, argument-builder,
//   paragraph-template, source-comparison.
// An optional `source` block (text / image / graph / cartoon + provenance)
// renders above any mechanic. `source` is a FIELD on a question, not a type.
//
// FET rule: no timer, 60% pass mark per pool, 20-item target.

// ─── Bank content ─────────────────────────────────────────────────────────────

export type EconomicsInputType =
  | "choice"
  | "true-false"
  | "cloze"
  | "sequence"
  | "diagram-label"
  // image-match: aliased to diagram-label rendering + exact-equality scoring.
  | "image-match"
  | "sort-buckets"
  | "highlight-source"
  | "argument-builder"
  | "paragraph-template"
  | "source-comparison";

// ─── Optional source block on any question ────────────────────────────────────

export type EconomicsSourceType = "text" | "image" | "graph" | "cartoon";

export interface EconomicsProvenance {
  author?: string;
  date?: string;
  origin?: string;
  type?: "primary" | "secondary";
}

export interface EconomicsSource {
  type: EconomicsSourceType;
  /** For type "text": the passage. For image/graph/cartoon: the image_ref key. */
  content: string;
  provenance?: EconomicsProvenance;
  caption?: string;
}

// ─── Per-mechanic schema fragments (carried on the bank question) ─────────────

export interface EconomicsBucket {
  id: string;
  label: string;
}
export interface EconomicsSortBucketItem {
  id: string;
  text: string;
  correct_bucket: string;
}

export interface EconomicsHighlightTarget {
  phrase: string;
  reason: string;
}

export interface EconomicsEvidence {
  id: string;
  text: string;
  strength: "strong" | "weak" | "red_herring" | "counter";
}

export interface EconomicsParagraphSlotOption {
  id: string;
  text: string;
  correct: boolean;
}
export interface EconomicsParagraphSlot {
  slot: "point" | "evidence" | "explanation";
  label: string;
  options: EconomicsParagraphSlotOption[];
}

export interface EconomicsComparisonSource {
  text: string;
  provenance?: EconomicsProvenance;
}
export type EconomicsComparisonAnswer = "a_only" | "b_only" | "both" | "neither";
export interface EconomicsComparisonStatement {
  id: string;
  text: string;
  correct_answer: EconomicsComparisonAnswer;
}

// ─── Bank question ────────────────────────────────────────────────────────────

export interface EconomicsBankQuestion {
  ref: string;                     // unique within the topic
  question: string;                // shown on screen above the mechanic
  input_type: EconomicsInputType;
  /** Required for choice / true-false / cloze / sequence / diagram-label. */
  options?: string[];
  /** Plain answer for choice-family mechanics. For the structured mechanics it
   *  is a JSON-encoded payload (see lib/economics-scoring.ts). */
  expected: string | number;
  memo: string;
  error_signals: string[];
  difficulty?: number;             // 1–3
  /** Image keys, parallel to `options` for diagram-label. Files served from
   *  public/economics/<key>.{png|svg|webp} with a text fallback. */
  image_refs?: string[];

  // Optional `source` field — renders above the mechanic.
  source?: EconomicsSource;

  // Per-mechanic payloads. Exactly one group is populated per question,
  // matching `input_type`.
  buckets?: EconomicsBucket[];
  items?: EconomicsSortBucketItem[];
  pass_threshold?: number;         // sort-buckets, source-comparison

  source_text?: string;            // highlight-source
  task?: string;                   // highlight-source
  targets?: EconomicsHighlightTarget[];
  min_correct?: number;            // highlight-source
  max_wrong?: number;              // highlight-source

  thesis?: string;                 // argument-builder
  pool?: EconomicsEvidence[];      // argument-builder
  pick_n?: number;                 // argument-builder
  correct_selection?: string[];    // argument-builder

  prompt?: string;                 // paragraph-template
  template?: EconomicsParagraphSlot[];

  source_a?: EconomicsComparisonSource;       // source-comparison
  source_b?: EconomicsComparisonSource;
  statements?: EconomicsComparisonStatement[];

  context?: string;                // inline amber note above mechanic
}

export type EconomicsGate = "NONE";

/** One bank entry. Keyed in the bank by the atomic skill id
 *  (e.g. "ECON.G10.T1.CONCEPTS.A1"). */
export interface EconomicsTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;
  skill_ids: string[];
  gate: EconomicsGate;
  pass_threshold: number;          // 0–1 (FET = 0.6)
  questions_for_mastery: number;
  target_item_count: number;       // 20 for FET pools
  caps_term?: string;
  caps_topic?: string;
  templates?: string[];
  recovery_strategy: string;
  questions: EconomicsBankQuestion[];
}

export interface EconomicsBank {
  version: string;
  subject: "economics";
  description?: string;
  /** key = atomic skill id (e.g. "ECON.G10.T1.CONCEPTS.A1"). */
  topics: Record<string, EconomicsTopic>;
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface EconomicsErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface EconomicsAtomicSkill {
  id: string;
  bank_skill_id?: string;
  title: string;
  description: string;
  caps_term?: string;
  caps_topic?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: EconomicsErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface EconomicsTier {
  id: string;                      // "L10.T1"
  title: string;                   // "Term 1 — …"
  description?: string;
  atomic_skills: EconomicsAtomicSkill[];
}

export interface EconomicsLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: EconomicsTier[];
}

export interface EconomicsSkillTree {
  version: string;
  subject: "economics";
  description?: string;
  grades_covered?: number[];
  levels: EconomicsLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type EconomicsMasteryStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface EconomicsSkillAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: EconomicsInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  timestamp: string;
}

export interface EconomicsSkillMastery {
  skill_id: string;
  status: EconomicsMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: EconomicsInputType[];
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
}

export interface EconomicsStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_skill_id: string;
  skill_mastery: Record<string, EconomicsSkillMastery>;
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
  used_questions: Record<string, string[]>;
}

// ─── Session / API ────────────────────────────────────────────────────────────

/** What the API hands the client. The client renders the mechanic and the
 *  optional source block; serialises the learner's answer back to a string
 *  (JSON-stringified for structured mechanics). */
export interface EconomicsGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: EconomicsInputType;
  question: string;
  options?: string[];
  /** For structured mechanics this is the JSON-encoded expected payload. */
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
  context?: string;
  image_refs?: string[];
  source?: EconomicsSource;

  // Per-mechanic payloads forwarded verbatim from the bank.
  buckets?: EconomicsBucket[];
  items?: EconomicsSortBucketItem[];
  pass_threshold?: number;
  source_text?: string;
  task?: string;
  targets?: EconomicsHighlightTarget[];
  min_correct?: number;
  max_wrong?: number;
  thesis?: string;
  pool?: EconomicsEvidence[];
  pick_n?: number;
  prompt?: string;
  template?: EconomicsParagraphSlot[];
  source_a?: EconomicsComparisonSource;
  source_b?: EconomicsComparisonSource;
  statements?: EconomicsComparisonStatement[];
}

export interface EconomicsGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
  attempt_number?: number;
}

export interface EconomicsGenerateQuestionResponse {
  question: EconomicsGeneratedQuestion | null;
}

export interface EconomicsSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: EconomicsInputType;
  question: string;
  /** Plain string for choice/true-false/cloze/sequence/diagram-label.
   *  JSON-stringified payload for the structured mechanics. */
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
}

export interface EconomicsSubmitAnswerResponse {
  is_correct: boolean;
  /** 0–1 fractional score (some mechanics are scored by ratio not all-or-none). */
  score: number;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: EconomicsMasteryStatus;
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
