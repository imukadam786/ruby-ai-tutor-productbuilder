"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import RubyLoader from "@/components/RubyLoader";
import { MathsPlacementResult, MathsPlacementTaskResult, DiagnosticBlock } from "@/types/ruby";
import { getSkillIdsForLevels, getLevelById } from "@/lib/student-model";
import { SEARCH_GATES, LEVEL_LABEL, getSearchWindow, isGatePassed, resolveEntryLevel } from "@/lib/maths-placement-engine";
import { simplifyText } from "@/lib/question-simplifier";
import { getReadingProfile } from "@/lib/reading-student-model";
import { DotArray, parseDotArray } from "./DotArray";
import AnswerButton from "@/components/ui/AnswerButton";
import { CONCEPT_C } from "@/lib/flags";

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
  M_GEO: "ERR_GEO_CALC",         // Geometry — Shape and Space
  M014: "ERR_FEATURE_SWAP",       // Functions & lines
  M015: "ERR_LOG_BASE",           // Exponentials & logs
  M016: "ERR_TRIG_SWAP",          // Trigonometry
  M017: "ERR_POWER_RULE",         // Calculus
};

// Gate definitions, window/floor helpers, and the entry-level resolver
// (including partial-pass handling) are imported from @/lib/maths-placement-engine

// ── Answer evaluation ─────────────────────────────────────────────────────────

function normaliseAnswer(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ").replace(/[,]/g, "");
}

// Normalises algebraic expressions: strips outer parens, all whitespace, and
// converts the Unicode minus sign (−) to ASCII (-) so student input like
// "(x - 2)" matches stored expected answers like "x-2" or "(x − 2)".
function normaliseAlgebra(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\u2212/g, "-")           // unicode minus → ascii
    .replace(/\s+/g, "")               // strip all whitespace
    .replace(/^\((.+)\)$/, "$1");      // strip single layer of outer parens
}

