// ─── Maths Literacy types ─────────────────────────────────────────────────────
// Shapes shared between the API routes, engine, tree view, and student model.

export type MathsLiteracyAnswerMode = "numeric" | "multiChoice" | "multiField";

export interface MathsLiteracyMultiFieldSpec {
  label: string;
  expectedAnswer: string | number;
  tolerance?: number;
}

export interface MathsLiteracyBankItem {
  id: string;
  skill: string;
  caps_level: number;
  source?: string;
  stimulus: { inline: string };
  question: string;
  answerMode: MathsLiteracyAnswerMode;
  expectedAnswer?: string | number;
  tolerance?: number;
  unit?: string;
  options?: string[];
  fields?: MathsLiteracyMultiFieldSpec[];
  workingSteps: string[];
  errorSignals: string[];
  passThreshold: number;
}

export interface MathsLiteracyBank {
  skill: string;
  skill_title: string;
  grades: number[];
  caps_levels_target: number[];
  version: string;
  notes?: string;
  items: MathsLiteracyBankItem[];
  _error_signal_vocabulary?: Record<string, string>;
}

// Skill-tree types (mirror data/maths-literacy-skill-tree.json).
export interface MathsLiteracyErrorSignature {
  type: string;
  description: string;
  example: string;
}

export interface MathsLiteracyMasteryCriteria {
  correct_required: number;
  formats_required: number;
  allow_scaffolding: boolean;
}

export interface MathsLiteracyAtomicSkill {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  grades: number[];
  caps_levels: number[];
  templates: string[];
  error_signatures: MathsLiteracyErrorSignature[];
  recovery_strategy: string;
  mastery_criteria: MathsLiteracyMasteryCriteria;
}

export interface MathsLiteracyTier {
  id: string;
  title: string;
  atomic_skills: MathsLiteracyAtomicSkill[];
}

export interface MathsLiteracyLevel {
  id: number;
  title: string;
  caps_topic?: string;
  caps_section?: string;
  description?: string;
  tiers: MathsLiteracyTier[];
}

export interface MathsLiteracySkillTree {
  version: string;
  subject: string;
  grades_covered: number[];
  caps_taxonomy_levels: number[];
  notes?: string;
  levels: MathsLiteracyLevel[];
}

// ─── Mastery + profile ──────────────────────────────────────────────────────
export type MathsLiteracyMasteryStatus = "in_progress" | "mastered";

export interface MathsLiteracySkillAttempt {
  id: string;
  skill_id: string;
  question_id: string;
  question: string;
  student_answer: string;
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  timestamp: string;
}

export interface MathsLiteracySkillMastery {
  skill_id: string;
  status: MathsLiteracyMasteryStatus;
  correct_count: number;
  attempt_count: number;
  last_attempted: string;
  mastered_at?: string;
  attempts: MathsLiteracySkillAttempt[];
}

export interface MathsLiteracyStudentProfile {
  id: string;
  name: string;
  grade: number;
  current_skill_id: string;
  skill_mastery: Record<string, MathsLiteracySkillMastery>;
  session_count: number;
  total_attempts: number;
  total_correct: number;
  created_at: string;
  last_active: string;
}

// ─── API contracts ──────────────────────────────────────────────────────────
export interface MathsLiteracyGenerateRequest {
  skill_id: string;
  used_refs?: string[];
}

export interface MathsLiteracyGenerateResponse {
  id: string;
  skill_id: string;
  question_id: string;
  stimulus: string;
  question: string;
  answerMode: MathsLiteracyAnswerMode;
  options?: string[];
  fields?: { label: string; tolerance?: number }[];
  unit?: string;
  // Answer key passed back to submit-answer so the route can score without
  // re-loading the bank. Stripped of the *student-facing* expectedAnswer
  // is fine because it's only sent back to the server.
  expected_answer_key: string; // JSON string of { mode, expectedAnswer?, tolerance?, options?, fields? }
  working_steps: string[];
}

export interface MathsLiteracySubmitRequest {
  skill_id: string;
  question_id: string;
  question: string;
  student_answer: string;            // single value (numeric/multiChoice) — empty for multiField
  student_fields?: { label: string; value: string }[]; // multiField only
  expected_answer_key: string;       // JSON from generate-question
  working_steps: string[];           // shown on incorrect for canned feedback
}

export interface MathsLiteracyDiagnosticResult {
  is_correct: boolean;
  partial_credit?: { correct: number; total: number };
  error_signals: string[];
  feedback: string;
  working_steps: string[];
  mastery_update: {
    skill_id: string;
    new_status: MathsLiteracyMasteryStatus;
    correct_count: number;
    attempt_count: number;
  };
  next_action: "continue_skill" | "advance_skill";
}

export interface MathsLiteracySubmitResponse {
  result: MathsLiteracyDiagnosticResult;
  attempt: MathsLiteracySkillAttempt;
}
