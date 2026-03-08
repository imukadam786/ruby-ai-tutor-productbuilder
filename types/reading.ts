// ─── Reading Skill Tree ───────────────────────────────────────────────────────

export type ReadingTemplate = "oral" | "listening" | "written" | "reading";

export type ReadingErrorType =
  | "omission"
  | "sequence_error"
  | "recall_error"
  | "phoneme_error"
  | "fluency_error"
  | "comprehension_gap"
  | "encoding_error"
  | "correct";

export interface ReadingErrorSignature {
  type: ReadingErrorType;
  description: string;
  example: string;
}

export interface ReadingAtomicSkill {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  templates: ReadingTemplate[];
  error_signatures: ReadingErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface ReadingTier {
  id: string;
  title: string;
  atomic_skills: ReadingAtomicSkill[];
}

export interface ReadingLevel {
  id: number;
  title: string;
  description: string;
  tiers: ReadingTier[];
}

// ─── Student Model ────────────────────────────────────────────────────────────

export type ReadingMasteryStatus = "locked" | "in_progress" | "mastered" | "needs_review";

export interface ReadingSkillAttempt {
  id: string;
  skill_id: string;
  template: ReadingTemplate;
  question: string;
  student_answer: string;
  student_steps: string;
  expected_answer: string;
  is_correct: boolean;
  scaffolded: boolean;
  error_type: ReadingErrorType;
  feedback: string;
  timestamp: string;
}

export interface ReadingSkillMastery {
  skill_id: string;
  status: ReadingMasteryStatus;
  correct_count: number;
  attempt_count: number;
  formats_used: ReadingTemplate[];
  scaffolded_attempts: number;
  last_attempted: string;
  mastered_at?: string;
  attempts: ReadingSkillAttempt[];
}

export interface ReadingStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_level: number;
  current_tier_id: string;
  current_skill_id: string;
  skill_mastery: Record<string, ReadingSkillMastery>;
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
  error_history: Record<ReadingErrorType, number>;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface ReadingGeneratedQuestion {
  id: string;
  skill_id: string;
  template: ReadingTemplate;
  question: string;
  hint?: string;
  expected_answer: string;
  scaffolding_notes: string;
}

export interface ReadingAnswerSubmission {
  student_id: string;
  question_id: string;
  skill_id: string;
  template: ReadingTemplate;
  question: string;
  student_answer: string;
  student_steps: string;
  expected_answer: string;
  used_hint: boolean;
}

export interface ReadingDiagnosticResult {
  is_correct: boolean;
  error_type: ReadingErrorType;
  feedback: string;
  recovery_explanation: string;
  mastery_update: {
    skill_id: string;
    new_status: ReadingMasteryStatus;
    correct_count: number;
    attempt_count: number;
    formats_used: ReadingTemplate[];
  };
  next_action: "continue_skill" | "advance_skill" | "advance_tier" | "advance_level" | "review_prerequisite";
}
