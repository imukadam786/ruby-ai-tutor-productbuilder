"use client";

import { useRef, useState } from "react";
import { DiagnosticResult, ErrorType } from "@/types/ruby";
import { useT } from "@/lib/i18n";
import { useTTS } from "@/lib/tts";
import { apiFetch } from "@/lib/fetch";
import { resolveErrorExplanation } from "@/lib/error-explanations";

interface QuestionContext {
  skill_id: string;
  question: string;
  student_answer: string;
  expected_answer: string;
}

interface FeedbackCardProps {
  result: DiagnosticResult;
  onNext: () => void;
  nextLabel?: string;
  grade?: number;
  questionContext?: QuestionContext;
  wasReviewCorrect?: boolean;
  /** Error codes on the question (e.g. ["ERR_MULT_ADD"]) — drive the why/how/example explanation */
  errorSignals?: string[];
}

// Student-facing labels are deliberately plain and warm — no technical wording.
// These only show as a fallback when the precise error-code explanation has no
// authored entry yet; otherwise the explanation's own label is used.
const errorLabels: Record<ErrorType, { label: string; color: string; icon: string }> = {
  correct:                  { label: "Correct!",            color: "green",  icon: "✅" },
  conceptual_gap:           { label: "Let's relearn this",  color: "red",    icon: "🧠" },
  strategy_gap:             { label: "Let's try another way", color: "orange", icon: "🗺️" },
  representation_confusion: { label: "A little mix-up",     color: "purple", icon: "🔄" },
  execution_slip:           { label: "Just a small slip",   color: "yellow", icon: "✏️" },
};

const REFLECTION_OPTIONS = [
  { id: "didn't understand",  label: "I didn't understand the question" },
  { id: "got lost partway",   label: "I got partway through but got lost" },
  { id: "calculation mistake",label: "I knew what to do but made a mistake" },
  { id: "guessed",            label: "I guessed" },
] as const;

type ReflectionId = typeof REFLECTION_OPTIONS[number]["id"];

// Grades 1–3: skip reflection, respond immediately
const REFLECTION_MIN_GRADE = 4;

