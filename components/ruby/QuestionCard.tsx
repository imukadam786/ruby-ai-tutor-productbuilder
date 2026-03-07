"use client";

import { useState } from "react";
import { GeneratedQuestion, QuestionTemplate } from "@/types/ruby";

interface QuestionCardProps {
  question: GeneratedQuestion;
  onSubmit: (answer: string, steps: string, usedHint: boolean) => void;
  isSubmitting: boolean;
}

const templateLabels: Record<QuestionTemplate, { label: string; icon: string; color: string }> = {
  concrete: { label: "Visual", icon: "🧱", color: "blue" },
  story: { label: "Word Problem", icon: "📖", color: "purple" },
  symbolic: { label: "Symbolic", icon: "🔢", color: "orange" },
};

export default function QuestionCard({ question, onSubmit, isSubmitting }: QuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const [steps, setSteps] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  const templateInfo = templateLabels[question.template];

  const handleShowHint = () => {
    setHintVisible(true);
    setUsedHint(true);
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer, steps, usedHint);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Template badge */}
      <div className={`px-5 py-3 flex items-center gap-2 border-b border-gray-100 bg-${templateInfo.color}-50`}>
        <span>{templateInfo.icon}</span>
        <span className={`text-${templateInfo.color}-700 text-sm font-medium`}>
          {templateInfo.label}
        </span>
      </div>

      {/* Question */}
      <div className="px-6 py-6">
        <p className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap">
          {question.question}
        </p>
      </div>

      {/* Hint */}
      {question.hint && (
        <div className="px-6 pb-4">
          {!hintVisible ? (
            <button
              onClick={handleShowHint}
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303-5.304" />
              </svg>
              Show hint
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-yellow-800 text-sm">
                <span className="font-medium">Hint: </span>{question.hint}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Answer inputs */}
      <div className="px-6 pb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your Answer
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Write your answer here..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Show your working{" "}
            <span className="text-gray-400 font-normal">(optional but encouraged)</span>
          </label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="Write out the steps you used to solve this..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all resize-none"
            disabled={isSubmitting}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Checking...
            </>
          ) : (
            "Submit Answer"
          )}
        </button>
      </div>
    </div>
  );
}
