// ─── Reading Skill Tree ───────────────────────────────────────────────────────

export type ReadingTemplate = "oral" | "listening" | "written" | "reading";

export type ReadingErrorType =
  | "ERR_PHONEME_CONF"
  | "ERR_SYLLABLE_BREAK"
  | "ERR_SOUND_RECALL"
  | "ERR_BLEND_FAIL"
  | "ERR_ENCODE_BLEND"
  | "ERR_SOUND_OMIT"
  | "ERR_SOUND_INSERT"
  | "ERR_VOWEL_CONF"
  | "ERR_ORTHO_GUESS"
  | "ERR_SIGHT_MISS"
  | "ERR_MULTI_BREAK"
  | "ERR_FLUENCY_HES"
  | "ERR_MEANING_BLIND"
  | "ERR_SELF_MON"
  | "correct";

export interface DiagnosticTaskResult {
  taskId: string;
  correct: boolean;
  score: number;
  response: string;
  errorType?: string;
  sttSkipped?: boolean; // true when voice input unavailable — excluded from placement scoring
}

export interface DiagnosticPlacementResult {
  completedAt: number;
  tasks: DiagnosticTaskResult[];
  entrySkillId: string;
  autoCompletedSkillIds: string[];
  hardGatePassed: boolean;
  dominantErrors: string[];
}

export interface ReadingErrorSignature {
  type: ReadingErrorType;
  description: string;
  example: string;
}

export interface ReadingAtomicSkill {
  id: string;
  title: string;
  description: string;
  /** Links a tree skill (R-format id, e.g. "R6.T1.A1") to its static
   *  question-bank skill (e.g. "L6.A1"). Present for L6+ only; L1–L5
   *  runtime-generate and have no bank. */
  bank_skill_id?: string;
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

export type ReadingMasteryStatus = "locked" | "in_progress" | "mastered" | "needs_review" | "assumed";

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
  last_reviewed_at?: string;
  attempts: ReadingSkillAttempt[];
  /** BKT: continuous probability estimate that student has learned this skill (0–1) */
  p_learned?: number;
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
  placementCompleted: boolean;
  placement: DiagnosticPlacementResult | null;
  errorPatterns: Record<string, { type: ReadingErrorType; count: number; retaughtCount: number }>;
  sessionHistory: Record<string, boolean[]>;
  /** Tracks which pool refs have been served per skill — prevents same question showing twice */
  used_questions?: Record<string, string[]>;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface AudioTapChoice {
  label: string;   // displayed on button, e.g. "/b/"
  speech: string;  // spoken by TTS when tapped, e.g. "B, as in bat"
  correct: boolean;
}

export interface ReadingGeneratedQuestion {
  id: string;
  skill_id: string;
  template: ReadingTemplate;
  question: string;
  displayWord?: string;         // large card display for audio-tap (e.g. "B", "sh")
  audioChoices?: AudioTapChoice[];
  hint?: string;
  expected_answer: string;
  scaffolding_notes: string;
  /** Pool ref used to generate this question — stored in used_questions to avoid repeats */
  used_ref?: string;
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
  attempt_number: number; // 1 = first attempt on this skill, 2+ = repeated incorrect
  language?: string;
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
