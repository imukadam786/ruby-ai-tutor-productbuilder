"use client";

import { DiagnosticResult, ErrorType } from "@/types/ruby";

interface FeedbackCardProps {
  result: DiagnosticResult;
  onNext: () => void;
  nextLabel: string;
}

const errorLabels: Record<ErrorType, { label: string; color: string; icon: string }> = {
  correct: { label: "Correct!", color: "green", icon: "✅" },
  conceptual_gap: { label: "Conceptual Gap", color: "red", icon: "🧠" },
  strategy_gap: { label: "Strategy Gap", color: "orange", icon: "🗺️" },
  representation_confusion: { label: "Representation Confusion", color: "purple", icon: "🔄" },
  execution_slip: { label: "Execution Slip", color: "yellow", icon: "✏️" },
};

export default function FeedbackCard({ result, onNext, nextLabel }: FeedbackCardProps) {
  const errorInfo = errorLabels[result.error_type];
  const isCorrect = result.is_correct;

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
          <p className="text-sm font-medium text-gray-600 mb-1">Feedback</p>
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

      {/* Next button */}
      <div className="px-6 pb-6">
        <button
          onClick={onNext}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            isCorrect
              ? "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20"
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20"
          }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
