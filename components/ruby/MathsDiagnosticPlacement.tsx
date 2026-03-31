"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MathsPlacementResult, MathsPlacementTaskResult, DiagnosticBlock } from "@/types/ruby";
import { getSkillIdsForLevels, getLevelById } from "@/lib/student-model";
import { simplifyText } from "@/lib/question-simplifier";
import { getReadingProfile } from "@/lib/reading-student-model";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Choice { label: string; value: string; correct: boolean }

type AnswerMode = "numeric" | "text" | "fraction" | "multiField" | "choice";

interface TaskField {
  label: string;
  expectedAnswer?: number | string;
  hint?: string;
  exampleAnswer?: string;
}

interface Task {
  id: string;
  domain: string;
  domainTitle: string;
  gate: "A" | "B" | "C" | "D"; // kept for bank file compatibility
  block: DiagnosticBlock;
  question: string;
  stimulus?: string;
  answerMode: AnswerMode;
  expectedAnswer?: number | string;
  fields?: TaskField[];
  choices?: Choice[];
  errorSignals?: string[];
}

// ── Raw JSON bank task shape ───────────────────────────────────────────────────

interface RawBankTask {
  id: string;
  domain: string;
  domainTitle: string;
  gate: "A" | "B" | "C" | "D";
  question: string;
  stimulus?: string;
  answerMode: AnswerMode;
  expectedAnswer?: number | string;
  fields?: TaskField[];
  errorSignals?: string[];
}

function adaptBankTask(raw: RawBankTask, block: DiagnosticBlock): Task {
  return { ...raw, block };
}

// ── Domain → default error code when a question is answered incorrectly ───────
// Used as fallback when errorSignals[] is not set on the bank task.
const DOMAIN_ERROR_MAP: Record<string, string> = {
  M001: "ERR_COUNT_OFF_BY_ONE",   // Counting
  M002: "ERR_SEQ_RULE",           // Number sequences
  M003: "ERR_FACE_VALUE",         // Place value
  M020: "ERR_ADD_NEAR_MISS",      // 2-digit addition
  M004: "ERR_ADD_NEAR_MISS",      // Addition strategies
  M005: "ERR_SUB_ADD",            // Subtraction strategies
  M006: "ERR_MULT_ADD",           // Multiplication
  M028: "ERR_WRONG_STRATEGY",     // Division strategies
  M007: "ERR_PART_WHOLE",         // Decomposition
  M029: "ERR_FRACTION_FORM",      // Fractions – number line
  M008: "ERR_INVERT",             // Fraction operations
  M031: "ERR_WRONG_OP",           // Percentages
  M009: "ERR_RATIO_ADD",          // Ratio & proportion
  M010: "ERR_BODMAS_ORDER",       // BODMAS
  M032: "ERR_INTEGER_SIGN",       // Negative number operations
  M033: "ERR_SEQ_RULE",           // Number patterns / expanding brackets
  M011: "ERR_LIKE_TERMS",         // Algebraic expressions
  M012: "ERR_OP_ERROR",           // Linear equations
  M034: "ERR_OP_ERROR",           // Advanced linear equations
  M013: "ERR_FACTOR_WRONG",       // Quadratic factorisation
  M014: "ERR_FEATURE_SWAP",       // Functions & lines
  M015: "ERR_LOG_BASE",           // Exponentials & logs
  M016: "ERR_TRIG_SWAP",          // Trigonometry
  M017: "ERR_POWER_RULE",         // Calculus
};

// ── 12-gate structure — one gate per SA CAPS grade level ──────────────────────
// Each gate covers 2 diagnostic domains in curriculum order.
// The diagnostic loads a 3-gate window around the student's grade so questions
// are always grade-appropriate (no fractions for a Grade 1 student, etc.).

