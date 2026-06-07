// ─── Matric Physical Sciences — content, skill tree, student model ──────────
// Grade 12 NSC (CAPS). Sixteen levels (one per CAPS topic) split across P1
// Physics and P2 Chemistry. 42 atomic skills, ~20 items per skill.
//
// The bank lives as one combined file at
// data/matric-physical-sciences-question-bank.json, produced from the
// per-skill files in data/matric-physical-sciences-question-banks/ by
// scripts/build-matric-phys-sci-bank.mjs.

// ─── Bank content ───────────────────────────────────────────────────────────

export type MatricPhysSciAnswerMode =
  | "text"
  | "choice"
  | "numeric"
  | "multiField"
  | "sequence";

export type MatricPhysSciSource = "lifted-from-paper" | "fresh";

export type MatricPhysSciGate = "A" | "B" | "NONE";

export interface MatricPhysSciMultiField {
  label: string;
  expectedAnswer: string | number;
}

// For sequence (tap-to-order) items: the steps to order. The correct order is
// stored in the bank item's `expected_order` (ids) and graded server-side — it
// is never sent to the client.
export interface MatricPhysSciSequenceItem {
  id: string;
  text: string;
}

export interface MatricPhysSciBankItem {
  id: string;                                  // e.g. "L1.T1.A1.q01"
  skill: string;                               // e.g. "L1.T1.A1"
  gate: MatricPhysSciGate;
  source: MatricPhysSciSource;
  source_ref?: string;                         // when lifted, "P1 May/Jun 2024 Q2.1"
  question: string;
  answerMode: MatricPhysSciAnswerMode;
  options?: string[];                          // for choice
  expectedAnswer?: string | number;            // for text / choice / numeric
  tolerance?: number;                          // for numeric
  unit?: string;                               // for numeric
  fields?: MatricPhysSciMultiField[];          // for multiField
  items?: MatricPhysSciSequenceItem[];         // for sequence (steps to order)
  expected_order?: string[];                   // for sequence (correct id order — server-side only)
  marks: number;
  explanation: string;                         // why the answer is correct
  errorSignals: string[];                      // 1–N ERR_* codes
  passThreshold: number;                       // 0–1
}

export interface MatricPhysSciBankSkill {
  skill: string;
  skill_title: string;
  grades: number[];
  paper: "P1" | "P2";
  version: string;
  notes?: string;
  items: MatricPhysSciBankItem[];
  _error_signal_vocabulary: Record<string, string>;
}

export interface MatricPhysSciBank {
  subject: "matric-physical-sciences";
  version: string;
  description?: string;
  built_at?: string;
  skills: Record<string, MatricPhysSciBankSkill>;
}

// ─── Skill Tree ─────────────────────────────────────────────────────────────

export interface MatricPhysSciErrorSignature {
  type: string;
  description: string;
  example?: string;
}

export interface MatricPhysSciAtomicSkill {
  id: string;                                  // "L1.T1.A1"
  title: string;
  description: string;
  prerequisites?: string[];
  templates?: string[];
  error_signatures?: MatricPhysSciErrorSignature[];
  recovery_strategy?: string;
  mastery_criteria?: {
    correct_required: number;
    formats_required: number;
    allow_scaffolding: boolean;
  };
}

export interface MatricPhysSciTier {
  id: string;                                  // "L1.T1"
  title: string;
  atomic_skills: MatricPhysSciAtomicSkill[];
}

export interface MatricPhysSciLevel {
  id: number;                                  // 1..16
  title: string;
  paper: "P1" | "P2";
  description?: string;
  tiers: MatricPhysSciTier[];
}

export interface MatricPhysSciSkillTree {
  version: string;
  subject: "matric-physical-sciences";
  description?: string;
  grades_covered: number[];
  levels: MatricPhysSciLevel[];
}

// ─── API request / response shapes ──────────────────────────────────────────

export interface MatricPhysSciGeneratedQuestion {
  id: string;                                  // session-scoped id
  skill_id: string;
  question_ref: string;                        // = bank item.id
  answerMode: MatricPhysSciAnswerMode;
  question: string;
  options?: string[];
  fields?: MatricPhysSciMultiField[];
  items?: MatricPhysSciSequenceItem[];         // for sequence (expected_order withheld)
  expected_answer?: string | number;
  tolerance?: number;
  unit?: string;
  marks: number;
  explanation: string;
}

export interface MatricPhysSciGenerateQuestionResponse {
  question: MatricPhysSciGeneratedQuestion | null;
}

export interface MatricPhysSciSubmitAnswerRequest {
  skill_id: string;
  question_ref: string;
  answerMode: MatricPhysSciAnswerMode;
  student_answer: string;                      // serialised; multiField is "|"-joined
  expected_answer?: string | number;
  tolerance?: number;
  grade?: 10 | 11 | 12;                        // defaults to 12 (matric) when absent
}

export interface MatricPhysSciMasteryUpdate {
  skill_id: string;
  new_status: "available" | "in_progress" | "mastered";
  correct_count: number;
  attempt_count: number;
}

export interface MatricPhysSciSubmitAnswerResponse {
  is_correct: boolean;
  error_signals: string[];
  feedback: string;
  explanation: string;
  mastery_update: MatricPhysSciMasteryUpdate;
  next_action: "continue_skill" | "skill_mastered";
}

// ─── Student profile ────────────────────────────────────────────────────────

export interface MatricPhysSciSkillMastery {
  status: "available" | "in_progress" | "mastered";
  correct_count: number;
  attempt_count: number;
  last_updated: string;
}

export interface MatricPhysSciStudentProfile {
  id: string;                                  // local UUID
  grade: 12;
  name: string;
  skill_mastery: Record<string, MatricPhysSciSkillMastery>;
  used_questions: Record<string, string[]>;    // skill_id -> question_refs
  created_at: string;
  updated_at: string;
}
