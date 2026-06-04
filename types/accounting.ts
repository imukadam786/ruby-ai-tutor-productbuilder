// ─── Accounting (FET Grades 10–12) — content, skill tree, student model,
//     session ───────────────────────────────────────────────────────────────
//
// Accounting is a FET content subject (Grades 10–12 only). Mirrors the Life
// Sciences shape (types/life-sciences.ts):
//   • Skill-model pieces (tree / level / mastery / profile) follow
//     types/life-sciences.ts via types/afrikaans.ts — real prerequisite chains.
//   • Bank is keyed by `topics` (NOT `skills`), each topic holds a fixed
//     20-item pool.
//
// What Accounting introduces that Life Sciences doesn't:
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
// Validator: scripts/validate-accounting-bank.mjs (owned by content chat).

// ─── Bank content ─────────────────────────────────────────────────────────────

export type AccountingInputType =
  // Reused from Life Sciences:
  | "choice"
  | "true-false"
  | "cloze"
  | "sequence"
  | "diagram-label"
  // image-match: aliased to diagram-label rendering + exact-equality scoring
  // (per Q1=(a) — content chat may emit either spelling; both route the same).
  | "image-match"
  // Tap mechanics shared with Business Studies:
  | "sort-buckets"
  | "highlight-source"
  | "argument-builder"
  | "paragraph-template"
  | "source-comparison"
  // Accounting-specific tap mechanics (no typed numbers / free-text):
  //   • equation-effect: tap the effect (+ / − / no effect) of a transaction on
  //     each element of the accounting equation (Assets / Owner's equity /
  //     Liabilities).
  //   • double-entry: tap which account is debited and which is credited for a
  //     transaction, from a shared pool of candidate accounts.
  | "equation-effect"
  | "double-entry";

// ─── Optional source block on any question ────────────────────────────────────

export type AccountingSourceType = "text" | "image" | "map" | "cartoon";

export interface AccountingProvenance {
  author?: string;
  date?: string;
  origin?: string;
  type?: "primary" | "secondary";
}

export interface AccountingSource {
  type: AccountingSourceType;
  /** For type "text": the passage. For image/map/cartoon: the image_ref key. */
  content: string;
  provenance?: AccountingProvenance;
  caption?: string;
}

// ─── Per-mechanic schema fragments (carried on the bank question) ─────────────

export interface AccountingBucket {
  id: string;
  label: string;
}
export interface AccountingSortBucketItem {
  id: string;
  text: string;
  correct_bucket: string;
}

export interface AccountingHighlightTarget {
  phrase: string;
  reason: string;
}

export interface AccountingEvidence {
  id: string;
  text: string;
  strength: "strong" | "weak" | "red_herring" | "counter";
}

export interface AccountingParagraphSlotOption {
  id: string;
  text: string;
  correct: boolean;
}
export interface AccountingParagraphSlot {
  slot: "point" | "evidence" | "explanation";
  label: string;
  options: AccountingParagraphSlotOption[];
}

export interface AccountingComparisonSource {
  text: string;
  provenance?: AccountingProvenance;
}
export type AccountingComparisonAnswer = "a_only" | "b_only" | "both" | "neither";
export interface AccountingComparisonStatement {
  id: string;
  text: string;
  correct_answer: AccountingComparisonAnswer;
}

// ── equation-effect ───────────────────────────────────────────────────────────
// The learner taps how a transaction affects each element of the accounting
// equation. Tap-only direction (no typed amounts): increase / decrease / none.
export type AccountingEffect = "increase" | "decrease" | "no_effect";
export interface AccountingEquationColumn {
  /** Stable id, e.g. "A" | "OE" | "L". */
  id: string;
  /** Display label, e.g. "Assets". */
  label: string;
}

// ── double-entry ──────────────────────────────────────────────────────────────
// The learner taps which account is debited and which is credited, choosing
// each from a shared pool of candidate accounts.
export interface AccountingLedgerAccount {
  id: string;
  label: string;
}

// ─── Bank question ────────────────────────────────────────────────────────────

export interface AccountingBankQuestion {
  ref: string;                     // unique within the topic
  question: string;                // shown on screen above the mechanic
  input_type: AccountingInputType;
  /** Required for choice / true-false / cloze / sequence / diagram-label. */
  options?: string[];
  /** Plain answer for the reused-from-LSC mechanics. For the 5 new
   *  mechanics it is a JSON-encoded payload (see lib/accounting-scoring.ts). */
  expected: string | number;
  memo: string;
  error_signals: string[];
  difficulty?: number;             // 1–3
  /** Image keys, parallel to `options` for diagram-label. Files served from
   *  public/accounting/<key>.{png|svg|jpg} with a text fallback. */
  image_refs?: string[];

  // Optional `source` field — renders above the mechanic.
  source?: AccountingSource;

  // Per-mechanic payloads. Exactly one of these is populated per question,
  // matching `input_type`. The router on the API side stringifies the
  // expected answer derived from the relevant payload (see scoring contract).
  buckets?: AccountingBucket[];
  items?: AccountingSortBucketItem[];
  pass_threshold?: number;         // sort-buckets, source-comparison

  source_text?: string;            // highlight-source
  task?: string;                   // highlight-source
  targets?: AccountingHighlightTarget[];
  min_correct?: number;            // highlight-source
  max_wrong?: number;              // highlight-source

