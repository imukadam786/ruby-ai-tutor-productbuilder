// ─── Reading Question Bank (static, pre-authored) ─────────────────────────────
// Levels 6+ (Intermediate Phase onward). Spec: V5_Ruby_Intermediate_Phase_v1.2.
//
// This is the STATIC bank format. L1–L5 continue to runtime-generate via
// /api/reading/generate-question. For level >= 6 the serving route reads from
// a ReadingQuestionBank instead of calling the model.
//
// Skill-tree types live in types/reading.ts (the progression model). This file
// is only the question content + machine-check rules.
//
// Shape reconciled against the validated full L6.json (10 skills / 175 items).
// Source text lives in one of several places depending on skill:
//   • A1/A2/A3  → shared `texts[]` pool via item.textId (reused in one session)
//   • A4 cloze  → item.passage      • B1 data → item.dataText + item.question
//   • B2 proc   → item.procedureText• B3 vocab→ item.contextSentence + targetWord
//   • C1–C3     → writing prompt only (item.prompt), no source text

// L6/L7/L8 used hard advance gates E/F/G. Senior (L9–L11) and FET (L12–L14)
// removed hard gates (algorithm-driven progression), so their banks carry
// "NONE". `gate` is metadata only — no runtime logic branches on it.
export type ReadingGate = "E" | "F" | "G" | "NONE";
export type ReadingContext = "A" | "B" | "C";          // A=story  B=information  C=data/procedural
export type ReadingDeliveryMode = "TEXT" | "VOICE" | "HYBRID";

/** A passage in the shared text pool. Skills in the same tier draw the SAME
 *  text in one session task block (e.g. L6.A1/A2/A3 all read one text). */
export interface ReadingBankText {
  id: string;                 // "TA.001"
  context: ReadingContext;
  title: string;              // "The Lost Dog"
  body: string;
  wordCount: number;
  grade: number;
}

/** How a submitted answer is machine-scored. Discriminated on `mode`.
 *  Optional fields are skill-specific machine-check params from the bank. */
export type ReadingAnswerKey =
  // Open response scored by breadth/meaning coverage vs a reference.
  // A1 (main idea), A2 (details), B1 (data lookup), B3 (vocab in context).
  | {
      mode: "similarity-band";
      reference: string;
      bands: { green: number; amber: number };
      copyRejectAt: number;
      minDetails?: number;                 // A2: min distinct supporting details
      crossDetailSimilarityMax?: number;   // A2: duplicate-detail ceiling
      acceptedAnswers?: string[];          // B1: exact accepted data-point strings
      synonyms?: string[];                 // B3: accepted synonym set
    }
  // Ordered units. A3 retell (Beginning/Middle/End units), B2 procedural steps.
  | {
      mode: "sequence";
      order: string[];
      minUnits?: number;                   // A3: minimum retell units
      copyRejectAt?: number;               // A3: verbatim-copy ceiling
      orderThreshold?: number;             // A3: min ordered-correctly fraction
    }
  // Every Nth word blanked; exact OR semantic-equivalent accepted. A4 cloze.
  | {
      mode: "cloze";
      blanks: { index: number; answer: string; synonyms?: string[] }[];
      semanticEquivAt: number;
      passAccuracy: number;
    }
  // Binary YES/NO rubric checks; score = checks passed / total. C1–C3 writing.
  | {
      mode: "rubric";
      checks: { id: string; description: string }[];
      passFraction: number;
      compulsoryCheck?: string;            // C2: a check that must pass to pass
      requiredTense?: string;              // C3: tense the paragraph must hold
    }
  // Deterministic multiple choice (fact/opinion, feature ID — L7/L8).
  | { mode: "choice"; options: string[]; correct: number };

/** ACCEPT / ACCEPT-IF / REJECT rule the evaluator applies in order. */
export interface ReadingToleranceRule {
  decision: "ACCEPT" | "ACCEPT_IF" | "REJECT";
  condition: string;
  firesError?: string;
}

export interface ReadingRecoveryAction {
  errorVariant: string;
  action: string;
}

export interface ReadingBankItem {
  id: string;                                     // "A1.012" / "BP.001" / "CA4.001"
  answerKey: ReadingAnswerKey;
  errorSignals: string[];                         // ERR variants this item can fire
  randomisable: boolean;                          // "Rand" column
  // ── Source text (presence depends on skill — see file header) ──
  textId?: string;                                // ref into bank.texts (A1/A2/A3)
  context?: ReadingContext;
  title?: string;                                 // A4/B2 self-titled passage
  passage?: string;                               // A4 cloze source passage
  procedureText?: string;                         // B2 procedural source text
  dataText?: string;                              // B1 structured data text
  question?: string;                              // B1 targeted question
  subType?: string;                               // B1 question subtype code (NL/CL/SC/DI)
  targetWord?: string;                            // B3 word to define
  contextSentence?: string;                       // B3 sentence containing the word
  prompt?: string;                                // C1–C3 writing prompt
  tense?: string;                                 // C3 required tense for this item
}

export interface ReadingBankSkill {
  skillId: string;                                // "L6.A1"
  name: string;
  gate: ReadingGate;
  level: number;
  tier: string;                                   // "1 — Structured Understanding"
  grade: number;
  description: string;
  deliveryMode: ReadingDeliveryMode;
  questionFormat: string;
  defaultPrompt: string;
  errorCode: string;                              // primary ERR_ code
  passCondition: {
    metric: string;
    threshold: number;
    amberFloor?: number;
    texts: number;
    sessions: number;
  };
  tolerance: ReadingToleranceRule[];
  recovery: ReadingRecoveryAction[];
  items: ReadingBankItem[];
  voiceFallback?: boolean;                        // D-skills: accept TEXT, log TEXT_MODE
  // ── Skill-level bank-author metadata ──
  phase1Note?: string;                            // A4/B1: Phase-1 visual-constraint note
  subTypes?: Record<string, string>;              // B1: subtype code → label
  rubric?: { checks: { id: string; description: string }[] }; // C1–C3 canonical rubric
}

export interface ReadingQuestionBank {
  level: number;
  gate: ReadingGate;
  specVersion: string;
  bankVersion: string;
  grades: number[];
  texts: ReadingBankText[];
  skills: ReadingBankSkill[];
}
