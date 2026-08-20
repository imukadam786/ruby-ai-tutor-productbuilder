"use client";

// ParagraphTemplateQuestion — learner builds a 2–3 sentence answer through
// sequential tap-choices (Point → Evidence → Explanation).
//
// Layout:
//   • Mobile (<768px): one slot per screen. Tapping a choice advances to the
//     next slot. A "Back" link lets the learner revise the previous slot.
//   • Desktop (≥768px): all slots stacked, each revealed once the previous
//     one is picked.
//   • After all slots are filled the learner sees the assembled paragraph
//     before submitting.

import { useState } from "react";
import type { HistoryParagraphSlot } from "@/types/history";

interface Props {
  prompt: string;
  template: HistoryParagraphSlot[];
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

const SLOT_LABEL: Record<string, string> = {
  point: "Point",
  evidence: "Evidence",
  explanation: "Explanation",
};

export default function ParagraphTemplateQuestion({
  prompt,
  template,
  submitting,
  onSubmit,
}: Props) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [activeIdx, setActiveIdx] = useState(0);

  const filledCount = template.filter((s) => picks[s.slot]).length;
  const allFilled = filledCount === template.length;

  function pick(slotKey: string, optionId: string, idx: number) {
    setPicks((prev) => ({ ...prev, [slotKey]: optionId }));
    if (idx < template.length - 1) setActiveIdx(idx + 1);
  }

  function back(idx: number) {
    if (idx > 0) setActiveIdx(idx - 1);
  }

  function submit() {
    onSubmit(JSON.stringify(picks));
  }

  function assembledParagraph(): string {
    return template
      .map((s) => s.options.find((o) => o.id === picks[s.slot])?.text ?? "")
      .filter((t) => t.length > 0)
      .join(" ");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-700 mb-1">
          Prompt
        </p>
        <p className="text-base text-indigo-950 font-medium leading-snug">{prompt}</p>
        <p className="text-xs text-indigo-700 mt-2">
          Build your answer step by step. {filledCount} of {template.length} slots picked.
        </p>
      </div>

      {/* Mobile: one slot at a time */}
      <div className="md:hidden">
        {(() => {
          const slot = template[activeIdx];
          if (!slot) return null;
          const picked = picks[slot.slot];
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#1a2744]">
                  Step {activeIdx + 1} of {template.length}: {SLOT_LABEL[slot.slot] ?? slot.slot}
                </p>
                {activeIdx > 0 && (
                  <button
                    onClick={() => back(activeIdx)}
                    disabled={submitting}
                    className="text-xs text-gray-500 underline underline-offset-2"
                  >
                    ← Back
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600">{slot.label}</p>
              <div className="grid grid-cols-1 gap-2">
                {slot.options.map((opt) => {
                  const on = picked === opt.id;
                  return (
                    <button
                      key={opt.id}
                      disabled={submitting}
                      onClick={() => pick(slot.slot, opt.id, activeIdx)}
                      className={`min-h-[60px] text-left px-4 py-3 rounded-2xl border-2 text-sm leading-snug transition-all ${
                        on
                          ? "bg-indigo-100 border-indigo-400 text-indigo-950 font-semibold"
                          : "bg-white border-gray-300 text-[#1a2744] hover:border-indigo-300"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Desktop: stacked slots */}
      <div className="hidden md:block space-y-4">
        {template.map((slot, idx) => {
          const picked = picks[slot.slot];
          const unlocked = idx === 0 || picks[template[idx - 1].slot];
          if (!unlocked) {
            return (
              <div
                key={slot.slot}
                className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-400 italic"
              >
                {SLOT_LABEL[slot.slot] ?? slot.slot} — pick the previous slot first
              </div>
            );
          }
          return (
            <div key={slot.slot} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
              <p className="text-sm font-bold text-[#1a2744]">
                {SLOT_LABEL[slot.slot] ?? slot.slot}
              </p>
              <p className="text-xs text-gray-500">{slot.label}</p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {slot.options.map((opt) => {
                  const on = picked === opt.id;
                  return (
                    <button
                      key={opt.id}
                      disabled={submitting}
                      onClick={() => pick(slot.slot, opt.id, idx)}
                      className={`min-h-[56px] text-left px-4 py-3 rounded-xl border-2 text-sm leading-snug transition-all ${
                        on
                          ? "bg-indigo-100 border-indigo-400 text-indigo-950 font-semibold"
                          : "bg-white border-gray-300 text-[#1a2744] hover:border-indigo-300"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {allFilled && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 mb-1">
            Your assembled answer
          </p>
          <p className="text-sm text-emerald-950 leading-relaxed">{assembledParagraph()}</p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting || !allFilled}
        className="w-full py-4 rounded-full bg-brand hover:bg-brand-hover disabled:bg-gray-300 text-white font-bold text-base"
      >
        {allFilled ? "Check answer" : `Pick ${template.length - filledCount} more`}
      </button>
    </div>
  );
}