const SEARCH_GATES: Array<{ name: string; domains: [string, string] }> = [
  { name: "G1",  domains: ["M001", "M002"] },  // Grade 1:  Counting / Number sequences
  { name: "G2",  domains: ["M003", "M020"] },  // Grade 2:  Place value / 2-digit addition
  { name: "G3",  domains: ["M004", "M005"] },  // Grade 3:  Addition / Subtraction strategy
  { name: "G4",  domains: ["M006", "M028"] },  // Grade 4:  Multiplication / Division
  { name: "G5",  domains: ["M007", "M029"] },  // Grade 5:  Decomposition / Fractions intro
  { name: "G6",  domains: ["M008", "M031"] },  // Grade 6:  Fraction operations / Percentages
  { name: "G7",  domains: ["M009", "M010"] },  // Grade 7:  Ratio & proportion / BODMAS
  { name: "G8",  domains: ["M032", "M033"] },  // Grade 8:  Negative numbers / Algebra patterns
  { name: "G9",  domains: ["M011", "M012"] },  // Grade 9:  Algebraic expressions / Linear equations
  { name: "G10", domains: ["M013", "M034"] },  // Grade 10: Quadratic factorisation / Advanced linear
  { name: "G11", domains: ["M014", "M015"] },  // Grade 11: Functions & lines / Exponentials & logs
  { name: "G12", domains: ["M016", "M017"] },  // Grade 12: Trigonometry / Calculus
];

// Grade N (1-indexed) → gate window [lo, hi] (0-indexed).
// Grade 1 → [0,0]  (1 gate).  Grade 2 → [0,1]  (2 gates).  Grade 3+ → 3-gate window.
function getSearchWindow(grade: number): [number, number] {
  const hi = Math.min(grade - 1, SEARCH_GATES.length - 1);
  const lo = Math.max(0, hi - 2);
  return [lo, hi];
}

// Entry skill-tree level when a student passes a given gate.
// "Passed gate N" means they have mastered that content → start at the next level.
const GATE_PASSED_ENTRY: Record<number, number> = {
  0: 2,   // Passed Grade 1 → entry Addition Concepts (level 2)
  1: 3,   // Passed Grade 2 → entry Subtraction Concepts (level 3)
  //       Previously jumped to 4, skipping L3. Place value + 2-digit addition
  //       does not cover subtraction as take-away/difference or borrowing.
  2: 5,   // Passed Grade 3 → entry Multiplication Concepts (level 5)
  3: 8,   // Passed Grade 4 → entry Fractions Introduction (level 8)
  4: 9,   // Passed Grade 5 → entry Fraction Operations (level 9)
  //       Previously jumped to 11, skipping L9 (Fraction Operations) and L10
  //       (Decimals). Fraction equivalence ≠ fraction arithmetic or decimal ops.
  5: 12,  // Passed Grade 6 → entry Negative Numbers and Integers (level 12)
  6: 13,  // Passed Grade 7 → entry Algebra — Patterns and Variables (level 13)
  7: 14,  // Passed Grade 8 → entry Linear Equations (level 14)
  8: 15,  // Passed Grade 9 → entry Geometry — Shape and Space (level 15)
  //       Previously jumped to 17, skipping L15 (Geometry) and L16 (Statistics).
  //       Algebra and linear equations have zero content overlap with either domain.
  9: 19,  // Passed Grade 10 → entry Functions and Straight Lines (level 19)
  10: 21, // Passed Grade 11 → entry Trigonometric Ratios (level 21)
  11: 22, // Passed Grade 12 → top of tree (level 22)
};

// ── Answer evaluation ─────────────────────────────────────────────────────────

function normaliseAnswer(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ").replace(/[,]/g, "");
}

function evaluateTaskAnswer(task: Task, answers: string[]): { correct: boolean; errorType?: string } {
  const a0 = answers[0]?.trim() ?? "";
  const errorType = task.errorSignals?.[0] ?? DOMAIN_ERROR_MAP[task.domain] ?? "conceptual_gap";

  if (task.answerMode === "numeric") {
    const correct = a0 !== "" && Number(a0) === Number(task.expectedAnswer);
    return { correct, errorType: correct ? undefined : errorType };
  }

  if (task.answerMode === "text" || task.answerMode === "fraction") {
    const correct = normaliseAnswer(a0) === normaliseAnswer(String(task.expectedAnswer ?? ""));
    return { correct, errorType: correct ? undefined : errorType };
  }

  if (task.answerMode === "multiField" && task.fields) {
    const gradedFields = task.fields.filter((f) => f.expectedAnswer !== undefined);
    if (gradedFields.length === 0) {
      const correct = task.fields.every((_, i) => (answers[i] ?? "").trim().length > 0);
      return { correct, errorType: correct ? undefined : errorType };
    }
    const correctCount = gradedFields.filter((f, i) => {
      const ua = normaliseAnswer(answers[i] ?? "");
      const ea = normaliseAnswer(String(f.expectedAnswer));
      return ua === ea || (typeof f.expectedAnswer === "number" && Number(answers[i]) === f.expectedAnswer);
    }).length;
    const correct = correctCount >= Math.ceil(gradedFields.length * 0.6);
    return { correct, errorType: correct ? undefined : errorType };
  }

  return { correct: false, errorType };
}

