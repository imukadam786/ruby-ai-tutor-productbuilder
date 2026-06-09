// ─── Skill Tree ───────────────────────────────────────────────────────────────

export type QuestionTemplate = "concrete" | "story" | "symbolic";

export type ErrorType =
  | "conceptual_gap"
  | "strategy_gap"
  | "representation_confusion"
  | "execution_slip"
  | "correct";

export interface ErrorSignature {
  type: ErrorType;
  description: string;
  example: string;
}

export interface AtomicSkill {
  id: string;                       // e.g. "L6.T2.A1"
  title: string;
  description: string;
  prerequisites: string[];          // ids of required skills
  templates: QuestionTemplate[];
  error_signatures: ErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: {
    correct_required: number;       // default 3
    formats_required: number;       // default 2
    allow_scaffolding: boolean;     // false = must answer unaided
  };
}

export interface Tier {
  id: string;                       // e.g. "L6.T2"
  title: string;
  atomic_skills: AtomicSkill[];
}

export interface Level {
  id: number;
  title: string;
  description: string;
  tiers: Tier[];
}

export interface SkillTree {
  version: string;
  levels: Level[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type MasteryStatus = "locked" | "in_progress" | "mastered" | "needs_review" | "assumed";

export interface SkillAttempt {
  id: string;
  skill_id: string;
  template: QuestionTemplate;
  question: string;
  student_answer: string;
  student_steps: string;
  expected_answer: string;
  is_correct: boolean;
  scaffolded: boolean;
  error_type: ErrorType;
  feedback: string;
  timestamp: string;
}

export interface MathsSessionRecord {
  sessionId: string;
  timestamp: number;
  accuracy:  number;   // correct / total for this session on this skill
  passed:    boolean;  // met correct_required + formats_required
}

export interface SkillMastery {
  skill_id: string;
  status: MasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: QuestionTemplate[];
  scaffolded_attempts: number;
  last_attempted: string;
  mastered_at?: string;
  last_reviewed_at?: string;
  needs_reinforcement?: boolean;
  session_history?: MathsSessionRecord[];
  attempts: SkillAttempt[];
  /** BKT: continuous probability estimate that student has learned this skill (0–1) */
  p_learned?: number;
}

export type DiagnosticBlock = 1 | 2 | 3;

export interface MathsPlacementTaskResult {
  domain: string;        // e.g. "M001"
  score: number;         // 0 or 1
  response: string;
  block?: DiagnosticBlock;
  correct?: boolean;
  error_type?: string;
}

export interface MathsPlacementResult {
  completedAt: number;
  tasks: MathsPlacementTaskResult[];
  entrySkillId: string;
  entryLevel: number;
  autoCompletedSkillIds: string[];
  hardGatePassed: boolean;
  placementBlock?: DiagnosticBlock;
  earlyExitReason?: string | null;
  probesRun?: number;
  placementCompletedAt?: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_tier_id: string;
  current_skill_id: string;
  skill_mastery: Record<string, SkillMastery>;  // key = skill_id
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
  error_history: Record<ErrorType, number>;
  // Question bank tracking: maps domain (M001-M018) to array of used question refs
  used_questions: Record<string, string[]>;
  // Diagnostic placement
  placementCompleted: boolean;
  placement?: MathsPlacementResult;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface DiagnosticSession {
  session_id: string;
  student_id: string;
  skill_id: string;
  started_at: string;
  questions: GeneratedQuestion[];
  completed: boolean;
}

export interface GraduatedHint {
  /** Tap 1 — directional nudge, vague */
  nudge: string;
  /** Tap 2 — process pointer, what to do */
  process: string;
  /** Tap 3 — first step worked, most revealing */
  worked: string;
}

export interface GeneratedQuestion {
  id: string;
  skill_id: string;
  domain_id?: string;
  question_ref?: string;
  template: QuestionTemplate;
  question: string;
  hint?: string;
  hints?: GraduatedHint;
  expected_answer: string;
  scaffolding_notes: string;
  /**
   * A deterministic, numbers-in worked walkthrough computed from this question's
   * own operands (Path B) — e.g. ["Start with the bigger number, 5.", "Count on
   * 2 more: 6, 7.", "So 5 + 2 = 7."]. Present only for the young-grade arithmetic
   * the generator covers; absent otherwise, so the feedback card falls back to
   * the reused-hint walkthrough (Path A).
   */
  working_steps?: string[];
  bank_question?: Record<string, unknown>;
  /** Difficulty level 1–5 assigned by tagging script; used for ability-matched selection */
  difficulty?: number;
  /** Field labels for multi-input questions (e.g. triple_numeric: ["Groups", "In each group", "Total"]) */
  labels?: string[];
}

export interface AnswerSubmission {
  student_id: string;
  question_id: string;
  skill_id: string;
  template: QuestionTemplate;
  question: string;
  student_answer: string;
  student_steps: string;
  expected_answer: string;
  used_hint: boolean;
  attempt_number: number; // 1 = first attempt on this skill, 2+ = repeated incorrect
  language?: string;
  working_image?: string; // base64 data URL of handwritten working photo
  grade?: number;         // student's school grade — used for grade-aware praise
  difficulty?: number;    // question difficulty 1–5 — used for hard-skill acknowledgement
}

export interface DiagnosticResult {
  is_correct: boolean;
  error_type: ErrorType;
  feedback: string;
  /**
   * True only when `feedback` is a genuine per-answer AI diagnosis (Tier 3,
   * repeat wrong answer) rather than the canned first-try placeholder. The
   * feedback card uses this to decide whether to surface `feedback` as a
   * personalised "here's what I noticed" intro — never the placeholder.
   */
  feedback_personalised?: boolean;
  recovery_explanation: string;
  mastery_update: {
    skill_id: string;
    new_status: MasteryStatus;
    correct_count: number;
    attempt_count: number;
    formats_used: QuestionTemplate[];
  };
  next_action: "continue_skill" | "advance_skill" | "advance_tier" | "advance_level" | "review_prerequisite";
  next_skill_id?: string;
}
