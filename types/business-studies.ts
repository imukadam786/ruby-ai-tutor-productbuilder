// ─── BusinessStudies (FET Grades 10–12) — content, skill tree, student model,
//     session ───────────────────────────────────────────────────────────────
//
// BusinessStudies is a FET content subject (Grades 10–12 only). Mirrors the Life
// Sciences shape (types/life-sciences.ts):
//   • Skill-model pieces (tree / level / mastery / profile) follow
//     types/life-sciences.ts via types/afrikaans.ts — real prerequisite chains.
//   • Bank is keyed by `topics` (NOT `skills`), each topic holds a fixed
//     20-item pool.
//
// What BusinessStudies introduces that Life Sciences doesn't:
//   • No free-text. Zero short-response items. Every mechanic is tap/choice.
//   • 5 new tap-based mechanics: sort-buckets, highlight-source,
//     argument-builder, paragraph-template, source-comparison.
//   • Optional `source` block (text/image/map/cartoon + provenance) renders
//     above any mechanic. `source` is a FIELD on a question, not an input type.
//   • Structured answers (sets of ids, per-row maps, sequenced slot picks)
//     cross the API as JSON-stringified payloads inside the existing
//     `student_answer: string` field. The expected counterpart is built
//     server-side from the bank item and stringified the same way.
//
// FET rule: no timer, 60% pass mark per pool, 20-item target.
// Validator: scripts/validate-business-studies-bank.mjs (owned by content chat).

// ─── Bank content ─────────────────────────────────────────────────────────────

export type BusinessStudiesInputType =
  // Reused from Life Sciences:
  | "choice"
  | "true-false"
  | "cloze"
  | "sequence"
  | "diagram-label"
  // image-match: aliased to diagram-label rendering + exact-equality scoring
  // (per Q1=(a) — content chat may emit either spelling; both route the same).
  | "image-match"
  // New BusinessStudies mechanics:
  | "sort-buckets"
  | "highlight-source"
  | "argument-builder"
  | "paragraph-template"
  | "source-comparison";

// ─── Optional source block on any question ────────────────────────────────────

export type BusinessStudiesSourceType = "text" | "image" | "map" | "cartoon";

export interface BusinessStudiesProvenance {
  author?: string;
  date?: string;
  origin?: string;
  type?: "primary" | "secondary";
}

export interface BusinessStudiesSource {
  type: BusinessStudiesSourceType;
  /** For type "text": the passage. For image/map/cartoon: the image_ref key. */
  content: string;
  provenance?: BusinessStudiesProvenance;
  caption?: string;
}

// ─── Per-mechanic schema fragments (carried on the bank question) ─────────────

export interface BusinessStudiesBucket {
  id: string;
  label: string;
}
export interface BusinessStudiesSortBucketItem {
  id: string;
  text: string;
  correct_bucket: string;
}

export interface BusinessStudiesHighlightTarget {
  phrase: string;
  reason: string;
}

export interface BusinessStudiesEvidence {
  id: string;
  text: string;
  strength: "strong" | "weak" | "red_herring" | "counter";
}

export interface BusinessStudiesParagraphSlotOption {
  id: string;
  text: string;
  correct: boolean;
}
export interface BusinessStudiesParagraphSlot {
  slot: "point" | "evidence" | "explanation";
  label: string;
  options: BusinessStudiesParagraphSlotOption[];
}

export interface BusinessStudiesComparisonSource {
  text: string;
  provenance?: BusinessStudiesProvenance;
}
export type BusinessStudiesComparisonAnswer = "a_only" | "b_only" | "both" | "neither";
export interface BusinessStudiesComparisonStatement {
  id: string;
  text: string;
  correct_answer: BusinessStudiesComparisonAnswer;
}

// ─── Bank question ────────────────────────────────────────────────────────────

export interface BusinessStudiesBankQuestion {
  ref: string;                     // unique within the topic
  question: string;                // shown on screen above the mechanic
  input_type: BusinessStudiesInputType;
  /** Required for choice / true-false / cloze / sequence / diagram-label. */
  options?: string[];
  /** Plain answer for the reused-from-LSC mechanics. For the 5 new
   *  mechanics it is a JSON-encoded payload (see lib/business-studies-scoring.ts). */
  expected: string | number;
  memo: string;
  error_signals: string[];
  difficulty?: number;             // 1–3
  /** Image keys, parallel to `options` for diagram-label. Files served from
   *  public/business-studies/<key>.{png|svg|jpg} with a text fallback. */
  image_refs?: string[];

  // Optional `source` field — renders above the mechanic.
  source?: BusinessStudiesSource;

