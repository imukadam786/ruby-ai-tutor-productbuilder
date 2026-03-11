/**
 * Question Selector – picks random unused questions from the question bank.
 *
 * Key rules (from spec):
 * 1. For each domain, pick 1 question randomly.
 * 2. Exclude already-used question refs for this student.
 * 3. Once all questions in the pool are exhausted, reset the pool.
 * 4. The selected ref is logged against the student profile (caller persists this).
 */

import questionBankData from "@/data/question-bank.json";
import { StudentProfile } from "@/types/ruby";

export interface BankQuestion {
  ref: string;
  question: string;
  context?: string;
  expected: string;
  input_type: string;
  labels?: string[];
  ruby_prompt: string;
  error_signals: string[];
  // Type-specific fields
  display?: string;
  expression?: string;
  fraction?: string;
  function?: string;
  valid_sum?: number;
  expected_tens?: number;
  expected_ones?: number;
  expected_unit?: number;
  expected_count?: number;
  expected_a?: string;
  expected_b?: string;
  groups?: number;
  each?: number;
  total?: number;
  task?: string;
  eq?: string;
  step?: string;
  [key: string]: unknown;
}

export interface DomainInfo {
  title: string;
  gate: string;
  skill_ids: string[];
  pass_threshold: number;
  questions_for_mastery: number;
  authored_pool?: number;
  questions: BankQuestion[];
}

const bank = questionBankData as {
  version: string;
  domains: Record<string, DomainInfo>;
};

// ─── Level → Domain mapping ───────────────────────────────────────────────────
// Maps skill tree level numbers to diagnostic domains (Ruby Maths Platform Spec v1).
const LEVEL_TO_DOMAIN: Record<number, string> = {
  1:  "M001", // Counting and Cardinality / Early Number Sense
  2:  "M004", // Addition – Mental Strategy
  3:  "M005", // Subtraction – Mental Strategy
  4:  "M006", // Multiplication – Equal Groups (Hard Gate)
  5:  "M007", // Flexible Decomposition
  6:  "M007", // Multiplicative Reasoning (same domain)
  7:  "M008", // Fraction – Unit Interpretation
  8:  "M009", // Ratio and Proportion
  9:  "M010", // Integer Operations and BODMAS
  10: "M011", // Algebraic Expression
  11: "M009", // Extended Ratio
  12: "M010", // Extended Integers
  13: "M011", // Extended Algebra
  14: "M012", // Linear Equation
  15: "M013", // Quadratic Factorisation
  16: "M014", // Function – Key Features
  17: "M018", // Multi-Step Problem – Plan and Solve
};

// Build explicit skill_id → domain map from question bank data
export const DOMAIN_FOR_SKILL: Record<string, string> = {};
for (const [domainId, domain] of Object.entries(bank.domains)) {
  for (const skillId of domain.skill_ids) {
    DOMAIN_FOR_SKILL[skillId] = domainId;
  }
}

// ─── Get domain for a skill ───────────────────────────────────────────────────
export function getDomainForSkill(skillId: string): string | null {
  // Try explicit mapping from question bank first
  if (DOMAIN_FOR_SKILL[skillId]) return DOMAIN_FOR_SKILL[skillId];

  // Fall back to level-based mapping
  const levelMatch = skillId.match(/^L(\d+)\./);
  if (levelMatch) {
    const level = parseInt(levelMatch[1]);
    return LEVEL_TO_DOMAIN[level] || null;
  }
  return null;
}

export function getDomain(domainId: string): DomainInfo | null {
  return bank.domains[domainId] || null;
}

