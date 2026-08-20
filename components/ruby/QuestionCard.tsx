"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GeneratedQuestion, GraduatedHint, QuestionTemplate } from "@/types/ruby";
import { DotArray, parseDotArray } from "./DotArray";
import SignToggle from "@/components/ui/SignToggle";
import { CONCEPT_C } from "@/lib/flags";

interface QuestionCardProps {
  question: GeneratedQuestion;
  onSubmit: (answer: string, steps: string, usedHint: boolean, workingImage?: string) => void;
  isSubmitting: boolean;
  forceHint?: boolean;
  /** Skill/topic name shown as a pill — matches the Discovery activity's badge. */
  topicLabel?: string;
  /** Optional content rendered on the right of the topic-badge row (e.g. mastery dots). */
  badgeRight?: ReactNode;
}

const templateLabels: Record<QuestionTemplate, { label: string; icon: string; color: string }> = {
  concrete: { label: "Visual", icon: "🧱", color: "blue" },
  story: { label: "Word Problem", icon: "📖", color: "purple" },
  symbolic: { label: "Symbolic", icon: "🔢", color: "orange" },
};

export default function QuestionCard({ question, onSubmit, isSubmitting, forceHint = false, topicLabel, badgeRight }: QuestionCardProps) {
  const isMultiField = Array.isArray(question.labels) && question.labels.length > 0;
  const [answer, setAnswer] = useState("");
  const [fieldValues, setFieldValues] = useState<string[]>(
    question.labels ? question.labels.map(() => "") : []
  );
  // hintLevel: 0 = not shown, 1 = nudge, 2 = process, 3 = worked (deepest)
  const [hintLevel, setHintLevel] = useState(forceHint ? 3 : 0);
  const [usedHint, setUsedHint] = useState(forceHint);
  const [workingImage, setWorkingImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAnswer("");
    setFieldValues(question.labels ? question.labels.map(() => "") : []);
    setHintLevel(forceHint ? 3 : 0);
    setUsedHint(forceHint);
    if (!isMultiField && window.matchMedia("(pointer: fine)").matches) {
      answerInputRef.current?.focus();
    }
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const templateInfo = templateLabels[question.template];

  // "Count the dots" (M001) questions carry the dot count in the bank item's
  // context — render real dots matching the Discovery activity, not text bullets.
  const dotContext = typeof question.bank_question?.context === "string"
    ? (question.bank_question.context as string)
    : null;
  const dotCount = parseDotArray(dotContext);

  const handleShowHint = () => {
    setHintLevel((prev) => Math.min(prev + 1, 3));
    setUsedHint(true);
  };

  // Derive the graduated hints — prefer question.hints, fall back to legacy question.hint at level 3
  const graduatedHints: GraduatedHint | undefined = question.hints ?? (
    question.hint ? { nudge: question.hint, process: question.hint, worked: question.hint } : undefined
  );

  const MAX_HINT_LEVEL = graduatedHints ? 3 : 0;
  const hintLabels = ["Need a hint?", "A bit more help", "Show me the first step"];
  const hintTexts = graduatedHints
    ? [graduatedHints.nudge, graduatedHints.process, graduatedHints.worked]
    : [];

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setWorkingImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (isMultiField) {
      if (!fieldValues.every((v) => v.trim())) return;
      onSubmit(fieldValues.join(","), "", usedHint, workingImage);
    } else {
      if (!answer.trim()) return;
      onSubmit(answer, "", usedHint, workingImage);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${CONCEPT_C ? "" : "shadow-xl shadow-blue-500/10"}`}>
      {/* Ruby brand accent strip — gives the card a clear "top" edge so it
          lifts off the patterned background. */}
      <div className="h-1.5 bg-gradient-to-r from-brand-alt via-[#D6562E] to-[#E8B341]" />

      {/* Topic badge — same blue pill style as the Discovery activity */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${CONCEPT_C ? "bg-ruby-soft text-ruby" : "bg-blue-100 text-blue-700"}`}>
          {topicLabel ?? templateInfo.label}
        </span>
        {badgeRight}
      </div>

      {/* Question */}
      <div className="px-6 py-6 space-y-4">
        {dotCount !== null && <DotArray count={dotCount} />}
        <p className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap">
          {question.question}
        </p>
      </div>

      {/* Graduated hints */}
      {MAX_HINT_LEVEL > 0 && (
        <div className="px-6 pb-4 space-y-2">
          {/* Show revealed hint levels */}
          {hintLevel > 0 && hintTexts.slice(0, hintLevel).map((text, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 border ${
                i === 0 ? "bg-yellow-50 border-yellow-200" :
                i === 1 ? "bg-orange-50 border-orange-200" :
                          "bg-blue-50 border-blue-200"
              }`}
            >
              <p className={`text-sm ${
                i === 0 ? "text-yellow-800" :
                i === 1 ? "text-orange-800" :
                          "text-blue-800"
              }`}>
                <span className="font-medium">
                  {i === 0 ? "Hint: " : i === 1 ? "More help: " : "First step: "}
                </span>
                {text}
              </p>
            </div>
          ))}

          {/* Button to reveal the next level */}
          {hintLevel < MAX_HINT_LEVEL && (
            <button
              onClick={handleShowHint}
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1.5 transition-colors mt-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303-5.304" />
              </svg>
              {hintLabels[hintLevel]}
            </button>
          )}
        </div>
      )}

      {/* Answer inputs */}
      <div className="px-6 pb-6 space-y-4">
        {isMultiField ? (
          <div className="space-y-3">
            {question.labels!.map((label, i) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {label}
                </label>
                <div className="flex items-stretch gap-2">
                  <SignToggle
                    value={fieldValues[i] ?? ""}
                    onChange={(v) => {
                      const next = [...fieldValues];
                      next[i] = v;
                      setFieldValues(next);
                    }}
                    disabled={isSubmitting}
                    className="rounded-xl px-3.5 text-base"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fieldValues[i] ?? ""}
                    onChange={(e) => {
                      const next = [...fieldValues];
                      next[i] = e.target.value;
                      setFieldValues(next);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Answer
            </label>
            <input
              ref={answerInputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Write your answer here..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Working upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Show your working{" "}
            <span className="text-gray-500 font-normal">(always encouraged)</span>
          </label>

          {workingImage ? (
            /* Preview */
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
            /* Upload / camera tap area */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors bg-gray-50 hover:bg-blue-50"
            >
              {/* Camera icon */}
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <span className="text-sm font-medium">Upload your working from your book/page</span>
              <span className="text-xs text-gray-300">Tap to open camera or choose a photo</span>
            </button>
          )}

          {/* Hidden file input — capture="environment" opens rear camera on mobile */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageCapture}
            className="hidden"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={(isMultiField ? !fieldValues.every((v) => v.trim()) : !answer.trim()) || isSubmitting}
          className={`w-full text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:cursor-not-allowed ${
            CONCEPT_C
              ? "bg-ruby hover:bg-ruby-deep font-bold shadow-lip active:translate-y-[3px] active:shadow-none"
              : "bg-blue-500 hover:bg-blue-600 font-medium shadow-md shadow-blue-500/20 hover:shadow-blue-500/40"
          }`}
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
