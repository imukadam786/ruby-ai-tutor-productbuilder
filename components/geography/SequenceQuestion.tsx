"use client";

// SequenceQuestion — order a set of steps. Phone-friendly tap-to-order:
//   • Tap items in the pool in the order you want; each tap appends it to the
//     ordered list below and numbers it.
//   • Tap a placed item to send it back to the pool (later items renumber).
//   • Submit once every item is placed. The payload is a JSON-stringified array
//     of item ids in the chosen order (scored against `expected_order`).
//
// No options array — this mechanic is driven entirely by `items` + the
// learner's chosen order.

import { useMemo, useState } from "react";
import type { GeographyItem } from "@/types/geography";

interface Props {
  items: GeographyItem[];
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

export default function SequenceQuestion({ items, submitting, onSubmit }: Props) {
  // Ordered list of item ids the learner has placed.
  const [order, setOrder] = useState<string[]>([]);

  const byId = useMemo(() => {
    const m: Record<string, GeographyItem> = {};
    for (const it of items) m[it.id] = it;
    return m;
  }, [items]);

  const remaining = useMemo(
    () => items.filter((it) => !order.includes(it.id)),
    [items, order],
  );

  const allPlaced = remaining.length === 0;

  function place(id: string) {
    setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function remove(id: string) {
    setOrder((prev) => prev.filter((x) => x !== id));
  }

  function reset() {
    setOrder([]);
  }

  function submit() {
    onSubmit(JSON.stringify(order));
  }

  return (
    <div className="space-y-4">
      {/* Pool of not-yet-placed steps */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          {remaining.length > 0 ? "Tap the steps in the right order" : "All steps placed — check your answer"}
        </p>
        <div className="flex flex-col gap-2 min-h-[44px]">
          {remaining.length === 0 && (
            <p className="text-sm text-gray-400 italic px-2 py-2">All steps placed below.</p>
          )}
          {remaining.map((it) => (
            <button
              key={it.id}
              disabled={submitting}
              onClick={() => place(it.id)}
              className="min-h-[44px] px-4 py-3 rounded-2xl border-2 border-sky-200 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 text-left text-base font-medium text-[#1a2744] active:scale-[0.99] transition-all"
            >
              {it.text}
            </button>
          ))}
        </div>
      </div>

      {/* Ordered list */}
      {order.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Your order (tap to remove)
          </p>
          <div className="flex flex-col gap-2">
            {order.map((id, i) => (
              <button
                key={id}
                disabled={submitting}
                onClick={() => remove(id)}
                className="min-h-[44px] px-4 py-3 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-left text-base font-medium text-amber-900 flex items-center gap-3 transition-all"
                title="Tap to remove"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1">{byId[id]?.text ?? id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={reset}
          disabled={submitting || order.length === 0}
          className="text-sm text-gray-500 hover:text-[#BE1832] disabled:text-gray-300 underline underline-offset-4"
        >
          Reset
        </button>
        <button
          onClick={submit}
          disabled={submitting || !allPlaced}
          className="flex-1 py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-base"
        >
          {allPlaced ? "Check answer" : `Place ${remaining.length} more`}
        </button>
      </div>
    </div>
  );
}
