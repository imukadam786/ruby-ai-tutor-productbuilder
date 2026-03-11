"use client";

import { useState, useCallback } from "react";
import { MathsPlacementResult, MathsPlacementTaskResult } from "@/types/ruby";
import { getSkillIdsForLevels, getLevelById } from "@/lib/student-model";

// ── Task definitions ──────────────────────────────────────────────────────────

interface Choice { label: string; value: string; correct: boolean }

interface Task {
  id: string;
  domain: string;
  gate: "A" | "B" | "C" | "D" | "E" | "F";
  question: string;
  subText?: string;
  displayExpr?: string;
  choices: Choice[];
}

const TASKS: Task[] = [
  {
    id: "M001", domain: "Counting & Number Sense", gate: "A",
    question: "Count the dots carefully. How many are there?",
    displayExpr: "●  ●  ●  ●  ●  ●  ●",
    choices: [
      { label: "6", value: "6", correct: false },
      { label: "7", value: "7", correct: true },
      { label: "8", value: "8", correct: false },
      { label: "5", value: "5", correct: false },
    ],
  },
  {
    id: "M004", domain: "Addition — Mental Strategy", gate: "A",
    question: "Work this out in your head.",
    displayExpr: "47 + 38 = ?",
    choices: [
      { label: "75", value: "75", correct: false },
      { label: "85", value: "85", correct: true },
      { label: "80", value: "80", correct: false },
      { label: "95", value: "95", correct: false },
    ],
  },
  {
    id: "M005", domain: "Subtraction — Mental Strategy", gate: "B",
    question: "Work this out in your head.",
    displayExpr: "63 − 27 = ?",
    choices: [
      { label: "36", value: "36", correct: true },
      { label: "46", value: "46", correct: false },
      { label: "34", value: "34", correct: false },
      { label: "44", value: "44", correct: false },
    ],
  },
  {
    id: "M006", domain: "Multiplication — Equal Groups", gate: "B",
    question: "There are 6 bags with 8 apples in each bag. How many apples altogether?",
    subText: "This is an important question — take your time!",
    choices: [
      { label: "42", value: "42", correct: false },
      { label: "48", value: "48", correct: true },
      { label: "54", value: "54", correct: false },
      { label: "40", value: "40", correct: false },
    ],
  },
  {
    id: "M007", domain: "Flexible Decomposition", gate: "C",
    question: "Which shows 253 broken into parts correctly?",
    choices: [
      { label: "200 + 50 + 3", value: "200+50+3", correct: true },
      { label: "200 + 5 + 3", value: "200+5+3", correct: false },
      { label: "20 + 50 + 3", value: "20+50+3", correct: false },
      { label: "250 + 30", value: "250+30", correct: false },
    ],
  },
  {
    id: "M008", domain: "Fractions — Unit Interpretation", gate: "C",
    question: "A pizza is cut into 4 equal slices. Ruby eats 3 slices. What fraction did she eat?",
    choices: [
      { label: "3/4", value: "3/4", correct: true },
      { label: "1/4", value: "1/4", correct: false },
      { label: "4/3", value: "4/3", correct: false },
      { label: "3/3", value: "3/3", correct: false },
    ],
  },
  {
    id: "M009", domain: "Ratio & Proportion", gate: "D",
    question: "A recipe uses 2 cups of flour for every 3 cups of milk. For 6 cups of milk, how many cups of flour are needed?",
    choices: [
      { label: "4 cups", value: "4", correct: true },
      { label: "3 cups", value: "3", correct: false },
      { label: "6 cups", value: "6", correct: false },
      { label: "2 cups", value: "2", correct: false },
    ],
  },
  {
    id: "M010", domain: "Integer Operations & BODMAS", gate: "D",
    question: "Calculate (remember the order of operations):",
    displayExpr: "3 + 4 × 2 = ?",
    choices: [
      { label: "11", value: "11", correct: true },
      { label: "14", value: "14", correct: false },
      { label: "24", value: "24", correct: false },
      { label: "10", value: "10", correct: false },
    ],
  },
  {
    id: "M011", domain: "Algebraic Expressions", gate: "E",
    question: "Simplify by collecting like terms:",
    displayExpr: "3x + 5 + 2x − 3",
    choices: [
      { label: "5x + 2", value: "5x+2", correct: true },
      { label: "5x + 8", value: "5x+8", correct: false },
      { label: "10x + 2", value: "10x+2", correct: false },
      { label: "5x − 2", value: "5x-2", correct: false },
    ],
  },
  {
    id: "M012", domain: "Linear Equations", gate: "E",
    question: "Solve for x:",
    displayExpr: "2x + 3 = 11",
    choices: [
      { label: "x = 4", value: "4", correct: true },
      { label: "x = 7", value: "7", correct: false },
      { label: "x = 3", value: "3", correct: false },
      { label: "x = 5", value: "5", correct: false },
    ],
  },
  {
    id: "M013", domain: "Quadratic Factorisation", gate: "F",
    question: "Factorise:",
    displayExpr: "x² + 7x + 12",
    choices: [
      { label: "(x + 3)(x + 4)", value: "(x+3)(x+4)", correct: true },
      { label: "(x + 2)(x + 6)", value: "(x+2)(x+6)", correct: false },
      { label: "(x + 1)(x + 12)", value: "(x+1)(x+12)", correct: false },
      { label: "(x + 6)(x + 7)", value: "(x+6)(x+7)", correct: false },
    ],
  },
  {
    id: "M014", domain: "Functions — Key Features", gate: "F",
    question: "For the function y = 3x − 5, what is the y-intercept?",
    choices: [
      { label: "−5", value: "-5", correct: true },
      { label: "3", value: "3", correct: false },
      { label: "5", value: "5", correct: false },
      { label: "−3", value: "-3", correct: false },
    ],
  },
];