  // Per-mechanic payloads. Exactly one of these is populated per question,
  // matching `input_type`. The router on the API side stringifies the
  // expected answer derived from the relevant payload (see scoring contract).
  buckets?: BusinessStudiesBucket[];
  items?: BusinessStudiesSortBucketItem[];
  pass_threshold?: number;         // sort-buckets, source-comparison

  source_text?: string;            // highlight-source
  task?: string;                   // highlight-source
  targets?: BusinessStudiesHighlightTarget[];
  min_correct?: number;            // highlight-source
  max_wrong?: number;              // highlight-source

  thesis?: string;                 // argument-builder
  pool?: BusinessStudiesEvidence[];        // argument-builder
  pick_n?: number;                 // argument-builder
  correct_selection?: string[];    // argument-builder

  prompt?: string;                 // paragraph-template
  template?: BusinessStudiesParagraphSlot[];

  source_a?: BusinessStudiesComparisonSource;       // source-comparison
  source_b?: BusinessStudiesComparisonSource;
  statements?: BusinessStudiesComparisonStatement[];

  context?: string;                // inline amber note above mechanic
}

export type BusinessStudiesGate = "NONE";

/** One bank entry. Keyed in the bank by the atomic skill id
 *  (e.g. "BUS.G10.T1.imperialism.A1"). */
export interface BusinessStudiesTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;
  skill_ids: string[];
  gate: BusinessStudiesGate;
  pass_threshold: number;          // 0–1 (FET = 0.6)
  questions_for_mastery: number;
  target_item_count: number;       // 20 for FET pools
  caps_term?: string;
  caps_topic?: string;
  templates?: string[];
  recovery_strategy: string;
  questions: BusinessStudiesBankQuestion[];
}

export interface BusinessStudiesBank {
  version: string;
  subject: "business-studies";
  description?: string;
  /** key = atomic skill id (e.g. "BUS.G10.T1.imperialism.A1"). */
  topics: Record<string, BusinessStudiesTopic>;
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface BusinessStudiesErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface BusinessStudiesAtomicSkill {
  id: string;
  bank_skill_id?: string;
  title: string;
  description: string;
  caps_term?: string;
  caps_topic?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: BusinessStudiesErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface BusinessStudiesTier {
  id: string;                      // "L10.T1"
  title: string;                   // "Term 1 — …"
  description?: string;
  atomic_skills: BusinessStudiesAtomicSkill[];
}

export interface BusinessStudiesLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: BusinessStudiesTier[];
}

export interface BusinessStudiesSkillTree {
  version: string;
  subject: "business-studies";
  description?: string;
  grades_covered?: number[];
  levels: BusinessStudiesLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type BusinessStudiesMasteryStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface BusinessStudiesSkillAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: BusinessStudiesInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  timestamp: string;
}

export interface BusinessStudiesSkillMastery {
  skill_id: string;
  status: BusinessStudiesMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: BusinessStudiesInputType[];
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
}

export interface BusinessStudiesStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_skill_id: string;
  skill_mastery: Record<string, BusinessStudiesSkillMastery>;
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
export interface BusinessStudiesGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: BusinessStudiesInputType;
  question: string;
  options?: string[];
  /** For structured mechanics this is the JSON-encoded expected payload. */
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
  context?: string;
  image_refs?: string[];
  source?: BusinessStudiesSource;

  // Per-mechanic payloads forwarded verbatim from the bank.
  buckets?: BusinessStudiesBucket[];
  items?: BusinessStudiesSortBucketItem[];
  pass_threshold?: number;
  source_text?: string;
  task?: string;
  targets?: BusinessStudiesHighlightTarget[];
  min_correct?: number;
  max_wrong?: number;
  thesis?: string;
  pool?: BusinessStudiesEvidence[];
  pick_n?: number;
  prompt?: string;
  template?: BusinessStudiesParagraphSlot[];
  source_a?: BusinessStudiesComparisonSource;
  source_b?: BusinessStudiesComparisonSource;
  statements?: BusinessStudiesComparisonStatement[];
  /** highlight-source selected ids — shipped so the client can score it. */
  correct_selection?: string[];
}

export interface BusinessStudiesGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
  attempt_number?: number;
}

export interface BusinessStudiesGenerateQuestionResponse {
  question: BusinessStudiesGeneratedQuestion | null;
}

export interface BusinessStudiesSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: BusinessStudiesInputType;
  question: string;
  /** Plain string for choice/true-false/cloze/sequence/diagram-label.
   *  JSON-stringified payload for the 5 structured mechanics. */
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
}

export interface BusinessStudiesSubmitAnswerResponse {
  is_correct: boolean;
  /** 0–1 fractional score (some mechanics are scored by ratio not all-or-none). */
  score: number;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: BusinessStudiesMasteryStatus;
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
