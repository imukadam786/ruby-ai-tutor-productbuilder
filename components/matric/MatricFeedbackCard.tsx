"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Shared AI-feedback card for the past-paper "Ruby coach" panel — used by
// both MatricPastPapers and PrepPapers2026 so the two screens can't drift.
// The card colour, header, and marks badge all reflect the result tier
// (full / partial / zero) instead of always reading as a rose "error" card.

type FeedbackTier = "full" | "partial" | "zero";

// total > 0 guard: a 0-mark question must not register as "full marks".
function tierOf(earned: number | undefined, total: number | undefined): FeedbackTier | null {
  if (earned === undefined || total === undefined) return null;
  if (total > 0 && earned === total) return "full";
  if (earned > 0) return "partial";
  return "zero";
}

const CARD: Record<FeedbackTier, string> = {
  full: "bg-green-50 border-green-200",
  partial: "bg-amber-50 border-amber-200",
  zero: "bg-rose-50 border-rose-100",
};

const DIVIDER: Record<FeedbackTier, string> = {
  full: "border-green-200",
  partial: "border-amber-200",
  zero: "border-rose-100",
};

const BADGE: Record<FeedbackTier, string> = {
  full: "bg-green-100 text-green-700",
  partial: "bg-amber-100 text-amber-700",
  zero: "bg-red-100 text-red-600",
};

const HEADER: Record<FeedbackTier, { icon: string; label: string; color: string }> = {
  full: { icon: "✓", label: "Full marks", color: "text-green-700" },
  partial: { icon: "◐", label: "Partial credit", color: "text-amber-700" },
  zero: { icon: "✗", label: "Not quite", color: "text-rose-600" },
};

function MathMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export interface MatricFeedbackCardProps {
  content: string;
  marksEarned?: number;
  totalMarks?: number;
  /** Model-answer sketch — pass only on the latest message; omitted = no image. */
  modelAnswerImageUrl?: string;
  /** Called with the image URL when the model answer is tapped (opens the expand modal). */
  onExpandImage?: (url: string) => void;
}

export default function MatricFeedbackCard({
  content,
  marksEarned,
  totalMarks,
  modelAnswerImageUrl,
  onExpandImage,
}: MatricFeedbackCardProps) {
  const tier = tierOf(marksEarned, totalMarks);
  const t: FeedbackTier = tier ?? "zero";
  const header = tier ? HEADER[tier] : null;

  return (
    <div className={`border rounded-2xl px-4 py-4 space-y-3 ${CARD[t]}`}>
      {header && (
        <div className={`flex items-center gap-1.5 text-sm font-bold ${header.color}`}>
          <span aria-hidden>{header.icon}</span>
          <span>{header.label}</span>
        </div>
      )}

      <div className="text-sm text-gray-700 leading-relaxed">
        <MathMarkdown content={content} />
      </div>

      {modelAnswerImageUrl && (
        <div className="pt-2 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Model Answer</p>
          <button
            onClick={() => onExpandImage?.(modelAnswerImageUrl)}
            className="relative group block rounded-xl overflow-hidden border border-gray-200 bg-white max-w-[220px]"
            title="Tap to expand"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={modelAnswerImageUrl} alt="Model answer sketch" className="w-full object-contain max-h-28" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full transition-opacity">
                Expand
              </span>
            </div>
          </button>
        </div>
      )}

      {marksEarned !== undefined && totalMarks !== undefined && (
        <div className={`flex items-center gap-2 pt-1 border-t ${DIVIDER[t]}`}>
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${BADGE[t]}`}>
            {marksEarned}/{totalMarks} marks
          </div>
        </div>
      )}
    </div>
  );
}
