"use client";

// ArgumentBuilderQuestion — given a thesis, learner taps exactly N pieces of
// evidence from a pool of ~6 (strong, weak, red-herring and counter-evidence).
//
// UX:
//   • Pool scrolls within its own container; thesis stays visible on phones.
//   • Selection capped at `pick_n` — once full, other items dim until something
//     is removed.
//   • Submit reveals strength labels per pool item (server returns memo;
//     the renderer shows the labels as soon as the answer is submitted via
//     the parent's feedback view).

import { useState } from "react";
import type { TourismEvidence } from "@/types/tourism";

interface Props {
  thesis: string;
  pool: TourismEvidence[];
  pickN: number;
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

export default function ArgumentBuilderQuestion({
  thesis,
  pool,
  pickN,
  submitting,
  onSubmit,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const full = selected.length >= pickN;

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= pickN) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700 mb-1">
          Thesis
        </p>
        <p className="text-base text-rose-950 font-medium leading-snug">{thesis}</p>
        <p className="text-xs text-rose-700 mt-2">
          Pick the {pickN} strongest pieces of evidence for this thesis.
          {" "}Selected {selected.length} of {pickN}.
        </p>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {pool.map((ev) => {
          const on = selected.includes(ev.id);
          const dim = !on && full;
          return (
            <button
              key={ev.id}
              disabled={submitting || dim}
              onClick={() => toggle(ev.id)}
              className={`w-full min-h-[60px] text-left px-4 py-3 rounded-2xl border-2 transition-all ${
                on
                  ? "bg-rose-100 border-rose-400 ring-2 ring-rose-200"
                  : dim
                  ? "bg-gray-50 border-gray-200 opacity-50"
                  : "bg-white border-gray-300 hover:border-rose-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    on ? "bg-rose-500 border-rose-500 text-white" : "border-gray-400 text-gray-400"
                  }`}
                  aria-hidden
                >
                  {on ? "✓" : ""}
                </span>
                <span className="flex-1 text-sm sm:text-base text-[#1a2744] leading-snug">
                  {ev.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSubmit(JSON.stringify(selected))}
        disabled={submitting || selected.length !== pickN}
        className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-base"
      >
        {selected.length === pickN
          ? "Check answer"
          : `Pick ${pickN - selected.length} more`}
      </button>
    </div>
  );
}