// ─── Select a random unused question for a domain ─────────────────────────────
export function selectQuestion(
  domainId: string,
  usedRefs: string[]
): BankQuestion | null {
  const domain = bank.domains[domainId];
  if (!domain) return null;

  const pool = domain.questions;
  if (pool.length === 0) return null;

  // Filter out already-used refs
  let available = pool.filter((q) => !usedRefs.includes(q.ref));

  // If pool exhausted, reset (give full pool again)
  if (available.length === 0) {
    available = [...pool];
  }

  // Pick random question
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

// ─── Mark question as used in student profile ─────────────────────────────────
export function markQuestionUsed(
  profile: StudentProfile,
  domainId: string,
  questionRef: string
): StudentProfile {
  const existing = profile.used_questions?.[domainId] || [];
  return {
    ...profile,
    used_questions: {
      ...(profile.used_questions || {}),
      [domainId]: [...existing, questionRef],
    },
  };
}

// ─── Get used refs for a domain ───────────────────────────────────────────────
export function getUsedRefs(profile: StudentProfile, domainId: string): string[] {
  return profile.used_questions?.[domainId] || [];
}

// ─── Build a GeneratedQuestion from a BankQuestion ───────────────────────────
export function bankQuestionToGenerated(
  q: BankQuestion,
  skillId: string,
  domainId: string,
  includeHint: boolean
): {
  id: string;
  skill_id: string;
  domain_id: string;
  question_ref: string;
  template: "concrete" | "story" | "symbolic";
  question: string;
  hint?: string;
  expected_answer: string;
  scaffolding_notes: string;
  bank_question: BankQuestion;
} {
  // Determine template from input_type
  let template: "concrete" | "story" | "symbolic" = "symbolic";
  if (q.input_type === "numeric" && q.context?.includes("dots")) template = "concrete";
  else if (q.input_type === "numeric" && q.context?.includes("Dot")) template = "concrete";
  else if (q.context?.includes("story") || q.question?.toLowerCase().includes("there are")) template = "story";

  // Build hint if requested
  let hint: string | undefined;
  if (includeHint) {
    hint = buildHint(q, domainId);
  }

  return {
    id: `q_${domainId}_${q.ref}_${Date.now()}`,
    skill_id: skillId,
    domain_id: domainId,
    question_ref: q.ref,
    template,
    question: buildQuestionText(q, domainId),
    hint,
    expected_answer: q.expected,
    scaffolding_notes: `Error signals: ${q.error_signals.join(", ")}`,
    bank_question: q,
  };
}

function buildQuestionText(q: BankQuestion, domainId: string): string {
  switch (domainId) {
    case "M001":
      return `${q.context}\n\n${q.ruby_prompt}`;
    case "M002":
      return `Sequence: ${q.context}\n\n${q.ruby_prompt}`;
    case "M003":
      return `Number: ${q.display}\n\n${q.ruby_prompt}\n(Enter tens and ones separately)`;
    case "M004":
    case "M005":
      return `${q.expression} = ?\n\n${q.ruby_prompt}`;
    case "M006":
      return `${q.question}\n\nEnter: (1) number of groups, (2) number in each group, (3) total.`;
    case "M007":
      return `${q.ruby_prompt}\n\nNumber: ${q.display}\n\nExample: ${q.expected_a} AND ${q.expected_b} (any valid decomposition accepted)`;
    case "M008":
      return `Fraction: ${q.fraction}\n\n${q.ruby_prompt}`;
    case "M009":
    case "M010":
    case "M011":
    case "M012":
    case "M013":
    case "M014":
    case "M015":
    case "M016":
    case "M017":
    case "M018":
      return q.question;
    default:
      return q.question;
  }
}

function buildHint(q: BankQuestion, domainId: string): string {
  const hints: Record<string, string> = {
    M001: "Count each dot one at a time, touching or pointing to each one.",
    M002: "Look at the pattern — is the sequence going up or down? By how much each time?",
    M003: "The tens digit tells you how many groups of 10. The ones digit tells you the leftovers.",
    M004: "Try counting on from the larger number, or think of a number bond.",
    M005: "Think: what number do you add to the smaller number to get the larger one?",
    M006: "Groups × items in each group = total. Count one group first.",
    M007: "You can split hundreds, tens, and ones in many ways. E.g. 345 = 300+40+5 or 300+45.",
    M008: "The denominator (bottom number) tells you how many equal parts the whole is divided into.",
    M009: "Find the scale factor first: what number do you multiply one side by to get the other?",
    M010: "Remember BODMAS: Brackets, Orders, Division, Multiplication, Addition, Subtraction.",
    M011: "Collect the x terms together, then collect the number terms together.",
    M012: "Inverse operations: subtract the constant from both sides first, then divide.",
    M013: "Find two numbers that multiply to give c and add to give b.",
    M014: "y-intercept: set x=0. x-intercept: set y=0. Gradient: the coefficient of x.",
    M015: "log_b(x) = n means b^n = x. Switch between log and exponential form.",
    M016: "SOH CAH TOA: Sin=Opposite/Hypotenuse, Cos=Adjacent/Hypotenuse, Tan=Opposite/Adjacent.",
    M017: "Power rule: if f(x) = ax^n, then f'(x) = n·ax^(n-1). Differentiate each term.",
    M018: "Break the problem into steps. Identify what you know and what you need to find.",
  };
  return hints[domainId] || "Read the question carefully and break it into smaller steps.";
}