export default function FeedbackCard({
  result,
  onNext,
  nextLabel,
  grade = 1,
  questionContext,
  nextLabel: _nextLabel,
  wasReviewCorrect = false,
  errorSignals,
}: FeedbackCardProps) {
  const { language } = useT();
  const errorInfo = errorLabels[result.error_type];
  const isCorrect = result.is_correct;
  const touchStartY = useRef(0);
  const { playing, speak, stop } = useTTS();

  const isFirstCorrect = isCorrect && typeof window !== "undefined" && !sessionStorage.getItem("first_correct_shown");
  if (isFirstCorrect && typeof window !== "undefined") sessionStorage.setItem("first_correct_shown", "1");

  // Reflection state — only used on first wrong answer for grade ≥ REFLECTION_MIN_GRADE
  const showReflection =
    !isCorrect && grade >= REFLECTION_MIN_GRADE && result.mastery_update.attempt_count <= 1;

  const [reflectionPhase, setReflectionPhase] = useState<
    "prompt" | "loading" | "reteaching" | "slip"
  >(showReflection ? "prompt" : "reteaching");

  const [reteachingText, setReteachingText] = useState<string>(
    result.recovery_explanation
  );
  const [, setReflectionLoading] = useState(false);

  async function handleReflectionChoice(choice: ReflectionId) {
    // Execution slip: student knows the method, just made a mistake — no LLM needed
    if (choice === "calculation mistake") {
      setReflectionPhase("slip");
      return;
    }

    setReflectionLoading(true);
    setReflectionPhase("loading");

    try {
      const res = await apiFetch("/api/ruby/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_id: questionContext?.skill_id ?? "",
          question: questionContext?.question ?? "",
          student_answer: questionContext?.student_answer ?? "",
          expected_answer: questionContext?.expected_answer ?? "",
          reflection_choice: choice,
          language,
        }),
      });
      const data = await res.json();
      setReteachingText(data.reteaching ?? result.recovery_explanation);
    } catch {
      // Fallback to pre-authored recovery strategy
      setReteachingText(result.recovery_explanation);
    } finally {
      setReflectionLoading(false);
      setReflectionPhase("reteaching");
    }
  }

  // ── Correct answer ─────────────────────────────────────────────────────────
  if (isCorrect) {
    return (
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-green-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{errorInfo.icon}</span>
            <p className="font-bold text-lg text-green-800">Correct!</p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="text-yellow-400 text-xl animate-bounce"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>
        <div className="px-6 py-5 space-y-2">
          <p className="text-gray-800 leading-relaxed">{result.feedback}</p>
          {isFirstCorrect && (
            <p className="text-sm font-semibold text-green-700 animate-pulse">Great start! ⭐</p>
          )}
          {wasReviewCorrect && (
            <p className="text-sm font-semibold text-blue-700">You still remember this! 🧠</p>
          )}
        </div>
        <div
          className="px-6 pb-6 pt-2 flex flex-col items-center gap-1 cursor-pointer select-none"
          onClick={onNext}
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => {
            if (touchStartY.current - e.changedTouches[0].clientY > 40) onNext();
          }}
        >
          <p className="text-xs text-gray-400 md:hidden">Swipe up for next question</p>
          <p className="text-xs text-gray-400 hidden md:block">Click for next question</p>
          <div className="animate-bounce text-green-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // ── Wrong answer — reflection prompt (Grade 4+, first attempt) ─────────────
  if (reflectionPhase === "prompt") {
    return (
      <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 overflow-hidden">
        <div className="px-6 py-4 bg-orange-100 flex items-center gap-3">
          <span className="text-2xl">🤔</span>
          <div>
            <p className="font-bold text-lg text-orange-800">Not quite</p>
            <p className="text-sm text-orange-600">What happened?</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-3">
          {REFLECTION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleReflectionChoice(opt.id)}
              className="w-full text-left px-4 py-3 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 hover:border-orange-400 text-gray-800 text-sm font-medium transition-all active:scale-95"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Loading — waiting for LLM re-teaching ──────────────────────────────────
  if (reflectionPhase === "loading") {
    return (
      <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 overflow-hidden">
        <div className="px-6 py-4 bg-orange-100 flex items-center gap-3">
          <span className="text-2xl">🤔</span>
          <p className="font-bold text-lg text-orange-800">Not quite</p>
        </div>
        <div className="px-6 py-10 flex flex-col items-center gap-3 text-orange-500">
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Ruby is thinking…</p>
        </div>
      </div>
    );
  }

  // ── Slip — calculation mistake, no LLM needed ──────────────────────────────
  if (reflectionPhase === "slip") {
    return (
      <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 overflow-hidden">
        <div className="px-6 py-4 bg-yellow-100 flex items-center gap-3">
          <span className="text-2xl">✏️</span>
          <div>
            <p className="font-bold text-lg text-yellow-800">Nearly there</p>
            <p className="text-sm text-yellow-600">Just a small slip</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-gray-800 leading-relaxed">
            Good, you know the method. Go back through your working carefully and check each step. Small errors are easy to fix once you spot them.
          </p>
        </div>
        <div
          className="px-6 pb-6 pt-2 flex flex-col items-center gap-1 cursor-pointer select-none"
          onClick={onNext}
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => {
            if (touchStartY.current - e.changedTouches[0].clientY > 40) onNext();
          }}
        >
          <p className="text-xs text-gray-400 md:hidden">Swipe up to try again</p>
          <p className="text-xs text-gray-400 hidden md:block">Click to try again</p>
          <div className="animate-bounce text-blue-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // ── Wrong answer — five-part explanation (What / Why / How / Example / Where)
  // why / how / example come from the authored error-code map (zero AI cost).
  // The repeated-wrong LLM re-teaching, when present, enriches the "How" section.
  const explanation = resolveErrorExplanation(errorSignals);
  const studentAnswer = questionContext?.student_answer?.trim();
  const expectedAnswer = questionContext?.expected_answer?.trim();
  const showWhat =
    !!studentAnswer && !!expectedAnswer && studentAnswer !== expectedAnswer;

  const headerLabel = explanation?.label ?? errorInfo.label;
  const whyText = explanation?.why || result.feedback;
  const howText = reteachingText || explanation?.how || result.recovery_explanation;
  const exampleText = explanation?.example;

  const feedbackText = [whyText, howText, exampleText].filter(Boolean).join(". ");

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-orange-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{errorInfo.icon}</span>
          <div>
            <p className="font-bold text-lg text-orange-800">Not quite</p>
            <p className="text-sm text-orange-700">{headerLabel}</p>
          </div>
        </div>
        <button
          onClick={() => playing ? stop() : speak(feedbackText)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-medium transition-colors"
          aria-label={playing ? "Stop audio" : "Play explanation"}
        >
          {playing ? (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </>
          )}
        </button>
      </div>

      {/* Five-part explanation */}
      <div className="px-6 py-5 space-y-4">
        {/* WHAT — their answer vs the correct one */}
        {showWhat && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="text-gray-700">
              You answered <span className="font-semibold text-orange-700">{studentAnswer}</span>
            </span>
            <span className="text-gray-700">
              The answer is <span className="font-semibold text-green-700">{expectedAnswer}</span>
            </span>
          </div>
        )}

        {/* WHY — the misconception */}
        {whyText && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Why this happens</p>
            <p className="text-gray-800 leading-relaxed">{whyText}</p>
          </div>
        )}

        {/* HOW — the fix */}
        {howText && (
          <div className={`bg-white border border-${errorInfo.color}-200 rounded-xl p-4`}>
            <p className="text-sm font-medium text-gray-600 mb-1">How to fix it</p>
            <p className="text-gray-800 text-sm leading-relaxed">{howText}</p>
          </div>
        )}

        {/* EXAMPLE — the layman's example */}
        {exampleText && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-700 mb-1">💡 Think of it like this</p>
            <p className="text-gray-800 text-sm leading-relaxed">{exampleText}</p>
          </div>
        )}

        {/* WHERE — what to do next */}
        {result.next_action === "review_prerequisite" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm font-medium">
              This is a tricky one! Let's revisit an earlier skill to build a stronger foundation.
            </p>
          </div>
        )}
      </div>

      {/* Next */}
      <div
        className="px-6 pb-6 pt-2 flex flex-col items-center gap-1 cursor-pointer select-none"
        onClick={onNext}
        onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          if (touchStartY.current - e.changedTouches[0].clientY > 40) onNext();
        }}
      >
        <p className="text-xs text-gray-400 md:hidden">Swipe up for next question</p>
        <p className="text-xs text-gray-400 hidden md:block">Click for next question</p>
        <div className="animate-bounce text-blue-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