  thesis?: string;                 // argument-builder
  pool?: AccountingEvidence[];        // argument-builder
  pick_n?: number;                 // argument-builder
  correct_selection?: string[];    // argument-builder

  prompt?: string;                 // paragraph-template
  template?: AccountingParagraphSlot[];

  source_a?: AccountingComparisonSource;       // source-comparison
  source_b?: AccountingComparisonSource;
  statements?: AccountingComparisonStatement[];

  // equation-effect. `columns` defaults to Assets / Owner's equity / Liabilities
  // when omitted. `effects` is the correct effect per column id.
  columns?: AccountingEquationColumn[];
  effects?: Record<string, AccountingEffect>;

  // double-entry. `accounts` is the shared candidate pool; `debit`/`credit`
  // are the correct account ids.
  accounts?: AccountingLedgerAccount[];
  debit?: string;
  credit?: string;

  context?: string;                // inline amber note above mechanic
}

export type AccountingGate = "NONE";

/** One bank entry. Keyed in the bank by the atomic skill id
 *  (e.g. "ACC.G10.T1.imperialism.A1"). */
export interface AccountingTopic {
  title: string;
  description?: string;
  grade: number;
  strand: string;
  skill_ids: string[];
  gate: AccountingGate;
  pass_threshold: number;          // 0–1 (FET = 0.6)
  questions_for_mastery: number;
  target_item_count: number;       // 20 for FET pools
  caps_term?: string;
  caps_topic?: string;
  templates?: string[];
  recovery_strategy: string;
  questions: AccountingBankQuestion[];
}

export interface AccountingBank {
  version: string;
  subject: "accounting";
  description?: string;
  /** key = atomic skill id (e.g. "ACC.G10.T1.imperialism.A1"). */
  topics: Record<string, AccountingTopic>;
}

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export interface AccountingErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface AccountingAtomicSkill {
  id: string;
  bank_skill_id?: string;
  title: string;
  description: string;
  caps_term?: string;
  caps_topic?: string;
  prerequisites: string[];
  templates: string[];
  error_signatures: AccountingErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface AccountingTier {
  id: string;                      // "L10.T1"
  title: string;                   // "Term 1 — …"
  description?: string;
  atomic_skills: AccountingAtomicSkill[];
}

export interface AccountingLevel {
  id: number;
  grade: number;
  title: string;
  description: string;
  tiers: AccountingTier[];
}

export interface AccountingSkillTree {
  version: string;
  subject: "accounting";
  description?: string;
  grades_covered?: number[];
  levels: AccountingLevel[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type AccountingMasteryStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "mastered"
  | "needs_review"
  | "assumed";

export interface AccountingSkillAttempt {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: AccountingInputType;
  question: string;
  student_answer: string;
  expected_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  timestamp: string;
}

export interface AccountingSkillMastery {
  skill_id: string;
  status: AccountingMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: AccountingInputType[];
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
}

export interface AccountingStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_skill_id: string;
  skill_mastery: Record<string, AccountingSkillMastery>;
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
export interface AccountingGeneratedQuestion {
  id: string;
  skill_id: string;
  question_ref: string;
  input_type: AccountingInputType;
  question: string;
  options?: string[];
  /** For structured mechanics this is the JSON-encoded expected payload. */
  expected_answer: string | number;
  memo: string;
  difficulty?: number;
  context?: string;
  image_refs?: string[];
  source?: AccountingSource;

  // Per-mechanic payloads forwarded verbatim from the bank.
  buckets?: AccountingBucket[];
  items?: AccountingSortBucketItem[];
  pass_threshold?: number;
  source_text?: string;
  task?: string;
  targets?: AccountingHighlightTarget[];
  min_correct?: number;
  max_wrong?: number;
  thesis?: string;
  pool?: AccountingEvidence[];
  pick_n?: number;
  prompt?: string;
  template?: AccountingParagraphSlot[];
  source_a?: AccountingComparisonSource;
  source_b?: AccountingComparisonSource;
  statements?: AccountingComparisonStatement[];
  columns?: AccountingEquationColumn[];
  effects?: Record<string, AccountingEffect>;
  accounts?: AccountingLedgerAccount[];
  debit?: string;
  credit?: string;
}

export interface AccountingGenerateQuestionRequest {
  skill_id: string;
  used_refs: string[];
  attempt_number?: number;
}

export interface AccountingGenerateQuestionResponse {
  question: AccountingGeneratedQuestion | null;
}

export interface AccountingSubmitAnswerRequest {
  student_id: string;
  question_id: string;
  skill_id: string;
  question_ref: string;
  input_type: AccountingInputType;
  question: string;
  /** Plain string for choice/true-false/cloze/sequence/diagram-label.
   *  JSON-stringified payload for the 5 structured mechanics. */
  student_answer: string;
  expected_answer: string | number;
  attempt_number: number;
  used_hint: boolean;
}

export interface AccountingSubmitAnswerResponse {
  is_correct: boolean;
  /** 0–1 fractional score (some mechanics are scored by ratio not all-or-none). */
  score: number;
  error_signals: string[];
  feedback: string;
  memo: string;
  mastery_update: {
    skill_id: string;
    new_status: AccountingMasteryStatus;
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