function evaluateTaskAnswer(task: Task, answers: string[]): { correct: boolean; errorType?: string } {
  const a0 = answers[0]?.trim() ?? "";
  const errorType = task.errorSignals?.[0] ?? DOMAIN_ERROR_MAP[task.domain] ?? "conceptual_gap";

  if (task.answerMode === "numeric") {
    const correct = a0 !== "" && Number(a0) === Number(task.expectedAnswer);
    return { correct, errorType: correct ? undefined : errorType };
  }

  if (task.answerMode === "text" || task.answerMode === "fraction") {
    const expected = String(task.expectedAnswer ?? "");
    const correct =
      normaliseAnswer(a0) === normaliseAnswer(expected) ||
      normaliseAlgebra(a0) === normaliseAlgebra(expected);
    return { correct, errorType: correct ? undefined : errorType };
  }

  if (task.answerMode === "multiField" && task.fields) {
    const gradedFields = task.fields.filter((f) => f.expectedAnswer !== undefined);
    if (gradedFields.length === 0) {
      const correct = task.fields.every((_, i) => (answers[i] ?? "").trim().length > 0);
      return { correct, errorType: correct ? undefined : errorType };
    }
    const correctCount = gradedFields.filter((f, i) => {
      const raw = answers[i] ?? "";
      if (typeof f.expectedAnswer === "number") {
        return Number(raw) === f.expectedAnswer;
      }
      const ea = String(f.expectedAnswer);
      return (
        normaliseAnswer(raw) === normaliseAnswer(ea) ||
        normaliseAlgebra(raw) === normaliseAlgebra(ea)
      );
    }).length;
    const correct = correctCount >= Math.ceil(gradedFields.length * 0.6);
    return { correct, errorType: correct ? undefined : errorType };
  }

  return { correct: false, errorType };
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

  // Gate logic, gap detection, and partial-pass handling all live in the engine
  // so they can be unit-tested independently of this component.
  const entryLevel = resolveEntryLevel(domainCorrect, domainTotal, grade);
  const hardGatePassed = isGatePassed(3, domainCorrect, domainTotal); // Gate 3 = Multiplication / Division

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

// LEVEL_LABEL imported from maths-placement-engine

type Phase = "welcome" | "loading" | "task" | "result" | "error";

// ── Stimulus renderer ─────────────────────────────────────────────────────────
// DotArray / parseDotArray live in ./DotArray so the practice session
// (QuestionCard) renders identical dots.

function StimulusDisplay({ stimulus }: { stimulus: string }) {
  const dotCount = parseDotArray(stimulus);
  if (dotCount !== null) return <DotArray count={dotCount} />;
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl p-5 text-center">
      <p className="text-3xl sm:text-4xl font-bold text-blue-700 tracking-wide whitespace-pre-line">
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
  const [bracketParts, setBracketParts] = useState<{ sign: "+" | "-"; num: string }[]>([]);
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
      if (task.domain === "M013" && task.fields) {
        setBracketParts(task.fields.map(() => ({ sign: "+", num: "" })));
      }
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

      if (result.response !== "(skipped)") setShowEncouragement(true);
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
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-blue-100 items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto">
            🔢
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Hi {studentName}!</h2>
            <p className="text-gray-600 mt-3 leading-relaxed text-base">
              Before we start, let&apos;s do a short discovery activity so I can find your perfect starting point!
            </p>
            <p className="text-blue-600 font-medium mt-2 text-base">No pressure, just do your best 😊</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
            {[
              { icon: "🎯", text: "12 questions" },
              { icon: "⏱️", text: "~5 min" },
              { icon: "🏆", text: "Find your level" },
            ].map(({ icon, text }) => (
              <div key={text} className="bg-blue-50 rounded-xl p-2">
                <div className="text-xl mb-0.5">{icon}</div>
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={loadBank}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
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
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-blue-100 items-center justify-center">
        <RubyLoader label="Preparing your questions…" />
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
            className={`w-full text-white py-3 rounded-2xl font-semibold transition-all ${
              CONCEPT_C
                ? "bg-ruby hover:bg-ruby-deep shadow-lip active:translate-y-[3px] active:shadow-none"
                : "bg-brand-alt hover:opacity-90"
            }`}
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
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-blue-100 overflow-y-auto">
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
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wide mb-1">
                You&apos;re starting at
              </p>
              <p className="text-blue-800 font-bold text-xl">{entryLabel}</p>
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
            className={`w-full text-white py-5 rounded-3xl font-bold text-xl transition-all ${
              CONCEPT_C
                ? "bg-ruby hover:bg-ruby-deep shadow-lip active:translate-y-[3px] active:shadow-none"
                : "bg-brand-alt shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
            }`}
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
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5 text-sm text-gray-400">
          <span className="font-semibold text-blue-600">{phaseLabel}</span>
          <span>Q {Math.min(primaryCompleted + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="max-w-md mx-auto space-y-4">
          {/* Domain badge */}
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
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
              CONCEPT_C ? (
                <div className="grid grid-cols-2 gap-3">
                  {task.choices.map((c, i) => (
                    <AnswerButton
                      key={c.value}
                      index={i}
                      onClick={() => handleChoice(c)}
                      disabled={submitting || !!selectedChoice}
                      selected={selectedChoice === c.value}
                      dimmed={!!selectedChoice && selectedChoice !== c.value}
                    >
                      {c.label}
                    </AnswerButton>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {task.choices.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleChoice(c)}
                      disabled={submitting || !!selectedChoice}
                      className={`px-4 py-5 rounded-2xl border-2 text-base font-bold text-center transition-all active:scale-95 ${
                        selectedChoice === c.value
                          ? "bg-blue-500 border-blue-500 text-white shadow-lg scale-105"
                          : selectedChoice
                          ? "opacity-40 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )
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
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-xl text-gray-800 font-semibold focus:outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300 text-center"
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !hasAnswers}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40 transition-all hover:shadow-md active:scale-98"
                >
                  Submit ✓
                </button>
              </div>
            )}

            {/* ── Multi-field UI — quadratic bracket widget ── */}
            {task.answerMode === "multiField" && task.fields && task.domain === "M013" && (
              <div className="space-y-3">
                {task.fields.map((field, i) => {
                  const parts = bracketParts[i] ?? { sign: "+", num: "" };
                  const updatePart = (key: "sign" | "num", val: string) => {
                    const next = bracketParts.map((p, j) => j === i ? { ...p, [key]: val } : p);
                    setBracketParts(next);
                    const newSign = key === "sign" ? val : parts.sign;
                    const newNum  = key === "num"  ? val : parts.num;
                    const assembled = newNum.trim() !== "" ? "x" + newSign + newNum : "";
                    const nextAnswers = [...answers];
                    nextAnswers[i] = assembled;
                    setAnswers(nextAnswers);
                  };
                  return (
                    <div key={i}>
                      <label className="block text-sm font-semibold text-gray-500 mb-1.5">{field.label}</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-mono text-xl font-semibold select-none">(x</span>
                        {/* Sign toggle */}
                        <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updatePart("sign", "+")}
                            disabled={submitting}
                            className={`px-3 py-2 font-bold text-lg leading-none transition-colors ${parts.sign === "+" ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                          >+</button>
                          <button
                            type="button"
                            onClick={() => updatePart("sign", "-")}
                            disabled={submitting}
                            className={`px-3 py-2 font-bold text-lg leading-none transition-colors ${parts.sign === "-" ? "bg-rose-500 text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                          >−</button>
                        </div>
                        {/* Number input */}
                        <input
                          type="number"
                          min="0"
                          value={parts.num}
                          onChange={(e) => updatePart("num", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && i === (task.fields!.length - 1) && hasAnswers && !submitting) {
                              handleSubmit();
                            }
                          }}
                          ref={i === 0 ? answerInputRef : undefined}
                          disabled={submitting}
                          placeholder="  ?"
                          className="w-20 border-2 border-gray-200 rounded-xl px-2 py-2 text-xl font-bold text-center text-gray-800 focus:outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300"
                        />
                        <span className="text-gray-700 font-mono text-xl font-semibold select-none">)</span>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !hasAnswers}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40 transition-all hover:shadow-md active:scale-98"
                >
                  Submit ✓
                </button>
              </div>
            )}

            {/* ── Multi-field UI — generic text fields ── */}
            {task.answerMode === "multiField" && task.fields && task.domain !== "M013" && (
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
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base text-gray-800 font-medium focus:outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                ))}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !hasAnswers}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40 transition-all hover:shadow-md active:scale-98"
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
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors bg-gray-50 hover:bg-blue-50"
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
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
                <p className="text-blue-700 font-semibold text-base">
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
