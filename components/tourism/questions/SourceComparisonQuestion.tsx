"use client";

// SourceComparisonQuestion — grid UI with two sources at top, statements down
// the left, 4 tap buttons per row (A only / B only / Both / Neither).
//
// On phones, the source headers stack above each statement row group so
// learners can see what they're choosing about. Statement rows themselves
// stack vertically with the 4 buttons in a 2×2 grid below each statement.
// On desktop, the layout becomes a true matrix.

import { useState } from "react";
import type {
  TourismComparisonAnswer,
  TourismComparisonSource,
  TourismComparisonStatement,
  TourismProvenance,
} from "@/types/tourism";

interface Props {
  sourceA: TourismComparisonSource;
  sourceB: TourismComparisonSource;
  statements: TourismComparisonStatement[];
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

const ANSWERS: { id: TourismComparisonAnswer; label: string }[] = [
  { id: "a_only",   label: "A only" },
  { id: "b_only",   label: "B only" },
  { id: "both",     label: "Both" },
  { id: "neither",  label: "Neither" },
];

function ProvenanceLine({ provenance }: { provenance?: TourismProvenance }) {
  if (!provenance) return null;
  const parts = [provenance.author, provenance.date, provenance.origin]
    .filter((p): p is string => !!p && p.length > 0);
  if (parts.length === 0 && !provenance.type) return null;
  return (
    <p className="text-[10px] uppercase tracking-wide text-gray-500 mt-1">
      {provenance.type === "primary" ? "Primary" : provenance.type === "secondary" ? "Secondary" : ""}
      {provenance.type && parts.length > 0 ? " · " : ""}
      <span className="normal-case italic">{parts.join(" · ")}</span>
    </p>
  );
}

function SourceCard({ letter, source }: { letter: "A" | "B"; source: TourismComparisonSource }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
      <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full mb-2">
        Source {letter}
      </span>
      <div className="max-h-40 overflow-y-auto pr-1 text-sm text-[#1a2744] leading-relaxed whitespace-pre-line">
        {source.text}
      </div>
      <ProvenanceLine provenance={source.provenance} />
    </div>
  );
}

export default function SourceComparisonQuestion({
  sourceA,
  sourceB,
  statements,
  submitting,
  onSubmit,
}: Props) {
  const [picks, setPicks] = useState<Record<string, TourismComparisonAnswer>>({});
  const allPicked = statements.every((s) => picks[s.id]);

  function pick(stmtId: string, ans: TourismComparisonAnswer) {
    setPicks((prev) => ({ ...prev, [stmtId]: ans }));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sticky top-0 z-10 bg-[#F4F4F5] pb-2">
        <SourceCard letter="A" source={sourceA} />
        <SourceCard letter="B" source={sourceB} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        For each statement, tap the source(s) it applies to.
      </p>

      <div className="space-y-3">
        {statements.map((stmt) => {
          const picked = picks[stmt.id];
          return (
            <div key={stmt.id} className="rounded-2xl border border-gray-200 bg-white p-3 space-y-2">
              <p className="text-sm sm:text-base text-[#1a2744] font-medium leading-snug">
                {stmt.text}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ANSWERS.map((a) => {
                  const on = picked === a.id;
                  return (
                    <button
                      key={a.id}
                      disabled={submitting}
                      onClick={() => pick(stmt.id, a.id)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        on
                          ? "bg-sky-100 border-sky-400 text-sky-950"
                          : "bg-white border-gray-300 text-[#1a2744] hover:border-sky-300"
                      }`}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onSubmit(JSON.stringify(picks))}
        disabled={submitting || !allPicked}
        className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-base"
      >
        {allPicked
          ? "Check answer"
          : `Pick ${statements.length - Object.keys(picks).length} more`}
      </button>
    </div>
  );
}