// ── Grade floor (entry level fallback when no gate is passed) ─────────────────

// Conservative fallback entry level when a student fails every gate in their window.
// Deliberately set ~2 grade levels below the window's lowest gate so the learning
// session can quickly find the real floor via BKT rather than starting too high.
function getGradeFloor(grade: number): number {
  if (grade <= 2) return 1;   // Grade 1–2 failed → start at Counting
  if (grade <= 3) return 1;   // Grade 3 failed  → start at Counting
  if (grade <= 4) return 2;   // Grade 4 failed  → start at Addition
  if (grade <= 5) return 3;   // Grade 5 failed  → start at Subtraction
  if (grade <= 6) return 4;   // Grade 6 failed  → start at Multiplication entry
  if (grade <= 7) return 5;   // Grade 7 failed  → start at Multiplication
  if (grade <= 8) return 5;   // Grade 8 failed  → start at Multiplication
  if (grade <= 9) return 7;   // Grade 9 failed  → start at Fractions
  if (grade <= 10) return 8;  // Grade 10 failed → start at Ratio/Proportion entry
  if (grade <= 11) return 11; // Grade 11 failed → start at Ratio
  if (grade <= 12) return 13; // Grade 12 failed → start at Algebra
  return 17;
}

// ── Placement computation ─────────────────────────────────────────────────────

function computePlacement(
  results: MathsPlacementTaskResult[],
  grade: number,
): {
  entryLevel: number; entrySkillId: string; hardGatePassed: boolean;
  autoCompletedSkillIds: string[]; earlyExitReason: string | null;
  probesRun: number; placementBlock: DiagnosticBlock;
} {
  // Tally correct answers and total attempts per domain
  const domainCorrect: Record<string, number> = {};
  const domainTotal: Record<string, number> = {};
  for (const r of results) {
    domainCorrect[r.domain] = (domainCorrect[r.domain] ?? 0) + (r.correct ? 1 : 0);
    domainTotal[r.domain]   = (domainTotal[r.domain]   ?? 0) + 1;
  }

  // Domain passed threshold scales with question count:
  //   2 questions (Grade 3–12): both must be correct — prevents a single lucky
  //     answer passing a domain and cascading into a large overplacement.
  //   3 questions (Grade 2):    majority (≥2/3) — one slip is forgiven.
  //   6 questions (Grade 1):    majority (≥4/6) — consistent performance needed.
  const domainPassed = (d: string) => {
    const total = domainTotal[d] ?? 0;
    const correct = domainCorrect[d] ?? 0;
    if (total === 0) return false;
    if (total === 2) return correct === 2;           // strict: both correct
    return correct / total >= 0.5;                  // majority for 3q and 6q
  };

  // Gate passed = both domains passed
  const gatePassed = (idx: number): boolean => {
    const gate = SEARCH_GATES[idx];
    return !!gate && gate.domains.every((d) => domainPassed(d));
  };

  // Find the highest gate passed and the lowest gate failed within the window.
  // A gate is only considered "failed" if it was actually tested (domainTotal > 0).
  const [lo, hi] = getSearchWindow(grade);
  let highestPassedGate = -1;
  let lowestFailedGate  = -1;
  for (let i = lo; i <= hi; i++) {
    if (gatePassed(i)) {
      highestPassedGate = i;
    } else {
      const gate = SEARCH_GATES[i];
      const wasTested = gate.domains.some((d) => (domainTotal[d] ?? 0) > 0);
      if (wasTested && lowestFailedGate === -1) lowestFailedGate = i;
    }
  }

  // Gap detection: student passed a higher gate but failed a lower one.
  // This means they have a prerequisite gap — e.g. can do quadratics but
  // cannot handle negative integers. Placing them at the higher pass level
  // would skip a foundational gap. Instead, start at the content they failed.
  const hasGap = lowestFailedGate >= 0 && highestPassedGate > lowestFailedGate;

  const entryLevel = (() => {
    if (highestPassedGate < 0) return getGradeFloor(grade);
    if (hasGap) {
      // Start at the level that opens with the failed gate's content.
      // GATE_PASSED_ENTRY[lowestFailedGate - 1] = "start level when the gate
      // just below the failure was passed" = the first level of failed content.
      return lowestFailedGate > 0
        ? (GATE_PASSED_ENTRY[lowestFailedGate - 1] ?? getGradeFloor(grade))
        : getGradeFloor(grade);
    }
    return GATE_PASSED_ENTRY[highestPassedGate] ?? getGradeFloor(grade);
  })();

  const hardGatePassed = gatePassed(3); // Gate 3 = Multiplication / Division

  const level = getLevelById(entryLevel);
  let entrySkillId = `L${entryLevel}.T1.A1`;
  if (level && level.tiers.length > 0 && level.tiers[0].atomic_skills.length > 0) {
    entrySkillId = level.tiers[0].atomic_skills[0].id;
  }

  const autoCompletedSkillIds = entryLevel > 1 ? getSkillIdsForLevels(entryLevel) : [];

  return {
    entryLevel, entrySkillId, hardGatePassed, autoCompletedSkillIds,
    earlyExitReason: null,
    probesRun: 0,
    placementBlock: 1,
  };
}

