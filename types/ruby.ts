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

export type MasteryStatus = "locked" | "in_progress" | "mastered" | "needs_review";

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
}

export type DiagnosticBlock = 1 | 2 | 3;

export interface MathsPlacementTaskResult {
  domain: string;        // e.g. "M001"
  score: number;         // 0 or 1
  response: string;
  block?: DiagnosticBlock;
  correct?: boolean;
  error_type?: string;
  is_probe?: boolean;
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

export interface GeneratedQuestion {
  id: string;
  skill_id: string;
  domain_id?: string;
  question_ref?: string;
  template: QuestionTemplate;
  question: string;
  hint?: string;
  expected_answer: string;
  scaffolding_notes: string;
  bank_question?: Record<string, unknown>;
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
  language?: string;
}

export interface DiagnosticResult {
  is_correct: boolean;
  error_type: ErrorType;
  feedback: string;
  recovery_explanation: string;
  mastery_update: {
    skill_id: string;
    new_status: MasteryStatus;
    correct_count: number;
    attempt_count: number;
    formats_used: QuestionTemplate[];
  };
  next_action: "continue_skill" | "advance_skill" | "advance_tier" | "advance_level" | "review_prerequisite" | "practice" | "reteach" | "accelerate";
  next_skill_id?: string;
}
