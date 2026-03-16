"use client";

import { useRef, useState, useCallback } from "react";
import { DiagnosticResult, ErrorType } from "@/types/ruby";
import { useT } from "@/lib/i18n";

// Map language name → BCP-47 code for speechSynthesis
const LANG_CODE: Record<string, string> = {
  English: "en-ZA", Afrikaans: "af-ZA", isiZulu: "zu-ZA", isiXhosa: "xh-ZA",
  Sepedi: "nso-ZA", Setswana: "tn-ZA", Sesotho: "st-ZA", Xitsonga: "ts-ZA",
  siSwati: "ss-ZA", Tshivenda: "ve-ZA", isiNdebele: "nr-ZA",
};

function useTTS(langName: string) {
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = LANG_CODE[langName] ?? "en-ZA";
    utt.rate = 0.92;
    utt.onstart = () => setPlaying(true);
    utt.onend = () => setPlaying(false);
    utt.onerror = () => setPlaying(false);
    utterRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [langName]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }, []);

  return { playing, speak, stop };
}

interface FeedbackCardProps {
  result: DiagnosticResult;
  onNext: () => void;
  nextLabel?: string;
}

const errorLabels: Record<ErrorType, { label: string; color: string; icon: string }> = {
  correct: { label: "Correct!", color: "green", icon: "✅" },
  conceptual_gap: { label: "Conceptual Gap", color: "red", icon: "🧠" },
  strategy_gap: { label: "Strategy Gap", color: "orange", icon: "🗺️" },
  representation_confusion: { label: "Representation Confusion", color: "purple", icon: "🔄" },
  execution_slip: { label: "Execution Slip", color: "yellow", icon: "✏️" },
};

export default function FeedbackCard({ result, onNext }: FeedbackCardProps) {
  const { language } = useT();
  const errorInfo = errorLabels[result.error_type];
  const isCorrect = result.is_correct;
  const touchStartY = useRef(0);
  const feedbackText = [result.feedback, result.recovery_explanation].filter(Boolean).join(". ");
  const { playing, speak, stop } = useTTS(language);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${
      isCorrect ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
    }`}>
      {/* Result header */}
      <div className={`px-6 py-4 flex items-center justify-between ${
        isCorrect ? "bg-green-100" : "bg-orange-100"
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{errorInfo.icon}</span>
          <div>
            <p className={`font-bold text-lg ${isCorrect ? "text-green-800" : "text-orange-800"}`}>
              {isCorrect ? "Correct!" : "Not quite"}
            </p>
            {!isCorrect && (
              <p className={`text-sm text-${errorInfo.color}-700`}>
                {errorInfo.label}
              </p>
            )}
          </div>
        </div>
        {isCorrect && (
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span key={i} className="text-yellow-400 text-xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                ⭐
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="px-6 py-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-600">Feedback</p>
            {!isCorrect && (
              <button
                onClick={() => playing ? stop() : speak(feedbackText)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-medium transition-colors"
                aria-label={playing ? "Stop audio" : "Play explanation"}
              >
                {playing ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Play
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-gray-800 leading-relaxed">{result.feedback}</p>
        </div>

        {!isCorrect && result.recovery_explanation && (
          <div className={`bg-white border border-${errorInfo.color}-200 rounded-xl p-4`}>
            <p className="text-sm font-medium text-gray-600 mb-1">Let's learn from this</p>
            <p className="text-gray-800 text-sm leading-relaxed">{result.recovery_explanation}</p>
          </div>
        )}

        {result.next_action === "review_prerequisite" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm font-medium">
              This is a tricky one! Let's revisit an earlier skill to build a stronger foundation.
            </p>
          </div>
        )}
      </div>

      {/* Click / swipe for next */}
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
        <div className={`animate-bounce ${isCorrect ? "text-green-500" : "text-blue-500"}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