// ── Level labels ──────────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<number, string> = {
  1:  "Counting & Number Sense",
  2:  "Addition Concepts",
  3:  "Subtraction Concepts",
  4:  "Addition & Subtraction Fluency",
  5:  "Multiplication Concepts",
  6:  "Multiplicative Reasoning",
  7:  "Division Concepts",
  8:  "Fractions — Introduction",
  9:  "Fraction Operations",
  10: "Decimals",
  11: "Ratio and Proportion",
  12: "Negative Numbers and Integers",
  13: "Algebra — Patterns and Variables",
  14: "Linear Equations",
  15: "Geometry — Shape and Space",
  16: "Statistics and Data",
  17: "Advanced Problem Solving",
  18: "Quadratic Algebra",
  19: "Functions and Straight Lines",
  20: "Exponentials and Logarithms",
  21: "Trigonometric Ratios",
  22: "Calculus — Differentiation",
};

type Phase = "welcome" | "loading" | "task" | "result" | "error";

// ── Stimulus renderer ─────────────────────────────────────────────────────────

function parseDotArray(stimulus: string): number | null {
  const m = stimulus.match(/^Dot array:\s*(\d+)\s*dots/i);
  return m ? parseInt(m[1], 10) : null;
}

function DotArray({ count }: { count: number }) {
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 flex flex-wrap gap-3 justify-center items-center min-h-[100px]">
      {dots.map((i) => (
        <div key={i} className="w-8 h-8 rounded-full bg-teal-600 shadow-sm flex-shrink-0" />
      ))}
    </div>
  );
}

