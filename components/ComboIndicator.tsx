"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live correct-answer combo pill.
 *
 * Mounted once. Listens for `ruby-combo` CustomEvents (dispatched from
 * lib/fetch.ts after each graded answer) and shows "🔥 N in a row" once the
 * streak reaches 2, nudging toward the next milestone (5 / 8 / 10 — the same
 * thresholds that fire the combo celebration card). A wrong answer reports a
 * combo of 0, which hides the pill.
 *
 * Driven by the server's global combo (the same number the milestone card uses)
 * so the two never disagree. Signed-out learners don't earn combos, so the pill
 * simply never appears for them. Non-blocking (pointer-events-none).
 */

const MILESTONES = [5, 8, 10];

function nextMilestone(combo: number): number | null {
  for (const m of MILESTONES) if (combo < m) return m;
  return null;
}

export default function ComboIndicator() {
  const [combo, setCombo] = useState(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { combo?: number } | undefined;
      setCombo(Math.max(0, detail?.combo ?? 0));
    };
    document.addEventListener("ruby-combo", handler);
    return () => document.removeEventListener("ruby-combo", handler);
  }, []);

  if (combo < 2) return null;

  const next = nextMilestone(combo);
  const toGo = next ? next - combo : 0;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-20 md:top-4 z-[110] pointer-events-none">
      {/* key={combo} re-mounts the pill on each increment so it re-pulses. */}
      <div
        key={combo}
        className={`flex items-center gap-2 bg-white/95 backdrop-blur border border-orange-200 shadow-lg rounded-full px-4 py-1.5 ${
          reduce.current ? "" : "ruby-celebrate-pop"
        }`}
      >
        <span className="text-lg leading-none">🔥</span>
        <span className="text-sm font-bold text-orange-600">{combo} in a row</span>
        {next && toGo <= 2 && (
          <span className="text-xs font-semibold text-orange-400">
            · {toGo} to a bonus
          </span>
        )}
      </div>
    </div>
  );
}
