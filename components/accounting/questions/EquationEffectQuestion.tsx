"use client";

// EquationEffectQuestion — tap the effect of a transaction on each element of
// the accounting equation (Assets = Owner's equity + Liabilities).
//
// Tap-only: for each column the learner picks one of three buttons —
// increase (+), decrease (−) or no effect (0). No typed amounts. Submit
// enables once every column has a choice. Payload: { "<colId>": "<effect>" }.

import { useState } from "react";
import type { AccountingEffect, AccountingEquationColumn } from "@/types/accounting";

interface Props {
  columns: AccountingEquationColumn[];
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

const CHOICES: Array<{ value: AccountingEffect; label: string; symbol: string }> = [
  { value: "increase", label: "Increase", symbol: "+" },
  { value: "decrease", label: "Decrease", symbol: "−" },
  { value: "no_effect", label: "No effect", symbol: "0" },
];

const SWATCH: Record<AccountingEffect, { on: string; off: string }> = {
  increase: {
    on: "bg-emerald-100 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300",
    off: "bg-white border-gray-300 text-gray-600 hover:border-emerald-300",
  },
  decrease: {
    on: "bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-300",
    off: "bg-white border-gray-300 text-gray-600 hover:border-rose-300",
  },
  no_effect: {
    on: "bg-gray-200 border-gray-400 text-gray-800 ring-2 ring-gray-300",
    off: "bg-white border-gray-300 text-gray-600 hover:border-gray-400",
  },
};

export default function EquationEffectQuestion({ columns, submitting, onSubmit }: Props) {
  // colId → effect. Missing entry means not chosen yet.
  const [choice, setChoice] = useState<Record<string, AccountingEffect>>({});

  const allChosen = columns.every((c) => choice[c.id]);
  const remaining = columns.filter((c) => !choice[c.id]).length;

  function submit() {
    onSubmit(JSON.stringify(choice));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        For each element, tap how the transaction changes it
      </p>

      <div className="space-y-3">
        {columns.map((col) => (
          <div
            key={col.id}
            className="rounded-2xl border border-gray-200 bg-white p-3 sm:flex sm:items-center sm:justify-between sm:gap-4"
          >
            <p className="text-base font-bold text-[#1a2744] mb-2 sm:mb-0 sm:w-44 shrink-0">
              {col.label}
            </p>
            <div className="grid grid-cols-3 gap-2 flex-1">
              {CHOICES.map((ch) => {
                const selected = choice[col.id] === ch.value;
                const swatch = SWATCH[ch.value];
                return (
                  <button
                    key={ch.value}
                    disabled={submitting}
                    onClick={() => setChoice((prev) => ({ ...prev, [col.id]: ch.value }))}
                    className={`min-h-[56px] rounded-xl border-2 px-2 py-2 flex flex-col items-center justify-center gap-0.5 font-semibold transition-all active:scale-95 ${
                      selected ? swatch.on : swatch.off
                    }`}
                  >
                    <span className="text-xl leading-none">{ch.symbol}</span>
                    <span className="text-xs">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={submitting || !allChosen}
        className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-base"
      >
        {allChosen ? "Check answer" : `Choose ${remaining} more`}
      </button>
    </div>
  );
}