function StimulusDisplay({ stimulus }: { stimulus: string }) {
  const dotCount = parseDotArray(stimulus);
  if (dotCount !== null) return <DotArray count={dotCount} />;
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 text-center">
      <p className="text-3xl sm:text-4xl font-bold text-teal-700 tracking-wide whitespace-pre-line">
        {stimulus}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MathsDiagnosticPlacement({
  studentName,
  grade,
  onComplete,
  onViewReport,
}: {
  studentName: string;
  grade: number;
  onComplete: (result: MathsPlacementResult) => void;
  onViewReport?: (result: MathsPlacementResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [domainTitleMap, setDomainTitleMap] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Flat question queue — built once on load, no phase transitions
  const [taskQueue, setTaskQueue] = useState<Task[]>([]);
  const [taskIndex, setTaskIndex] = useState(0);

  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const [completedTasks, setCompletedTasks] = useState<MathsPlacementTaskResult[]>([]);
  const [placementResult, setPlacementResult] = useState<MathsPlacementResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const bankLoadedRef = useRef(false);

  // ── Load banks and build a flat 12-question queue ─────────────────────────
  // Every grade always receives exactly 12 questions.
  // The number of bank files loaded scales with the window size so that each
  // domain always has the same number of distinct questions:
  //   Grade 1  — 1 gate,  2 domains → load 6 banks → 6 questions per domain
  //   Grade 2  — 2 gates, 4 domains → load 3 banks → 3 questions per domain
  //   Grade 3+ — 3 gates, 6 domains → load 2 banks → 2 questions per domain
  // Bank files are chosen at random (no repeats) so every session is different.

  const loadBank = useCallback(() => {
    if (bankLoadedRef.current) return;
    bankLoadedRef.current = true;
    setPhase("loading");

    const [lo, hi] = getSearchWindow(grade);
    const totalDomains = (hi - lo + 1) * 2;          // 2, 4, or 6
    const bankCount = Math.round(12 / totalDomains);  // 6, 3, or 2

    // Pick bankCount distinct random bank numbers (1–50)
    const bankNums: number[] = [];
    while (bankNums.length < bankCount) {
      const n = Math.floor(Math.random() * 50) + 1;
      if (!bankNums.includes(n)) bankNums.push(n);
    }

    Promise.all(bankNums.map((n) => import(`@/data/maths-question-banks/${n}.json`)))
      .then((mods) => {
        const readingLevel = getReadingProfile()?.current_level ?? 5;

        // Index each bank by domain
        const banks: Record<string, RawBankTask>[] = mods.map((mod) => {
          const raw = (mod.default ?? mod) as RawBankTask[];
          const byDomain: Record<string, RawBankTask> = {};
          raw.forEach((t) => { byDomain[t.domain] = t; });
          return byDomain;
        });

        const titleMap: Record<string, string> = {};
        mods.forEach((mod) => {
          (mod.default ?? mod as RawBankTask[]).forEach((t: RawBankTask) => {
            titleMap[t.domain] = t.domainTitle;
          });
        });

        // Build flat queue: gate order, domain order, then one question per bank
        const queue: Task[] = [];
        for (let gi = lo; gi <= hi; gi++) {
          for (const domain of SEARCH_GATES[gi].domains) {
            for (const bank of banks) {
              const raw = bank[domain];
              if (raw) {
                const adapted = adaptBankTask(raw, 1);
                queue.push({ ...adapted, question: simplifyText(adapted.question, readingLevel) });
              }
            }
          }
        }

        setDomainTitleMap(titleMap);
        setTaskQueue(queue);
        setTaskIndex(0);
        setPhase("task");
      })
      .catch(() => setPhase("error"));
  }, [grade]);

  // ── Current task and progress ──────────────────────────────────────────────

  const task: Task | undefined = taskQueue[taskIndex];
  const TOTAL_QUESTIONS = taskQueue.length || 12;
  const primaryCompleted = completedTasks.length;
  const progress = (primaryCompleted / TOTAL_QUESTIONS) * 100;
  const phaseLabel =
    primaryCompleted < TOTAL_QUESTIONS / 3
      ? "Getting started"
      : primaryCompleted < (TOTAL_QUESTIONS * 2) / 3
      ? "Finding your level"
      : "Almost done";

  const answerInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workingImage, setWorkingImage] = useState<string | undefined>(undefined);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setWorkingImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [taskIndex]);

  useEffect(() => {
    if (task) {
      setAnswers(task.fields ? task.fields.map(() => "") : [""]);
      setSelectedChoice(null);
      setWorkingImage(undefined);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (window.matchMedia("(pointer: fine)").matches) {
        setTimeout(() => answerInputRef.current?.focus(), 0);
      }
    }
  }, [task?.id]);

  // ── Finish ─────────────────────────────────────────────────────────────────

  const finishDiagnostic = useCallback(
    (completed: MathsPlacementTaskResult[]) => {
      const result = computePlacement(completed, grade);
      const placement: MathsPlacementResult = {
        completedAt: Date.now(),
        placementCompletedAt: Date.now(),
        tasks: completed,
        entrySkillId: result.entrySkillId,
        entryLevel: result.entryLevel,
        autoCompletedSkillIds: result.autoCompletedSkillIds,
        hardGatePassed: result.hardGatePassed,
        placementBlock: result.placementBlock,
        earlyExitReason: null,
        probesRun: 0,
      };
      setPlacementResult(placement);
      setPhase("result");
    },
    [grade]
  );

  // ── Advance through flat queue — no binary search, no early exit ───────────

  const advanceTask = useCallback(
    async (result: MathsPlacementTaskResult) => {
      setSubmitting(true);
      const newCompleted = [...completedTasks, result];
      setCompletedTasks(newCompleted);

      setShowEncouragement(true);
      await new Promise((r) => setTimeout(r, 600));

      const nextIndex = taskIndex + 1;
      if (nextIndex < taskQueue.length) {
        setTaskIndex(nextIndex);
        setShowEncouragement(false);
        setSubmitting(false);
      } else {
        setShowEncouragement(false);
        finishDiagnostic(newCompleted);
        setSubmitting(false);
      }
    },
    [completedTasks, taskIndex, taskQueue.length, finishDiagnostic]
  );

  // ── Choice handler ─────────────────────────────────────────────────────────

  const handleChoice = useCallback(
    (choice: Choice) => {
      if (submitting || selectedChoice || !task) return;
      setSelectedChoice(choice.value);
      const errorType = choice.correct ? undefined : (DOMAIN_ERROR_MAP[task.domain] ?? "conceptual_gap");
      setTimeout(() => {
        advanceTask({
          domain: task.domain,
          score: choice.correct ? 1 : 0,
          response: choice.value,
          block: task.block,
          correct: choice.correct,
          error_type: errorType,
        });
      }, 450);
    },
    [submitting, selectedChoice, task, advanceTask]
  );

  // ── Open-ended submit handler ──────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    if (submitting || !task) return;
    const { correct, errorType } = evaluateTaskAnswer(task, answers);
    advanceTask({
      domain: task.domain,
      score: correct ? 1 : 0,
      response: answers.join(" | "),
      block: task.block,
      correct,
      error_type: errorType,
    });
  }, [submitting, task, answers, advanceTask]);

  const handleSkip = useCallback(() => {
    if (submitting || !task) return;
    advanceTask({
      domain: task.domain, score: 0, response: "(skipped)",
      block: task.block, correct: false,
    });
  }, [submitting, task, advanceTask]);

  // ── Welcome ────────────────────────────────────────────────────────────────

  if (phase === "welcome") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto">
            🔢
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Hi {studentName}!</h2>
            <p className="text-gray-600 mt-3 leading-relaxed text-base">
              Before we start, let&apos;s do a short discovery activity so I can find your perfect starting point!
            </p>
            <p className="text-emerald-600 font-medium mt-2 text-base">No pressure — just do your best 😊</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
            {[
              { icon: "🎯", text: "12 questions" },
              { icon: "⏱️", text: "~5 min" },
              { icon: "🏆", text: "Find your level" },
            ].map(({ icon, text }) => (
              <div key={text} className="bg-emerald-50 rounded-xl p-2">
                <div className="text-xl mb-0.5">{icon}</div>
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={loadBank}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            Let&apos;s go! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 items-center justify-center">
        <div className="text-4xl animate-spin">⚙️</div>
        <p className="mt-4 text-teal-700 font-medium">Preparing your questions…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (phase === "error") {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900">Couldn&apos;t load questions</h3>
          <p className="text-gray-500 text-sm">Check your connection and try again.</p>
          <button
            onClick={() => { bankLoadedRef.current = false; setPhase("welcome"); }}
            className="w-full bg-[#B7182E] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────

  if (phase === "result" && placementResult) {
    const autoCount = placementResult.autoCompletedSkillIds.length;
    const entryLabel = LEVEL_LABEL[placementResult.entryLevel] ?? `Level ${placementResult.entryLevel}`;
    const correctCount = placementResult.tasks.filter((t) => t.score === 1).length;
    const totalCount = placementResult.tasks.length;

    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4">
          <div className="bg-white rounded-3xl shadow-md p-6 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900">Great work, {studentName}!</h2>
            <p className="text-gray-500 text-base">
              You answered {correctCount} of {totalCount} questions correctly.
              I&apos;ve found your perfect starting point!
            </p>
            {autoCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <p className="text-green-700 font-bold text-lg">
                  You already know {autoCount} skill{autoCount !== 1 ? "s" : ""}! ✅
                </p>
              </div>
            )}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wide mb-1">
                You&apos;re starting at
              </p>
              <p className="text-emerald-800 font-bold text-xl">{entryLabel}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-5">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Your Results</h3>
            <div className="space-y-2">
              {placementResult.tasks.map((t, i) => (
                <div key={`${t.domain}-${i}`} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    t.score === 1 ? "bg-green-400 text-white" : "bg-gray-200 text-gray-400"
                  }`}>
                    {t.score === 1 ? "✓" : "·"}
                  </div>
                  <span className="text-base text-gray-600">
                    {domainTitleMap[t.domain] ?? t.domain}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onViewReport ? onViewReport(placementResult) : onComplete(placementResult)}
            className="w-full bg-[#B7182E] text-white py-5 rounded-3xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            View Report 📋
          </button>
        </div>
      </div>
    );
  }

  // ── Task screen ────────────────────────────────────────────────────────────

  if (!task) return null;

  const isChoiceTask = task.answerMode === "choice";
  const hasAnswers = isChoiceTask
    ? !!selectedChoice
    : answers.every((a) => a.trim().length > 0);

  const encouragements = ["Keep going! 💪", "Brilliant! ⭐", "You've got this! 🎯", "Fantastic! 🌟", "Amazing! 🏆"];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5 text-sm text-gray-400">
          <span className="font-semibold text-teal-600">{phaseLabel}</span>
          <span>Q {Math.min(primaryCompleted + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="max-w-md mx-auto space-y-4">
          {/* Domain badge */}
          <div className="flex items-center gap-2">
            <span className="bg-teal-100 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">
              {task.domainTitle}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
            <p className="text-gray-800 text-lg font-semibold leading-snug">{task.question}</p>
            {task.stimulus && <StimulusDisplay stimulus={task.stimulus} />}
          </div>

          {/* Answer card */}
          <div className="bg-white rounded-3xl shadow-md p-5 space-y-4">

            {/* ── Choice UI ── */}
            {isChoiceTask && task.choices && (
              <div className="grid grid-cols-2 gap-3">
                {task.choices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleChoice(c)}
                    disabled={submitting || !!selectedChoice}
                    className={`px-4 py-5 rounded-2xl border-2 text-base font-bold text-center transition-all active:scale-95 ${
                      selectedChoice === c.value
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg scale-105"
                        : selectedChoice
                        ? "opacity-40 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Numeric / text / fraction UI ── */}
            {(task.answerMode === "numeric" || task.answerMode === "text" || task.answerMode === "fraction") && (
              <div className="space-y-3">
                <input
                  type={task.answerMode === "numeric" ? "number" : "text"}
                  value={answers[0] ?? ""}
                  onChange={(e) => setAnswers([e.target.value])}
                  onKeyDown={(e) => { if (e.key === "Enter" && hasAnswers && !submitting) handleSubmit(); }}
                  ref={answerInputRef}
                  disabled={submitting}
                  placeholder={task.answerMode === "numeric" ? "Type your answer…" : "Write your answer…"}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-xl text-gray-800 font-semibold focus:outline-none focus:border-teal-400 transition-colors placeholder:text-gray-300 text-center"
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !hasAnswers}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40 transition-all hover:shadow-md active:scale-98"
                >
                  Submit ✓
                </button>
              </div>
            )}

            {/* ── Multi-field UI ── */}
            {task.answerMode === "multiField" && task.fields && (
              <div className="space-y-3">
                {task.fields.map((field, i) => (
                  <div key={i}>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">{field.label}</label>
                    <input
                      type="text"
                      value={answers[i] ?? ""}
                      onChange={(e) => {
                        const next = [...answers];
                        next[i] = e.target.value;
                        setAnswers(next);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && i === (task.fields!.length - 1) && hasAnswers && !submitting) {
                          handleSubmit();
                        }
                      }}
                      ref={i === 0 ? answerInputRef : undefined}
                      disabled={submitting}
                      placeholder={field.hint ?? "Your answer…"}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base text-gray-800 font-medium focus:outline-none focus:border-teal-400 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                ))}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !hasAnswers}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40 transition-all hover:shadow-md active:scale-98"
                >
                  Submit ✓
                </button>
              </div>
            )}

            {/* ── Working photo (Grade 3+, non-choice tasks only) ── */}
            {grade >= 3 && !isChoiceTask && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                  Show your working <span className="font-normal text-gray-400">(optional)</span>
                </label>
                {workingImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={workingImage} alt="Your working" className="w-full max-h-48 object-contain bg-gray-50" />
                    <button
                      onClick={() => { setWorkingImage(undefined); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                      title="Remove photo"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-teal-400 hover:text-teal-400 transition-colors bg-gray-50 hover:bg-teal-50"
                  >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <span className="text-sm font-medium">Upload your working from your book/page</span>
                    <span className="text-xs text-gray-300">Tap to open camera or choose a photo</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />
              </div>
            )}

            {showEncouragement && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                <p className="text-emerald-700 font-semibold text-base">
                  {encouragements[primaryCompleted % encouragements.length]}
                </p>
              </div>
            )}

            <button
              onClick={handleSkip}
              disabled={submitting}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Skip this question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