// ── Gate → entry level mapping ─────────────────────────────────────────────────
// Returns the entry skill level based on which gates were passed
function computePlacement(results: MathsPlacementTaskResult[]): {
  entryLevel: number;
  entrySkillId: string;
  hardGatePassed: boolean;
  autoCompletedSkillIds: string[];
} {
  const scoreMap: Record<string, boolean> = {};
  for (const r of results) {
    scoreMap[r.domain] = r.score === 1;
  }

  const hardGatePassed = !!scoreMap["M006"];

  // Gate pass conditions (domain score = 1 means correct)
  const gateA = (scoreMap["M001"] ?? false) && (scoreMap["M004"] ?? false);
  const gateB = (scoreMap["M005"] ?? false) && hardGatePassed;
  const gateC = (scoreMap["M007"] ?? false) && (scoreMap["M008"] ?? false);
  const gateD = (scoreMap["M009"] ?? false) && (scoreMap["M010"] ?? false);
  const gateE = (scoreMap["M011"] ?? false) && (scoreMap["M012"] ?? false);
  const gateF = (scoreMap["M013"] ?? false) && (scoreMap["M014"] ?? false);

  let entryLevel = 1;
  if (gateF) entryLevel = 16;
  else if (gateE) entryLevel = 14;
  else if (gateD) entryLevel = 10;
  else if (gateC) entryLevel = 8;
  else if (gateB) entryLevel = 5;
  else if (gateA) entryLevel = 3;
  else entryLevel = 1;

  // Find actual first skill of entry level (fall back to L{n}.T1.A1)
  const level = getLevelById(entryLevel);
  let entrySkillId = `L${entryLevel}.T1.A1`;
  if (level && level.tiers.length > 0 && level.tiers[0].atomic_skills.length > 0) {
    entrySkillId = level.tiers[0].atomic_skills[0].id;
  }

  const autoCompletedSkillIds = entryLevel > 1 ? getSkillIdsForLevels(entryLevel) : [];

  return { entryLevel, entrySkillId, hardGatePassed, autoCompletedSkillIds };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "welcome" | "task" | "result";

// ── Skill name map ─────────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<number, string> = {
  1: "Counting & Number Sense",
  2: "Addition Strategies",
  3: "Subtraction Strategies",
  4: "Multiplication",
  5: "Flexible Decomposition",
  6: "Multiplicative Reasoning",
  7: "Fractions",
  8: "Ratio & Proportion",
  9: "Integer Operations",
  10: "Algebraic Thinking",
  11: "Extended Ratio",
  12: "Extended Integers",
  13: "Advanced Algebra",
  14: "Linear Equations",
  15: "Quadratics",
  16: "Functions",
  17: "Multi-Step Problems",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function MathsDiagnosticPlacement({
  studentName,
  onComplete,
}: {
  studentName: string;
  onComplete: (result: MathsPlacementResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [taskIndex, setTaskIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<MathsPlacementTaskResult[]>([]);
  const [placementResult, setPlacementResult] = useState<MathsPlacementResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const task = TASKS[taskIndex];
  const progress = (taskIndex / TASKS.length) * 100;

  const advanceTask = useCallback(async (result: MathsPlacementTaskResult) => {
    setSubmitting(true);
    const newCompleted = [...completedTasks, result];
    setCompletedTasks(newCompleted);

    setShowEncouragement(true);
    await new Promise((r) => setTimeout(r, 600));

    if (taskIndex + 1 >= TASKS.length) {
      // Compute placement locally — no API needed
      const { entryLevel, entrySkillId, hardGatePassed, autoCompletedSkillIds } =
        computePlacement(newCompleted);
      const placement: MathsPlacementResult = {
        completedAt: Date.now(),
        tasks: newCompleted,
        entrySkillId,
        entryLevel,
        autoCompletedSkillIds,
        hardGatePassed,
      };
      setPlacementResult(placement);
      setPhase("result");
    } else {
      setSelectedChoice(null);
      setShowEncouragement(false);
      setTaskIndex((i) => i + 1);
    }
    setSubmitting(false);
  }, [completedTasks, taskIndex]);

  const handleChoice = useCallback((choice: Choice) => {
    if (submitting || selectedChoice) return;
    setSelectedChoice(choice.value);
    setTimeout(() => {
      advanceTask({
        domain: task.id,
        score: choice.correct ? 1 : 0,
        response: choice.value,
      });
    }, 450);
  }, [submitting, selectedChoice, task.id, advanceTask]);

  const handleSkip = useCallback(() => {
    if (submitting) return;
    advanceTask({ domain: task.id, score: 0, response: "(skipped)" });
  }, [submitting, task.id, advanceTask]);

  // ── Welcome ───────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto">
            🔢
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hi {studentName}!</h2>
            <p className="text-gray-600 mt-3 leading-relaxed text-sm">
              Before we start, let&apos;s do a short discovery activity so I can find your perfect starting point!
            </p>
            <p className="text-emerald-600 font-medium mt-2 text-sm">No pressure — just do your best 😊</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            {[
              { icon: "🎯", text: "12 questions" },
              { icon: "⏱️", text: "5–8 min" },
              { icon: "🏆", text: "Find your level" },
            ].map(({ icon, text }) => (
              <div key={text} className="bg-emerald-50 rounded-xl p-2">
                <div className="text-xl mb-0.5">{icon}</div>
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase("task")}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            Let&apos;s go! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (phase === "result" && placementResult) {
    const autoCount = placementResult.autoCompletedSkillIds.length;
    const entryLabel = LEVEL_LABEL[placementResult.entryLevel] ?? `Level ${placementResult.entryLevel}`;
    const correctCount = placementResult.tasks.filter((t) => t.score === 1).length;

    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4">
          <div className="bg-white rounded-3xl shadow-md p-6 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Great work, {studentName}!
            </h2>
            <p className="text-gray-500 text-sm">
              You answered {correctCount} of {TASKS.length} questions correctly.
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
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">
                You&apos;re starting at
              </p>
              <p className="text-emerald-800 font-bold text-xl">{entryLabel}</p>
            </div>
            {!placementResult.hardGatePassed && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-left">
                <p className="text-amber-700 text-sm">
                  🔑 We&apos;ll build your multiplication foundations first — it&apos;s the key to all advanced maths!
                </p>
              </div>
            )}
          </div>

          {/* Mini progress map */}
          <div className="bg-white rounded-3xl shadow-md p-5">
            <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-3">
              Your Results
            </h3>
            <div className="space-y-2">
              {placementResult.tasks.map((t) => {
                const taskDef = TASKS.find((td) => td.id === t.domain);
                return (
                  <div key={t.domain} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        t.score === 1 ? "bg-green-400 text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {t.score === 1 ? "✓" : "·"}
                    </div>
                    <span className="text-sm text-gray-600">{taskDef?.domain ?? t.domain}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onComplete(placementResult)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-3xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            Start Learning! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Task screen ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5 text-xs text-gray-400">
          <span className="font-medium">Discovery Activity</span>
          <span>{taskIndex + 1} of {TASKS.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="max-w-md mx-auto space-y-4">
          {/* Gate badge */}
          <div className="flex items-center gap-2">
            <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
              {task.domain}
            </span>
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
              Gate {task.gate}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
            <p className="text-gray-800 text-base font-semibold leading-snug">
              {task.question}
            </p>
            {task.subText && (
              <p className="text-gray-400 text-sm">{task.subText}</p>
            )}

            {/* Expression display */}
            {task.displayExpr && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 text-center">
                <p className="text-3xl sm:text-4xl font-bold text-teal-700 tracking-wide font-mono">
                  {task.displayExpr}
                </p>
              </div>
            )}
          </div>

          {/* Answer card */}
          <div className="bg-white rounded-3xl shadow-md p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {task.choices.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleChoice(c)}
                  disabled={submitting || !!selectedChoice}
                  className={`px-4 py-5 rounded-2xl border-2 text-sm font-bold text-center transition-all active:scale-95 ${
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

            {showEncouragement && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                <p className="text-emerald-700 font-semibold text-sm">
                  {["Keep going! 💪", "Brilliant! ⭐", "You've got this! 🎯", "Fantastic! 🌟", "Amazing! 🏆"][
                    taskIndex % 5
                  ]}
                </p>
              </div>
            )}

            <button
              onClick={handleSkip}
              disabled={submitting}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Skip this question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
