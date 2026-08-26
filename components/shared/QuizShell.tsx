"use client";

// ─── Shared quiz/practice screen shell ──────────────────────────────────────
//
// This is the presentational shell for every subject's "answering questions"
// screen — the counterpart to SkillTreeShell (which unified the tree screen).
// It owns the chrome around a question: the exit/counter/settings nav, the
// progress bar, topic + mastery-target line, difficulty + time-remaining row,
// the white question card wrapper, and a motivational footer. Each subject
// keeps its own phase state machine, scoring, and answer-input widgets —
// those are passed in as `children` and rendered inside the card.
//
// Rewards (rubies, streak combo, celebration confetti) are NOT duplicated
// here — RubyBalance/ComboIndicator/RubyCelebrations already run globally
// (mounted once in app/page.tsx) and the 5-part feedback card already shows
// a "gem cut!" pill on a correct answer. This shell only adds the RubyBalance
// pill to the local header so the running total stays visible while quizzing.

import { useEffect, useState, type ReactNode } from "react";
import EduBackground from "@/components/EduBackground";
import RubyBalance from "@/components/RubyBalance";
import Button from "@/components/ui/Button";
import { GEM_HEX, type GemColor } from "@/lib/design/gemColors";
import type { SkillTreeAccent } from "@/components/shared/SkillTreeShell";

const LARGE_TEXT_KEY = "ruby_large_text";
// Applied to the document root while a quiz is open, so every rem-based
// Tailwind size (including inside subject-owned children) scales together —
// a wrapper-level `fontSize` would NOT cascade, since Tailwind's text-* /
// p-* utilities are rem (root-relative), not em (parent-relative).
const LARGE_TEXT_PX = "18px";

function difficultyLabel(level: number): { label: string; filled: number } {
  // Normalises any 1–5 (or 1–3) authored scale down to a 3-dot Easy/Med/Hard
  // read, since that's the granularity a learner actually finds useful.
  if (level <= 2) return { label: "Easy", filled: 1 };
  if (level <= 3) return { label: "Medium", filled: 2 };
  return { label: "Hard", filled: 3 };
}

export interface QuizShellProps {
  /** Subject accent — reuses the tree's own accent key so gem colours match. */
  accent: SkillTreeAccent;
  topicTitle: string;
  /** Fires only after the learner confirms the "Leave this quiz?" dialog. */
  onExit: () => void;
  /** 1-based position toward mastery, e.g. 4 of 20. Clamped internally. */
  questionNumber: number;
  totalQuestions: number;
  /** Fraction (0–1) of answers that must be correct to master the topic. */
  masteryTarget?: number;
  /** 1–5 difficulty of the CURRENT question. Omit to hide the indicator. */
  difficulty?: number | null;
  /**
   * Skips the current question without scoring it. Only meaningful while a
   * question is showing — pass undefined (not just omit) during feedback/
   * loading so the button disappears instead of staying clickable.
   */
  onSkip?: () => void;
  /**
   * Renders children without the white question-card wrapper. Pass true while
   * showing feedback, since FeedbackExplanation is already its own coloured
   * card — wrapping it in a second white card just adds a border/margin
   * around it. Leave false (default) for the question phase.
   */
  noCard?: boolean;
  /** The question card contents (question text, diagram, answer input, feedback). */
  children: ReactNode;
}

export default function QuizShell({
  accent,
  topicTitle,
  onExit,
  questionNumber,
  totalQuestions,
  masteryTarget = 0.75,
  difficulty,
  onSkip,
  noCard = false,
  children,
}: QuizShellProps) {
  const gemColor = GEM_HEX[accent as GemColor] ?? GEM_HEX.rose;
  const [confirmExit, setConfirmExit] = useState(false);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    setLargeText(typeof window !== "undefined" && localStorage.getItem(LARGE_TEXT_KEY) === "1");
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? LARGE_TEXT_PX : "";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [largeText]);

  const toggleLargeText = () => {
    const next = !largeText;
    setLargeText(next);
    localStorage.setItem(LARGE_TEXT_KEY, next ? "1" : "0");
  };

  const clamped = Math.min(Math.max(questionNumber, 1), Math.max(totalQuestions, 1));
  const progressPct = totalQuestions > 0 ? Math.round((clamped / totalQuestions) * 100) : 0;
  const remaining = Math.max(0, totalQuestions - clamped + 1);
  const estMinutes = Math.max(1, Math.round((remaining * 30) / 60));
  const masteryPct = Math.round(masteryTarget * 100);
  const diff = difficulty ? difficultyLabel(difficulty) : null;

  return (
    <div className="relative flex flex-col h-full bg-[#F4F4F5]">
      <EduBackground />
      <div className="relative flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-4 pb-12 w-full space-y-4">
          {/* ── Nav: Exit · counter · settings ── */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setConfirmExit(true)}
              className="text-sm text-[#1a2744] font-semibold underline decoration-2 underline-offset-4 flex-shrink-0"
            >
              ← Exit
            </button>
            <span className="text-sm font-semibold text-gray-500 flex-shrink-0">
              Question {clamped} of {totalQuestions}
            </span>
            <div className="relative flex items-center gap-3 flex-shrink-0">
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-sm text-gray-400 hover:text-gray-600 font-semibold transition-colors"
                >
                  Skip
                </button>
              )}
              <span className="hidden sm:inline-flex"><RubyBalance theme="light" /></span>
              <button
                onClick={() => setShowTextMenu((v) => !v)}
                aria-label="Text size"
                aria-expanded={showTextMenu}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors text-sm font-bold"
              >
                Aa
              </button>
              {showTextMenu && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-36">
                  <button
                    onClick={() => { if (largeText) toggleLargeText(); setShowTextMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm ${!largeText ? "font-bold text-[#1a2744]" : "text-gray-500"} hover:bg-gray-50`}
                  >
                    Normal text
                  </button>
                  <button
                    onClick={() => { if (!largeText) toggleLargeText(); setShowTextMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm ${largeText ? "font-bold text-[#1a2744]" : "text-gray-500"} hover:bg-gray-50`}
                  >
                    Large text
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: gemColor }}
            />
          </div>

          {/* ── Topic + mastery target ── */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="font-bold text-[#1a2744] text-base sm:text-lg">{topicTitle}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 whitespace-nowrap">
              ⭐ Mastery Goal: {masteryPct}%
            </span>
          </div>

          {/* ── Difficulty + time remaining ── */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {diff && (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex gap-0.5" aria-hidden>
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: i <= diff.filled ? gemColor : "#E5E7EB" }}
                    />
                  ))}
                </span>
                {diff.label}
              </span>
            )}
            <span>⏱️ About {estMinutes} min left</span>
          </div>

          {/* ── Question card ── */}
          {noCard ? (
            <div className="space-y-5">{children}</div>
          ) : (
            <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">{children}</div>
          )}

          {/* ── Motivational footer ── */}
          <p className="text-center text-sm text-gray-500">
            {remaining <= 1
              ? "Last one — you've got this!"
              : remaining <= 3
              ? `🔥 Almost there — ${remaining} questions left!`
              : `${remaining} questions left on this topic.`}
          </p>
        </div>
      </div>

      {/* ── Exit confirmation ── */}
      {confirmExit && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <p className="text-2xl">🚪</p>
            <p className="font-bold text-lg text-[#1a2744]">Leave this quiz?</p>
            <p className="text-sm text-gray-600">Your progress on this question won&apos;t be saved.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" size="lg" fullWidth onClick={() => setConfirmExit(false)}>
                Keep going
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={onExit}>
                Exit quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
